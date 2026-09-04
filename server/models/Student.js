import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    admissionNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    rollNumber: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: String,
    dateOfBirth: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      default: 'O+',
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
    academicYear: {
      type: String,
      default: '2025-2026',
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    parentInfo: {
      parentId: String,
      fatherName: String,
      motherName: String,
      guardianName: String,
      parentEmail: String,
      parentPhone: String,
      occupation: String,
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    documents: [
      {
        title: String,
        fileUrl: String,
        uploadDate: String,
      },
    ],
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended', 'Graduated'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

export const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
export default Student;
