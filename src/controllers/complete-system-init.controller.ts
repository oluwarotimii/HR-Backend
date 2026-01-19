import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { sendWelcomeEmail } from '../services/email.service';

// Check if system is initialized (users table has entries)
export const isSystemInitialized = async (): Promise<boolean> => {
  try {
    const [rows]: any = await pool.execute('SELECT COUNT(*) as count FROM users');
    const userCount = rows[0].count;
    return userCount > 0;
  } catch (error: any) {
    // If the error is due to table not existing, the system is definitely not initialized
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return false;
    }
    console.error('Error checking system initialization:', error);
    return true; // Default to initialized if there's an unexpected error
  }
};

// Check if database tables exist
export const checkDatabaseSchema = async (): Promise<boolean> => {
  try {
    // Check if key tables exist
    const tablesToCheck = ['users', 'roles', 'branches'];
    
    for (const table of tablesToCheck) {
      try {
        await pool.execute(`SELECT 1 FROM ${table} LIMIT 1`);
      } catch (error: any) {
        // If table doesn't exist, this will throw an error
        if (error.code === 'ER_NO_SUCH_TABLE') {
          return false;
        }
        throw error; // Re-throw if it's a different error
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking database schema:', error);
    return false;
  }
};

// Run all migration files in order
export const runMigrations = async (): Promise<void> => {
  try {
    // Get the path to the migrations directory
    const migrationsDir = path.join(process.cwd(), 'migrations');

    // Read all migration files
    const migrationFiles = await fs.readdir(migrationsDir);

    // Sort files to ensure they run in order
    const sortedMigrationFiles = migrationFiles
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${sortedMigrationFiles.length} migration files to run`);

    // Execute each migration file
    for (const migrationFile of sortedMigrationFiles) {
      console.log(`Running migration: ${migrationFile}`);

      const migrationPath = path.join(migrationsDir, migrationFile);
      const migrationSql = await fs.readFile(migrationPath, 'utf8');

      // Split by semicolon to handle multiple statements in one file
      // But be smart about it - don't split if the semicolon is inside quotes or comments
      const statements = [];
      let currentStatement = '';
      let inSingleQuote = false;
      let inDoubleQuote = false;
      let inLineComment = false;
      let inBlockComment = false;
      let i = 0;

      while (i < migrationSql.length) {
        const char = migrationSql[i];
        const nextChar = i + 1 < migrationSql.length ? migrationSql[i + 1] : '';

        if (inLineComment) {
          if (char === '\n') {
            inLineComment = false;
            currentStatement += char;
          } else {
            currentStatement += char;
          }
          i++;
          continue;
        }

        if (inBlockComment) {
          if (char === '*' && nextChar === '/') {
            inBlockComment = false;
            currentStatement += char + nextChar;
            i += 2;
          } else {
            currentStatement += char;
            i++;
          }
          continue;
        }

        if (!inSingleQuote && !inDoubleQuote) {
          if (char === '-' && nextChar === '-') {
            inLineComment = true;
            currentStatement += char + nextChar;
            i += 2;
            continue;
          }
          if (char === '/' && nextChar === '*') {
            inBlockComment = true;
            currentStatement += char + nextChar;
            i += 2;
            continue;
          }
        }

        if (char === "'" && !inDoubleQuote && !inLineComment && !inBlockComment) {
          inSingleQuote = !inSingleQuote;
        } else if (char === '"' && !inSingleQuote && !inLineComment && !inBlockComment) {
          inDoubleQuote = !inDoubleQuote;
        } else if (char === ';' && !inSingleQuote && !inDoubleQuote && !inLineComment && !inBlockComment) {
          statements.push(currentStatement.trim());
          currentStatement = '';
          i++;
          continue;
        }

        currentStatement += char;
        i++;
      }

      // Add the last statement if it exists
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
      }

      for (const statement of statements) {
        if (statement) {
          try {
            await pool.execute(statement);
          } catch (stmtError: any) {
            // Handle specific errors that might occur during migrations
            if (stmtError.errno === 1060) { // ER_DUP_FIELDNAME - Duplicate column name
              console.log(`Column already exists, skipping: ${statement.substring(0, 50)}...`);
              continue;
            } else if (stmtError.errno === 1061) { // ER_DUP_KEYNAME - Duplicate key name
              console.log(`Index already exists, skipping: ${statement.substring(0, 50)}...`);
              continue;
            } else if (stmtError.errno === 1050) { // ER_TABLE_EXISTS_ERROR - Table already exists
              console.log(`Table already exists, skipping: ${statement.substring(0, 50)}...`);
              continue;
            } else {
              // Re-throw if it's a different error
              console.error(`Error executing statement in ${migrationFile}:`, stmtError);
              throw stmtError;
            }
          }
        }
      }

      console.log(`Completed migration: ${migrationFile}`);
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
};

// Initialize the complete system (run migrations + create Super Admin)
export const initializeCompleteSystem = async (req: Request, res: Response) => {
  try {
    // Check if system is already initialized
    const systemInitialized = await isSystemInitialized();
    if (systemInitialized) {
      return res.status(400).json({
        success: false,
        message: 'System is already initialized. Cannot run complete initialization again.'
      });
    }

    const { email, password, fullName, phone } = req.body;

    // Validate required fields
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check if database schema exists
    let schemaExists = await checkDatabaseSchema();
    
    if (!schemaExists) {
      console.log('Database schema not found. Running migrations...');
      
      // Run all migration files
      await runMigrations();
      
      console.log('Migrations completed successfully');
    } else {
      console.log('Database schema already exists');
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create Super Admin role first
    const [roleResult]: any = await pool.execute(
      'INSERT INTO roles (name, description, permissions, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      ['Super Admin', 'System super administrator with all privileges', JSON.stringify(['*'])]
    );
    
    const superAdminRoleId = roleResult.insertId;

    // Create the Super Admin user
    const [userResult]: any = await pool.execute(
      `INSERT INTO users 
       (email, password_hash, full_name, phone, role_id, branch_id, status, must_change_password, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NULL, 'active', 0, NOW(), NOW())`,
      [email, passwordHash, fullName, phone || null, superAdminRoleId]
    );

    const userId = userResult.insertId;

    // Generate JWT token for the new Super Admin
    const tokenPayload = {
      userId: userId,
      email: email,
      role_id: superAdminRoleId
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' }
    );

    // Send welcome email to Super Admin
    try {
      await sendWelcomeEmail({ to: email, fullName });
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the registration if email fails, just log it
    }

    return res.status(201).json({
      success: true,
      message: 'System initialized successfully. Database schema created and Super Admin created.',
      data: {
        user: {
          id: userId,
          email,
          fullName,
          roleId: superAdminRoleId
        },
        token
      }
    });
  } catch (error) {
    console.error('Complete system initialization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during complete system initialization'
    });
  }
};

// Check system readiness
export const checkSystemReadiness = async (req: Request, res: Response) => {
  try {
    const schemaExists = await checkDatabaseSchema();
    const systemInitialized = await isSystemInitialized();
    
    return res.json({
      success: true,
      data: {
        schemaExists,
        systemInitialized,
        readyForInitialization: schemaExists && !systemInitialized,
        readyForCompleteSetup: !schemaExists && !systemInitialized
      }
    });
  } catch (error) {
    console.error('Error checking system readiness:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking system readiness'
    });
  }
};