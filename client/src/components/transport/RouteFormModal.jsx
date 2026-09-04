import React, { useState, useEffect } from 'react';
import { Bus, MapPin, Plus, Trash2, Shield, Calendar, Fuel, User, Phone, Check, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';

export const RouteFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    routeName: '',
    routeNumber: '',
    startPoint: 'Campus Main Gate',
    endPoint: 'City Center',
    vehicleNumber: '',
    vehicleModel: '',
    vehicleType: 'Bus',
    fuelType: 'Diesel',
    insuranceValidity: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    driverName: '',
    driverPhone: '',
    driverLicense: '',
    driverEmergencyPhone: '',
    capacity: 35,
    status: 'Active',
    stops: [
      { stopName: 'Central Metro Plaza', pickupTime: '07:15 AM', dropTime: '03:45 PM', fare: 75, sequence: 1 },
      { stopName: 'Oak Ridge Boulevard', pickupTime: '07:30 AM', dropTime: '03:30 PM', fare: 60, sequence: 2 },
      { stopName: 'North Gate Terminal', pickupTime: '07:50 AM', dropTime: '03:10 PM', fare: 45, sequence: 3 },
    ],
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        routeName: initialData.routeName || '',
        routeNumber: initialData.routeNumber || '',
        startPoint: initialData.startPoint || 'Campus Main Gate',
        endPoint: initialData.endPoint || 'City Center',
        vehicleNumber: initialData.vehicleNumber || '',
        vehicleModel: initialData.vehicleModel || '',
        vehicleType: initialData.vehicleType || 'Bus',
        fuelType: initialData.fuelType || 'Diesel',
        insuranceValidity: initialData.insuranceValidity || '',
        driverName: initialData.driverName || '',
        driverPhone: initialData.driverPhone || '',
        driverLicense: initialData.driverLicense || '',
        driverEmergencyPhone: initialData.driverEmergencyPhone || '',
        capacity: initialData.capacity || 35,
        status: initialData.status || 'Active',
        stops: initialData.stops && initialData.stops.length > 0 ? initialData.stops : [
          { stopName: 'Central Metro Plaza', pickupTime: '07:15 AM', dropTime: '03:45 PM', fare: 75, sequence: 1 },
        ],
      });
    } else {
      setFormData({
        routeName: '',
        routeNumber: `RT-${Math.floor(100 + Math.random() * 900)}`,
        startPoint: 'Campus Main Gate',
        endPoint: 'City Center',
        vehicleNumber: '',
        vehicleModel: '',
        vehicleType: 'Bus',
        fuelType: 'Diesel',
        insuranceValidity: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        driverName: '',
        driverPhone: '',
        driverLicense: '',
        driverEmergencyPhone: '',
        capacity: 35,
        status: 'Active',
        stops: [
          { stopName: 'Central Metro Plaza', pickupTime: '07:15 AM', dropTime: '03:45 PM', fare: 75, sequence: 1 },
          { stopName: 'Oak Ridge Boulevard', pickupTime: '07:30 AM', dropTime: '03:30 PM', fare: 60, sequence: 2 },
          { stopName: 'North Gate Terminal', pickupTime: '07:50 AM', dropTime: '03:10 PM', fare: 45, sequence: 3 },
        ],
      });
    }
    setFormErrors({});
  }, [initialData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleStopChange = (index, field, value) => {
    const updatedStops = [...formData.stops];
    updatedStops[index] = { ...updatedStops[index], [field]: value };
    setFormData((prev) => ({ ...prev, stops: updatedStops }));
  };

  const addStop = () => {
    const nextSeq = formData.stops.length + 1;
    setFormData((prev) => ({
      ...prev,
      stops: [
        ...prev.stops,
        {
          stopName: `Stop ${nextSeq}`,
          pickupTime: '07:45 AM',
          dropTime: '03:15 PM',
          fare: 50,
          sequence: nextSeq,
        },
      ],
    }));
  };

  const removeStop = (index) => {
    if (formData.stops.length <= 1) return;
    const updatedStops = formData.stops
      .filter((_, i) => i !== index)
      .map((stop, idx) => ({ ...stop, sequence: idx + 1 }));
    setFormData((prev) => ({ ...prev, stops: updatedStops }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.routeName.trim()) errors.routeName = 'Route name is required';
    if (!formData.vehicleNumber.trim()) errors.vehicleNumber = 'Vehicle/Bus number is required';
    if (!formData.driverName.trim()) errors.driverName = 'Driver name is required';
    if (!formData.driverPhone.trim()) errors.driverPhone = 'Driver phone is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    onSubmit({
      ...formData,
      capacity: Number(formData.capacity) || 35,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transport Bus Route' : 'Create New Transport Bus Route'}
      description="Configure vehicle details, driver credentials, route path, and designated passenger stops."
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Route & Vehicle Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Bus className="w-4 h-4" />
            <span>1. Route & Vehicle Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Route Name *
              </label>
              <input
                type="text"
                name="routeName"
                value={formData.routeName}
                onChange={handleInputChange}
                placeholder="e.g. Route 1 - Downtown Express"
                className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border ${
                  formErrors.routeName ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {formErrors.routeName && (
                <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.routeName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Route Code / No
              </label>
              <input
                type="text"
                name="routeNumber"
                value={formData.routeNumber}
                onChange={handleInputChange}
                placeholder="e.g. RT-101"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vehicle Plate Number *
              </label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleInputChange}
                placeholder="e.g. BUS-101 / NY-8921"
                className={`w-full px-3 py-2 text-xs rounded-xl font-mono bg-slate-50 dark:bg-slate-800 border ${
                  formErrors.vehicleNumber ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {formErrors.vehicleNumber && (
                <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.vehicleNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vehicle Model & Make
              </label>
              <input
                type="text"
                name="vehicleModel"
                value={formData.vehicleModel}
                onChange={handleInputChange}
                placeholder="e.g. Mercedes Sprinter 2024"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vehicle Type
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Bus">Standard Bus (30-50 seats)</option>
                <option value="Mini-Bus">Mini-Bus (20-30 seats)</option>
                <option value="Van">Transit Van (12-18 seats)</option>
                <option value="Electric Bus">Eco Electric Bus</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fuel Type
              </label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric / EV</option>
                <option value="CNG">CNG / Natural Gas</option>
                <option value="Petrol">Petrol</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Seating Capacity
              </label>
              <input
                type="number"
                min="5"
                max="90"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Insurance / Fitness Validity
              </label>
              <input
                type="date"
                name="insuranceValidity"
                value={formData.insuranceValidity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Operational Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Active">Active (In Service)</option>
                <option value="Maintenance">Under Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Terminal
              </label>
              <input
                type="text"
                name="startPoint"
                value={formData.startPoint}
                onChange={handleInputChange}
                placeholder="e.g. Central Metro Terminal"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Destination
              </label>
              <input
                type="text"
                name="endPoint"
                value={formData.endPoint}
                onChange={handleInputChange}
                placeholder="e.g. Main Campus East Gate"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Driver & Safety Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <User className="w-4 h-4" />
            <span>2. Driver & Emergency Contact Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Driver Full Name *
              </label>
              <input
                type="text"
                name="driverName"
                value={formData.driverName}
                onChange={handleInputChange}
                placeholder="e.g. Robert Martinez"
                className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border ${
                  formErrors.driverName ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {formErrors.driverName && (
                <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.driverName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Driver Primary Phone *
              </label>
              <input
                type="text"
                name="driverPhone"
                value={formData.driverPhone}
                onChange={handleInputChange}
                placeholder="+1 (555) 765-4321"
                className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border ${
                  formErrors.driverPhone ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {formErrors.driverPhone && (
                <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.driverPhone}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Commercial License No
              </label>
              <input
                type="text"
                name="driverLicense"
                value={formData.driverLicense}
                onChange={handleInputChange}
                placeholder="e.g. DL-982314-COMM"
                className="w-full px-3 py-2 text-xs rounded-xl font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Emergency Helpline
              </label>
              <input
                type="text"
                name="driverEmergencyPhone"
                value={formData.driverEmergencyPhone}
                onChange={handleInputChange}
                placeholder="+1 (555) 765-4399"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Route Stops & Timetable */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>3. Route Stops & Timings Sequence</span>
            </div>
            <button
              type="button"
              onClick={addStop}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Stop
            </button>
          </div>

          <div className="space-y-2.5">
            {formData.stops.map((stop, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                  {idx + 1}
                </div>

                <div className="flex-1 w-full sm:w-auto">
                  <input
                    type="text"
                    value={stop.stopName}
                    onChange={(e) => handleStopChange(idx, 'stopName', e.target.value)}
                    placeholder="Stop / Landmark Name"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
                  <div>
                    <input
                      type="text"
                      value={stop.pickupTime}
                      onChange={(e) => handleStopChange(idx, 'pickupTime', e.target.value)}
                      placeholder="Pickup (07:15 AM)"
                      title="Morning Pickup Time"
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] text-center"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={stop.dropTime}
                      onChange={(e) => handleStopChange(idx, 'dropTime', e.target.value)}
                      placeholder="Drop (03:45 PM)"
                      title="Evening Drop Time"
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] text-center"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={stop.fare}
                      onChange={(e) => handleStopChange(idx, 'fare', e.target.value)}
                      placeholder="Fare ($)"
                      title="Monthly Transit Fare"
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] text-center"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={formData.stops.length <= 1}
                  onClick={() => removeStop(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer self-end sm:self-center"
                  title="Remove this stop"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-md transition-colors disabled:opacity-60 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            {isSubmitting
              ? 'Saving Route...'
              : initialData
              ? 'Update Bus Route'
              : 'Save & Publish Bus Route'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
