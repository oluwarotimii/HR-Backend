import { pool } from '../config/database';

export interface StaffDocument {
  id: number;
  staff_id: number;
  document_type: string;
  document_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  uploaded_at: Date;
  uploaded_by?: number;
  expiry_date?: Date;
  is_verified: boolean;
  verified_by?: number;
  verified_at?: Date;
}

export interface StaffDocumentInput {
  staff_id: number;
  document_type: string;
  document_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by?: number;
  expiry_date?: Date;
}

export interface StaffDocumentUpdate {
  document_name?: string;
  expiry_date?: Date;
  is_verified?: boolean;
  verified_by?: number;
}

class StaffDocumentModel {
  static tableName = 'staff_documents';

  static async findAll(staffId?: number): Promise<StaffDocument[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];

    if (staffId) {
      query += ' WHERE staff_id = ?';
      params.push(staffId);
    }

    query += ' ORDER BY uploaded_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows as StaffDocument[];
  }

  static async findById(id: number): Promise<StaffDocument | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return (rows as StaffDocument[])[0] || null;
  }

  static async findByStaffId(staffId: number): Promise<StaffDocument[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE staff_id = ? ORDER BY uploaded_at DESC`,
      [staffId]
    );
    return rows as StaffDocument[];
  }

  static async findByType(staffId: number, documentType: string): Promise<StaffDocument[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE staff_id = ? AND document_type = ? ORDER BY uploaded_at DESC`,
      [staffId, documentType]
    );
    return rows as StaffDocument[];
  }

  static async create(documentData: StaffDocumentInput): Promise<StaffDocument> {
    const [result]: any = await pool.execute(
      `INSERT INTO ${this.tableName} (staff_id, document_type, document_name, file_path, file_size, mime_type, uploaded_by, expiry_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        documentData.staff_id,
        documentData.document_type,
        documentData.document_name,
        documentData.file_path,
        documentData.file_size,
        documentData.mime_type,
        documentData.uploaded_by,
        documentData.expiry_date
      ]
    );

    const insertedId = result.insertId;
    const createdItem = await this.findById(insertedId);

    if (!createdItem) {
      throw new Error('Failed to create staff document');
    }

    return createdItem;
  }

  static async update(id: number, documentData: StaffDocumentUpdate): Promise<StaffDocument | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (documentData.document_name !== undefined) {
      updates.push('document_name = ?');
      values.push(documentData.document_name);
    }

    if (documentData.expiry_date !== undefined) {
      updates.push('expiry_date = ?');
      values.push(documentData.expiry_date);
    }

    if (documentData.is_verified !== undefined) {
      updates.push('is_verified = ?');
      values.push(documentData.is_verified);
    }

    if (documentData.verified_by !== undefined) {
      updates.push('verified_by = ?');
      values.push(documentData.verified_by);
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

  // Mark document as verified
  static async verifyDocument(id: number, verifiedBy: number): Promise<StaffDocument | null> {
    const [result]: any = await pool.execute(
      `UPDATE ${this.tableName} SET is_verified = TRUE, verified_by = ?, verified_at = NOW() WHERE id = ?`,
      [verifiedBy, id]
    );

    if (result.affectedRows > 0) {
      return await this.findById(id);
    }
    return null;
  }

  // Get documents that are expiring soon (within 30 days)
  static async getExpiringDocuments(days: number = 30): Promise<StaffDocument[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} 
       WHERE expiry_date IS NOT NULL 
       AND expiry_date <= DATE_ADD(NOW(), INTERVAL ? DAY)
       AND expiry_date >= NOW()
       AND is_verified = TRUE
       ORDER BY expiry_date ASC`,
      [days]
    );
    return rows as StaffDocument[];
  }
}

export default StaffDocumentModel;