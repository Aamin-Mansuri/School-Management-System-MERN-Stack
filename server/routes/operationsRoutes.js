import express from 'express';
import {
  getLibraryBooks,
  getBookIssues,
  createLibraryBook,
  issueLibraryBook,
  returnLibraryBook,
  renewLibraryBook,
  getTransports,
  getTransportById,
  createTransport,
  updateTransport,
  deleteTransport,
  assignStudentToRoute,
  removeStudentFromRoute,
  getStudentTransport,
  getHostels,
  createHostel,
  getLeaves,
  createLeave,
  updateLeaveStatus,
  getNotices,
  createNotice,
  deleteNotice,
  getEvents,
  createEvent,
  deleteEvent,
  getNotifications,
  markNotificationRead,
  getMessages,
  sendMessage,
  deleteMessage,
} from '../controllers/operationsController.js';
import { protect, authorize, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Publicly viewable circulars and events
router.get('/notices', optionalAuth, getNotices);
router.get('/events', optionalAuth, getEvents);

// Protected routes
router.use(protect);

// Library
router.get('/library', getLibraryBooks);
router.get('/library/issues', getBookIssues);
router.post('/library', authorize('Super Admin', 'School Admin', 'Principal'), createLibraryBook);
router.post('/library/issue', authorize('Super Admin', 'School Admin', 'Principal', 'Teacher'), issueLibraryBook);
router.put('/library/return/:issueId', authorize('Super Admin', 'School Admin', 'Principal', 'Teacher'), returnLibraryBook);
router.put('/library/renew/:issueId', renewLibraryBook);

// Transport Management
router.get('/transport', getTransports);
router.get('/transport/student-route', getStudentTransport);
router.get('/transport/:id', getTransportById);
router.post('/transport', authorize('Super Admin', 'School Admin', 'Principal'), createTransport);
router.put('/transport/:id', authorize('Super Admin', 'School Admin', 'Principal'), updateTransport);
router.delete('/transport/:id', authorize('Super Admin', 'School Admin', 'Principal'), deleteTransport);
router.post('/transport/:id/assign-student', authorize('Super Admin', 'School Admin', 'Principal'), assignStudentToRoute);
router.delete('/transport/:id/remove-student/:studentId', authorize('Super Admin', 'School Admin', 'Principal'), removeStudentFromRoute);

// Hostel
router.get('/hostel', getHostels);
router.post('/hostel', authorize('Super Admin', 'School Admin'), createHostel);

// Leaves
router.get('/leaves', getLeaves);
router.post('/leaves', createLeave);
router.put('/leaves/:id/status', authorize('Super Admin', 'School Admin', 'Principal', 'Teacher'), updateLeaveStatus);

// Notices write operations
router.post('/notices', authorize('Super Admin', 'School Admin', 'Principal', 'Teacher'), createNotice);
router.delete('/notices/:id', authorize('Super Admin', 'School Admin', 'Principal', 'Teacher'), deleteNotice);

// Events write operations
router.post('/events', authorize('Super Admin', 'School Admin', 'Principal', 'Teacher'), createEvent);
router.delete('/events/:id', authorize('Super Admin', 'School Admin', 'Principal', 'Teacher'), deleteEvent);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

// Messages
router.get('/messages', getMessages);
router.post('/messages', sendMessage);
router.delete('/messages/:id', deleteMessage);

export default router;
