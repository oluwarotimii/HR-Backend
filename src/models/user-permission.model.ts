import { pool } from '../config/database';

export interface UserPermission {
  id: number;
  user_id: number;
  permission: string;
  allow_deny: 'allow' | 'deny';
  created_at: Date;
  updated_at: Date;
}

export interface UserPermissionInput {
  user_id: number;
  permission: string;
  allow_deny?: 'allow' | 'deny';
}

export interface UserPermissionUpdate {
  allow_deny?: 'allow' | 'deny';
}

class UserPermissionModel {
  static tableName = 'user_permissions';

  static async findAll(): Promise<UserPermission[]> {
    const [rows] = await pool.execute(`SELECT * FROM ${this.tableName} ORDER BY created_at DESC`);
    return rows as UserPermission[];
  }

  static async findById(id: number): Promise<UserPermission | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return (rows as UserPermission[])[0] || null;
  }

  static async findByUserId(userId: number): Promise<UserPermission[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE user_id = ?`,
      [userId]
    );
    return rows as UserPermission[];
  }

  static async findByUserAndPermission(userId: number, permission: string): Promise<UserPermission | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE user_id = ? AND permission = ?`,
      [userId, permission]
    );
    return (rows as UserPermission[])[0] || null;
  }

  static async create(permissionData: UserPermissionInput): Promise<UserPermission> {
    const [result]: any = await pool.execute(
      `INSERT INTO ${this.tableName} (user_id, permission, allow_deny)
       VALUES (?, ?, ?)`,
      [
        permissionData.user_id,
        permissionData.permission,
        permissionData.allow_deny || 'allow'
      ]
    );

    const insertedId = result.insertId;
    const createdItem = await this.findById(insertedId);

    if (!createdItem) {
      throw new Error('Failed to create user permission');
    }

    return createdItem;
  }

  static async update(id: number, permissionData: UserPermissionUpdate): Promise<UserPermission | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (permissionData.allow_deny !== undefined) {
      updates.push('allow_deny = ?');
      values.push(permissionData.allow_deny);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    await pool.execute(
      `UPDATE ${this.tableName} SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const result: any = await pool.execute(
      `DELETE FROM ${this.tableName} WHERE id = ?`,
      [id]
    );

    return result.affectedRows > 0;
  }

  static async deleteUserPermission(userId: number, permission: string): Promise<boolean> {
    const result: any = await pool.execute(
      `DELETE FROM ${this.tableName} WHERE user_id = ? AND permission = ?`,
      [userId, permission]
    );

    return result.affectedRows > 0;
  }

  // Method to get all permissions for a specific user
  static async getUserPermissions(userId: number): Promise<UserPermission[]> {
    return await this.findByUserId(userId);
  }

  // Method to check if a user has a specific permission
  static async hasPermission(userId: number, permission: string): Promise<boolean> {
    const userPerm = await this.findByUserAndPermission(userId, permission);
    
    // If user has explicit permission, return its value
    if (userPerm) {
      return userPerm.allow_deny === 'allow';
    }
    
    // If no explicit user permission, check role-based permissions
    // This would require joining with roles_permissions table
    // Implementation would depend on the roles_permissions model
    
    // For now, return false if no explicit permission
    return false;
  }
}

export default UserPermissionModel;