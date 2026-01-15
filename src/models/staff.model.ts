import { pool } from '../config/database';

export interface Staff {
  id: number;
  user_id: number;
  employee_id?: string;
  designation?: string;
  department?: string;
  branch_id?: number;
  joining_date?: Date;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'temporary';
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  created_at: Date;
  updated_at: Date;
}

export interface StaffInput {
  user_id: number;
  employee_id?: string;
  designation?: string;
  department?: string;
  branch_id?: number;
  joining_date?: Date;
  employment_type?: 'full_time' | 'part_time' | 'contract' | 'temporary';
}

export interface StaffUpdate {
  employee_id?: string;
  designation?: string;
  department?: string;
  branch_id?: number;
  joining_date?: Date;
  employment_type?: 'full_time' | 'part_time' | 'contract' | 'temporary';
  status?: 'active' | 'inactive' | 'terminated' | 'on_leave';
}

class StaffModel {
  static tableName = 'staff';

  static async findAll(limit: number = 20, offset: number = 0, branchId?: number): Promise<{staff: Staff[], totalCount: number}> {
    let query = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];

    if (branchId) {
      query += ' WHERE branch_id = ?';
      params.push(branchId);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const countParams: any[] = [];

    if (branchId) {
      countQuery += ' WHERE branch_id = ?';
      countParams.push(branchId);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const totalCount = (countResult as any)[0].count;

    return {
      staff: rows as Staff[],
      totalCount
    };
  }

  // Enhanced method with additional filtering
  static async findAllWithFilters(
    limit: number = 20,
    offset: number = 0,
    branchId?: number,
    department?: string,
    status?: string
  ): Promise<{staff: Staff[], totalCount: number}> {
    let query = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];
    const conditions: string[] = [];

    if (branchId) {
      conditions.push('branch_id = ?');
      params.push(branchId);
    }

    if (department) {
      conditions.push('department = ?');
      params.push(department);
    }

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);

    // Get total count with same filters
    let countQuery = `SELECT COUNT(*) as count FROM ${this.tableName}`;

    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    const [countResult] = await pool.execute(countQuery, params.slice(0, conditions.length));
    const totalCount = (countResult as any)[0].count;

    return {
      staff: rows as Staff[],
      totalCount
    };
  }

  static async findById(id: number): Promise<Staff | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return (rows as Staff[])[0] || null;
  }

  static async findByUserId(userId: number): Promise<Staff | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE user_id = ?`,
      [userId]
    );
    return (rows as Staff[])[0] || null;
  }

  static async findByEmployeeId(employeeId: string): Promise<Staff | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE employee_id = ?`,
      [employeeId]
    );
    return (rows as Staff[])[0] || null;
  }

  static async create(staffData: StaffInput): Promise<Staff> {
    const [result]: any = await pool.execute(
      `INSERT INTO ${this.tableName} (user_id, employee_id, designation, department, branch_id, joining_date, employment_type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        staffData.user_id,
        staffData.employee_id,
        staffData.designation,
        staffData.department,
        staffData.branch_id,
        staffData.joining_date,
        staffData.employment_type || 'full_time'
      ]
    );

    const insertedId = result.insertId;
    const createdItem = await this.findById(insertedId);

    if (!createdItem) {
      throw new Error('Failed to create staff');
    }

    return createdItem;
  }

  static async update(id: number, staffData: StaffUpdate): Promise<Staff | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (staffData.employee_id !== undefined) {
      updates.push('employee_id = ?');
      values.push(staffData.employee_id);
    }

    if (staffData.designation !== undefined) {
      updates.push('designation = ?');
      values.push(staffData.designation);
    }

    if (staffData.department !== undefined) {
      updates.push('department = ?');
      values.push(staffData.department);
    }

    if (staffData.branch_id !== undefined) {
      updates.push('branch_id = ?');
      values.push(staffData.branch_id);
    }

    if (staffData.joining_date !== undefined) {
      updates.push('joining_date = ?');
      values.push(staffData.joining_date);
    }

    if (staffData.employment_type !== undefined) {
      updates.push('employment_type = ?');
      values.push(staffData.employment_type);
    }

    if (staffData.status !== undefined) {
      updates.push('status = ?');
      values.push(staffData.status);
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    values.push(id);

    await pool.execute(
      `UPDATE ${this.tableName} SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return await this.findById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const result: any = await pool.execute(
      `UPDATE ${this.tableName} SET status = 'terminated' WHERE id = ?`,
      [id]
    );

    return result.affectedRows > 0;
  }

  // Soft delete - deactivate staff
  static async deactivate(id: number): Promise<boolean> {
    const result: any = await pool.execute(
      `UPDATE ${this.tableName} SET status = 'inactive' WHERE id = ?`,
      [id]
    );

    return result.affectedRows > 0;
  }

  // Get staff by department
  static async findByDepartment(department: string, branchId?: number): Promise<Staff[]> {
    let query = `SELECT * FROM ${this.tableName} WHERE department = ?`;
    const params = [department];

    if (branchId) {
      query += ' AND branch_id = ?';
      params.push(branchId.toString());
    }

    const [rows] = await pool.execute(query, params);
    return rows as Staff[];
  }

  // Get staff by branch
  static async findByBranch(branchId: number): Promise<Staff[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE branch_id = ?`,
      [branchId.toString()]
    );
    return rows as Staff[];
  }
}

export default StaffModel;