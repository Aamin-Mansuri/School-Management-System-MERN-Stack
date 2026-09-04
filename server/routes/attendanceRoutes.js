import express from 'express';
import { getAttendance, markBatchAttendance, getAttendanceAnalytics } from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getAttendance);
router.get('/analytics', getAttendanceAnalytics);
router.post('/batch', authorize('Super Admin', 'School Admin', 'Principal', 'Teacher'), markBatchAttendance);

export default router;
