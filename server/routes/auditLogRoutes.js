import express from 'express';
import {
  getAuditLogs,
  getAuditStats,
  createAuditLog,
  exportAuditLogs,
  clearAuditLogs,
} from '../controllers/auditLogController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All audit routes require authentication
router.use(protect);

router
  .route('/')
  .get(authorize('Super Admin', 'School Admin', 'Principal'), getAuditLogs)
  .post(authorize('Super Admin', 'School Admin', 'Principal'), createAuditLog);

router
  .route('/stats')
  .get(authorize('Super Admin', 'School Admin', 'Principal'), getAuditStats);

router
  .route('/export')
  .get(authorize('Super Admin', 'School Admin', 'Principal'), exportAuditLogs);

router
  .route('/clear')
  .delete(authorize('Super Admin'), clearAuditLogs);

export default router;
