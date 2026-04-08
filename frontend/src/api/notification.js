import axios from "axios";
const VITE_API = import.meta.env.VITE_API;

export const getNotifications = async () => {
    try {
        const res = await axios.get(`${VITE_API}/notification`, { withCredentials: true });
        return res.data;
    } catch (error) {
        console.log("Error fetching notifications", error.message);
        throw error;
    }
};

export const markNotificationRead = async (id) => {
    try {
        const res = await axios.patch(`${VITE_API}/notification/${id}/read`, {}, { withCredentials: true });
        return res.data;
    } catch (error) {
        console.log("Error marking notification as read", error.message);
        throw error;
    }
};

export const markAllNotificationsRead = async () => {
    try {
        const res = await axios.patch(`${VITE_API}/notification/read-all`, {}, { withCredentials: true });
        return res.data;
    } catch (error) {
        console.log("Error marking all notifications as read", error.message);
        throw error;
    }
};
