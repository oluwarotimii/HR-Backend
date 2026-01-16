import { pool } from '../config/database';

export interface LeaveAllocation {
  id: number;
  user_id: number;
  leave_type_id: number;
  cycle_start_date: Date;
  cycle_end_date: Date;
  allocated_days: number;
  used_days: number;
  carried_over_days: number;
  created_at: Date;
  updated_at: Date;
}

export interface LeaveAllocationInput {
  user_id: number;
  leave_type_id: number;
  cycle_start_date: Date;
  cycle_end_date: Date;
  allocated_days: number;
  used_days?: number;
  carried_over_days?: number;
}

export interface LeaveAllocationUpdate {
  allocated_days?: number;
  used_days?: number;
  carried_over_days?: number;
}

class LeaveAllocationModel {
  static tableName = 'leave_allocations';

  static async findAll(): Promise<LeaveAllocation[]> {
    const [rows] = await pool.execute(`SELECT * FROM ${this.tableName} ORDER BY created_at DESC`);
    return rows as LeaveAllocation[];
  }

  static async findById(id: number): Promise<LeaveAllocation | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return (rows as LeaveAllocation[])[0] || null;
  }

  static async findByUserId(userId: number): Promise<LeaveAllocation[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE user_id = ? ORDER BY cycle_start_date DESC`,
      [userId]
    );
    return rows as LeaveAllocation[];
  }

  static async findByUserIdAndTypeId(userId: number, leaveTypeId: number): Promise<LeaveAllocation[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE user_id = ? AND leave_type_id = ? ORDER BY cycle_start_date DESC`,
      [userId, leaveTypeId]
    );
    return rows as LeaveAllocation[];
  }

  static async findByCycleDates(startDate: Date, endDate: Date): Promise<LeaveAllocation[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE cycle_start_date >= ? AND cycle_end_date <= ?`,
      [startDate, endDate]
    );
    return rows as LeaveAllocation[];
  }

  static async create(allocationData: LeaveAllocationInput): Promise<LeaveAllocation> {
    const [result]: any = await pool.execute(
      `INSERT INTO ${this.tableName} (user_id, leave_type_id, cycle_start_date, cycle_end_date, allocated_days, used_days, carried_over_days)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        allocationData.user_id,
        allocationData.leave_type_id,
        allocationData.cycle_start_date,
        allocationData.cycle_end_date,
        allocationData.allocated_days,
        allocationData.used_days || 0,
        allocationData.carried_over_days || 0
      ]
    );

    const insertedId = result.insertId;
    const createdItem = await this.findById(insertedId);

    if (!createdItem) {
      throw new Error('Failed to create leave allocation');
    }

    return createdItem;
  }

  static async update(id: number, allocationData: LeaveAllocationUpdate): Promise<LeaveAllocation | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (allocationData.allocated_days !== undefined) {
      updates.push('allocated_days = ?');
      values.push(allocationData.allocated_days);
    }

    if (allocationData.used_days !== undefined) {
      updates.push('used_days = ?');
      values.push(allocationData.used_days);
    }

    if (allocationData.carried_over_days !== undefined) {
      updates.push('carried_over_days = ?');
      values.push(allocationData.carried_over_days);
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
      `DELETE FROM ${this.tableName} WHERE id = ?`,
      [id]
    );

    return result.affectedRows > 0;
  }

  // Method to calculate remaining leave balance
  static async getRemainingBalance(userId: number, leaveTypeId: number): Promise<number> {
    const [rows] = await pool.execute(
      `SELECT allocated_days, used_days, carried_over_days FROM ${this.tableName}
       WHERE user_id = ? AND leave_type_id = ? AND cycle_end_date >= CURDATE()
       ORDER BY cycle_end_date DESC LIMIT 1`,
      [userId, leaveTypeId]
    ) as [LeaveAllocation[], any];

    if (rows.length === 0) {
      return 0;
    }

    const allocation = rows[0];
    return allocation.allocated_days - allocation.used_days + allocation.carried_over_days;
  }

  // Method to update used days when leave is taken
  static async updateUsedDays(allocationId: number, daysUsed: number): Promise<boolean> {
    const result: any = await pool.execute(
      `UPDATE ${this.tableName} SET used_days = used_days + ? WHERE id = ?`,
      [daysUsed, allocationId]
    );

    return result.affectedRows > 0;
  }
}

export default LeaveAllocationModel;