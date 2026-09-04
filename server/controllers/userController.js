import bcrypt from 'bcryptjs';
import { db } from '../data/store.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { logFromReq } from '../utils/auditLogger.js';

// @desc    Get all users with search, role filter, pagination
// @route   GET /api/users
// @access  Private (Admin)
export const getUsers = asyncHandler(async (req, res) => {
  const { search, role, status, page = 1, limit = 20 } = req.query;

  let query = {};
  if (role) query.role = role;
  if (status !== undefined) query.isActive = status === 'true';

  let users = await db.users.find(query);

  if (search) {
    const s = search.toLowerCase();
    users = users.filter(
      (u) =>
        u.name?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s) ||
        u.phone?.includes(s)
    );
  }

  // Remove passwords
  users = users.map(({ password, ...rest }) => rest);

  const total = users.length;
  const startIndex = (page - 1) * limit;
  const paginated = users.slice(startIndex, startIndex + Number(limit));

  return sendSuccess(res, 200, 'Users fetched successfully', {
    users: paginated,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin)
export const getUserById = asyncHandler(async (req, res) => {
  const user = await db.users.findById(req.params.id);
  if (!user) {
    return sendError(res, 404, 'User not found');
  }
  const { password, ...safeUser } = user;
  return sendSuccess(res, 200, 'User fetched', safeUser);
});

// @desc    Create a user
// @route   POST /api/users
// @access  Private (Admin)
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password = 'Password@123', role = 'Student', phone, isActive = true } = req.body;

  const validRoles = ['Super Admin', 'School Admin', 'Principal', 'Teacher', 'Accountant', 'Student', 'Parent', 'Receptionist', 'Member', 'Visitor'];
  if (!validRoles.includes(role)) return sendError(res, 400, 'Invalid role selected.');
  if (['Super Admin', 'School Admin', 'Principal'].includes(role) && req.user.role !== 'Super Admin') {
    return sendError(res, 403, 'Only Super Admin can create administrative accounts.');
  }

  const existing = await db.users.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return sendError(res, 400, 'User with this email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await db.users.create({
    name,
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role,
    phone: phone || '',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    isActive,
    isEmailVerified: true,
  });

  // Audit Log: User Creation
  await logFromReq(req, {
    action: 'USER_CREATED',
    category: 'User Management',
    severity: 'MEDIUM',
    target: { id: newUser._id, name: newUser.name, email: newUser.email, type: 'UserAccount', role: newUser.role },
    details: `Created new user account "${newUser.name}" with role "${newUser.role}".`,
  });

  const { password: _, ...safeUser } = newUser;
  return sendSuccess(res, 201, 'User created successfully', safeUser);
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
export const updateUser = asyncHandler(async (req, res) => {
  const existingUser = await db.users.findById(req.params.id);
  if (!existingUser) {
    return sendError(res, 404, 'User not found');
  }

  const { name, role, phone, isActive, password } = req.body;
  const updateData = {};
  const validRoles = ['Super Admin', 'School Admin', 'Principal', 'Teacher', 'Accountant', 'Student', 'Parent', 'Receptionist', 'Member', 'Visitor'];

  if (role !== undefined) {
    if (!validRoles.includes(role)) return sendError(res, 400, 'Invalid role selected.');
    if (['Super Admin', 'School Admin', 'Principal'].includes(role) || ['Super Admin', 'School Admin', 'Principal'].includes(existingUser.role)) {
      if (req.user.role !== 'Super Admin') {
        return sendError(res, 403, 'Only Super Admin can assign or modify administrative roles.');
      }
    }
    if (String(req.user._id) === String(existingUser._id) && role !== existingUser.role) {
      return sendError(res, 400, 'You cannot change your own administrative role.');
    }
    updateData.role = role;
  }
  if (name) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (isActive !== undefined) {
    if (String(req.user._id) === String(existingUser._id) && isActive === false) return sendError(res, 400, 'You cannot deactivate your own account.');
    updateData.isActive = isActive;
  }
  if (password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(password, salt);
  }

  const updated = await db.users.findByIdAndUpdate(req.params.id, updateData);
  if (!updated) {
    return sendError(res, 404, 'User not found');
  }

  // Audit Log: Role / Permission Change
  if (role && role !== existingUser.role) {
    await logFromReq(req, {
      action: 'PERMISSION_ROLE_CHANGED',
      category: 'Access & Permissions',
      severity: 'HIGH',
      target: { id: updated._id, name: updated.name, email: updated.email, type: 'UserAccount' },
      changes: { before: { role: existingUser.role }, after: { role: updated.role } },
      details: `Administrative role escalated/modified from "${existingUser.role}" to "${updated.role}" for ${updated.name}.`,
    });
  }

  // Audit Log: Status Change (Deactivated / Reactivated)
  if (isActive !== undefined && isActive !== existingUser.isActive) {
    await logFromReq(req, {
      action: isActive ? 'USER_ACCOUNT_ACTIVATED' : 'USER_ACCOUNT_DEACTIVATED',
      category: 'User Management',
      severity: isActive ? 'MEDIUM' : 'HIGH',
      target: { id: updated._id, name: updated.name, email: updated.email, type: 'UserAccount' },
      changes: { before: { isActive: existingUser.isActive }, after: { isActive: updated.isActive } },
      details: `Account access state toggled to ${isActive ? 'Active' : 'Disabled / Suspended'} for ${updated.name}.`,
    });
  }

  // Audit Log: Password Reset
  if (password) {
    await logFromReq(req, {
      action: 'PASSWORD_RESET_ADMIN',
      category: 'System Security',
      severity: 'HIGH',
      target: { id: updated._id, name: updated.name, email: updated.email, type: 'UserAccount' },
      details: `Administrative override password reset executed for account ${updated.email}.`,
    });
  }

  const { password: _, ...safeUser } = updated;
  return sendSuccess(res, 200, 'User updated successfully', safeUser);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export const deleteUser = asyncHandler(async (req, res) => {
  const existingUser = await db.users.findById(req.params.id);
  if (!existingUser) {
    return sendError(res, 404, 'User not found');
  }

  const user = await db.users.findByIdAndDelete(req.params.id);
  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  // Audit Log: User Deletion (Critical Event)
  await logFromReq(req, {
    action: 'USER_DELETED',
    category: 'User Management',
    severity: 'CRITICAL',
    target: { id: existingUser._id, name: existingUser.name, email: existingUser.email, role: existingUser.role, type: 'UserAccount' },
    details: `Permanently deleted user account "${existingUser.name}" (${existingUser.email}) with role ${existingUser.role}.`,
  });

  return sendSuccess(res, 200, 'User deleted successfully');
});
