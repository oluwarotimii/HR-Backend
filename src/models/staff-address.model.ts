import { pool } from '../config/database';

export interface StaffAddress {
  id: number;
  staff_id: number;
  address_type: 'permanent' | 'current' | 'emergency_contact';
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  is_primary: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface StaffAddressInput {
  staff_id: number;
  address_type: 'permanent' | 'current' | 'emergency_contact';
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  is_primary?: boolean;
}

export interface StaffAddressUpdate {
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  is_primary?: boolean;
}

class StaffAddressModel {
  static tableName = 'staff_addresses';

  static async findAll(staffId?: number): Promise<StaffAddress[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];

    if (staffId) {
      query += ' WHERE staff_id = ?';
      params.push(staffId);
    }

    query += ' ORDER BY is_primary DESC, created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows as StaffAddress[];
  }

  static async findById(id: number): Promise<StaffAddress | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return (rows as StaffAddress[])[0] || null;
  }

  static async findByStaffId(staffId: number): Promise<StaffAddress[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE staff_id = ? ORDER BY is_primary DESC, created_at DESC`,
      [staffId]
    );
    return rows as StaffAddress[];
  }

  static async findByType(staffId: number, addressType: 'permanent' | 'current' | 'emergency_contact'): Promise<StaffAddress[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE staff_id = ? AND address_type = ? ORDER BY is_primary DESC, created_at DESC`,
      [staffId, addressType]
    );
    return rows as StaffAddress[];
  }

  static async create(addressData: StaffAddressInput): Promise<StaffAddress> {
    // If setting as primary, unset other primary addresses for this staff member
    if (addressData.is_primary) {
      await pool.execute(
        `UPDATE ${this.tableName} SET is_primary = FALSE WHERE staff_id = ? AND address_type = ?`,
        [addressData.staff_id, addressData.address_type]
      );
    }

    const [result]: any = await pool.execute(
      `INSERT INTO ${this.tableName} (staff_id, address_type, street_address, city, state, zip_code, country, is_primary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        addressData.staff_id,
        addressData.address_type,
        addressData.street_address,
        addressData.city,
        addressData.state,
        addressData.zip_code,
        addressData.country,
        addressData.is_primary || false
      ]
    );

    const insertedId = result.insertId;
    const createdItem = await this.findById(insertedId);

    if (!createdItem) {
      throw new Error('Failed to create staff address');
    }

    return createdItem;
  }

  static async update(id: number, addressData: StaffAddressUpdate): Promise<StaffAddress | null> {
    // If updating to primary, unset other primary addresses for this staff member and type
    if (addressData.is_primary) {
      const currentAddress = await this.findById(id);
      if (currentAddress) {
        await pool.execute(
          `UPDATE ${this.tableName} SET is_primary = FALSE WHERE staff_id = ? AND address_type = ? AND id != ?`,
          [currentAddress.staff_id, currentAddress.address_type, id]
        );
      }
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (addressData.street_address !== undefined) {
      updates.push('street_address = ?');
      values.push(addressData.street_address);
    }

    if (addressData.city !== undefined) {
      updates.push('city = ?');
      values.push(addressData.city);
    }

    if (addressData.state !== undefined) {
      updates.push('state = ?');
      values.push(addressData.state);
    }

    if (addressData.zip_code !== undefined) {
      updates.push('zip_code = ?');
      values.push(addressData.zip_code);
    }

    if (addressData.country !== undefined) {
      updates.push('country = ?');
      values.push(addressData.country);
    }

    if (addressData.is_primary !== undefined) {
      updates.push('is_primary = ?');
      values.push(addressData.is_primary);
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

  // Set an address as primary and unset others of the same type
  static async setAsPrimary(id: number): Promise<StaffAddress | null> {
    const currentAddress = await this.findById(id);
    if (!currentAddress) {
      return null;
    }

    // Unset other primary addresses of the same type for this staff member
    await pool.execute(
      `UPDATE ${this.tableName} SET is_primary = FALSE WHERE staff_id = ? AND address_type = ? AND id != ?`,
      [currentAddress.staff_id, currentAddress.address_type, id]
    );

    // Set this address as primary
    const [result]: any = await pool.execute(
      `UPDATE ${this.tableName} SET is_primary = TRUE WHERE id = ?`,
      [id]
    );

    if (result.affectedRows > 0) {
      return await this.findById(id);
    }
    return null;
  }
}

export default StaffAddressModel;