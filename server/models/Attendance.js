import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
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
    sectionId: {
      type: String,
      required: true,
    },
    sectionName: {
      type: String,
      required: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    rollNumber: String,
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Half Day', 'Leave'],
      default: 'Present',
    },
    remark: String,
    markedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index
attendanceSchema.index({ date: 1, studentId: 1 }, { unique: true });

export const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
export default Attendance;
