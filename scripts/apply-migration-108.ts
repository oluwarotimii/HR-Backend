import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function applyMigration108() {
  console.log('🚀 Applying migration 108: Add recurrence fields to shift_timings...\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hr_management_system',
    ssl: process.env.NODE_ENV === 'production' && process.env.DB_HOST?.includes('tidbcloud') 
      ? { rejectUnauthorized: true } 
      : false
  });

  try {
    // Step 1: Add recurrence_pattern
    await connection.execute(`
      ALTER TABLE shift_timings
      ADD COLUMN recurrence_pattern ENUM('none', 'daily', 'weekly', 'monthly') DEFAULT 'weekly'
      AFTER effective_to
    `).catch((e: any) => console.log('⏭️  recurrence_pattern already exists'));

    // Step 2: Add recurrence_days
    await connection.execute(`
      ALTER TABLE shift_timings
      ADD COLUMN recurrence_days JSON
      AFTER recurrence_pattern
    `).catch((e: any) => console.log('⏭️  recurrence_days already exists'));

    // Step 3: Add index
    await connection.execute(`
      ALTER TABLE shift_timings
      ADD INDEX idx_recurrence (user_id, recurrence_pattern, effective_from, effective_to)
    `).catch((e: any) => console.log('⏭️  Index already exists'));

    // Step 4: Update existing records
    await connection.execute(`
      UPDATE shift_timings
      SET recurrence_pattern = 'daily'
      WHERE recurrence_pattern IS NULL OR recurrence_pattern = 'weekly'
    `).catch((e: any) => console.log('⏭️  Existing records already updated'));

    console.log('\n✅ Migration 108 applied successfully!');
    console.log('   - recurrence_pattern added to shift_timings');
    console.log('   - recurrence_days added to shift_timings');
    console.log('   - Existing records set to daily (all days)');
  } catch (error: any) {
    console.error('\n💥 Migration failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

applyMigration108();
