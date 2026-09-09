import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, checkDbStatus } from './config/db.js';
import { connectMySQL, checkMySQLStatus } from './config/mysql.js';
import sessionRoutes from './routes/sessionRoutes.js';
import authRoutes from './routes/authRoutes.js';
import caseRoutes from './routes/caseRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Setup Security & Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// System Health & SIH 2026 Status Endpoint
app.get('/api/health', (req, res) => {
  const mongoStatus = checkDbStatus();
  const mysqlStatus = checkMySQLStatus();
  res.json({
    status: 'healthy',
    project: 'MediKiosk - AI-Assisted Multilingual Patient Case-Taking Software',
    sihProblemId: '26047',
    timestamp: new Date().toISOString(),
    databases: {
      mongoDB: mongoStatus,
      mySQL: mysqlStatus
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/case', caseRoutes);
app.use('/api/sessions', sessionRoutes);

// Catch-all route
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Initialize Dual Databases & Start Express Server
const startServer = async () => {
  await connectDB();
  await connectMySQL();
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 MediKiosk SIH 2026 Server running on port ${PORT}`);
    console.log(`🏥 Problem Statement: 26047`);
    console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
};

startServer();
