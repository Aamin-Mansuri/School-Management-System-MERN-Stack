import { db } from '../data/store.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
export const getSubjects = asyncHandler(async (req, res) => {
  const { classId, teacherId } = req.query;
  let query = {};
  if (classId) query.classId = classId;
  if (teacherId) query.teacherId = teacherId;

  const subjects = await db.subjects.find(query);
  return sendSuccess(res, 200, 'Subjects fetched successfully', subjects);
});

// @desc    Create subject
// @route   POST /api/subjects
// @access  Private (Admin)
export const createSubject = asyncHandler(async (req, res) => {
  const { name, code, type, classId, className, teacherId, teacherName, totalMarks, passMarks, description } = req.body;

  if (!name || !code || !classId) {
    return sendError(res, 400, 'Subject name, code, and class are required');
  }

  const subject = await db.subjects.create({
    name,
    code,
    type: type || 'Theory',
    classId,
    className: className || 'Class 1',
    teacherId: teacherId || '',
    teacherName: teacherName || '',
    totalMarks: totalMarks || 100,
    passMarks: passMarks || 40,
    description: description || '',
    status: 'Active',
  });

  return sendSuccess(res, 201, 'Subject created successfully', subject);
});

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin)
export const updateSubject = asyncHandler(async (req, res) => {
  const updated = await db.subjects.findByIdAndUpdate(req.params.id, req.body);
  if (!updated) {
    return sendError(res, 404, 'Subject not found');
  }
  return sendSuccess(res, 200, 'Subject updated successfully', updated);
});

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin)
export const deleteSubject = asyncHandler(async (req, res) => {
  const deleted = await db.subjects.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return sendError(res, 404, 'Subject not found');
  }
  return sendSuccess(res, 200, 'Subject deleted successfully');
});
