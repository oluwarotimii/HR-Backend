import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { redisService } from '../services/redis.service';

dotenv.config();

// Lock Node.js timezone to Nigeria (UTC+1, no DST)
// This ensures all Date operations use Nigeria time consistently
process.env.TZ = 'Africa/Lagos';

// Parse connection string if provided (e.g., from TiDB Cloud)
// Format: mysql://user:password@host:port/database
const parseConnectionString = (connectionString?: string) => {
  if (!connectionString) {
    return null;
  }

  try {
    const url = new URL(connectionString);
    return {
      host: url.hostname,
      port: parseInt(url.port || '4000'),
      user: url.username,
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1), // Remove leading '/'
      ...baseConfig,
      ssl: {
        rejectUnauthorized: true
      }
    };
  } catch (error) {
    console.error('Failed to parse connection string:', error);
    return null;
  }
};

// Database connection configuration
const baseConfig = {
  timezone: '+01:00',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_POOL_LIMIT || '20'),
  queueLimit: 30,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  namedPlaceholders: true,
  multipleStatements: true,
  // SSL only for production (TiDB Cloud), disabled for local development
  ssl: process.env.NODE_ENV === 'production' && process.env.DB_HOST?.includes('tidbcloud') ? { rejectUnauthorized: true } : undefined,
};

const dbConfig = parseConnectionString(process.env.DATABASE_URL) || {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hr_management_system',
  ...baseConfig,
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

pool.on('connection', (connection) => {
  connection.on('error', (err) => {
    console.error('MySQL connection error:', err.message);
  });
});

pool.on('error', (err) => {
  console.error('MySQL pool error:', err.message);
});

// Initialize Redis connection
export async function initializeRedis(): Promise<void> {
  await redisService.connect();
}

// Test database connection
const testConnection = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
  } catch (error: any) {
    console.warn('Warning: Database connection failed:', error.message);
    console.warn('Some features may not be available until the database is connected.');
  }
};

export { pool, testConnection, dbConfig };