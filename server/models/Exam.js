import mongoose from 'mongoose';

const examResultSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    rollNumber: String,
    marksObtained: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      default: 100,
    },
    grade: String,
    remarks: String,
    status: {
      type: String,
      enum: ['Pass', 'Fail', 'Absent'],
      default: 'Pass',
    },
  }
);

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    term: {
      type: String,
      enum: ['Mid Term', 'Final Term', 'Unit Test 1', 'Unit Test 2', 'Quarterly'],
      default: 'Mid Term',
    },
    classId: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      required: true,
    },
    subjectId: {
      type: String,
      required: true,
    },
    subjectName: {
      type: String,
      required: true,
    },
    examDate: {
      type: String,
      required: true,
    },
    startTime: String,
    endTime: String,
    totalMarks: {
      type: Number,
      default: 100,
    },
    passMarks: {
      type: Number,
      default: 40,
    },
    results: [examResultSchema],
    academicYear: {
      type: String,
      default: '2025-2026',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Ongoing', 'Completed', 'Published'],
      default: 'Scheduled',
    },
  },
  {
    timestamps: true,
  }
);

export const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
export default Exam;
