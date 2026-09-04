import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  CalendarCheck2,
  TrendingUp,
  FileSpreadsheet,
  Bell,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Award,
  Bus,
  Calendar,
  MessageSquare,
  ChevronRight,
  Layers,
  Send,
  Compass,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { StatsCard } from '../components/common/StatsCard';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { DashboardSkeleton } from '../components/common/Skeleton';

export const DashboardView = ({ onNavigate, setActiveTab, showToast }) => {
  const navigate = onNavigate || setActiveTab || (() => {});
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncingMongo, setSyncingMongo] = useState(false);

  // Parent Ward Profile State & Modal
  const [isEditWardModalOpen, setIsEditWardModalOpen] = useState(false);
  const [wardProfile, setWardProfile] = useState({
    name: 'Lucas Miller',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    rollNumber: '01',
    className: 'Grade 10 - Section A',
    admissionNumber: 'ADM-2026-0892',
    dob: '2010-05-14',
    bloodGroup: 'O+',
    emergencyContact: '+1 (555) 234-5678',
    classTeacher: 'Prof. Marcus Brody',
    busRoute: 'Route #04 (North Campus) - Stop 12B',
    address: '742 Evergreen Terrace, Campus District',
  });

  const handleUpdateWardProfile = (e) => {
    e.preventDefault();
    setIsEditWardModalOpen(false);
    showToast?.({
      type: 'success',
      title: 'Ward Profile Updated',
      message: `Child profile for "${wardProfile.name}" updated successfully!`,
    });
  };

  const handleSyncMongo = async () => {
    try {
      setSyncingMongo(true);
      const res = await api.post('/dashboard/sync-mongodb');
      if (showToast) {
        showToast('All collections successfully pushed to MongoDB Atlas!', 'success');
      }
      // Refresh dashboard data
      const dRes = await api.get('/dashboard');
      if (dRes.data?.data) setData(dRes.data.data);
    } catch (err) {
      if (showToast) {
        showToast(err.response?.data?.message || 'Failed to sync to MongoDB Atlas', 'error');
      }
    } finally {
      setSyncingMongo(false);
    }
  };

  const isStudent = user?.role === 'Student';
  const isParent = user?.role === 'Parent';
  const isTeacher = user?.role === 'Teacher';
  const isAccountant = user?.role === 'Accountant';
  const isAdmin = ['Super Admin', 'School Admin', 'Principal'].includes(user?.role);
  const isMember = !user || !user?.role || user?.role === 'Member' || user?.role === 'Visitor';

  if (isMember) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-xs my-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-900/50">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Campus Community Member</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Institutional school analytics, internal rosters, and metrics are reserved for verified personnel (Super Admin, Principal, Faculty, Students, Parents & Finance).
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('explore')}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs inline-flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              Go to Campus Explorer Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        if (isMounted && res.data?.data) {
          setData(res.data.data);
        }
      } catch (err) {
        // Fallback default statistics
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (loading) {
    return <DashboardSkeleton isStudent={isStudent} />;
  }

  const overview = data?.overview || {
    totalStudents: 120,
    totalTeachers: 14,
    totalClasses: 8,
    totalSubjects: 16,
    totalFees: 48000,
    collectedFees: 41200,
    pendingFees: 6800,
    avgAttendance: 95,
  };

  const charts = data?.charts || {
    feeMonthlyTrend: [
      { month: 'Jan', collected: 18500, target: 20000 },
      { month: 'Feb', collected: 22400, target: 24000 },
      { month: 'Mar', collected: 29800, target: 28000 },
      { month: 'Apr', collected: 34100, target: 35000 },
      { month: 'May', collected: 41200, target: 40000 },
      { month: 'Jun', collected: 42500, target: 45000 },
    ],
    attendanceTrend: [
      { day: 'Mon', rate: 96, present: 114, absent: 6 },
      { day: 'Tue', rate: 94, present: 112, absent: 8 },
      { day: 'Wed', rate: 97, present: 116, absent: 4 },
      { day: 'Thu', rate: 93, present: 111, absent: 9 },
      { day: 'Fri', rate: 95, present: 114, absent: 6 },
    ],
    gradeDistribution: [
      { grade: 'Primary (G1-5)', students: 48, color: '#3b82f6' },
      { grade: 'Middle (G6-8)', students: 42, color: '#8b5cf6' },
      { grade: 'High (G9-12)', students: 30, color: '#10b981' },
    ],
  };

  /* =========================================================================
     1. STUDENT DASHBOARD VIEW
     ========================================================================= */
  if (isStudent) {
    const studentInfo = data?.studentMetrics?.student;
    const studentName = user?.name || (studentInfo ? `${studentInfo.firstName} ${studentInfo.lastName}` : 'Student');
    const classNameDisplay = studentInfo?.className || 'Grade 10 - Section A';
    const rollNumberDisplay = studentInfo?.rollNumber || '01';
    const admissionNumberDisplay = studentInfo?.admissionNumber || 'ADM-2025-001';

    const attRate = data?.studentMetrics?.attendance?.rate !== undefined ? data.studentMetrics.attendance.rate : 96.5;
    const attPresent = data?.studentMetrics?.attendance?.present ?? 0;
    const attTotal = data?.studentMetrics?.attendance?.totalDays ?? 0;
    const attAbsent = data?.studentMetrics?.attendance?.absent ?? 0;

    const feeDue = data?.studentMetrics?.fees?.due !== undefined ? data.studentMetrics.fees.due : 0;
    const pendingAssignmentsCount = data?.studentMetrics?.pendingAssignments ?? 0;

    return (
      <div className="space-y-6">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-xl p-6 shadow-sm border border-indigo-700/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={
                  user?.avatar ||
                  studentInfo?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentName)}`
                }
                alt={studentName}
                className="w-14 h-14 rounded-full object-cover border-2 border-indigo-300 ring-2 ring-indigo-500/50"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white">Hello, {studentName}</h1>
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded-full">
                    Student Portal
                  </span>
                </div>
                <p className="text-xs text-indigo-200 mt-1">
                  {classNameDisplay} | Roll #{rollNumberDisplay} | {admissionNumberDisplay} | Academic Term: 2025-2026
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('assignments')}
                className="px-3.5 py-2 text-xs font-semibold bg-white text-indigo-900 rounded-lg hover:bg-indigo-50 transition-colors shadow-xs"
              >
                Submit Homework
              </button>
              <button
                onClick={() => navigate('exams')}
                className="px-3.5 py-2 text-xs font-semibold bg-indigo-700/80 hover:bg-indigo-600 text-white rounded-lg transition-colors border border-indigo-500/50"
              >
                View Report Card
              </button>
            </div>
          </div>
        </div>

        {/* Student KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="My Attendance Rate"
            value={`${attRate}%`}
            subtitle={attTotal > 0 ? `${attPresent}/${attTotal} sessions (${attAbsent} absent)` : 'Live register updated'}
            icon={CalendarCheck2}
            color="emerald"
          />
          <StatsCard
            title="Current Standing / GPA"
            value="3.85 / 4.0"
            subtitle="Overall Grade A (Top 10%)"
            icon={Award}
            color="indigo"
          />
          <StatsCard
            title="Pending Assignments"
            value={`${pendingAssignmentsCount} Due`}
            subtitle="Coursework submissions"
            icon={FileText}
            color="blue"
          />
          <StatsCard
            title="Term Fee Balance"
            value={`$${feeDue.toFixed(2)}`}
            subtitle={feeDue === 0 ? '✓ All dues cleared' : 'Outstanding invoices'}
            icon={CreditCard}
            color="purple"
          />
        </div>

        {/* Student Schedule & Exams Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Today's Class Timetable</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Monday • 4 scheduled lectures</p>
              </div>
              <button
                onClick={() => navigate('subjects')}
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold inline-flex items-center gap-1"
              >
                Full Syllabus <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { time: '09:00 AM - 10:15 AM', subject: 'Advanced Algebra', teacher: 'Prof. Marcus Brody', room: 'Room 204', status: 'Upcoming' },
                { time: '10:30 AM - 11:45 AM', subject: 'Physics & Thermodynamics', teacher: 'Dr. Evelyn Clark', room: 'Science Lab 2', status: 'Upcoming' },
                { time: '12:30 PM - 01:45 PM', subject: 'English Literature', teacher: 'Ms. Clara Oswald', room: 'Room 108', status: 'Upcoming' },
                { time: '02:00 PM - 03:15 PM', subject: 'Computer Science & Coding', teacher: 'Mr. Alan Turing', room: 'IT Lab A', status: 'Upcoming' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{item.subject}</p>
                      <p className="text-[11px] text-slate-400">{item.teacher} • {item.room}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 block">{item.time}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">On Schedule</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Tests & Quick Links */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Exams</h3>
                <button
                  onClick={() => navigate('exams')}
                  className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {(data?.upcomingExams || []).slice(0, 2).map((exam) => (
                  <div
                    key={exam._id}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-indigo-50/30 dark:bg-indigo-950/20 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{exam.subjectName}</span>
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                        {exam.totalMarks} Marks
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{exam.term}</p>
                    <div className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-2">
                      <Calendar className="w-3 h-3" />
                      <span>{exam.examDate} ({exam.startTime})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Notices & Circulars Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Campus Circulars</h3>
                </div>
                <button
                  onClick={() => navigate('communication')}
                  className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2.5">
                {(data?.recentNotices || []).slice(0, 2).map((notice) => (
                  <div
                    key={notice._id || notice.id}
                    onClick={() => navigate('communication')}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                        {notice.title}
                      </span>
                      <Badge variant={notice.priority === 'Urgent' ? 'danger' : 'primary'} size="xs">
                        {notice.priority}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{notice.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Quick Navigation</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate('fees')}
                  className="p-3 text-left rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-purple-600 mb-1" />
                  <p className="text-xs font-bold text-slate-800 dark:text-white">Pay Fees</p>
                  <p className="text-[10px] text-slate-400">View invoices</p>
                </button>
                <button
                  onClick={() => navigate('transport')}
                  className="p-3 text-left rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer"
                >
                  <Bus className="w-4 h-4 text-blue-600 mb-1" />
                  <p className="text-xs font-bold text-slate-800 dark:text-white">Bus Route</p>
                  <p className="text-[10px] text-slate-400">Route #4 Stop B</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     2. PARENT DASHBOARD VIEW
     ========================================================================= */
  if (isParent) {
    const studentInfo = data?.studentMetrics?.student;
    const wardName = studentInfo ? `${studentInfo.firstName} ${studentInfo.lastName}` : 'Ward';
    const wardClass = studentInfo?.className || 'Grade 10 - Section A';
    const wardRoll = studentInfo?.rollNumber || '01';

    const attRate = data?.studentMetrics?.attendance?.rate !== undefined ? data.studentMetrics.attendance.rate : 96.5;
    const attPresent = data?.studentMetrics?.attendance?.present ?? 0;
    const attTotal = data?.studentMetrics?.attendance?.totalDays ?? 0;
    const feeDue = data?.studentMetrics?.fees?.due !== undefined ? data.studentMetrics.fees.due : 0;
    const pendingAssignmentsCount = data?.studentMetrics?.pendingAssignments ?? 0;

    return (
      <div className="space-y-6">
        {/* Parent Portal Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-indigo-400 ring-2 ring-indigo-500/40"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white">{user?.name}</h1>
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                    Parent Portal
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Enrolled Ward: <strong className="text-white font-semibold">{wardName}</strong> ({wardClass} • Roll #{wardRoll})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('fees')}
                className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-xs"
              >
                Pay Term Fees
              </button>
              <button
                onClick={() => navigate('exams')}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
              >
                Official Report Card
              </button>
            </div>
          </div>
        </div>

        {/* Parent Ward KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Child Attendance"
            value={`${attRate}%`}
            subtitle={`${wardName} (${attPresent}/${attTotal} recorded)`}
            icon={CalendarCheck2}
            color="emerald"
          />
          <StatsCard
            title="Overall Academic Score"
            value="Grade A (88.5%)"
            subtitle="Mid-Term Assessment"
            icon={Award}
            color="indigo"
          />
          <StatsCard
            title="Homework Status"
            value={`${pendingAssignmentsCount} Pending`}
            subtitle="Current active tasks"
            icon={FileText}
            color="blue"
          />
          <StatsCard
            title="Outstanding Fee Balance"
            value={`$${feeDue.toFixed(2)}`}
            subtitle={feeDue === 0 ? '✓ All dues cleared' : 'Term balance due'}
            icon={CreditCard}
            color="purple"
          />
        </div>

        {/* Child Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <img
                src={wardProfile.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
                alt={wardProfile.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-200 dark:border-indigo-800 shadow-xs shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">{wardProfile.name}</h2>
                  <Badge variant="success" size="xs">Enrolled Ward (Student)</Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {wardProfile.className} • Roll #{wardProfile.rollNumber} • {wardProfile.admissionNumber}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditWardModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Update Ward Details</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Class Teacher</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block truncate">{wardProfile.classTeacher}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Emergency Contact</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-1 block truncate">{wardProfile.emergencyContact}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Transit Bus Stop</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block truncate">{wardProfile.busRoute}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Blood Group & Address</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block truncate">{wardProfile.bloodGroup} • {wardProfile.address}</span>
            </div>
          </div>
        </div>

        {/* Child Details & Communication */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Academic Progress Overview</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Lucas Miller's subject scores & attendance</p>
              </div>
              <button
                onClick={() => navigate('attendance')}
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold"
              >
                Full Record
              </button>
            </div>

            <div className="space-y-3">
              {[
                { subject: 'Mathematics', score: '92 / 100', grade: 'A+', teacher: 'Prof. Marcus Brody', attendance: '98%' },
                { subject: 'Physics', score: '86 / 100', grade: 'A', teacher: 'Dr. Evelyn Clark', attendance: '95%' },
                { subject: 'English Literature', score: '89 / 100', grade: 'A', teacher: 'Ms. Clara Oswald', attendance: '97%' },
                { subject: 'Computer Science', score: '94 / 100', grade: 'A+', teacher: 'Mr. Alan Turing', attendance: '96%' },
              ].map((sub, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{sub.subject}</span>
                    <span className="text-[11px] text-slate-400">{sub.teacher} • Attendance: {sub.attendance}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 block">{sub.score}</span>
                    <Badge variant="success" size="xs">{sub.grade}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* School Circulars for Parents */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">School Circulars</h3>
              <button
                onClick={() => navigate('communication')}
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold"
              >
                View Board
              </button>
            </div>

            <div className="space-y-3">
              {(data?.recentNotices || []).slice(0, 3).map((notice) => (
                <div
                  key={notice._id}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                      {notice.title}
                    </span>
                    <Badge variant={notice.priority === 'Urgent' ? 'danger' : 'primary'} size="xs">
                      {notice.priority}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{notice.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ward Edit Modal */}
        <Modal
          isOpen={isEditWardModalOpen}
          onClose={() => setIsEditWardModalOpen(false)}
          title={`Update Child Profile: ${wardProfile.name}`}
          description="Update contact numbers, emergency details, or address for your ward."
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleUpdateWardProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={wardProfile.name}
                  onChange={(e) => setWardProfile({ ...wardProfile, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Class & Section</label>
                <input
                  type="text"
                  required
                  value={wardProfile.className}
                  onChange={(e) => setWardProfile({ ...wardProfile, className: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Class Teacher</label>
                <input
                  type="text"
                  value={wardProfile.classTeacher}
                  onChange={(e) => setWardProfile({ ...wardProfile, classTeacher: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Emergency Phone</label>
                <input
                  type="text"
                  value={wardProfile.emergencyContact}
                  onChange={(e) => setWardProfile({ ...wardProfile, emergencyContact: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bus Transit Stop</label>
                <input
                  type="text"
                  value={wardProfile.busRoute}
                  onChange={(e) => setWardProfile({ ...wardProfile, busRoute: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={wardProfile.address}
                  onChange={(e) => setWardProfile({ ...wardProfile, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditWardModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  /* =========================================================================
     3. TEACHER DASHBOARD VIEW
     ========================================================================= */
  if (isTeacher) {
    const tm = data?.teacherMetrics;
    const enrolledCount = tm ? tm.enrolledStudentsCount : (data?.overview?.totalStudents || 0);
    const assignedClassesCount = tm ? tm.assignedClassesCount : 2;
    const pendingGradingCount = tm ? tm.pendingGradingCount : 0;
    const attRate = tm ? tm.todayAttendanceRate : (data?.overview?.avgAttendance || 96);
    const presentCount = tm?.todayPresentCount ?? Math.round((enrolledCount * attRate) / 100);
    const totalMarked = tm?.todayTotalMarked || enrolledCount;
    const queue = tm?.gradingQueue || [];

    return (
      <div className="space-y-6">
        {/* Teacher Welcome Banner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Welcome, {user?.name}
              </h1>
              <Badge variant="primary">{tm?.teacher?.department ? `Faculty • ${tm.teacher.department}` : 'Faculty Member'}</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Track your assigned classes, mark daily attendance, review homework submissions, and enter exam scores.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => navigate('attendance')}
              className="flex-1 md:flex-none px-3.5 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
            >
              Mark Class Attendance
            </button>
            <button
              onClick={() => navigate('assignments')}
              className="flex-1 md:flex-none px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              New Assignment
            </button>
          </div>
        </div>

        {/* Teacher KPIs (Dynamically calculated per teacher) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="My Enrolled Students"
            value={String(enrolledCount)}
            subtitle={`Across ${assignedClassesCount} assigned class${assignedClassesCount > 1 ? 'es' : ''}`}
            icon={GraduationCap}
            color="indigo"
          />
          <StatsCard
            title="Assigned Classes"
            value={`${assignedClassesCount} Classes`}
            subtitle="Active teaching roster"
            icon={BookOpen}
            color="purple"
          />
          <StatsCard
            title="Pending Submissions"
            value={`${pendingGradingCount} To Grade`}
            subtitle={pendingGradingCount > 0 ? 'Awaiting evaluation' : 'All assignments graded'}
            icon={FileText}
            color="blue"
          />
          <StatsCard
            title="Class Attendance Today"
            value={`${attRate}%`}
            subtitle={`${presentCount} / ${totalMarked} Present`}
            icon={CalendarCheck2}
            color="emerald"
          />
        </div>

        {/* Timetable & Grading Queue Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Today's Teaching Schedule</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Class timetable and lecture rooms</p>
              </div>
              <button
                onClick={() => navigate('classes')}
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold cursor-pointer"
              >
                View Classes
              </button>
            </div>

            <div className="space-y-3">
              {[
                { time: '09:00 AM - 10:15 AM', class: 'Grade 10 - Section A', topic: 'Subject Lecture & Problem Solving', room: 'Room 204' },
                { time: '11:00 AM - 12:15 PM', class: 'Grade 10 - Section B', topic: 'Interactive Classroom Discussion', room: 'Room 205' },
                { time: '01:30 PM - 02:45 PM', class: 'Grade 9 - Section A', topic: 'Theory & Practicals', room: 'Room 102' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{item.class}</p>
                      <p className="text-[11px] text-slate-400">{item.topic} • {item.room}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Grading Action */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Homework Grading Queue</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {queue.length > 0 ? `${queue.length} submission${queue.length > 1 ? 's' : ''} awaiting review` : 'No pending submissions'}
              </p>

              <div className="space-y-2.5">
                {queue.length > 0 ? (
                  queue.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{item.studentName}</p>
                        <p className="text-[10px] text-slate-400 truncate">{item.assignmentTitle}</p>
                      </div>
                      <button
                        onClick={() => navigate('assignments')}
                        className="px-2 py-1 text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 rounded shrink-0 cursor-pointer"
                      >
                        Grade
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">All submissions graded!</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">New turn-ins will appear here.</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate('assignments')}
              className="mt-4 w-full py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Open Grading Sheet
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     4. ACCOUNTANT DASHBOARD VIEW
     ========================================================================= */
  if (isAccountant) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Finance Office: {user?.name}
              </h1>
              <Badge variant="success">Accountant</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Financial accounting ledger, fee invoicing, student billing clearance, and fee collection receipts.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => navigate('fees')}
              className="flex-1 md:flex-none px-3.5 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Create Fee Invoice
            </button>
          </div>
        </div>

        {/* Finance KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Billed Fees"
            value={`$${Number(overview.totalFees || 48000).toLocaleString()}`}
            subtitle="Academic Year 2025-2026"
            icon={DollarSign}
            color="indigo"
          />
          <StatsCard
            title="Collected Receipts"
            value={`$${Number(overview.collectedFees || 41200).toLocaleString()}`}
            subtitle={`${Math.round((overview.collectedFees / (overview.totalFees || 1)) * 100)}% collected`}
            icon={CreditCard}
            color="emerald"
          />
          <StatsCard
            title="Pending Dues"
            value={`$${Number(overview.pendingFees || 6800).toLocaleString()}`}
            subtitle="Unsettled balances"
            icon={AlertCircle}
            color="purple"
          />
          <StatsCard
            title="Overdue Invoices"
            value="4 Students"
            subtitle="Past due deadline"
            icon={ShieldAlert}
            color="blue"
          />
        </div>

        {/* Fee Chart & Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Monthly Collection Trajectory</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Actual revenue receipts vs target ($ USD)</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.feeMonthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="feeGradAcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="collected" stroke="#059669" strokeWidth={2.5} fill="url(#feeGradAcc)" name="Collected ($)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Invoices</h3>
              <button onClick={() => navigate('fees')} className="text-xs text-indigo-600 font-semibold">View All</button>
            </div>
            <div className="space-y-3">
              {[
                { student: 'Lucas Miller', fee: 'Term 1 Tuition', amount: '$250.00', status: 'Pending' },
                { student: 'Sophia Chen', fee: 'Term 1 Tuition', amount: '$450.00', status: 'Paid' },
                { student: 'Ethan Hunt', fee: 'Lab & Science Fee', amount: '$120.00', status: 'Paid' },
                { student: 'Emma Watson', fee: 'Hostel Fee', amount: '$600.00', status: 'Overdue' },
              ].map((inv, idx) => (
                <div key={idx} className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{inv.student}</p>
                    <p className="text-[10px] text-slate-400">{inv.fee}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white block">{inv.amount}</span>
                    <Badge variant={inv.status === 'Paid' ? 'success' : inv.status === 'Pending' ? 'neutral' : 'danger'} size="xs">
                      {inv.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     5. SUPER ADMIN / PRINCIPAL / DEFAULT COMPREHENSIVE DASHBOARD
     ========================================================================= */
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Welcome back, {user?.name}
            </h1>
            <Badge variant="primary">{user?.role}</Badge>
            {data?.databaseStatus && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                data.databaseStatus.connected
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${data.databaseStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'}`}></span>
                Database: {data.databaseStatus.type}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Here is your daily operational summary for EduPulse Academy. All academic records, student enrollments, fee collections, and attendance ledgers are saved and persisted in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {isAdmin && data?.databaseStatus?.connected && (
            <button
              onClick={handleSyncMongo}
              disabled={syncingMongo}
              className="flex-1 md:flex-none px-3.5 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              title="Push all student, class, teacher, fee & attendance collections directly to MongoDB Atlas"
            >
              {syncingMongo ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Syncing Atlas...
                </>
              ) : (
                <>
                  <span>Sync to MongoDB Atlas</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={() => navigate('attendance')}
            className="flex-1 md:flex-none px-3.5 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            Mark Daily Attendance
          </button>
          <button
            onClick={() => navigate('fees')}
            className="flex-1 md:flex-none px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Collect Fees
          </button>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Enrolled Students"
          value={overview.totalStudents}
          change="+8.4% this term"
          changeType="increase"
          icon={GraduationCap}
          color="indigo"
          subtitle="Across 8 grade levels"
        />
        <StatsCard
          title="Faculty & Staff"
          value={overview.totalTeachers}
          change="100% active"
          changeType="increase"
          icon={Users}
          color="purple"
          subtitle="4 departments"
        />
        <StatsCard
          title="Fee Collection"
          value={`$${Number(overview.collectedFees).toLocaleString()}`}
          change={`${Math.round((overview.collectedFees / (overview.totalFees || 1)) * 100)}% collected`}
          changeType="increase"
          icon={CreditCard}
          color="emerald"
          subtitle={`$${Number(overview.pendingFees).toLocaleString()} outstanding`}
        />
        <StatsCard
          title="Avg Attendance Rate"
          value={`${overview.avgAttendance}%`}
          change="+2.1% this week"
          changeType="increase"
          icon={CalendarCheck2}
          color="blue"
          subtitle="Mon - Fri aggregate"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fee Collection Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Fee Revenue Trajectory</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monthly targets vs actual receipts ($ USD)</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-md border border-emerald-200 dark:border-emerald-800">
              On Track
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.feeMonthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="collected" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#feeGrad)" name="Collected ($)" />
                <Area type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" fill="none" name="Budget Target ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Student Body Distribution</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Class tier segmentation</p>

            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.gradeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="students"
                  >
                    {charts.gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {charts.gradeDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-300">{item.grade}</span>
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{item.students} students</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Admissions, Pinned Notices, Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Admissions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Admissions</h3>
            <button
              onClick={() => navigate('students')}
              className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold inline-flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {(data?.recentAdmissions || []).slice(0, 4).map((st) => (
              <div
                key={st._id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={st.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
                    alt={st.firstName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {st.firstName} {st.lastName}
                    </p>
                    <p className="text-[11px] text-slate-400">{st.className} - {st.admissionNumber}</p>
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Campus Notice Board */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Campus Notices</h3>
            <button
              onClick={() => navigate('communication')}
              className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold inline-flex items-center gap-1"
            >
              View Board <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {(data?.recentNotices || []).slice(0, 3).map((notice) => (
              <div
                key={notice._id}
                className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                    {notice.title}
                  </span>
                  <Badge variant={notice.priority === 'Urgent' ? 'danger' : 'primary'} size="xs">
                    {notice.priority}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{notice.content}</p>
                <span className="text-[10px] text-slate-400 mt-2 block">{notice.publishDate} • {notice.authorName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Evaluations & Exams */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Examinations</h3>
            <button
              onClick={() => navigate('exams')}
              className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold inline-flex items-center gap-1"
            >
              Exams <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {(data?.upcomingExams || []).map((exam) => (
              <div
                key={exam._id}
                className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{exam.subjectName}</p>
                  <p className="text-[11px] text-slate-400">{exam.className} • {exam.term}</p>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                    {exam.examDate} ({exam.startTime})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{exam.totalMarks} Marks</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
