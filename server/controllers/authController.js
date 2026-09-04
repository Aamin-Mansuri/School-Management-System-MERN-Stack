import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../data/store.js';
import { generateToken } from '../utils/generateToken.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { sendOtpEmail, sendPasswordResetEmail } from '../utils/emailService.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return sendError(res, 400, 'Please provide name, email, and password');
  }

  const cleanEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await db.users.findOne({ email: cleanEmail });
  if (existingUser) {
    return sendError(res, 400, 'User with this email already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  // Check if an admitted student profile already exists for this email
  const admittedStudent = await db.students.findOne({ email: cleanEmail });
  const admittedParent = await db.parents.findOne({ email: cleanEmail });
  const existingTeacher = await db.teachers.findOne({ email: cleanEmail });

  let assignedRole = 'Member';
  let linkedData = null;

  if (admittedStudent) {
    assignedRole = 'Student';
    linkedData = { type: 'Student', id: admittedStudent._id, classId: admittedStudent.classId, className: admittedStudent.className };
  } else if (admittedParent) {
    assignedRole = 'Parent';
    linkedData = { type: 'Parent', id: admittedParent._id, childrenCount: (admittedParent.children || []).length };
  } else if (existingTeacher) {
    assignedRole = 'Teacher';
    linkedData = { type: 'Teacher', id: existingTeacher._id };
  }

  const user = await db.users.create({
    name: name.trim(),
    email: cleanEmail,
    password: hashedPassword,
    role: assignedRole,
    phone: phone || (admittedStudent?.phone || admittedParent?.phone || ''),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
    isActive: true,
    isEmailVerified: true,
    otp: { code: otpCode, expiresAt: otpExpires },
  });

  // If student was already admitted, link the user ID back to their student record
  if (admittedStudent) {
    await db.students.findByIdAndUpdate(admittedStudent._id, { userId: user._id });
  }
  if (admittedParent) {
    await db.parents.findByIdAndUpdate(admittedParent._id, { userId: user._id });
  }

  let pendingRoleRequest = null;
  // If user is a general visitor (not linked to any school record), create a pending role request
  if (assignedRole === 'Member') {
    pendingRoleRequest = await db.roleRequests.create({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      userAvatar: user.avatar,
      currentRole: 'Member',
      requestedRole: 'Pending Role Assignment',
      reason: 'New visitor registered. Account queued for Admin/Principal institutional role evaluation.',
      qualification: 'New Registered User',
      department: 'Campus Visitor',
      employeeOrRegId: phone ? `Phone: ${phone}` : '',
      requiredApprover: 'Super Admin',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    });
  }

  const token = generateToken(user._id, user.role);

  // Send OTP email (non-blocking)
  sendOtpEmail(user.email, otpCode, user.name).catch(() => {});

  const { password: _, ...safeUser } = user;

  const successMessage = assignedRole === 'Student'
    ? 'Account created and automatically linked with your Student Admission profile!'
    : assignedRole === 'Parent'
    ? 'Account created and automatically linked with your Parent Guardian profile!'
    : 'Account created with Visitor access. An institutional role assignment request has been sent to the Administrator.';

  return sendSuccess(res, 201, successMessage, {
    user: safeUser,
    token,
    roleRequest: pendingRoleRequest,
    linkedData,
  });
});

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 400, 'Please provide email and password');
  }

  const cleanEmail = email.toLowerCase().trim();

  // Find user by email
  let user = await db.users.findOne({ email: cleanEmail });

  if (!user) {
    return sendError(res, 401, 'Invalid email or password');
  }

  if (user.isActive === false) {
    return sendError(res, 403, 'Your account is deactivated. Contact the school administrator.');
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return sendError(res, 401, 'Invalid email or password');
  }

  // Update last login
  await db.users.findByIdAndUpdate(user._id, { lastLogin: new Date().toISOString() });

  const token = generateToken(user._id, user.role);

  // Set HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  });

  const { password: _, ...safeUser } = user;

  return sendSuccess(res, 200, 'Login successful', {
    user: safeUser,
    token,
  });
});

// @desc    Logout current user
// @route   POST /api/auth/logout
// @access  Public
export const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  return sendSuccess(res, 200, 'Logged out successfully');
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await db.users.findById(req.user._id || req.user.id);
  if (!user) {
    return sendError(res, 404, 'User not found');
  }
  const { password, ...safeUser } = user;
  return sendSuccess(res, 200, 'User profile fetched', safeUser);
});

// @desc    Forgot Password (generate OTP / Token)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return sendError(res, 400, 'Please provide your registered email address');
  }

  const user = await db.users.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    // For security reasons, don't leak user existence
    return sendSuccess(res, 200, 'If this email is registered, a password reset code has been sent');
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  await db.users.findByIdAndUpdate(user._id, {
    otp: { code: otpCode, expiresAt },
    resetPasswordToken: otpCode,
    resetPasswordExpires: expiresAt,
  });

  await sendOtpEmail(user.email, otpCode, user.name);

  return sendSuccess(res, 200, 'Password reset verification code sent to your email', {
    email: user.email,
    demoOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
  });
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return sendError(res, 400, 'Email and OTP code are required');
  }

  const user = await db.users.findOne({ email: email.toLowerCase().trim() });
  if (!user || !user.otp) {
    return sendError(res, 400, 'Invalid OTP or email');
  }

  if (user.otp.code !== otp.trim()) {
    return sendError(res, 400, 'Invalid verification code');
  }

  if (new Date(user.otp.expiresAt) < new Date()) {
    return sendError(res, 400, 'Verification code has expired. Please request a new one.');
  }

  await db.users.findByIdAndUpdate(user._id, {
    isEmailVerified: true,
  });

  return sendSuccess(res, 200, 'OTP verified successfully');
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return sendError(res, 400, 'Email is required');
  }

  const user = await db.users.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return sendError(res, 404, 'User not found with this email');
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await db.users.findByIdAndUpdate(user._id, {
    otp: { code: otpCode, expiresAt },
  });

  await sendOtpEmail(user.email, otpCode, user.name);

  return sendSuccess(res, 200, 'New OTP code sent successfully', {
    demoOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
  });
});

// @desc    Reset password using OTP code
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return sendError(res, 400, 'Email, OTP code, and new password are required');
  }

  if (newPassword.length < 6) {
    return sendError(res, 400, 'Password must be at least 6 characters');
  }

  const user = await db.users.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return sendError(res, 400, 'Invalid request');
  }

  if (!user.otp || user.otp.code !== otp.trim()) {
    return sendError(res, 400, 'Invalid or expired OTP code');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await db.users.findByIdAndUpdate(user._id, {
    password: hashedPassword,
    otp: null,
    resetPasswordToken: null,
  });

  return sendSuccess(res, 200, 'Password has been reset successfully. You can now login.');
});

// @desc    Change current user password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return sendError(res, 400, 'Please provide both current and new password');
  }

  const user = await db.users.findById(req.user._id);
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return sendError(res, 400, 'Current password does not match');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await db.users.findByIdAndUpdate(user._id, { password: hashedPassword });

  return sendSuccess(res, 200, 'Password updated successfully');
});

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const updateData = {};
  if (name) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (avatar) updateData.avatar = avatar;

  const updated = await db.users.findByIdAndUpdate(req.user._id, updateData);
  const { password, ...safeUser } = updated;

  return sendSuccess(res, 200, 'Profile updated successfully', safeUser);
});
