import { pool } from '../config/database';

export interface FloatingDayRequest {
  id: number;
  user_id: number;
  date: Date;
  reason: string | null;
  status: 'pending' | 'cleared' | 'approved' | 'rejected' | 'cancelled';
  cleared_by: number | null;
  cleared_at: Date | null;
  approved_by: number | null;
  approved_at: Date | null;
  rejected_by: number | null;
  rejected_at: Date | null;
  rejection_reason: string | null;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface FloatingDayRequestInput {
  user_id: number;
  date: Date;
  reason?: string | null;
  created_by?: number;
}

class FloatingDayRequestModel {
  static tableName = 'floating_day_requests';

  static async findById(id: number): Promise<FloatingDayRequest | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return (rows as FloatingDayRequest[])[0] || null;
  }

  static async findByUserId(userId: number): Promise<any[]> {
    const [rows] = await pool.execute(
      `SELECT fdr.*, clr.full_name as cleared_by_name, apr.full_name as approved_by_name
       FROM ${this.tableName} fdr
       LEFT JOIN users clr ON fdr.cleared_by = clr.id
       LEFT JOIN users apr ON fdr.approved_by = apr.id
       WHERE fdr.user_id = ?
       ORDER BY fdr.created_at DESC`,
      [userId]
    );
    return rows as any[];
  }

  static async findAll(status?: string): Promise<any[]> {
    let query = `SELECT fdr.*, u.full_name as user_name,
                        clr.full_name as cleared_by_name, apr.full_name as approved_by_name
                 FROM ${this.tableName} fdr
                 JOIN users u ON fdr.user_id = u.id
                 LEFT JOIN users clr ON fdr.cleared_by = clr.id
                 LEFT JOIN users apr ON fdr.approved_by = apr.id`;
    const params: any[] = [];

    if (status) {
      query += ' WHERE fdr.status = ?';
      params.push(status);
    }

    query += ' ORDER BY fdr.created_at DESC';
    const [rows] = await pool.execute(query, params);
    return rows as any[];
  }

  static async findPendingForManager(managerUserId: number): Promise<any[]> {
    const [rows] = await pool.execute(
      `SELECT fdr.*, u.full_name as user_name
       FROM ${this.tableName} fdr
       JOIN users u ON fdr.user_id = u.id
       JOIN staff s ON s.user_id = fdr.user_id
       WHERE s.reporting_manager_id = ?
         AND fdr.status = 'pending'
       ORDER BY fdr.created_at DESC`,
      [managerUserId]
    );
    return rows as any[];
  }

  static async create(data: FloatingDayRequestInput): Promise<FloatingDayRequest> {
    const [result]: any = await pool.execute(
      `INSERT INTO ${this.tableName} (user_id, date, reason, created_by)
       VALUES (?, ?, ?, ?)`,
      [data.user_id, data.date, data.reason || null, data.created_by || data.user_id]
    );

    const created = await this.findById(result.insertId);
    if (!created) throw new Error('Failed to create floating day request');
    return created;
  }

  static async updateStatus(
    id: number,
    status: string,
    extra: Record<string, any> = {}
  ): Promise<boolean> {
    const setClauses: string[] = ['status = ?'];
    const values: any[] = [status];

    if (extra.cleared_by !== undefined) {
      setClauses.push('cleared_by = ?');
      values.push(extra.cleared_by);
      setClauses.push('cleared_at = NOW()');
    }
    if (extra.approved_by !== undefined) {
      setClauses.push('approved_by = ?');
      values.push(extra.approved_by);
      setClauses.push('approved_at = NOW()');
    }
    if (extra.rejected_by !== undefined) {
      setClauses.push('rejected_by = ?');
      values.push(extra.rejected_by);
      setClauses.push('rejected_at = NOW()');
    }
    if (extra.rejection_reason !== undefined) {
      setClauses.push('rejection_reason = ?');
      values.push(extra.rejection_reason);
    }

    values.push(id);
    const result: any = await pool.execute(
      `UPDATE ${this.tableName} SET ${setClauses.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }
}

export default FloatingDayRequestModel;
