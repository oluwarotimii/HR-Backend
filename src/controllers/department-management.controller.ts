import { Request, Response } from 'express';
import { pool } from '../config/database';

export interface Department {
  id: number;
  name: string;
  description: string;
  branch_id: number | null;
  created_at: Date;
  updated_at: Date;
}

// Get all departments
export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Additional filtering parameters
    const name = Array.isArray(req.query.name) ? req.query.name[0] : req.query.name;
    const branchId = Array.isArray(req.query.branchId) ? req.query.branchId[0] : req.query.branchId;

    // Validate pagination parameters
    if (page < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page number must be greater than 0'
      });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100'
      });
    }

    // Build query with filters
    let query = `SELECT d.*, b.name as branch_name FROM departments d LEFT JOIN branches b ON d.branch_id = b.id`;
    const params: any[] = [];
    const conditions = [];

    if (typeof name === 'string' && name.trim() !== '') {
      conditions.push('d.name LIKE ?');
      params.push(`%${name}%`);
    }

    if (typeof branchId === 'string' && branchId.trim() !== '') {
      const branchIdNum = parseInt(branchId);
      if (!isNaN(branchIdNum)) {
        conditions.push('d.branch_id = ?');
        params.push(branchIdNum);
      }
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY d.name LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Count query for pagination
    let countQuery = `SELECT COUNT(*) as count FROM departments d`;
    const countParams: any[] = [];
    const countConditions = [];

    if (typeof name === 'string' && name.trim() !== '') {
      countConditions.push('d.name LIKE ?');
      countParams.push(`%${name}%`);
    }

    if (typeof branchId === 'string' && branchId.trim() !== '') {
      const branchIdNum = parseInt(branchId);
      if (!isNaN(branchIdNum)) {
        countConditions.push('d.branch_id = ?');
        countParams.push(branchIdNum);
      }
    }

    if (countConditions.length > 0) {
      countQuery += ` WHERE ${countConditions.join(' AND ')}`;
    }

    const [rows, countResult]: [any, any] = await Promise.all([
      pool.execute(query, params),
      pool.execute(countQuery, countParams)
    ]);

    const departments = rows[0] as Department[];
    const totalCount = countResult[0][0].count;
    const totalPages = Math.ceil(totalCount / limit);

    return res.json({
      success: true,
      message: 'Departments retrieved successfully',
      data: {
        departments,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          nextPage: page < totalPages ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null
        }
      }
    });
  } catch (error) {
    console.error('Get all departments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get department by ID
export const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const deptIdStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const deptId = parseInt(typeof deptIdStr === 'string' ? deptIdStr : '');

    if (isNaN(deptId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department ID'
      });
    }

    const [rows] = await pool.execute(
      `SELECT d.*, b.name as branch_name FROM departments d 
       LEFT JOIN branches b ON d.branch_id = b.id 
       WHERE d.id = ?`,
      [deptId]
    );

    const department = (rows as Department[])[0];
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    return res.json({
      success: true,
      message: 'Department retrieved successfully',
      data: { department }
    });
  } catch (error) {
    console.error('Get department by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create a new department
export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name, description, branch_id } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Department name is required'
      });
    }

    // Check if department with this name already exists
    const [existingRows] = await pool.execute(
      'SELECT id FROM departments WHERE name = ?',
      [name]
    ) as [any[], any];

    if (existingRows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A department with this name already exists'
      });
    }

    // If branch_id is provided, validate that the branch exists
    if (branch_id) {
      const [branchRows] = await pool.execute(
        'SELECT id FROM branches WHERE id = ?',
        [branch_id]
      ) as [any[], any];

      if (branchRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Branch not found'
        });
      }
    }

    // Create the department
    const [result]: any = await pool.execute(
      `INSERT INTO departments (name, description, branch_id, created_at, updated_at) 
       VALUES (?, ?, ?, NOW(), NOW())`,
      [name, description || '', branch_id || null]
    );

    const deptId = result.insertId;

    // Get the created department
    const [newDeptRows] = await pool.execute(
      `SELECT d.*, b.name as branch_name FROM departments d 
       LEFT JOIN branches b ON d.branch_id = b.id 
       WHERE d.id = ?`,
      [deptId]
    );

    const newDepartment = (newDeptRows as Department[])[0];

    return res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: { department: newDepartment }
    });
  } catch (error) {
    console.error('Create department error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update a department
export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const deptIdStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const deptId = parseInt(typeof deptIdStr === 'string' ? deptIdStr : '');
    const { name, description, branch_id } = req.body;

    if (isNaN(deptId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department ID'
      });
    }

    // Check if department exists
    const [existingRows] = await pool.execute(
      'SELECT id FROM departments WHERE id = ?',
      [deptId]
    ) as [any[], any];

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // If name is being updated, check if another department already has this name
    if (name) {
      const [sameNameRows] = await pool.execute(
        'SELECT id FROM departments WHERE name = ? AND id != ?',
        [name, deptId]
      ) as [any[], any];

      if (sameNameRows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Another department with this name already exists'
        });
      }
    }

    // If branch_id is provided, validate that the branch exists
    if (branch_id !== undefined) {
      if (branch_id) {
        const [branchRows] = await pool.execute(
          'SELECT id FROM branches WHERE id = ?',
          [branch_id]
        ) as [any[], any];

        if (branchRows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Branch not found'
          });
        }
      }
    }

    // Prepare update query
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (branch_id !== undefined) {
      updates.push('branch_id = ?');
      values.push(branch_id);
    }

    if (updates.length === 0) {
      // No updates to make, return current department
      return getDepartmentById(req, res);
    }

    values.push(deptId);

    // Perform the update
    await pool.execute(
      `UPDATE departments SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    // Get the updated department
    const [updatedDeptRows] = await pool.execute(
      `SELECT d.*, b.name as branch_name FROM departments d 
       LEFT JOIN branches b ON d.branch_id = b.id 
       WHERE d.id = ?`,
      [deptId]
    );

    const updatedDepartment = (updatedDeptRows as Department[])[0];

    return res.json({
      success: true,
      message: 'Department updated successfully',
      data: { department: updatedDepartment }
    });
  } catch (error) {
    console.error('Update department error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete a department
export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const deptIdStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const deptId = parseInt(typeof deptIdStr === 'string' ? deptIdStr : '');

    if (isNaN(deptId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department ID'
      });
    }

    // Check if department exists
    const [existingRows] = await pool.execute(
      'SELECT id FROM departments WHERE id = ?',
      [deptId]
    ) as [any[], any];

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if any staff members are assigned to this department
    const [staffRows] = await pool.execute(
      'SELECT COUNT(*) as count FROM staff WHERE department = (SELECT name FROM departments WHERE id = ?)',
      [deptId]
    ) as [any[], any];

    if (staffRows[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete department that has staff members assigned to it'
      });
    }

    // Delete the department
    await pool.execute(
      'DELETE FROM departments WHERE id = ?',
      [deptId]
    );

    return res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};