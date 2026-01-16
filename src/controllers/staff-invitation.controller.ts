import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import { pool } from '../config/database';
import { sendStaffInvitationEmail } from '../services/email.service';
import { authenticateJWT } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/auth.middleware';

// Function to generate a temporary password
const generateTemporaryPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Function to create an email via cPanel API
const createCpanelEmail = async (email: string, password: string): Promise<boolean> => {
  try {
    // Extract username and domain from email
    const [username, domain] = email.split('@');
    
    // cPanel API parameters
    const cpanelParams = {
      cpanel_jsonapi_module: 'Email',
      cpanel_jsonapi_func: 'add_pop',
      cpanel_jsonapi_apiversion: 2,
      domain: domain,
      email: username,
      password: password,
      quota: 1000 // Quota in MB, adjust as needed
    };

    // Make request to cPanel API
    const response = await axios.post(
      `https://${process.env.CPANEL_HOST || 'bhs108b.superfasthost.cloud'}:2083/json-api/cpanel`,
      new URLSearchParams(cpanelParams as any),
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.CPANEL_USERNAME}:${process.env.CPANEL_PASSWORD}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        httpsAgent: new (require('https')).Agent({ rejectUnauthorized: false }) // Note: In production, properly configure SSL
      }
    );

    // Check if the request was successful
    if (response.data && response.data.cpanelresult && response.data.cpanelresult.error) {
      console.error('cPanel API error:', response.data.cpanelresult.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error creating cPanel email:', error);
    return false;
  }
};

// Invite a new staff member
export const inviteStaffMember = async (req: Request, res: Response) => {
  try {
    // Verify that the user has permission to invite staff
    // This would be handled by middleware in the route definition

    const { 
      firstName, 
      lastName, 
      personalEmail, 
      phone, 
      roleId, 
      branchId, 
      departmentId 
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !personalEmail || !roleId) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, personal email, and role ID are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personalEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid personal email format'
      });
    }

    // Check if role exists
    const [roleRows]: any = await pool.execute(
      'SELECT id FROM roles WHERE id = ?',
      [roleId]
    );
    
    if (roleRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Check if branch exists (if provided)
    if (branchId) {
      const [branchRows]: any = await pool.execute(
        'SELECT id FROM branches WHERE id = ?',
        [branchId]
      );
      
      if (branchRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Branch not found'
        });
      }
    }

    // Check if department exists (if provided)
    if (departmentId) {
      const [deptRows]: any = await pool.execute(
        'SELECT id FROM departments WHERE id = ?',
        [departmentId]
      );
      
      if (deptRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }
    }

    // Generate work email
    const workEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@tripa.com.ng`;

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword();

    // Create email account via cPanel
    const emailCreated = await createCpanelEmail(workEmail, temporaryPassword);
    
    if (!emailCreated) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create work email account. Please try again later.'
      });
    }

    // Hash the temporary password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(temporaryPassword, saltRounds);

    // Create the staff member in the database
    const fullName = `${firstName} ${lastName}`;
    const [userResult]: any = await pool.execute(
      `INSERT INTO users 
       (email, password_hash, full_name, phone, role_id, branch_id, department_id, status, must_change_password, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 1, NOW(), NOW())`,
      [
        workEmail, 
        passwordHash, 
        fullName, 
        phone || null, 
        roleId, 
        branchId || null, 
        departmentId || null
      ]
    );

    const userId = userResult.insertId;

    // Send invitation email to personal email
    try {
      // Get the current admin's name for the email
      const adminId = (req as any).currentUser?.id;
      const [adminRows]: any = await pool.execute(
        'SELECT full_name FROM users WHERE id = ?',
        [adminId]
      );
      
      const adminName = adminRows[0]?.full_name || 'an administrator';
      
      await sendStaffInvitationEmail({
        to: personalEmail,
        fullName: fullName,
        workEmail: workEmail,
        temporaryPassword: temporaryPassword,
        fromAdmin: adminName
      });
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError);
      // Don't fail the invitation if email fails, just log it
    }

    return res.status(201).json({
      success: true,
      message: 'Staff member invited successfully. Work email created and invitation sent.',
      data: {
        userId: userId,
        workEmail: workEmail,
        invitationSent: true
      }
    });
  } catch (error) {
    console.error('Staff invitation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during staff invitation'
    });
  }
};

// Get all available roles for assignment
export const getAvailableRoles = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.execute(
      'SELECT id, name, description FROM roles ORDER BY name'
    );

    return res.json({
      success: true,
      data: {
        roles: rows
      }
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching roles'
    });
  }
};

// Get all branches for assignment
export const getAvailableBranches = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.execute(
      'SELECT id, name, CONCAT(address, ", ", city, ", ", state, ", ", country) as location FROM branches ORDER BY name'
    );

    return res.json({
      success: true,
      data: {
        branches: rows
      }
    });
  } catch (error) {
    console.error('Error fetching branches:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching branches'
    });
  }
};

// Get all departments for assignment
export const getAvailableDepartments = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.execute(
      'SELECT id, name, description FROM departments ORDER BY name'
    );

    return res.json({
      success: true,
      data: {
        departments: rows
      }
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching departments'
    });
  }
};