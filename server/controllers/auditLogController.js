import { db } from '../data/store.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { logAuditEvent, logFromReq } from '../utils/auditLogger.js';

// @desc    Get all audit logs with multi-dimensional filtering & pagination
// @route   GET /api/audit-logs
// @access  Private (Super Admin, School Admin, Principal)
export const getAuditLogs = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    severity,
    actorRole,
    action,
    timeframe,
    startDate,
    endDate,
    page = 1,
    limit = 25,
  } = req.query;

  let query = {};
  if (category && category !== 'All') query.category = category;
  if (severity && severity !== 'All') query.severity = severity;
  if (action && action !== 'All') query.action = action;

  let logs = await db.auditLogs.find(query);

  // Timeframe filter
  if (timeframe && timeframe !== 'all') {
    const now = new Date();
    let cutoff = new Date(0);
    if (timeframe === 'today') {
      cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (timeframe === '7days') {
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === '30days') {
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    logs = logs.filter((l) => new Date(l.timestamp || l.createdAt) >= cutoff);
  }

  if (startDate) {
    const start = new Date(startDate);
    logs = logs.filter((l) => new Date(l.timestamp || l.createdAt) >= start);
  }
  if (endDate) {
    const end = new Date(endDate);
    logs = logs.filter((l) => new Date(l.timestamp || l.createdAt) <= end);
  }

  // Actor role filter
  if (actorRole && actorRole !== 'All') {
    logs = logs.filter((l) => l.actor?.role === actorRole);
  }

  // Free-text search
  if (search) {
    const s = search.toLowerCase().trim();
    logs = logs.filter((l) => {
      const actorName = l.actor?.name?.toLowerCase() || '';
      const actorEmail = l.actor?.email?.toLowerCase() || '';
      const targetName = l.target?.name?.toLowerCase() || '';
      const targetEmail = l.target?.email?.toLowerCase() || '';
      const actionName = l.action?.toLowerCase() || '';
      const categoryName = l.category?.toLowerCase() || '';
      const details = typeof l.details === 'string' ? l.details.toLowerCase() : JSON.stringify(l.details || {}).toLowerCase();
      const eventHash = l.eventHash?.toLowerCase() || '';

      return (
        actorName.includes(s) ||
        actorEmail.includes(s) ||
        targetName.includes(s) ||
        targetEmail.includes(s) ||
        actionName.includes(s) ||
        categoryName.includes(s) ||
        details.includes(s) ||
        eventHash.includes(s)
      );
    });
  }

  // Sort newest first
  logs.sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));

  const total = logs.length;
  const startIndex = (page - 1) * limit;
  const paginated = logs.slice(startIndex, startIndex + Number(limit));

  return sendSuccess(res, 200, 'Audit logs retrieved successfully', {
    logs: paginated,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit) || 1,
    },
  });
});

