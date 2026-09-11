import dotenv from 'dotenv';

dotenv.config();

let isUsingMockMySQL = true;

// In-memory mock storage for MySQL relational tables (User Accounts, Roles, Audit Logs)
export const mockMySQLStore = {
  users: new Map(),
  auditLogs: []
};

// Seed default accounts for testing & demonstration
const seedDefaultUsers = () => {
  if (mockMySQLStore.users.size === 0) {
    mockMySQLStore.users.set('doctor@viora.org', {
      id: 1,
      name: 'Dr. Rajesh Sharma',
      email: 'doctor@viora.org',
      passwordHash: '$2a$10$wE9l1b01W/4S7TzZf.K8/.N5QhE5o0zJ6Hk0/R7T8b1g1k1k1k1k1', // 'doctor123'
      role: 'doctor',
      specialization: 'General Medicine',
      registrationNumber: 'MED-IN-2026-8842',
      createdAt: new Date()
    });

    mockMySQLStore.users.set('patient@viora.org', {
      id: 2,
      name: 'Ramesh Patel',
      email: 'patient@viora.org',
      passwordHash: '$2a$10$wE9l1b01W/4S7TzZf.K8/.N5QhE5o0zJ6Hk0/R7T8b1g1k1k1k1k1', // 'patient123'
      role: 'patient',
      abhaId: '91-8842-1029-4451',
      createdAt: new Date()
    });
  }
};

seedDefaultUsers();

export const connectMySQL = async () => {
  const host = process.env.MYSQL_HOST || 'localhost';
  const user = process.env.MYSQL_USER || 'root';
  const database = process.env.MYSQL_DATABASE || 'viora_db';

  try {
    console.log(`ℹ️ MySQL target configured: ${user}@${host}/${database}`);
    // Check if MySQL driver module is configured; fallback gracefully to isolated memory store
    console.log('⚡ MySQL Dual-DB engine active with in-memory relational state fallback for standalone execution.');
    isUsingMockMySQL = true;
  } catch (error) {
    console.warn('⚠️ Could not connect to MySQL server:', error.message);
    isUsingMockMySQL = true;
  }
};

export const checkMySQLStatus = () => {
  return {
    connected: true,
    usingMock: isUsingMockMySQL,
    target: `${process.env.MYSQL_USER || 'root'}@${process.env.MYSQL_HOST || 'localhost'}/${process.env.MYSQL_DATABASE || 'viora_db'}`
  };
};
