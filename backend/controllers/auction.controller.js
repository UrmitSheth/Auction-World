import uploadImage from '../services/cloudinaryService.js';
import Product from '../models/product.js';
import Notification from '../models/notification.js';
import mongoose from "mongoose";
import { connectDB } from '../connection.js';
import { io } from '../socket.js';


export const createAuction = async (req, res) => {
    try {
        await connectDB();
        const { 
            itemName, startingPrice, itemDescription, itemCategory, 
            itemStartDate, itemEndDate, itemCondition, reservePrice, buyItNowPrice 
        } = req.body;
        
        let imageUrl = '';

        if (req.file) {
            try {
                imageUrl = await uploadImage(req.file);
            } catch (error) {
                return res.status(500).json({ message: 'Error uploading image to Cloudinary', error: error.message });
            }
        }

        const start = itemStartDate ? new Date(itemStartDate) : new Date();
        const end = new Date(itemEndDate);
        if (end <= start) {
            return res.status(400).json({ message: 'Auction end date must be after start date' });
        }

        const newAuction = new Product({
            itemName,
            startingPrice: Number(startingPrice),
            currentPrice: Number(startingPrice),
            itemDescription,
            itemCategory,
            itemCondition: itemCondition || "Used",
            reservePrice: reservePrice ? Number(reservePrice) : null,
            buyItNowPrice: buyItNowPrice ? Number(buyItNowPrice) : null,
            itemPhoto: imageUrl,
            itemStartDate: start,
            itemEndDate: end,
            seller: req.user.id,
        });
        await newAuction.save();

        res.status(201).json({ message: 'Auction created successfully', newAuction });
    } catch (error) {
        res.status(500).json({ message: 'Error creating auction', error: error.message });
    }
};

export const showAuction = async (req, res) => {
    try {
        await connectDB();
        const auction = await Product.find({ itemEndDate: { $gt: new Date() } })
            .populate("seller", "name")
            .select("itemName itemDescription startingPrice currentPrice bids itemEndDate itemCategory itemPhoto seller itemCondition")
            .sort({ createdAt: -1 });
            
        const formatted = auction.map(auction => ({
            _id: auction._id,
            itemName: auction.itemName,
            itemDescription: auction.itemDescription,
            startingPrice: auction.startingPrice,
            currentPrice: auction.currentPrice,
            bidsCount: auction.bids.length,
            timeLeft: Math.max(0, new Date(auction.itemEndDate) - new Date()),
            itemEndDate: auction.itemEndDate,
            itemCategory: auction.itemCategory,
            itemCondition: auction.itemCondition,
            sellerName: auction.seller.name,
            itemPhoto: auction.itemPhoto,
        }));

        res.status(200).json(formatted);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching auctions', error: error.message });
    }
}

export const auctionById = async (req, res) => {
    try {
        await connectDB();
        const { id } = req.params;
        const auction = await Product.findById(id)
            .populate("seller", "name")
            .populate("bids.bidder", "name");
            
        auction.bids.sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));
        res.status(200).json(auction);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching auctions', error: error.message });
    }
}

