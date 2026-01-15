import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration without specifying database name initially
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// Create a connection pool without database name
const pool = mysql.createPool(dbConfig);

async function createDatabaseIfNotExists(): Promise<void> {
  console.log('Checking if database exists...');

  try {
    // Connect without specifying database to check/create it
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    const dbName = process.env.DB_NAME || 'hr_management_system';
    console.log(`Creating database ${dbName} if it doesn't exist...`);

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);

    await connection.end();
    console.log(`Database ${dbName} is ready!`);
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  }
}

async function runMigrations(): Promise<void> {
  console.log('Starting database migrations...');

  try {
    // Read all SQL files from the migrations directory
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql'));

    // Sort files to ensure they run in order
    const sortedMigrationFiles = migrationFiles.sort();

    // Create a new pool with the database specified
    const dbName = process.env.DB_NAME || 'hr_management_system';
    const dbConfigWithDb = {
      ...dbConfig,
      database: dbName
    };
    const poolWithDb = mysql.createPool(dbConfigWithDb);

    for (const file of sortedMigrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8');

      console.log(`Running migration: ${file}`);

      // Split by semicolon to handle multiple statements in one file
      const statements = sqlContent.split(';').filter(stmt => stmt.trim() !== '');

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await poolWithDb.execute(statement.trim());
          } catch (stmtError) {
            console.error(`Error executing statement in ${file}:`, stmtError);
            console.error('Statement:', statement.trim());
            throw stmtError;
          }
        }
      }
    }

    console.log('All migrations completed successfully!');
    await poolWithDb.end();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migrations
async function runSetup(): Promise<void> {
  await createDatabaseIfNotExists();
  await runMigrations();
}

runSetup();