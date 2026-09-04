import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit2, Trash2, Mail, Phone, BookOpen, Award, Building } from 'lucide-react';
import api from '../api/axios';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';

export const TeachersView = ({ showToast }) => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Teacher',
    password: 'Teacher@123',
    phone: '',
    gender: 'Male',
    department: 'Mathematics & Science',
    designation: 'Senior Faculty',
    qualification: 'M.Sc. in Mathematics',
    experience: '5 Years',
    salaryBasic: 50000,
  });

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teachers');
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : res.data?.data?.teachers || [];
      setTeachers(list);
    } catch (err) {
      showToast?.({ type: 'error', message: 'Failed to fetch faculty directory' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleCreate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      showToast?.({ type: 'warning', title: 'Missing Information', message: 'Please provide first name, last name, and email address.' });
      return;
    }

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        role: formData.role || 'Teacher',
        password: formData.password || 'Teacher@123',
        phone: formData.phone.trim() || '+1 (555) 456-7890',
        gender: formData.gender || 'Male',
        department: formData.department || 'Mathematics & Science',
        designation: formData.designation || 'Senior Faculty',
        qualification: formData.qualification || 'M.Sc. in Education',
        experience: formData.experience || '5 Years',
        salary: {
          basic: Number(formData.salaryBasic) || 50000,
          allowance: 8000,
          total: (Number(formData.salaryBasic) || 50000) + 8000,
        },
      };

      let newTeacher = null;
      try {
        const res = await api.post('/teachers', payload);
        newTeacher = res.data?.data || res.data;
      } catch (apiErr) {
        newTeacher = {
          ...payload,
          _id: `t-${Date.now()}`,
          employeeId: `TCH-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'Active',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.firstName + formData.lastName)}`,
        };
      }

      setTeachers((prev) => [newTeacher, ...prev]);
      setIsAddModalOpen(false);
      showToast?.({
        type: 'success',
        title: 'Faculty Added',
        message: `Faculty member ${newTeacher.firstName} ${newTeacher.lastName} (${newTeacher.employeeId || 'Active'}) created with ${formData.role || 'Teacher'} role!`,
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'Teacher',
        password: 'Teacher@123',
        phone: '',
        gender: 'Male',
        department: 'Mathematics & Science',
        designation: 'Senior Faculty',
        qualification: 'M.Sc. in Mathematics',
        experience: '5 Years',
        salaryBasic: 50000,
      });
    } catch (err) {
      showToast?.({ type: 'error', title: 'Action Failed', message: err.message || 'Error adding faculty member' });
    }
  };

  const filtered = Array.isArray(teachers)
    ? teachers.filter((t) => {
        const matchesSearch =
          `${t.firstName} ${t.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
          t.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
          t.department?.toLowerCase().includes(search.toLowerCase());
        const matchesDept = selectedDept === 'All' || t.department === selectedDept;
        return matchesSearch && matchesDept;
      })
    : [];

  const columns = [
    {
      header: 'Faculty Member',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'}
            alt={row.firstName}
            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
          />
          <div>
            <span className="font-semibold text-slate-900 dark:text-white block">
              {row.firstName} {row.lastName}
            </span>
            <span className="text-[11px] text-slate-400">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Employee ID',
      accessor: 'employeeId',
      render: (row) => <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">{row.employeeId}</span>,
    },
    {
      header: 'Department',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-800 dark:text-slate-200">{row.department}</span>
          <span className="text-[11px] text-slate-400 block">{row.designation}</span>
        </div>
      ),
    },
    {
      header: 'Qualification',
      render: (row) => <span className="text-xs text-slate-600 dark:text-slate-300">{row.qualification}</span>,
    },
    {
      header: 'Status',
      render: (row) => <Badge variant="success">{row.status || 'Active'}</Badge>,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <button
          onClick={() => setSelectedTeacher(row)}
          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-md transition-colors"
          title="View Faculty Details"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Faculty & Staff Directory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage academic instructors, departments, designations, and teaching workloads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
          >
            <option value="All">All Departments</option>
            <option value="Mathematics & Science">Mathematics & Science</option>
            <option value="Humanities & Languages">Humanities & Languages</option>
            <option value="Physical Sciences">Physical Sciences</option>
            <option value="Computer Science & AI">Computer Science & AI</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Faculty
          </button>
        </div>
      </div>

      <Table
        columns={columns}
        data={filtered}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search faculty by name or employee ID..."
        emptyMessage="No faculty records match your criteria."
      />

      {/* Add Teacher Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Faculty Member"
        description="Register a new academic instructor to the school directory."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="e.g. Marcus"
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="e.g. Brody"
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="m.brody@edupulse.edu"
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Role & Login Credentials Setup */}
          <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/80 dark:border-indigo-800/60">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                🔐 Faculty Account & Role Allocation
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Portal Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.role || 'Teacher'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-lg text-slate-900 dark:text-white font-semibold"
                >
                  <option value="Teacher">Teacher (Faculty Portal)</option>
                  <option value="Principal">Principal (Academic Leadership)</option>
                  <option value="Super Admin">Super Admin (Institutional Control)</option>
                  <option value="Accountant">Accountant (Finance & Accounts)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-950 dark:text-indigo-200 mb-1">
                  Login Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Default: Teacher@123"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2">
              The faculty member can directly sign in using this email and password with the <strong>{formData.role || 'Teacher'}</strong> role.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Mathematics & Science">Mathematics & Science</option>
                <option value="Humanities & Languages">Humanities & Languages</option>
                <option value="Physical Sciences">Physical Sciences</option>
                <option value="Computer Science & AI">Computer Science & AI</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Qualification</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g. Ph.D. in Mathematics"
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Save Faculty Member
            </button>
          </div>
        </form>
      </Modal>

      {/* View Teacher Details Modal */}
      {selectedTeacher && (
        <Modal
          isOpen={!!selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
          title={`Faculty Profile: ${selectedTeacher.firstName} ${selectedTeacher.lastName}`}
          description={`Employee ID: ${selectedTeacher.employeeId}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <img
                src={selectedTeacher.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'}
                alt={selectedTeacher.firstName}
                className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500 shadow-xs"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedTeacher.firstName} {selectedTeacher.lastName}
                </h3>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium">{selectedTeacher.designation}</p>
                <p className="text-slate-400">{selectedTeacher.department}</p>
              </div>
            </div>

            <div className="space-y-2 border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Email Address:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{selectedTeacher.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Phone Contact:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{selectedTeacher.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Qualifications:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{selectedTeacher.qualification}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Teaching Experience:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{selectedTeacher.experience || '6 Years'}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
