import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    numericGrade: {
      type: Number,
      required: true,
    },
    sections: [
      {
        sectionId: String,
        name: String,
        capacity: Number,
        roomNumber: String,
        classTeacherId: String,
        classTeacherName: String,
      },
    ],
    subjects: [
      {
        subjectId: String,
        name: String,
        code: String,
        teacherId: String,
        teacherName: String,
      },
    ],
    academicYear: {
      type: String,
      default: '2025-2026',
    },
    capacity: {
      type: Number,
      default: 40,
    },
    status: {
      type: String,
      enum: ['Active', 'Archived'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

export const Class = mongoose.models.Class || mongoose.model('Class', classSchema);
export default Class;
