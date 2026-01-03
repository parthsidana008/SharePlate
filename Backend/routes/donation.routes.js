import express from 'express';
import {
  getDonations,
  getDonation,
  createDonation,
  updateDonation,
  deleteDonation,
  getMyDonations
} from '../controllers/donation.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes - specific routes before parameterized routes
router.get('/my/list', getMyDonations);
router.get('/', getDonations);
router.get('/:id', getDonation);
router.post('/', authorize('donor', 'admin'), createDonation);
router.put('/:id', updateDonation);
router.delete('/:id', deleteDonation);

export default router;

