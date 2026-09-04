import express from 'express';
import { getClasses, getClassById, createClass, updateClass, deleteClass } from '../controllers/classController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.route('/')
  .get(getClasses)
  .post(authorize('Super Admin', 'School Admin', 'Principal'), createClass);

router.route('/:id')
  .get(getClassById)
  .put(authorize('Super Admin', 'School Admin', 'Principal'), updateClass)
  .delete(authorize('Super Admin', 'School Admin', 'Principal'), deleteClass);

export default router;
