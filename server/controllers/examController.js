import { db } from '../data/store.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// Helper: Calculate grade from marks percentage
export const calculateGrade = (percentage) => {
  if (percentage >= 90) return { grade: 'A+', remarks: 'Outstanding' };
  if (percentage >= 80) return { grade: 'A', remarks: 'Excellent' };
  if (percentage >= 70) return { grade: 'B+', remarks: 'Very Good' };
  if (percentage >= 60) return { grade: 'B', remarks: 'Good' };
  if (percentage >= 50) return { grade: 'C', remarks: 'Satisfactory' };
  if (percentage >= 40) return { grade: 'D', remarks: 'Pass' };
  return { grade: 'F', remarks: 'Needs Improvement' };
};

// @desc    Get all exams
// @route   GET /api/exams
// @access  Private
export const getExams = asyncHandler(async (req, res) => {
  const { classId, term, status } = req.query;
  let query = {};
  if (classId) query.classId = classId;
  if (term) query.term = term;
  if (status) query.status = status;

  const exams = await db.exams.find(query);
  return sendSuccess(res, 200, 'Exams fetched successfully', exams);
});

// @desc    Get exam by ID
// @route   GET /api/exams/:id
// @access  Private
export const getExamById = asyncHandler(async (req, res) => {
  const exam = await db.exams.findById(req.params.id);
  if (!exam) {
    return sendError(res, 404, 'Exam not found');
  }
  return sendSuccess(res, 200, 'Exam retrieved', exam);
});

// @desc    Create exam
// @route   POST /api/exams
// @access  Private (Admin, Teacher)
export const createExam = asyncHandler(async (req, res) => {
  const {
    name,
    term,
    classId,
    className,
    subjectId,
    subjectName,
    examDate,
    startTime,
    endTime,
    totalMarks = 100,
    passMarks = 40,
  } = req.body;

  if (!name || !classId || !subjectId || !examDate) {
    return sendError(res, 400, 'Exam name, class, subject, and date are required');
  }

  // Prepopulate results with students in this class
  const classStudents = await db.students.find({ classId });
  const initialResults = classStudents.map((st) => ({
    studentId: st._id,
    studentName: `${st.firstName} ${st.lastName}`,
    rollNumber: st.rollNumber,
    marksObtained: 0,
    totalMarks: Number(totalMarks),
    grade: 'N/A',
    remarks: 'Pending Entry',
    status: 'Pending',
  }));

  const exam = await db.exams.create({
    name,
    term: term || 'Mid Term',
    classId,
    className: className || 'Class 1',
    subjectId,
    subjectName: subjectName || 'General',
    examDate,
    startTime: startTime || '09:00 AM',
    endTime: endTime || '11:30 AM',
    totalMarks: Number(totalMarks),
    passMarks: Number(passMarks),
    results: initialResults,
    academicYear: '2025-2026',
    status: 'Scheduled',
  });

  return sendSuccess(res, 201, 'Exam created successfully', exam);
});

// @desc    Update exam marks / results
// @route   PUT /api/exams/:id/results
// @access  Private (Teacher, Admin)
export const updateExamResults = asyncHandler(async (req, res) => {
  const { results, status } = req.body;
  const exam = await db.exams.findById(req.params.id);

  if (!exam) {
    return sendError(res, 404, 'Exam not found');
  }

  const processedResults = (results || []).map((r) => {
    const marks = Number(r.marksObtained) || 0;
    const total = exam.totalMarks || 100;
    const pct = Math.round((marks / total) * 100);
    const { grade, remarks } = calculateGrade(pct);
    const isPass = marks >= (exam.passMarks || 40);

    return {
      studentId: r.studentId,
      studentName: r.studentName,
      rollNumber: r.rollNumber,
      marksObtained: marks,
      totalMarks: total,
      grade,
      remarks: r.remarks || remarks,
      status: r.status === 'Absent' ? 'Absent' : (isPass ? 'Pass' : 'Fail'),
    };
  });

  const updated = await db.exams.findByIdAndUpdate(exam._id, {
    results: processedResults,
    status: status || 'Completed',
  });

  return sendSuccess(res, 200, 'Exam marks saved and calculated successfully', updated);
});

// @desc    Get student complete report card
// @route   GET /api/exams/report-card/:studentId
// @access  Private
export const getStudentReportCard = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const student = await db.students.findById(studentId);
  if (!student) {
    return sendError(res, 404, 'Student not found');
  }

  const allExams = await db.exams.find({ classId: student.classId });
  const reportRecords = [];
  let totalMaxMarks = 0;
  let totalObtained = 0;

  for (const ex of allExams) {
    const resEntry = (ex.results || []).find((r) => r.studentId === studentId);
    if (resEntry && resEntry.marksObtained !== null) {
      totalMaxMarks += ex.totalMarks;
      totalObtained += resEntry.marksObtained;
      reportRecords.push({
        examName: ex.name,
        term: ex.term,
        subjectName: ex.subjectName,
        examDate: ex.examDate,
        totalMarks: ex.totalMarks,
        passMarks: ex.passMarks,
        marksObtained: resEntry.marksObtained,
        grade: resEntry.grade,
        remarks: resEntry.remarks,
        status: resEntry.status,
      });
    }
  }

  const overallPercentage = totalMaxMarks > 0 ? Math.round((totalObtained / totalMaxMarks) * 100) : 0;
  const overallGrade = calculateGrade(overallPercentage);

  return sendSuccess(res, 200, 'Report card generated', {
    student,
    academicYear: '2025-2026',
    records: reportRecords,
    summary: {
      totalMaxMarks,
      totalObtained,
      percentage: overallPercentage,
      grade: overallGrade.grade,
      overallRemarks: overallGrade.remarks,
      resultStatus: overallPercentage >= 40 ? 'PASSED' : 'FAILED',
    },
  });
});

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private (Teacher, Admin)
export const deleteExam = asyncHandler(async (req, res) => {
  const deleted = await db.exams.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return sendError(res, 404, 'Exam not found');
  }
  return sendSuccess(res, 200, 'Exam deleted successfully');
});
