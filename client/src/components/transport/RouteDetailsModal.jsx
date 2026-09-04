import React from 'react';
import {
  Bus,
  MapPin,
  Clock,
  User,
  Phone,
  Shield,
  Fuel,
  Users,
  Calendar,
  Trash2,
  CheckCircle,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

export const RouteDetailsModal = ({
  isOpen,
  onClose,
  route,
  onOpenAssign,
  onRemoveStudent,
  isAdmin = false,
}) => {
  if (!route) return null;

  const assignedStudents = route.assignedStudents || [];
  const capacity = route.capacity || 35;
  const occupancyPercent = Math.min(100, Math.round((assignedStudents.length / capacity) * 100));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${route.routeName} (${route.routeNumber || 'RT-01'})`}
      description={`Vehicle Plate: ${route.vehicleNumber} • Driver: ${route.driverName}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Top summary card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-slate-50 dark:from-indigo-950/30 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/40">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Vehicle Specs</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                {route.vehicleNumber}
              </span>
              <Badge variant="info">{route.vehicleType || 'Bus'}</Badge>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              {route.vehicleModel || 'Standard Coach'}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
              <Fuel className="w-3.5 h-3.5 text-amber-500" />
              <span>Fuel: <strong>{route.fuelType || 'Diesel'}</strong></span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Driver & Contact</span>
            <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              {route.driverName}
            </p>
            <a
              href={`tel:${route.driverPhone}`}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              {route.driverPhone}
            </a>
            <p className="text-[11px] text-slate-500">
              License: <span className="font-mono">{route.driverLicense || 'DL-COMM-2024'}</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Seating Capacity</span>
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                {assignedStudents.length} / {capacity} Seats ({occupancyPercent}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  occupancyPercent >= 90
                    ? 'bg-rose-500'
                    : occupancyPercent >= 70
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
              <span>Status: <strong className="text-emerald-600">{route.status || 'Active'}</strong></span>
              <span>Available: <strong>{Math.max(0, capacity - assignedStudents.length)}</strong></span>
            </div>
          </div>
        </div>

        {/* Route Stops Sequence Timeline */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-indigo-500" />
            Route Stops & Timetable ({route.stops?.length || 0} Stops)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(route.stops || []).map((stop, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <strong className="text-xs text-slate-900 dark:text-white truncate">
                      {stop.stopName}
                    </strong>
                  </div>
                  {stop.fare > 0 && (
                    <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                      ${stop.fare}/mo
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-500" />
                    <span>Pick: <strong>{stop.pickupTime || '07:30 AM'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>Drop: <strong>{stop.dropTime || '03:30 PM'}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Passenger Roster Section */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-500" />
                Assigned Students Passenger Roster ({assignedStudents.length})
              </h4>
              <p className="text-[11px] text-slate-500">
                Students allocated to this route with designated boarding landmarks and seats.
              </p>
            </div>

            {isAdmin && onOpenAssign && (
              <button
                type="button"
                onClick={() => onOpenAssign(route._id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                Assign Student
              </button>
            )}
          </div>

          {assignedStudents.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <Bus className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No students currently assigned to this bus route
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Click "Assign Student" above to allocate students to this vehicle and stop.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Seat</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Class & Adm</th>
                    <th className="py-2.5 px-3">Designated Stop</th>
                    <th className="py-2.5 px-3">Pickup / Drop</th>
                    <th className="py-2.5 px-3">Emergency Phone</th>
                    {isAdmin && <th className="py-2.5 px-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {assignedStudents.map((st, i) => (
                    <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[11px]">
                          {st.seatNumber || `Seat-${i + 1}`}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                        {st.studentName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 text-[11px]">
                        <div>{st.className || 'Grade 10'}</div>
                        <span className="font-mono text-[10px] text-slate-400">{st.admissionNumber}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                          <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span>{st.stopName}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-500">
                        {st.pickupTime || '07:30 AM'} / {st.dropTime || '03:30 PM'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {st.emergencyContact || '—'}
                      </td>
                      {isAdmin && (
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => onRemoveStudent?.(route._id, st.studentId)}
                            title="Unassign student from this route"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
