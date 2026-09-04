import { db, generateId } from '../data/store.js';

/**
 * Enterprise Audit Logger Utility
 * Records immutable, structured security events for administrative operations.
 */
export const logAuditEvent = async ({
  actor,
  action,
  category = 'System Security',
  severity = 'MEDIUM',
  target = {},
  changes = null,
  details = '',
  status = 'SUCCESS',
  ipAddress = '127.0.0.1',
  userAgent = 'EduPulse/Enterprise Admin Console',
}) => {
  try {
    const actorData = actor
      ? {
          id: actor._id || actor.id || 'system',
          name: actor.name || 'System Administrator',
          email: actor.email || 'system@edupulse.edu',
          role: actor.role || 'Super Admin',
          avatar: actor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        }
      : {
          id: 'system',
          name: 'System Kernel',
          email: 'security@edupulse.edu',
          role: 'Super Admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        };

    const auditEntry = {
      _id: generateId(),
      eventHash: `LOG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      actor: actorData,
      action,
      category,
      severity, // 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
      target: {
        id: target.id || target._id || '',
        name: target.name || target.title || '',
        email: target.email || '',
        type: target.type || 'Entity',
        summary: target.summary || '',
        ...target,
      },
      changes: changes ? { before: changes.before || null, after: changes.after || null } : null,
      details: details || `Performed action: ${action}`,
      status, // 'SUCCESS' | 'FAILURE' | 'WARNING'
      ipAddress,
      userAgent,
    };

    const created = await db.auditLogs.create(auditEntry);
    return created;
  } catch (err) {
    console.error('[Audit Logger Error] Failed to persist audit log:', err.message);
    return null;
  }
};

/**
 * Express middleware helper to log action from request context
 */
export const logFromReq = (req, eventOptions) => {
  const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'EduPulse Web Client';

  return logAuditEvent({
    actor: req.user,
    ipAddress,
    userAgent,
    ...eventOptions,
  });
};
