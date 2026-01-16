import { pool } from '../config/database';

export interface Form {
  id: number;
  name: string;
  description?: string;
  form_type: 'leave_request' | 'appraisal' | 'application' | 'feedback' | 'custom';
  branch_id?: number;
  created_by: number;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface FormInput {
  name: string;
  description?: string;
  form_type: 'leave_request' | 'appraisal' | 'application' | 'feedback' | 'custom';
  branch_id?: number;
  created_by: number;
}

export interface FormUpdate {
  name?: string;
  description?: string;
  form_type?: 'leave_request' | 'appraisal' | 'application' | 'feedback' | 'custom';
  branch_id?: number;
  is_active?: boolean;
}

class FormModel {
  static tableName = 'forms';

  static async findAll(branchId?: number): Promise<Form[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];

    if (branchId) {
      query += ' WHERE branch_id = ?';
      params.push(branchId);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows as Form[];
  }

  static async findById(id: number): Promise<Form | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return (rows as Form[])[0] || null;
  }

  static async findByType(formType: string, branchId?: number): Promise<Form[]> {
    let query = `SELECT * FROM ${this.tableName} WHERE form_type = ?`;
    const params = [formType];

    if (branchId) {
      query += ' AND branch_id = ?';
      params.push(branchId.toString());
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows as Form[];
  }

  static async create(formData: FormInput): Promise<Form> {
    const [result]: any = await pool.execute(
      `INSERT INTO ${this.tableName} (name, description, form_type, branch_id, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [
        formData.name,
        formData.description ?? null,
        formData.form_type,
        formData.branch_id ?? null,
        formData.created_by ?? null
      ]
    );

    const insertedId = result.insertId;
    const createdItem = await this.findById(insertedId);

    if (!createdItem) {
      throw new Error('Failed to create form');
    }

    return createdItem;
  }

  static async update(id: number, formData: FormUpdate): Promise<Form | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (formData.name !== undefined) {
      updates.push('name = ?');
      values.push(formData.name);
    }

    if (formData.description !== undefined) {
      updates.push('description = ?');
      values.push(formData.description);
    }

    if (formData.form_type !== undefined) {
      updates.push('form_type = ?');
      values.push(formData.form_type);
    }

    if (formData.branch_id !== undefined) {
      updates.push('branch_id = ?');
      values.push(formData.branch_id);
    }

    if (formData.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(formData.is_active);
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
      `UPDATE ${this.tableName} SET is_active = FALSE WHERE id = ?`,
      [id]
    );

    return result.affectedRows > 0;
  }
}

export default FormModel;