import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
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
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    dateOfBirth: String,
    joiningDate: String,
    qualification: String,
    experience: String,
    department: String,
    designation: {
      type: String,
      default: 'Senior Teacher',
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    assignedClasses: [
      {
        classId: String,
        className: String,
        sectionId: String,
        sectionName: String,
      },
    ],
    assignedSubjects: [
      {
        subjectId: String,
        subjectName: String,
        subjectCode: String,
      },
    ],
    salary: {
      basic: Number,
      allowance: Number,
      total: Number,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Resigned', 'Retired'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

export const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);
export default Teacher;
