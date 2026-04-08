import express from 'express';
import { 
    createAuction, 
    showAuction, 
    auctionById, 
    placeBid, 
    dashboardData, 
    buyAuctionNow,
    myAuction,
    getUserBids,
    getGlobalHistory,
    markAuctionPaid 
} from '../controllers/auction.controller.js';
import upload from '../middleware/multer.js';
import { secureRoute } from '../middleware/auth.js';

const auctionRouter = express.Router();

// ==========================================
// 1. SPECIFIC PROTECTED ROUTES (Requires Login)
// Must come before /:id routes
// ==========================================
auctionRouter.get('/stats', secureRoute, dashboardData);
auctionRouter.get('/myauction', secureRoute, myAuction);
auctionRouter.get('/my-bids', secureRoute, getUserBids); // NEW
auctionRouter.post('/', secureRoute, upload.single('itemPhoto'), createAuction);
auctionRouter.post('/:id/buy', secureRoute, buyAuctionNow);
auctionRouter.post('/:id/pay', secureRoute, markAuctionPaid);


// ==========================================
// 2. PUBLIC ROUTES (Guests can view)
// ==========================================
auctionRouter.get('/global-history', getGlobalHistory); // NEW
auctionRouter.get('/', showAuction);


// ==========================================
// 3. DYNAMIC ROUTES (Must be at the bottom)
// ==========================================
auctionRouter.get('/:id', auctionById); // Public: Anyone can view a specific auction
auctionRouter.post('/:id', secureRoute, placeBid); // Protected: Only logged-in users can bid

export default auctionRouter;