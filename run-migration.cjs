// run-migration.js
// Script to run the attendance auto-mark migration

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  let connection;
  
  try {
    // Connect to database
    console.log('Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hr_management_system',
      multipleStatements: true
    });
    
    console.log('✓ Connected to database');
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations/096_attendance_auto_mark_settings.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running migration: 096_attendance_auto_mark_settings.sql');
    console.log('---');
    
    // Execute migration
    await connection.query(migrationSQL);
    
    console.log('---');
    console.log('✓ Migration completed successfully!');
    
    // Verify changes
    console.log('\nVerifying changes...');
    
    // Check branches table
    const [branchesCols] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'branches'
        AND COLUMN_NAME IN ('auto_mark_absent_enabled', 'auto_mark_absent_time', 'auto_mark_absent_timezone', 'attendance_lock_date')
    `);
    
    console.log('\n✓ branches table columns added:');
    branchesCols.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}) default: ${col.COLUMN_DEFAULT}`);
    });
    
    // Check attendance table
    const [attendanceCols] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'attendance'
        AND COLUMN_NAME IN ('is_locked', 'locked_at', 'locked_by', 'lock_reason')
    `);
    
    console.log('\n✓ attendance table columns added:');
    attendanceCols.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}) nullable: ${col.IS_NULLABLE}`);
    });
    
    // Check attendance_lock_log table
    const [tables] = await connection.query(`
      SHOW TABLES LIKE 'attendance_lock_log'
    `);
    
    if (tables.length > 0) {
      console.log('\n✓ attendance_lock_log table created');
    }
    
    // Show current branch settings
    const [branches] = await connection.query(`
      SELECT id, name, auto_mark_absent_enabled, auto_mark_absent_time 
      FROM branches
    `);
    
    console.log('\n📊 Current branch auto-mark settings:');
    branches.forEach(branch => {
      console.log(`  - ${branch.name}: ${branch.auto_mark_absent_enabled ? 'Enabled at ' + branch.auto_mark_absent_time : 'Disabled'}`);
    });
    
    console.log('\n✅ Migration complete! You can now configure auto-mark in Settings → Attendance.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('\n⚠️  Some columns may already exist. This is OK if migration ran before.');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the migration
runMigration();
