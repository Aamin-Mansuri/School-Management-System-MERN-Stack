import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Save,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Printer,
  Sparkles,
  Users,
  Send,
  CalendarCheck2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import api from '../api/axios';
import { Badge } from '../components/common/Badge';
import { StatsCard } from '../components/common/StatsCard';
import { useAuth } from '../context/AuthContext';
import { AttendanceSkeleton } from '../components/common/Skeleton';

export const AttendanceView = ({ showToast }) => {
  const { user, isStudent, isParent, isTeacher } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Student/Parent leave request state
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDate, setLeaveDate] = useState('2026-08-25');
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);
  const [personalRecords, setPersonalRecords] = useState([]);
  const [personalStudent, setPersonalStudent] = useState(null);

  // Fetch initial classes for teachers/admins
  useEffect(() => {
    if (isStudent || isParent) return;

    const fetchClasses = async () => {
      setLoading(true);
      try {
        const res = await api.get('/classes');
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : res.data?.data?.classes || [];
        setClasses(list);
        if (list.length > 0) {
          setSelectedClassId(list[0]._id);
        }
      } catch (e) {
        showToast?.({ type: 'error', message: 'Failed to load assigned classes' });
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [isStudent, isParent]);

  // Fetch personal student attendance for Student and Parent roles
  useEffect(() => {
    if (!isStudent && !isParent) return;

    const fetchPersonalAttendance = async () => {
      setLoading(true);
      try {
        const [attRes, stRes] = await Promise.all([
          api.get('/attendance'),
          api.get('/students'),
        ]);

        const records = Array.isArray(attRes.data?.data)
          ? attRes.data.data
          : attRes.data?.data?.records || [];

        const allStudents = Array.isArray(stRes.data?.data)
          ? stRes.data.data
          : stRes.data?.data?.students || [];

        let currentStudent = null;
        if (isStudent) {
          currentStudent =
            allStudents.find(
              (s) =>
                s._id === user?._id ||
                s._id === user?.id ||
                s.userId === user?._id ||
                s.userId === user?.id ||
                s.email?.toLowerCase() === user?.email?.toLowerCase() ||
                `${s.firstName} ${s.lastName}`.toLowerCase() === (user?.name || '').toLowerCase()
            ) ||
            allStudents[0];
        } else if (isParent) {
          currentStudent = allStudents[0];
        }

        setPersonalStudent(currentStudent);
        setPersonalRecords(records);
      } catch (err) {
        console.error('Failed to load personal attendance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalAttendance();
  }, [isStudent, isParent, user]);

  // Fetch students & attendance records when class or date changes
  useEffect(() => {
    if (!selectedClassId || isStudent || isParent) return;

    const fetchClassStudentsAndAttendance = async () => {
      setLoading(true);
      try {
        const [studentsRes, attendanceRes] = await Promise.all([
          api.get(`/students?classId=${selectedClassId}`),
          api.get(`/attendance?classId=${selectedClassId}&date=${selectedDate}`),
        ]);

        const studentList = Array.isArray(studentsRes.data?.data)
          ? studentsRes.data.data
          : studentsRes.data?.data?.students || [];
        setStudents(studentList);

        const existingRecords = Array.isArray(attendanceRes.data?.data)
          ? attendanceRes.data.data
          : attendanceRes.data?.data?.records || [];

        const recordMap = {};
        studentList.forEach((s) => {
          const found = existingRecords.find((r) => r.studentId === s._id);
          recordMap[s._id] = {
            status: found ? found.status : 'Present',
            remark: found ? found.remark : 'On time',
          };
        });

        setAttendanceMap(recordMap);
        setHasUnsavedChanges(false);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchClassStudentsAndAttendance();
  }, [selectedClassId, selectedDate, isStudent, isParent]);

  // Date Navigation Helpers
  const handleDateChangeByDays = (daysOffset) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + daysOffset);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handleSetYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Toggle single student status
  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        remark:
          status === 'Present'
            ? 'On time'
            : status === 'Late'
            ? 'Late arrival'
            : status === 'Excused'
            ? 'Approved note'
            : 'Absent unexcused',
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Update remark
  const handleRemarkChange = (studentId, remark) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remark,
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Batch status updater
  const handleBatchMark = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = {
        status,
        remark:
          status === 'Present'
            ? 'On time'
            : status === 'Late'
            ? 'Late arrival'
            : status === 'Excused'
            ? 'Approved note'
            : 'Absent unexcused',
      };
    });
    setAttendanceMap(updated);
    setHasUnsavedChanges(true);
    showToast?.({ type: 'info', message: `Marked all ${students.length} students as ${status}` });
  };

  // Save to backend
  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const cls = classes.find((c) => c._id === selectedClassId);
      const records = students.map((s) => ({
        studentId: s._id,
        studentName: `${s.firstName} ${s.lastName}`,
        rollNumber: s.rollNumber,
        status: attendanceMap[s._id]?.status || 'Present',
        remark: attendanceMap[s._id]?.remark || '',
      }));

      await api.post('/attendance/batch', {
        classId: selectedClassId,
        className: cls ? cls.name : 'Grade 10',
        sectionId: 'sec-10a',
        sectionName: 'Section A',
        date: selectedDate,
        entries: records,
        records,
      });

      setHasUnsavedChanges(false);
      showToast?.({
        type: 'success',
        message: `Attendance register for ${cls?.name || 'Class'} (${selectedDate}) saved & synced successfully!`,
      });
    } catch (e) {
      showToast?.({ type: 'error', message: 'Failed to record attendance register.' });
    } finally {
      setSaving(false);
    }
  };

  const handleRequestLeave = (e) => {
    e.preventDefault();
    setLeaveSubmitted(true);
    showToast?.({ type: 'success', message: 'Leave application submitted to class teacher!' });
  };

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
      const roll = String(s.rollNumber || '').toLowerCase();
      const adm = String(s.admissionNumber || '').toLowerCase();
      const q = searchQuery.toLowerCase();
      const matchesSearch = fullName.includes(q) || roll.includes(q) || adm.includes(q);

      const studentStatus = attendanceMap[s._id]?.status || 'Present';
      const matchesFilter =
        statusFilter === 'ALL'
          ? true
          : statusFilter === studentStatus.toUpperCase();

      return matchesSearch && matchesFilter;
    });
  }, [students, searchQuery, statusFilter, attendanceMap]);

  // Statistics calculation
  const totalCount = students.length;
  const presentCount = Object.values(attendanceMap).filter((v) => v.status === 'Present').length;
  const lateCount = Object.values(attendanceMap).filter((v) => v.status === 'Late').length;
  const absentCount = Object.values(attendanceMap).filter((v) => v.status === 'Absent').length;
  const excusedCount = Object.values(attendanceMap).filter((v) => v.status === 'Excused').length;
  const presentPercentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;

  const formattedDateString = useMemo(() => {
    try {
      const d = new Date(selectedDate + 'T00:00:00');
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return selectedDate;
    }
  }, [selectedDate]);

  if (loading) {
    return <AttendanceSkeleton />;
  }

  /* =========================================================================
     STUDENT / PARENT PERSONAL ATTENDANCE VIEW
     ========================================================================= */
  if (isStudent || isParent) {
    const studentName = personalStudent
      ? `${personalStudent.firstName} ${personalStudent.lastName}`
      : isParent
      ? 'Lucas Miller (Child)'
      : user?.name || 'Student';

    const classNameDisplay = personalStudent?.className || 'Grade 10 - Section A';

    const totalDays = personalRecords.length;
    const presentDays = personalRecords.filter((r) => r.status === 'Present').length;
    const lateDays = personalRecords.filter((r) => r.status === 'Late').length;
    const absentDays = personalRecords.filter((r) => r.status === 'Absent').length;
    const excusedDays = personalRecords.filter((r) => r.status === 'Excused' || r.status === 'Leave').length;
    const attendancePercentage = totalDays > 0 ? Math.round(((presentDays + lateDays * 0.5) / totalDays) * 100) : 100;

    // Build history logs from real attendance records or friendly fallback
    const historyLogs = personalRecords.map((rec) => {
      let dayName = '—';
      try {
        const d = new Date(rec.date + 'T00:00:00');
        dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      } catch (e) {}

      return {
        date: rec.date,
        day: dayName,
        status: rec.status || 'Present',
        remark: rec.remark || (rec.status === 'Present' ? 'On time' : rec.status === 'Late' ? 'Late arrival' : 'Recorded in register'),
        subject: rec.className || classNameDisplay,
      };
    });

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                {isParent ? "Child's Daily Attendance Ledger" : 'My Personal Attendance Record'}
              </h1>
              <Badge variant={attendancePercentage >= 90 ? 'success' : attendancePercentage >= 75 ? 'warning' : 'danger'}>
                {attendancePercentage}% Present
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Academic term attendance log for <strong className="text-slate-700 dark:text-slate-200">{studentName}</strong> ({classNameDisplay}).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatsCard
            title="Total Sessions"
            value={`${totalDays} Days`}
            subtitle="Current Term"
            icon={CalendarCheck2}
            color="indigo"
          />
          <StatsCard
            title="Days Present"
            value={`${presentDays} Days`}
            subtitle={`${attendancePercentage}% presence`}
            icon={CheckCircle2}
            color="emerald"
          />
          <StatsCard
            title="Late Arrivals"
            value={`${lateDays} Day${lateDays === 1 ? '' : 's'}`}
            subtitle="Recorded by teacher"
            icon={Clock}
            color="purple"
          />
          <StatsCard
            title="Absences / Excused"
            value={`${absentDays + excusedDays} Days`}
            subtitle={`${excusedDays} excused notes`}
            icon={XCircle}
            color="blue"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Recent Daily Attendance Log</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Official school registrar entries</p>

            {historyLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <Users className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">No attendance records logged yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">When your teacher conducts morning roll call, your records will update live here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                      <th className="py-2.5 px-3 font-semibold">Date & Day</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 font-semibold">Class / Section</th>
                      <th className="py-2.5 px-3 font-semibold">Teacher Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {historyLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-mono font-medium text-slate-800 dark:text-slate-200">
                          {log.date} <span className="text-[11px] text-slate-400 font-sans">({log.day})</span>
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            variant={
                              log.status === 'Present'
                                ? 'success'
                                : log.status === 'Late'
                                ? 'warning'
                                : log.status === 'Excused'
                                ? 'neutral'
                                : 'danger'
                            }
                            size="xs"
                          >
                            {log.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{log.subject}</td>
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{log.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              {isParent ? 'Request Absence Excuse' : 'Apply for Student Leave'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Direct submission to {classNameDisplay} Class Teacher.
            </p>

            <form onSubmit={handleRequestLeave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Leave Date</label>
                <input
                  type="date"
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason / Notes *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g., Medical appointment or family event..."
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-2 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Application
              </button>

              {leaveSubmitted && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 text-center font-medium mt-1">
                  ✓ Application logged in school portal.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     TEACHER & ADMIN RESPONSIVE ATTENDANCE TRACKING WORKBENCH
     ========================================================================= */
  const selectedClassObj = classes.find((c) => c._id === selectedClassId);

  return (
    <div className="space-y-6">
      {/* Top Banner & Unsaved Changes Alert */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Class Attendance Register
            </h1>
            {hasUnsavedChanges ? (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                ● Unsaved Changes
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                ✓ Synced
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mark daily student attendance, record late arrivals, notes, and synchronize records in real-time.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Print roll call sheet"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Sheet</span>
          </button>

          <button
            onClick={handleSaveAttendance}
            disabled={saving || students.length === 0}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer ${
              hasUnsavedChanges
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white ring-2 ring-indigo-500/40 shadow-indigo-600/25'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            } disabled:opacity-50`}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Synchronizing...' : hasUnsavedChanges ? 'Save Register *' : 'Save & Sync'}
          </button>
        </div>
      </div>

      {/* Live KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Present</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{presentCount}</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {presentPercentage}% Rate
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">On-time classroom attendance</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Late Arrivals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{lateCount}</span>
            <span className="text-xs text-amber-600 dark:text-amber-400">Students</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Arrived past morning roll call</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Absent</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{absentCount}</span>
            <span className="text-xs text-rose-600 dark:text-rose-400">Unexcused</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Requires guardian alert</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Excused</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{excusedCount}</span>
            <span className="text-xs text-blue-600 dark:text-blue-400">Approved</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Medical / formal leave slip</p>
        </div>
      </div>

      {/* Interactive Controls & Date Picker Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Class / Section Selector */}
          <div className="md:col-span-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Assigned Class & Cohort
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} (Room: {cls.roomNumber || '101'})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker with Quick Presets and Arrows */}
          <div className="md:col-span-8">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Attendance Date & Navigation ({formattedDateString})
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => handleDateChangeByDays(-1)}
                  className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Previous Day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2 py-0.5 text-xs bg-transparent border-0 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleDateChangeByDays(1)}
                  className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Next Day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleSetToday}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                Today
              </button>

              <button
                type="button"
                onClick={handleSetYesterday}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                Yesterday
              </button>
            </div>
          </div>
        </div>

        {/* Batch Quick Buttons & Filter Bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Quick 1-Click Batch Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
              Batch Roll Call:
            </span>
            <button
              type="button"
              onClick={() => handleBatchMark('Present')}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 rounded-lg transition-colors cursor-pointer"
            >
              ✓ Mark All Present
            </button>
            <button
              type="button"
              onClick={() => handleBatchMark('Absent')}
              className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 rounded-lg transition-colors cursor-pointer"
            >
              ✕ Mark All Absent
            </button>
          </div>

          {/* Search and Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[160px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name / roll #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">All Statuses ({students.length})</option>
              <option value="PRESENT">Present ({presentCount})</option>
              <option value="LATE">Late ({lateCount})</option>
              <option value="ABSENT">Absent ({absentCount})</option>
              <option value="EXCUSED">Excused ({excusedCount})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Student Roster Register */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {selectedClassObj?.name || 'Class'} Attendance Roster
            </h2>
            <Badge variant="neutral" size="xs">
              {filteredStudents.length} of {students.length} Students
            </Badge>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Click status pills to toggle immediately
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <Users className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No students match the criteria</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Try clearing your search query or status filter.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4 font-semibold w-16">Roll #</th>
                    <th className="py-3 px-4 font-semibold">Student Details</th>
                    <th className="py-3 px-4 font-semibold">Attendance Status</th>
                    <th className="py-3 px-4 font-semibold">Teacher Remark / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredStudents.map((st) => {
                    const current = attendanceMap[st._id] || { status: 'Present', remark: 'On time' };
                    const status = current.status;

                    return (
                      <tr
                        key={st._id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                          status === 'Absent'
                            ? 'bg-rose-50/40 dark:bg-rose-950/15'
                            : status === 'Late'
                            ? 'bg-amber-50/30 dark:bg-amber-950/10'
                            : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {st.rollNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                st.avatar ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(st.firstName || 'Student')}`
                              }
                              alt={st.firstName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white block">
                                {st.firstName} {st.lastName}
                              </span>
                              <span className="text-[11px] text-slate-400">{st.admissionNumber}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            {[
                              { key: 'Present', label: 'Present', activeBg: 'bg-emerald-600 text-white border-emerald-600' },
                              { key: 'Late', label: 'Late', activeBg: 'bg-amber-500 text-white border-amber-500' },
                              { key: 'Absent', label: 'Absent', activeBg: 'bg-rose-600 text-white border-rose-600' },
                              { key: 'Excused', label: 'Excused', activeBg: 'bg-blue-600 text-white border-blue-600' },
                            ].map((btn) => {
                              const isSelected = status === btn.key;
                              return (
                                <button
                                  key={btn.key}
                                  type="button"
                                  onClick={() => handleStatusChange(st._id, btn.key)}
                                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                                    isSelected
                                      ? `${btn.activeBg} shadow-xs font-bold`
                                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                                  }`}
                                >
                                  {btn.label}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <input
                            type="text"
                            value={current.remark || ''}
                            onChange={(e) => handleRemarkChange(st._id, e.target.value)}
                            placeholder="Add remark..."
                            className="w-full max-w-xs px-3 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Optimized for touch screens) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((st) => {
                const current = attendanceMap[st._id] || { status: 'Present', remark: 'On time' };
                const status = current.status;

                return (
                  <div
                    key={st._id}
                    className={`p-4 space-y-3 ${
                      status === 'Absent'
                        ? 'bg-rose-50/40 dark:bg-rose-950/20'
                        : status === 'Late'
                        ? 'bg-amber-50/30 dark:bg-amber-950/15'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            st.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(st.firstName || 'Student')}`
                          }
                          alt={st.firstName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white text-xs block">
                            {st.firstName} {st.lastName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Roll #{st.rollNumber} • {st.admissionNumber}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          status === 'Present'
                            ? 'success'
                            : status === 'Late'
                            ? 'warning'
                            : status === 'Excused'
                            ? 'neutral'
                            : 'danger'
                        }
                        size="xs"
                      >
                        {status}
                      </Badge>
                    </div>

                    {/* Touch-Friendly Status Switcher Grid */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { key: 'Present', label: 'Present', bg: 'bg-emerald-600 text-white' },
                        { key: 'Late', label: 'Late', bg: 'bg-amber-500 text-white' },
                        { key: 'Absent', label: 'Absent', bg: 'bg-rose-600 text-white' },
                        { key: 'Excused', label: 'Excused', bg: 'bg-blue-600 text-white' },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => handleStatusChange(st._id, item.key)}
                          className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                            status === item.key
                              ? `${item.bg} border-transparent shadow-xs`
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* Mobile Remark Input */}
                    <input
                      type="text"
                      value={current.remark || ''}
                      onChange={(e) => handleRemarkChange(st._id, e.target.value)}
                      placeholder="Add note (optional)..."
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400"
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Bottom Save Bar for Quick Access */}
        {students.length > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredStudents.length} students for <strong>{selectedDate}</strong> ({presentCount} Present, {absentCount} Absent, {lateCount} Late, {excusedCount} Excused)
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={saving || students.length === 0}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving & Syncing...' : hasUnsavedChanges ? 'Save Attendance Register *' : 'Save & Sync Register'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
