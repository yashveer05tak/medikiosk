import mongoose from 'mongoose';
import { mockDatabase } from '../config/db.js';

const caseSheetSchema = new mongoose.Schema({
  caseId: { type: String, required: true, unique: true },
  patientId: { type: String, default: 'anonymous' },
  patientName: { type: String, default: 'Walk-in Patient' },
  abhaId: { type: String, default: '' },
  age: { type: String, default: '35' },
  gender: { type: String, default: 'Unspecified' },
  language: { type: String, default: 'en' },
  opdType: { type: String, default: 'allopathic' },
  rawInput: { type: String, required: true },
  isRedFlag: { type: Boolean, default: false },
  redFlagReason: { type: String, default: null },

  // Strict SOAP Note Schema
  soapNote: {
    subjective: {
      primaryComplaints: { type: String, default: '' },
      duration: { type: String, default: '' },
      symptomSeverity: { type: Number, default: 0 },
      medicalHistory: [{ type: String }],
      allergies: [{ type: String }]
    },
    objective: {
      physicalSymptoms: [{ type: String }],
      vitals: { type: String, default: 'Normal Range' },
      clinicalFindings: [{ type: String }],
      interviewAnswers: { type: mongoose.Schema.Types.Mixed, default: {} }
    },
    assessment: {
      preliminaryDiagnosis: { type: String, default: 'Pending Clinical Review' },
      differentialDiagnosis: [{ type: String }],
      riskLevel: { type: String, default: 'routine' },
      reasoning: { type: String, default: '' },
      redFlags: [{ type: String }]
    },
    plan: {
      recommendedTests: [{ type: String }],
      dietLifestyleAdvice: [{ type: String }],
      medications: [{ type: String }]
    }
  },

  // Human-in-the-Loop Verification
  isVerified: { type: Boolean, default: false },
  doctorNotes: { type: String, default: '' },
  attachments: [{
    attachmentId: { type: String, required: true },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    path: { type: String, required: true },
    mimeType: { type: String, default: 'application/octet-stream' },
    size: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now }
  }],
  verifiedBy: {
    doctorName: { type: String, default: '' },
    registrationNumber: { type: String, default: '' },
    verifiedAt: { type: Date, default: null }
  },

  createdAt: { type: Date, default: Date.now }
});

const MongooseCaseSheet = mongoose.model('CaseSheet', caseSheetSchema);

// Dual-DB Mongoose / Memory Adapter
export const CaseSheetModel = {
  create: async (data) => {
    mockDatabase.caseSheets.set(data.caseId, { ...data, createdAt: new Date() });

    if (mongoose.connection.readyState === 1) {
      try {
        await MongooseCaseSheet.create(data);
      } catch (err) {
        console.warn('Mongo insert warning:', err.message);
      }
    }
    return mockDatabase.caseSheets.get(data.caseId);
  },

  findByCaseId: async (caseId) => {
    if (mockDatabase.caseSheets.has(caseId)) {
      return mockDatabase.caseSheets.get(caseId);
    }
    if (mongoose.connection.readyState === 1) {
      try {
        const item = await MongooseCaseSheet.findOne({ caseId });
        return item ? (item.toObject ? item.toObject() : item) : null;
      } catch (err) {
        return null;
      }
    }
    return null;
  },

  findAll: async () => {
    const list = Array.from(mockDatabase.caseSheets.values());
    if (mongoose.connection.readyState === 1) {
      try {
        const mongoList = await MongooseCaseSheet.find().sort({ createdAt: -1 });
        if (mongoList && mongoList.length > 0) {
          return mongoList.map(m => (m.toObject ? m.toObject() : m));
        }
      } catch (err) {
        return list;
      }
    }
    return list;
  },

  updateByCaseId: async (caseId, updateData) => {
    const existing = mockDatabase.caseSheets.get(caseId);
    if (existing) {
      const updated = { ...existing, ...updateData };
      mockDatabase.caseSheets.set(caseId, updated);
    }

    if (mongoose.connection.readyState === 1) {
      try {
        await MongooseCaseSheet.findOneAndUpdate({ caseId }, updateData, { new: true });
      } catch (err) {
        console.warn('Mongo update warning:', err.message);
      }
    }
    return mockDatabase.caseSheets.get(caseId);
  },

  appendAttachment: async (caseId, attachment) => {
    const existing = mockDatabase.caseSheets.get(caseId);
    if (existing) {
      existing.attachments = [...(existing.attachments || []), attachment];
      mockDatabase.caseSheets.set(caseId, existing);
    }

    if (mongoose.connection.readyState === 1) {
      try {
        await MongooseCaseSheet.findOneAndUpdate(
          { caseId },
          { $push: { attachments: attachment } },
          { new: true }
        );
      } catch (err) {
        console.warn('Mongo attachment warning:', err.message);
      }
    }
    return mockDatabase.caseSheets.get(caseId);
  },

  // Delete a single case by caseId
  deleteByCaseId: async (caseId) => {
    const existed = mockDatabase.caseSheets.has(caseId);
    mockDatabase.caseSheets.delete(caseId);

    if (mongoose.connection.readyState === 1) {
      try {
        await MongooseCaseSheet.findOneAndDelete({ caseId });
      } catch (err) {
        console.warn('Mongo delete warning:', err.message);
      }
    }
    return existed;
  },

  // ⚠️ Delete ALL case sheets — use only for demo reset
  deleteAll: async () => {
    const count = mockDatabase.caseSheets.size;
    mockDatabase.caseSheets.clear();

    if (mongoose.connection.readyState === 1) {
      try {
        await MongooseCaseSheet.deleteMany({});
        console.log('✅ All case sheets cleared from MongoDB');
      } catch (err) {
        console.warn('Mongo deleteMany warning:', err.message);
      }
    }
    return count;
  }
};
