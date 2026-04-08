import axios from "axios";
const VITE_API = import.meta.env.VITE_API;

export const changePassword = async (formData) => {
    try {
        const res = await axios.patch(`${VITE_API}/user`,
            formData,
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't update password")
        throw error;
    }
}

export const loginHistory = async () => {
    try {
        const res = await axios.get(`${VITE_API}/user/logins`,
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't show login history")
        throw error;
    }
}

export const updateProfileDetails = async (formData) => {
    try {
        const res = await axios.patch(`${VITE_API}/user/profile`,
            formData,
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't update profile details")
        throw error;
    }
}

// ==========================================
// NEW: Watchlist APIs
// ==========================================
export const updateAvatar = async (formData) => {
    try {
        const res = await axios.post(`${VITE_API}/user/avatar`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            withCredentials: true
        });
        return res.data;
    } catch (error) {
        console.log("Error updating avatar", error.message);
        throw error;
    }
};
// Toggles an item in/out of the user's watchlist
export const toggleWatchlist = async (auctionId) => {
    try {
        const res = await axios.put(`${VITE_API}/user/watchlist/${auctionId}`, 
            {}, 
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't update watchlist");
        throw error;
    }
}

// Fetches the user's populated watchlist for the profile dashboard
export const getWatchlist = async () => {
    try {
        const res = await axios.get(`${VITE_API}/user/watchlist`, 
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't fetch watchlist");
        throw error;
    }
}