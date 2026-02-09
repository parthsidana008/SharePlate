import express from 'express';
import {
  getFoodSafetyTips,
  analyzeFoodImage,
  chatWithAssistant,
  checkAIStatus
} from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.get('/status', checkAIStatus);
router.post('/safety-tips', getFoodSafetyTips);
router.post('/analyze-image', analyzeFoodImage);
router.post('/chat', chatWithAssistant);

export default router;

