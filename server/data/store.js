import crypto from 'crypto';
import mongoose from 'mongoose';
import { isMongoDBConnected } from '../config/db.js';

export const generateId = () => {
  return new mongoose.Types.ObjectId().toString();
};

// In-memory fallback buffer (used only if MongoDB is not connected)
let inMemoryData = {
  users: [],
  students: [],
  teachers: [],
  parents: [],
  classes: [],
  sections: [],
  subjects: [],
  attendance: [],
  exams: [],
  examResults: [],
  assignments: [],
  assignmentSubmissions: [],
  fees: [],
  payments: [],
  libraryBooks: [],
  bookIssues: [],
  transports: [],
  hostels: [],
  leaves: [],
  notices: [],
  events: [],
  notifications: [],
  messages: [],
  auditLogs: [],
  roleRequests: [],
  feeReminders: [],
  feeReminderSettings: {
    autoRemindersEnabled: true,
    daysBeforeDue: 3,
    autoSendOnOverdue: true,
    escalationAfterDays: 7,
    senderName: 'EduPulse Academy - Accounts & Bursar',
    senderEmail: 'finance@edupulse.edu',
    supportContact: '+1 (555) 342-8900 Ext. 4',
    emailSubjectTemplate: 'Payment Reminder: Outstanding Fee Due for {{studentName}}',
    autoScheduleIntervalHours: 24,
    lastRunTimestamp: null,
  },
  systemSettings: [{
    _id: 'school-settings',
    schoolName: 'EduPulse International Academy',
    schoolEmail: 'contact@edupulse-school.edu',
    schoolPhone: '+1 (555) 342-8900',
    schoolAddress: '742 Evergreen Terrace, Springfield, OR',
    academicYear: '2025-2026',
    currency: '$',
    logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80',
    timezone: 'Asia/Kolkata',
    updatedBy: null,
  }],
};

// Helper to get raw MongoDB native collection safely
const getMongoCollection = (name) => {
  if (!isMongoDBConnected()) return null;
  try {
    return mongoose.connection.collection(name);
  } catch (e) {
    console.error(`[MongoDB] Error getting collection ${name}:`, e.message);
    return null;
  }
};

// Robust in-memory query matcher
function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  if (!path.includes('.')) return obj[path];
  const parts = path.split('.');
  let curr = obj;
  for (const p of parts) {
    if (curr === null || curr === undefined) return undefined;
    curr = curr[p];
  }
  return curr;
}

function matchCondition(itemVal, cond) {
  if (cond === undefined) return true;
  if (cond && typeof cond === 'object' && !Array.isArray(cond) && !(cond instanceof RegExp)) {
    if (cond.$regex !== undefined) {
      const re = cond.$regex instanceof RegExp ? cond.$regex : new RegExp(cond.$regex, cond.$options || 'i');
      return re.test(String(itemVal || ''));
    }
    if (cond.$in !== undefined) {
      if (!Array.isArray(cond.$in)) return false;
      return cond.$in.some((v) => v === itemVal || String(v) === String(itemVal));
    }
    if (cond.$nin !== undefined) {
      if (!Array.isArray(cond.$nin)) return true;
      return !cond.$nin.some((v) => v === itemVal || String(v) === String(itemVal));
    }
    if (cond.$ne !== undefined) {
      return itemVal !== cond.$ne && String(itemVal) !== String(cond.$ne);
    }
    if (cond.$exists !== undefined) {
      const exists = itemVal !== undefined && itemVal !== null;
      return exists === Boolean(cond.$exists);
    }
    if (cond.$gte !== undefined && itemVal < cond.$gte) return false;
    if (cond.$lte !== undefined && itemVal > cond.$lte) return false;
    if (cond.$gt !== undefined && itemVal <= cond.$gt) return false;
    if (cond.$lt !== undefined && itemVal >= cond.$lt) return false;
    return true;
  }
  if (cond instanceof RegExp) {
    return cond.test(String(itemVal || ''));
  }
  return itemVal === cond || String(itemVal) === String(cond);
}

