import { pool } from '../config/database';

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  entity_type: string;
  entity_id: number;
  before_data?: string; // JSON string
  after_data?: string; // JSON string
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface AuditLogInput {
  user_id?: number;
  action: string;
  entity_type: string;
  entity_id: number;
  before_data?: any; // Will be converted to JSON string
  after_data?: any; // Will be converted to JSON string
  ip_address?: string;
  user_agent?: string;
}

class AuditLogModel {
  static tableName = 'audit_logs';

  static async findAll(limit: number = 20, offset: number = 0): Promise<AuditLog[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows as AuditLog[];
  }

  static async findById(id: number): Promise<AuditLog | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return (rows as AuditLog[])[0] || null;
  }

  static async findByEntity(entityType: string, entityId: number): Promise<AuditLog[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC`,
      [entityType, entityId]
    );
    return rows as AuditLog[];
  }

  static async findByUser(userId: number): Promise<AuditLog[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    return rows as AuditLog[];
  }

  static async findByAction(action: string): Promise<AuditLog[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE action = ? ORDER BY created_at DESC`,
      [action]
    );
    return rows as AuditLog[];
  }

  static async create(logData: AuditLogInput): Promise<AuditLog> {
    const [result]: any = await pool.execute(
      `INSERT INTO ${this.tableName} (user_id, action, entity_type, entity_id, before_data, after_data, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        logData.user_id,
        logData.action,
        logData.entity_type,
        logData.entity_id,
        logData.before_data ? JSON.stringify(logData.before_data) : null,
        logData.after_data ? JSON.stringify(logData.after_data) : null,
        logData.ip_address,
        logData.user_agent
      ]
    );

    const insertedId = result.insertId;
    const createdItem = await this.findById(insertedId);

    if (!createdItem) {
      throw new Error('Failed to create audit log');
    }

    return createdItem;
  }

  // Create a log for staff operations
  static async logStaffOperation(
    userId: number,
    action: string,
    staffId: number,
    beforeData?: any,
    afterData?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditLog> {
    const logData: AuditLogInput = {
      user_id: userId,
      action,
      entity_type: 'staff',
      entity_id: staffId,
      before_data: beforeData,
      after_data: afterData,
      ip_address: ipAddress,
      user_agent: userAgent
    };

    const result = await this.create(logData);
    if (!result) {
      throw new Error('Failed to create audit log');
    }
    return result;
  }
}

export default AuditLogModel;