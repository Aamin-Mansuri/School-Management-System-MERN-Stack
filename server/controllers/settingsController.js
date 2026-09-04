import { db } from '../data/store.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { logFromReq } from '../utils/auditLogger.js';

const DEFAULT_SETTINGS = {
  _id: 'school-settings',
  schoolName: 'EduPulse International Academy',
  schoolCode: 'EDUPULSE-2026',
  schoolEmail: 'contact@edupulse-school.edu',
  schoolPhone: '+1 (555) 342-8900',
  schoolAddress: '742 Evergreen Terrace, Springfield, OR',
  academicYear: '2025-2026',
  currency: '$',
  timezone: 'Asia/Kolkata',
  logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80',
};

const sanitizeSettings = (settings) => {
  const { updatedBy, createdAt, updatedAt, ...safe } = settings || {};
  return safe;
};

export const getSettings = asyncHandler(async (req, res) => {
  let settings = await db.systemSettings.findById('school-settings');
  if (!settings) settings = await db.systemSettings.create(DEFAULT_SETTINGS);
  return sendSuccess(res, 200, 'School settings fetched successfully', sanitizeSettings(settings));
});

export const updateSettings = asyncHandler(async (req, res) => {
  const existing = await db.systemSettings.findById('school-settings');
  const allowed = [
    'schoolName', 'schoolCode', 'schoolEmail', 'schoolPhone', 'schoolAddress',
    'academicYear', 'currency', 'timezone', 'logo',
  ];
  const updateData = {};

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      const value = typeof req.body[key] === 'string' ? req.body[key].trim() : req.body[key];
      if (value !== '') updateData[key] = value;
    }
  }

  if (!updateData.schoolName && !existing?.schoolName) {
    return sendError(res, 400, 'Institution name is required.');
  }

  const before = existing ? sanitizeSettings(existing) : DEFAULT_SETTINGS;
  let updated;
  if (existing) {
    updated = await db.systemSettings.findByIdAndUpdate('school-settings', {
      ...updateData,
      updatedBy: req.user._id || req.user.id,
    });
  } else {
    updated = await db.systemSettings.create({
      ...DEFAULT_SETTINGS,
      ...updateData,
      updatedBy: req.user._id || req.user.id,
    });
  }

  if (!updated) return sendError(res, 500, 'Settings could not be saved.');

  await logFromReq(req, {
    action: 'SYSTEM_SETTINGS_UPDATED',
    category: 'System Configuration',
    severity: 'HIGH',
    target: { id: 'school-settings', name: updated.schoolName, type: 'SystemSettings' },
    changes: { before, after: sanitizeSettings(updated) },
    details: `${req.user.role} "${req.user.name}" updated institutional settings.`,
  });

  return sendSuccess(res, 200, 'School settings updated successfully', sanitizeSettings(updated));
});
