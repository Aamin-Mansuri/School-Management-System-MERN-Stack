import mongoose from 'mongoose';

const parentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    occupation: String,
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    children: [
      {
        studentId: String,
        studentName: String,
        admissionNumber: String,
        className: String,
        sectionName: String,
        relationship: {
          type: String,
          enum: ['Father', 'Mother', 'Guardian'],
          default: 'Guardian',
        },
      },
    ],
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

export const Parent = mongoose.models.Parent || mongoose.model('Parent', parentSchema);
export default Parent;
