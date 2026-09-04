import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Trash2,
  RefreshCw,
  Eye,
  AlertTriangle,
  Clock,
  UserCheck,
  UserX,
  Key,
  Database,
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  FileText,
  Copy,
  Check,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  X,
  Info,
  Calendar,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const formatAuditValue = (value, fallback = '-') => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => formatAuditValue(item)).join(', ');
  }
  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([key, val]) => {
        const label = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (char) => char.toUpperCase());
        return `${label}: ${formatAuditValue(val)}`;
      })
      .join(' • ');
  }
  return fallback;
};

const auditValueTitle = (value) => {
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value, null, 2); } catch { return ''; }
};

export const AuditLogView = ({ showToast }) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [selectedRole, setSelectedRole] = useState('All');
  const [quickFilter, setQuickFilter] = useState('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 15;

  // Selected Log for Inspection Modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Retention / Purge Modal
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [retentionDays, setRetentionDays] = useState('30');
  const [purgeConfirmation, setPurgeConfirmation] = useState('');
  const [isPurging, setIsPurging] = useState(false);

  // Custom Log Modal
  const [isCustomLogModalOpen, setIsCustomLogModalOpen] = useState(false);
  const [customLogForm, setCustomLogForm] = useState({
    action: 'SECURITY_AUDIT_NOTE',
    category: 'System Security',
    severity: 'MEDIUM',
    details: '',
  });

  const categories = [
    'All',
    'User Management',
    'Access & Permissions',
    'Student & Guardian',
    'Academic & Faculty',
    'Financial & Billing',
    'System Security',
  ];

  const severities = ['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  // Fetch stats & logs
  const fetchAuditData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);

    try {
      // Build query params
      const params = {
        page,
        limit,
        timeframe: selectedTimeframe,
      };

      if (search) params.search = search;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedSeverity !== 'All') params.severity = selectedSeverity;
      if (selectedRole !== 'All') params.actorRole = selectedRole;

      // Handle Quick Filter overrides
      if (quickFilter === 'deletions') {
        params.action = 'USER_DELETED';
      } else if (quickFilter === 'permissions') {
        params.category = 'Access & Permissions';
      } else if (quickFilter === 'critical') {
        params.severity = 'CRITICAL';
      } else if (quickFilter === 'students') {
        params.category = 'Student & Guardian';
      }

      const [logsRes, statsRes] = await Promise.all([
        api.get('/audit-logs', { params }),
        api.get('/audit-logs/stats'),
      ]);

      if (logsRes.data?.success) {
        setLogs(logsRes.data.data.logs || []);
        setTotalPages(logsRes.data.data.pagination?.pages || 1);
        setTotalCount(logsRes.data.data.pagination?.total || 0);
      }

      if (statsRes.data?.success) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      showToast?.({
        type: 'error',
        title: 'Audit Log Error',
        message: err.response?.data?.message || 'Failed to load system audit trail.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, [page, selectedCategory, selectedSeverity, selectedTimeframe, selectedRole, quickFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchAuditData();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Export CSV or JSON
  const handleExport = async (format = 'csv') => {
    try {
      if (format === 'csv') {
        const response = await api.get('/audit-logs/export?format=csv', { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `edupulse-audit-report-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        const response = await api.get('/audit-logs/export?format=json');
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(response.data.data, null, 2));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = `edupulse-audit-export-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      showToast?.({
        type: 'success',
        title: 'Export Generated',
        message: `Audit report exported successfully in ${format.toUpperCase()} format.`,
      });
      fetchAuditData(true);
    } catch (err) {
      console.error('Export failed:', err);
      showToast?.({
        type: 'error',
        title: 'Export Failed',
        message: 'Could not generate audit report download.',
      });
    }
  };

  // Execute Purge
  const handlePurgeLogs = async () => {
    if (retentionDays === 'all' && purgeConfirmation !== 'PURGE ALL') {
      showToast?.({
        type: 'error',
        title: 'Confirmation Mismatch',
        message: 'Type "PURGE ALL" to confirm clearing the complete audit store.',
      });
      return;
    }

    setIsPurging(true);
    try {
      const payload = retentionDays === 'all' ? {} : { retentionDays: Number(retentionDays) };
      const res = await api.delete('/audit-logs/clear', { data: payload });

      if (res.data?.success) {
        showToast?.({
          type: 'success',
          title: 'Retention Policy Applied',
          message: res.data.message,
        });
        setIsPurgeModalOpen(false);
        setPurgeConfirmation('');
        fetchAuditData();
      }
    } catch (err) {
      showToast?.({
        type: 'error',
        title: 'Retention Action Failed',
        message: err.response?.data?.message || 'Could not process audit log retention cleanup.',
      });
    } finally {
      setIsPurging(false);
    }
  };

  // Submit Manual Custom Security Log
  const handleCreateCustomLog = async (e) => {
    e.preventDefault();
    if (!customLogForm.details.trim()) {
      showToast?.({ type: 'warning', title: 'Details Required', message: 'Please provide note description.' });
      return;
    }

    try {
      const res = await api.post('/audit-logs', {
        action: customLogForm.action,
        category: customLogForm.category,
        severity: customLogForm.severity,
        details: customLogForm.details,
        target: { type: 'AdministrativeIncident', name: 'Manual Security Notice' },
      });

      if (res.data?.success) {
        showToast?.({
          type: 'success',
          title: 'Audit Entry Committed',
          message: 'Security event has been written to the immutable ledger.',
        });
        setIsCustomLogModalOpen(false);
        setCustomLogForm({
          action: 'SECURITY_AUDIT_NOTE',
          category: 'System Security',
          severity: 'MEDIUM',
          details: '',
        });
        fetchAuditData(true);
      }
    } catch (err) {
      showToast?.({
        type: 'error',
        title: 'Action Failed',
        message: 'Could not record audit entry.',
      });
    }
  };

  // Copy Hash Helper
  const handleCopyHash = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Format Helper
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Severity Styling helper
  const getSeverityBadge = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400 animate-pulse"></span>
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400"></span>
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
            MEDIUM
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            LOW
          </span>
        );
    }
  };

  // Action Badge Helper
  const getActionBadge = (action) => {
    const isDelete = action?.includes('DELETE') || action?.includes('REMOVE') || action?.includes('PURGED');
    const isPermission = action?.includes('PERMISSION') || action?.includes('ROLE') || action?.includes('ACTIVATED') || action?.includes('DEACTIVATED');
    const isSecurity = action?.includes('PASSWORD') || action?.includes('SECURITY') || action?.includes('RESET');

    let icon = <Info className="w-3.5 h-3.5" />;
    let colorClass = 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';

    if (isDelete) {
      icon = <UserX className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />;
      colorClass = 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50';
    } else if (isPermission) {
      icon = <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      colorClass = 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50';
    } else if (isSecurity) {
      icon = <ShieldAlert className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
      colorClass = 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/50';
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border ${colorClass}`}>
        {icon}
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Audit Logs & Security Trail
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Tamper-Evident Ledger
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Immutable chronological ledger recording all sensitive administrative activities, user lifecycle changes, permission escalations, guardian updates, and system operations for security governance and institutional compliance.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-center">
            <button
              id="refresh-audit-logs-btn"
              onClick={() => fetchAuditData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-xs"
              title="Refresh logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
              Refresh
            </button>

            {/* Export Dropdown / Buttons */}
            <button
              id="export-csv-audit-btn"
              onClick={() => handleExport('csv')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Export CSV
            </button>

            <button
              id="export-json-audit-btn"
              onClick={() => handleExport('json')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Export JSON
            </button>

            {user?.role === 'Super Admin' && (
              <>
                <button
                  id="record-audit-note-btn"
                  onClick={() => setIsCustomLogModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Log Incident Note
                </button>

                <button
                  id="retention-policy-btn"
                  onClick={() => setIsPurgeModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100/60 transition-colors shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  Retention Policy
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Security Executive KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Logged Events</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats ? stats.totalLogs : '...'}
            </span>
            <span className="text-xs text-slate-500">ledger records</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{stats?.todayCount || 0} events recorded today</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Critical Actions</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {stats ? stats.criticalCount : '...'}
            </span>
            <span className="text-xs text-slate-500">high impact</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>Includes user & student deletions</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Permission & Role Changes</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats ? stats.permissionChangesCount : '...'}
            </span>
            <span className="text-xs text-slate-500">escalations</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>Privilege & status modifications</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Data Deletions</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats ? stats.deletionsCount : '...'}
            </span>
            <span className="text-xs text-slate-500">entities purged</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>Permanent removal audits</span>
          </div>
        </div>
      </div>

      {/* Quick Filter Chips Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          Quick Triage:
        </span>
        <button
          onClick={() => {
            setQuickFilter('all');
            setSelectedCategory('All');
            setSelectedSeverity('All');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            quickFilter === 'all' && selectedCategory === 'All' && selectedSeverity === 'All'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          All Activity
        </button>

        <button
          onClick={() => {
            setQuickFilter('deletions');
            setSelectedCategory('All');
            setSelectedSeverity('All');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all inline-flex items-center gap-1.5 ${
            quickFilter === 'deletions'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-50'
          }`}
        >
          <UserX className="w-3.5 h-3.5" />
          User & Record Deletions
        </button>

        <button
          onClick={() => {
            setQuickFilter('permissions');
            setSelectedCategory('Access & Permissions');
            setSelectedSeverity('All');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all inline-flex items-center gap-1.5 ${
            quickFilter === 'permissions' || selectedCategory === 'Access & Permissions'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-50'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          Role & Permission Escalations
        </button>

        <button
          onClick={() => {
            setQuickFilter('critical');
            setSelectedSeverity('CRITICAL');
            setSelectedCategory('All');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all inline-flex items-center gap-1.5 ${
            selectedSeverity === 'CRITICAL'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          Critical Severity Only
        </button>

        <button
          onClick={() => {
            setQuickFilter('students');
            setSelectedCategory('Student & Guardian');
            setSelectedSeverity('All');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all inline-flex items-center gap-1.5 ${
            selectedCategory === 'Student & Guardian'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          Student & Guardian Operations
        </button>
      </div>

      {/* Multi-Dimensional Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Live Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="audit-search-input"
              type="text"
              placeholder="Search by actor, target entity, event hash, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <select
              id="audit-category-filter"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setQuickFilter('custom');
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Categories</option>
              {categories.slice(1).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              id="audit-severity-filter"
              value={selectedSeverity}
              onChange={(e) => {
                setSelectedSeverity(e.target.value);
                setQuickFilter('custom');
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Only</option>
              <option value="MEDIUM">Medium Only</option>
              <option value="LOW">Low Only</option>
            </select>
          </div>

          {/* Timeframe Filter */}
          <div>
            <select
              id="audit-timeframe-filter"
              value={selectedTimeframe}
              onChange={(e) => {
                setSelectedTimeframe(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Time History</option>
              <option value="today">Today (Last 24h)</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Audit Trail Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Tamper-Evident Event Ledger
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
              {totalCount} events logged
            </span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline-block">
            Chronological audit ordering (Newest first)
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold text-slate-500">Querying cryptographic audit store...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Audit Events Match Filters</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              No matching activity was discovered in the selected timeframe or filter category.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setSelectedSeverity('All');
                setSelectedTimeframe('all');
                setQuickFilter('all');
              }}
              className="mt-3.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Timestamp & Hash</th>
                  <th className="py-3 px-4">Administrative Actor</th>
                  <th className="py-3 px-4">Action & Severity</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Event Details / Delta</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {logs.map((log) => {
                  const isCritical = log.severity === 'CRITICAL';
                  return (
                    <tr
                      key={log._id || log.eventHash}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors ${
                        isCritical ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Timestamp & Hash */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {new Date(log.timestamp || log.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {new Date(log.timestamp || log.createdAt).toLocaleDateString()}
                          </span>
                          <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                            {log.eventHash || 'LOG-HASH'}
                          </span>
                        </div>
                      </td>

                      {/* Actor Profile */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={log.actor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={log.actor?.name || 'Admin'}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {log.actor?.name || 'System Administrator'}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {log.actor?.role || 'Admin'}
                              </span>
                              <span className="text-[10px] text-slate-400">{log.actor?.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action & Severity */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1.5">
                          {getActionBadge(log.action)}
                          {getSeverityBadge(log.severity)}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {log.category || 'General'}
                        </span>
                      </td>

                      {/* Target Entity */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-white">
                            {log.target?.name || log.target?.title || 'System Core'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Type: <span className="font-mono text-slate-600 dark:text-slate-400">{log.target?.type || 'Record'}</span>
                            {log.target?.admissionNumber ? ` • ${log.target?.admissionNumber}` : ''}
                          </span>
                        </div>
                      </td>

                      {/* Details / Delta */}
                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-slate-700 dark:text-slate-300 text-xs truncate" title={auditValueTitle(log.details)}>
                          {formatAuditValue(log.details)}
                        </p>
                        {log.changes && (
                          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-mono mt-0.5 truncate">
                            Delta: {JSON.stringify(log.changes.after || log.changes)}
                          </div>
                        )}
                      </td>

                      {/* Action / Inspect */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 hover:border-indigo-200 text-xs font-semibold transition-colors shadow-2xs"
                          title="Inspect detailed cryptographic payload"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-900 dark:text-white">{logs.length}</span> of{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{totalCount}</span> total audit events
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-slate-700 dark:text-slate-200">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Compliance & Security Governance Note */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-start gap-3">
          <Shield className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Audit Compliance & Data Integrity Standards:
            </span>{' '}
            All logged records are cryptographically tagged with unique event hashes, timestamped at execution time, and cannot be modified retroactively. User deletions and permission escalations are subject to mandatory 365-day security retention.
          </div>
        </div>
      </div>

      {/* MODAL 1: Detail Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Audit Event Inspection
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono mt-0.5">
                    <span>{selectedLog.eventHash}</span>
                    <button
                      onClick={() => handleCopyHash(selectedLog.eventHash)}
                      className="p-1 hover:text-indigo-600"
                      title="Copy Event Hash"
                    >
                      {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              {/* Event Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Severity</span>
                  <div className="mt-1">{getSeverityBadge(selectedLog.severity)}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Category</span>
                  <div className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{selectedLog.category}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Timestamp</span>
                  <div className="mt-1 font-medium text-slate-700 dark:text-slate-300">
                    {new Date(selectedLog.timestamp || selectedLog.createdAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Status</span>
                  <div className="mt-1 font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {selectedLog.status || 'SUCCESS'}
                  </div>
                </div>
              </div>

              {/* Actor & Execution Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    Administrative Actor
                  </h4>
                  <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400">Name:</span> <strong className="text-slate-900 dark:text-white">{selectedLog.actor?.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Email:</span> {selectedLog.actor?.email}
                    </div>
                    <div>
                      <span className="text-slate-400">Role:</span>{' '}
                      <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold text-[10px]">
                        {selectedLog.actor?.role}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Client IP:</span> <code className="text-indigo-600">{selectedLog.ipAddress || '127.0.0.1'}</code>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-indigo-600" />
                    Target Subject Entity
                  </h4>
                  <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400">Target Name:</span> <strong className="text-slate-900 dark:text-white">{formatAuditValue(selectedLog.target?.name, 'N/A')}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Entity Type:</span> <code className="text-amber-600">{formatAuditValue(selectedLog.target?.type, 'Record')}</code>
                    </div>
                    {selectedLog.target?.email && (
                      <div>
                        <span className="text-slate-400">Email:</span> {formatAuditValue(selectedLog.target.email)}
                      </div>
                    )}
                    {selectedLog.target?.admissionNumber && (
                      <div>
                        <span className="text-slate-400">Adm No:</span> {formatAuditValue(selectedLog.target.admissionNumber)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Description */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5">Action Narrative</h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{formatAuditValue(selectedLog.details)}</p>
              </div>

              {/* Delta Changes / Diff */}
              {selectedLog.changes && (
                <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/50">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                    Field Modification Delta (Before & After)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
                    <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-rose-600 font-semibold block mb-1">State Before:</span>
                      <pre className="text-slate-600 dark:text-slate-400 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.changes.before, null, 2)}
                      </pre>
                    </div>
                    <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-emerald-600 font-semibold block mb-1">State After:</span>
                      <pre className="text-slate-600 dark:text-slate-400 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.changes.after, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Full JSON Payload */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Raw Immutable Audit Payload (JSON):
                </span>
                <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto max-h-40">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Purge / Retention Policy Modal (Super Admin Only) */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/30">
              <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-300">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold">Audit Retention & Purge Management</h3>
              </div>
              <button
                onClick={() => setIsPurgeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Configure log retention cleanup. Note that executing a purge will automatically write a high-priority <strong className="text-rose-600 font-mono">AUDIT_LOGS_PURGED</strong> record to maintain security traceability.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Retention Policy Scope:
                </label>
                <select
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  <option value="90">Purge records older than 90 Days</option>
                  <option value="60">Purge records older than 60 Days</option>
                  <option value="30">Purge records older than 30 Days</option>
                  <option value="7">Purge records older than 7 Days (Testing mode)</option>
                  <option value="all">Purge ALL Historical Records (Caution)</option>
                </select>
              </div>

              {retentionDays === 'all' && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
                  <p className="font-semibold mb-1">Warning: Complete Ledger Purge</p>
                  <p className="text-[11px] mb-2">Type <strong>PURGE ALL</strong> below to confirm:</p>
                  <input
                    type="text"
                    placeholder="PURGE ALL"
                    value={purgeConfirmation}
                    onChange={(e) => setPurgeConfirmation(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 rounded-lg text-xs font-mono"
                  />
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-2">
              <button
                onClick={() => setIsPurgeModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handlePurgeLogs}
                disabled={isPurging}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-xs disabled:opacity-50"
              >
                {isPurging ? 'Executing Policy...' : 'Apply Retention Policy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Manual Incident Note Modal */}
      {isCustomLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-950/30">
              <div className="flex items-center gap-2.5 text-indigo-700 dark:text-indigo-300">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold">Record Administrative Security Incident</h3>
              </div>
              <button
                onClick={() => setIsCustomLogModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomLog} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Action Identifier:
                </label>
                <input
                  type="text"
                  value={customLogForm.action}
                  onChange={(e) => setCustomLogForm({ ...customLogForm, action: e.target.value })}
                  placeholder="e.g. MANUAL_SECURITY_AUDIT, POLICY_EXCEPTION_AUTHORIZED"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category:
                  </label>
                  <select
                    value={customLogForm.category}
                    onChange={(e) => setCustomLogForm({ ...customLogForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    {categories.slice(1).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Severity Level:
                  </label>
                  <select
                    value={customLogForm.severity}
                    onChange={(e) => setCustomLogForm({ ...customLogForm, severity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Incident Description & Justification:
                </label>
                <textarea
                  rows={4}
                  value={customLogForm.details}
                  onChange={(e) => setCustomLogForm({ ...customLogForm, details: e.target.value })}
                  placeholder="Detail the reason for manual administrative logging or security verification note..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  required
                ></textarea>
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-2 -mx-5 -mb-5 mt-4">
                <button
                  type="button"
                  onClick={() => setIsCustomLogModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  Write to Audit Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
