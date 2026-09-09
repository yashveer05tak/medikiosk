import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { CaseSheetModel } from '../models/CaseSheet.js';

dotenv.config();

const resetDatabase = async () => {
  console.log('🔄 Starting Database Reset Process...');
  
  // Connect to the DB
  await connectDB();

  // Clear Case Sheets
  console.log('🗑️ Clearing all Patient Case Sheets...');
  const deletedCases = await CaseSheetModel.deleteAll();
  console.log(`✅ Cleared case sheets from memory/mock store.`);

  console.log('🎉 Reset complete! The database is now clean for the judges.');
  process.exit(0);
};

resetDatabase();
