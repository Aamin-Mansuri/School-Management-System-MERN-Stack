import React, { useState } from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCheck,
  Building2,
  BookOpen,
  CalendarCheck2,
  FileSpreadsheet,
  FileText,
  CreditCard,
  BookMarked,
  Bus,
  BedDouble,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  X,
  Shield,
  ShieldCheck,
  Sparkles,
  Camera,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserProfileModal } from '../profile/UserProfileModal';

export const Sidebar = ({
  activeTab = 'dashboard',
  setActiveTab,
  onTabChange,
  isOpen = false,
  setIsOpen,
  isCollapsed = false,
  onToggleCollapse,
  showToast,
}) => {
  const { user, logout } = useAuth();
  const handleSelectTab = onTabChange || setActiveTab;
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const isStudent = user?.role === 'Student';
  const isParent = user?.role === 'Parent';
  const isTeacher = user?.role === 'Teacher';
  const isAccountant = user?.role === 'Accountant';
  const isMember = !user?.role || user?.role === 'Member' || user?.role === 'Visitor';

  const getLabel = (defaultLabel, studentLabel, parentLabel, teacherLabel) => {
    if (isStudent && studentLabel) return studentLabel;
    if (isParent && parentLabel) return parentLabel;
    if (isTeacher && teacherLabel) return teacherLabel;
    return defaultLabel;
  };

  const navGroups = [
    {
      group: 'Main',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          roles: ['Super Admin', 'School Admin', 'Principal', 'Teacher', 'Student', 'Parent', 'Accountant'],
        },
        {
          id: 'students',
          label: 'Students',
          icon: GraduationCap,
          roles: ['Super Admin', 'School Admin', 'Principal', 'Teacher', 'Accountant'],
        },
        {
          id: 'teachers',
          label: 'Teachers',
          icon: Users,
          roles: ['Super Admin', 'School Admin', 'Principal'],
        },
        {
          id: 'parents',
          label: isParent ? 'My Child Profile' : 'Parents',
          icon: UserCheck,
          roles: ['Super Admin', 'School Admin', 'Principal', 'Parent'],
        },
        {
          id: 'role-requests',
          label: 'Role Approvals',
          icon: ShieldCheck,
          roles: ['Super Admin', 'School Admin', 'Principal'],
        },
      ],
    },
    {
      group: 'Academics',
      items: [
        {
          id: 'classes',
          label: 'Classes & Sections',
          icon: Building2,
          roles: ['Super Admin', 'School Admin', 'Principal', 'Teacher'],
        },
        {
          id: 'subjects',
          label: 'Subjects',
          icon: BookOpen,
          roles: ['Super Admin', 'School Admin', 'Principal', 'Teacher', 'Student', 'Parent'],
        },
        {
          id: 'attendance',
          label: 'Attendance',
          icon: CalendarCheck2,
          roles: ['Super Admin', 'School Admin', 'Principal', 'Teacher', 'Student', 'Parent'],
        },
        {
          id: 'exams',
          label: 'Exams & Marks',
          icon: FileSpreadsheet,
          roles: ['Super Admin', 'School Admin', 'Principal', 'Teacher', 'Student', 'Parent'],
        },
        {
          id: 'assignments',
          label: 'Assignments',
          icon: FileText,
          roles: ['Super Admin', 'School Admin', 'Principal', 'Teacher', 'Student', 'Parent'],
        },
      ],
    },
    {
      group: 'Finance & Services',
      items: [
        {
          id: 'fees',
          label: 'Fees & Invoices',
          icon: CreditCard,
          roles: ['Super Admin', 'School Admin', 'Principal', 'Accountant', 'Student', 'Parent'],
        },
        {
          id: 'library',
          label: 'Library',
          icon: BookMarked,
          roles: ['Super Admin', 'School Admin', 'Principal', 'Teacher', 'Student', 'Parent'],
        },
        {
          id: 'transport',
          label: 'Transport',
          icon: Bus,
          roles: ['Super Admin', 'School Admin', 'Principal', 'Student', 'Parent'],
        },
        {
          id: 'hostel',
          label: 'Hostel',
          icon: BedDouble,
          roles: ['Super Admin', 'School Admin', 'Principal', 'Student', 'Parent'],
        },
      ],
    },
    {
      group: 'Communication & System',
      items: [
        {
          id: 'communication',
          label: 'Notices & Circulars',
          icon: Bell,
          roles: ['*'],
        },
        {
          id: 'explore',
          label: 'Campus Explorer',
          icon: Compass,
          roles: ['*'],
        },
        {
          id: 'audit-logs',
          label: 'Audit Logs',
          icon: ShieldCheck,
          roles: ['Super Admin', 'School Admin', 'Principal'],
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          roles: ['Super Admin', 'School Admin'],
        },
      ],
    },
  ];

  const canAccess = (roles) => {
    if (!roles) return false;
    if (roles.includes('*')) return true;
    if (isMember) {
      return false;
    }
    return Boolean(user?.role && roles.includes(user.role));
  };

  const roleColorBadge = {
    'Super Admin': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    'School Admin': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    Principal: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Teacher: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    Student: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Parent: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Accountant: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Member: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen && setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-300 ease-in-out select-none shadow-2xl lg:shadow-none shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className={`h-16 flex items-center border-b border-slate-800/80 bg-slate-950/60 transition-all ${
          isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
        }`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md font-extrabold text-base tracking-wider shrink-0 ring-2 ring-indigo-500/20">
                E
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white text-base tracking-tight">EduPulse</span>
                  <span className="text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    ERP
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate">Campus Management</p>
              </div>
            </div>
          ) : (
            <button
              onClick={onToggleCollapse}
              title="Expand sidebar"
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-base shadow-md ring-2 ring-indigo-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              E
            </button>
          )}

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsOpen && setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden cursor-pointer ml-auto"
            title="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Toggle (Visible when expanded) */}
          {!isCollapsed && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* User Role Pill */}
        {!isCollapsed && user && (
          <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <Shield className="w-3 h-3 text-indigo-400 shrink-0" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">Scope:</span>
            </div>
            <span
              className={`text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md border ${
                roleColorBadge[user.role] || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              }`}
            >
              {user.role}
            </span>
          </div>
        )}

        {/* Dynamic Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          {navGroups.map((group, gIdx) => {
            // Strictly filter items according to the logged-in user's role
            const visibleItems = group.items.filter((item) => canAccess(item.roles));

            // Hide the entire category header if no items in this group are permitted for this role
            if (visibleItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1">
                {!isCollapsed && (
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    {group.group}
                  </p>
                )}
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <div
                      key={item.id}
                      className="relative"
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <button
                        onClick={() => {
                          if (handleSelectTab) handleSelectTab(item.id);
                          if (setIsOpen) setIsOpen(false);
                        }}
                        className={`w-full flex items-center min-h-[38px] ${
                          isCollapsed ? 'justify-center px-0' : 'justify-between px-3'
                        } py-2 rounded-xl text-xs transition-all cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-sm font-bold ring-1 ring-indigo-400/40'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? 'text-white' : 'text-slate-400'
                            }`}
                          />
                          {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </div>

                        {!isCollapsed && isActive && (
                          <ChevronRight className="w-3.5 h-3.5 text-indigo-200 shrink-0" />
                        )}
                      </button>

                      {/* Tooltip for Icon-only Collapsed Mode on Desktop */}
                      {isCollapsed && hoveredItem === item.id && (
                        <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-950 text-white text-xs rounded-xl shadow-xl border border-slate-800 whitespace-nowrap z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                          <p className="font-bold">{item.label}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Available to: {item.roles.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* User Profile & Logout Bottom Bar */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          {!isCollapsed ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 shadow-2xs">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                title="Edit profile & photo"
                className="flex items-center gap-2.5 overflow-hidden text-left hover:opacity-85 transition-opacity cursor-pointer flex-1 mr-2"
              >
                <div className="relative">
                  <img
                    src={
                      user?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={user?.name || 'User'}
                    className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-600"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-indigo-600 rounded-full text-white">
                    <Camera className="w-2 h-2" />
                  </div>
                </div>
                <div className="overflow-hidden text-left">
                  <p className="text-xs font-bold text-white truncate">{user?.name || 'User'}</p>
                  <p className="text-[10px] text-indigo-400 font-semibold truncate flex items-center gap-1">
                    <span>{user?.role || 'Guest'}</span>
                    <span className="text-[9px] text-slate-400">• Edit</span>
                  </p>
                </div>
              </button>
              <button
                onClick={logout}
                title="Logout"
                className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                title={`Profile & Camera Photo (${user?.name})`}
                className="w-full flex items-center justify-center p-1.5 text-slate-400 hover:text-indigo-400 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={user?.name || 'User'}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-indigo-500/50"
                />
              </button>
              <button
                onClick={logout}
                title={`Logout (${user?.name})`}
                className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        showToast={showToast}
      />
    </>
  );
};
