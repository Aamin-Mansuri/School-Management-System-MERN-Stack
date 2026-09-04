import { db } from '../data/store.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get attendance for a specific date & class
// @route   GET /api/attendance
// @access  Private
export const getAttendance = asyncHandler(async (req, res) => {
  const { date, classId, sectionId, studentId } = req.query;

  let query = {};
  if (date) query.date = date;
  if (classId) query.classId = classId;
  if (sectionId) query.sectionId = sectionId;
  if (studentId) query.studentId = studentId;

  // Auto-scope for Student / Parent if not explicitly querying another student
  if (req.user && !studentId && !classId) {
    if (req.user.role === 'Student') {
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
      const parentRec = await db.parents.findOne({
        $or: [
          { userId: req.user._id },
          { email: req.user.email },
        ]
      });
      if (parentRec && Array.isArray(parentRec.children) && parentRec.children.length > 0) {
        const childIds = parentRec.children.map((c) => c.studentId || c.id || c._id).filter(Boolean);
        if (childIds.length > 0) {
          query.studentId = { $in: childIds };
        }
      }
    }
  }

  const records = await db.attendance.find(query);
  return sendSuccess(res, 200, 'Attendance records fetched', records);
});

// @desc    Mark batch attendance for a class on a date
// @route   POST /api/attendance/batch
// @access  Private (Teacher, Admin)
export const markBatchAttendance = asyncHandler(async (req, res) => {
  const { date, classId, className, sectionId, sectionName, entries, records } = req.body;
  const attendanceItems = entries || records;

  if (!date || !classId || !attendanceItems || !Array.isArray(attendanceItems)) {
    return sendError(res, 400, 'Date, class, and attendance entries list are required');
  }

  const markedBy = req.user ? req.user.name : 'Teacher';
  const savedRecords = [];

  for (const entry of attendanceItems) {
    const existing = await db.attendance.findOne({
      date,
      studentId: entry.studentId,
    });

    if (existing) {
      const updated = await db.attendance.findByIdAndUpdate(existing._id, {
        status: entry.status || 'Present',
        remark: entry.remark || '',
        markedBy,
        className: className || existing.className,
        sectionId: sectionId || existing.sectionId,
        sectionName: sectionName || existing.sectionName,
      });
      savedRecords.push(updated);
    } else {
      const created = await db.attendance.create({
        date,
        classId,
        className: className || 'Class 1',
        sectionId: sectionId || 'sec-a',
        sectionName: sectionName || 'Section A',
        studentId: entry.studentId,
        studentName: entry.studentName,
        rollNumber: entry.rollNumber,
        status: entry.status || 'Present',
        remark: entry.remark || '',
        markedBy,
      });
      savedRecords.push(created);
    }
  }

  return sendSuccess(res, 200, `Attendance recorded for ${savedRecords.length} students`, savedRecords);
});

// @desc    Get attendance analytics & summary for class/student
// @route   GET /api/attendance/analytics
// @access  Private
export const getAttendanceAnalytics = asyncHandler(async (req, res) => {
  const { classId, month } = req.query;

  let allRecords = await db.attendance.find(classId ? { classId } : {});

  if (month) {
    allRecords = allRecords.filter((r) => r.date.startsWith(month));
  }

  const total = allRecords.length;
  const present = allRecords.filter((r) => r.status === 'Present').length;
  const absent = allRecords.filter((r) => r.status === 'Absent').length;
  const late = allRecords.filter((r) => r.status === 'Late').length;
  const leave = allRecords.filter((r) => r.status === 'Leave' || r.status === 'Half Day').length;

  const rate = total > 0 ? Math.round((present / total) * 100) : 100;

  return sendSuccess(res, 200, 'Attendance analytics calculated', {
    total,
    present,
    absent,
    late,
    leave,
    rate,
  });
});
