import { db } from '../data/store.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get assignments
// @route   GET /api/assignments
// @access  Private
export const getAssignments = asyncHandler(async (req, res) => {
  const { classId, subjectId, teacherId } = req.query;
  let query = {};
  if (classId) query.classId = classId;
  if (subjectId) query.subjectId = subjectId;
  if (teacherId) query.teacherId = teacherId;

  const assignments = await db.assignments.find(query);
  return sendSuccess(res, 200, 'Assignments fetched successfully', assignments);
});

// @desc    Get assignment by ID
// @route   GET /api/assignments/:id
// @access  Private
export const getAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await db.assignments.findById(req.params.id);
  if (!assignment) {
    return sendError(res, 404, 'Assignment not found');
  }
  return sendSuccess(res, 200, 'Assignment fetched', assignment);
});

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private (Teacher, Admin)
export const createAssignment = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    classId,
    className,
    sectionId,
    sectionName,
    subjectId,
    subjectName,
    dueDate,
    totalMarks = 100,
    attachmentUrl,
  } = req.body;

  if (!title || !classId || !subjectId || !dueDate) {
    return sendError(res, 400, 'Title, class, subject, and due date are required');
  }

  const teacherName = req.user ? req.user.name : 'Teacher';
  const teacherId = req.user ? req.user._id : 'teacher-1';

  const assignment = await db.assignments.create({
    title,
    description: description || '',
    classId,
    className: className || 'Class 1',
    sectionId: sectionId || '',
    sectionName: sectionName || '',
    subjectId,
    subjectName: subjectName || 'General',
    teacherId,
    teacherName,
    dueDate,
    totalMarks: Number(totalMarks),
    attachmentUrl: attachmentUrl || '',
    submissions: [],
    status: 'Active',
  });

  return sendSuccess(res, 201, 'Assignment created successfully', assignment);
});

// @desc    Submit student assignment
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
export const submitAssignment = asyncHandler(async (req, res) => {
  const { fileUrl, fileName, content, studentId, studentName } = req.body;
  const assignment = await db.assignments.findById(req.params.id);

  if (!assignment) {
    return sendError(res, 404, 'Assignment not found');
  }

  let sid = studentId;
  let sname = studentName;

  if (!sid && req.user) {
    let studentRec = await db.students.findOne({
      $or: [{ userId: req.user._id }, { email: req.user.email }],
    });
    if (!studentRec && req.user.name) {
      const parts = req.user.name.trim().split(' ');
      studentRec = await db.students.findOne({
        firstName: { $regex: parts[0], $options: 'i' },
      });
    }
    if (studentRec) {
      sid = studentRec._id;
      sname = `${studentRec.firstName} ${studentRec.lastName}`;
    } else {
      sid = req.user._id;
      sname = req.user.name;
    }
  }

  const submissions = assignment.submissions || [];
  const existingIdx = submissions.findIndex((s) => s.studentId === sid);

  const submissionData = {
    studentId: sid,
    studentName: sname,
    submittedAt: new Date().toISOString(),
    fileUrl: fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: fileName || 'Submission_Document.pdf',
    content: content || '',
    marksObtained: null,
    feedback: '',
    status: 'Submitted',
  };

  if (existingIdx >= 0) {
    submissions[existingIdx] = submissionData;
  } else {
    submissions.push(submissionData);
  }

  const updated = await db.assignments.findByIdAndUpdate(assignment._id, { submissions });
  return sendSuccess(res, 200, 'Assignment submitted successfully', updated);
});

// @desc    Grade assignment submission
// @route   PUT /api/assignments/:id/grade
// @access  Private (Teacher, Admin)
export const gradeSubmission = asyncHandler(async (req, res) => {
  const { studentId, marksObtained, feedback } = req.body;
  const assignment = await db.assignments.findById(req.params.id);

  if (!assignment) {
    return sendError(res, 404, 'Assignment not found');
  }

  const submissions = (assignment.submissions || []).map((sub) => {
    if (sub.studentId === studentId) {
      return {
        ...sub,
        marksObtained: Number(marksObtained),
        feedback: feedback || '',
        status: 'Graded',
      };
    }
    return sub;
  });

  const updated = await db.assignments.findByIdAndUpdate(assignment._id, { submissions });
  return sendSuccess(res, 200, 'Submission graded successfully', updated);
});

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Teacher, Admin)
export const deleteAssignment = asyncHandler(async (req, res) => {
  const deleted = await db.assignments.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return sendError(res, 404, 'Assignment not found');
  }
  return sendSuccess(res, 200, 'Assignment deleted successfully');
});
