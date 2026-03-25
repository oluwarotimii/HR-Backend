import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { sendWelcomeEmail } from '../services/email.service';
export const isSystemInitialized = async () => {
    try {
        const [rows] = await pool.execute('SELECT COUNT(*) as count FROM users');
        const userCount = rows[0].count;
        return userCount > 0;
    }
    catch (error) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
            return false;
        }
        console.error('Error checking system initialization:', error);
        return true;
    }
};
export const checkDatabaseSchema = async () => {
    try {
        const tablesToCheck = ['users', 'roles', 'branches'];
        for (const table of tablesToCheck) {
            try {
                await pool.execute(`SELECT 1 FROM ${table} LIMIT 1`);
            }
            catch (error) {
                if (error.code === 'ER_NO_SUCH_TABLE') {
                    return false;
                }
                throw error;
            }
        }
        return true;
    }
    catch (error) {
        console.error('Error checking database schema:', error);
        return false;
    }
};
export const runMigrations = async () => {
    try {
        const migrationsDir = path.join(process.cwd(), 'migrations');
        const migrationFiles = await fs.readdir(migrationsDir);
        const sortedMigrationFiles = migrationFiles
            .filter(file => file.endsWith('.sql'))
            .sort();
        console.log(`Found ${sortedMigrationFiles.length} migration files to run`);
        for (const migrationFile of sortedMigrationFiles) {
            console.log(`Running migration: ${migrationFile}`);
            const migrationPath = path.join(migrationsDir, migrationFile);
            const migrationSql = await fs.readFile(migrationPath, 'utf8');
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
                    }
                    else {
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
                    }
                    else {
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
                }
                else if (char === '"' && !inSingleQuote && !inLineComment && !inBlockComment) {
                    inDoubleQuote = !inDoubleQuote;
                }
                else if (char === ';' && !inSingleQuote && !inDoubleQuote && !inLineComment && !inBlockComment) {
                    statements.push(currentStatement.trim());
                    currentStatement = '';
                    i++;
                    continue;
                }
                currentStatement += char;
                i++;
            }
            if (currentStatement.trim()) {
                statements.push(currentStatement.trim());
            }
            for (const statement of statements) {
                if (statement) {
                    try {
                        await pool.execute(statement);
                    }
                    catch (stmtError) {
                        if (stmtError.errno === 1060) {
                            console.log(`Column already exists, skipping: ${statement.substring(0, 50)}...`);
                            continue;
                        }
                        else if (stmtError.errno === 1061) {
                            console.log(`Index already exists, skipping: ${statement.substring(0, 50)}...`);
                            continue;
                        }
                        else if (stmtError.errno === 1050) {
                            console.log(`Table already exists, skipping: ${statement.substring(0, 50)}...`);
                            continue;
                        }
                        else {
                            console.error(`Error executing statement in ${migrationFile}:`, stmtError);
                            throw stmtError;
                        }
                    }
                }
            }
            console.log(`Completed migration: ${migrationFile}`);
        }
        console.log('All migrations completed successfully');
    }
    catch (error) {
        console.error('Error running migrations:', error);
        throw error;
    }
};
export const initializeCompleteSystem = async (req, res) => {
    try {
        const systemInitialized = await isSystemInitialized();
        if (systemInitialized) {
            return res.status(400).json({
                success: false,
                message: 'System is already initialized. Cannot run complete initialization again.'
            });
        }
        const { email, password, fullName, phone } = req.body;
        if (!email || !password || !fullName) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, and full name are required'
            });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }
        let schemaExists = await checkDatabaseSchema();
        if (!schemaExists) {
            console.log('Database schema not found. Running migrations...');
            await runMigrations();
            console.log('Migrations completed successfully');
        }
        else {
            console.log('Database schema already exists');
        }
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const [roleResult] = await pool.execute('INSERT INTO roles (name, description, permissions, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())', ['Super Admin', 'System super administrator with all privileges', JSON.stringify(['*'])]);
        const superAdminRoleId = roleResult.insertId;
        const [userResult] = await pool.execute(`INSERT INTO users 
       (email, password_hash, full_name, phone, role_id, branch_id, status, must_change_password, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NULL, 'active', 0, NOW(), NOW())`, [email, passwordHash, fullName, phone || null, superAdminRoleId]);
        const userId = userResult.insertId;
        const tokenPayload = {
            userId: userId,
            email: email,
            role_id: superAdminRoleId
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '24h' });
        try {
            await sendWelcomeEmail({ to: email, fullName });
        }
        catch (emailError) {
            console.error('Error sending welcome email:', emailError);
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
    }
    catch (error) {
        console.error('Complete system initialization error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during complete system initialization'
        });
    }
};
export const checkSystemReadiness = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error checking system readiness:', error);
        return res.status(500).json({
            success: false,
            message: 'Error checking system readiness'
        });
    }
};
//# sourceMappingURL=complete-system-init.controller.js.map