export const placeBid = async (req, res) => {
    try {
        await connectDB(); //
        const { bidAmount, isAutoBid } = req.body; //
        const user = req.user.id; //
        const { id } = req.params; //

        const product = await Product.findById(id).populate('bids.bidder', "name"); //
        if (!product) return res.status(404).json({ message: "Auction not found" }); //

        if (new Date(product.itemEndDate) < new Date() || product.isSold) {
            return res.status(400).json({ message: "Auction has already ended" });
        }
        
        // Block seller from bidding
        if (product.seller.toString() === user) {
            return res.status(400).json({ message: "You cannot bid on your own item." });
        }

        const numericBid = Number(bidAmount); //

        // --- SCENARIO A: Auto-Bid ---
        if (isAutoBid) {
            // 1. Save or update proxy limit
            const existingProxyIndex = product.proxyBids.findIndex(pb => pb.bidder.toString() === user);
            if (existingProxyIndex !== -1) {
                product.proxyBids[existingProxyIndex].maxLimit = numericBid;
            } else {
                product.proxyBids.push({ bidder: user, maxLimit: numericBid });
            }

            // 2. Immediately place a minimum bid to give them the lead (if they don't already have it)
            const currentLeader = product.bids.length > 0 ? product.bids[product.bids.length - 1].bidder.toString() : null;
            
            if (currentLeader !== user) {
                const minRequired = product.bids.length === 0 ? product.startingPrice : product.currentPrice + 1;
                
                if (numericBid >= minRequired) {
                    product.bids.push({ bidder: user, bidAmount: minRequired, isAutoBid: true });
                    product.currentPrice = minRequired;
                } else {
                    return res.status(400).json({ message: `Your limit must be at least $${minRequired} to take the lead.` });
                }
            }
        } 
        // --- SCENARIO B: Manual Bid ---
        else {
            const minBid = Math.max(product.currentPrice, product.startingPrice) + 1;
            if (numericBid < minBid) return res.status(400).json({ message: `Bid must be at least $${minBid}` });
            
            product.bids.push({ bidder: user, bidAmount: numericBid, isAutoBid: false });
            product.currentPrice = numericBid;
        }

        // --- PROXY WAR RESOLUTION ---
        // Check if other users have auto-bids that will fight back
        const newLeader = product.bids[product.bids.length - 1].bidder.toString();
        const opposingProxies = product.proxyBids.filter(pb => pb.bidder.toString() !== newLeader);
        
        if (opposingProxies.length > 0) {
            // Find the strongest opponent
            const strongestOpponent = opposingProxies.reduce((prev, curr) => (prev.maxLimit > curr.maxLimit) ? prev : curr);
            const amountNeededToBeat = product.currentPrice + 1;

            if (strongestOpponent.maxLimit >= amountNeededToBeat) {
                // See if the current leader has a proxy to defend themselves
                const leaderProxy = product.proxyBids.find(pb => pb.bidder.toString() === newLeader);

                if (leaderProxy && leaderProxy.maxLimit >= strongestOpponent.maxLimit) {
                    // Leader wins the proxy war
                    const winningBid = Math.min(strongestOpponent.maxLimit + 1, leaderProxy.maxLimit);
                    // Push opponent's losing bid for history tracking
                    product.bids.push({ bidder: strongestOpponent.bidder, bidAmount: strongestOpponent.maxLimit, isAutoBid: true });
                    // Push leader's winning bid
                    product.bids.push({ bidder: newLeader, bidAmount: winningBid, isAutoBid: true });
                    product.currentPrice = winningBid;
                } else {
                    // Opponent wins the proxy war
                    const winningBid = leaderProxy ? Math.min(leaderProxy.maxLimit + 1, strongestOpponent.maxLimit) : amountNeededToBeat;
                    product.bids.push({ bidder: strongestOpponent.bidder, bidAmount: winningBid, isAutoBid: true });
                    product.currentPrice = winningBid;
                }
            }
        }

        await product.save();

        // Emit socket event for real-time update
        io.emit("newBid", { auctionId: id, currentPrice: product.currentPrice, bids: product.bids });


        // Create notification for previous leader if they were outbid
        if (product.bids.length > 1) {
            const previousLeader = product.bids[product.bids.length - 2].bidder.toString();
            const currentLeaderObj = product.bids[product.bids.length - 1].bidder.toString();
            
            if (previousLeader !== currentLeaderObj) {
                await Notification.create({
                    userId: previousLeader,
                    type: 'outbid',
                    message: `You have been outbid on ${product.itemName}`,
                    relatedId: product._id
                });
            }
        }

        res.status(200).json({ message: "Bid processed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error placing bid", error: error.message }); //
    }
}

