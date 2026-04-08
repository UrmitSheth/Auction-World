import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import cookieParser from "cookie-parser";
import { connectDB } from './connection.js'
import auctionRouter from './routes/auction.js';
import { secureRoute } from './middleware/auth.js';
import userAuthRouter from './routes/userAuth.js';
import userRouter from './routes/user.js';
import contactRouter from "./routes/contact.js";
import adminRouter from './routes/admin.js';
import chatRouter from './routes/chat.js';
import notificationRouter from './routes/notification.js';
import { app, server } from './socket.js';

const port = process.env.PORT || 4000;

connectDB();
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://192.168.29.63:5173", "https://tender-peripherals-update-written.trycloudflare.com", process.env.ORIGIN].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
}));

app.use(cookieParser());


app.get('/', async (req, res) => {
    res.json({ msg: 'Welcome to Online Auction System API' });
});
app.use('/auth', userAuthRouter)
app.use('/user', secureRoute, userRouter)
app.use('/auction', auctionRouter);
app.use('/contact', contactRouter);
app.use('/admin', secureRoute, adminRouter)
app.use('/chat', chatRouter);
app.use('/notification', notificationRouter);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});