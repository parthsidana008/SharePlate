import express from 'express';
import { saveMessage, getMessages } from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// POST /api/messages - Save a new message
router.post('/', saveMessage);

// GET /api/messages/:requestId - Get all messages for a request
router.get('/:requestId', getMessages);

export default router;
