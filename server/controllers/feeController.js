import crypto from 'crypto';
import { db } from '../data/store.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { executeFeeReminderDispatch, generateFeeReminderEmailHtml } from '../services/feeReminderService.js';

// @desc    Get all fees with filters & summary statistics
// @route   GET /api/fees
// @access  Private
export const getFees = asyncHandler(async (req, res) => {
  const { studentId, classId, status, feeType } = req.query;

  let query = {};
  if (studentId) query.studentId = studentId;
  if (classId) query.classId = classId;
  if (status) query.status = status;
  if (feeType) query.feeType = feeType;

  // Role-based scoping for Student and Parent
  if (req.user) {
    if (req.user.role === 'Student') {
      // Find matching student record by userId or email or name
      let studentRec = await db.students.findOne({
        $or: [
          { userId: req.user._id },
          { email: req.user.email },
        ]
      });
      if (!studentRec && req.user.name) {
        const parts = req.user.name.trim().split(' ');
        studentRec = await db.students.findOne({
          firstName: { $regex: parts[0], $options: 'i' }
        });
      }
      if (studentRec) {
        query.studentId = studentRec._id;
      }
    } else if (req.user.role === 'Parent') {
      // Find matching parent record and linked children
      const parentRec = await db.parents.findOne({
        $or: [
          { userId: req.user._id },
          { email: req.user.email },
        ]
      });
      if (parentRec && Array.isArray(parentRec.children) && parentRec.children.length > 0) {
        const childIds = parentRec.children.map((c) => c.studentId || c.id || c._id).filter(Boolean);
        if (childIds.length > 0 && !studentId) {
          query.studentId = { $in: childIds };
        }
      }
    }
  }

  const fees = await db.fees.find(query);

  return sendSuccess(res, 200, 'Fees fetched successfully', fees);
});

// @desc    Get fee by ID
// @route   GET /api/fees/:id
// @access  Private
export const getFeeById = asyncHandler(async (req, res) => {
  const fee = await db.fees.findById(req.params.id);
  if (!fee) {
    return sendError(res, 404, 'Fee record not found');
  }
  return sendSuccess(res, 200, 'Fee record retrieved', fee);
});

// @desc    Create fee invoice for student or batch class
// @route   POST /api/fees
// @access  Private (Accountant, Admin)
export const createFee = asyncHandler(async (req, res) => {
  const {
    studentId,
    studentName,
    admissionNumber,
    classId,
    className,
    feeType = 'Tuition Fee',
    title,
    totalAmount,
    discount = 0,
    dueDate,
  } = req.body;

  if (!title || !totalAmount || !dueDate) {
    return sendError(res, 400, 'Title, total amount, and due date are required');
  }

  const finalDue = Math.max(0, Number(totalAmount) - Number(discount));

  // If specific student
  if (studentId) {
    const student = await db.students.findById(studentId);
    const resolvedStudentName = student ? `${student.firstName} ${student.lastName}` : (studentName || 'Student');
    const resolvedAdmissionNum = student ? student.admissionNumber : (admissionNumber || 'ADM-000');
    const resolvedClassId = student ? (student.classId || classId) : (classId || 'cls-1');
    const resolvedClassName = student ? (student.className || className) : (className || 'Grade 10');

    const fee = await db.fees.create({
      studentId,
      studentName: resolvedStudentName,
      admissionNumber: resolvedAdmissionNum,
      classId: resolvedClassId,
      className: resolvedClassName,
      feeType,
      title,
      totalAmount: Number(totalAmount),
      discount: Number(discount),
      lateFee: 0,
      paidAmount: 0,
      dueAmount: finalDue,
      dueDate,
      academicYear: '2025-2026',
      status: finalDue === 0 ? 'Paid' : 'Unpaid',
      payments: [],
    });
    return sendSuccess(res, 201, 'Fee invoice created successfully', fee);
  }

  // If created for entire class
  const students = await db.students.find({ classId });
  const createdFees = [];

  for (const st of students) {
    const fee = await db.fees.create({
      studentId: st._id,
      studentName: `${st.firstName} ${st.lastName}`,
      admissionNumber: st.admissionNumber,
      classId,
      className: className || st.className,
      feeType,
      title,
      totalAmount: Number(totalAmount),
      discount: Number(discount),
      lateFee: 0,
      paidAmount: 0,
      dueAmount: finalDue,
      dueDate,
      academicYear: '2025-2026',
      status: 'Unpaid',
      payments: [],
    });
    createdFees.push(fee);
  }

  return sendSuccess(res, 201, `Created ${createdFees.length} fee invoices for class`, createdFees);
});

