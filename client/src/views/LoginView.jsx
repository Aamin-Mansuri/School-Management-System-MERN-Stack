import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck,
  Users,
  CreditCard,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Shield,
  Sun,
  Moon,
  Compass,
  KeyRound,
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const PORTAL_TABS = [
  {
    id: 'Admin',
    name: 'Admin & Governance',
    role: 'Super Admin',
    email: 'admin@edupulse.edu',
    password: 'Admin@123',
    icon: ShieldCheck,
    color: 'rose',
    badge: 'Full Institutional Control',
    tagline: 'Manage users, assign roles, inspect audit logs, and oversee campus configuration.',
  },
  {
    id: 'Principal',
    name: 'School Principal',
    role: 'Principal',
    email: 'principal@edupulse.edu',
    password: 'Principal@123',
    icon: Shield,
    color: 'purple',
    badge: 'Academic Leadership',
    tagline: 'Teacher management, student promotions, curriculum, and campus supervision.',
  },
  {
    id: 'Teacher',
    name: 'Faculty & Teachers',
    role: 'Teacher',
    email: 'teacher@edupulse.edu',
    password: 'Teacher@123',
    icon: BookOpen,
    color: 'cyan',
    badge: 'Faculty Portal',
    tagline: 'Class roll calls, assignment posting, grading, and student performance.',
  },
  {
    id: 'Student',
    name: 'Student Portal',
    role: 'Student',
    email: 'student@edupulse.edu',
    password: 'Student@123',
    icon: GraduationCap,
    color: 'emerald',
    badge: 'Learner Workspace',
    tagline: 'Personal attendance, timetable, results, fees dues, and homework tasks.',
  },
  {
    id: 'Parent',
    name: 'Parent Portal',
    role: 'Parent',
    email: 'parent@edupulse.edu',
    password: 'Parent@123',
    icon: UserCheck,
    color: 'purple',
    badge: 'Family Access',
    tagline: "Track child's academic progress, daily attendance, reports, and fee payments.",
  },
  {
    id: 'Accountant',
    name: 'Finance & Accounts',
    role: 'Accountant',
    email: 'accountant@edupulse.edu',
    password: 'Accountant@123',
    icon: CreditCard,
    color: 'amber',
    badge: 'Billing & Ledger',
    tagline: 'Tuition collections, fee structures, pending receipts, and account ledgers.',
  },
  {
    id: 'Member',
    name: 'Campus Explorer (Guest)',
    role: 'Member',
    email: 'explorer@edupulse.edu',
    password: 'Member@123',
    icon: Users,
    color: 'indigo',
    badge: 'Public Explorer',
    tagline: 'Public campus overview, courses directory, and institutional tour.',
  },
];

