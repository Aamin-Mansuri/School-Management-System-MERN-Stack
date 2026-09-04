import express from 'express';
import {
  createRoleRequest,
  getRoleRequests,
  approveRoleRequest,
  rejectRoleRequest,
  assignUserRoleDirectly,
} from '../controllers/roleRequestController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All role request operations require authentication
router.use(protect);

// Submit or get role requests
router.route('/')
  .post(createRoleRequest)
  .get(getRoleRequests);

// Approval & Rejection routes
// Direct role assignment — must be before /:id routes to avoid 'user' matching as :id
router.put('/user/:id/assign', authorize('Super Admin', 'School Admin', 'Principal'), assignUserRoleDirectly);

router.put('/:id/approve', authorize('Super Admin', 'School Admin', 'Principal'), approveRoleRequest);
router.put('/:id/reject', authorize('Super Admin', 'School Admin', 'Principal'), rejectRoleRequest);

export default router;
