import express from 'express';
import { secureRoute } from '../middleware/auth.js';
import { getConversations, getMessages, deleteConversation, searchUsers } from '../controllers/chatController.js';

const router = express.Router();

router.get('/users/search', secureRoute, searchUsers);

router.get('/', secureRoute, getConversations);
router.get('/:id', secureRoute, getMessages); // id is the OTHER user's id
router.delete('/:id', secureRoute, deleteConversation); // id is the conversationId

export default router;
