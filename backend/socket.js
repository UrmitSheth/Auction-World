import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "./models/user.js";
import Message from "./models/message.js";
import Conversation from "./models/conversation.js";
import Notification from "./models/notification.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174", "http://192.168.29.63:5173", "https://tender-peripherals-update-written.trycloudflare.com", process.env.ORIGIN].filter(Boolean),
        methods: ["GET", "POST"]
    }
});

const userSocketMap = {}; // {userId: socketId}

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

io.on("connection", async (socket) => {
    console.log("a user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id;
        
        // Update user status
        await User.findByIdAndUpdate(userId, { isOnline: true });
        
        // Emit to all users that this user is online
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        io.emit("userStatusChange", { userId, isOnline: true });
    }

    // Handle sending message via Socket (Optionally, could be handled in controller as well. We'll handle via Socket for real-time speed, but save to DB)
    socket.on("sendMessage", async (data) => {
        try {
            const { senderId, receiverId, text } = data;
            
            let conversation = await Conversation.findOne({
                participants: { $all: [senderId, receiverId] }
            });

            if (!conversation) {
                conversation = await Conversation.create({
                    participants: [senderId, receiverId]
                });
            }

            // Also check if conversation was deleted by either user, if so, restore it by clearing deletedBy
            if (conversation.deletedBy && conversation.deletedBy.length > 0) {
                conversation.deletedBy = [];
            }

            const newMessage = new Message({
                senderId,
                conversationId: conversation._id,
                text,
                status: 'sent'
            });

            await newMessage.save();

            conversation.lastMessage = newMessage._id;
            await conversation.save();

            const receiverSocketId = getReceiverSocketId(receiverId);
            
            // If receiver is online, emit the message to them and mark as delivered
            if (receiverSocketId) {
                newMessage.status = 'delivered';
                await newMessage.save(); // save delivered status
                io.to(receiverSocketId).emit("newMessage", newMessage);
            }

            // Fetch sender info 
            const sender = await User.findById(senderId).select("name");
            const senderName = sender ? sender.name : "Someone";
            
            // Also create a Notification for the receiver
            const notification = new Notification({
                userId: receiverId,
                type: 'message',
                message: `New message from ${senderName}`,
                relatedId: senderId
            });
            await notification.save();
            if (receiverSocketId) {
                // emit notification event so client bell can update
                io.to(receiverSocketId).emit("newNotification", notification);
            }

            // Emit to sender to confirm sent/delivered
            socket.emit("messageSent", {
                ...newMessage.toObject(),
                receiverId
            });

        } catch (error) {
            console.error("Error sending message via socket: ", error);
        }
    });

    // Mark messages as seen when chat is open
    socket.on("markMessagesAsSeen", async ({ conversationId, userId }) => {
        try {
            if (!conversationId || String(conversationId).startsWith("temp_")) return;

            // Find messages in this conversation where receiver is `userId` and status is not 'seen'
            await Message.updateMany(
                { conversationId, senderId: { $ne: userId }, status: { $ne: 'seen' } },
                { $set: { status: 'seen' } }
            );

            // Notify the other participants in the conversation that messages were seen
            const conversation = await Conversation.findById(conversationId);
            if(conversation) {
                const otherParticipantId = conversation.participants.find(p => p.toString() !== userId);
                const otherSocketId = getReceiverSocketId(otherParticipantId.toString());
                if (otherSocketId) {
                    io.to(otherSocketId).emit("messagesSeen", { conversationId });
                }
            }
        } catch (error) {
            console.error("Error marking messages as seen: ", error);
        }
    });

    socket.on("disconnect", async () => {
        console.log("user disconnected", socket.id);
        if (userId && userId !== "undefined") {
            delete userSocketMap[userId];
            // Update last seen and online status
            await User.findByIdAndUpdate(userId, { 
                isOnline: false, 
                lastSeen: new Date() 
            });
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
            io.emit("userStatusChange", { userId, isOnline: false, lastSeen: new Date() });
        }
    });
});

export { app, io, server };
