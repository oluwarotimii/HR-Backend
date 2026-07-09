import { pool } from '../config/database';

export interface StaffBranchTimeMapping {
  id: number;
  staff_id: number | null;
  department_id: number | null;
  branch_id: number;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface StaffBranchTimeMappingInput {
  staff_id?: number | null;
  department_id?: number | null;
  branch_id: number;
  created_by: number;
}

class StaffBranchTimeMappingModel {
  static tableName = 'staff_branch_time_mappings';

  static async findAll(): Promise<(StaffBranchTimeMapping & { staff_name?: string; department_name?: string; branch_name: string })[]> {
    const [rows] = await pool.execute(`
      SELECT m.*,
             s.first_name AS staff_first_name,
             s.last_name AS staff_last_name,
             d.name AS department_name,
             b.name AS branch_name
      FROM ${this.tableName} m
      LEFT JOIN staff s ON m.staff_id = s.id
      LEFT JOIN departments d ON m.department_id = d.id
      JOIN branches b ON m.branch_id = b.id
      ORDER BY m.created_at DESC
    `);
    return rows as any[];
  }

  static async findById(id: number): Promise<StaffBranchTimeMapping | null> {
    const [rows] = await pool.execute(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    return (rows as StaffBranchTimeMapping[])[0] || null;
  }

  static async findByStaffId(staffId: number): Promise<StaffBranchTimeMapping | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE staff_id = ? LIMIT 1`,
      [staffId]
    );
    return (rows as StaffBranchTimeMapping[])[0] || null;
  }

  static async findByDepartmentId(departmentId: number): Promise<StaffBranchTimeMapping | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.tableName} WHERE department_id = ? LIMIT 1`,
      [departmentId]
    );
    return (rows as StaffBranchTimeMapping[])[0] || null;
  }

  static async findBranchForUser(staffId: number, departmentId: number | null): Promise<number | null> {
    // Staff-specific mapping takes priority over department mapping
    const staffMapping = await this.findByStaffId(staffId);
    if (staffMapping) return staffMapping.branch_id;

    if (departmentId) {
      const deptMapping = await this.findByDepartmentId(departmentId);
      if (deptMapping) return deptMapping.branch_id;
    }

    return null;
  }

  static async create(data: StaffBranchTimeMappingInput): Promise<StaffBranchTimeMapping> {
    const [result]: any = await pool.execute(
      `INSERT INTO ${this.tableName} (staff_id, department_id, branch_id, created_by)
       VALUES (?, ?, ?, ?)`,
      [data.staff_id ?? null, data.department_id ?? null, data.branch_id, data.created_by]
    );
    const created = await this.findById(result.insertId);
    if (!created) throw new Error('Failed to create branch time mapping');
    return created;
  }

  static async delete(id: number): Promise<boolean> {
    const [result]: any = await pool.execute(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }
}

export default StaffBranchTimeMappingModel;
