import express from 'express';
import { getParents, getParentById, createParent, updateParent, deleteParent } from '../controllers/parentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.route('/')
  .get(getParents)
  .post(authorize('Super Admin', 'School Admin', 'Principal'), createParent);

router.route('/:id')
  .get(getParentById)
  .put(authorize('Super Admin', 'School Admin', 'Principal'), updateParent)
  .delete(authorize('Super Admin', 'School Admin', 'Principal'), deleteParent);

export default router;
