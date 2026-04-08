import mongoose from 'mongoose';

// Updated bid schema to track if the system placed the bid
const bidSchema = new mongoose.Schema({
    bidder: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    bidAmount: { type: Number, required: true },
    isAutoBid: { type: Boolean, default: false }, // NEW: Tracks if this was a proxy bid
    bidTime: { type: Date, default: Date.now }
});

// NEW: Schema to track a user's maximum auto-bid limit
const proxyBidSchema = new mongoose.Schema({
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    maxLimit: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
        trim: true,
    },
    itemDescription: {
        type: String,
        required: true,
    },
    itemCategory: {
        type: String,
        required: true,
    },
    // NEW: Condition of the item
    itemCondition: {
        type: String,
        enum: ["Brand New", "Like New", "Used", "Refurbished", "Parts/Repair"],
        default: "Used",
    },
    itemPhoto: {
        type: String,
    },
    startingPrice: {
        type: Number,
        required: true,
    },
    currentPrice: {
        type: Number,
        default: 0,
    },
    // NEW: Optional reserve price
    reservePrice: {
        type: Number,
        default: null,
    },
    // NEW: Optional instant purchase price
    buyItNowPrice: {
        type: Number,
        default: null,
    },
    itemStartDate: {
        type: Date,
        default: Date.now,
    },
    itemEndDate: {
        type: Date,
        required: true,
    },
    seller: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    bids: [bidSchema],
    proxyBids: [proxyBidSchema], // NEW: Stores all active auto-bids for this item
    winner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null
    },
    isSold: {
        type: Boolean,
        default: false,
    },
    // NEW: track if physical payment has been made
    isPaid: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

// NEW: Pre-save middleware to automatically set currentPrice to startingPrice if it's a new document
productSchema.pre('save', function(next) {
    if (this.isNew && this.currentPrice === 0) {
        this.currentPrice = this.startingPrice;
    }
    next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;