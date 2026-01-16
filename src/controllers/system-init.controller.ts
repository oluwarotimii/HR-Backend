import { Request, Response } from 'express';
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
  } catch (error) {
    console.error('Error checking system initialization:', error);
    return true; // Default to initialized if there's an error
  }
};

// Initialize the system with a Super Admin
export const initializeSystem = async (req: Request, res: Response) => {
  try {
    // Check if system is already initialized
    const systemInitialized = await isSystemInitialized();
    if (systemInitialized) {
      return res.status(400).json({
        success: false,
        message: 'System is already initialized. Cannot create another Super Admin.'
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
      message: 'System initialized successfully. Super Admin created.',
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
    console.error('System initialization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during system initialization'
    });
  }
};

// Check if system is initialized
export const checkInitializationStatus = async (req: Request, res: Response) => {
  try {
    const systemInitialized = await isSystemInitialized();
    
    return res.json({
      success: true,
      data: {
        isInitialized: systemInitialized
      }
    });
  } catch (error) {
    console.error('Error checking initialization status:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking initialization status'
    });
  }
};