export const LoginView = ({ showToast, onExplorePublicly, onLoginSuccess }) => {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Selected Role Portal State
  const [activePortalId, setActivePortalId] = useState('Admin');
  const [email, setEmail] = useState('admin@edupulse.edu');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const activePortal = PORTAL_TABS.find((p) => p.id === activePortalId) || PORTAL_TABS[0];

  const handleSelectPortal = (portal) => {
    setActivePortalId(portal.id);
    setEmail(portal.email);
    setPassword(portal.password);
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast?.({ type: 'error', message: 'Please enter both email and password.' });
      return;
    }
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res?.success) {
        showToast?.({
          type: 'success',
          message: `Welcome back! Logged in as ${res.user?.name || res.data?.user?.name || 'User'} (${res.user?.role || res.data?.user?.role || 'Member'}).`,
        });
        if (onLoginSuccess) {
          onLoginSuccess(res.user || res.data?.user);
        } else if (onExplorePublicly) {
          onExplorePublicly();
        }
      } else {
        showToast?.({
          type: 'error',
          message: res?.message || 'Invalid email or password. Please check your credentials.',
        });
      }
    } catch (err) {
      showToast?.({
        type: 'error',
        message: err.response?.data?.message || 'Login failed. Please check your credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Direct One-Click Sign In from Directory
  const handleDirectSignIn = async (account) => {
    setEmail(account.email);
    setPassword(account.password);
    const matchedPortal = PORTAL_TABS.find((p) => p.role === account.role);
    if (matchedPortal) setActivePortalId(matchedPortal.id);

    setLoading(true);
    try {
      const res = await login(account.email, account.password);
      if (res?.success) {
        showToast?.({
          type: 'success',
          message: `Logged in as ${account.name} (${account.role})!`,
        });
        if (onLoginSuccess) {
          onLoginSuccess(res.user || res.data?.user || { role: account.role, name: account.name });
        } else if (onExplorePublicly) {
          onExplorePublicly();
        }
      } else {
        showToast?.({
          type: 'error',
          message: res?.message || 'Login failed.',
        });
      }
    } catch (err) {
      showToast?.({ type: 'error', message: 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setIsForgotModalOpen(false);
      setForgotSuccess(false);
      setForgotEmail('');
      showToast?.({
        type: 'success',
        message: 'Password reset link sent to your registered email.',
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 text-slate-900 dark:text-slate-100 font-sans">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Top Header Navigation */}
        <div className="bg-slate-100/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-600/30">
              E
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">EduPulse Campus Portal</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block -mt-0.5">
                Official Institutional Role Login
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {onExplorePublicly && (
              <button
                type="button"
                onClick={onExplorePublicly}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer shadow-xs"
                title="Browse school overview, curriculum & fees without logging in"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Browse Campus Publicly</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>
          </div>
        </div>

        {/* ROLE-BASED LOGIN VIEW */}
        <div>
          {/* Role Portal Selector Ribbon */}
          <div className="bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-8 py-2.5 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0 font-medium mr-2">
              <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Select Role:</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {PORTAL_TABS.map((portal) => {
                const Icon = portal.icon;
                const isSelected = activePortalId === portal.id;
                return (
                  <button
                    key={portal.id}
                    type="button"
                    onClick={() => handleSelectPortal(portal)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-indigo-500'
                        : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{portal.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
            {/* Left Col: Portal Detail & Login Form */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                {/* Active Portal Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                      activePortal.color === 'rose'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        : activePortal.color === 'emerald'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : activePortal.color === 'purple'
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                        : activePortal.color === 'cyan'
                        ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                        : activePortal.color === 'amber'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                    }`}
                  >
                    <activePortal.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {activePortal.name}
                      </h1>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {activePortal.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {activePortal.tagline}
                    </p>
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Email Field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. user@edupulse.edu"
                        className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors outline-none"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsForgotModalOpen(true)}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors font-mono outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-slate-600 dark:text-slate-400">Remember credentials</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Log In to {activePortal.name.split(' ')[0]} Workspace</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Admin Provisioning Info Note */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>
                  New accounts and credentials are created by the <strong>Admin</strong> in the Role Management portal or upon Student Admission.
                </span>
              </div>
            </div>

            {/* Right Col: Instant Role Directory Sign-In */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950/60 p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Registered School Accounts</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Click any user to log in instantly</p>
                  </div>
                  <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                </div>

                {/* Persona Accounts Grid */}
                <div className="space-y-2 mt-4">
                  {DEMO_ACCOUNTS.map((account) => {
                    const isCurrent = email === account.email;

                    return (
                      <button
                        key={account.role}
                        type="button"
                        onClick={() => handleDirectSignIn(account)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 ${
                          isCurrent
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-500/80 ring-1 ring-indigo-500/50 shadow-xs'
                            : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={account.avatar}
                            alt={account.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{account.name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{account.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                              account.role === 'Super Admin'
                                ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'
                                : account.role === 'Student'
                                ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                                : account.role === 'Parent'
                                ? 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30'
                                : account.role === 'Teacher'
                                ? 'bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30'
                                : account.role === 'Accountant'
                                ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                                : 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30'
                            }`}
                          >
                            {account.role}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800/60 space-y-2 text-center">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select any role to test and view their respective dashboard and features.
                </p>
                {onExplorePublicly && (
                  <button
                    type="button"
                    onClick={onExplorePublicly}
                    className="w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Compass className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Browse Public Campus (No Login Required)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Reset Password</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Instructions will be dispatched to your email</p>
              </div>
            </div>

            {forgotSuccess ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-xl flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Password reset link sent to your registered inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Registered School Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@edupulse.edu"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-3.5 py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-xs cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
