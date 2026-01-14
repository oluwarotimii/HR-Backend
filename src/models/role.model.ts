import { pool } from '../config/database';

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: string[]; // JSON field as string array
  created_at: Date;
  updated_at: Date;
}

export interface RoleInput {
  name: string;
  description?: string;
  permissions: string[];
}

export interface RoleUpdate {
  name?: string;
  description?: string;
  permissions?: string[];
}

class RoleModel {
  static tableName = 'roles';

  static async findAll(): Promise<Role[]> {
    const [rows] = await pool.execute(`SELECT * FROM ${this.tableName} ORDER BY created_at DESC`);
    return rows as Role[];
  }

  static async findById(id: number): Promise<Role | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return (rows as Role[])[0] || null;
  }

  static async findByName(name: string): Promise<Role | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE name = ?`,
      [name]
    );
    return (rows as Role[])[0] || null;
  }

  static async create(roleData: RoleInput): Promise<Role> {
    const [result]: any = await pool.execute(
      `INSERT INTO ${this.tableName} (name, description, permissions)
       VALUES (?, ?, ?)`,
      [
        roleData.name,
        roleData.description,
        JSON.stringify(roleData.permissions)
      ]
    );

    const insertedId = result.insertId;
    const createdItem = await this.findById(insertedId);

    if (!createdItem) {
      throw new Error('Failed to create role');
    }

    return createdItem;
  }

  static async update(id: number, roleData: RoleUpdate): Promise<Role | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (roleData.name !== undefined) {
      updates.push('name = ?');
      values.push(roleData.name);
    }

    if (roleData.description !== undefined) {
      updates.push('description = ?');
      values.push(roleData.description);
    }

    if (roleData.permissions !== undefined) {
      updates.push('permissions = ?');
      values.push(JSON.stringify(roleData.permissions));
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

  // Method to get permissions for a specific role
  static async getRolePermissions(roleId: number): Promise<string[]> {
    const role = await this.findById(roleId);
    return role ? role.permissions : [];
  }
}

export default RoleModel;