function matchDoc(item, query) {
  if (!query || Object.keys(query).length === 0) return true;
  for (const [key, val] of Object.entries(query)) {
    if (key === '$or') {
      if (Array.isArray(val) && val.length > 0) {
        const matchesAny = val.some((subQuery) => matchDoc(item, subQuery));
        if (!matchesAny) return false;
      }
      continue;
    }
    if (key === '$and') {
      if (Array.isArray(val) && val.length > 0) {
        const matchesAll = val.every((subQuery) => matchDoc(item, subQuery));
        if (!matchesAll) return false;
      }
      continue;
    }

    const itemVal = getNestedValue(item, key);
    if (!matchCondition(itemVal, val)) {
      return false;
    }
  }
  return true;
}

// Convert MongoDB query with regex if necessary
const formatMongoQuery = (query = {}) => {
  const formatted = { ...query };
  for (const [key, val] of Object.entries(formatted)) {
    if (val && typeof val === 'object' && val.$regex && !(val.$regex instanceof RegExp)) {
      formatted[key] = new RegExp(val.$regex, val.$options || 'i');
    }
  }
  return formatted;
};

class Collection {
  constructor(name) {
    this.name = name;
    if (!inMemoryData[this.name]) {
      inMemoryData[this.name] = [];
    }
  }

  get items() {
    return inMemoryData[this.name] || [];
  }

  set items(newItems) {
    inMemoryData[this.name] = newItems;
  }

  async find(query = {}) {
    const mongoColl = getMongoCollection(this.name);
    if (mongoColl) {
      try {
        const mQuery = formatMongoQuery(query);
        const docs = await mongoColl.find(mQuery).toArray();
        return docs.map((d) => ({ ...d }));
      } catch (err) {
        console.error(`[MongoDB] Error querying collection ${this.name}:`, err.message);
      }
    }

    // Memory fallback if MongoDB not connected
    const result = this.items.filter((item) => matchDoc(item, query));
    return result.map((i) => ({ ...i }));
  }

  async findOne(query = {}) {
    const mongoColl = getMongoCollection(this.name);
    if (mongoColl) {
      try {
        const mQuery = formatMongoQuery(query);
        const doc = await mongoColl.findOne(mQuery);
        return doc ? { ...doc } : null;
      } catch (err) {
        console.error(`[MongoDB] Error in findOne for ${this.name}:`, err.message);
      }
    }

    const list = await this.find(query);
    return list.length > 0 ? { ...list[0] } : null;
  }

  async findById(id) {
    if (!id) return null;
    const mongoColl = getMongoCollection(this.name);
    if (mongoColl) {
      try {
        const doc = await mongoColl.findOne({
          $or: [{ _id: id }, { id: id }, { _id: id.toString() }],
        });
        if (doc) return { ...doc };
      } catch (err) {
        console.error(`[MongoDB] Error in findById for ${this.name}:`, err.message);
      }
    }

    const item = this.items.find((i) => i._id === id || i.id === id || String(i._id) === String(id));
    return item ? { ...item } : null;
  }

  async create(data) {
    const now = new Date().toISOString();
    const docId = data._id ? String(data._id) : generateId();
    const doc = {
      ...data,
      _id: docId,
      createdAt: data.createdAt || now,
      updatedAt: now,
    };

    const mongoColl = getMongoCollection(this.name);
    if (mongoColl) {
      try {
        await mongoColl.insertOne({ ...doc });
        console.log(`[MongoDB Live] Inserted 1 document into collection '${this.name}' (_id: ${doc._id})`);
      } catch (err) {
        console.error(`[MongoDB] Live insert error into ${this.name}:`, err.message);
        throw err;
      }
    }

    // Keep memory cache synced
    const existingIdx = this.items.findIndex((i) => i._id === doc._id);
    if (existingIdx !== -1) {
      this.items[existingIdx] = doc;
    } else {
      this.items.push(doc);
    }

    return { ...doc };
  }

  async insertMany(docs) {
    if (!Array.isArray(docs) || docs.length === 0) return [];
    const now = new Date().toISOString();
    const newDocs = docs.map((d) => ({
      ...d,
      _id: d._id ? String(d._id) : generateId(),
      createdAt: d.createdAt || now,
      updatedAt: now,
    }));

    const mongoColl = getMongoCollection(this.name);
    if (mongoColl) {
      try {
        await mongoColl.insertMany(newDocs.map((d) => ({ ...d })));
        console.log(`[MongoDB Live] Bulk inserted ${newDocs.length} documents into collection '${this.name}'`);
      } catch (err) {
        console.error(`[MongoDB] Live insertMany error into ${this.name}:`, err.message);
      }
    }

    this.items.push(...newDocs);
    return newDocs.map((d) => ({ ...d }));
  }

