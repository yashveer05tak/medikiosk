import mongoose from 'mongoose';
import { mockDatabase } from '../config/db.js';

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  abhaId: { type: String, default: '' },
  language: { type: String, default: 'en' },
  opdType: { type: String, enum: ['allopathic', 'ayush'], default: 'allopathic' },
  isRedFlag: { type: Boolean, default: false },
  redFlagReason: { type: String, default: null },
  isCompleted: { type: Boolean, default: false },
  clinicalData: {
    chiefComplaint: { type: String, default: '' },
    hpi: {
      onset: { type: String, default: '' },
      location: { type: String, default: '' },
      duration: { type: String, default: '' },
      character: { type: String, default: '' },
      aggravating: { type: String, default: '' },
      relieving: { type: String, default: '' },
      severity: { type: Number, default: 0 }
    },
    ayushParameters: {
      agni: { type: String, default: '' },
      koshtha: { type: String, default: '' },
      prakritiNotes: { type: String, default: '' }
    },
    extractedDocuments: [{
      docType: { type: String, default: 'Lab Report' },
      date: { type: String, default: '' },
      abnormalFindings: [{ type: String }],
      timeline: [{ type: String }],
      medications: [{ type: String }]
    }]
  },
  physicianSummary: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const MongooseSession = mongoose.model('Session', sessionSchema);

// Memory fallback layer mimicking Mongoose operations
class MockSession {
  static async findOne({ sessionId }) {
    const data = mockDatabase.sessions.get(sessionId);
    return data ? { ...data, toObject: () => data } : null;
  }

  static async create(data) {
    mockDatabase.sessions.set(data.sessionId, { ...data, createdAt: new Date() });
    return mockDatabase.sessions.get(data.sessionId);
  }

  static async findOneAndUpdate({ sessionId }, updateData, options = {}) {
    const existing = mockDatabase.sessions.get(sessionId);
    if (!existing) {
      if (options.upsert) {
        const newSession = { sessionId, ...updateData.$set, createdAt: new Date() };
        mockDatabase.sessions.set(sessionId, newSession);
        return newSession;
      }
      return null;
    }
    
    // Simple update processing for $set and nested objects
    const updated = { ...existing };
    if (updateData.$set) {
      Object.keys(updateData.$set).forEach(key => {
        if (key.includes('.')) {
          // handle shallow nested updates like clinicalData.chiefComplaint
          const parts = key.split('.');
          if (parts.length === 2) {
            updated[parts[0]] = { ...updated[parts[0]], [parts[1]]: updateData.$set[key] };
          } else if (parts.length === 3) {
            updated[parts[0]] = updated[parts[0]] || {};
            updated[parts[0]][parts[1]] = { ...updated[parts[0]][parts[1]], [parts[2]]: updateData.$set[key] };
          }
        } else {
          updated[key] = updateData.$set[key];
        }
      });
    }
    if (updateData.$push) {
      Object.keys(updateData.$push).forEach(key => {
        if (key.includes('.')) {
          const parts = key.split('.');
          if (parts.length === 2) {
            updated[parts[0]] = updated[parts[0]] || {};
            updated[parts[0]][parts[1]] = updated[parts[0]][parts[1]] || [];
            updated[parts[0]][parts[1]].push(updateData.$push[key]);
          }
        }
      });
    }
    
    mockDatabase.sessions.set(sessionId, updated);
    return updated;
  }
}

// Dynamically return the appropriate DB service
export const Session = {
  findOne: async (query) => {
    if (mongoose.connection.readyState === 1) {
      try {
        return await MongooseSession.findOne(query);
      } catch (err) {
        return await MockSession.findOne(query);
      }
    }
    return await MockSession.findOne(query);
  },
  create: async (data) => {
    if (mongoose.connection.readyState === 1) {
      try {
        return await MongooseSession.create(data);
      } catch (err) {
        return await MockSession.create(data);
      }
    }
    return await MockSession.create(data);
  },
  findOneAndUpdate: async (query, updateData, options) => {
    if (mongoose.connection.readyState === 1) {
      try {
        return await MongooseSession.findOneAndUpdate(query, updateData, options);
      } catch (err) {
        return await MockSession.findOneAndUpdate(query, updateData, options);
      }
    }
    return await MockSession.findOneAndUpdate(query, updateData, options);
  }
};
