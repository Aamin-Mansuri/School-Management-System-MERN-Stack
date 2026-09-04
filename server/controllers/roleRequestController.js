import { db } from '../data/store.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { logFromReq } from '../utils/auditLogger.js';

// @desc    Submit a role upgrade / permission request
// @route   POST /api/role-requests
// @access  Private
export const createRoleRequest = asyncHandler(async (req, res) => {
  const { requestedRole, reason, qualification, department, employeeOrRegId } = req.body;

  if (!requestedRole) {
    return sendError(res, 400, 'Please specify the requested role.');
  }

  const validRoles = ['Principal', 'Teacher', 'Accountant', 'Student', 'Parent', 'Super Admin'];
  if (!validRoles.includes(requestedRole)) {
    return sendError(res, 400, `Invalid role requested. Valid options: ${validRoles.join(', ')}`);
  }

  const user = await db.users.findById(req.user._id || req.user.id);
  if (!user) {
    return sendError(res, 404, 'User not found.');
  }

  if (user.role === requestedRole) {
    return sendError(res, 400, `You are already assigned the role of ${requestedRole}.`);
  }

  // Check if a pending request already exists for this user and role
  const existingPending = await db.roleRequests.find({
    userId: user._id,
    requestedRole,
    status: 'PENDING',
  });

  if (existingPending && existingPending.length > 0) {
    return sendError(res, 400, `You already have an active pending approval request for the ${requestedRole} role.`);
  }

  // Determine required authority:
  // - Principal role requires Super Admin approval
  // - Teacher role requires Principal (or Admin) approval
  // - Others require Principal or Admin
  let requiredApprover = 'Principal';
  if (requestedRole === 'Principal' || requestedRole === 'Super Admin') {
    requiredApprover = 'Super Admin';
  }

  const newRequest = await db.roleRequests.create({
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    userAvatar: user.avatar,
    currentRole: user.role,
    requestedRole,
    reason: reason || 'Requesting institutional role upgrade for campus responsibilities.',
    qualification: qualification || 'Verified Credentials',
    department: department || 'General Academics',
    employeeOrRegId: employeeOrRegId || '',
    requiredApprover,
    status: 'PENDING', // 'PENDING' | 'APPROVED' | 'REJECTED'
    createdAt: new Date().toISOString(),
  });

  // Audit log
  await logFromReq(req, {
    action: 'ROLE_REQUEST_SUBMITTED',
    category: 'Access & Permissions',
    severity: 'MEDIUM',
    target: { id: newRequest._id, type: 'RoleRequest', requestedRole, userId: user._id },
    details: `User "${user.name}" (${user.email}, current: ${user.role}) submitted role upgrade request for "${requestedRole}" (Requires ${requiredApprover} approval).`,
  });

  return sendSuccess(res, 201, `Role request for ${requestedRole} submitted successfully. Awaiting ${requiredApprover} approval.`, newRequest);
});

// @desc    Get all role requests (Filtered by user role)
// @route   GET /api/role-requests
// @access  Private
export const getRoleRequests = asyncHandler(async (req, res) => {
  const user = req.user;
  let requests = await db.roleRequests.find();

  // If normal user / Member / Student / Teacher without admin rights: only show own requests
  if (!['Super Admin', 'School Admin', 'Principal'].includes(user.role)) {
    requests = requests.filter((r) => r.userId === user._id || r.userEmail === user.email);
  } else if (user.role === 'Principal') {
    // Principal can see all requests, but note which ones they can approve (Teacher, Student, Parent, Staff, Accountant)
    // and which ones require Admin (Principal, Super Admin)
  }

  // Sort descending by date
  requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return sendSuccess(res, 200, 'Role requests fetched successfully', {
    requests,
    summary: {
      total: requests.length,
      pending: requests.filter((r) => r.status === 'PENDING').length,
      approved: requests.filter((r) => r.status === 'APPROVED').length,
      rejected: requests.filter((r) => r.status === 'REJECTED').length,
    },
  });
});

