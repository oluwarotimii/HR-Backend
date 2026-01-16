import { pool } from '../config/database';

export interface Holiday {
  id: number;
  holiday_name: string;
  date: Date;
  branch_id: number | null;
  is_mandatory: boolean;
  description: string | null;
  created_by: number | null;
  created_at: Date;
}

export interface HolidayInput {
  holiday_name: string;
  date: Date;
  branch_id?: number | null;
  is_mandatory?: boolean;
  description?: string | null;
  created_by?: number | null;
}

export interface HolidayUpdate {
  holiday_name?: string;
  date?: Date;
  branch_id?: number | null;
  is_mandatory?: boolean;
  description?: string | null;
}

class HolidayModel {
  static tableName = 'holidays';

  static async findAll(): Promise<Holiday[]> {
    const [rows] = await pool.execute(`SELECT * FROM ${this.tableName} ORDER BY date DESC`);
    return rows as Holiday[];
  }

  static async findById(id: number): Promise<Holiday | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return (rows as Holiday[])[0] || null;
  }

  static async findByDate(date: Date): Promise<Holiday[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE date = ? ORDER BY holiday_name`,
      [date]
    );
    return rows as Holiday[];
  }

  static async findByBranch(branchId: number): Promise<Holiday[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE branch_id = ? OR branch_id IS NULL ORDER BY date DESC`,
      [branchId]
    );
    return rows as Holiday[];
  }

  static async isHoliday(date: Date, branchId?: number | null): Promise<boolean> {
    let query = '';
    const params: any[] = [date];

    if (branchId !== undefined && branchId !== null) {
      query = `SELECT id FROM ${this.tableName} WHERE date = ? AND (branch_id = ? OR branch_id IS NULL) LIMIT 1`;
      params.push(branchId);
    } else {
      query = `SELECT id FROM ${this.tableName} WHERE date = ? LIMIT 1`;
    }

    const [rows] = await pool.execute(query, params) as [any[], any];
    return (rows as any[]).length > 0;
  }

  static async getHolidaysInRange(startDate: Date, endDate: Date, branchId?: number | null): Promise<Holiday[]> {
    let query = '';
    const params: any[] = [startDate, endDate];

    if (branchId !== undefined && branchId !== null) {
      query = `SELECT * FROM ${this.tableName} WHERE date BETWEEN ? AND ? AND (branch_id = ? OR branch_id IS NULL) ORDER BY date`;
      params.push(branchId);
    } else {
      query = `SELECT * FROM ${this.tableName} WHERE date BETWEEN ? AND ? ORDER BY date`;
    }

    const [rows] = await pool.execute(query, params) as [Holiday[], any];
    return rows as Holiday[];
  }

  static async create(holidayData: HolidayInput): Promise<Holiday> {
    const [result]: any = await pool.execute(
      `INSERT INTO ${this.tableName} (holiday_name, date, branch_id, is_mandatory, description, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        holidayData.holiday_name,
        holidayData.date,
        holidayData.branch_id || null,
        holidayData.is_mandatory ?? true,
        holidayData.description || null,
        holidayData.created_by || null
      ]
    );

    const insertedId = result.insertId;
    const createdItem = await this.findById(insertedId);

    if (!createdItem) {
      throw new Error('Failed to create holiday');
    }

    return createdItem;
  }

  static async update(id: number, holidayData: HolidayUpdate): Promise<Holiday | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (holidayData.holiday_name !== undefined) {
      updates.push('holiday_name = ?');
      values.push(holidayData.holiday_name);
    }

    if (holidayData.date !== undefined) {
      updates.push('date = ?');
      values.push(holidayData.date);
    }

    if (holidayData.branch_id !== undefined) {
      updates.push('branch_id = ?');
      values.push(holidayData.branch_id);
    }

    if (holidayData.is_mandatory !== undefined) {
      updates.push('is_mandatory = ?');
      values.push(holidayData.is_mandatory);
    }

    if (holidayData.description !== undefined) {
      updates.push('description = ?');
      values.push(holidayData.description);
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
}

export default HolidayModel;