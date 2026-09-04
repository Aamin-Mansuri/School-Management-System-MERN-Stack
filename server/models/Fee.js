import mongoose from 'mongoose';

const paymentHistorySchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentDate: {
    type: String,
    default: () => new Date().toISOString().split('T')[0],
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Bank Transfer', 'Online Portal', 'Cheque'],
    default: 'Online Portal',
  },
  transactionId: String,
  collectedBy: String,
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Failed', 'Refunded'],
    default: 'Completed',
  },
  note: String,
});

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    admissionNumber: String,
    classId: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      required: true,
    },
    feeType: {
      type: String,
      enum: ['Tuition Fee', 'Admission Fee', 'Exam Fee', 'Transport Fee', 'Hostel Fee', 'Library Fee', 'Annual Fee', 'Miscellaneous'],
      default: 'Tuition Fee',
    },
    title: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    lateFee: {
      type: Number,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    dueAmount: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: String,
      required: true,
    },
    academicYear: {
      type: String,
      default: '2025-2026',
    },
    status: {
      type: String,
      enum: ['Paid', 'Unpaid', 'Partially Paid', 'Overdue'],
      default: 'Unpaid',
    },
    payments: [paymentHistorySchema],
  },
  {
    timestamps: true,
  }
);

export const Fee = mongoose.models.Fee || mongoose.model('Fee', feeSchema);
export default Fee;
