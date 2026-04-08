import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    bio: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: ""
    },
    socialLinks: {
        type: [String],
        default: []
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    location: {
        country: { type: String },
        region: { type: String },
        city: { type: String },
        isp: { type: String }
    },
    signupAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    // NEW: Watchlist array to store saved auction items
    watchlist: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product' 
    }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;