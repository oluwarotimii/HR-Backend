import fs from 'fs';
import path from 'path';
import { pool } from '../src/config/database';

async function runMigrations(): Promise<void> {
  console.log('Starting database migrations...');
  
  try {
    // Read all SQL files from the migrations directory
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql'));
    
    // Sort files to ensure they run in order
    const sortedMigrationFiles = migrationFiles.sort();
    
    for (const file of sortedMigrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      
      console.log(`Running migration: ${file}`);
      
      // Split by semicolon to handle multiple statements in one file
      const statements = sqlContent.split(';').filter(stmt => stmt.trim() !== '');
      
      for (const statement of statements) {
        if (statement.trim()) {
          await pool.execute(statement.trim());
        }
      }
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Also create the branches table since it's referenced in the users table
async function createBranchesTable(): Promise<void> {
  console.log('Creating branches table...');
  
  try {
    const createBranchesSQL = `
      CREATE TABLE IF NOT EXISTS branches (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(255),
        manager_user_id INT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (manager_user_id) REFERENCES users(id),
        INDEX idx_code (code),
        INDEX idx_status (status)
      );
    `;
    
    await pool.execute(createBranchesSQL);
    console.log('Branches table created successfully!');
  } catch (error) {
    console.error('Failed to create branches table:', error);
  }
}

// Run the migrations
async function runSetup(): Promise<void> {
  await createBranchesTable(); // Create branches table first
  await runMigrations();
}

runSetup();