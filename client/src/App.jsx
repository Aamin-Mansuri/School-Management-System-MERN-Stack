import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Toast } from './components/common/Toast';

// Views
import { DashboardView } from './views/DashboardView';
import { StudentsView } from './views/StudentsView';
import { ParentsView } from './views/ParentsView';
import { TeachersView } from './views/TeachersView';
import { ClassesView } from './views/ClassesView';
import { SubjectsView } from './views/SubjectsView';
import { AttendanceView } from './views/AttendanceView';
import { ExamsView } from './views/ExamsView';
import { AssignmentsView } from './views/AssignmentsView';
import { FeesView } from './views/FeesView';
import { LibraryView } from './views/LibraryView';
import { TransportHostelView } from './views/TransportHostelView';
import { CommunicationView } from './views/CommunicationView';
import { SettingsView } from './views/SettingsView';
import { AuditLogView } from './views/AuditLogView';
import { ExploreView } from './views/ExploreView';
import { RoleManagementView } from './views/RoleManagementView';
import { LoginView } from './views/LoginView';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const TAB_PERMISSIONS = {
  explore: ['*'],
  dashboard: ['Super Admin', 'School Admin', 'Principal', 'Teacher', 'Student', 'Parent', 'Accountant'],
  'role-requests': ['Super Admin', 'School Admin', 'Principal'],
  students: ['Super Admin', 'School Admin', 'Principal', 'Teacher', 'Accountant'],
  parents: ['Super Admin', 'School Admin', 'Principal', 'Parent'],
  teachers: ['Super Admin', 'School Admin', 'Principal'],
  classes: ['Super Admin', 'School Admin', 'Principal', 'Teacher'],
  subjects: ['Super Admin', 'School Admin', 'Principal', 'Teacher', 'Student', 'Parent'],
  attendance: ['Super Admin', 'School Admin', 'Principal', 'Teacher', 'Student', 'Parent'],
  exams: ['Super Admin', 'School Admin', 'Principal', 'Teacher', 'Student', 'Parent'],
  assignments: ['Super Admin', 'School Admin', 'Principal', 'Teacher', 'Student', 'Parent'],
  fees: ['Super Admin', 'School Admin', 'Principal', 'Accountant', 'Student', 'Parent'],
  library: ['Super Admin', 'School Admin', 'Principal', 'Teacher', 'Student', 'Parent', 'Accountant'],
  transport: ['Super Admin', 'School Admin', 'Principal', 'Teacher', 'Student', 'Parent'],
  hostel: ['Super Admin', 'School Admin', 'Principal', 'Teacher', 'Student', 'Parent'],
  communication: ['*'],
  notices: ['*'],
  events: ['*'],
  'audit-logs': ['Super Admin', 'School Admin', 'Principal'],
  settings: ['Super Admin', 'School Admin'],
};

const MainLayout = () => {
  const { user, isAuthenticated, loading, isMember } = useAuth();
  const [activeTab, setActiveTab] = useState('explore');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState(null);
  const [isPublicExploreMode, setIsPublicExploreMode] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Default to public Explore page on launch.
  // Note: Only when user logs in via the login modal do we switch to their institutional dashboard.

  const showToast = (toastConfig, maybeType) => {
    if (typeof toastConfig === 'string') {
      setToast({ message: toastConfig, type: maybeType || 'info' });
    } else if (toastConfig && typeof toastConfig === 'object') {
      setToast(toastConfig);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Loading EduPulse Workspace...</span>
        </div>
      </div>
    );
  }

  // If user explicitly requests full login view
  if (showLoginModal) {
    return (
      <>
        <LoginView
          showToast={showToast}
          onLoginSuccess={(loggedInUser) => {
            setShowLoginModal(false);
            if (loggedInUser?.role && loggedInUser.role !== 'Member' && loggedInUser.role !== 'Visitor') {
              setActiveTab('dashboard');
            } else {
              setActiveTab('explore');
            }
          }}
          onExplorePublicly={() => {
            setShowLoginModal(false);
            setActiveTab('explore');
          }}
        />
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </>
    );
  }

  const renderActiveView = () => {
    const allowedRoles = TAB_PERMISSIONS[activeTab] || ['*'];
    const hasPermission = allowedRoles.includes('*') || (user && allowedRoles.includes(user.role));

    if (!hasPermission) {
      const isMemberUser = !user || !user.role || user.role === 'Member' || user.role === 'Visitor';
      return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 border border-rose-100 dark:border-rose-900/50 shadow-xs">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Institutional Access Required</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-md">
            This module is reserved for authorized school roles (<span className="font-semibold text-slate-700 dark:text-slate-300">{allowedRoles.join(', ')}</span>). {user?.role ? <>Your current account is logged in as <span className="font-semibold text-indigo-600 dark:text-indigo-400">{user?.role}</span>.</> : <>You are currently browsing as a non-authenticated visitor.</>}
          </p>
          <button
            onClick={() => setActiveTab(isMemberUser ? 'explore' : 'dashboard')}
            className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {isMemberUser ? 'Return to Campus Explorer' : 'Return to My Dashboard'}
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'explore':
        return (
          <ExploreView
            showToast={showToast}
            onRequestRoleTab={() => setActiveTab('role-requests')}
            onOpenAuthModal={() => setShowLoginModal(true)}
          />
        );
      case 'role-requests':
        return <RoleManagementView showToast={showToast} />;
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} showToast={showToast} />;
      case 'students':
        return <StudentsView showToast={showToast} />;
      case 'parents':
        return <ParentsView showToast={showToast} />;
      case 'teachers':
        return <TeachersView showToast={showToast} />;
      case 'classes':
        return <ClassesView showToast={showToast} />;
      case 'subjects':
        return <SubjectsView showToast={showToast} />;
      case 'attendance':
        return <AttendanceView showToast={showToast} />;
      case 'exams':
        return <ExamsView showToast={showToast} />;
      case 'assignments':
        return <AssignmentsView showToast={showToast} />;
      case 'fees':
        return <FeesView showToast={showToast} />;
      case 'library':
        return <LibraryView showToast={showToast} />;
      case 'transport':
      case 'hostel':
        return <TransportHostelView showToast={showToast} defaultTab={activeTab === 'hostel' ? 'hostel' : 'transport'} />;
      case 'communication':
      case 'notices':
      case 'events':
        return <CommunicationView showToast={showToast} />;
      case 'audit-logs':
        return <AuditLogView showToast={showToast} />;
      case 'settings':
        return <SettingsView showToast={showToast} />;
      default:
        return <DashboardView setActiveTab={setActiveTab} showToast={showToast} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        showToast={showToast}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenAuthModal={() => setShowLoginModal(true)}
          showToast={showToast}
        />

        {/* Dynamic View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Toast Notification */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
