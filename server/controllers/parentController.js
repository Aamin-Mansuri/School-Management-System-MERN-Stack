import bcrypt from 'bcryptjs';
import { db } from '../data/store.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { logFromReq } from '../utils/auditLogger.js';

// @desc    Get all parents
// @route   GET /api/parents
// @access  Private
export const getParents = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 15 } = req.query;

  let parents = await db.parents.find({});

  if (search) {
    const s = search.toLowerCase();
    parents = parents.filter(
      (p) =>
        p.firstName?.toLowerCase().includes(s) ||
        p.lastName?.toLowerCase().includes(s) ||
        p.email?.toLowerCase().includes(s) ||
        p.phone?.includes(s)
    );
  }

  const total = parents.length;
  const startIndex = (page - 1) * limit;
  const paginated = parents.slice(startIndex, startIndex + Number(limit));

  return sendSuccess(res, 200, 'Parents fetched successfully', paginated);
});

// @desc    Get parent by ID with children's full records
// @route   GET /api/parents/:id
// @access  Private
export const getParentById = asyncHandler(async (req, res) => {
  const parent = await db.parents.findById(req.params.id);
  if (!parent) {
    return sendError(res, 404, 'Parent not found');
  }

  // Fetch full details of each child
  const childrenDetails = [];
  for (const childRef of parent.children || []) {
    const student = await db.students.findById(childRef.studentId);
    if (student) {
      const attendance = await db.attendance.find({ studentId: student._id });
      const fees = await db.fees.find({ studentId: student._id });
      const exams = await db.exams.find({ classId: student.classId });
      childrenDetails.push({
        student,
        attendanceRate: attendance.length > 0
          ? Math.round((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100)
          : 100,
        pendingFees: fees.reduce((acc, f) => acc + (f.dueAmount || 0), 0),
        examsCount: exams.length,
      });
    }
  }

  return sendSuccess(res, 200, 'Parent profile retrieved', {
    parent,
    children: childrenDetails,
  });
});

// @desc    Create parent
// @route   POST /api/parents
// @access  Private (Admin)
export const createParent = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, role, password, phone, occupation, children, address } = req.body;

  if (!firstName || !lastName || !email) {
    return sendError(res, 400, 'First name, last name, and email are required');
  }

  const assignedRole = role || 'Parent';
  const assignedPassword = password && password.trim() ? password.trim() : 'Parent@123';

  // User login creation
  let userId = null;
  const existingUser = await db.users.findOne({ email: email.toLowerCase().trim() });
  if (!existingUser) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(assignedPassword, salt);
    const user = await db.users.create({
      name: `${firstName} ${lastName}`,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: assignedRole,
      phone: phone || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firstName + lastName)}`,
      isActive: true,
      isEmailVerified: true,
    });
    userId = user._id;
  } else {
    userId = existingUser._id;
    const updatePayload = {
      role: assignedRole,
      name: `${firstName} ${lastName}`,
    };
    if (password && password.trim()) {
      const salt = await bcrypt.genSalt(10);
      updatePayload.password = await bcrypt.hash(password.trim(), salt);
    }
    await db.users.findByIdAndUpdate(existingUser._id, updatePayload);
  }

  const parent = await db.parents.create({
    userId,
    firstName,
    lastName,
    email: email.toLowerCase().trim(),
    phone: phone || '',
    occupation: occupation || '',
    children: children || [],
    address: address || {},
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firstName + 'Parent')}`,
    status: 'Active',
  });

  // Audit Log: Guardian Registration
  await logFromReq(req, {
    action: 'GUARDIAN_REGISTERED',
    category: 'Student & Guardian',
    severity: 'MEDIUM',
    target: { id: parent._id, name: `${parent.firstName} ${parent.lastName}`, email: parent.email, type: 'ParentGuardian' },
    details: `Registered guardian record for ${parent.firstName} ${parent.lastName} (${parent.email}).`,
  });

  return sendSuccess(res, 201, 'Parent created successfully', parent);
});

// @desc    Update parent
// @route   PUT /api/parents/:id
// @access  Private (Admin)
export const updateParent = asyncHandler(async (req, res) => {
  const updated = await db.parents.findByIdAndUpdate(req.params.id, req.body);
  if (!updated) {
    return sendError(res, 404, 'Parent not found');
  }
  return sendSuccess(res, 200, 'Parent updated successfully', updated);
});

// @desc    Delete parent
// @route   DELETE /api/parents/:id
// @access  Private (Admin)
export const deleteParent = asyncHandler(async (req, res) => {
  const existing = await db.parents.findById(req.params.id);
  if (!existing) {
    return sendError(res, 404, 'Parent not found');
  }

  const deleted = await db.parents.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return sendError(res, 404, 'Parent not found');
  }

  // Audit Log: Guardian Record Deletion (Critical Event)
  await logFromReq(req, {
    action: 'GUARDIAN_DELETED',
    category: 'Student & Guardian',
    severity: 'CRITICAL',
    target: { id: existing._id, name: `${existing.firstName} ${existing.lastName}`, email: existing.email, type: 'ParentGuardian' },
    details: `Permanently removed guardian profile for ${existing.firstName} ${existing.lastName} (${existing.email}).`,
  });

  return sendSuccess(res, 200, 'Parent deleted successfully');
});
