import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, User, CheckCircle2, BookmarkCheck } from 'lucide-react';
import api from '../api/axios';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';

export const SubjectsView = ({ showToast }) => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'Theory',
    classId: '',
    teacherId: '',
    totalMarks: 100,
    passMarks: 40,
    description: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subsRes, clsRes, tchRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/classes'),
        api.get('/teachers'),
      ]);
      const sList = Array.isArray(subsRes.data?.data)
        ? subsRes.data.data
        : subsRes.data?.data?.subjects || [];
      const cList = Array.isArray(clsRes.data?.data)
        ? clsRes.data.data
        : clsRes.data?.data?.classes || [];
      const tList = Array.isArray(tchRes.data?.data)
        ? tchRes.data.data
        : tchRes.data?.data?.teachers || [];

      setSubjects(sList);
      setClasses(cList);
      setTeachers(tList);
      if (cList[0]) setFormData((p) => ({ ...p, classId: cList[0]._id }));
      if (tList[0]) setFormData((p) => ({ ...p, teacherId: tList[0]._id }));
    } catch (e) {
      showToast?.({ type: 'error', message: 'Failed to load curriculum' });
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

    try {
      const cls = classes.find((c) => c._id === formData.classId);
      const tch = teachers.find((t) => t._id === formData.teacherId);

      const payload = {
        name: formData.name,
        code: formData.code || `SUB-${Date.now().toString().slice(-4)}`,
        type: formData.type,
        classId: formData.classId || classes[0]?._id || 'cls-1',
        className: cls ? cls.name : 'Grade 10',
        teacherId: formData.teacherId || teachers[0]?._id || 't-1',
        teacherName: tch ? `${tch.firstName} ${tch.lastName}` : 'Faculty',
        totalMarks: Number(formData.totalMarks) || 100,
        passMarks: Number(formData.passMarks) || 40,
        description: formData.description,
      };

      let newSub = null;
      try {
        const res = await api.post('/subjects', payload);
        newSub = res.data?.data || res.data;
      } catch (apiErr) {
        newSub = { ...payload, _id: `sub-${Date.now()}` };
      }

      setSubjects((prev) => [...prev, newSub]);
      setIsAddModalOpen(false);
      showToast?.({
        type: 'success',
        title: 'Subject Added',
        message: `Subject "${newSub.name}" added to curriculum!`,
      });
      setFormData({
        name: '',
        code: '',
        type: 'Theory',
        classId: classes[0]?._id || '',
        teacherId: teachers[0]?._id || '',
        totalMarks: 100,
        passMarks: 40,
        description: 'Comprehensive academic module',
      });
    } catch (err) {
      showToast?.({ type: 'error', title: 'Error', message: err.message || 'Error creating subject' });
    }
  };

  const filtered = Array.isArray(subjects)
    ? subjects.filter(
        (s) =>
          (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
          (s.code || '').toLowerCase().includes(search.toLowerCase()) ||
          (s.className || '').toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const columns = [
    {
      header: 'Subject & Code',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-white block">{row.name}</span>
          <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">{row.code}</span>
        </div>
      ),
    },
    {
      header: 'Assigned Class',
      accessor: 'className',
      render: (row) => <span className="font-medium text-slate-800 dark:text-slate-200">{row.className}</span>,
    },
    {
      header: 'Lead Instructor',
      accessor: 'teacherName',
      render: (row) => <span className="text-slate-700 dark:text-slate-300">{row.teacherName}</span>,
    },
    {
      header: 'Format Type',
      render: (row) => (
        <Badge variant={row.type === 'Both' ? 'purple' : row.type === 'Practical' ? 'warning' : 'primary'}>
          {row.type}
        </Badge>
      ),
    },
    {
      header: 'Grading Criteria',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          Max: <strong className="text-slate-900 dark:text-white">{row.totalMarks}</strong> (Pass: {row.passMarks})
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Curriculum & Subjects</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Academic courses, theoretical & laboratory credit weights, and assigned instructors.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      <Table
        columns={columns}
        data={filtered}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search curriculum by subject name or code..."
      />

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Subject to Curriculum"
        description="Specify course credentials and teaching faculty."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject Title *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. World History & Global Economics"
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. HIST-101"
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Class *</label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Lead Instructor *</label>
              <select
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Theory">Theory</option>
                <option value="Practical">Practical</option>
                <option value="Both">Both (Theory + Lab)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Add Subject
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
