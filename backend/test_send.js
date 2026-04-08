import { io } from "socket.io-client";
import mongoose from "mongoose";

const socket = io("http://localhost:3000", {
    query: {
        userId: "60b9b0b9e6b3f3b3b3b3b3b3" // dummy user id
    }
});

socket.on("connect", () => {
    console.log("Connected to server, sending message...");
    const dummySender = new mongoose.Types.ObjectId().toString();
    const dummyReceiver = new mongoose.Types.ObjectId().toString();

    socket.emit("sendMessage", {
        senderId: dummySender,
        receiverId: dummyReceiver,
        text: "Hello this is a test from script",
    });

    setTimeout(() => {
        socket.disconnect();
        process.exit(0);
    }, 2000);
});

socket.on("messageSent", (msg) => {
    console.log("Success! Server returned:", msg);
});
