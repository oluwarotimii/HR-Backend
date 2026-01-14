import { pool } from '../config/database';

export interface FormField {
  id: number;
  form_id: number;
  field_name: string;
  field_label: string;
  field_type: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'dropdown' | 'checkbox' | 'file' | 'phone' | 'address';
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  validation_rule?: string;
  options?: any; // JSON field
  field_order: number;
  created_at: Date;
}

export interface FormFieldInput {
  form_id: number;
  field_name: string;
  field_label: string;
  field_type: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'dropdown' | 'checkbox' | 'file' | 'phone' | 'address';
  is_required?: boolean;
  placeholder?: string;
  help_text?: string;
  validation_rule?: string;
  options?: any; // JSON field
  field_order: number;
}

export interface FormFieldUpdate {
  field_name?: string;
  field_label?: string;
  field_type?: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'dropdown' | 'checkbox' | 'file' | 'phone' | 'address';
  is_required?: boolean;
  placeholder?: string;
  help_text?: string;
  validation_rule?: string;
  options?: any; // JSON field
  field_order?: number;
}

class FormFieldModel {
  static tableName = 'form_fields';

  static async findAll(formId?: number): Promise<FormField[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];

    if (formId) {
      query += ' WHERE form_id = ?';
      params.push(formId);
    }

    query += ' ORDER BY field_order ASC';

    const [rows] = await pool.execute(query, params);
    return rows as FormField[];
  }

  static async findById(id: number): Promise<FormField | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return (rows as FormField[])[0] || null;
  }

  static async findByFormId(formId: number): Promise<FormField[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE form_id = ? ORDER BY field_order ASC`,
      [formId]
    );
    return rows as FormField[];
  }

  static async findByFormAndName(formId: number, fieldName: string): Promise<FormField | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE form_id = ? AND field_name = ?`,
      [formId, fieldName]
    );
    return (rows as FormField[])[0] || null;
  }

  static async create(fieldData: FormFieldInput): Promise<FormField> {
    const [result]: any = await pool.execute(
      `INSERT INTO ${this.tableName} (form_id, field_name, field_label, field_type, is_required, placeholder, help_text, validation_rule, options, field_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fieldData.form_id,
        fieldData.field_name,
        fieldData.field_label,
        fieldData.field_type,
        fieldData.is_required || false,
        fieldData.placeholder,
        fieldData.help_text,
        fieldData.validation_rule,
        fieldData.options ? JSON.stringify(fieldData.options) : null,
        fieldData.field_order
      ]
    );

    const insertedId = result.insertId;
    const createdItem = await this.findById(insertedId);
    
    if (!createdItem) {
      throw new Error('Failed to create form field');
    }
    
    return createdItem;
  }

  static async update(id: number, fieldData: FormFieldUpdate): Promise<FormField | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (fieldData.field_name !== undefined) {
      updates.push('field_name = ?');
      values.push(fieldData.field_name);
    }

    if (fieldData.field_label !== undefined) {
      updates.push('field_label = ?');
      values.push(fieldData.field_label);
    }

    if (fieldData.field_type !== undefined) {
      updates.push('field_type = ?');
      values.push(fieldData.field_type);
    }

    if (fieldData.is_required !== undefined) {
      updates.push('is_required = ?');
      values.push(fieldData.is_required);
    }

    if (fieldData.placeholder !== undefined) {
      updates.push('placeholder = ?');
      values.push(fieldData.placeholder);
    }

    if (fieldData.help_text !== undefined) {
      updates.push('help_text = ?');
      values.push(fieldData.help_text);
    }

    if (fieldData.validation_rule !== undefined) {
      updates.push('validation_rule = ?');
      values.push(fieldData.validation_rule);
    }

    if (fieldData.options !== undefined) {
      updates.push('options = ?');
      values.push(fieldData.options ? JSON.stringify(fieldData.options) : null);
    }

    if (fieldData.field_order !== undefined) {
      updates.push('field_order = ?');
      values.push(fieldData.field_order);
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

  // Delete all fields for a specific form
  static async deleteByFormId(formId: number): Promise<boolean> {
    const result: any = await pool.execute(
      `DELETE FROM ${this.tableName} WHERE form_id = ?`,
      [formId]
    );

    return result.affectedRows > 0;
  }
}

export default FormFieldModel;