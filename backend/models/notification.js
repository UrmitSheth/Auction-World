import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['message', 'outbid', 'auction_end', 'system'],
        default: 'system'
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId, // Could be message ID or auction ID
        default: null
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
