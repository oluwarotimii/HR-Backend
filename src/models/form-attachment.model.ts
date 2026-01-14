import { pool } from '../config/database';

export interface FormAttachment {
  id: number;
  form_submission_id: number;
  field_id: number;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  uploaded_at: Date;
}

export interface FormAttachmentInput {
  form_submission_id: number;
  field_id: number;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
}

class FormAttachmentModel {
  static tableName = 'form_attachment';

  static async findAll(submissionId?: number): Promise<FormAttachment[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];

    if (submissionId) {
      query += ' WHERE form_submission_id = ?';
      params.push(submissionId);
    }

    query += ' ORDER BY uploaded_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows as FormAttachment[];
  }

  static async findById(id: number): Promise<FormAttachment | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return (rows as FormAttachment[])[0] || null;
  }

  static async findBySubmissionId(submissionId: number): Promise<FormAttachment[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE form_submission_id = ? ORDER BY uploaded_at DESC`,
      [submissionId]
    );
    return rows as FormAttachment[];
  }

  static async findByFieldId(fieldId: number): Promise<FormAttachment[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE field_id = ? ORDER BY uploaded_at DESC`,
      [fieldId]
    );
    return rows as FormAttachment[];
  }

  static async create(attachmentData: FormAttachmentInput): Promise<FormAttachment> {
    const [result]: any = await pool.execute(
      `INSERT INTO ${this.tableName} (form_submission_id, field_id, file_name, file_path, file_size, mime_type) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        attachmentData.form_submission_id,
        attachmentData.field_id,
        attachmentData.file_name,
        attachmentData.file_path,
        attachmentData.file_size,
        attachmentData.mime_type
      ]
    );

    const insertedId = result.insertId;
    const createdItem = await this.findById(insertedId);
    
    if (!createdItem) {
      throw new Error('Failed to create form attachment');
    }
    
    return createdItem;
  }

  static async delete(id: number): Promise<boolean> {
    const result: any = await pool.execute(
      `DELETE FROM ${this.tableName} WHERE id = ?`,
      [id]
    );

    return result.affectedRows > 0;
  }

  // Delete all attachments for a specific submission
  static async deleteBySubmissionId(submissionId: number): Promise<boolean> {
    const result: any = await pool.execute(
      `DELETE FROM ${this.tableName} WHERE form_submission_id = ?`,
      [submissionId]
    );

    return result.affectedRows > 0;
  }
}

export default FormAttachmentModel;