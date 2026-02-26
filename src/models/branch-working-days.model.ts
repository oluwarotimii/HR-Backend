import { pool } from '../config/database';

export interface BranchWorkingDay {
  id: number;
  branch_id: number;
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  is_working_day: boolean;
  start_time: string | null;
  end_time: string | null;
  break_duration_minutes: number;
  created_at: Date;
  updated_at: Date;
}

export interface BranchWorkingDayInput {
  branch_id: number;
  day_of_week: string;
  is_working_day?: boolean;
  start_time?: string;
  end_time?: string;
  break_duration_minutes?: number;
}

class BranchWorkingDaysModel {
  static tableName = 'branch_working_days';

  /**
   * Get all working days for a branch
   */
  static async findByBranchId(branchId: number): Promise<BranchWorkingDay[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE branch_id = ? ORDER BY FIELD(day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')`,
      [branchId]
    );
    return rows as BranchWorkingDay[];
  }

  /**
   * Get working days for a specific day of week
   */
  static async findByBranchIdAndDay(branchId: number, dayOfWeek: string): Promise<BranchWorkingDay | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE branch_id = ? AND day_of_week = ?`,
      [branchId, dayOfWeek]
    );
    return (rows as BranchWorkingDay[])[0] || null;
  }

  /**
   * Check if a day is a working day for a branch
   */
  static async isWorkingDay(branchId: number, dayOfWeek: string): Promise<boolean> {
    const workingDay = await this.findByBranchIdAndDay(branchId, dayOfWeek);
    return workingDay?.is_working_day === true;
  }

  /**
   * Get working hours for a specific day
   */
  static async getWorkingHours(branchId: number, dayOfWeek: string): Promise<{
    is_working_day: boolean;
    start_time: string | null;
    end_time: string | null;
    break_duration_minutes: number;
  } | null> {
    const workingDay = await this.findByBranchIdAndDay(branchId, dayOfWeek);
    if (!workingDay) return null;
    
    return {
      is_working_day: workingDay.is_working_day,
      start_time: workingDay.start_time,
      end_time: workingDay.end_time,
      break_duration_minutes: workingDay.break_duration_minutes
    };
  }

  /**
   * Create or update a working day entry
   */
  static async upsert(workingDay: BranchWorkingDayInput): Promise<BranchWorkingDay> {
    const [result]: any = await pool.execute(
      `INSERT INTO ${this.tableName} 
       (branch_id, day_of_week, is_working_day, start_time, end_time, break_duration_minutes)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       is_working_day = VALUES(is_working_day),
       start_time = VALUES(start_time),
       end_time = VALUES(end_time),
       break_duration_minutes = VALUES(break_duration_minutes)`,
      [
        workingDay.branch_id,
        workingDay.day_of_week,
        workingDay.is_working_day !== undefined ? workingDay.is_working_day : true,
        workingDay.start_time || null,
        workingDay.end_time || null,
        workingDay.break_duration_minutes || 30
      ]
    );

    const id = result.insertId || (await this.findByBranchIdAndDay(workingDay.branch_id, workingDay.day_of_week))?.id;
    
    if (!id) {
      throw new Error('Failed to create/update working day');
    }

    return (await this.findById(id))!;
  }

  /**
   * Bulk update all working days for a branch
   */
  static async bulkUpdate(branchId: number, workingDays: Array<{
    day_of_week: string;
    is_working_day: boolean;
    start_time?: string;
    end_time?: string;
    break_duration_minutes?: number;
  }>): Promise<BranchWorkingDay[]> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      for (const day of workingDays) {
        await connection.execute(
          `INSERT INTO ${this.tableName} 
           (branch_id, day_of_week, is_working_day, start_time, end_time, break_duration_minutes)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           is_working_day = VALUES(is_working_day),
           start_time = VALUES(start_time),
           end_time = VALUES(end_time),
           break_duration_minutes = VALUES(break_duration_minutes)`,
          [
            branchId,
            day.day_of_week,
            day.is_working_day,
            day.start_time || null,
            day.end_time || null,
            day.break_duration_minutes || 30
          ]
        );
      }

      await connection.commit();
      return await this.findByBranchId(branchId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get working days for multiple branches
   */
  static async findByBranchIds(branchIds: number[]): Promise<BranchWorkingDay[]> {
    if (branchIds.length === 0) return [];
    
    const placeholders = branchIds.map(() => '?').join(',');
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE branch_id IN (${placeholders}) ORDER BY branch_id, FIELD(day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')`,
      branchIds
    );
    return rows as BranchWorkingDay[];
  }

  /**
   * Delete working days for a branch
   */
  static async deleteByBranchId(branchId: number): Promise<boolean> {
    const result: any = await pool.execute(
      `DELETE FROM ${this.tableName} WHERE branch_id = ?`,
      [branchId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Get by ID
   */
  static async findById(id: number): Promise<BranchWorkingDay | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return (rows as BranchWorkingDay[])[0] || null;
  }
}

export default BranchWorkingDaysModel;
