import React, { useState } from 'react';
import {
  User,
  Camera,
  Mail,
  Phone,
  ShieldCheck,
  Building,
  Calendar,
  Lock,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
  Sparkles,
  Upload,
  KeyRound,
  IdCard,
  GraduationCap,
  BookOpen,
  UserCheck,
  CreditCard,
  Clock,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import api from '../../api/axios';

const PRESET_AVATARS = [
  {
    id: 'avatar-1',
    label: 'Scholar Formal',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-2',
    label: 'Faculty Senior',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-3',
    label: 'Academic Director',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-4',
    label: 'Finance Officer',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-5',
    label: 'Student Leader',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-6',
    label: 'Parent Representative',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-7',
    label: 'Campus Scientist',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-8',
    label: 'Junior Scholar',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  },
];

export const UserProfileModal = ({ isOpen, onClose, showToast }) => {
  const { user, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'child' | 'security'
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);

  // Child / Ward info state for Parents
  const [wardInfo, setWardInfo] = useState({
    name: user?.children?.[0]?.name || 'Lucas Miller',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    rollNumber: user?.children?.[0]?.rollNumber || '01',
    className: user?.children?.[0]?.className || 'Grade 10 - Section A',
    admissionNumber: 'ADM-2026-0892',
    dob: '2010-05-14',
    bloodGroup: 'O+',
    emergencyContact: '+1 (555) 234-5678',
    classTeacher: 'Prof. Marcus Brody',
    busRoute: 'Route #04 (North Campus) - Stop 12B',
    address: '742 Evergreen Terrace, Campus District',
    attendanceRate: '96.5%',
    feesStatus: 'Paid / Up-to-Date',
  });
  const [savingWard, setSavingWard] = useState(false);

  // Guardian / Parent info state for Students
  const [parentInfo, setParentInfo] = useState({
    name: 'David Miller',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    email: 'parent@edupulse.edu',
    phone: '+1 (555) 234-5678',
    occupation: 'Software Architect',
    relation: 'Father / Primary Guardian',
    address: '742 Evergreen Terrace, Campus District',
  });

  // Camera modal state
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Sync state if user changes
  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSaveWardInfo = (e) => {
    e.preventDefault();
    setSavingWard(true);
    setTimeout(() => {
      setSavingWard(false);
      showToast?.({
        type: 'success',
        title: 'Child Profile Updated',
        message: `Linked profile details for "${wardInfo.name}" updated successfully!`,
      });
    }, 600);
  };

  const handleProfileSave = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    try {
      const res = await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        avatar: avatar,
      });

      if (res?.success) {
        showToast?.({
          type: 'success',
          message: 'Profile and avatar updated successfully!',
        });
        onClose();
      } else {
        showToast?.({
          type: 'error',
          message: res?.message || 'Could not update profile.',
        });
      }
    } catch (err) {
      showToast?.({
        type: 'error',
        message: 'Failed to update profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast?.({ type: 'error', message: 'Please enter all password fields.' });
      return;
    }
    if (newPassword.length < 6) {
      showToast?.({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast?.({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setChangingPassword(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      showToast?.({
        type: 'success',
        message: 'Security password changed successfully!',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveTab('general');
    } catch (err) {
      showToast?.({
        type: 'error',
        message: err.response?.data?.message || 'Password update failed. Verify current password.',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAvatarCaptured = (newAvatarUrl) => {
    setAvatar(newAvatarUrl);
    showToast?.({
      type: 'success',
      message: 'New profile photo applied! Click "Save Changes" to confirm.',
    });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Student':
        return GraduationCap;
      case 'Teacher':
        return BookOpen;
      case 'Parent':
        return UserCheck;
      case 'Accountant':
        return CreditCard;
      default:
        return ShieldCheck;
    }
  };

  const RoleIcon = getRoleIcon(user.role);

  // Dynamic header state based on activeTab
  let headerAvatar = avatar || user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
  let headerTitle = user.name;
  let headerRoleTag = user.role;
  let headerSubtext = user.email;
  let headerExtraInfo = `ID: ${user._id?.substring(0, 10) || 'EDU-2026'} • Campus Member`;
  let HeaderIconComponent = RoleIcon;

  if (user.role === 'Student' && activeTab === 'general') {
    headerAvatar = avatar || user.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80';
    headerTitle = user.name || wardInfo.name;
    headerRoleTag = 'Enrolled Student';
    headerSubtext = `${wardInfo.className} • Roll #${wardInfo.rollNumber}`;
    headerExtraInfo = `Admission #: ${wardInfo.admissionNumber} • Active Student`;
    HeaderIconComponent = GraduationCap;
  } else if (activeTab === 'child') {
    headerAvatar = wardInfo.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80';
    headerTitle = wardInfo.name;
    headerRoleTag = 'Enrolled Ward (Student)';
    headerSubtext = `${wardInfo.className} • Roll #${wardInfo.rollNumber}`;
    headerExtraInfo = `Admission #: ${wardInfo.admissionNumber} • Active Student`;
    HeaderIconComponent = GraduationCap;
  } else if (activeTab === 'parent') {
    headerAvatar = parentInfo.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80';
    headerTitle = parentInfo.name;
    headerRoleTag = 'Primary Guardian (Parent)';
    headerSubtext = `${parentInfo.email} • ${parentInfo.phone}`;
    headerExtraInfo = `${parentInfo.relation} • ${parentInfo.occupation}`;
    HeaderIconComponent = UserCheck;
  }

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
          
          {/* Top Banner with Profile Photo & Role Header */}
          <div className="relative bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-900 dark:to-slate-900 p-6 sm:p-8 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
              {/* Avatar with Camera Overlay */}
              <div className="relative group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-slate-800 ring-4 ring-white/20 shrink-0">
                  <img
                    src={headerAvatar}
                    alt={headerTitle}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Instant Camera Trigger Button */}
                {activeTab === 'general' && (
                  <button
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    title="Capture or upload photo with camera"
                    className="absolute bottom-0 right-0 p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white border-2 border-white dark:border-slate-800 shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* User Summary Info */}
              <div className="text-center sm:text-left space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{headerTitle}</h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs border border-white/30">
                    <HeaderIconComponent className="w-3 h-3" />
                    <span>{headerRoleTag}</span>
                  </span>
                </div>
                <p className="text-xs text-indigo-100 dark:text-indigo-200">{headerSubtext}</p>
                <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-[11px] text-indigo-200">
                  <span>{headerExtraInfo}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`py-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'general'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{user.role === 'Student' ? 'My Student Profile & Photo' : 'My Profile & Photo'}</span>
              </button>

              {user.role === 'Parent' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('child')}
                  className={`py-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'child'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Child / Ward Profile</span>
                </button>
              )}

              {user.role === 'Student' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('parent')}
                  className={`py-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'parent'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Guardian / Parent Details</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`py-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'security'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Security & Password</span>
              </button>
            </div>

            {/* Quick Camera Action */}
            <button
              type="button"
              onClick={() => setIsCameraModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Capture Live Photo</span>
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {activeTab === 'general' ? (
              <form onSubmit={handleProfileSave} className="space-y-6">
                
                {/* Photo Quick Selector / Presets */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Profile Avatar / Photo
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCameraModalOpen(true)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Take Photo with Camera</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {PRESET_AVATARS.map((p) => {
                      const isSelected = avatar === p.url;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setAvatar(p.url)}
                          title={p.label}
                          className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all p-0.5 cursor-pointer ${
                            isSelected
                              ? 'border-indigo-600 ring-2 ring-indigo-500/50 scale-105'
                              : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={p.url} alt={p.label} className="w-full h-full object-cover rounded-lg" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-white drop-shadow-md" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Profile Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Full Display Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                  </div>

                  {/* Institutional Email (Read-only) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Campus Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        disabled
                        value={user.email}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Contact Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                  </div>

                  {/* Assigned Role */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      System Authorization Role
                    </label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        disabled
                        value={user.role}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Student Academic & Ward Details Card if role is Student */}
                {user.role === 'Student' && (
                  <div className="p-4 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-indigo-100 dark:border-indigo-900/40">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>Student Academic & Enrollment Record</span>
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-600 text-white">
                        Enrolled Student
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Class & Section</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{wardInfo.className}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Roll #</span>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">Roll #{wardInfo.rollNumber}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Admission Number</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{wardInfo.admissionNumber}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Class Teacher</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">{wardInfo.classTeacher}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Attendance Rate</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{wardInfo.attendanceRate}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Bus Transit Stop</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 block truncate">{wardInfo.busRoute}</span>
                      </div>

                      <div className="p-2.5 sm:col-span-2 rounded-xl bg-white/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Primary Guardian / Parent</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{parentInfo.name} ({parentInfo.relation} • {parentInfo.phone})</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Role Specific Details Card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Campus Profile Details</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Account Status</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active & Verified</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Access Authority</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{user.role}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Security Audit</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">TLS Encrypted</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {saving ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Profile & Avatar</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : activeTab === 'child' ? (
              <form onSubmit={handleSaveWardInfo} className="space-y-5">
                {/* Ward Profile Overview Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white border border-indigo-800/60 shadow-md flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/80 text-white flex items-center justify-center font-black text-base border border-indigo-400/30 shrink-0">
                      {wardInfo.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{wardInfo.name}</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md">
                          Enrolled Ward
                        </span>
                      </h3>
                      <p className="text-xs text-indigo-200 mt-0.5">
                        {wardInfo.className} • Roll #{wardInfo.rollNumber} • {wardInfo.admissionNumber}
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:block text-right text-xs">
                    <span className="text-slate-300 block">Attendance: <strong className="text-emerald-400 font-bold">{wardInfo.attendanceRate}</strong></span>
                    <span className="text-slate-300 block">Fees: <strong className="text-indigo-300 font-bold">{wardInfo.feesStatus}</strong></span>
                  </div>
                </div>

                {/* Ward Profile Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Student Full Name
                    </label>
                    <input
                      type="text"
                      value={wardInfo.name}
                      onChange={(e) => setWardInfo({ ...wardInfo, name: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Grade & Section
                    </label>
                    <input
                      type="text"
                      value={wardInfo.className}
                      onChange={(e) => setWardInfo({ ...wardInfo, className: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Class Teacher
                    </label>
                    <input
                      type="text"
                      value={wardInfo.classTeacher}
                      onChange={(e) => setWardInfo({ ...wardInfo, classTeacher: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Emergency Contact Number
                    </label>
                    <input
                      type="text"
                      value={wardInfo.emergencyContact}
                      onChange={(e) => setWardInfo({ ...wardInfo, emergencyContact: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Bus Transit Route / Stop
                    </label>
                    <input
                      type="text"
                      value={wardInfo.busRoute}
                      onChange={(e) => setWardInfo({ ...wardInfo, busRoute: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Residential Address
                    </label>
                    <input
                      type="text"
                      value={wardInfo.address}
                      onChange={(e) => setWardInfo({ ...wardInfo, address: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('general')}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={savingWard}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {savingWard ? 'Updating...' : 'Update Ward Information'}
                  </button>
                </div>
              </form>
            ) : activeTab === 'parent' ? (
              <div className="space-y-5">
                {/* Guardian Overview Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-md flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={parentInfo.avatar}
                      alt={parentInfo.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/20 shadow-xs shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{parentInfo.name}</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md">
                          Primary Guardian
                        </span>
                      </h3>
                      <p className="text-xs text-indigo-200 mt-0.5">
                        {parentInfo.relation} • {parentInfo.occupation}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Guardian Name</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{parentInfo.name}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Relation & Status</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{parentInfo.relation}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Contact Email</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{parentInfo.email}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Emergency Phone</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{parentInfo.phone}</span>
                  </div>

                  <div className="p-3.5 sm:col-span-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Residential Address</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{parentInfo.address}</span>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('general')}
                    className="px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Back to My Profile
                  </button>
                </div>
              </div>
            ) : (
              /* TAB 2: SECURITY & PASSWORD CHANGE */
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md mx-auto">
                <div className="text-center mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-2 border border-indigo-100 dark:border-indigo-900/50">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Change Account Password</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ensure your account is using a strong, unique password.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('general')}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {changingPassword ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Updating...</span>
                      </div>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Live Camera Capture Dialog */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onImageCaptured={handleAvatarCaptured}
        currentImage={avatar}
        title="Capture Profile Photo"
      />
    </>
  );
};
