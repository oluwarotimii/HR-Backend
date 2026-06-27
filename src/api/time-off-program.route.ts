import { Router, Request, Response } from 'express';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
import { pool } from '../config/database';

const router = Router();

const paramId = (p: string | string[] | undefined): string =>
  Array.isArray(p) ? p[0] : (p as string);

// GET /api/time-off-programs - List all programs with assignment stats
router.get('/', authenticateJWT, checkPermission('time_off_bank:read'), async (req: Request, res: Response) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    let query = `
      SELECT
        top.*,
        COUNT(tob.id) AS assigned_count,
        COALESCE(SUM(tob.used_days), 0) AS total_used_days,
        COALESCE(SUM(tob.available_days), 0) AS total_available_days
      FROM time_off_programs top
      LEFT JOIN time_off_banks tob ON tob.program_id = top.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ' AND top.program_name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' GROUP BY top.id ORDER BY top.created_at DESC';

    const offset = (Number(page) - 1) * Number(limit);
    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const [rows]: any = await pool.execute(query, params);

    const [countRows]: any = await pool.execute(
      'SELECT COUNT(*) as total FROM time_off_programs',
      []
    );

    return res.json({
      success: true,
      message: 'Time off programs retrieved successfully',
      data: {
        programs: rows,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(countRows[0].total / Number(limit)),
          totalItems: countRows[0].total,
          itemsPerPage: Number(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching time off programs:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/time-off-programs/:id - Get single program
router.get('/:id', authenticateJWT, checkPermission('time_off_bank:read'), async (req: Request, res: Response) => {
  try {
    const programId = parseInt(paramId(req.params.id));
    if (isNaN(programId)) {
      return res.status(400).json({ success: false, message: 'Invalid program ID' });
    }

    const [rows]: any = await pool.execute(
      `SELECT top.*,
        COUNT(tob.id) AS assigned_count,
        COALESCE(SUM(tob.used_days), 0) AS total_used_days,
        COALESCE(SUM(tob.available_days), 0) AS total_available_days
      FROM time_off_programs top
      LEFT JOIN time_off_banks tob ON tob.program_id = top.id
      WHERE top.id = ?
      GROUP BY top.id`,
      [programId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    return res.json({ success: true, message: 'Program retrieved successfully', data: { program: rows[0] } });
  } catch (error) {
    console.error('Error fetching program:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/time-off-programs - Create a new program (no employee assigned yet)
router.post('/', authenticateJWT, checkPermission('time_off_bank:create'), async (req: Request, res: Response) => {
  try {
    const { program_name, description, total_entitled_days, valid_from, valid_to } = req.body;
    const createdBy = req.currentUser?.id;

    if (!program_name || total_entitled_days === undefined || !valid_from || !valid_to) {
      return res.status(400).json({
        success: false,
        message: 'Program name, total entitled days, valid from and valid to dates are required'
      });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(valid_from) || !dateRegex.test(valid_to)) {
      return res.status(400).json({
        success: false,
        message: 'Dates must be in YYYY-MM-DD format'
      });
    }

    if (new Date(valid_to) < new Date(valid_from)) {
      return res.status(400).json({
        success: false,
        message: 'Valid to date must be after valid from date'
      });
    }

    if (total_entitled_days < 0) {
      return res.status(400).json({
        success: false,
        message: 'Total entitled days must be a positive number'
      });
    }

    const [result]: any = await pool.execute(
      `INSERT INTO time_off_programs (program_name, description, total_entitled_days, valid_from, valid_to, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [program_name, description || null, total_entitled_days, valid_from, valid_to, createdBy]
    );

    const [programRows]: any = await pool.execute(
      'SELECT * FROM time_off_programs WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Time off program created successfully',
      data: { program: programRows[0] }
    });
  } catch (error) {
    console.error('Error creating program:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/time-off-programs/:id - Update a program
router.put('/:id', authenticateJWT, checkPermission('time_off_bank:update'), async (req: Request, res: Response) => {
  try {
    const programId = parseInt(paramId(req.params.id));
    if (isNaN(programId)) {
      return res.status(400).json({ success: false, message: 'Invalid program ID' });
    }

    const [existing]: any = await pool.execute('SELECT * FROM time_off_programs WHERE id = ?', [programId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    const { program_name, description, total_entitled_days, valid_from, valid_to } = req.body;
    const updates: string[] = [];
    const params: any[] = [];

    if (program_name !== undefined) { updates.push('program_name = ?'); params.push(program_name); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (total_entitled_days !== undefined) {
      if (total_entitled_days < 0) {
        return res.status(400).json({ success: false, message: 'Total entitled days must be a positive number' });
      }
      const [maxUsed]: any = await pool.execute(
        'SELECT MAX(used_days) as max_used FROM time_off_banks WHERE program_id = ?',
        [programId]
      );
      if (total_entitled_days < (maxUsed[0]?.max_used || 0)) {
        return res.status(400).json({
          success: false,
          message: `Total entitled days cannot be less than the maximum used days (${maxUsed[0]?.max_used || 0}) across assignments`
        });
      }
      updates.push('total_entitled_days = ?'); params.push(total_entitled_days);
    }
    if (valid_from !== undefined) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(valid_from)) {
        return res.status(400).json({ success: false, message: 'Date must be YYYY-MM-DD' });
      }
      updates.push('valid_from = ?'); params.push(valid_from);
    }
    if (valid_to !== undefined) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(valid_to)) {
        return res.status(400).json({ success: false, message: 'Date must be YYYY-MM-DD' });
      }
      updates.push('valid_to = ?'); params.push(valid_to);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    params.push(programId);
    await pool.execute(`UPDATE time_off_programs SET ${updates.join(', ')} WHERE id = ?`, params);

    // Also update all time_off_banks rows referencing this program
    if (program_name !== undefined) {
      await pool.execute('UPDATE time_off_banks SET program_name = ? WHERE program_id = ?', [program_name, programId]);
    }
    if (description !== undefined) {
      await pool.execute('UPDATE time_off_banks SET description = ? WHERE program_id = ?', [description, programId]);
    }
    if (total_entitled_days !== undefined) {
      // Only update banks that haven't had their individual total_entitled_days overridden
      // We assume all banks under a program share the same total_entitled_days
      await pool.execute('UPDATE time_off_banks SET total_entitled_days = ? WHERE program_id = ?', [total_entitled_days, programId]);
    }
    if (valid_from !== undefined) {
      await pool.execute('UPDATE time_off_banks SET valid_from = ? WHERE program_id = ?', [valid_from, programId]);
    }
    if (valid_to !== undefined) {
      await pool.execute('UPDATE time_off_banks SET valid_to = ? WHERE program_id = ?', [valid_to, programId]);
    }

    const [updated]: any = await pool.execute(
      `SELECT top.*,
        COUNT(tob.id) AS assigned_count,
        COALESCE(SUM(tob.used_days), 0) AS total_used_days,
        COALESCE(SUM(tob.available_days), 0) AS total_available_days
      FROM time_off_programs top
      LEFT JOIN time_off_banks tob ON tob.program_id = top.id
      WHERE top.id = ?
      GROUP BY top.id`,
      [programId]
    );

    return res.json({ success: true, message: 'Program updated successfully', data: { program: updated[0] } });
  } catch (error) {
    console.error('Error updating program:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/time-off-programs/:id - Delete a program
router.delete('/:id', authenticateJWT, checkPermission('time_off_bank:delete'), async (req: Request, res: Response) => {
  try {
    const programId = parseInt(paramId(req.params.id));
    if (isNaN(programId)) {
      return res.status(400).json({ success: false, message: 'Invalid program ID' });
    }

    const [existing]: any = await pool.execute('SELECT * FROM time_off_programs WHERE id = ?', [programId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    const [used]: any = await pool.execute(
      'SELECT SUM(used_days) as total_used FROM time_off_banks WHERE program_id = ?',
      [programId]
    );
    if (used[0]?.total_used > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a program that has been partially used by employees'
      });
    }

    await pool.execute('DELETE FROM time_off_programs WHERE id = ?', [programId]);

    return res.json({ success: true, message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Error deleting program:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/time-off-programs/:id/assignments - Get employees assigned to a program
router.get('/:id/assignments', authenticateJWT, checkPermission('time_off_bank:read'), async (req: Request, res: Response) => {
  try {
    const programId = parseInt(paramId(req.params.id));
    if (isNaN(programId)) {
      return res.status(400).json({ success: false, message: 'Invalid program ID' });
    }

    const [rows]: any = await pool.execute(
      `SELECT tob.*, u.full_name as user_name
       FROM time_off_banks tob
       LEFT JOIN users u ON tob.user_id = u.id
       WHERE tob.program_id = ?
       ORDER BY u.full_name ASC`,
      [programId]
    );

    return res.json({
      success: true,
      message: 'Assignments retrieved successfully',
      data: { assignments: rows }
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/time-off-programs/:id/assign - Sync assigned employees (add new, remove unchecked)
router.post('/:id/assign', authenticateJWT, checkPermission('time_off_bank:create'), async (req: Request, res: Response) => {
  try {
    const programId = parseInt(paramId(req.params.id));
    if (isNaN(programId)) {
      return res.status(400).json({ success: false, message: 'Invalid program ID' });
    }

    const { user_ids } = req.body;
    const createdBy = req.currentUser?.id;

    if (!user_ids || !Array.isArray(user_ids)) {
      return res.status(400).json({ success: false, message: 'User IDs array is required' });
    }

    const [programRows]: any = await pool.execute('SELECT * FROM time_off_programs WHERE id = ?', [programId]);
    if (programRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    const program = programRows[0];

    // Validate all provided user IDs exist
    if (user_ids.length > 0) {
      const placeholders = user_ids.map(() => '?').join(',');
      const [userRows]: any = await pool.execute(
        `SELECT id FROM users WHERE id IN (${placeholders})`,
        user_ids
      );
      if (userRows.length !== user_ids.length) {
        return res.status(400).json({ success: false, message: 'One or more users not found' });
      }
    }

    // Get current assignments
    const [currentAssignments]: any = await pool.execute(
      'SELECT user_id, used_days FROM time_off_banks WHERE program_id = ?',
      [programId]
    );
    const currentUserIds = new Set(currentAssignments.map((a: any) => a.user_id));
    const userIdsSet = new Set(user_ids);

    // Add new assignments
    const added = [];
    for (const userId of user_ids) {
      if (currentUserIds.has(userId)) continue;

      const [result]: any = await pool.execute(
        `INSERT INTO time_off_banks (program_id, user_id, program_name, description, total_entitled_days, used_days, valid_from, valid_to, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [programId, userId, program.program_name, program.description, program.total_entitled_days, 0, program.valid_from, program.valid_to, createdBy]
      );

      const [bankRow]: any = await pool.execute(
        `SELECT tob.*, u.full_name as user_name FROM time_off_banks tob
         LEFT JOIN users u ON tob.user_id = u.id WHERE tob.id = ?`,
        [result.insertId]
      );

      added.push(bankRow[0]);
    }

    // Remove unchecked assignments (only if no days used)
    const removed = [];
    for (const assignment of currentAssignments) {
      if (userIdsSet.has(assignment.user_id)) continue;

      if (assignment.used_days > 0) {
        removed.push({ user_id: assignment.user_id, reason: 'has used days' });
        continue;
      }

      await pool.execute(
        'DELETE FROM time_off_banks WHERE program_id = ? AND user_id = ? AND used_days = 0',
        [programId, assignment.user_id]
      );
      removed.push({ user_id: assignment.user_id, reason: 'removed' });
    }

    const blocked = removed.filter((r: any) => r.reason === 'has used days');

    return res.status(201).json({
      success: true,
      message: `${added.length} added, ${removed.filter((r: any) => r.reason === 'removed').length} removed` +
        (blocked.length ? `, ${blocked.length} skipped (has used days)` : ''),
      data: { added, removed }
    });
  } catch (error) {
    console.error('Error assigning employees:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/time-off-programs/:programId/assignments/:userId - Remove employee from program
router.delete('/:programId/assignments/:userId', authenticateJWT, checkPermission('time_off_bank:delete'), async (req: Request, res: Response) => {
  try {
    const programId = parseInt(paramId(req.params.programId));
    const userId = parseInt(paramId(req.params.userId));

    if (isNaN(programId) || isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid program or user ID' });
    }

    const [existing]: any = await pool.execute(
      'SELECT * FROM time_off_banks WHERE program_id = ? AND user_id = ?',
      [programId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (existing[0].used_days > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove an employee who has used days from this program'
      });
    }

    await pool.execute(
      'DELETE FROM time_off_banks WHERE program_id = ? AND user_id = ?',
      [programId, userId]
    );

    return res.json({ success: true, message: 'Employee removed from program successfully' });
  } catch (error) {
    console.error('Error removing employee:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