// @desc    Record fee payment & generate receipt
// @route   POST /api/fees/:id/payments
// @access  Private (Accountant, Admin, Parent, Student)
export const recordPayment = asyncHandler(async (req, res) => {
  const { amount, paymentMethod = 'Online Portal', note } = req.body;
  const fee = await db.fees.findById(req.params.id);

  if (!fee) {
    return sendError(res, 404, 'Fee record not found');
  }

  const payAmount = Number(amount);
  if (!payAmount || payAmount <= 0) {
    return sendError(res, 400, 'Please enter a valid payment amount');
  }

  if (payAmount > fee.dueAmount) {
    return sendError(res, 400, `Amount exceeds current due amount of $${fee.dueAmount}`);
  }

  const receiptNumber = `REC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  const paymentEntry = {
    receiptNumber,
    amount: payAmount,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod,
    transactionId: `TXN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    collectedBy: req.user ? req.user.name : 'System Gateway',
    status: 'Completed',
    note: note || 'Tuition / Fees settlement',
  };

  const newPaid = (fee.paidAmount || 0) + payAmount;
  const newDue = Math.max(0, fee.dueAmount - payAmount);
  const newStatus = newDue === 0 ? 'Paid' : 'Partially Paid';

  const payments = fee.payments || [];
  payments.push(paymentEntry);

  const updated = await db.fees.findByIdAndUpdate(fee._id, {
    paidAmount: newPaid,
    dueAmount: newDue,
    status: newStatus,
    payments,
  });

  return sendSuccess(res, 200, 'Payment recorded successfully', {
    fee: updated,
    receipt: paymentEntry,
  });
});

// @desc    Trigger automated fee reminder email dispatch
// @route   POST /api/fees/reminders/send-automated
// @access  Private (Super Admin, School Admin, Accountant)
export const sendAutomatedFeeReminders = asyncHandler(async (req, res) => {
  const { targetFeeIds, customNote, escalationLevel = 'Standard' } = req.body || {};

  const result = await executeFeeReminderDispatch({
    targetFeeIds: Array.isArray(targetFeeIds) && targetFeeIds.length > 0 ? targetFeeIds : null,
    isAutomated: !targetFeeIds,
    senderUser: req.user,
    customNote,
    escalationLevel,
  });

  await db.auditLogs.create({
    userId: req.user?._id || 'system',
    userName: req.user?.name || 'System',
    userRole: req.user?.role || 'Admin',
    action: 'FEE_REMINDERS_SENT',
    module: 'FEES',
    description: `Dispatched ${result.dispatchedCount} automated fee reminder emails (Total dues: $${result.totalAmountReminded})`,
    details: { dispatchedCount: result.dispatchedCount, totalAmountReminded: result.totalAmountReminded },
    timestamp: new Date().toISOString(),
  });

  return sendSuccess(res, 200, `Successfully dispatched ${result.dispatchedCount} email reminders to parents`, result);
});

// @desc    Send a single targeted fee reminder email to a student's parent
// @route   POST /api/fees/reminders/send-single/:id
// @access  Private (Super Admin, School Admin, Accountant)
export const sendSingleFeeReminder = asyncHandler(async (req, res) => {
  const feeId = req.params.id;
  const { customNote, escalationLevel = 'Standard' } = req.body || {};

  const fee = await db.fees.findById(feeId);
  if (!fee) {
    return sendError(res, 404, 'Fee invoice not found');
  }

  if (Number(fee.dueAmount) <= 0) {
    return sendError(res, 400, 'This fee invoice is already fully cleared. No reminder needed.');
  }

  const result = await executeFeeReminderDispatch({
    targetFeeIds: [feeId],
    isAutomated: false,
    senderUser: req.user,
    customNote,
    escalationLevel,
  });

  await db.auditLogs.create({
    userId: req.user?._id || 'system',
    userName: req.user?.name || 'System',
    userRole: req.user?.role || 'Admin',
    action: 'FEE_REMINDER_SENT_SINGLE',
    module: 'FEES',
    description: `Sent targeted fee reminder email to parent of ${fee.studentName} for ${fee.title} ($${fee.dueAmount} due)`,
    details: { feeId, studentName: fee.studentName, dueAmount: fee.dueAmount },
    timestamp: new Date().toISOString(),
  });

  return sendSuccess(res, 200, `Email reminder sent to parent of ${fee.studentName}`, result.dispatchedLogs[0] || {});
});

