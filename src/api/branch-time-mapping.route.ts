import { Router, Request, Response } from 'express';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
import StaffBranchTimeMappingModel from '../models/staff-branch-time-mapping.model';
import AuditLogModel from '../models/audit-log.model';

const router = Router();

// GET /api/attendance/time-mappings - List all branch time mappings
router.get('/', authenticateJWT, checkPermission('attendance:manage'), async (req: Request, res: Response) => {
  try {
    const mappings = await StaffBranchTimeMappingModel.findAll();
    const enriched = mappings.map((m: any) => ({
      ...m,
      target_name: m.staff_first_name
        ? `${m.staff_first_name} ${m.staff_last_name}`
        : m.department_name || 'Unknown'
    }));
    return res.json({ success: true, data: { mappings: enriched } });
  } catch (error) {
    console.error('Get branch time mappings error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/attendance/time-mappings - Create a branch time mapping
router.post('/', authenticateJWT, checkPermission('attendance:manage'), async (req: Request, res: Response) => {
  try {
    const { staff_id, department_id, branch_id } = req.body;
    const userId = req.currentUser?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!branch_id) {
      return res.status(400).json({ success: false, message: 'branch_id is required' });
    }

    if (!staff_id && !department_id) {
      return res.status(400).json({ success: false, message: 'Either staff_id or department_id is required' });
    }

    if (staff_id && department_id) {
      return res.status(400).json({ success: false, message: 'Provide either staff_id or department_id, not both' });
    }

    const mapping = await StaffBranchTimeMappingModel.create({
      staff_id: staff_id || null,
      department_id: department_id || null,
      branch_id,
      created_by: userId
    });

    await AuditLogModel.create({
      user_id: userId,
      action: 'create',
      entity_type: 'staff_branch_time_mapping',
      entity_id: mapping.id,
      after_data: { staff_id, department_id, branch_id },
      ip_address: req.ip as string,
      user_agent: req.headers['user-agent'] as string
    });

    return res.status(201).json({ success: true, message: 'Branch time mapping created', data: { mapping } });
  } catch (error) {
    console.error('Create branch time mapping error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/attendance/time-mappings/:id - Delete a branch time mapping
router.delete('/:id', authenticateJWT, checkPermission('attendance:manage'), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const existing = await StaffBranchTimeMappingModel.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Mapping not found' });
    }

    await StaffBranchTimeMappingModel.delete(id);

    const userId = req.currentUser?.id;
    if (userId) {
      await AuditLogModel.create({
        user_id: userId,
        action: 'delete',
        entity_type: 'staff_branch_time_mapping',
        entity_id: id,
        before_data: existing,
        ip_address: req.ip as string,
        user_agent: req.headers['user-agent'] as string
      });
    }

    return res.json({ success: true, message: 'Branch time mapping deleted' });
  } catch (error) {
    console.error('Delete branch time mapping error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
