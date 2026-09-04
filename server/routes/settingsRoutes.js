import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);
router.get('/', getSettings);
router.put('/', authorize('Super Admin', 'School Admin'), updateSettings);

export default router;
