import express from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  uploadStudentDocument,
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getStudents)
  .post(authorize('Super Admin', 'School Admin', 'Principal', 'Receptionist'), createStudent);

router.route('/:id')
  .get(getStudentById)
  .put(authorize('Super Admin', 'School Admin', 'Principal', 'Teacher'), updateStudent)
  .delete(authorize('Super Admin', 'School Admin'), deleteStudent);

router.post('/:id/documents', uploadStudentDocument);

export default router;
