import axios from "axios";
const VITE_AUCTION_API = import.meta.env.VITE_AUCTION_API;

// getting list of all auction
export const getAuctions = async () => {
    try {
        const res = await axios.get(`${VITE_AUCTION_API}`,
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log("Error on getting auction data", error.message);
        throw error;
    }
}

// getting list of all my auctions
export const getMyAuctions = async () => {
    try {
        const res = await axios.get(`${VITE_AUCTION_API}/myauction`,
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log("Error on getting my auction data", error.message);
        throw error;
    }
}

// getting single auction using _id
export const viewAuction = async (id) => {
    try {
        const res = await axios.get(`${VITE_AUCTION_API}/${id}`,
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log("Error on getting auction data", error.message);
        throw error;
    }
}

// placing bid for auction (Updated for Proxy Auto-Bidding)
export const placeBid = async ({ bidAmount, isAutoBid, id }) => {
    try {
        const res = await axios.post(`${VITE_AUCTION_API}/${id}`,
            { bidAmount, isAutoBid }, // Added isAutoBid flag here
            { withCredentials: true }
        )
        return res.data;
    } catch (error) {
        console.log("Error placing bid", error.message);
        throw error;
    }
}

// NEW: Instant Purchase (Buy It Now)
export const buyAuctionNow = async (id) => {
    try {
        const res = await axios.post(`${VITE_AUCTION_API}/${id}/buy`, 
            {}, 
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log("Error processing instant purchase", error.message);
        throw error;
    }
}

// NEW: Mark Auction as Paid
export const markAuctionPaid = async (id) => {
    try {
        const res = await axios.post(`${VITE_AUCTION_API}/${id}/pay`, 
            {}, 
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log("Error marking auction as paid", error.message);
        throw error;
    }
}

// creating new auction (Updated with new pricing & condition fields)
export const createAuction = async (data) => {
    try {
        const formData = new FormData();
        formData.append("itemName", data.itemName);
        formData.append("startingPrice", data.startingPrice);
        formData.append("itemDescription", data.itemDescription);
        formData.append("itemCategory", data.itemCategory);
        formData.append("itemStartDate", data.itemStartDate);
        formData.append("itemEndDate", data.itemEndDate);
        formData.append("itemPhoto", data.itemPhoto);
        
        // Append new advanced fields
        if (data.itemCondition) formData.append("itemCondition", data.itemCondition);
        if (data.reservePrice) formData.append("reservePrice", data.reservePrice);
        if (data.buyItNowPrice) formData.append("buyItNowPrice", data.buyItNowPrice);

        const res = await axios.post(`${VITE_AUCTION_API}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            }
        );
        return res.data;
    } catch (error) {
        console.log("Error creating auction", error.message);
        throw error;
    }
}

// getting dashboard stats
export const dashboardStats = async () => {
    try {
        const res = await axios.get(`${VITE_AUCTION_API}/stats`,
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log("Error on getting dashboard data", error.message);
        throw error;
    }
}

// NEW: Fetch User's Bids
export const getUserBids = async () => {
    try {
        const res = await axios.get(`${VITE_AUCTION_API}/my-bids`,
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log("Error on getting user bids", error.message);
        throw error;
    }
}

// NEW: Fetch Global Auction History
export const getGlobalHistory = async () => {
    try {
        const res = await axios.get(`${VITE_AUCTION_API}/global-history`,
            { withCredentials: false } 
        );
        return res.data;
    } catch (error) {
        console.log("Error on getting global history", error.message);
        throw error;
    }
}