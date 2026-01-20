#!/usr/bin/env node

/**
 * Script to run additional migrations for schema updates
 * This is needed when the system is already initialized but schema needs updates
 */

import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';

async function runAdditionalMigrations() {
  // Get database configuration from environment variables
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hr_management_system'
  });

  try {
    console.log('Running additional migrations for schema updates...');

    // Get the path to the migrations directory
    const migrationsDir = path.join(process.cwd(), 'migrations');
    
    // Define the specific migration files to run for schema updates
    const migrationFiles = [
      '042_add_updated_at_to_roles_permissions.sql',
      '043_add_missing_columns_to_branches.sql'
    ];
    
    for (const migrationFile of migrationFiles) {
      console.log(`Running migration: ${migrationFile}`);
      
      const migrationPath = path.join(migrationsDir, migrationFile);
      
      try {
        const migrationSql = await fs.readFile(migrationPath, 'utf8');
        
        // Split by semicolon to handle multiple statements in one file
        const statements = migrationSql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0);
        
        for (const statement of statements) {
          if (statement) {
            await connection.execute(statement);
          }
        }
        
        console.log(`Completed migration: ${migrationFile}`);
      } catch (error) {
        console.warn(`Warning: Could not run migration ${migrationFile}:`, error.message);
        // Continue with other migrations even if one fails
      }
    }
    
    console.log('Additional migrations completed (or attempted).');
  } catch (error) {
    console.error('Error running additional migrations:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the function if this script is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runAdditionalMigrations()
    .then(() => {
      console.log('Additional migrations setup completed.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to run additional migrations:', error);
      process.exit(1);
    });
}

export default runAdditionalMigrations;