  async findByIdAndUpdate(id, updateData, options = { new: true }) {
    if (!id) return null;
    const now = new Date().toISOString();
    const mongoColl = getMongoCollection(this.name);
    if (mongoColl) {
      try {
        const res = await mongoColl.findOneAndUpdate(
          { $or: [{ _id: id }, { id: id }, { _id: id.toString() }] },
          { $set: { ...updateData, updatedAt: now } },
          { returnDocument: 'after' }
        );
        if (res) {
          const updatedDoc = res.value || res;
          const idx = this.items.findIndex((i) => i._id === id || i.id === id);
          if (idx !== -1) this.items[idx] = { ...this.items[idx], ...updatedDoc };
          return { ...updatedDoc };
        }
        return null;
      } catch (err) {
        console.error(`[MongoDB] Live findByIdAndUpdate error in ${this.name}:`, err.message);
        throw err;
      }
    }

    const idx = this.items.findIndex((i) => i._id === id || i.id === id || String(i._id) === String(id));
    if (idx === -1) return null;

    const current = this.items[idx];
    const updated = {
      ...current,
      ...updateData,
      updatedAt: now,
    };
    this.items[idx] = updated;
    return { ...updated };
  }

  async findOneAndUpdate(query, updateData, options = { new: true }) {
    const item = await this.findOne(query);
    if (!item) return null;
    return this.findByIdAndUpdate(item._id, updateData, options);
  }

  async findByIdAndDelete(id) {
    if (!id) return null;
    const mongoColl = getMongoCollection(this.name);
    if (mongoColl) {
      try {
        const result = await mongoColl.deleteOne({ $or: [{ _id: id }, { id: id }, { _id: id.toString() }] });
        console.log(`[MongoDB Live] Deleted ${result.deletedCount} document(s) from collection '${this.name}' (_id: ${id})`);
        if (!result.deletedCount) return null;
      } catch (err) {
        console.error(`[MongoDB] Live delete error in ${this.name}:`, err.message);
        throw err;
      }
    }

    const idx = this.items.findIndex((i) => i._id === id || i.id === id || String(i._id) === String(id));
    if (idx === -1) return null;
    const removed = this.items.splice(idx, 1)[0];
    return removed;
  }

  async deleteMany(query = {}) {
    const mongoColl = getMongoCollection(this.name);
    if (mongoColl) {
      try {
        const mQuery = formatMongoQuery(query);
        const res = await mongoColl.deleteMany(mQuery);
        console.log(`[MongoDB Live] deleteMany in '${this.name}', deleted: ${res.deletedCount}`);
      } catch (err) {
        console.error(`[MongoDB] Live deleteMany error in ${this.name}:`, err.message);
      }
    }

    if (Object.keys(query).length === 0) {
      const count = this.items.length;
      this.items = [];
      return { deletedCount: count };
    }

    const toKeep = [];
    let deletedCount = 0;
    for (const item of this.items) {
      let matches = true;
      for (const [key, val] of Object.entries(query)) {
        if (item[key] !== val) {
          matches = false;
          break;
        }
      }
      if (matches) {
        deletedCount++;
      } else {
        toKeep.push(item);
      }
    }
    this.items = toKeep;
    return { deletedCount };
  }

  async countDocuments(query = {}) {
    const mongoColl = getMongoCollection(this.name);
    if (mongoColl) {
      try {
        const mQuery = formatMongoQuery(query);
        return await mongoColl.countDocuments(mQuery);
      } catch (err) {
        console.error(`[MongoDB] countDocuments error in ${this.name}:`, err.message);
      }
    }

    const list = await this.find(query);
    return list.length;
  }
}

