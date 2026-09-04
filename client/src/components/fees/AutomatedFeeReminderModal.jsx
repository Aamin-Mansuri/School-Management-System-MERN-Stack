import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Clock,
  Settings,
  History,
  CheckCircle2,
  AlertTriangle,
  Users,
  Search,
  Filter,
  DollarSign,
  Calendar,
  Eye,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Check,
  X,
  FileText,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import api from '../../api/axios';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

export const AutomatedFeeReminderModal = ({ isOpen, onClose, showToast, onReminderSent }) => {
  const [activeTab, setActiveTab] = useState('defaulters'); // 'defaulters' | 'settings' | 'logs'
  const [loading, setLoading] = useState(false);
  const [dispatching, setDispatching] = useState(false);

  // Defaulters state
  const [defaultersData, setDefaultersData] = useState({
    defaulters: [],
    totalDefaulters: 0,
    totalOutstandingAmount: 0,
    overdueCount: 0,
  });
  const [selectedFeeIds, setSelectedFeeIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All'); // 'All' | 'Overdue' | 'Upcoming'

  // Custom options for dispatch
  const [customNote, setCustomNote] = useState('');
  const [escalationLevel, setEscalationLevel] = useState('Standard');

  // Logs state
  const [logs, setLogs] = useState([]);
  const [logsSearch, setLogsSearch] = useState('');

  // Settings state
  const [settings, setSettings] = useState({
    autoRemindersEnabled: true,
    daysBeforeDue: 3,
    autoSendOnOverdue: true,
    escalationAfterDays: 7,
    senderName: 'EduPulse Academy - Accounts & Bursar',
    senderEmail: 'finance@edupulse.edu',
    supportContact: '+1 (555) 342-8900 Ext. 4',
    emailSubjectTemplate: 'Payment Reminder: Outstanding Fee Due for {{studentName}}',
    lastRunTimestamp: null,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Email Preview Modal
  const [previewFeeId, setPreviewFeeId] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDefaulters();
      fetchLogs();
      fetchSettings();
    }
  }, [isOpen]);

  const fetchDefaulters = async () => {
    setLoading(true);
    try {
      const res = await api.get('/fees/reminders/defaulters');
      const data = res.data?.data || {};
      setDefaultersData({
        defaulters: data.defaulters || [],
        totalDefaulters: data.totalDefaulters || 0,
        totalOutstandingAmount: data.totalOutstandingAmount || 0,
        overdueCount: data.overdueCount || 0,
      });
      // By default select all
      setSelectedFeeIds((data.defaulters || []).map((d) => d.feeId));
    } catch (err) {
      console.error('Failed to load defaulters:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get('/fees/reminders/logs');
      setLogs(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get('/fees/reminders/settings');
      if (res.data?.data) {
        setSettings((prev) => ({ ...prev, ...res.data.data }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedFeeIds(filteredDefaulters.map((d) => d.feeId));
    } else {
      setSelectedFeeIds([]);
    }
  };

  const toggleSelectFee = (feeId) => {
    setSelectedFeeIds((prev) =>
      prev.includes(feeId) ? prev.filter((id) => id !== feeId) : [...prev, feeId]
    );
  };

  const handleSendBatch = async (sendAll = false) => {
    const targetIds = sendAll ? null : selectedFeeIds;
    if (!sendAll && (!targetIds || targetIds.length === 0)) {
      showToast?.('Please select at least one student invoice to send reminders', 'error');
      return;
    }

    setDispatching(true);
    try {
      const res = await api.post('/fees/reminders/send-automated', {
        targetFeeIds: targetIds,
        customNote,
        escalationLevel,
      });

      const count = res.data?.data?.dispatchedCount || 0;
      showToast?.(`⚡ Successfully dispatched ${count} automated fee reminder emails to parents!`, 'success');
      fetchDefaulters();
      fetchLogs();
      onReminderSent?.();
    } catch (err) {
      console.error('Failed to dispatch reminders:', err);
      showToast?.(err.response?.data?.message || 'Failed to dispatch email reminders', 'error');
    } finally {
      setDispatching(false);
    }
  };

  const handleSendSingle = async (feeId, studentName) => {
    try {
      await api.post(`/fees/reminders/send-single/${feeId}`, {
        customNote,
        escalationLevel,
      });
      showToast?.(`Email reminder dispatched to parent of ${studentName}`, 'success');
      fetchDefaulters();
      fetchLogs();
      onReminderSent?.();
    } catch (err) {
      console.error('Single send failed:', err);
      showToast?.(err.response?.data?.message || 'Failed to send reminder', 'error');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.put('/fees/reminders/settings', settings);
      showToast?.('Automated fee reminder settings updated successfully', 'success');
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast?.('Failed to update reminder settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleOpenPreview = async (feeId) => {
    setPreviewFeeId(feeId);
    setLoadingPreview(true);
    setIsPreviewOpen(true);
    try {
      const res = await api.post('/fees/reminders/preview', {
        feeId,
        customNote,
      });
      setPreviewHtml(res.data?.data?.html || '');
    } catch (err) {
      console.error('Failed to preview email:', err);
      showToast?.('Failed to load email preview', 'error');
    } finally {
      setLoadingPreview(false);
    }
  };

  // Filter defaulters
  const filteredDefaulters = (defaultersData.defaulters || []).filter((d) => {
    const matchesSearch =
      d.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.parentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.feeTitle.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterCategory === 'Overdue') return d.isOverdue;
    if (filterCategory === 'Upcoming') return !d.isOverdue;
    return true;
  });

  const filteredLogs = logs.filter((l) => {
    return (
      l.studentName?.toLowerCase().includes(logsSearch.toLowerCase()) ||
      l.parentEmail?.toLowerCase().includes(logsSearch.toLowerCase()) ||
      l.feeTitle?.toLowerCase().includes(logsSearch.toLowerCase()) ||
      l.parentName?.toLowerCase().includes(logsSearch.toLowerCase())
    );
  });

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="⚡ Automated Fee Reminder System"
        description="Schedule, configure, and dispatch automated email reminders to parents of students with outstanding dues."
        maxWidth="max-w-5xl"
      >
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Outstanding Dues
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                  ${Number(defaultersData.totalOutstandingAmount).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Students with Dues
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                  {defaultersData.totalDefaulters}
                </span>
                <span className="text-xs text-slate-500">accounts</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Overdue Defaulters
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                  {defaultersData.overdueCount}
                </span>
                <span className="text-xs text-rose-500 font-semibold">critical</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Emails Sent (All Time)
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                  {logs.length}
                </span>
                <span className="text-xs text-emerald-500 font-semibold">delivered</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700/80 space-x-6">
            <button
              onClick={() => setActiveTab('defaulters')}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'defaulters'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Outstanding Invoices & Defaulters
              {defaultersData.totalDefaulters > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                  {defaultersData.totalDefaulters}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              Automation Rules & Schedule
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'logs'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              Dispatch History Logs
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {logs.length}
              </span>
            </button>
          </div>

          {/* TAB 1: Outstanding Defaulters & Instant Send */}
          {activeTab === 'defaulters' && (
            <div className="space-y-4">
              {/* Controls bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search student, parent email, admission..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="py-1.5 px-3 text-xs bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  >
                    <option value="All">All Invoices ({defaultersData.totalDefaulters})</option>
                    <option value="Overdue">Overdue Only ({defaultersData.overdueCount})</option>
                    <option value="Upcoming">Upcoming Due</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenPreview(filteredDefaulters[0]?.feeId)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-500" />
                    Preview Email
                  </button>

                  <button
                    onClick={() => handleSendBatch(false)}
                    disabled={dispatching || selectedFeeIds.length === 0}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {dispatching ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Reminders ({selectedFeeIds.length})
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Optional Custom Note and Escalation options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-indigo-50/40 dark:bg-indigo-950/20 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs">
                <div className="md:col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Custom Announcement / Note from Bursar (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Please clear outstanding balance before next week's exam permit distribution."
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    className="w-full py-1.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Reminder Escalation Tone
                  </label>
                  <select
                    value={escalationLevel}
                    onChange={(e) => setEscalationLevel(e.target.value)}
                    className="w-full py-1.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  >
                    <option value="Standard">Standard Formal Notice</option>
                    <option value="Gentle">Gentle Friendly Reminder</option>
                    <option value="Urgent Overdue Escalation">⚠️ Urgent Overdue Notice</option>
                  </select>
                </div>
              </div>

              {/* Defaulters Table */}
              <div className="border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto max-h-[380px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-10">
                      <tr className="text-slate-500 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={
                              filteredDefaulters.length > 0 &&
                              selectedFeeIds.length === filteredDefaulters.length
                            }
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </th>
                        <th className="p-3">Student & Class</th>
                        <th className="p-3">Parent Contact</th>
                        <th className="p-3">Fee Item & Due Date</th>
                        <th className="p-3 text-right">Outstanding Due</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 bg-white dark:bg-slate-800/90">
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="text-center py-10 text-slate-400">
                            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                            Scanning outstanding fee records...
                          </td>
                        </tr>
                      ) : filteredDefaulters.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-slate-400 dark:text-slate-400">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                            No outstanding fee defaulters found matching your criteria. All accounts clear!
                          </td>
                        </tr>
                      ) : (
                        filteredDefaulters.map((item) => {
                          const isSelected = selectedFeeIds.includes(item.feeId);
                          return (
                            <tr
                              key={item.feeId}
                              className={`hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors ${
                                isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                              }`}
                            >
                              <td className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectFee(item.feeId)}
                                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                              </td>
                              <td className="p-3">
                                <div className="font-bold text-slate-900 dark:text-slate-100">
                                  {item.studentName}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {item.admissionNumber} • {item.className}
                                </div>
                              </td>

                              <td className="p-3">
                                <div className="font-medium text-slate-800 dark:text-slate-200">
                                  {item.parentName}
                                </div>
                                <div className="text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                  <Mail className="w-3 h-3 inline" />
                                  {item.parentEmail}
                                </div>
                              </td>

                              <td className="p-3">
                                <div className="font-medium text-slate-800 dark:text-slate-200">
                                  {item.feeTitle}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3 inline" />
                                  Due: {item.dueDate}
                                </div>
                              </td>

                              <td className="p-3 text-right">
                                <div className="font-extrabold text-slate-900 dark:text-slate-100 font-mono text-sm">
                                  ${Number(item.dueAmount).toLocaleString()}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  Total: ${Number(item.totalAmount).toLocaleString()}
                                </div>
                              </td>

                              <td className="p-3 text-center">
                                {item.isOverdue ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                                    {item.daysOverdue}d Overdue
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    Due in {item.daysRemaining}d
                                  </span>
                                )}

                                {item.reminderCount > 0 && (
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    {item.reminderCount} sent
                                  </div>
                                )}
                              </td>

                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenPreview(item.feeId)}
                                    title="Preview Email"
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => handleSendSingle(item.feeId, item.studentName)}
                                    title="Send Instant Reminder Email"
                                    className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                                  >
                                    <Send className="w-3 h-3" />
                                    Send
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer summary bar */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div>
                    Selected <strong>{selectedFeeIds.length}</strong> of{' '}
                    <strong>{filteredDefaulters.length}</strong> students
                  </div>
                  <div>
                    Selected Due Value:{' '}
                    <strong className="text-slate-900 dark:text-slate-100 font-mono font-bold text-sm">
                      $
                      {filteredDefaulters
                        .filter((d) => selectedFeeIds.includes(d.feeId))
                        .reduce((acc, d) => acc + d.dueAmount, 0)
                        .toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Automation Rules & Settings */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div className="bg-slate-50 dark:bg-slate-800/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Automated Background Dispatch Scheduler
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Enable Automated Scheduler */}
                  <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        Enable Automated Cron Dispatch
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Runs daily background sweep for pending fee notices
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoRemindersEnabled}
                        onChange={(e) =>
                          setSettings((s) => ({ ...s, autoRemindersEnabled: e.target.checked }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Instant Overdue Alert */}
                  <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        Auto-Alert on Overdue Date
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Instant notification when due date passes
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoSendOnOverdue}
                        onChange={(e) =>
                          setSettings((s) => ({ ...s, autoSendOnOverdue: e.target.checked }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Advance Alert Days */}
                  <div className="p-3.5 bg-white dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl">
                    <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      Days Before Due Date to Alert
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={settings.daysBeforeDue}
                        onChange={(e) =>
                          setSettings((s) => ({ ...s, daysBeforeDue: Number(e.target.value) }))
                        }
                        className="w-24 py-1.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <span className="text-slate-500 dark:text-slate-400">
                        days in advance of due date
                      </span>
                    </div>
                  </div>

                  {/* Escalation Interval */}
                  <div className="p-3.5 bg-white dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl">
                    <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      Overdue Escalation Frequency
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={settings.escalationAfterDays}
                        onChange={(e) =>
                          setSettings((s) => ({ ...s, escalationAfterDays: Number(e.target.value) }))
                        }
                        className="w-24 py-1.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <span className="text-slate-500 dark:text-slate-400">
                        days repeat reminder for overdue
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sender & Template Customization */}
              <div className="bg-slate-50 dark:bg-slate-800/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Sender Identity & Email Format Configuration
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Sender Name (From Name)
                    </label>
                    <input
                      type="text"
                      value={settings.senderName}
                      onChange={(e) => setSettings((s) => ({ ...s, senderName: e.target.value }))}
                      className="w-full py-2 px-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Sender Email (Reply-To)
                    </label>
                    <input
                      type="email"
                      value={settings.senderEmail}
                      onChange={(e) => setSettings((s) => ({ ...s, senderEmail: e.target.value }))}
                      className="w-full py-2 px-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Finance Office Contact Helpline
                    </label>
                    <input
                      type="text"
                      value={settings.supportContact}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, supportContact: e.target.value }))
                      }
                      className="w-full py-2 px-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Email Subject Line Template
                    </label>
                    <input
                      type="text"
                      value={settings.emailSubjectTemplate}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, emailSubjectTemplate: e.target.value }))
                      }
                      className="w-full py-2 px-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {savingSettings ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Saving Settings...
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Save Automation Rules
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: Dispatch Logs & History */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search logs by student, email..."
                    value={logsSearch}
                    onChange={(e) => setLogsSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <button
                  onClick={fetchLogs}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh Logs
                </button>
              </div>

              <div className="border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto max-h-[380px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-10">
                      <tr className="text-slate-500 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                        <th className="p-3">Date & Time</th>
                        <th className="p-3">Recipient Parent</th>
                        <th className="p-3">Student & Class</th>
                        <th className="p-3">Fee Invoice</th>
                        <th className="p-3 text-right">Amount Reminded</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3">Dispatched By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 bg-white dark:bg-slate-800/90">
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-slate-400">
                            No dispatch history logs recorded yet.
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log) => (
                          <tr
                            key={log._id || log.id}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
                          >
                            <td className="p-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {log.sentAt ? new Date(log.sentAt).toLocaleString() : 'Just now'}
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-slate-800 dark:text-slate-100">
                                {log.parentName}
                              </div>
                              <div className="text-[11px] text-indigo-600 dark:text-indigo-400">
                                {log.parentEmail}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium text-slate-800 dark:text-slate-200">
                                {log.studentName}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {log.admissionNumber} • {log.className}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium text-slate-800 dark:text-slate-200">
                                {log.feeTitle}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Due: {log.dueDate}
                              </div>
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                              ${Number(log.dueAmount).toLocaleString()}
                            </td>
                            <td className="p-3 text-center">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <Check className="w-3 h-3" />
                                {log.status || 'Delivered'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600 dark:text-slate-300 text-[11px]">
                              {log.sentBy}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Live Email Preview Modal */}
      {isPreviewOpen && (
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title="📧 Responsive Parent Email Preview"
          description="Live rendering of the automated HTML email notification sent to parents' inboxes."
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            {loadingPreview ? (
              <div className="py-16 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                Rendering responsive email template...
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 p-2 sm:p-4">
                <iframe
                  title="Email Preview"
                  srcDoc={previewHtml}
                  className="w-full h-[520px] bg-white rounded-lg shadow-sm border border-slate-200"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
export default AutomatedFeeReminderModal;
