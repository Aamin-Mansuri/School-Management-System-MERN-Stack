import express from 'express';
import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacherController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTeachers)
  .post(authorize('Super Admin', 'School Admin', 'Principal'), createTeacher);

router.route('/:id')
  .get(getTeacherById)
  .put(authorize('Super Admin', 'School Admin', 'Principal'), updateTeacher)
  .delete(authorize('Super Admin', 'School Admin'), deleteTeacher);

export default router;
