import { pool } from '../config/database';
import { CacheService } from '../services/cache.service';
import bcrypt from 'bcryptjs';
class UserModel {
    static tableName = 'users';
    static async findAll() {
        const [rows] = await pool.execute(`SELECT * FROM ${this.tableName} ORDER BY created_at DESC`);
        return rows;
    }
    static async findAllWithFilters(limit = 20, offset = 0, branchId, status, roleId) {
        let query = `SELECT * FROM ${this.tableName}`;
        const params = [];
        const conditions = [];
        if (branchId) {
            conditions.push('branch_id = ?');
            params.push(branchId);
        }
        if (status) {
            conditions.push('status = ?');
            params.push(status);
        }
        if (roleId) {
            conditions.push('role_id = ?');
            params.push(roleId);
        }
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        const [rows] = await pool.execute(query, params);
        let countQuery = `SELECT COUNT(*) as count FROM ${this.tableName}`;
        if (conditions.length > 0) {
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }
        const [countResult] = await pool.execute(countQuery, params.slice(0, conditions.length));
        const totalCount = countResult[0].count;
        return {
            users: rows,
            totalCount
        };
    }
    static async findById(id) {
        const cacheKey = `user:${id}`;
        let user = await CacheService.get(cacheKey);
        if (user) {
            return user;
        }
        const [rows] = await pool.execute(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
        user = rows[0] || null;
        if (user) {
            await CacheService.set(cacheKey, user, 1800);
        }
        return user;
    }
    static async findByEmail(email) {
        const cacheKey = `user:email:${email}`;
        let user = await CacheService.get(cacheKey);
        if (user) {
            return user;
        }
        const [rows] = await pool.execute(`SELECT * FROM ${this.tableName} WHERE email = ?`, [email]);
        user = rows[0] || null;
        if (user) {
            await CacheService.set(cacheKey, user, 1800);
            await CacheService.set(`user:${user.id}`, user, 1800);
        }
        return user;
    }
    static async create(userData) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const [result] = await pool.execute(`INSERT INTO ${this.tableName} (email, password_hash, full_name, phone, role_id, branch_id, status, must_change_password)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`, [
            userData.email,
            hashedPassword,
            userData.full_name,
            userData.phone || null,
            userData.role_id,
            userData.branch_id || null,
            userData.must_change_password !== undefined ? userData.must_change_password : true
        ]);
        const insertedId = result.insertId;
        const createdItem = await this.findById(insertedId);
        if (!createdItem) {
            throw new Error('Failed to create user');
        }
        return createdItem;
    }
    static async update(id, userData) {
        const updates = [];
        const values = [];
        if (userData.email !== undefined) {
            updates.push('email = ?');
            values.push(userData.email);
        }
        if (userData.password !== undefined) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            updates.push('password_hash = ?');
            values.push(hashedPassword);
        }
        if (userData.full_name !== undefined) {
            updates.push('full_name = ?');
            values.push(userData.full_name);
        }
        if (userData.phone !== undefined) {
            updates.push('phone = ?');
            values.push(userData.phone);
        }
        if (userData.role_id !== undefined) {
            updates.push('role_id = ?');
            values.push(userData.role_id);
        }
        if (userData.branch_id !== undefined) {
            updates.push('branch_id = ?');
            values.push(userData.branch_id);
        }
        if (userData.status !== undefined) {
            updates.push('status = ?');
            values.push(userData.status);
        }
        if (updates.length === 0) {
            return this.findById(id);
        }
        values.push(id);
        await pool.execute(`UPDATE ${this.tableName} SET ${updates.join(', ')} WHERE id = ?`, values);
        await CacheService.del(`user:${id}`);
        if (userData.email) {
            await CacheService.del(`user:email:${userData.email}`);
        }
        return this.findById(id);
    }
    static async delete(id) {
        const result = await pool.execute(`UPDATE ${this.tableName} SET status = 'inactive' WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }
    static async softDelete(id) {
        const result = await pool.execute(`UPDATE ${this.tableName} SET status = 'terminated' WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }
    static async comparePassword(inputPassword, hashedPassword) {
        return bcrypt.compare(inputPassword, hashedPassword);
    }
    static async setPasswordChangeRequirement(userId, mustChange) {
        const result = await pool.execute(`UPDATE ${this.tableName} SET must_change_password = ? WHERE id = ?`, [mustChange, userId]);
        if (result.affectedRows > 0) {
            return this.findById(userId);
        }
        return null;
    }
}
export default UserModel;
//# sourceMappingURL=user.model.js.map