import React, { useState, useEffect } from 'react';
import { UserCheck, Bus, MapPin, Search, AlertCircle, Check, Phone, Shield } from 'lucide-react';
import { Modal } from '../common/Modal';

export const AssignStudentModal = ({
  isOpen,
  onClose,
  onSubmit,
  transports = [],
  students = [],
  initialRouteId = null,
  isSubmitting = false,
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStopName, setSelectedStopName] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (initialRouteId) {
      setSelectedRouteId(initialRouteId);
    } else if (transports.length > 0 && !selectedRouteId) {
      setSelectedRouteId(transports[0]._id);
    }
  }, [initialRouteId, transports, isOpen]);

  const activeRoute = transports.find((t) => t._id === selectedRouteId);

  // Auto set stop when route changes
  useEffect(() => {
    if (activeRoute && activeRoute.stops && activeRoute.stops.length > 0) {
      setSelectedStopName(activeRoute.stops[0].stopName);
    } else {
      setSelectedStopName('');
    }
  }, [selectedRouteId]);

  // Filter students based on search term
  const filteredStudents = students.filter((st) => {
    if (!searchStudent) return true;
    const s = searchStudent.toLowerCase();
    const fullName = `${st.firstName || ''} ${st.lastName || ''}`.toLowerCase();
    return (
      fullName.includes(s) ||
      (st.admissionNumber && st.admissionNumber.toLowerCase().includes(s)) ||
      (st.rollNumber && st.rollNumber.toLowerCase().includes(s)) ||
      (st.className && st.className.toLowerCase().includes(s))
    );
  });

  const selectedStudent = students.find((st) => st._id === selectedStudentId);

  useEffect(() => {
    if (selectedStudent) {
      setEmergencyPhone(
        selectedStudent.emergencyContact?.phone ||
        selectedStudent.phone ||
        selectedStudent.parentInfo?.parentPhone ||
        ''
      );
      if (!seatNumber && activeRoute) {
        const nextSeat = (activeRoute.assignedStudentsCount || 0) + 1;
        setSeatNumber(`Seat-${String(nextSeat).padStart(2, '0')}`);
      }
    }
  }, [selectedStudentId, activeRoute]);

  const handleRouteSelect = (e) => {
    setSelectedRouteId(e.target.value);
  };

  const handleStudentSelect = (e) => {
    setSelectedStudentId(e.target.value);
    if (formErrors.student) {
      setFormErrors((prev) => ({ ...prev, student: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!selectedRouteId) errors.route = 'Please select a transit route';
    if (!selectedStudentId) errors.student = 'Please select a student from the directory';
    if (!selectedStopName) errors.stop = 'Please select a pickup/drop stop';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const stopObj = activeRoute?.stops?.find((s) => s.stopName === selectedStopName);

    onSubmit({
      routeId: selectedRouteId,
      studentId: selectedStudentId,
      studentName: selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : 'Assigned Student',
      rollNumber: selectedStudent?.rollNumber || '',
      admissionNumber: selectedStudent?.admissionNumber || '',
      className: selectedStudent?.className || '',
      sectionName: selectedStudent?.sectionName || '',
      stopName: selectedStopName,
      pickupTime: stopObj?.pickupTime || '07:30 AM',
      dropTime: stopObj?.dropTime || '03:30 PM',
      fare: stopObj?.fare || 50,
      seatNumber: seatNumber || 'Seat-01',
      emergencyContact: emergencyPhone || '',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Student to Bus Route"
      description="Allot designated school transit route, pickup point, timing, and seat assignment."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1: Select Bus Route */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Select Transit Bus Route *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {transports.map((t) => {
              const isSelected = t._id === selectedRouteId;
              const isFull = (t.assignedStudentsCount || 0) >= (t.capacity || 35);
              return (
                <button
                  type="button"
                  key={t._id}
                  onClick={() => setSelectedRouteId(t._id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                    <Bus className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {t.routeName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        {t.vehicleNumber}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        • {t.assignedStudentsCount || 0}/{t.capacity || 35} Seats
                      </span>
                    </div>
                    {isFull && (
                      <span className="inline-block text-[9px] font-bold uppercase text-amber-600 mt-1">
                        Near / At Capacity
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {formErrors.route && <p className="text-[11px] text-rose-500 mt-1">{formErrors.route}</p>}
        </div>

        {/* Step 2: Select Student */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Select Student *
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              placeholder="Search student by name, roll, class, or admission no..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            size={4}
            value={selectedStudentId}
            onChange={handleStudentSelect}
            className={`w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border ${
              formErrors.student ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
            } focus:ring-2 focus:ring-indigo-500`}
          >
            {filteredStudents.length === 0 ? (
              <option disabled value="">No matching students found</option>
            ) : (
              filteredStudents.map((st) => (
                <option key={st._id} value={st._id} className="p-1.5 rounded hover:bg-indigo-50">
                  {st.firstName} {st.lastName} ({st.className || 'Grade 10'} • Adm: {st.admissionNumber} • Roll: {st.rollNumber})
                </option>
              ))
            )}
          </select>
          {formErrors.student && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.student}</p>}
        </div>

        {/* Step 3: Pick Stop & Seat */}
        {activeRoute && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Designated Boarding Stop *
                </label>
                <select
                  value={selectedStopName}
                  onChange={(e) => setSelectedStopName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500"
                >
                  {(activeRoute.stops || []).map((s, idx) => (
                    <option key={idx} value={s.stopName}>
                      {s.stopName} (Pickup: {s.pickupTime} | Drop: {s.dropTime}) - ${s.fare || 50}/mo
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Seat Number
                </label>
                <input
                  type="text"
                  value={seatNumber}
                  onChange={(e) => setSeatNumber(e.target.value)}
                  placeholder="e.g. Seat-04"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Emergency Phone / Guardian Contact
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Selected stop info preview */}
            {selectedStopName && (
              <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">{selectedStopName}</strong>
                    <p className="text-[11px] text-slate-500">
                      Vehicle: <span className="font-mono font-semibold">{activeRoute.vehicleNumber}</span> ({activeRoute.driverName})
                    </p>
                  </div>
                </div>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  ${activeRoute.stops?.find((s) => s.stopName === selectedStopName)?.fare || 50}/mo
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !selectedStudentId}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-md transition-colors disabled:opacity-60 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            {isSubmitting ? 'Assigning Student...' : 'Confirm Route Assignment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