// ==========================================
// NEW: Buy It Now Controller
// ==========================================
export const buyAuctionNow = async (req, res) => {
    try {
        await connectDB();
        const { id } = req.params;
        const userId = req.user.id;

        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: "Auction not found" });

        if (new Date(product.itemEndDate) < new Date() || product.isSold) {
            return res.status(400).json({ message: "This item is no longer available." });
        }
        if (product.seller.toString() === userId) {
            return res.status(400).json({ message: "You cannot buy your own item." });
        }
        if (!product.buyItNowPrice) {
            return res.status(400).json({ message: "This item does not have a Buy It Now option." });
        }

        // Execute Instant Purchase
        product.bids.push({
            bidder: userId,
            bidAmount: product.buyItNowPrice,
            isAutoBid: false
        });
        
        product.currentPrice = product.buyItNowPrice;
        product.winner = userId;
        product.isSold = true;
        product.itemEndDate = new Date(); // Immediately end the auction

        await product.save();
        
        // Emit socket event for real-time update (Auction Ended/Sold)
        io.emit("newBid", { auctionId: id, currentPrice: product.currentPrice, bids: product.bids, isSold: true });

        res.status(200).json({ message: "Item purchased successfully via Buy It Now!", currentPrice: product.currentPrice });
    } catch (error) {
        res.status(500).json({ message: "Error processing Buy It Now", error: error.message });
    }
};

export const dashboardData = async (req, res) => {
    try {
        await connectDB();
        const userObjectId = new mongoose.Types.ObjectId(req.user.id);
        const dateNow = new Date();
        const stats = await Product.aggregate([
            {
                $facet: {
                    totalAuctions: [{ $count: "count" }],
                    userAuctionCount: [{ $match: { seller: userObjectId } }, { $count: "count" }],
                    activeAuctions: [
                        { $match: { itemStartDate: { $lte: dateNow }, itemEndDate: { $gte: dateNow }, isSold: false } }, // Also check it isn't sold
                        { $count: "count" }
                    ]
                }
            }
        ]);

        const totalAuctions = stats[0].totalAuctions[0]?.count || 0;
        const userAuctionCount = stats[0].userAuctionCount[0]?.count || 0;
        const activeAuctions = stats[0].activeAuctions[0]?.count || 0;

        const globalAuction = await Product.find({ itemEndDate: { $gt: dateNow }, isSold: false }).populate("seller", "name").sort({ createdAt: -1 }).limit(3);
        const latestAuctions = globalAuction.map(auction => ({
            _id: auction._id,
            itemName: auction.itemName,
            itemDescription: auction.itemDescription,
            startingPrice: auction.startingPrice,
            currentPrice: auction.currentPrice,
            bidsCount: auction.bids.length,
            timeLeft: Math.max(0, new Date(auction.itemEndDate) - new Date()),
            itemEndDate: auction.itemEndDate,
            itemCategory: auction.itemCategory,
            sellerName: auction.seller.name,
            itemPhoto: auction.itemPhoto,
        }));

        const userAuction = await Product.find({ seller: userObjectId }).populate("seller", "name").sort({ createdAt: -1 }).limit(3);
        const latestUserAuctions = userAuction.map(auction => ({
            _id: auction._id,
            itemName: auction.itemName,
            itemDescription: auction.itemDescription,
            startingPrice: auction.startingPrice,
            currentPrice: auction.currentPrice,
            bidsCount: auction.bids.length,
            timeLeft: Math.max(0, new Date(auction.itemEndDate) - new Date()),
            itemEndDate: auction.itemEndDate,
            itemCategory: auction.itemCategory,
            sellerName: auction.seller.name,
            itemPhoto: auction.itemPhoto,
        }));

        return res.status(200).json({ totalAuctions, userAuctionCount, activeAuctions, latestAuctions, latestUserAuctions })

    } catch (error) {
        res.status(500).json({ message: "Error getting dashboard data", error: error.message })
    }
}

