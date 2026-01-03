import express from 'express';
import {
  createRequest,
  getMyRequests,
  getDonationRequests,
  updateRequestStatus,
  getRequest
} from '../controllers/request.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.post('/', authorize('recipient', 'admin'), createRequest);
router.get('/my', getMyRequests);
router.get('/donations', authorize('donor', 'admin'), getDonationRequests);
router.get('/:id', getRequest);
router.put('/:id/status', updateRequestStatus);

export default router;

