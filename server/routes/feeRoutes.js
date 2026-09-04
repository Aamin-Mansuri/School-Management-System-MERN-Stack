import express from 'express';
import {
  getFees,
  getFeeById,
  createFee,
  recordPayment,
  sendAutomatedFeeReminders,
  sendSingleFeeReminder,
  getOutstandingDefaulters,
  getFeeReminderLogs,
  previewFeeReminderEmail,
  getFeeReminderSettings,
  updateFeeReminderSettings,
} from '../controllers/feeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

// Fee Reminder Management Endpoints
router.get('/reminders/defaulters', authorize('Super Admin', 'School Admin', 'Accountant'), getOutstandingDefaulters);
router.get('/reminders/logs', authorize('Super Admin', 'School Admin', 'Accountant'), getFeeReminderLogs);
router.post('/reminders/preview', previewFeeReminderEmail);
router.get('/reminders/settings', getFeeReminderSettings);
router.put('/reminders/settings', authorize('Super Admin', 'School Admin', 'Accountant'), updateFeeReminderSettings);
router.post('/reminders/send-automated', authorize('Super Admin', 'School Admin', 'Accountant'), sendAutomatedFeeReminders);
router.post('/reminders/send-single/:id', authorize('Super Admin', 'School Admin', 'Accountant'), sendSingleFeeReminder);

router.route('/')
  .get(getFees)
  .post(authorize('Super Admin', 'School Admin', 'Accountant'), createFee);

router.get('/:id', getFeeById);
router.post('/:id/payments', recordPayment);

export default router;