// @desc    Get executive audit & security statistics
// @route   GET /api/audit-logs/stats
// @access  Private (Super Admin, School Admin, Principal)
export const getAuditStats = asyncHandler(async (req, res) => {
  const allLogs = await db.auditLogs.find({});

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const totalLogs = allLogs.length;
  const criticalCount = allLogs.filter((l) => l.severity === 'CRITICAL').length;
  const highCount = allLogs.filter((l) => l.severity === 'HIGH').length;
  const mediumCount = allLogs.filter((l) => l.severity === 'MEDIUM').length;
  const lowCount = allLogs.filter((l) => l.severity === 'LOW').length;

  const permissionChangesCount = allLogs.filter(
    (l) =>
      l.action?.includes('PERMISSION') ||
      l.action?.includes('ROLE') ||
      l.category === 'Access & Permissions'
  ).length;

  const deletionsCount = allLogs.filter(
    (l) => l.action?.includes('DELETE') || l.action?.includes('REMOVE')
  ).length;

  const todayCount = allLogs.filter((l) => new Date(l.timestamp || l.createdAt) >= todayStart).length;

  // Category distribution
  const categoryCounts = {};
  allLogs.forEach((l) => {
    const cat = l.category || 'General';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Top actors
  const actorCounts = {};
  allLogs.forEach((l) => {
    const actorKey = l.actor?.name || 'System';
    if (!actorCounts[actorKey]) {
      actorCounts[actorKey] = {
        name: actorKey,
        role: l.actor?.role || 'Admin',
        avatar: l.actor?.avatar || '',
        count: 0,
      };
    }
    actorCounts[actorKey].count += 1;
  });

  const topActors = Object.values(actorCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Latest critical alerts (top 5)
  const recentCritical = allLogs
    .filter((l) => l.severity === 'CRITICAL' || l.severity === 'HIGH')
    .sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt))
    .slice(0, 5);

  return sendSuccess(res, 200, 'Audit statistics computed successfully', {
    totalLogs,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    permissionChangesCount,
    deletionsCount,
    todayCount,
    categoryCounts,
    topActors,
    recentCritical,
  });
});

// @desc    Create a custom client audit log entry
// @route   POST /api/audit-logs
// @access  Private (Admin)
export const createAuditLog = asyncHandler(async (req, res) => {
  const { action, category, severity, target, changes, details } = req.body;

  if (!action) {
    return sendError(res, 400, 'Action name is required for audit logging');
  }

  const newLog = await logFromReq(req, {
    action,
    category: category || 'System Security',
    severity: severity || 'MEDIUM',
    target: target || {},
    changes: changes || null,
    details: details || `Manual administrative event recorded: ${action}`,
  });

  return sendSuccess(res, 201, 'Audit event recorded', newLog);
});

// @desc    Export audit logs in JSON or CSV format
// @route   GET /api/audit-logs/export
// @access  Private (Super Admin)
export const exportAuditLogs = asyncHandler(async (req, res) => {
  const { format = 'json' } = req.query;
  const logs = await db.auditLogs.find({});
  logs.sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));

  // Also log the export itself for compliance
  await logFromReq(req, {
    action: 'AUDIT_LOGS_EXPORTED',
    category: 'System Security',
    severity: 'MEDIUM',
    target: { type: 'AuditTrail', name: `Complete Audit Export (${logs.length} records)` },
    details: `Administrator ${req.user?.name} exported ${logs.length} audit trail records in ${format.toUpperCase()} format.`,
  });

  if (format === 'csv') {
    const headers = [
      'Event Hash',
      'Timestamp',
      'Actor Name',
      'Actor Email',
      'Actor Role',
      'Action',
      'Category',
      'Severity',
      'Target Name',
      'Target Type',
      'Details',
      'IP Address',
      'Status',
    ];

    const rows = logs.map((l) => [
      `"${l.eventHash || ''}"`,
      `"${l.timestamp || l.createdAt || ''}"`,
      `"${(l.actor?.name || '').replace(/"/g, '""')}"`,
      `"${(l.actor?.email || '').replace(/"/g, '""')}"`,
      `"${l.actor?.role || ''}"`,
      `"${l.action || ''}"`,
      `"${l.category || ''}"`,
      `"${l.severity || ''}"`,
      `"${(l.target?.name || '').replace(/"/g, '""')}"`,
      `"${l.target?.type || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.ipAddress || ''}"`,
      `"${l.status || 'SUCCESS'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=edupulse-audit-trail-${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  }

  return sendSuccess(res, 200, 'Audit logs export data', {
    exportedAt: new Date().toISOString(),
    recordCount: logs.length,
    logs,
  });
});

// @desc    Purge or archive audit logs (Super Admin Only)
// @route   DELETE /api/audit-logs/clear
// @access  Private (Super Admin)
export const clearAuditLogs = asyncHandler(async (req, res) => {
  const { retentionDays } = req.body;
  const previousCount = await db.auditLogs.countDocuments();

  if (retentionDays && Number(retentionDays) > 0) {
    const cutoff = new Date(Date.now() - Number(retentionDays) * 24 * 60 * 60 * 1000);
    const current = await db.auditLogs.find({});
    const toKeep = current.filter((l) => new Date(l.timestamp || l.createdAt) >= cutoff);
    const purged = current.length - toKeep.length;
    db.auditLogs.items = toKeep;

    await logFromReq(req, {
      action: 'AUDIT_LOGS_RETENTION_APPLIED',
      category: 'System Security',
      severity: 'HIGH',
      target: { type: 'AuditStore', name: 'Log Retention Cleaner' },
      details: `Purged ${purged} logs older than ${retentionDays} days. Retained ${toKeep.length} logs.`,
    });

    return sendSuccess(res, 200, `Purged ${purged} records older than ${retentionDays} days.`, {
      purgedCount: purged,
      remainingCount: toKeep.length,
    });
  }

  // Clear all logs but insert immediate notice of purge
  db.auditLogs.items = [];

  await logFromReq(req, {
    action: 'AUDIT_LOGS_PURGED',
    category: 'System Security',
    severity: 'CRITICAL',
    target: { type: 'AuditStore', name: 'Full Audit Store' },
    details: `Super Administrator ${req.user?.name} initiated complete purge of ${previousCount} audit log records.`,
  });

  return sendSuccess(res, 200, `Audit log archive cleared. Initialized new ledger session.`, {
    purgedCount: previousCount,
  });
});
