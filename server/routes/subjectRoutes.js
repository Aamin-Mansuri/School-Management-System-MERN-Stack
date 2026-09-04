import express from 'express';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../controllers/subjectController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.route('/')
  .get(getSubjects)
  .post(authorize('Super Admin', 'School Admin', 'Principal'), createSubject);

router.route('/:id')
  .put(authorize('Super Admin', 'School Admin', 'Principal'), updateSubject)
  .delete(authorize('Super Admin', 'School Admin'), deleteSubject);

export default router;
