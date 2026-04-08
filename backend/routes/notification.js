import express from 'express';
import { secureRoute } from '../middleware/auth.js';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', secureRoute, getNotifications);
router.patch('/read-all', secureRoute, markAllAsRead);
router.patch('/:id/read', secureRoute, markAsRead);

export default router;
