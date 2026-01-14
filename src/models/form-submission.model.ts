import { pool } from '../config/database';

export interface FormSubmission {
  id: number;
  form_id: number;
  user_id: number;
  submission_data: any; // JSON field
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  submitted_at: Date;
  reviewed_by?: number;
  reviewed_at?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface FormSubmissionInput {
  form_id: number;
  user_id: number;
  submission_data: any; // JSON field
  status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  notes?: string;
}

export interface FormSubmissionUpdate {
  status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  reviewed_by?: number;
  reviewed_at?: Date;
  notes?: string;
}

class FormSubmissionModel {
  static tableName = 'form_submissions';

  static async findAll(formId?: number, userId?: number, status?: string): Promise<FormSubmission[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];

    const conditions = [];
    if (formId) {
      conditions.push('form_id = ?');
      params.push(formId);
    }
    if (userId) {
      conditions.push('user_id = ?');
      params.push(userId);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY submitted_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows as FormSubmission[];
  }

  static async findById(id: number): Promise<FormSubmission | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return (rows as FormSubmission[])[0] || null;
  }

  static async findByFormId(formId: number): Promise<FormSubmission[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE form_id = ? ORDER BY submitted_at DESC`,
      [formId]
    );
    return rows as FormSubmission[];
  }

  static async findByUserId(userId: number): Promise<FormSubmission[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE user_id = ? ORDER BY submitted_at DESC`,
      [userId]
    );
    return rows as FormSubmission[];
  }

  static async findByStatus(status: string): Promise<FormSubmission[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE status = ? ORDER BY submitted_at DESC`,
      [status]
    );
    return rows as FormSubmission[];
  }

  static async create(submissionData: FormSubmissionInput): Promise<FormSubmission> {
    const [result]: any = await pool.execute(
      `INSERT INTO ${this.tableName} (form_id, user_id, submission_data, status, notes) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        submissionData.form_id,
        submissionData.user_id,
        JSON.stringify(submissionData.submission_data),
        submissionData.status || 'submitted',
        submissionData.notes
      ]
    );

    const insertedId = result.insertId;
    const createdItem = await this.findById(insertedId);
    
    if (!createdItem) {
      throw new Error('Failed to create form submission');
    }
    
    return createdItem;
  }

  static async update(id: number, submissionData: FormSubmissionUpdate): Promise<FormSubmission | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (submissionData.status !== undefined) {
      updates.push('status = ?');
      values.push(submissionData.status);
    }

    if (submissionData.reviewed_by !== undefined) {
      updates.push('reviewed_by = ?');
      values.push(submissionData.reviewed_by);
    }

    if (submissionData.reviewed_at !== undefined) {
      updates.push('reviewed_at = ?');
      values.push(submissionData.reviewed_at);
    }

    if (submissionData.notes !== undefined) {
      updates.push('notes = ?');
      values.push(submissionData.notes);
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

export default FormSubmissionModel;