import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Users,
  Shield,
  GraduationCap,
  Briefcase,
  Eye,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Sliders,
  Check,
  X,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const RoleManagementView = ({ showToast }) => {
  const { user: currentUser, isSuperAdmin, isPrincipal, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'users'
  const [roleRequests, setRoleRequests] = useState([]);
  const [requestSummary, setRequestSummary] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('PENDING'); // 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'

  // Action Modals State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(''); // 'APPROVE' | 'REJECT' | 'DIRECT_ASSIGN'
  const [actionNotes, setActionNotes] = useState('');
  const [grantRoleChoice, setGrantRoleChoice] = useState('Teacher');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Direct Role Change modal
  const [targetUser, setTargetUser] = useState(null);
  const [newAssignedRole, setNewAssignedRole] = useState('Teacher');
  const [assignmentReason, setAssignmentReason] = useState('');

  // Create New User State (Admin Add User)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Teacher',
    phone: '',
  });
  const [creatingUser, setCreatingUser] = useState(false);

  const handleCreateNewUser = async (e) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email || !newUserData.password) {
      showToast?.({ type: 'error', message: 'Name, Email and Password are required.' });
      return;
    }
    setCreatingUser(true);
    try {
      const res = await api.post('/users', newUserData);
      if (res.data?.success) {
        showToast?.({
          type: 'success',
          message: `User ${newUserData.name} created successfully with role ${newUserData.role}!`,
        });
        setIsAddUserModalOpen(false);
        setNewUserData({ name: '', email: '', password: '', role: 'Teacher', phone: '' });
        await fetchUsers();
      } else {
        showToast?.({ type: 'error', message: res.data?.message || 'Failed to create user' });
      }
    } catch (err) {
      showToast?.({
        type: 'error',
        message: err.response?.data?.message || 'Error creating user account.',
      });
    } finally {
      setCreatingUser(false);
    }
  };

  // Fetch Requests
  const fetchRequests = async () => {
    try {
      const res = await api.get('/role-requests');
      if (res.data?.data) {
        setRoleRequests(res.data.data.requests || []);
        setRequestSummary(res.data.data.summary || { total: 0, pending: 0, approved: 0, rejected: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch role requests:', err);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      if (res.data?.data) {
        setUsersList(res.data.data.users || res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchRequests(), fetchUsers()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Approve Request
  const handleApprove = async () => {
    if (!selectedRequest) return;
    setSubmittingAction(true);
    try {
      const res = await api.put(`/role-requests/${selectedRequest._id}/approve`, {
        assignedRole: grantRoleChoice,
        notes: actionNotes || `Approved by ${currentUser?.name} (${currentUser?.role})`,
      });

      if (res.data?.success) {
        showToast?.({
          type: 'success',
          message: res.data.message || `Granted ${grantRoleChoice} role to ${selectedRequest.userName}!`,
        });
        setSelectedRequest(null);
        setActionNotes('');
        await loadData();
        refreshUser?.();
      }
    } catch (err) {
      showToast?.({
        type: 'error',
        message: err.response?.data?.message || 'Failed to approve role request.',
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle Reject Request
  const handleReject = async () => {
    if (!selectedRequest) return;
    setSubmittingAction(true);
    try {
      const res = await api.put(`/role-requests/${selectedRequest._id}/reject`, {
        notes: actionNotes || 'Verification criteria not satisfied at this time.',
      });

      if (res.data?.success) {
        showToast?.({
          type: 'info',
          message: `Role request from ${selectedRequest.userName} has been declined.`,
        });
        setSelectedRequest(null);
        setActionNotes('');
        await loadData();
      }
    } catch (err) {
      showToast?.({
        type: 'error',
        message: err.response?.data?.message || 'Failed to reject role request.',
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle Direct Role Assignment
  const handleDirectAssign = async (e) => {
    e.preventDefault();
    if (!targetUser) return;
    setSubmittingAction(true);
    try {
      const res = await api.put(`/role-requests/user/${targetUser._id || targetUser.id}/assign`, {
        role: newAssignedRole,
        reason: assignmentReason || `Role directly updated by ${currentUser?.role} ${currentUser?.name}`,
      });

      if (res.data?.success) {
        showToast?.({
          type: 'success',
          message: `Successfully updated ${targetUser.name}'s role to ${newAssignedRole}!`,
        });
        setTargetUser(null);
        setAssignmentReason('');
        await loadData();
      }
    } catch (err) {
      showToast?.({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update user role.',
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  // Permission helper: Can current user approve this request?
  const canApproveRequest = (request) => {
    if (isSuperAdmin) return true;
    if (isPrincipal) {
      // Principal CANNOT approve Principal or Super Admin role requests
      if (['Principal', 'Super Admin'].includes(request.requestedRole)) {
        return false;
      }
      return true;
    }
    return false;
  };

  // Filtered Requests
  const filteredRequests = roleRequests.filter((r) => {
    const matchesSearch =
      r.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requestedRole?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Users Directory
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. HEADER WITH GOVERNANCE ROLE CONTEXT */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Role Governance & Access Control</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                <span>Acting as: <strong>{currentUser?.role}</strong></span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Institutional Role Assignment & Approvals
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Manage incoming role upgrade applications from registered campus members.
              {isPrincipal && (
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold block mt-0.5">
                  As Principal, you have authority to approve Teacher, Student, Parent, and Staff credentials. Executive Principal roles require Super Admin sign-off.
                </span>
              )}
              {isSuperAdmin && (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                  As Super Administrator, you hold universal authorization across all roles including Principal promotions and faculty credentials.
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={loadData}
              className="p-2.5 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* SUMMARY STATS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-bold uppercase tracking-wider">
              Pending Approvals
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                {requestSummary.pending}
              </span>
              <span className="text-[10px] text-amber-600 font-semibold">Requires Review</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-bold uppercase tracking-wider">
              Approved Roles
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {requestSummary.approved}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">Granted</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-bold uppercase tracking-wider">
              Total Requests
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {requestSummary.total}
              </span>
              <span className="text-[10px] text-slate-500">All-Time</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-bold uppercase tracking-wider">
              Registered Accounts
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {usersList.length}
              </span>
              <span className="text-[10px] text-indigo-500 font-semibold">Campus Users</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TABS & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl w-fit border border-slate-200 dark:border-slate-700/60">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Role Requests Queue</span>
            {requestSummary.pending > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500 text-white">
                {requestSummary.pending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Directory & Direct Assignment</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email..."
              className="pl-8 pr-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none w-48 sm:w-60"
            />
          </div>

          {activeTab === 'requests' ? (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-semibold outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Declined</option>
            </select>
          ) : (
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-semibold outline-none cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="Member">Member (Normal Person)</option>
              <option value="Teacher">Teacher</option>
              <option value="Principal">Principal</option>
              <option value="Student">Student</option>
              <option value="Parent">Parent</option>
              <option value="Accountant">Accountant</option>
              <option value="Super Admin">Super Admin</option>
            </select>
          )}
        </div>
      </div>

      {/* 3. TAB CONTENT: ROLE REQUESTS QUEUE */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No role requests match your filter</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                All submitted role upgrade applications have been processed or no matching applicants were found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredRequests.map((req) => {
                const canApprove = canApproveRequest(req);
                const requiresAdmin = ['Principal', 'Super Admin'].includes(req.requestedRole);

                return (
                  <div
                    key={req._id}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs transition-all ${
                      req.status === 'PENDING'
                        ? 'border-amber-200/80 dark:border-amber-900/40 bg-amber-500/2 dark:bg-amber-500/5'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Applicant Information */}
                      <div className="flex items-start gap-3.5">
                        <img
                          src={req.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.userName}`}
                          alt={req.userName}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                              {req.userName}
                            </h3>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              ({req.userEmail})
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                req.status === 'APPROVED'
                                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                                  : req.status === 'REJECTED'
                                  ? 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                                  : 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                              }`}
                            >
                              {req.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span>
                              Current Role: <strong className="text-slate-700 dark:text-slate-300">{req.currentRole || 'Member'}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Requested Role:{' '}
                              <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                                {req.requestedRole}
                              </strong>
                            </span>
                            <span>•</span>
                            <span>Submitted: {new Date(req.createdAt).toLocaleString()}</span>
                          </div>

                          {/* Reason & Credentials */}
                          <div className="mt-2.5 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                            <p className="text-slate-800 dark:text-slate-200">
                              <strong>Applicant Justification:</strong> {req.reason}
                            </p>
                            {req.qualification && (
                              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                                <strong>Credentials / Qualifications:</strong> {req.qualification}
                                {req.employeeOrRegId ? ` · ID: ${req.employeeOrRegId}` : ''}
                              </p>
                            )}
                            {req.reviewNotes && (
                              <p className="text-indigo-600 dark:text-indigo-400 text-[11px] italic pt-1 border-t border-slate-200 dark:border-slate-800">
                                <strong>Review Note:</strong> "{req.reviewNotes}" (by {req.reviewedBy?.name || 'Reviewer'})
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Permission Check & Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
                        {req.status === 'PENDING' ? (
                          <>
                            {!canApprove ? (
                              <div className="text-right">
                                <span className="text-[11px] font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/50 block">
                                  Requires Super Admin Approval
                                </span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  (Principals cannot approve Principal/Admin roles)
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedRequest(req);
                                    setActionType('REJECT');
                                  }}
                                  className="px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Decline</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedRequest(req);
                                    setGrantRoleChoice(req.requestedRole === 'Pending Role Assignment' || !req.requestedRole ? 'Teacher' : req.requestedRole);
                                    setActionType('APPROVE');
                                  }}
                                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Review & Grant Role</span>
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            Processed on {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : 'N/A'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. TAB CONTENT: USER DIRECTORY & DIRECT ASSIGNMENT */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                All Campus Accounts & Active Permissions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create new user accounts directly with custom roles and passwords, or reassign existing roles.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                {filteredUsers.length} account(s)
              </span>
              {['Super Admin', 'School Admin'].includes(currentUser?.role) && (
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>+ Create User Account</span>
              </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredUsers.map((u) => {
                  const isSelf = u._id === currentUser?._id || u.email === currentUser?.email;
                  const isProtected = u.email === currentUser?.email || (['Super Admin', 'School Admin', 'Principal'].includes(u.role) && !isSuperAdmin);

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                            alt={u.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="text-[9px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-1.5 py-0.2 rounded font-semibold">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            u.role === 'Super Admin'
                              ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                              : u.role === 'Principal'
                              ? 'bg-purple-500/10 text-purple-600 border-purple-500/30'
                              : u.role === 'Teacher'
                              ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30'
                              : u.role === 'Student'
                              ? 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30'
                              : u.role === 'Parent'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {u.role || 'Member'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {u.phone || 'No phone recorded'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isProtected ? (
                          <span className="text-[11px] text-slate-400 italic">Protected Role</span>
                        ) : (
                          <button
                            onClick={() => {
                              setTargetUser(u);
                              setNewAssignedRole(u.role === 'Member' ? 'Teacher' : u.role);
                              setActionType('DIRECT_ASSIGN');
                            }}
                            className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            Change Role
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APPROVE / REJECT CONFIRMATION MODAL */}
      <Modal
        isOpen={!!selectedRequest && (actionType === 'APPROVE' || actionType === 'REJECT')}
        onClose={() => setSelectedRequest(null)}
        title={actionType === 'APPROVE' ? 'Approve Role Promotion' : 'Decline Role Request'}
        maxWidth="max-w-md"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <p>
                <strong>Applicant:</strong> {selectedRequest.userName} ({selectedRequest.userEmail})
              </p>
              <p>
                <strong>Current Role:</strong> {selectedRequest.currentRole || 'Member'} →{' '}
                <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                  {selectedRequest.requestedRole}
                </strong>
              </p>
              <p className="text-slate-500">
                <strong>Applicant Note:</strong> {selectedRequest.reason}
              </p>
            </div>

            {actionType === 'APPROVE' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assign Institutional Role <span className="text-emerald-500">*</span>
                </label>
                <select
                  value={grantRoleChoice}
                  onChange={(e) => setGrantRoleChoice(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none font-semibold cursor-pointer"
                >
                  <option value="Teacher">Teacher (Faculty Portal)</option>
                  <option value="Student">Student (Student Portal)</option>
                  <option value="Parent">Parent (Guardian Portal)</option>
                  <option value="Accountant">Accountant (Billing Department)</option>
                  {isSuperAdmin && (
                    <>
                      <option value="Principal">School Principal (Executive Portal)</option>
                      <option value="School Admin">School Admin (Administrative Portal)</option>
                      <option value="Super Admin">Super Admin (System Root)</option>
                    </>
                  )}
                  <option value="Member">Member (Campus Explorer)</option>
                  <option value="Visitor">Visitor (Public Guest)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {actionType === 'APPROVE' ? 'Approval Notes (Optional)' : 'Reason for Decline (Required)'}
              </label>
              <textarea
                rows={2}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={
                  actionType === 'APPROVE'
                    ? 'e.g. Verified credentials and assigned to Senior Physics department.'
                    : 'e.g. Incomplete registration records; please re-apply with verification ID.'
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              {actionType === 'APPROVE' ? (
                <button
                  type="button"
                  disabled={submittingAction}
                  onClick={handleApprove}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {submittingAction ? 'Granting...' : `Confirm & Grant ${grantRoleChoice}`}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submittingAction}
                  onClick={handleReject}
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {submittingAction ? 'Declining...' : 'Confirm Decline'}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* DIRECT ROLE ASSIGNMENT MODAL */}
      <Modal
        isOpen={!!targetUser && actionType === 'DIRECT_ASSIGN'}
        onClose={() => setTargetUser(null)}
        title="Direct Role Assignment"
        maxWidth="max-w-md"
      >
        {targetUser && (
          <form onSubmit={handleDirectAssign} className="space-y-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs">
              <p className="font-semibold text-indigo-950 dark:text-indigo-200">
                Updating role for {targetUser.name} ({targetUser.email})
              </p>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5">
                Current Role: <strong>{targetUser.role || 'Member'}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Select New Role:
              </label>
              <select
                value={newAssignedRole}
                onChange={(e) => setNewAssignedRole(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
              >
                <option value="Member">Member (Normal Person / Explorer)</option>
                <option value="Teacher">Teacher (Faculty Portal)</option>
                <option value="Student">Student (Student Portal)</option>
                <option value="Parent">Parent (Parent Portal)</option>
                <option value="Accountant">Accountant (Finance & Billing)</option>
                {isSuperAdmin && <option value="Principal">School Principal (Academic Governance)</option>}
                {isSuperAdmin && <option value="Super Admin">Super Admin (Universal Access)</option>}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reason / Administrative Memo:
              </label>
              <input
                type="text"
                value={assignmentReason}
                onChange={(e) => setAssignmentReason(e.target.value)}
                placeholder="e.g. Promoted to Senior Faculty / Classroom Teacher"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setTargetUser(null)}
                className="px-4 py-2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {submittingAction ? 'Updating...' : `Assign ${newAssignedRole} Role`}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ADMIN CREATE NEW USER ACCOUNT MODAL */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Create New User Account (Admin Provisioning)"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateNewUser} className="space-y-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs">
            <p className="font-semibold text-indigo-950 dark:text-indigo-200">
              Directly create login credentials for any role.
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              The user can immediately log in with this email and password.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newUserData.name}
              onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
              placeholder="e.g. Dr. Rajesh Sharma"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                placeholder="e.g. rajesh@edupulse.edu"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newUserData.password}
                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                placeholder="e.g. Teacher@123"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Role to Assign <span className="text-rose-500">*</span>
              </label>
              <select
                value={newUserData.role}
                onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-900 dark:text-white outline-none"
              >
                <option value="Teacher">Teacher (Faculty)</option>
                <option value="Student">Student</option>
                <option value="Parent">Parent</option>
                <option value="Accountant">Accountant (Finance)</option>
                <option value="Principal">School Principal</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Member">Member (Campus Explorer)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="text"
                value={newUserData.phone}
                onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                placeholder="+1 (555) 019-2834"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddUserModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingUser}
              className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {creatingUser ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
