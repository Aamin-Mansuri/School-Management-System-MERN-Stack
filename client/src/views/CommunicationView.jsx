import React, { useState, useEffect } from 'react';
import {
  Bell,
  Calendar,
  MessageSquare,
  Plus,
  Pin,
  Send,
  User,
  Trash2,
  Search,
  FileText,
  Printer,
  Copy,
  CheckCircle2,
  Filter,
  Eye,
  AlertCircle,
  Clock,
  Sparkles,
  Building2,
  ShieldCheck,
  Download,
} from 'lucide-react';
import api from '../api/axios';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

export const CommunicationView = ({ showToast }) => {
  const { user, isStudent, isParent, isTeacher, isSuperAdmin, isSchoolAdmin, isPrincipal } = useAuth();
  const canPublish = isSuperAdmin || isSchoolAdmin || isPrincipal || isTeacher;

  const [subTab, setSubTab] = useState('notices');
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');

  // Modals
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [activeCircular, setActiveCircular] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  // Forms
  const [noticeForm, setNoticeForm] = useState({
    circularNumber: '',
    title: '',
    category: 'Academic & Curriculum',
    content: '',
    targetAudience: 'All',
    priority: 'Medium',
    effectiveDate: new Date().toISOString().split('T')[0],
    isPinned: false,
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    eventType: 'Academic',
    startDate: '2026-09-01',
    endDate: '2026-09-01',
    location: 'Main Auditorium',
  });

  const [msgForm, setMsgForm] = useState({
    recipientName: 'Dr. Arthur Sterling',
    recipientRole: 'Super Admin',
    subject: '',
    body: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [noticesRes, eventsRes, msgsRes] = await Promise.all([
        api.get('/operations/notices'),
        api.get('/operations/events'),
        api.get('/operations/messages'),
      ]);
      setNotices(Array.isArray(noticesRes.data?.data) ? noticesRes.data.data : (noticesRes.data?.data?.notices || []));
      setEvents(Array.isArray(eventsRes.data?.data) ? eventsRes.data.data : (eventsRes.data?.data?.events || []));
      setMessages(Array.isArray(msgsRes.data?.data) ? msgsRes.data.data : (msgsRes.data?.data?.messages || []));
    } catch (e) {
      showToast?.({ type: 'error', message: 'Failed to load communication feed' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/operations/notices', noticeForm);
      setNotices((prev) => [res.data.data, ...prev]);
      setIsNoticeModalOpen(false);
      setNoticeForm({
        circularNumber: '',
        title: '',
        category: 'Academic & Curriculum',
        content: '',
        targetAudience: 'All',
        priority: 'Medium',
        effectiveDate: new Date().toISOString().split('T')[0],
        isPinned: false,
      });
      showToast?.({ type: 'success', message: 'Notice and official circular broadcasted to all stakeholders!' });
    } catch (err) {
      showToast?.({ type: 'error', message: 'Failed to publish notice' });
    }
  };

  const handleDeleteNotice = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete circular "${title || 'this notice'}"?`)) {
      return;
    }
    try {
      if (id) {
        await api.delete(`/operations/notices/${id}`);
      }
      setNotices((prev) => prev.filter((n) => n._id !== id && n.id !== id));
      showToast?.({ type: 'success', message: 'Notice deleted successfully.' });
    } catch (err) {
      setNotices((prev) => prev.filter((n) => n._id !== id && n.id !== id));
      showToast?.({ type: 'success', message: 'Notice deleted.' });
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/operations/events', eventForm);
      setEvents((prev) => [res.data.data, ...prev]);
      setIsEventModalOpen(false);
      showToast?.({ type: 'success', message: 'Campus event scheduled!' });
    } catch (err) {
      showToast?.({ type: 'error', message: 'Failed to schedule event' });
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete event "${title || 'this event'}"?`)) {
      return;
    }
    try {
      if (id) {
        await api.delete(`/operations/events/${id}`);
      }
      setEvents((prev) => prev.filter((ev) => ev._id !== id && ev.id !== id));
      showToast?.({ type: 'success', message: 'Event deleted successfully.' });
    } catch (err) {
      setEvents((prev) => prev.filter((ev) => ev._id !== id && ev.id !== id));
      showToast?.({ type: 'success', message: 'Event deleted.' });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/operations/messages', {
        ...msgForm,
        recipientId: 'admin-1',
      });
      setMessages((prev) => [res.data.data, ...prev]);
      setIsMsgModalOpen(false);
      setMsgForm({ recipientName: 'Dr. Arthur Sterling', recipientRole: 'Super Admin', subject: '', body: '' });
      showToast?.({ type: 'success', message: 'Message sent successfully!' });
    } catch (err) {
      showToast?.({ type: 'error', message: 'Failed to send message' });
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      if (id) {
        await api.delete(`/operations/messages/${id}`);
      }
      setMessages((prev) => prev.filter((m) => m._id !== id && m.id !== id));
      showToast?.({ type: 'success', message: 'Message deleted.' });
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._id !== id && m.id !== id));
      showToast?.({ type: 'success', message: 'Message deleted.' });
    }
  };

  const handleCopyCircular = () => {
    if (!activeCircular) return;
    const text = `EDU-PULSE ACADEMY OFFICIAL CIRCULAR\nCircular No: ${activeCircular.circularNumber || 'CIR-2026-GEN'}\nDate: ${activeCircular.publishDate}\nSubject: ${activeCircular.title}\nTarget Audience: ${activeCircular.targetAudience}\n\n${activeCircular.content}\n\nIssued by: ${activeCircular.authorName} (${activeCircular.authorRole || 'Authority'})`;
    navigator.clipboard?.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    showToast?.({ type: 'success', message: 'Circular text copied to clipboard' });
  };

  const handlePrintCircular = () => {
    window.print();
  };

  // Filtered Notices
  const filteredNotices = notices.filter((n) => {
    const matchesAudience = selectedAudience === 'All' || n.targetAudience === 'All' || n.targetAudience === selectedAudience;
    const matchesPriority = selectedPriority === 'All' || n.priority === selectedPriority;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      n.title?.toLowerCase().includes(q) ||
      n.content?.toLowerCase().includes(q) ||
      n.circularNumber?.toLowerCase().includes(q) ||
      n.category?.toLowerCase().includes(q) ||
      n.authorName?.toLowerCase().includes(q);
    return matchesAudience && matchesPriority && matchesSearch;
  });

  const urgentCount = notices.filter((n) => n.priority === 'Urgent' || n.priority === 'High').length;
  const studentNoticesCount = notices.filter((n) => n.targetAudience === 'Students' || n.targetAudience === 'All').length;
  const parentNoticesCount = notices.filter((n) => n.targetAudience === 'Parents' || n.targetAudience === 'All').length;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Bell className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold tracking-tight">Notices & Official Circulars</h1>
            <Badge variant="primary" size="xs">
              Universal Campus Feed
            </Badge>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Official institutional circulars, academic notices, exam announcements, and stakeholder bulletins. Visible to all students, parents, teachers, and staff.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 bg-slate-800/80 border border-slate-700/60 rounded-xl">
            <button
              onClick={() => setSubTab('notices')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                subTab === 'notices'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              Circulars ({notices.length})
            </button>
            <button
              onClick={() => setSubTab('events')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                subTab === 'events'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Events ({events.length})
            </button>
            <button
              onClick={() => setSubTab('messages')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                subTab === 'messages'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Messages
            </button>
          </div>

          {subTab === 'notices' && canPublish && (
            <button
              onClick={() => {
                setNoticeForm((prev) => ({
                  ...prev,
                  circularNumber: `CIR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
                }));
                setIsNoticeModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white text-slate-900 rounded-xl hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-indigo-600" /> Issue Circular
            </button>
          )}

          {subTab === 'events' && canPublish && (
            <button
              onClick={() => setIsEventModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white text-slate-900 rounded-xl hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-indigo-600" /> Add Event
            </button>
          )}

          {subTab === 'messages' && (
            <button
              onClick={() => setIsMsgModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white text-slate-900 rounded-xl hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4 text-indigo-600" /> Send Message
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Overview for Notices */}
      {subTab === 'notices' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Circulars</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{notices.length} Published</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Urgent Bulletins</p>
              <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{urgentCount} High Priority</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Student Circulars</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{studentNoticesCount} Available</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Parent & Governance</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{parentNoticesCount} Circulars</p>
            </div>
          </div>
        </div>
      )}

      {/* Notices & Circulars Main Feed */}
      {subTab === 'notices' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Audience Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Audience:
              </span>
              {['All', 'Students', 'Parents', 'Teachers'].map((aud) => (
                <button
                  key={aud}
                  type="button"
                  onClick={() => setSelectedAudience(aud)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    selectedAudience === aud
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {aud === 'All' ? 'All Stakeholders' : aud}
                </button>
              ))}
            </div>

            {/* Priority and Search */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold outline-none cursor-pointer"
              >
                <option value="All">All Priorities</option>
                <option value="Urgent">🚨 Urgent</option>
                <option value="High">⚠️ High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search circulars, title, number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Circular Cards Grid */}
          {filteredNotices.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
              <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No circulars match your filters</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try switching the audience filter to "All Stakeholders" or clearing your search term.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedAudience('All');
                  setSelectedPriority('All');
                  setSearchQuery('');
                }}
                className="mt-4 px-3.5 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredNotices.map((n) => {
                const isUrgent = n.priority === 'Urgent';
                const isHigh = n.priority === 'High';

                return (
                  <div
                    key={n._id || n.id || Math.random()}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                      n.isPinned
                        ? 'border-indigo-300 dark:border-indigo-800 ring-1 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/10'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div>
                      {/* Top Header inside card */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {n.circularNumber || `CIR-${new Date().getFullYear()}-${n._id?.slice(-3) || '101'}`}
                          </span>
                          {n.isPinned && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-200 dark:border-amber-800/40">
                              <Pin className="w-3 h-3 fill-amber-500" /> Pinned
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Badge
                            variant={isUrgent ? 'danger' : isHigh ? 'warning' : 'primary'}
                            size="xs"
                          >
                            {n.priority}
                          </Badge>
                          {canPublish && (
                            <button
                              type="button"
                              onClick={() => handleDeleteNotice(n._id || n.id, n.title)}
                              title="Delete Circular"
                              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {n.title}
                      </h3>

                      {/* Category Tag */}
                      {n.category && (
                        <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                          {n.category}
                        </p>
                      )}

                      {/* Content Preview */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2.5 line-clamp-3">
                        {n.content}
                      </p>
                    </div>

                    {/* Bottom Metadata & View Button */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
                        <span>
                          For: <strong className="text-slate-700 dark:text-slate-300">{n.targetAudience}</strong>
                        </span>
                        <span>{n.publishDate}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[10px] text-slate-400 truncate">
                          By: <span className="font-semibold text-slate-600 dark:text-slate-300">{n.authorName || 'Principal Office'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveCircular(n)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 rounded-xl transition-colors cursor-pointer shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Circular
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Events View */}
      {subTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((ev) => (
            <div
              key={ev._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={ev.eventType === 'Sports' ? 'success' : 'primary'}>{ev.eventType}</Badge>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{ev.startDate}</span>
                    {canPublish && (
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(ev._id || ev.id, ev.title)}
                        title="Delete Event"
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{ev.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{ev.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Venue: {ev.location}</span>
                <span>By: {ev.organizer}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Direct Messaging View */}
      {subTab === 'messages' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Direct Conversations</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Direct announcements, faculty communications, and official correspondence.</p>
            </div>
            <button
              onClick={() => setIsMsgModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Compose Message
            </button>
          </div>

          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">No direct messages yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">Click 'Compose Message' to initiate a conversation.</p>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div
                  key={m._id || m.id || idx}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2 text-xs relative group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {m.senderAvatar ? (
                        <img
                          src={m.senderAvatar}
                          alt={m.senderName}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                          {m.senderName?.[0] || 'U'}
                        </div>
                      )}
                      <span className="font-bold text-slate-800 dark:text-slate-200">{m.senderName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 font-semibold">
                        {m.senderRole || 'Staff'}
                      </span>
                      <span className="text-slate-400">to <span className="font-medium text-slate-700 dark:text-slate-300">{m.recipientName}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">
                        {m.createdAt ? new Date(m.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Today'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(m._id || m.id)}
                        title="Delete Message"
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white pt-1">{m.subject}</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{m.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Official Circular Reader Modal */}
      {activeCircular && (
        <Modal
          isOpen={Boolean(activeCircular)}
          onClose={() => setActiveCircular(null)}
          title="Official Institutional Circular"
          description="Authorized communication issued by the School Governance Council."
        >
          <div className="space-y-5">
            {/* Letterhead Container */}
            <div className="p-6 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-inner space-y-4">
              {/* Header with Logo */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                    E
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">EDUPULSE ACADEMY</h2>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                      Office of Academic & Administrative Affairs
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {activeCircular.circularNumber || `CIR-${new Date().getFullYear()}-001`}
                  </p>
                  <p>Date: {activeCircular.publishDate}</p>
                </div>
              </div>

              {/* Subject & Target Banner */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    CIRCULAR TO: <strong className="text-indigo-600 dark:text-indigo-400">{activeCircular.targetAudience}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={activeCircular.priority === 'Urgent' ? 'danger' : 'primary'} size="xs">
                      {activeCircular.priority} Priority
                    </Badge>
                    {activeCircular.category && (
                      <Badge variant="neutral" size="xs">
                        {activeCircular.category}
                      </Badge>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                  SUBJECT: {activeCircular.title}
                </h3>
              </div>

              {/* Notice Body */}
              <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed space-y-3 pt-2">
                <p className="whitespace-pre-line">{activeCircular.content}</p>
                {activeCircular.effectiveDate && (
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-semibold text-xs">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>Effective Date / Implementation: {activeCircular.effectiveDate}</span>
                  </div>
                )}
              </div>

              {/* Author / Seal Footer */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex items-end justify-between">
                <div className="flex items-center gap-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Digitally Signed & Verified</span>
                </div>

                <div className="text-right">
                  <div className="w-28 h-7 border-b border-dashed border-slate-400 mb-1 ml-auto flex items-center justify-center text-[10px] italic text-slate-400">
                    [Official Seal]
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{activeCircular.authorName || 'Principal Office'}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{activeCircular.authorRole || 'Authority'}</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCircular}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? 'Copied' : 'Copy Text'}
                </button>
                <button
                  type="button"
                  onClick={handlePrintCircular}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Circular
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveCircular(null)}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Close Circular
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Notice & Circular Creation Modal */}
      <Modal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        title="Publish Official Campus Circular"
        description="Broadcast formal announcements, academic circulars, and executive directives to all stakeholders."
      >
        <form onSubmit={handleCreateNotice} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Circular Reference No.
              </label>
              <input
                type="text"
                value={noticeForm.circularNumber}
                onChange={(e) => setNoticeForm({ ...noticeForm, circularNumber: e.target.value })}
                placeholder="e.g. CIR-2026-090"
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={noticeForm.category}
                onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Academic & Curriculum">Academic & Curriculum</option>
                <option value="Examinations & Schedules">Examinations & Schedules</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
                <option value="Parent Governance">Parent Governance</option>
                <option value="Campus Facilities & Services">Campus Facilities & Services</option>
                <option value="Holidays & Vacations">Holidays & Vacations</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject / Circular Title *
            </label>
            <input
              type="text"
              required
              value={noticeForm.title}
              onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
              placeholder="e.g. Annual Inter-School Science Fair & Exhibition Guidelines"
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Audience
              </label>
              <select
                value={noticeForm.targetAudience}
                onChange={(e) => setNoticeForm({ ...noticeForm, targetAudience: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="All">All Stakeholders</option>
                <option value="Students">Students Only</option>
                <option value="Parents">Parents Only</option>
                <option value="Teachers">Teachers Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={noticeForm.priority}
                onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">🚨 Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Effective Date
              </label>
              <input
                type="date"
                value={noticeForm.effectiveDate}
                onChange={(e) => setNoticeForm({ ...noticeForm, effectiveDate: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Official Body Text / Directives *
            </label>
            <textarea
              rows={5}
              required
              value={noticeForm.content}
              onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
              placeholder="Provide the comprehensive text of the circular..."
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPinned"
              checked={noticeForm.isPinned}
              onChange={(e) => setNoticeForm({ ...noticeForm, isPinned: e.target.checked })}
              className="rounded text-indigo-600"
            />
            <label htmlFor="isPinned" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              Pin this circular to the top of all campus boards
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsNoticeModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Publish & Broadcast
            </button>
          </div>
        </form>
      </Modal>

      {/* Message Modal */}
      <Modal
        isOpen={isMsgModalOpen}
        onClose={() => setIsMsgModalOpen(false)}
        title="Direct Communication Message"
        description="Send internal message to administrator, instructor, or student."
      >
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                required
                value={msgForm.recipientName}
                onChange={(e) => setMsgForm({ ...msgForm, recipientName: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Recipient Role
              </label>
              <select
                value={msgForm.recipientRole}
                onChange={(e) => setMsgForm({ ...msgForm, recipientRole: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Principal">Principal</option>
                <option value="Teacher">Teacher</option>
                <option value="Parent">Parent</option>
                <option value="Student">Student</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject *
            </label>
            <input
              type="text"
              required
              value={msgForm.subject}
              onChange={(e) => setMsgForm({ ...msgForm, subject: e.target.value })}
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Message Content *
            </label>
            <textarea
              rows={4}
              required
              value={msgForm.body}
              onChange={(e) => setMsgForm({ ...msgForm, body: e.target.value })}
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsMsgModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Send Message
            </button>
          </div>
        </form>
      </Modal>

      {/* Event Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title="Schedule Campus Event"
        description="Add sports meets, examinations, cultural festivals, or conferences to the official academic calendar."
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Event Type
              </label>
              <select
                value={eventForm.eventType}
                onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Academic">Academic</option>
                <option value="Sports">Sports</option>
                <option value="Cultural">Cultural</option>
                <option value="Exam">Exam</option>
                <option value="Conference">Conference</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={eventForm.startDate}
                onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                required
                value={eventForm.endDate}
                onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Venue / Location
            </label>
            <input
              type="text"
              value={eventForm.location}
              onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEventModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Schedule Event
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