export const db = {
  users: new Collection('users'),
  students: new Collection('students'),
  teachers: new Collection('teachers'),
  parents: new Collection('parents'),
  classes: new Collection('classes'),
  sections: new Collection('sections'),
  subjects: new Collection('subjects'),
  attendance: new Collection('attendance'),
  exams: new Collection('exams'),
  examResults: new Collection('examResults'),
  assignments: new Collection('assignments'),
  assignmentSubmissions: new Collection('assignmentSubmissions'),
  fees: new Collection('fees'),
  payments: new Collection('payments'),
  libraryBooks: new Collection('libraryBooks'),
  bookIssues: new Collection('bookIssues'),
  transports: new Collection('transports'),
  hostels: new Collection('hostels'),
  leaves: new Collection('leaves'),
  notices: new Collection('notices'),
  events: new Collection('events'),
  notifications: new Collection('notifications'),
  messages: new Collection('messages'),
  auditLogs: new Collection('auditLogs'),
  roleRequests: new Collection('roleRequests'),
  feeReminders: new Collection('feeReminders'),
  systemSettings: new Collection('systemSettings'),
  getFeeReminderSettings: async () => {
    const mongoColl = getMongoCollection('system_settings');
    if (mongoColl) {
      try {
        const found = await mongoColl.findOne({ key: 'feeReminderSettings' });
        if (found && found.value) return found.value;
      } catch (e) {}
    }
    return inMemoryData.feeReminderSettings;
  },
  updateFeeReminderSettings: async (newSettings) => {
    inMemoryData.feeReminderSettings = {
      ...(inMemoryData.feeReminderSettings || {}),
      ...newSettings,
    };
    const mongoColl = getMongoCollection('system_settings');
    if (mongoColl) {
      try {
        await mongoColl.updateOne(
          { key: 'feeReminderSettings' },
          { $set: { key: 'feeReminderSettings', value: inMemoryData.feeReminderSettings } },
          { upsert: true }
        );
      } catch (e) {}
    }
    return inMemoryData.feeReminderSettings;
  },
  getSettings: async () => {
    const mongoColl = getMongoCollection('system_settings');
    if (mongoColl) {
      try {
        const found = await mongoColl.findOne({ key: 'schoolSettings' });
        if (found && found.value) return found.value;
      } catch (e) {}
    }
    return inMemoryData.settings;
  },
  updateSettings: async (newSettings) => {
    inMemoryData.settings = { ...inMemoryData.settings, ...newSettings };
    const mongoColl = getMongoCollection('system_settings');
    if (mongoColl) {
      try {
        await mongoColl.updateOne(
          { key: 'schoolSettings' },
          { $set: { key: 'schoolSettings', value: inMemoryData.settings } },
          { upsert: true }
        );
      } catch (e) {}
    }
    return inMemoryData.settings;
  },
  resetAll: async () => {
    for (const key of Object.keys(inMemoryData)) {
      if (Array.isArray(inMemoryData[key])) {
        inMemoryData[key] = [];
      }
    }
    if (isMongoDBConnected()) {
      try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        for (const c of collections) {
          if (!c.name.startsWith('system.')) {
            await mongoose.connection.db.collection(c.name).deleteMany({});
          }
        }
      } catch (e) {
        console.error('[MongoDB] Reset error:', e.message);
      }
    }
  },
};

// Sync all in-memory collections to MongoDB Atlas
export const syncAllToMongoDB = async () => {
  if (!isMongoDBConnected()) {
    return { success: false, message: 'MongoDB is not connected.' };
  }

  const results = {};
  const collectionKeys = [
    'users',
    'students',
    'teachers',
    'parents',
    'classes',
    'sections',
    'subjects',
    'attendance',
    'exams',
    'examResults',
    'assignments',
    'assignmentSubmissions',
    'fees',
    'payments',
    'libraryBooks',
    'bookIssues',
    'transports',
    'hostels',
    'leaves',
    'notices',
    'events',
    'notifications',
    'messages',
    'auditLogs',
    'roleRequests',
    'feeReminders',
    'systemSettings',
  ];

  for (const collName of collectionKeys) {
    try {
      const mongoColl = mongoose.connection.collection(collName);
      const atlasCount = await mongoColl.countDocuments();
      const memItems = inMemoryData[collName] || [];

      if (atlasCount === 0 && memItems.length > 0) {
        await mongoColl.insertMany(memItems.map((d) => ({ ...d })));
        results[collName] = { synced: memItems.length, status: 'Uploaded to Atlas' };
      } else {
        results[collName] = { count: atlasCount, status: 'Active in Atlas' };
      }
    } catch (err) {
      results[collName] = { error: err.message, status: 'Failed' };
    }
  }

  return { success: true, results };
};
