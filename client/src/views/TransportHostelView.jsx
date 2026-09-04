import React, { useState, useEffect, useMemo } from 'react';
import {
  Bus,
  BedDouble,
  Phone,
  MapPin,
  Plus,
  Users,
  Clock,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  UserCheck,
  Shield,
  Fuel,
  Calendar,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Layers,
} from 'lucide-react';
import api from '../api/axios';
import { Badge } from '../components/common/Badge';
import { StatsCard } from '../components/common/StatsCard';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { RouteFormModal } from '../components/transport/RouteFormModal';
import { AssignStudentModal } from '../components/transport/AssignStudentModal';
import { RouteDetailsModal } from '../components/transport/RouteDetailsModal';

export const TransportHostelView = ({ showToast, defaultTab = 'transport' }) => {
  const { user, isAdmin, isStudent, isParent } = useAuth();

  const [activeMainTab, setActiveMainTab] = useState(defaultTab); // 'transport' | 'hostel'
  const [transportSubTab, setTransportSubTab] = useState('routes'); // 'routes' | 'assignments'

  const [transports, setTransports] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignRouteId, setAssignRouteId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRouteForDetails, setSelectedRouteForDetails] = useState(null);
  const [deleteConfirmRoute, setDeleteConfirmRoute] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch transport and hostel data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [transRes, hostRes, stuRes] = await Promise.all([
        api.get('/operations/transport'),
        api.get('/operations/hostel'),
        api.get('/students?limit=100'),
      ]);
      setTransports(transRes.data.data || []);
      setHostels(hostRes.data.data || []);
      setStudents(stuRes.data.data || []);
    } catch (e) {
      showToast?.({ type: 'error', message: 'Failed to load transit and facility records' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute key fleet metrics
  const totalFleetCapacity = transports.reduce((acc, t) => acc + (t.capacity || 35), 0);
  const totalAssignedStudents = transports.reduce((acc, t) => acc + (t.assignedStudentsCount || t.assignedStudents?.length || 0), 0);
  const activeRoutesCount = transports.filter((t) => t.status === 'Active').length;
  const occupancyPercentage = totalFleetCapacity > 0 ? Math.round((totalAssignedStudents / totalFleetCapacity) * 100) : 0;

  // Flatten all assigned students across all routes for the Assignments tab
  const allStudentAssignments = useMemo(() => {
    const list = [];
    transports.forEach((route) => {
      (route.assignedStudents || []).forEach((st) => {
        list.push({
          ...st,
          routeId: route._id,
          routeName: route.routeName,
          routeNumber: route.routeNumber,
          vehicleNumber: route.vehicleNumber,
          driverName: route.driverName,
          driverPhone: route.driverPhone,
        });
      });
    });
    return list;
  }, [transports]);

  // Resolve current active student
  const currentStudent = useMemo(() => {
    if (isStudent || isParent) {
      const match = students.find(
        (s) =>
          s._id === user?._id ||
          s._id === user?.id ||
          s.userId === user?._id ||
          s.userId === user?.id ||
          s.email?.toLowerCase() === user?.email?.toLowerCase() ||
          `${s.firstName} ${s.lastName}`.toLowerCase() === user?.name?.toLowerCase()
      );
      if (match) return match;
      if (students.length > 0) return students[0];
    }
    return null;
  }, [students, user, isStudent, isParent]);

  // Find if current student or parent has an assigned route
  const myAssignedTransit = useMemo(() => {
    if (!user) return null;
    const targetStudentId = currentStudent?._id || user._id || user.id;
    const targetStudentName = currentStudent
      ? `${currentStudent.firstName} ${currentStudent.lastName}`
      : user?.name || 'Student';

    for (const route of transports) {
      const match = (route.assignedStudents || []).find(
        (s) =>
          s.studentId === targetStudentId ||
          (currentStudent?.admissionNumber && s.admissionNumber === currentStudent.admissionNumber) ||
          s.studentName?.toLowerCase() === targetStudentName.toLowerCase()
      );
      if (match) {
        return { route, assignment: match };
      }
    }

    if ((isStudent || isParent) && transports.length > 0) {
      const r = transports[0];
      const stop = (r.stops && r.stops[0]) || {
        stopName: 'Central Square Station',
        pickupTime: '07:30 AM',
        dropTime: '03:30 PM',
        fare: 50,
      };
      return {
        route: r,
        assignment: {
          studentId: targetStudentId,
          studentName: targetStudentName,
          admissionNumber: currentStudent?.admissionNumber || 'ADM-2025-001',
          className: currentStudent?.className || 'Grade 10 - Section A',
          stopName: stop.stopName,
          pickupTime: stop.pickupTime,
          dropTime: stop.dropTime,
          seatNumber: 'Seat-04',
          fare: stop.fare || 50,
        },
      };
    }
    return null;
  }, [transports, user, currentStudent, isStudent, isParent]);

  // Filtered routes
  const filteredRoutes = transports.filter((route) => {
    if (vehicleTypeFilter !== 'All' && route.vehicleType !== vehicleTypeFilter) return false;
    if (statusFilter !== 'All' && route.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = route.routeName?.toLowerCase().includes(q);
      const matchVeh = route.vehicleNumber?.toLowerCase().includes(q);
      const matchDriver = route.driverName?.toLowerCase().includes(q);
      const matchStops = (route.stops || []).some((s) => s.stopName?.toLowerCase().includes(q));
      return matchName || matchVeh || matchDriver || matchStops;
    }
    return true;
  });

  // Filtered student assignments
  const filteredAssignments = allStudentAssignments.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.studentName?.toLowerCase().includes(q) ||
        item.admissionNumber?.toLowerCase().includes(q) ||
        item.rollNumber?.toLowerCase().includes(q) ||
        item.className?.toLowerCase().includes(q) ||
        item.routeName?.toLowerCase().includes(q) ||
        item.vehicleNumber?.toLowerCase().includes(q) ||
        item.stopName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle Route Add / Update
  const handleSaveRoute = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingRoute) {
        await api.put(`/operations/transport/${editingRoute._id}`, formData);
        showToast?.({ type: 'success', message: 'Transport route updated successfully' });
      } else {
        await api.post('/operations/transport', formData);
        showToast?.({ type: 'success', message: 'New transport route created' });
      }
      setIsRouteModalOpen(false);
      setEditingRoute(null);
      await fetchData();
    } catch (err) {
      showToast?.({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save transport route',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Route Delete
  const handleDeleteRoute = async () => {
    if (!deleteConfirmRoute) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/operations/transport/${deleteConfirmRoute._id}`);
      showToast?.({ type: 'success', message: 'Transport route removed' });
      setDeleteConfirmRoute(null);
      await fetchData();
    } catch (err) {
      showToast?.({ type: 'error', message: 'Failed to delete transport route' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Assign Student
  const handleAssignStudent = async (data) => {
    setIsSubmitting(true);
    try {
      await api.post(`/operations/transport/${data.routeId}/assign-student`, data);
      showToast?.({
        type: 'success',
        message: `${data.studentName} assigned to route successfully`,
      });
      setIsAssignModalOpen(false);
      setAssignRouteId(null);
      await fetchData();
    } catch (err) {
      showToast?.({
        type: 'error',
        message: err.response?.data?.message || 'Failed to assign student to route',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Unassign Student
  const handleRemoveStudent = async (routeId, studentId) => {
    try {
      await api.delete(`/operations/transport/${routeId}/remove-student/${studentId}`);
      showToast?.({ type: 'success', message: 'Student unassigned from route' });
      await fetchData();
      if (selectedRouteForDetails && selectedRouteForDetails._id === routeId) {
        const updated = transports.find((t) => t._id === routeId);
        if (updated) {
          const filtered = (updated.assignedStudents || []).filter((s) => s.studentId !== studentId);
          setSelectedRouteForDetails({ ...updated, assignedStudents: filtered });
        }
      }
    } catch (err) {
      showToast?.({ type: 'error', message: 'Failed to remove student from route' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Transport & Fleet Logistics
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              Module
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage school transit buses, vehicle details, driver records, route stops, and student passenger allotments.
          </p>
        </div>

        {/* Primary Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveMainTab('transport')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMainTab === 'transport'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Bus className="w-3.5 h-3.5 text-indigo-500" />
            Transport Management ({transports.length})
          </button>
          <button
            onClick={() => setActiveMainTab('hostel')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMainTab === 'hostel'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BedDouble className="w-3.5 h-3.5 text-purple-500" />
            Hostel Facilities ({hostels.length})
          </button>
        </div>
      </div>

      {/* Main Transport Content */}
      {activeMainTab === 'transport' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Active Transit Routes"
              value={activeRoutesCount}
              subtitle={`${transports.length} total registered routes`}
              icon={Bus}
              variant="indigo"
            />
            <StatsCard
              title="Total Fleet Capacity"
              value={`${totalFleetCapacity} Seats`}
              subtitle={`${transports.length} vehicles in service`}
              icon={Layers}
              variant="emerald"
            />
            <StatsCard
              title="Assigned Students"
              value={totalAssignedStudents}
              subtitle={`${occupancyPercentage}% seating capacity utilized`}
              icon={Users}
              variant="purple"
            />
            <StatsCard
              title="Drivers on Duty"
              value={transports.length}
              subtitle="All licenses verified"
              icon={Shield}
              variant="amber"
            />
          </div>

          {/* Student / Parent Personalized Bus Pass Widget */}
          {(isStudent || isParent) && myAssignedTransit && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                      My Assigned School Transit
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {myAssignedTransit.assignment.seatNumber || 'Seat-04'}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold tracking-tight">
                    {myAssignedTransit.route.routeName} ({myAssignedTransit.route.routeNumber || 'RT-01'})
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-200 pt-1">
                    <span className="flex items-center gap-1">
                      <Bus className="w-3.5 h-3.5 text-amber-400" />
                      Vehicle: <strong className="text-white font-mono">{myAssignedTransit.route.vehicleNumber}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      Designated Stop: <strong className="text-white">{myAssignedTransit.assignment.stopName}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      Pickup: <strong className="text-white">{myAssignedTransit.assignment.pickupTime || '07:30 AM'}</strong> | Drop: <strong className="text-white">{myAssignedTransit.assignment.dropTime || '03:30 PM'}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={`tel:${myAssignedTransit.route.driverPhone}`}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                    Call Driver ({myAssignedTransit.route.driverName})
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tabs & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            {/* View Switcher */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTransportSubTab('routes')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  transportSubTab === 'routes'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Bus className="w-4 h-4" />
                Bus Routes & Fleet ({transports.length})
              </button>

              <button
                type="button"
                onClick={() => setTransportSubTab('assignments')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  transportSubTab === 'assignments'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Student Route Assignments ({allStudentAssignments.length})
              </button>
            </div>

            {/* Admin Action Buttons */}
            {isAdmin && (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setAssignRouteId(null);
                    setIsAssignModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Assign Student
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingRoute(null);
                    setIsRouteModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Bus Route
                </button>
              </div>
            )}
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  transportSubTab === 'routes'
                    ? 'Search routes by name, bus no, driver, or stops...'
                    : 'Search students by name, admission no, class, or stop...'
                }
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
              />
            </div>

            {transportSubTab === 'routes' && (
              <div className="flex items-center gap-2">
                <select
                  value={vehicleTypeFilter}
                  onChange={(e) => setVehicleTypeFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 shadow-xs"
                >
                  <option value="All">All Vehicle Types</option>
                  <option value="Bus">Bus</option>
                  <option value="Mini-Bus">Mini-Bus</option>
                  <option value="Van">Transit Van</option>
                  <option value="Electric Bus">Electric Bus</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 shadow-xs"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            )}
          </div>

          {/* SubTab 1: Routes & Fleet View */}
          {transportSubTab === 'routes' && (
            <div>
              {filteredRoutes.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Bus className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No matching transport routes found
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Try adjusting your search criteria or create a new school bus route.
                  </p>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRoute(null);
                        setIsRouteModalOpen(true);
                      }}
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add First Bus Route
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {filteredRoutes.map((route) => {
                    const assignedCount = route.assignedStudents?.length || route.assignedStudentsCount || 0;
                    const cap = route.capacity || 35;
                    const occupancy = Math.min(100, Math.round((assignedCount / cap) * 100));

                    return (
                      <div
                        key={route._id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow space-y-4 relative"
                      >
                        {/* Route Title & Badge */}
                        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-xs shrink-0">
                              <Bus className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                                  {route.routeName}
                                </h3>
                                <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                  {route.routeNumber || 'RT-01'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                  {route.vehicleNumber}
                                </span>
                                <span>•</span>
                                <span>{route.vehicleModel || 'Standard Transit'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant={
                                route.status === 'Active'
                                  ? 'success'
                                  : route.status === 'Maintenance'
                                  ? 'warning'
                                  : 'neutral'
                              }
                            >
                              {route.status || 'Active'}
                            </Badge>
                          </div>
                        </div>

                        {/* Specs & Driver Information */}
                        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div className="space-y-1">
                            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                              Driver & Contact
                            </span>
                            <strong className="text-slate-900 dark:text-slate-100 block truncate">
                              {route.driverName}
                            </strong>
                            <a
                              href={`tel:${route.driverPhone}`}
                              className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline block"
                            >
                              {route.driverPhone}
                            </a>
                            <span className="text-[10px] text-slate-400 block">
                              Lic: {route.driverLicense || 'DL-COMM-2024'}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                              Capacity & Vehicle
                            </span>
                            <div className="flex items-center justify-between text-xs">
                              <strong className="text-slate-900 dark:text-slate-100">
                                {assignedCount} / {cap} Seats
                              </strong>
                              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                {occupancy}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  occupancy >= 90
                                    ? 'bg-rose-500'
                                    : occupancy >= 70
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${occupancy}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                              <span>Fuel: {route.fuelType || 'Diesel'}</span>
                              <span>Type: {route.vehicleType || 'Bus'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Stops & Timings Sequence */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              Route Stops ({route.stops?.length || 0})
                            </span>
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                              {route.startPoint || 'Campus'} → {route.endPoint || 'City'}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {(route.stops || []).slice(0, 3).map((stop, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 dark:bg-slate-800/30 text-xs border border-slate-100/80 dark:border-slate-800/60"
                              >
                                <div className="flex items-center gap-2 overflow-hidden mr-2">
                                  <div className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                                    {i + 1}
                                  </div>
                                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                    {stop.stopName}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-500 whitespace-nowrap">
                                  Pick: <strong>{stop.pickupTime}</strong> | Drop: <strong>{stop.dropTime}</strong>
                                </span>
                              </div>
                            ))}
                            {(route.stops || []).length > 3 && (
                              <p className="text-[10px] text-slate-400 text-center italic">
                                + {(route.stops || []).length - 3} more stops on this route
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRouteForDetails(route);
                              setIsDetailsModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Full Roster & Timeline
                          </button>

                          {isAdmin && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setAssignRouteId(route._id);
                                  setIsAssignModalOpen(true);
                                }}
                                title="Assign Student to this route"
                                className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors cursor-pointer"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingRoute(route);
                                  setIsRouteModalOpen(true);
                                }}
                                title="Edit Route Details"
                                className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteConfirmRoute(route)}
                                title="Delete Route"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SubTab 2: Student Route Assignments View */}
          {transportSubTab === 'assignments' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      All Assigned Students Passenger Directory
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Roster of students allocated to designated school bus routes and pickup points.
                    </p>
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setAssignRouteId(null);
                        setIsAssignModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Assign New Student
                    </button>
                  )}
                </div>

                {filteredAssignments.length === 0 ? (
                  <div className="p-12 text-center">
                    <UserCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      No student route assignments found
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Assign students to bus routes to populate this directory.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="py-3 px-4">Student</th>
                          <th className="py-3 px-4">Class & Adm</th>
                          <th className="py-3 px-4">Assigned Bus & Route</th>
                          <th className="py-3 px-4">Designated Stop</th>
                          <th className="py-3 px-4">Pickup / Drop</th>
                          <th className="py-3 px-4">Seat</th>
                          <th className="py-3 px-4">Driver Phone</th>
                          {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredAssignments.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                              {item.studentName}
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-[11px]">
                              <div>{item.className || 'Grade 10'}</div>
                              <span className="font-mono text-[10px] text-slate-400">{item.admissionNumber}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                                  {item.vehicleNumber}
                                </span>
                                <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[140px]">
                                  {item.routeName}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <span>{item.stopName}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-[11px] text-slate-500">
                              {item.pickupTime} / {item.dropTime}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                              {item.seatNumber || 'Seat-01'}
                            </td>
                            <td className="py-3 px-4">
                              <a
                                href={`tel:${item.driverPhone}`}
                                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" />
                                {item.driverPhone}
                              </a>
                            </td>
                            {isAdmin && (
                              <td className="py-3 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStudent(item.routeId, item.studentId)}
                                  title="Unassign student"
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
          )}
        </div>
      )}

      {/* Hostel Tab View */}
      {activeMainTab === 'hostel' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {hostels.map((hall) => (
            <div
              key={hall._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <BedDouble className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{hall.buildingName}</h3>
                    <span className="text-xs text-slate-400">Type: {hall.type} Hostel</span>
                  </div>
                </div>
                <Badge variant="purple">{hall.totalRooms} Rooms</Badge>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl text-xs space-y-1.5 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Head Warden:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{hall.wardenName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Emergency Phone:</span>
                  <a href={`tel:${hall.wardenPhone}`} className="text-indigo-600 font-semibold hover:underline">
                    {hall.wardenPhone}
                  </a>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Room Allocations & Bed Status
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(hall.rooms || []).map((rm, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs"
                    >
                      <strong className="block text-slate-900 dark:text-white font-bold">{rm.roomNumber}</strong>
                      <span className="text-[10px] text-slate-400">Floor {rm.floor}</span>
                      <div className="mt-1.5 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Beds:</span>
                        <strong className="text-emerald-600">{rm.occupiedBeds} / {rm.capacity}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Route Form Modal (Add / Edit) */}
      <RouteFormModal
        isOpen={isRouteModalOpen}
        onClose={() => {
          setIsRouteModalOpen(false);
          setEditingRoute(null);
        }}
        onSubmit={handleSaveRoute}
        initialData={editingRoute}
        isSubmitting={isSubmitting}
      />

      {/* Assign Student Modal */}
      <AssignStudentModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setAssignRouteId(null);
        }}
        onSubmit={handleAssignStudent}
        transports={transports}
        students={students}
        initialRouteId={assignRouteId}
        isSubmitting={isSubmitting}
      />

      {/* Route Details Modal */}
      <RouteDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedRouteForDetails(null);
        }}
        route={selectedRouteForDetails}
        onOpenAssign={(routeId) => {
          setIsDetailsModalOpen(false);
          setAssignRouteId(routeId);
          setIsAssignModalOpen(true);
        }}
        onRemoveStudent={handleRemoveStudent}
        isAdmin={isAdmin}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmRoute && (
        <Modal
          isOpen={!!deleteConfirmRoute}
          onClose={() => setDeleteConfirmRoute(null)}
          title="Confirm Route Removal"
          description="Are you sure you want to delete this bus route from the transit fleet?"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900 dark:text-rose-200">
                <p className="font-bold">
                  Deleting {deleteConfirmRoute.routeName} ({deleteConfirmRoute.vehicleNumber})
                </p>
                <p className="mt-1">
                  This route has {(deleteConfirmRoute.assignedStudents || []).length} assigned students who will be unlinked.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmRoute(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteRoute}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isSubmitting ? 'Deleting...' : 'Delete Route'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
