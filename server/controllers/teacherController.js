import bcrypt from 'bcryptjs';
import { db } from '../data/store.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { logFromReq } from '../utils/auditLogger.js';

// @desc    Get all teachers with search & department filter
// @route   GET /api/teachers
// @access  Private
export const getTeachers = asyncHandler(async (req, res) => {
  const { search, department, status, page = 1, limit = 15 } = req.query;

  let query = {};
  if (department) query.department = department;
  if (status) query.status = status;

  let teachers = await db.teachers.find(query);

  if (search) {
    const s = search.toLowerCase();
    teachers = teachers.filter(
      (t) =>
        t.firstName?.toLowerCase().includes(s) ||
        t.lastName?.toLowerCase().includes(s) ||
        t.employeeId?.toLowerCase().includes(s) ||
        t.email?.toLowerCase().includes(s) ||
        t.department?.toLowerCase().includes(s)
    );
  }

  const total = teachers.length;
  const startIndex = (page - 1) * limit;
  const paginated = teachers.slice(startIndex, startIndex + Number(limit));

  return sendSuccess(res, 200, 'Teachers fetched successfully', paginated);
});

// @desc    Get teacher by ID (with assigned classes, subjects, timetable, leave count)
// @route   GET /api/teachers/:id
// @access  Private
export const getTeacherById = asyncHandler(async (req, res) => {
  const teacher = await db.teachers.findById(req.params.id);
  if (!teacher) {
    return sendError(res, 404, 'Teacher not found');
  }

  // Teacher assignments & subjects
  const subjects = await db.subjects.find({ teacherId: teacher._id });
  const assignments = await db.assignments.find({ teacherId: teacher._id });
  const leaves = await db.leaves.find({ applicantId: teacher._id });

  return sendSuccess(res, 200, 'Teacher profile fetched', {
    teacher,
    assignedSubjects: subjects,
    activeAssignmentsCount: assignments.length,
    leaves,
  });
});

// @desc    Create teacher
// @route   POST /api/teachers
// @access  Private (Admin)
export const createTeacher = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    role,
    password,
    phone,
    gender,
    joiningDate,
    qualification,
    experience,
    department,
    designation,
    salary,
    assignedClasses,
    assignedSubjects,
    address,
  } = req.body;

  if (!firstName || !lastName || !email) {
    return sendError(res, 400, 'First name, last name, and email are required');
  }

  const assignedRole = role || 'Teacher';
  const assignedPassword = password && password.trim() ? password.trim() : 'Teacher@123';
  const employeeId = `TCH-${Date.now().toString().slice(-4)}`;

  // Create user login account
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

  const teacher = await db.teachers.create({
    userId,
    employeeId,
    firstName,
    lastName,
    email: email.toLowerCase().trim(),
    phone: phone || '',
    gender: gender || 'Male',
    joiningDate: joiningDate || new Date().toISOString().split('T')[0],
    qualification: qualification || 'M.Ed / M.Sc.',
    experience: experience || '5 Years',
    department: department || 'Mathematics & Science',
    designation: designation || 'Senior Faculty',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firstName + employeeId)}`,
    salary: salary || { basic: 45000, allowance: 8000, total: 53000 },
    assignedClasses: assignedClasses || [],
    assignedSubjects: assignedSubjects || [],
    address: address || {},
    status: 'Active',
  });

  // Audit Log: Teacher Registration
  await logFromReq(req, {
    action: 'FACULTY_REGISTERED',
    category: 'Academic & Faculty',
    severity: 'MEDIUM',
    target: { id: teacher._id, name: `${teacher.firstName} ${teacher.lastName}`, email: teacher.email, employeeId: teacher.employeeId, type: 'TeacherFaculty' },
    details: `Appointed faculty member ${teacher.firstName} ${teacher.lastName} (Emp ID: ${teacher.employeeId}, Dept: ${teacher.department}).`,
  });

  return sendSuccess(res, 201, 'Teacher created successfully', teacher);
});

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private (Admin)
export const updateTeacher = asyncHandler(async (req, res) => {
  const updated = await db.teachers.findByIdAndUpdate(req.params.id, req.body);
  if (!updated) {
    return sendError(res, 404, 'Teacher not found');
  }
  return sendSuccess(res, 200, 'Teacher updated successfully', updated);
});

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private (Admin)
export const deleteTeacher = asyncHandler(async (req, res) => {
  const existing = await db.teachers.findById(req.params.id);
  if (!existing) {
    return sendError(res, 404, 'Teacher not found');
  }

  const deleted = await db.teachers.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return sendError(res, 404, 'Teacher not found');
  }

  // Audit Log: Teacher Deletion (Critical Action)
  await logFromReq(req, {
    action: 'FACULTY_DELETED',
    category: 'Academic & Faculty',
    severity: 'CRITICAL',
    target: { id: existing._id, name: `${existing.firstName} ${existing.lastName}`, email: existing.email, employeeId: existing.employeeId, type: 'TeacherFaculty' },
    details: `Terminated and removed faculty record for ${existing.firstName} ${existing.lastName} (Emp ID: ${existing.employeeId || 'N/A'}).`,
  });

  return sendSuccess(res, 200, 'Teacher deleted successfully');
});
