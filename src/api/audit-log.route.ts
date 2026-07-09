import { Router, Request, Response } from 'express';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
import AuditLogModel from '../models/audit-log.model';
import { pool } from '../config/database';

const router = Router();

// GET /api/audit-logs - List audit logs with pagination and filters
router.get('/', authenticateJWT, checkPermission('audit.read'), async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = (page - 1) * limit;
    const { entity_type, action, user_id } = req.query;

    let whereClause = '';
    const params: any[] = [];

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
      params.push(parseInt(user_id as string));
    }

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM audit_logs al WHERE 1=1${whereClause}`,
      params
    );
    const totalRecords = (countResult as any[])[0]?.total || 0;
    const totalPages = Math.ceil(totalRecords / limit);

    const [rows] = await pool.execute(
      `SELECT al.*, u.full_name AS user_name
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE 1=1${whereClause}
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

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
  } catch (error) {
    console.error('Get audit logs error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
