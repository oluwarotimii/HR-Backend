import { pool } from '../config/database';

export interface ShiftTiming {
  id: number;
  user_id: number | null;
  shift_name: string;
  start_time: string; // Format: "HH:mm:ss"
  end_time: string; // Format: "HH:mm:ss"
  effective_from: Date;
  effective_to: Date | null;
  override_branch_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface ShiftTimingInput {
  shift_name: string;
  start_time: string; // Format: "HH:mm:ss"
  end_time: string; // Format: "HH:mm:ss"
  effective_from: Date;
  user_id?: number | null;
  effective_to?: Date | null;
  override_branch_id?: number | null;
}

export interface ShiftTimingUpdate {
  shift_name?: string;
  start_time?: string; // Format: "HH:mm:ss"
  end_time?: string; // Format: "HH:mm:ss"
  effective_from?: Date;
  effective_to?: Date | null;
  override_branch_id?: number | null;
}

class ShiftTimingModel {
  static tableName = 'shift_timings';

  static async findAll(): Promise<ShiftTiming[]> {
    const [rows] = await pool.execute(`SELECT * FROM ${this.tableName} ORDER BY effective_from DESC`);
    return rows as ShiftTiming[];
  }

  static async findById(id: number): Promise<ShiftTiming | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return (rows as ShiftTiming[])[0] || null;
  }

  static async findByUserId(userId: number): Promise<ShiftTiming[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE user_id = ? ORDER BY effective_from DESC`,
      [userId]
    );
    return rows as ShiftTiming[];
  }

  static async findCurrentShiftForUser(userId: number, date: Date = new Date()): Promise<ShiftTiming | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} 
       WHERE (user_id = ? OR user_id IS NULL) 
       AND effective_from <= ? 
       AND (effective_to IS NULL OR effective_to >= ?)
       ORDER BY user_id DESC, effective_from DESC LIMIT 1`,
      [userId, date, date]
    );
    return (rows as ShiftTiming[])[0] || null;
  }

  static async findCurrentShiftForBranch(branchId: number, date: Date = new Date()): Promise<ShiftTiming[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} 
       WHERE override_branch_id = ?
       AND effective_from <= ? 
       AND (effective_to IS NULL OR effective_to >= ?)
       ORDER BY effective_from DESC`,
      [branchId, date, date]
    );
    return rows as ShiftTiming[];
  }

  static async create(shiftData: ShiftTimingInput): Promise<ShiftTiming> {
    const [result]: any = await pool.execute(
      `INSERT INTO ${this.tableName} (user_id, shift_name, start_time, end_time, effective_from, effective_to, override_branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        shiftData.user_id || null,
        shiftData.shift_name,
        shiftData.start_time,
        shiftData.end_time,
        shiftData.effective_from,
        shiftData.effective_to || null,
        shiftData.override_branch_id || null
      ]
    );

    const insertedId = result.insertId;
    const createdItem = await this.findById(insertedId);

    if (!createdItem) {
      throw new Error('Failed to create shift timing');
    }

    return createdItem;
  }

  static async update(id: number, shiftData: ShiftTimingUpdate): Promise<ShiftTiming | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (shiftData.shift_name !== undefined) {
      updates.push('shift_name = ?');
      values.push(shiftData.shift_name);
    }

    if (shiftData.start_time !== undefined) {
      updates.push('start_time = ?');
      values.push(shiftData.start_time);
    }

    if (shiftData.end_time !== undefined) {
      updates.push('end_time = ?');
      values.push(shiftData.end_time);
    }

    if (shiftData.effective_from !== undefined) {
      updates.push('effective_from = ?');
      values.push(shiftData.effective_from);
    }

    if (shiftData.effective_to !== undefined) {
      updates.push('effective_to = ?');
      values.push(shiftData.effective_to);
    }

    if (shiftData.override_branch_id !== undefined) {
      updates.push('override_branch_id = ?');
      values.push(shiftData.override_branch_id);
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

  // Method to check if a shift is currently active for a user
  static async isShiftActive(userId: number, date: Date = new Date()): Promise<boolean> {
    const shift = await this.findCurrentShiftForUser(userId, date);
    return shift !== null;
  }

  // Method to get expected check-in/out times for a user on a specific date
  static async getExpectedTimes(userId: number, date: Date): Promise<{ startTime: string; endTime: string } | null> {
    const shift = await this.findCurrentShiftForUser(userId, date);
    if (!shift) {
      return null;
    }
    return {
      startTime: shift.start_time,
      endTime: shift.end_time
    };
  }
}

export default ShiftTimingModel;