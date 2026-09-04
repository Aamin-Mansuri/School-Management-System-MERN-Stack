import express from 'express';
import { getDashboardMetrics, syncAtlasDatabase, getDetailedAtlasStatus } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getDashboardMetrics);
router.get('/mongodb-status', getDetailedAtlasStatus);
router.post('/sync-mongodb', authorize('Super Admin', 'School Admin', 'Principal'), syncAtlasDatabase);

export default router;
