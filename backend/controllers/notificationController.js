import Notification from '../models/notification.js';

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20);
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        res.status(200).json(notification);
    } catch (error) {
        console.error("Error marking notification read:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error marking all read:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
