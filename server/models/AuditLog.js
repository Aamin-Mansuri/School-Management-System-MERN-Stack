import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    eventHash: { type: String, default: '' },
    timestamp: { type: String, default: () => new Date().toISOString() },
    actor: {
      id: String,
      name: String,
      email: String,
      role: String,
      avatar: String,
    },
    action: { type: String, required: true },
    category: { type: String, default: 'System Security' },
    severity: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
    },
    target: {
      id: String,
      name: String,
      email: String,
      type: String,
      summary: String,
    },
    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed,
    },
    details: { type: String, default: '' },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'WARNING'],
      default: 'SUCCESS',
    },
    ipAddress: { type: String, default: '127.0.0.1' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