// @desc    Get all outstanding fee defaulters with parent details & reminder status
// @route   GET /api/fees/reminders/defaulters
// @access  Private (Super Admin, School Admin, Accountant)
export const getOutstandingDefaulters = asyncHandler(async (req, res) => {
  const allFees = await db.fees.find({});
  const allStudents = await db.students.find({});
  const allParents = await db.parents.find({});
  const reminderLogs = await db.feeReminders.find({});

  const studentMap = new Map();
  allStudents.forEach((st) => studentMap.set(st._id, st));

  const parentMap = new Map();
  allParents.forEach((p) => {
    if (p.children && Array.isArray(p.children)) {
      p.children.forEach((c) => parentMap.set(c.studentId, p));
    }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group latest reminder by feeId
  const latestReminderMap = new Map();
  reminderLogs.forEach((log) => {
    const existing = latestReminderMap.get(log.feeId);
    if (!existing || new Date(log.sentAt) > new Date(existing.sentAt)) {
      latestReminderMap.set(log.feeId, log);
    }
  });

  const defaulters = [];

  for (const fee of allFees) {
    if (Number(fee.dueAmount) > 0) {
      const student = studentMap.get(fee.studentId) || {
        _id: fee.studentId,
        firstName: fee.studentName?.split(' ')[0] || 'Student',
        lastName: fee.studentName?.split(' ')[1] || '',
        admissionNumber: fee.admissionNumber || 'ADM-000',
        className: fee.className || 'Class',
        parentInfo: {},
      };

      const parentDoc = parentMap.get(student._id);

      const parentEmail =
        parentDoc?.email ||
        student.parentInfo?.parentEmail ||
        student.parentInfo?.guardianEmail ||
        student.parentEmail ||
        student.email ||
        `parent.${student.admissionNumber?.toLowerCase() || 'std'}@edupulse.edu`;

      const parentName =
        parentDoc?.firstName
          ? `${parentDoc.firstName} ${parentDoc.lastName || ''}`
          : student.parentInfo?.fatherName ||
            student.parentInfo?.motherName ||
            student.parentInfo?.guardianName ||
            `Guardian of ${student.firstName}`;

      const parentPhone =
        parentDoc?.phone ||
        student.parentInfo?.fatherPhone ||
        student.parentInfo?.motherPhone ||
        student.parentInfo?.guardianPhone ||
        student.phone ||
        '+1 (555) 000-0000';

      const feeDueDate = fee.dueDate ? new Date(fee.dueDate) : today;
      const isOverdue = feeDueDate < today || fee.status === 'Overdue';
      const diffTime = today.getTime() - feeDueDate.getTime();
      const daysOverdue = isOverdue ? Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24))) : 0;
      const daysRemaining = !isOverdue ? Math.max(0, Math.ceil((feeDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))) : 0;

      const lastReminder = latestReminderMap.get(fee._id);

      defaulters.push({
        feeId: fee._id,
        studentId: student._id,
        studentName: `${student.firstName} ${student.lastName || ''}`,
        admissionNumber: student.admissionNumber || fee.admissionNumber,
        className: student.className || fee.className,
        parentName,
        parentEmail,
        parentPhone,
        feeTitle: fee.title,
        feeType: fee.feeType,
        totalAmount: Number(fee.totalAmount),
        paidAmount: Number(fee.paidAmount || 0),
        dueAmount: Number(fee.dueAmount),
        dueDate: fee.dueDate,
        status: fee.status,
        isOverdue,
        daysOverdue,
        daysRemaining,
        lastReminderSentAt: lastReminder ? lastReminder.sentAt : null,
        reminderCount: reminderLogs.filter((l) => l.feeId === fee._id).length,
      });
    }
  }

  return sendSuccess(res, 200, 'Defaulters retrieved successfully', {
    totalDefaulters: defaulters.length,
    totalOutstandingAmount: defaulters.reduce((acc, d) => acc + d.dueAmount, 0),
    overdueCount: defaulters.filter((d) => d.isOverdue).length,
    defaulters,
  });
});

