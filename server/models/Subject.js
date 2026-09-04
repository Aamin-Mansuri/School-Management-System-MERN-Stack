import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Theory', 'Practical', 'Both'],
      default: 'Theory',
    },
    classId: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      required: true,
    },
    teacherId: String,
    teacherName: String,
    totalMarks: {
      type: Number,
      default: 100,
    },
    passMarks: {
      type: Number,
      default: 40,
    },
    description: String,
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

export const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
export default Subject;
