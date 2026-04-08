import Login from "../models/Login.js";
import User from "../models/user.js";
import Product from "../models/product.js"; // Added to populate the watchlist
import Notification from "../models/notification.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { connectDB } from '../connection.js';
import uploadImage from '../services/cloudinaryService.js';

export const handleGetUser = async (req, res) => {
    try {
        await connectDB();
        // Updated to also return the user's watchlist IDs so the frontend knows which hearts to fill red
        const user = await User.findById(req.user.id).select("name email avatar role watchlist signupAt location bio phone");

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
}

export const getPublicProfile = async (req, res) => {
    try {
        await connectDB();
        const { id } = req.params;

        const user = await User.findById(id).select("name email avatar role isOnline lastSeen signupAt location");
        if (!user) return res.status(404).json({ message: "User not found" });

        // Retrieve active auctions mapped to this user
        const activeAuctions = await Product.find({ 
            seller: id,
            itemEndDate: { $gt: new Date() } // Only active ones
        }).select("itemName itemDescription startingPrice currentPrice itemEndDate itemCategory itemPhoto bids");

        res.status(200).json({ user, activeAuctions });

    } catch (error) {
        console.error("Error fetching public profile:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const handleChangePassword = async (req, res) => {
    try {
        await connectDB();
        const { currentPassword, newPassword, confirmPassword } = req.body;
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ error: "Please enter all fields" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: "New password and confirm password do not match." });
        }
        if (currentPassword === newPassword) {
            return res.status(400).json({ error: "You can't reuse the old password." });
        }

        const userID = req.user.id;

        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Current password is incorrect." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        await user.save();

        return res.status(200).json({ message: "Password changed successfully." });
    } catch (err) {
        console.error("Error changing password:", err);
        return res.status(500).json({ error: "Something went wrong. Please try again later." });
    }
};

export const getLoginHistory = async (req, res) => {
    try {
        await connectDB();
        const userId = req.user.id;

        const logins = await Login.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(userId) }
            },
            {
                $sort: { loginAt: -1 }
            },
            {
                $limit: 10
            }
        ]);

        const formatted = logins.map(login => {
            const date = new Date(login.loginAt);
            const formattedDate = date.toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            });

            const location = [
                login.location?.city,
                login.location?.region,
                login.location?.country
            ].filter(Boolean).join(", ");

            return {
                id: login._id,
                dateTime: formattedDate,
                ipAddress: login.ipAddress || "Unknown",
                location: location || "Unknown",
                isp: login.location?.isp || "Unknown",
                device: getDeviceType(login.userAgent),
            };
        });

        res.status(200).json(formatted);

    } catch (error) {
        console.error("Error fetching login history:", error);
        res.status(500).json({
            success: false,
            message: "Could not fetch login logs"
        });
    }
};

export const updateProfilePhoto = async (req, res) => {
    try {
        await connectDB();
        if (!req.file) return res.status(400).json({ message: "No image file provided." });

        // Upload to Cloudinary
        const imageUrl = await uploadImage(req.file);
        
        // Update user in database
        const user = await User.findByIdAndUpdate(
            req.user.id, 
            { avatar: imageUrl }, 
            { new: true }
        ).select("-password");

        res.status(200).json({ message: "Profile photo updated successfully", avatar: user.avatar });
    } catch (error) {
        console.error("Avatar Upload Error:", error);
        res.status(500).json({ message: "Server error updating profile photo." });
    }
};

export const updateProfileDetails = async (req, res) => {
    try {
        await connectDB();
        const userId = req.user.id;
        const { bio, phone, socialLinks, country } = req.body;

        const updateData = {};
        if (bio !== undefined) updateData.bio = bio;
        if (phone !== undefined) updateData.phone = phone;
        if (socialLinks) updateData.socialLinks = socialLinks;
        if (country) updateData["location.country"] = country;

        const user = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).select("-password");
        
        if (!user) {
             return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ message: "Server error updating profile." });
    }
};
// ==========================================
//  Watchlist Controllers
// ==========================================

export const toggleWatchlist = async (req, res) => {
    try {
        await connectDB();
        const { id } = req.params; 
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.watchlist) user.watchlist = [];

        // CRITICAL FIX: Convert ObjectId to string for accurate comparison
        const isWatchlisted = user.watchlist.some(auctionId => auctionId.toString() === id.toString());

        if (isWatchlisted) {
            user.watchlist = user.watchlist.filter(auctionId => auctionId.toString() !== id.toString());
        } else {
            user.watchlist.push(id);
            // Optionally notify the user or seller. For now notify the user.
            const newNotification = new Notification({
                userId: userId,
                message: "You saved an auction to your watchlist.",
                type: "system",
                relatedId: id
            });
            await newNotification.save();
        }

        await user.save();
        res.status(200).json({ 
            message: isWatchlisted ? "Removed from watchlist" : "Added to watchlist",
            watchlist: user.watchlist 
        });

    } catch (error) {
        console.error("Watchlist Toggle Error:", error);
        res.status(500).json({ message: "Server error updating watchlist." });
    }
};

export const getWatchlist = async (req, res) => {
    try {
        await connectDB();
        const userId = req.user.id;

        // Find user and populate the watchlist array with the actual product documents
        const user = await User.findById(userId).populate({
            path: 'watchlist',
            populate: { path: 'seller', select: 'name' } // We need the seller's name for the AuctionCard
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        // Format the populated products to match your standard AuctionCard requirements
        const formattedWatchlist = user.watchlist.map(auction => ({
            _id: auction._id,
            itemName: auction.itemName,
            itemDescription: auction.itemDescription,
            startingPrice: auction.startingPrice,
            currentPrice: auction.currentPrice,
            bidsCount: auction.bids?.length || 0,
            timeLeft: Math.max(0, new Date(auction.itemEndDate) - new Date()),
            itemEndDate: auction.itemEndDate,
            itemCategory: auction.itemCategory,
            sellerName: auction.seller?.name || "Unknown Seller",
            itemPhoto: auction.itemPhoto,
        }));

        res.status(200).json(formattedWatchlist);

    } catch (error) {
        console.error("Get Watchlist Error:", error);
        res.status(500).json({ message: "Server error fetching watchlist." });
    }
};

// ==========================================
// Utility Functions
// ==========================================

function getDeviceType(userAgent = "") {
    userAgent = userAgent.toLowerCase();
    if (/mobile|iphone|ipod|android.*mobile|windows phone/.test(userAgent)) return "Mobile";
    if (/tablet|ipad|android(?!.*mobile)/.test(userAgent)) return "Tablet";
    return "Desktop";
}