// @desc    Get all email reminder dispatch history logs
// @route   GET /api/fees/reminders/logs
// @access  Private (Super Admin, School Admin, Accountant)
export const getFeeReminderLogs = asyncHandler(async (req, res) => {
  const logs = await db.feeReminders.find({});
  // Sort by latest first
  logs.sort((a, b) => new Date(b.sentAt || 0) - new Date(a.sentAt || 0));

  return sendSuccess(res, 200, 'Reminder logs retrieved', logs);
});

// @desc    Preview HTML email template for a specific fee or generic template
// @route   POST /api/fees/reminders/preview
// @access  Private
export const previewFeeReminderEmail = asyncHandler(async (req, res) => {
  const { feeId, customNote } = req.body || {};
  const settings = (await db.getSettings()) || {};

  let previewData = {
    parentName: 'David Miller',
    studentName: 'Lucas Miller',
    admissionNumber: 'ADM-2025-001',
    className: 'Grade 10',
    feeTitle: 'Term 1 Tuition & Lab Fee',
    feeType: 'Tuition Fee',
    totalAmount: 2400,
    paidAmount: 0,
    dueAmount: 2400,
    dueDate: '2026-08-30',
    isOverdue: false,
    daysOverdue: 0,
    invoiceNumber: 'INV-901824',
    schoolSettings: settings,
    customNote: customNote || '',
  };

  if (feeId) {
    const fee = await db.fees.findById(feeId);
    if (fee) {
      const student = await db.students.findById(fee.studentId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const feeDueDate = fee.dueDate ? new Date(fee.dueDate) : today;
      const isOverdue = feeDueDate < today || fee.status === 'Overdue';
      const daysOverdue = isOverdue ? Math.max(1, Math.floor((today.getTime() - feeDueDate.getTime()) / (1000 * 60 * 60 * 24))) : 0;

      previewData = {
        parentName: student?.parentInfo?.fatherName || 'Parent / Guardian',
        studentName: fee.studentName || 'Student',
        admissionNumber: fee.admissionNumber || 'ADM-001',
        className: fee.className || 'Class',
        feeTitle: fee.title,
        feeType: fee.feeType,
        totalAmount: fee.totalAmount,
        paidAmount: fee.paidAmount || 0,
        dueAmount: fee.dueAmount,
        dueDate: fee.dueDate,
        isOverdue,
        daysOverdue,
        invoiceNumber: `INV-${fee._id.slice(-6).toUpperCase()}`,
        schoolSettings: settings,
        customNote: customNote || '',
      };
    }
  }

  const html = generateFeeReminderEmailHtml(previewData);
  return sendSuccess(res, 200, 'Email preview generated', { html, data: previewData });
});

// @desc    Get automated fee reminder settings
// @route   GET /api/fees/reminders/settings
// @access  Private
export const getFeeReminderSettings = asyncHandler(async (req, res) => {
  const settings = await db.getFeeReminderSettings();
  return sendSuccess(res, 200, 'Reminder settings fetched', settings);
});

// @desc    Update automated fee reminder settings
// @route   PUT /api/fees/reminders/settings
// @access  Private (Super Admin, School Admin, Accountant)
export const updateFeeReminderSettings = asyncHandler(async (req, res) => {
  const updated = await db.updateFeeReminderSettings(req.body);
  await db.auditLogs.create({
    userId: req.user?._id || 'system',
    userName: req.user?.name || 'System',
    userRole: req.user?.role || 'Admin',
    action: 'FEE_REMINDER_SETTINGS_UPDATED',
    module: 'FEES',
    description: 'Updated automated fee reminder scheduling and template settings',
    details: req.body,
    timestamp: new Date().toISOString(),
  });
  return sendSuccess(res, 200, 'Settings updated successfully', updated);
});

