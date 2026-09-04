import express from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.route('/')
  .get(authorize('Super Admin', 'School Admin', 'Principal'), getUsers)
  .post(authorize('Super Admin', 'School Admin'), createUser);

router.route('/:id')
  .get(getUserById)
  .put(authorize('Super Admin', 'School Admin'), updateUser)
  .delete(authorize('Super Admin', 'School Admin'), deleteUser);

export default router;
