import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isUsingMockDB = false;

// In-memory data store for MongoDB fallback mode (Unstructured Transcripts & SOAP Case Sheets)
export const mockDatabase = {
  sessions: new Map(),
  caseSheets: new Map()
};

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/viora_db';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log('✅ MongoDB connected successfully to:', uri);
    isUsingMockDB = false;
  } catch (error) {
    console.warn('⚠️ Could not connect to MongoDB:', error.message);
    console.warn('⚡ Falling back to Local In-Memory Mongo Store for standalone execution.');
    isUsingMockDB = true;
  }
};

export const checkDbStatus = () => {
  return {
    connected: !isUsingMockDB && mongoose.connection.readyState === 1,
    usingMock: isUsingMockDB,
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/viora_db'
  };
};
