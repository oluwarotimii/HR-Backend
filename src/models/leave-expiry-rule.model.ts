import { pool } from '../config/database';

export interface LeaveExpiryRule {
  id: number;
  name: string;
  expire_after_days: number;
  trigger_notification_days: string | null; // JSON string representing array of days
  auto_expire_action: 'forfeit' | 'carryover' | 'extend';
  created_at: Date;
  updated_at: Date;
}

export interface LeaveExpiryRuleInput {
  name: string;
  expire_after_days: number;
  trigger_notification_days?: string | null; // JSON string representing array of days
  auto_expire_action?: 'forfeit' | 'carryover' | 'extend';
}

export interface LeaveExpiryRuleUpdate {
  name?: string;
  expire_after_days?: number;
  trigger_notification_days?: string | null;
  auto_expire_action?: 'forfeit' | 'carryover' | 'extend';
}

class LeaveExpiryRuleModel {
  static tableName = 'leave_expiry_rules';

  static async findAll(): Promise<LeaveExpiryRule[]> {
    const [rows] = await pool.execute(`SELECT * FROM ${this.tableName} ORDER BY created_at DESC`);
    return rows as LeaveExpiryRule[];
  }

  static async findById(id: number): Promise<LeaveExpiryRule | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return (rows as LeaveExpiryRule[])[0] || null;
  }

  static async findByName(name: string): Promise<LeaveExpiryRule | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE name = ?`,
      [name]
    );
    return (rows as LeaveExpiryRule[])[0] || null;
  }

  static async create(expiryRuleData: LeaveExpiryRuleInput): Promise<LeaveExpiryRule> {
    const [result]: any = await pool.execute(
      `INSERT INTO ${this.tableName} (name, expire_after_days, trigger_notification_days, auto_expire_action)
       VALUES (?, ?, ?, ?)`,
      [
        expiryRuleData.name,
        expiryRuleData.expire_after_days,
        expiryRuleData.trigger_notification_days || null,
        expiryRuleData.auto_expire_action || 'forfeit'
      ]
    );

    const insertedId = result.insertId;
    const createdItem = await this.findById(insertedId);

    if (!createdItem) {
      throw new Error('Failed to create leave expiry rule');
    }

    return createdItem;
  }

  static async update(id: number, expiryRuleData: LeaveExpiryRuleUpdate): Promise<LeaveExpiryRule | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (expiryRuleData.name !== undefined) {
      updates.push('name = ?');
      values.push(expiryRuleData.name);
    }

    if (expiryRuleData.expire_after_days !== undefined) {
      updates.push('expire_after_days = ?');
      values.push(expiryRuleData.expire_after_days);
    }

    if (expiryRuleData.trigger_notification_days !== undefined) {
      updates.push('trigger_notification_days = ?');
      values.push(expiryRuleData.trigger_notification_days);
    }

    if (expiryRuleData.auto_expire_action !== undefined) {
      updates.push('auto_expire_action = ?');
      values.push(expiryRuleData.auto_expire_action);
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

export default LeaveExpiryRuleModel;