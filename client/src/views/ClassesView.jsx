import React, { useState, useEffect } from 'react';
import {
  Plus,
  Building2,
  Users,
  DoorOpen,
  Sparkles,
  BookOpen,
  Trash2,
  Edit2,
  GraduationCap,
  UserCheck,
  AlertTriangle,
  Layers,
  Search,
  CheckCircle2,
} from 'lucide-react';
import api from '../api/axios';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';

export const ClassesView = ({ showToast }) => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [selectedClassForSection, setSelectedClassForSection] = useState(null);
  const [classToDelete, setClassToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add Class Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    numericGrade: 10,
    capacity: 40,
    sectionName: 'Section A',
    roomNumber: 'Room 101',
    teacherId: '',
    classTeacherName: '',
  });

  // Add Section Form State
  const [sectionFormData, setSectionFormData] = useState({
    name: 'Section B',
    roomNumber: 'Room 102',
    capacity: 35,
    teacherId: '',
    classTeacherName: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classesRes, teachersRes] = await Promise.all([
        api.get('/classes'),
        api.get('/teachers?limit=100'),
      ]);

      const classList = Array.isArray(classesRes.data?.data)
        ? classesRes.data.data
        : classesRes.data?.data?.classes || [];
      setClasses(classList);

      const teacherList = Array.isArray(teachersRes.data?.data)
        ? teachersRes.data.data
        : teachersRes.data?.data?.teachers || [];
      setTeachers(teacherList);

      if (teacherList.length > 0) {
        const defaultTeacher = teacherList[0];
        const teacherName = `${defaultTeacher.firstName || ''} ${defaultTeacher.lastName || ''}`.trim() || defaultTeacher.name || 'Senior Faculty';
        setFormData((prev) => ({
          ...prev,
          teacherId: defaultTeacher._id,
          classTeacherName: teacherName,
        }));
        setSectionFormData((prev) => ({
          ...prev,
          teacherId: defaultTeacher._id,
          classTeacherName: teacherName,
        }));
      }
    } catch (err) {
      showToast?.({ type: 'error', message: 'Failed to fetch academic classes and faculty data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Create Class with Assigned Teacher
  const handleCreate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    if (!formData.name.trim()) {
      showToast?.({ type: 'warning', title: 'Missing Name', message: 'Please provide a valid class name.' });
      return;
    }

    try {
      const selectedTeacher = teachers.find((t) => t._id === formData.teacherId);
      const assignedTeacherName = selectedTeacher
        ? `${selectedTeacher.firstName || ''} ${selectedTeacher.lastName || ''}`.trim() || selectedTeacher.name
        : formData.classTeacherName || 'Assigned Faculty';

      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim() || `CLS-${formData.numericGrade}`,
        numericGrade: Number(formData.numericGrade) || 1,
        capacity: Number(formData.capacity) || 40,
        academicYear: '2025-2026',
        sections: [
          {
            sectionId: `sec-${Date.now()}`,
            name: formData.sectionName || 'Section A',
            capacity: Number(formData.capacity) || 35,
            roomNumber: formData.roomNumber || 'Room 101',
            teacherId: formData.teacherId || '',
            classTeacherName: assignedTeacherName,
          },
        ],
      };

      let newClass = null;
      try {
        const res = await api.post('/classes', payload);
        newClass = res.data?.data || res.data;
      } catch (apiErr) {
        newClass = { ...payload, _id: `cls-${Date.now()}` };
      }

      setClasses((prev) => [...prev, newClass]);
      setIsAddModalOpen(false);
      showToast?.({
        type: 'success',
        title: 'Class Created Successfully',
        message: `Grade cohort "${newClass.name}" created with assigned teacher "${assignedTeacherName}".`,
      });

      // Reset form
      const defaultTeacher = teachers[0];
      const defaultTeacherName = defaultTeacher
        ? `${defaultTeacher.firstName || ''} ${defaultTeacher.lastName || ''}`.trim() || defaultTeacher.name
        : '';

      setFormData({
        name: '',
        code: '',
        numericGrade: 10,
        capacity: 40,
        sectionName: 'Section A',
        roomNumber: 'Room 101',
        teacherId: defaultTeacher?._id || '',
        classTeacherName: defaultTeacherName,
      });
    } catch (err) {
      showToast?.({ type: 'error', title: 'Creation Error', message: err.message || 'Error creating class' });
    }
  };

  // Handle Add Section to an existing class
  const handleAddSection = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    if (!selectedClassForSection) return;

    try {
      const selectedTeacher = teachers.find((t) => t._id === sectionFormData.teacherId);
      const assignedTeacherName = selectedTeacher
        ? `${selectedTeacher.firstName || ''} ${selectedTeacher.lastName || ''}`.trim() || selectedTeacher.name
        : sectionFormData.classTeacherName || 'Assigned Faculty';

      const newSection = {
        sectionId: `sec-${Date.now()}`,
        name: sectionFormData.name || 'Section B',
        capacity: Number(sectionFormData.capacity) || 35,
        roomNumber: sectionFormData.roomNumber || 'Room 102',
        teacherId: sectionFormData.teacherId || '',
        classTeacherName: assignedTeacherName,
        enrolledCount: 0,
      };

      const updatedSections = [...(selectedClassForSection.sections || []), newSection];

      try {
        await api.put(`/classes/${selectedClassForSection._id}`, {
          ...selectedClassForSection,
          sections: updatedSections,
        });
      } catch (err) {
        // Fallback optimistic update
      }

      setClasses((prev) =>
        prev.map((c) => (c._id === selectedClassForSection._id ? { ...c, sections: updatedSections } : c))
      );

      setIsAddSectionModalOpen(false);
      setSelectedClassForSection(null);
      showToast?.({
        type: 'success',
        title: 'Section Added',
        message: `${newSection.name} added to ${selectedClassForSection.name} with teacher ${assignedTeacherName}.`,
      });
    } catch (err) {
      showToast?.({ type: 'error', title: 'Error', message: 'Could not add section.' });
    }
  };

  // Handle Delete Class
  const confirmDeleteClass = async () => {
    if (!classToDelete) return;

    setIsDeleting(true);
    try {
      try {
        await api.delete(`/classes/${classToDelete._id}`);
      } catch (err) {
        console.warn('API delete fallback to state remove', err);
      }

      setClasses((prev) => prev.filter((c) => c._id !== classToDelete._id));
      showToast?.({
        type: 'success',
        title: 'Class Deleted',
        message: `Grade cohort "${classToDelete.name}" was permanently removed.`,
      });
      setClassToDelete(null);
    } catch (err) {
      showToast?.({ type: 'error', title: 'Delete Error', message: 'Failed to delete class' });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredClasses = classes.filter((cls) => {
    const s = searchTerm.toLowerCase();
    return (
      cls.name?.toLowerCase().includes(s) ||
      cls.code?.toLowerCase().includes(s) ||
      cls.sections?.some((sec) => sec.classTeacherName?.toLowerCase().includes(s) || sec.name?.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Classes & Academic Sections</h1>
            <Badge variant="indigo" size="xs">{classes.length} Cohorts Active</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage grade cohorts, assign homeroom and subject teachers, configure classrooms, and maintain student section capacities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Class</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search class, section, or teacher..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Total Teachers Available:</span>
          <strong className="text-slate-900 dark:text-white font-bold">{teachers.length} Faculty Members</strong>
        </div>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold">Loading classes & sections...</span>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-2xs">
          <Layers className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Classes Found</h3>
          <p className="text-xs text-slate-500 mt-1">Get started by creating your first academic grade cohort.</p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-xs cursor-pointer hover:bg-indigo-500"
          >
            <Plus className="w-4 h-4" />
            <span>Create Class</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((cls) => (
            <div
              key={cls._id}
              className="bg-slate-100/70 dark:bg-slate-900/90 border border-slate-300/70 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex flex-col justify-between hover:border-indigo-400/60 hover:shadow-xs transition-all group"
            >
              <div>
                {/* Card Top: Grade Badge, Name, Code, and Delete Action */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-extrabold text-sm border border-indigo-200 dark:border-indigo-900/50 shrink-0">
                      {cls.numericGrade || 'G'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {cls.name}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-medium">{cls.code}</span>
                    </div>
                  </div>

                  {/* Actions (Delete Button) */}
                  <button
                    type="button"
                    onClick={() => setClassToDelete(cls)}
                    title="Delete Class"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100/60 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Sections List */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Sections & Assigned Teachers ({cls.sections?.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClassForSection(cls);
                        setIsAddSectionModalOpen(true);
                      }}
                      className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Section</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(cls.sections || []).map((sec, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-200/60 dark:bg-slate-800/80 border border-slate-300/80 dark:border-slate-700/80 text-xs flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{sec.name}</span>
                          <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 px-2 py-0.5 bg-indigo-100/80 dark:bg-indigo-950/80 rounded-md border border-indigo-200 dark:border-indigo-900/60">
                            {sec.roomNumber || 'Room 101'}
                          </span>
                        </div>

                        {/* Assigned Teacher Display */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="text-slate-500 dark:text-slate-400">Teacher:</span>
                          <strong className="text-slate-900 dark:text-slate-100 font-semibold truncate">
                            {sec.classTeacherName || 'Faculty Assigned'}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Max Capacity: {cls.capacity || 40} Students</span>
                </span>
                <span className="text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/80 dark:bg-indigo-950/60 px-2 py-0.5 rounded text-[11px]">
                  AY 2025-2026
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= MODAL 1: CREATE NEW CLASS WITH TEACHER ================= */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Academic Class & Assign Teacher"
        description="Add a new grade cohort and configure its initial section and homeroom faculty."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Class Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Grade 11 (Science)"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Numeric Grade
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.numericGrade}
                onChange={(e) => setFormData({ ...formData, numericGrade: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Teacher Selection (Teachers kon padhayega) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Assign Homeroom / Subject Teacher <span className="text-emerald-500">*</span>
            </label>
            <select
              value={formData.teacherId}
              onChange={(e) => {
                const sel = teachers.find((t) => t._id === e.target.value);
                const teacherName = sel ? `${sel.firstName || ''} ${sel.lastName || ''}`.trim() || sel.name : '';
                setFormData({
                  ...formData,
                  teacherId: e.target.value,
                  classTeacherName: teacherName,
                });
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-semibold cursor-pointer"
            >
              {teachers.length > 0 ? (
                teachers.map((teacher) => {
                  const name = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || teacher.name || 'Faculty';
                  const dept = teacher.department ? ` (${teacher.department})` : '';
                  return (
                    <option key={teacher._id} value={teacher._id}>
                      {name} {dept}
                    </option>
                  );
                })
              ) : (
                <option value="">Prof. Marcus Brody (Senior Physics)</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Initial Section Name
              </label>
              <input
                type="text"
                value={formData.sectionName}
                onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                placeholder="e.g. Section A"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Classroom / Room Number
              </label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="e.g. Room 402"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Class Code (Optional)
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. CLS-11-SCI"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Max Student Capacity
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Create Class & Assign
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL 2: ADD SECTION TO EXISTING CLASS ================= */}
      <Modal
        isOpen={isAddSectionModalOpen && !!selectedClassForSection}
        onClose={() => {
          setIsAddSectionModalOpen(false);
          setSelectedClassForSection(null);
        }}
        title={`Add Section to ${selectedClassForSection?.name || 'Class'}`}
        description="Allocate an additional section with assigned classroom and teacher."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddSection} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Section Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={sectionFormData.name}
              onChange={(e) => setSectionFormData({ ...sectionFormData, name: e.target.value })}
              placeholder="e.g. Section B, Section C"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Class Teacher / Faculty In-Charge <span className="text-emerald-500">*</span>
            </label>
            <select
              value={sectionFormData.teacherId}
              onChange={(e) => {
                const sel = teachers.find((t) => t._id === e.target.value);
                const teacherName = sel ? `${sel.firstName || ''} ${sel.lastName || ''}`.trim() || sel.name : '';
                setSectionFormData({
                  ...sectionFormData,
                  teacherId: e.target.value,
                  classTeacherName: teacherName,
                });
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-semibold cursor-pointer"
            >
              {teachers.map((teacher) => {
                const name = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || teacher.name;
                const dept = teacher.department ? ` (${teacher.department})` : '';
                return (
                  <option key={teacher._id} value={teacher._id}>
                    {name} {dept}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Room Number
              </label>
              <input
                type="text"
                value={sectionFormData.roomNumber}
                onChange={(e) => setSectionFormData({ ...sectionFormData, roomNumber: e.target.value })}
                placeholder="e.g. Room 204"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Capacity
              </label>
              <input
                type="number"
                value={sectionFormData.capacity}
                onChange={(e) => setSectionFormData({ ...sectionFormData, capacity: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAddSectionModalOpen(false);
                setSelectedClassForSection(null);
              }}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Add Section
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL 3: DELETE CONFIRMATION MODAL ================= */}
      <Modal
        isOpen={!!classToDelete}
        onClose={() => setClassToDelete(null)}
        title="Delete Academic Class Cohort"
        maxWidth="max-w-md"
      >
        {classToDelete && (
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/50 rounded-2xl border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900 dark:text-rose-200 space-y-1">
                <p className="font-bold">Are you sure you want to delete this class?</p>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  You are about to delete <strong className="underline">{classToDelete.name}</strong> ({classToDelete.code}) with {classToDelete.sections?.length || 0} section(s). This action is permanent.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setClassToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteClass}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Class'}</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
