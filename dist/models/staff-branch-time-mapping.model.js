"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
class StaffBranchTimeMappingModel {
    static tableName = 'staff_branch_time_mappings';
    static async findAll() {
        const [rows] = await database_1.pool.execute(`
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
        return rows;
    }
    static async findById(id) {
        const [rows] = await database_1.pool.execute(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
        return rows[0] || null;
    }
    static async findByStaffId(staffId) {
        const [rows] = await database_1.pool.execute(`SELECT * FROM ${this.tableName} WHERE staff_id = ? LIMIT 1`, [staffId]);
        return rows[0] || null;
    }
    static async findByDepartmentId(departmentId) {
        const [rows] = await database_1.pool.execute(`SELECT * FROM ${this.tableName} WHERE department_id = ? LIMIT 1`, [departmentId]);
        return rows[0] || null;
    }
    static async findBranchForUser(staffId, departmentId) {
        const staffMapping = await this.findByStaffId(staffId);
        if (staffMapping)
            return staffMapping.branch_id;
        if (departmentId) {
            const deptMapping = await this.findByDepartmentId(departmentId);
            if (deptMapping)
                return deptMapping.branch_id;
        }
        return null;
    }
    static async create(data) {
        const [result] = await database_1.pool.execute(`INSERT INTO ${this.tableName} (staff_id, department_id, branch_id, created_by)
       VALUES (?, ?, ?, ?)`, [data.staff_id ?? null, data.department_id ?? null, data.branch_id, data.created_by]);
        const created = await this.findById(result.insertId);
        if (!created)
            throw new Error('Failed to create branch time mapping');
        return created;
    }
    static async delete(id) {
        const [result] = await database_1.pool.execute(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }
}
exports.default = StaffBranchTimeMappingModel;
//# sourceMappingURL=staff-branch-time-mapping.model.js.map