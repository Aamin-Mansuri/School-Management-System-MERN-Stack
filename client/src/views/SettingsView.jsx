import React, { useEffect, useState } from 'react';
import { School, Database, Shield, Sliders, RefreshCw, CheckCircle2, Save, Sun, Moon, Monitor, Palette } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const SettingsView = ({ showToast }) => {
  const { user } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [resetting, setResetting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [schoolSettings, setSchoolSettings] = useState({
    schoolName: '', schoolCode: '', email: '', phone: '', address: '',
    academicYear: '', currency: '$', timezone: 'Asia/Kolkata', logo: '',
  });

  const loadSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await api.get('/settings');
      const data = res.data?.data || {};
      setSchoolSettings({
        schoolName: data.schoolName || '',
        schoolCode: data.schoolCode || '',
        email: data.schoolEmail || '',
        phone: data.schoolPhone || '',
        address: data.schoolAddress || '',
        academicYear: data.academicYear || '',
        currency: data.currency || '$',
        timezone: data.timezone || 'Asia/Kolkata',
        logo: data.logo || '',
      });
    } catch (err) {
      showToast?.({ type: 'error', message: err.response?.data?.message || 'Failed to load school settings.' });
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => { loadSettings(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!schoolSettings.schoolName.trim()) {
      showToast?.({ type: 'error', message: 'Institution name is required.' });
      return;
    }
    setSaving(true);
    try {
      const res = await api.put('/settings', {
        schoolName: schoolSettings.schoolName,
        schoolCode: schoolSettings.schoolCode,
        schoolEmail: schoolSettings.email,
        schoolPhone: schoolSettings.phone,
        schoolAddress: schoolSettings.address,
        academicYear: schoolSettings.academicYear,
        currency: schoolSettings.currency,
        timezone: schoolSettings.timezone,
        logo: schoolSettings.logo,
      });
      const data = res.data?.data || schoolSettings;
      setSchoolSettings((prev) => ({ ...prev,
        schoolName: data.schoolName ?? prev.schoolName,
        schoolCode: data.schoolCode ?? prev.schoolCode,
        email: data.schoolEmail ?? prev.email,
        phone: data.schoolPhone ?? prev.phone,
        address: data.schoolAddress ?? prev.address,
        academicYear: data.academicYear ?? prev.academicYear,
        currency: data.currency ?? prev.currency,
        timezone: data.timezone ?? prev.timezone,
        logo: data.logo ?? prev.logo,
      }));
      showToast?.({ type: 'success', message: res.data?.message || 'School system preferences updated successfully!' });
    } catch (err) {
      showToast?.({ type: 'error', message: err.response?.data?.message || 'Failed to save school settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Reset database with complete production demo seed dataset?')) return;
    setResetting(true);
    try {
      await api.post('/auth/seed');
      showToast?.({ type: 'success', message: 'Database reset & seeded successfully!' });
      setTimeout(() => window.location.reload(), 800);
    } catch (e) {
      showToast?.({ type: 'error', message: 'Failed to reset data' });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Institution & System Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure school identity, academic calendars, localized currency, and administrative permissions.
        </p>
      </div>

      {/* Global Theme & Appearance Settings */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Global Theme & Interface Appearance</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize the visual palette for all dashboards, tables, and student portals.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Light Theme Card */}
          <button
            type="button"
            onClick={() => {
              setTheme('light');
              showToast?.({ type: 'info', message: 'Theme set to Light Mode' });
            }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
              theme === 'light'
                ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Sun className="w-4 h-4" />
              </div>
              {theme === 'light' && (
                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Light Mode</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Crisp high-contrast layout optimized for daylight environments.
            </p>
          </button>

          {/* Dark Theme Card */}
          <button
            type="button"
            onClick={() => {
              setTheme('dark');
              showToast?.({ type: 'info', message: 'Theme set to Dark Mode' });
            }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
              theme === 'dark'
                ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
              {theme === 'dark' && (
                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Dark Mode</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Deep slate tones engineered for eye comfort and reduced glare.
            </p>
          </button>

          {/* System Mode Card */}
          <button
            type="button"
            onClick={() => {
              setTheme('system');
              showToast?.({ type: 'info', message: 'Theme synced with System Preference' });
            }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
              theme === 'system'
                ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-slate-500/10 text-slate-500 dark:text-slate-400 flex items-center justify-center">
                <Monitor className="w-4 h-4" />
              </div>
              {theme === 'system' && (
                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                  Active ({resolvedTheme})
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">System Auto</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Automatically syncs with your operating system preference.
            </p>
          </button>
        </div>
      </div>

      {/* School Profile Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <School className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">School Profile</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Institution Name</label>
            <input
              type="text"
              disabled={loadingSettings || saving}
              value={schoolSettings.schoolName}
              onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolName: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">School Code / Accreditation</label>
            <input
              type="text"
              disabled={loadingSettings || saving}
              value={schoolSettings.schoolCode}
              onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolCode: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Administrative Email</label>
            <input
              type="email"
              disabled={loadingSettings || saving}
              value={schoolSettings.email}
              onChange={(e) => setSchoolSettings({ ...schoolSettings, email: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Telephone Switchboard</label>
            <input
              type="text"
              disabled={loadingSettings || saving}
              value={schoolSettings.phone}
              onChange={(e) => setSchoolSettings({ ...schoolSettings, phone: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Campus Physical Address</label>
          <input
            type="text"
            disabled={loadingSettings || saving}
            value={schoolSettings.address}
            onChange={(e) => setSchoolSettings({ ...schoolSettings, address: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Active Academic Year</label>
            <select
              disabled={loadingSettings || saving}
              value={schoolSettings.academicYear}
              onChange={(e) => setSchoolSettings({ ...schoolSettings, academicYear: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026 (Current)</option>
              <option value="2026-2027">2026-2027</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Billing Currency</label>
            <input
              type="text"
              disabled={loadingSettings || saving}
              value={schoolSettings.currency}
              onChange={(e) => setSchoolSettings({ ...schoolSettings, currency: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Standard Timezone</label>
            <input
              type="text"
              disabled={loadingSettings || saving}
              value={schoolSettings.timezone}
              onChange={(e) => setSchoolSettings({ ...schoolSettings, timezone: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            Save Preferences
          </button>
        </div>
      </form>

      {/* Security & Audit Trail Governance Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Security & Immutable Audit Trail</h2>
            <p className="text-xs text-slate-500">Cryptographic activity recording for administrative accountability and compliance.</p>
          </div>
        </div>

        <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              Automated Audit Logging Enabled
            </p>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5">
              Tracks user removals, guardian modifications, role escalations, credential changes, and system configurations.
            </p>
          </div>
        </div>
      </div>

      {/* Database Management Card */}
      <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-950/60 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-rose-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Database Operations & Demo Seeder</h2>
            <p className="text-xs text-slate-500">Restore or reseed all academic collections with complete demo dataset.</p>
          </div>
        </div>

        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-100 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Reset to Fresh Demo State</p>
            <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
              Refreshes 10 demo users, students, faculty, classes, fee ledgers, exam schedules, and logistics.
            </p>
          </div>
          <button
            onClick={handleResetData}
            disabled={resetting}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            {resetting ? 'Resetting...' : 'Reseed Database'}
          </button>
        </div>
      </div>
    </div>
  );
};
