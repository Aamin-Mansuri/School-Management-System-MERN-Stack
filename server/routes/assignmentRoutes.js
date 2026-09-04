import express from 'express';
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  submitAssignment,
  gradeSubmission,
  deleteAssignment,
} from '../controllers/assignmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.route('/')
  .get(getAssignments)
  .post(authorize('Super Admin', 'School Admin', 'Principal', 'Teacher'), createAssignment);

router.get('/:id', getAssignmentById);
router.delete('/:id', authorize('Super Admin', 'School Admin', 'Principal', 'Teacher'), deleteAssignment);
router.post('/:id/submit', submitAssignment);
router.put('/:id/grade', authorize('Super Admin', 'School Admin', 'Principal', 'Teacher'), gradeSubmission);

export default router;