// @desc    Approve a role request & grant role
// @route   PUT /api/role-requests/:id/approve
// @access  Private (Admin or Principal with rules)
export const approveRoleRequest = asyncHandler(async (req, res) => {
  const { notes, assignedRole } = req.body;
  const approver = req.user;

  const request = await db.roleRequests.findById(req.params.id);
  if (!request) {
    return sendError(res, 404, 'Role request not found.');
  }

  if (request.status !== 'PENDING') {
    return sendError(res, 400, `This request has already been ${request.status.toLowerCase()}.`);
  }

  // Determine which role to grant: either explicit assignedRole chosen by admin, or requestedRole
  const effectiveRole = assignedRole || (request.requestedRole === 'Pending Role Assignment' ? 'Teacher' : request.requestedRole);
  const validRoles = ['Super Admin', 'School Admin', 'Principal', 'Teacher', 'Accountant', 'Student', 'Parent', 'Receptionist', 'Member', 'Visitor'];
  if (!validRoles.includes(effectiveRole)) {
    return sendError(res, 400, 'Invalid role selected.');
  }

  // Authority rules:
  // 1. To approve a Principal or Super Admin role: Approver MUST be Super Admin.
  if (['Principal', 'Super Admin', 'School Admin'].includes(effectiveRole)) {
    if (approver.role !== 'Super Admin') {
      return sendError(res, 403, 'Permission Denied: Only Super Admin can approve Principal, School Admin, or Super Admin roles.');
    }
  }

  // 2. To approve Teacher / Student / Parent / Accountant / Member: Approver can be Principal, School Admin, or Super Admin.
  if (!['Super Admin', 'School Admin', 'Principal'].includes(approver.role)) {
    return sendError(res, 403, 'Permission Denied: You do not have authority to approve role requests.');
  }

  // Find target user and update role
  const targetUser = await db.users.findById(request.userId);
  if (!targetUser) {
    return sendError(res, 404, 'Target user account not found.');
  }

  const previousRole = targetUser.role;
  const newRole = effectiveRole;

  await db.users.findByIdAndUpdate(targetUser._id, { role: newRole });

  // Update role request status
  const updatedRequest = await db.roleRequests.findByIdAndUpdate(request._id, {
    status: 'APPROVED',
    grantedRole: newRole,
    reviewedBy: {
      id: approver._id || approver.id,
      name: approver.name,
      role: approver.role,
    },
    reviewNotes: notes || `Role "${newRole}" granted by ${approver.name} (${approver.role})`,
    reviewedAt: new Date().toISOString(),
  });

  // Audit Log
  await logFromReq(req, {
    action: 'ROLE_REQUEST_APPROVED',
    category: 'Access & Permissions',
    severity: 'HIGH',
    target: { id: targetUser._id, name: targetUser.name, email: targetUser.email, type: 'UserAccount' },
    changes: { before: { role: previousRole }, after: { role: newRole } },
    details: `${approver.role} "${approver.name}" approved role assignment "${newRole}" for "${targetUser.name}" (${targetUser.email}).`,
  });

  return sendSuccess(res, 200, `Role granted successfully. ${targetUser.name} is now assigned as ${newRole}.`, {
    request: updatedRequest,
    user: { _id: targetUser._id, name: targetUser.name, email: targetUser.email, role: newRole },
  });
});

