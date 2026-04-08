import Conversation from '../models/conversation.js';
import Message from '../models/message.js';
import User from '../models/user.js';

// Get all conversations for a user
export const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await Conversation.find({
            participants: userId,
            deletedBy: { $ne: userId } // Don't return if user deleted it
        })
        .populate('participants', 'name avatar isOnline lastSeen')
        .populate('lastMessage')
        .sort({ updatedAt: -1 });

        // Calculate unread counts for each conversation
        const conversationsWithUnread = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await Message.countDocuments({
                    conversationId: conv._id,
                    senderId: { $ne: userId },
                    seen: false
                });
                return { ...conv.toObject(), unreadCount };
            })
        );

        res.status(200).json(conversationsWithUnread);
    } catch (error) {
        console.error("Error in getConversations controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get messages for a specific conversation
export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user.id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        });

        if (!conversation) {
            return res.status(200).json([]);
        }

        const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Search users to start a chat
export const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        const currentUserId = req.user.id;

        if (!q) return res.status(200).json([]);

        const users = await User.find({
            _id: { $ne: currentUserId },
            $or: [
                { name: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } }
            ]
        }).select("name email avatar isOnline lastSeen").limit(10);

        res.status(200).json(users);
    } catch (error) {
        console.error("Error in searchUsers controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Delete/Hide conversation
export const deleteConversation = async (req, res) => {
    try {
        const { id: conversationId } = req.params;
        const userId = req.user.id;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        // Add user to deletedBy array if not already there
        if (!conversation.deletedBy.includes(userId)) {
            conversation.deletedBy.push(userId);
            await conversation.save();
        }

        res.status(200).json({ message: "Conversation deleted successfully" });
    } catch (error) {
        console.error("Error in deleteConversation controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
