#!/usr/bin/env ts-node
/**
 * Database Migration Runner
 * Runs all pending migrations in order
 */

import { pool } from './src/config/database';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('🚀 Starting migrations...\n');

  try {
    // Test connection first
    const connection = await pool.getConnection();
    console.log('✅ Connected to database\n');
    connection.release();

    // Get all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort alphabetically (001, 002, 003...)

    console.log(`Found ${files.length} migration files\n`);

    // Create migrations tracking table if not exists
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get already executed migrations
    const [executed]: any = await pool.execute(
      'SELECT migration_name FROM schema_migrations'
    );
    const executedSet = new Set(executed.map((r: any) => r.migration_name));

    // Run pending migrations
    let pendingCount = 0;
    for (const file of files) {
      if (executedSet.has(file)) {
        console.log(`⏭️  Skipped: ${file}`);
        continue;
      }

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      try {
        // Split by semicolon and execute each statement
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
          await pool.execute(statement);
        }

        // Record migration as executed
        await pool.execute(
          'INSERT INTO schema_migrations (migration_name) VALUES (?)',
          [file]
        );

        console.log(`✅ Executed: ${file}`);
        pendingCount++;
      } catch (error: any) {
        console.error(`❌ Failed: ${file}`);
        console.error(`   Error: ${error.message}`);
        throw error;
      }
    }

    console.log(`\n🎉 Completed! ${pendingCount} new migration(s) executed`);
  } catch (error: any) {
    console.error('\n💥 Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations
runMigrations();