// @desc    Reject a role request
// @route   PUT /api/role-requests/:id/reject
// @access  Private (Admin or Principal with rules)
export const rejectRoleRequest = asyncHandler(async (req, res) => {
  const { notes } = req.body;
  const approver = req.user;

  const request = await db.roleRequests.findById(req.params.id);
  if (!request) {
    return sendError(res, 404, 'Role request not found.');
  }

  if (request.status !== 'PENDING') {
    return sendError(res, 400, `This request has already been ${request.status.toLowerCase()}.`);
  }

  // Permission check
  if (['Principal', 'Super Admin'].includes(request.requestedRole) && approver.role !== 'Super Admin' && approver.role !== 'School Admin') {
    return sendError(res, 403, 'Permission Denied: Only Super Admin can review Principal/Admin requests.');
  }

  if (!['Super Admin', 'School Admin', 'Principal'].includes(approver.role)) {
    return sendError(res, 403, 'Permission Denied: You do not have authority to review role requests.');
  }

  const updatedRequest = await db.roleRequests.findByIdAndUpdate(request._id, {
    status: 'REJECTED',
    reviewedBy: {
      id: approver._id || approver.id,
      name: approver.name,
      role: approver.role,
    },
    reviewNotes: notes || 'Request does not meet institutional verification criteria at this time.',
    reviewedAt: new Date().toISOString(),
  });

  // Audit Log
  await logFromReq(req, {
    action: 'ROLE_REQUEST_REJECTED',
    category: 'Access & Permissions',
    severity: 'MEDIUM',
    target: { id: request.userId, name: request.userName, email: request.userEmail, type: 'RoleRequest' },
    details: `${approver.role} "${approver.name}" rejected role request for "${request.requestedRole}" from "${request.userName}". Reason: ${notes || 'Verification criteria not met.'}`,
  });

  return sendSuccess(res, 200, `Role request for ${request.requestedRole} has been rejected.`, updatedRequest);
});

// @desc    Directly assign a role to a user (Admin/Principal action)
// @route   PUT /api/users/:id/role
// @access  Private (Admin or Principal)
export const assignUserRoleDirectly = asyncHandler(async (req, res) => {
  const { role, reason } = req.body;
  const actor = req.user;

  if (!role) {
    return sendError(res, 400, 'Please specify the role to assign.');
  }

  const validRoles = ['Super Admin', 'School Admin', 'Principal', 'Teacher', 'Accountant', 'Student', 'Parent', 'Member'];
  if (!validRoles.includes(role)) {
    return sendError(res, 400, `Invalid role. Allowed: ${validRoles.join(', ')}`);
  }

  const targetUser = await db.users.findById(req.params.id);
  if (!targetUser) {
    return sendError(res, 404, 'User not found.');
  }

  // Authority rules:
  // - Principal CANNOT assign Principal or Super Admin role. Only Super Admin can!
  if (['Super Admin', 'School Admin', 'Principal'].includes(role) || ['Super Admin', 'School Admin', 'Principal'].includes(targetUser.role)) {
    if (actor.role !== 'Super Admin') {
      return sendError(res, 403, 'Permission Denied: Only Super Admin can assign or modify Principal, School Admin, or Super Admin roles.');
    }
  }

  // Principal can assign: Teacher, Student, Parent, Accountant, Member
  if (actor.role === 'Principal') {
    const principalAllowed = ['Teacher', 'Student', 'Parent', 'Accountant', 'Member'];
    if (!principalAllowed.includes(role)) {
      return sendError(res, 403, `Principals can only assign roles: ${principalAllowed.join(', ')}`);
    }
  }

  const previousRole = targetUser.role;
  const updated = await db.users.findByIdAndUpdate(targetUser._id, { role });

  // Audit log
  await logFromReq(req, {
    action: 'DIRECT_ROLE_ASSIGNED',
    category: 'Access & Permissions',
    severity: 'HIGH',
    target: { id: targetUser._id, name: targetUser.name, email: targetUser.email, type: 'UserAccount' },
    changes: { before: { role: previousRole }, after: { role } },
    details: `${actor.role} "${actor.name}" directly assigned role "${role}" (previously "${previousRole}") to ${targetUser.name}. ${reason ? `Reason: ${reason}` : ''}`,
  });

  const { password, ...safeUser } = updated;
  return sendSuccess(res, 200, `Successfully updated ${targetUser.name}'s role to ${role}.`, safeUser);
});
