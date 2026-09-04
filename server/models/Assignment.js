import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
  fileUrl: String,
  fileName: String,
  content: String,
  marksObtained: Number,
  feedback: String,
  status: {
    type: String,
    enum: ['Submitted', 'Graded', 'Late', 'Resubmission Requested'],
    default: 'Submitted',
  },
});

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    classId: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      required: true,
    },
    sectionId: String,
    sectionName: String,
    subjectId: {
      type: String,
      required: true,
    },
    subjectName: {
      type: String,
      required: true,
    },
    teacherId: {
      type: String,
      required: true,
    },
    teacherName: {
      type: String,
      required: true,
    },
    dueDate: {
      type: String,
      required: true,
    },
    totalMarks: {
      type: Number,
      default: 100,
    },
    attachmentUrl: String,
    submissions: [submissionSchema],
    status: {
      type: String,
      enum: ['Active', 'Closed', 'Draft'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

export const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);
export default Assignment;
