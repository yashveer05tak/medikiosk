import mongoose from 'mongoose';
import { mockMySQLStore } from '../config/mysql.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  abhaId: { type: String, default: '' },
  specialization: { type: String, default: '' },
  registrationNumber: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const MongooseUser = mongoose.model('User', userSchema);

// Dual-DB Service Interface (MySQL / Mongo / Fallback)
export const UserModel = {
  findByEmail: async (email) => {
    // 1. Check in-memory store / MySQL mock
    if (mockMySQLStore.users.has(email)) {
      return mockMySQLStore.users.get(email);
    }
    // 2. Check MongoDB
    if (mongoose.connection.readyState === 1) {
      try {
        const u = await MongooseUser.findOne({ email });
        return u ? (u.toObject ? u.toObject() : u) : null;
      } catch (err) {
        return null;
      }
    }
    return null;
  },

  create: async (userData) => {
    mockMySQLStore.users.set(userData.email, {
      id: mockMySQLStore.users.size + 1,
      ...userData,
      createdAt: new Date()
    });

    if (mongoose.connection.readyState === 1) {
      try {
        await MongooseUser.create(userData);
      } catch (err) {
        console.warn('Mongo user insert warning:', err.message);
      }
    }

    return mockMySQLStore.users.get(userData.email);
  }
};
