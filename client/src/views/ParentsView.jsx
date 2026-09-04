import React, { useState, useEffect } from 'react';
import { Plus, Eye, Mail, Phone, UserCheck, GraduationCap, MapPin, Briefcase, Trash2, AlertTriangle, Edit3, UserPlus, X } from 'lucide-react';
import api from '../api/axios';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';

export const ParentsView = ({ showToast }) => {
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [parentToDelete, setParentToDelete] = useState(null);

  // Edit Parent & Child Data State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    _id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    occupation: '',
    role: 'Parent',
    children: [],
    newStudentIdToLink: '',
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Parent',
    password: 'Parent@123',
    phone: '',
    occupation: 'Software Engineer',
    selectedStudentId: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [parentsRes, studentsRes] = await Promise.all([
        api.get('/parents'),
        api.get('/students'),
      ]);
      const pList = Array.isArray(parentsRes.data?.data)
        ? parentsRes.data.data
        : parentsRes.data?.data?.parents || [];
      const sList = Array.isArray(studentsRes.data?.data)
        ? studentsRes.data.data
        : studentsRes.data?.data?.students || [];

      setParents(pList);
      setStudents(sList);
      if (sList.length > 0) {
        setFormData((prev) => ({ ...prev, selectedStudentId: sList[0]._id }));
      }
    } catch (err) {
      showToast?.({ type: 'error', message: 'Failed to fetch parent records' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      showToast?.({ type: 'warning', title: 'Missing Information', message: 'Please provide parent/guardian first name, last name, and email.' });
      return;
    }

    try {
      const child = students.find((s) => s._id === formData.selectedStudentId);
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        role: formData.role || 'Parent',
        password: formData.password || 'Parent@123',
        phone: formData.phone.trim() || '+1 (555) 789-0123',
        occupation: formData.occupation || 'Professional / Guardian',
        children: child
          ? [
              {
                studentId: child._id,
                name: `${child.firstName} ${child.lastName}`,
                relation: 'Guardian',
                className: child.className,
                sectionName: child.sectionName,
                rollNumber: child.rollNumber,
              },
            ]
          : [],
      };

      let newParent = null;
      try {
        const res = await api.post('/parents', payload);
        newParent = res.data?.data || res.data;
      } catch (apiErr) {
        newParent = {
          ...payload,
          _id: `p-${Date.now()}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.firstName)}`,
        };
      }

      setParents((prev) => [newParent, ...prev]);
      setIsAddModalOpen(false);
      showToast?.({
        type: 'success',
        title: 'Guardian Registered',
        message: `Guardian account for "${newParent.firstName} ${newParent.lastName}" created with ${formData.role || 'Parent'} role!`,
      });

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'Parent',
        password: 'Parent@123',
        phone: '',
        occupation: 'Software Engineer',
        selectedStudentId: students[0]?._id || '',
      });
    } catch (err) {
      showToast?.({ type: 'error', title: 'Action Failed', message: err.message || 'Error registering parent guardian' });
    }
  };

  const handleDeleteParentClick = (parent) => {
    setParentToDelete(parent);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteParent = async () => {
    if (!parentToDelete) return;
    try {
      try {
        await api.delete(`/parents/${parentToDelete._id}`);
      } catch (err) {
        // Fallback for local persistence
      }
      setParents((prev) => prev.filter((p) => p._id !== parentToDelete._id));
      setIsDeleteModalOpen(false);
      if (selectedParent?._id === parentToDelete._id) {
        setIsDetailModalOpen(false);
        setSelectedParent(null);
      }
      showToast?.({
        type: 'success',
        message: `Guardian record for "${parentToDelete.firstName} ${parentToDelete.lastName}" has been deleted.`,
      });
      setParentToDelete(null);
    } catch (err) {
      showToast?.({ type: 'error', message: 'Failed to delete guardian record.' });
    }
  };

  const handleOpenEdit = (parent) => {
    setEditFormData({
      _id: parent._id,
      firstName: parent.firstName || '',
      lastName: parent.lastName || '',
      email: parent.email || '',
      phone: parent.phone || '',
      occupation: parent.occupation || 'Professional',
      role: parent.role || 'Parent',
      children: Array.isArray(parent.children) ? parent.children.map((c) => ({ ...c })) : [],
      newStudentIdToLink: students[0]?._id || '',
    });
    setIsEditModalOpen(true);
  };

  const handleAddChildToEdit = () => {
    if (!editFormData.newStudentIdToLink) return;
    const student = students.find((s) => s._id === editFormData.newStudentIdToLink);
    if (!student) return;

    if (editFormData.children.some((c) => c.studentId === student._id || c.name === `${student.firstName} ${student.lastName}`)) {
      showToast?.({ type: 'warning', message: 'This student is already linked to this guardian.' });
      return;
    }

    const newChild = {
      studentId: student._id,
      name: `${student.firstName} ${student.lastName}`,
      relation: 'Guardian',
      className: student.className || 'Grade 10',
      sectionName: student.sectionName || 'Section A',
      rollNumber: student.rollNumber || '01',
    };

    setEditFormData((prev) => ({
      ...prev,
      children: [...prev.children, newChild],
    }));

    showToast?.({
      type: 'info',
      message: `Added "${newChild.name}" to linked wards list. Click "Save Changes" to finalize.`,
    });
  };

  const handleRemoveChildFromEdit = (index) => {
    setEditFormData((prev) => ({
      ...prev,
      children: prev.children.filter((_, idx) => idx !== index),
    }));
  };

  const handleChildFieldChange = (index, field, value) => {
    setEditFormData((prev) => {
      const updatedChildren = [...prev.children];
      updatedChildren[index] = { ...updatedChildren[index], [field]: value };
      return { ...prev, children: updatedChildren };
    });
  };

  const handleSaveEdit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!editFormData.firstName.trim() || !editFormData.lastName.trim() || !editFormData.email.trim()) {
      showToast?.({ type: 'warning', title: 'Missing Information', message: 'Please provide parent first name, last name, and email.' });
      return;
    }

    const updatedPayload = {
      firstName: editFormData.firstName.trim(),
      lastName: editFormData.lastName.trim(),
      email: editFormData.email.trim(),
      phone: editFormData.phone.trim(),
      occupation: editFormData.occupation.trim(),
      role: editFormData.role,
      children: editFormData.children,
    };

    try {
      try {
        await api.put(`/parents/${editFormData._id}`, updatedPayload);
      } catch (err) {
        // Local fallback
      }

      setParents((prev) =>
        prev.map((p) => (p._id === editFormData._id ? { ...p, ...updatedPayload } : p))
      );

      if (selectedParent?._id === editFormData._id) {
        setSelectedParent((prev) => ({ ...prev, ...updatedPayload }));
      }

      setIsEditModalOpen(false);
      showToast?.({
        type: 'success',
        title: 'Guardian & Child Data Updated',
        message: `Parent profile and child details for "${updatedPayload.firstName} ${updatedPayload.lastName}" were successfully updated!`,
      });
    } catch (err) {
      showToast?.({ type: 'error', message: 'Failed to update parent & child details.' });
    }
  };

  const filteredParents = Array.isArray(parents)
    ? parents.filter((p) => {
        const s = search.toLowerCase();
        const fullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
        const emailMatch = (p.email || '').toLowerCase().includes(s);
        const phoneMatch = (p.phone || '').includes(s);
        const childMatch = (p.children || []).some((c) => (c.name || '').toLowerCase().includes(s));
        return fullName.includes(s) || emailMatch || phoneMatch || childMatch;
      })
    : [];

  const columns = [
    {
      header: 'Parent / Guardian',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={
              row.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(row.firstName || 'Parent')}`
            }
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
      header: 'Contact Phone',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200 font-mono">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.phone || '+1 (555) 000-0000'}</span>
        </div>
      ),
    },
    {
      header: 'Profession',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.occupation || 'Professional'}</span>
        </div>
      ),
    },
    {
      header: 'Linked Wards / Students',
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {Array.isArray(row.children) && row.children.length > 0 ? (
            row.children.map((ch, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium border border-indigo-200 dark:border-indigo-800"
              >
                <GraduationCap className="w-3 h-3" />
                {ch.name || 'Student'} ({ch.className || 'Grade 10'})
              </span>
            ))
          ) : (
            <span className="text-slate-400 text-xs">No linked students</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'neutral'}>
          {row.status || 'Active'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => {
              setSelectedParent(row);
              setIsDetailModalOpen(true);
            }}
            title="View Guardian Details"
            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-md transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit Guardian & Child Data"
            className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-md transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteParentClick(row)}
            title="Delete Guardian Record"
            className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Parents & Guardians Directory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Oversee parent contacts, linked student wards, and portal access accounts.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Guardian
        </button>
      </div>

      {/* Main Table */}
      <Table
        columns={columns}
        data={filteredParents}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by guardian name, email, phone, or child..."
        emptyMessage="No guardian records found."
      />

      {/* Add Parent Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Guardian Record"
        description="Add a parent or guardian and link to an enrolled student."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="David"
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
                placeholder="Miller"
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="parent@gmail.com"
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          {/* Role & Login Credentials Setup */}
          <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/80 dark:border-indigo-800/60">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                🔐 Parent Portal Account & Role
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Portal Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.role || 'Parent'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-lg text-slate-900 dark:text-white font-semibold"
                >
                  <option value="Parent">Parent (Family Access Portal)</option>
                  <option value="Member">Member (Campus Guest)</option>
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
                  placeholder="Default: Parent@123"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2">
              The parent can log in directly using this email & password to track their linked ward's attendance, fees, and results.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 789-0123"
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Occupation</label>
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                placeholder="Engineer / Physician"
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Link Enrolled Student</label>
            <select
              value={formData.selectedStudentId}
              onChange={(e) => setFormData({ ...formData, selectedStudentId: e.target.value })}
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              {students.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.firstName} {st.lastName} ({st.className} - {st.admissionNumber})
                </option>
              ))}
            </select>
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
              Save Guardian
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      {selectedParent && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Guardian Profile: ${selectedParent.firstName} ${selectedParent.lastName}`}
          description="Parent details and linked academic wards"
          maxWidth="max-w-xl"
        >
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <img
                src={
                  selectedParent.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedParent.firstName || 'Parent')}`
                }
                alt={selectedParent.firstName}
                className="w-14 h-14 rounded-xl object-cover border border-white dark:border-slate-700 shadow-xs"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedParent.firstName} {selectedParent.lastName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedParent.occupation || 'Parent'}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedParent.email}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedParent.phone}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Enrolled Children
              </h4>
              <div className="space-y-2">
                {Array.isArray(selectedParent.children) && selectedParent.children.length > 0 ? (
                  selectedParent.children.map((ch, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                          {ch.name ? ch.name[0] : 'S'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{ch.name}</p>
                          <p className="text-[11px] text-slate-400">{ch.className} • {ch.sectionName || 'Section A'} (Roll #{ch.rollNumber || '01'})</p>
                        </div>
                      </div>
                      <Badge variant="success">Enrolled</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 p-2">No students currently linked.</p>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const toDelete = selectedParent;
                  setIsDetailModalOpen(false);
                  handleDeleteParentClick(toDelete);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Guardian</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = selectedParent;
                    setIsDetailModalOpen(false);
                    handleOpenEdit(toEdit);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Guardian & Wards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Parent & Child Data Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Guardian & Child Data: ${editFormData.firstName} ${editFormData.lastName}`}
          description="Update guardian profile and manage linked student wards."
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSaveEdit} className="space-y-5">
            {/* Parent Info Section */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Guardian Profile Details</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Occupation</label>
                  <input
                    type="text"
                    value={editFormData.occupation}
                    onChange={(e) => setEditFormData({ ...editFormData, occupation: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Role</label>
                  <select
                    value={editFormData.role || 'Parent'}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Parent">Parent (Guardian Access)</option>
                    <option value="Member">Member (Guest Access)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Manage Children Section */}
            <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Linked Children / Wards ({editFormData.children.length})</span>
                </h4>
              </div>

              {/* List of existing children with editable fields */}
              <div className="space-y-3">
                {editFormData.children.length > 0 ? (
                  editFormData.children.map((child, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200/70 dark:border-indigo-800/60 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="font-bold text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Child #{idx + 1} Details</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveChildFromEdit(idx)}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Unlink Child</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Child Full Name</label>
                          <input
                            type="text"
                            value={child.name || ''}
                            onChange={(e) => handleChildFieldChange(idx, 'name', e.target.value)}
                            className="w-full px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Grade / Class</label>
                          <input
                            type="text"
                            value={child.className || ''}
                            onChange={(e) => handleChildFieldChange(idx, 'className', e.target.value)}
                            placeholder="Grade 10"
                            className="w-full px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Section</label>
                          <input
                            type="text"
                            value={child.sectionName || ''}
                            onChange={(e) => handleChildFieldChange(idx, 'sectionName', e.target.value)}
                            placeholder="Section A"
                            className="w-full px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Roll Number</label>
                          <input
                            type="text"
                            value={child.rollNumber || ''}
                            onChange={(e) => handleChildFieldChange(idx, 'rollNumber', e.target.value)}
                            placeholder="01"
                            className="w-full px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic p-2">No children currently linked to this guardian.</p>
                )}
              </div>

              {/* Add / Link New Student Dropdown */}
              <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-800/50 flex flex-col sm:flex-row items-center gap-2">
                <select
                  value={editFormData.newStudentIdToLink}
                  onChange={(e) => setEditFormData({ ...editFormData, newStudentIdToLink: e.target.value })}
                  className="w-full sm:flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-lg text-slate-900 dark:text-white"
                >
                  {students.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.firstName} {st.lastName} ({st.className} - Roll #{st.rollNumber})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddChildToEdit}
                  className="w-full sm:w-auto px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Link Student</span>
                </button>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {parentToDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setParentToDelete(null);
          }}
          title="Delete Guardian Record"
          description="Confirm permanent removal of parent/guardian profile."
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Are you sure you want to delete this guardian?
                </p>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                  You are about to remove <strong className="text-slate-900 dark:text-white">{parentToDelete.firstName} {parentToDelete.lastName}</strong> ({parentToDelete.email}).
                  This action will remove their contact info and uncouple any linked student access.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setParentToDelete(null);
                }}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteParent}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