export const myAuction = async (req, res) => {
    try {
        await connectDB();
        const auction = await Product.find({ seller: req.user.id })
            .populate("seller", "name")
            .select("itemName itemDescription startingPrice currentPrice bids itemEndDate itemCategory itemPhoto seller")
            .sort({ createdAt: -1 });
            
        const formatted = auction.map(auction => ({
            _id: auction._id,
            itemName: auction.itemName,
            itemDescription: auction.itemDescription,
            startingPrice: auction.startingPrice,
            currentPrice: auction.currentPrice,
            bidsCount: auction.bids.length,
            timeLeft: Math.max(0, new Date(auction.itemEndDate) - new Date()),
            itemEndDate: auction.itemEndDate,
            itemCategory: auction.itemCategory,
            sellerName: auction.seller.name,
            itemPhoto: auction.itemPhoto,
        }));

        res.status(200).json(formatted);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching auctions', error: error.message });
    }
}

// ==========================================
// NEW: Fetch all auctions a user has bid on
// ==========================================
export const getUserBids = async (req, res) => {
    try {
        await connectDB();
        const userId = req.user.id;
        
        // Find all products where this user is inside the bids array
        const auctions = await Product.find({ "bids.bidder": userId })
            .populate("seller", "name")
            .select("itemName currentPrice bids itemEndDate itemCategory itemPhoto isSold winner")
            .sort({ itemEndDate: -1 });

        // Split them into active and ended for the frontend
        const now = new Date();
        const active = [];
        const ended = [];

        auctions.forEach(auction => {
            const isEnded = new Date(auction.itemEndDate) < now || auction.isSold;
            // Determine user's highest bid on this item
            const userBids = auction.bids.filter(b => b.bidder.toString() === userId);
            const maxUserBid = userBids.length > 0 ? Math.max(...userBids.map(b => b.bidAmount)) : 0;
            
            const isWinning = auction.bids.length > 0 && auction.bids[auction.bids.length - 1].bidder.toString() === userId;
            const didWin = isEnded && auction.winner && auction.winner.toString() === userId;

            const formatted = {
                ...auction.toObject(),
                maxUserBid,
                isWinning,
                didWin
            };

            if (isEnded) ended.push(formatted);
            else active.push(formatted);
        });

        res.status(200).json({ active, ended });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user bids', error: error.message });
    }
}

// ==========================================
// NEW: Fetch global history of all ended auctions
// ==========================================
export const getGlobalHistory = async (req, res) => {
    try {
        await connectDB();
        const now = new Date();
        // Auctions that are technically expired or explicitly sold
        const auctions = await Product.find({ 
            $or: [
                { itemEndDate: { $lt: now } },
                { isSold: true }
            ]
        })
        .populate("seller", "name")
        .populate("winner", "name")
        .select("itemName currentPrice bids itemEndDate itemCategory itemPhoto isSold winner seller")
        .sort({ itemEndDate: -1 });

        const formatted = auctions.map(auction => ({
             _id: auction._id,
             itemName: auction.itemName,
             currentPrice: auction.currentPrice,
             bidsCount: auction.bids.length,
             itemEndDate: auction.itemEndDate,
             category: auction.itemCategory,
             itemPhoto: auction.itemPhoto,
             sellerName: auction.seller ? auction.seller.name : "Unknown",
             buyerName: auction.winner ? auction.winner.name : (auction.bids.length > 0 ? "Pending Payment" : "Unsold"),
             isSold: auction.isSold || auction.bids.length > 0
        }));

        res.status(200).json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching global history', error: error.message });
    }
}

// ==========================================
// NEW: Mark an auction as paid after successful checkout
// ==========================================
export const markAuctionPaid = async (req, res) => {
    try {
        await connectDB();
        const { id } = req.params;
        const userId = req.user.id;

        const auction = await Product.findById(id);
        if (!auction) return res.status(404).json({ message: "Auction not found" });
        if (auction.winner?.toString() !== userId) {
            return res.status(403).json({ message: "You are not the winner of this auction" });
        }
        if (auction.isPaid) {
            return res.status(400).json({ message: "This auction has already been paid for" });
        }

        auction.isPaid = true;
        await auction.save();
        
        res.status(200).json({ message: "Payment recorded successfully", isPaid: true });
    } catch (error) {
        res.status(500).json({ message: "Error marking auction as paid", error: error.message });
    }
}