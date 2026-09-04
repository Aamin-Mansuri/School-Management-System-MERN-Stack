import { db } from '../data/store.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all classes with sections, capacity, and enrolled student counts
// @route   GET /api/classes
// @access  Private
export const getClasses = asyncHandler(async (req, res) => {
  const classes = await db.classes.find({});
  const students = await db.students.find({});

  // Compute student enrollment counts
  const enriched = classes.map((c) => {
    const classStudents = students.filter((s) => s.classId === c._id);
    const sectionsWithCounts = (c.sections || []).map((sec) => {
      const secCount = classStudents.filter((s) => s.sectionId === sec.sectionId).length;
      return {
        ...sec,
        enrolledCount: secCount,
      };
    });

    return {
      ...c,
      totalStudents: classStudents.length,
      sections: sectionsWithCounts,
    };
  });

  return sendSuccess(res, 200, 'Classes fetched successfully', enriched);
});

// @desc    Get class by ID
// @route   GET /api/classes/:id
// @access  Private
export const getClassById = asyncHandler(async (req, res) => {
  const c = await db.classes.findById(req.params.id);
  if (!c) {
    return sendError(res, 404, 'Class not found');
  }
  const students = await db.students.find({ classId: c._id });
  const subjects = await db.subjects.find({ classId: c._id });

  return sendSuccess(res, 200, 'Class fetched', {
    class: c,
    students,
    subjects,
  });
});

// @desc    Create class
// @route   POST /api/classes
// @access  Private (Admin)
export const createClass = asyncHandler(async (req, res) => {
  const { name, code, numericGrade, capacity = 40, sections } = req.body;
  if (!name || !code) {
    return sendError(res, 400, 'Class name and code are required');
  }

  const defaultSections = sections || [
    { sectionId: 'sec-a', name: 'Section A', capacity: 30, roomNumber: '101' },
    { sectionId: 'sec-b', name: 'Section B', capacity: 30, roomNumber: '102' },
  ];

  const newClass = await db.classes.create({
    name,
    code,
    numericGrade: numericGrade || 1,
    capacity,
    sections: defaultSections,
    academicYear: '2025-2026',
    status: 'Active',
  });

  return sendSuccess(res, 201, 'Class created successfully', newClass);
});

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (Admin)
export const updateClass = asyncHandler(async (req, res) => {
  const updated = await db.classes.findByIdAndUpdate(req.params.id, req.body);
  if (!updated) {
    return sendError(res, 404, 'Class not found');
  }
  return sendSuccess(res, 200, 'Class updated successfully', updated);
});

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (Admin)
export const deleteClass = asyncHandler(async (req, res) => {
  const deleted = await db.classes.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return sendError(res, 404, 'Class not found');
  }
  return sendSuccess(res, 200, 'Class deleted successfully');
});
