"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('audit.read'), async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
        const offset = (page - 1) * limit;
        const { entity_type, action, user_id } = req.query;
        let whereClause = '';
        const params = [];
        if (entity_type) {
            whereClause += ' AND al.entity_type = ?';
            params.push(entity_type);
        }
        if (action) {
            whereClause += ' AND al.action = ?';
            params.push(action);
        }
        if (user_id) {
            whereClause += ' AND al.user_id = ?';
            params.push(parseInt(user_id));
        }
        const [countResult] = await database_1.pool.execute(`SELECT COUNT(*) as total FROM audit_logs al WHERE 1=1${whereClause}`, params);
        const totalRecords = countResult[0]?.total || 0;
        const totalPages = Math.ceil(totalRecords / limit);
        const [rows] = await database_1.pool.execute(`SELECT al.*, u.full_name AS user_name
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE 1=1${whereClause}
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`, [...params, limit, offset]);
        return res.json({
            success: true,
            data: {
                logs: rows,
                pagination: {
                    page,
                    limit,
                    total_records: totalRecords,
                    total_pages: totalPages
                }
            }
        });
    }
    catch (error) {
        console.error('Get audit logs error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=audit-log.route.js.map