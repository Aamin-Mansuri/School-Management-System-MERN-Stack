import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Bell,
  Calendar,
  User,
  Shield,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
  Camera,
  Check,
  Sparkles,
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserProfileModal } from '../profile/UserProfileModal';
import api from '../../api/axios';

export const Header = ({
  activeTab = 'dashboard',
  isCollapsed = false,
  onToggleCollapse,
  onToggleSidebar,
  onSelectTab,
  showToast,
  onOpenAuthModal,
}) => {
  const { user, logout, login, isAuthenticated } = useAuth();
  const { theme, isDark, toggleTheme, setTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(2);
  const userMenuRef = useRef(null);
  const roleMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/operations/notifications');
        if (res.data?.data) {
          setNotifications(res.data.data);
          setUnreadCount(res.data.data.filter((n) => !n.isRead).length);
        }
      } catch (e) {
        setNotifications([
          { _id: '1', title: 'Mid-Term Exam Schedule', message: 'Exam schedules for Grade 9-12 published.', isRead: false, createdAt: new Date() },
          { _id: '2', title: 'Parent-Teacher Meeting', message: 'Annual conference scheduled for Saturday.', isRead: false, createdAt: new Date() },
        ]);
      }
    };
    fetchNotifications();
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target)) {
        setShowRoleMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleSwitchRole = async (account) => {
    setShowRoleMenu(false);
    try {
      await login(account.email, account.password);
      showToast?.({
        type: 'success',
        title: `Switched to ${account.role}`,
        message: `Now viewing as ${account.name}`,
      });
      if (onSelectTab) onSelectTab('dashboard');
    } catch (err) {
      showToast?.({
        type: 'error',
        title: 'Switch Failed',
        message: 'Could not switch role demo account.',
      });
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'School Admin':
      case 'Principal':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      case 'Teacher':
        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800';
      case 'Student':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Parent':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'Accountant':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  const handleToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      if (onToggleSidebar) onToggleSidebar();
      else if (onToggleCollapse) onToggleCollapse();
    } else {
      if (onToggleCollapse) onToggleCollapse();
      else if (onToggleSidebar) onToggleSidebar();
    }
  };

  return (
    <header className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 sticky top-0 transition-colors">
      {/* Left section: Toggle & Active Breadcrumb */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={handleToggle}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label="Toggle navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium tracking-wide">Campus Portal</span>
          <span className="text-slate-300 dark:text-slate-700 font-bold">/</span>
          <span className="font-bold text-slate-800 dark:text-slate-100 capitalize tracking-wide px-2 py-0.5 rounded-md bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
            {String(activeTab || 'Dashboard').replace('-', ' ')}
          </span>
        </div>
      </div>

      {/* Right controls: Academic Badge, Role Switcher, Notifications, Theme, User Identity */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Quick Switcher Demo Picker */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
            title="Switch Demo Role"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline font-bold">Role:</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded font-bold border ${getRoleBadgeColor(user?.role || 'Guest')}`}>
              {user?.role || 'Guest'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 mb-1 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Switch Demo Role</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Preview different portals instantly</p>
              </div>

              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                {DEMO_ACCOUNTS.filter(a => a.role !== 'Member').map((acc) => {
                  const isCurrent = user?.role === acc.role;
                  return (
                    <button
                      key={acc.role}
                      onClick={() => handleSwitchRole(acc)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate leading-tight">{acc.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{acc.role}</p>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Global Theme Switcher Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-400 hover:text-amber-300 transition-transform duration-200 hover:rotate-45" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600 hover:text-indigo-600 dark:text-slate-400 transition-transform duration-200 hover:-rotate-12" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-indigo-600 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 mb-2.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide">
                  Campus Alerts ({unreadCount})
                </span>
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold cursor-pointer"
                >
                  Mark all read
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400 font-medium">No new alerts</p>
                ) : (
                  notifications.map((n, idx) => (
                    <div
                      key={n._id || idx}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        n.isRead
                          ? 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          : 'bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-200/80 dark:border-indigo-900/60 text-slate-800 dark:text-slate-200 font-medium'
                      }`}
                    >
                      <p className="font-bold">{n.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu or Public Sign In Button */}
        {isAuthenticated ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <div className="relative">
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={user?.name || 'User'}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-slate-900" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {user?.name || 'Authorized User'}
                </p>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                  {user?.role || 'Member'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="relative">
                    <img
                      src={
                        user?.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={user?.name || 'User'}
                      className="w-11 h-11 rounded-full object-cover border-2 border-indigo-500/30 dark:border-indigo-400/30 shrink-0"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsProfileModalOpen(true);
                      }}
                      title="Change photo with camera"
                      className="absolute -bottom-1 -right-1 p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full border-2 border-white dark:border-slate-900 shadow-xs cursor-pointer"
                    >
                      <Camera className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {user?.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {user?.email}
                    </p>
                    <span
                      className={`inline-block mt-1 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${getRoleBadgeColor(
                        user?.role
                      )}`}
                    >
                      {user?.role}
                    </span>
                  </div>
                </div>

                {/* Profile & Camera Photo Action */}
                <div className="py-2 border-b border-slate-100 dark:border-slate-800 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                      <span>My Profile & Photo</span>
                    </div>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                      Camera / Edit
                    </span>
                  </button>
                </div>

                {/* Theme Preference Quick Picker */}
                <div className="py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 px-1">
                    Appearance
                  </p>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`flex items-center justify-center gap-1 py-1 px-2 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Sun className="w-3 h-3 text-amber-500" />
                      <span>Light</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`flex items-center justify-center gap-1 py-1 px-2 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Moon className="w-3 h-3 text-indigo-400" />
                      <span>Dark</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('system')}
                      className={`flex items-center justify-center gap-1 py-1 px-2 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                        theme === 'system'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Monitor className="w-3 h-3 text-slate-500" />
                      <span>Auto</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Exit Portal</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>

      {/* User Profile & Camera Capture Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        showToast={showToast}
      />
    </header>
  );
};
