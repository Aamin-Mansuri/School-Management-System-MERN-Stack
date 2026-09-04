import mongoose from 'mongoose';

const roleRequestSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    userAvatar: { type: String, default: '' },
    currentRole: { type: String, required: true },
    requestedRole: { type: String, required: true },
    reason: { type: String, default: '' },
    qualification: { type: String, default: '' },
    department: { type: String, default: '' },
    employeeOrRegId: { type: String, default: '' },
    requiredApprover: { type: String, default: 'Principal' },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    grantedRole: { type: String, default: '' },
    reviewedBy: {
      id: String,
      name: String,
      role: String,
    },
    reviewNotes: { type: String, default: '' },
    reviewedAt: { type: String, default: '' },
  },
  { timestamps: true }
);

export const RoleRequest = mongoose.models.RoleRequest || mongoose.model('RoleRequest', roleRequestSchema);
export default RoleRequest;
