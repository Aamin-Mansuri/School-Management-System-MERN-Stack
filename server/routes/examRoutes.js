import express from 'express';
import {
  getExams,
  getExamById,
  createExam,
  updateExamResults,
  getStudentReportCard,
  deleteExam,
} from '../controllers/examController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.route('/')
  .get(getExams)
  .post(authorize('Super Admin', 'School Admin', 'Principal', 'Teacher'), createExam);

router.get('/report-card/:studentId', getStudentReportCard);
router.get('/:id', getExamById);
router.delete('/:id', authorize('Super Admin', 'School Admin', 'Principal', 'Teacher'), deleteExam);
router.put('/:id/results', authorize('Super Admin', 'School Admin', 'Principal', 'Teacher'), updateExamResults);

export default router;
