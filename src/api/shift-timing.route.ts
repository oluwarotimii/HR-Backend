import { Router, Request, Response } from 'express';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
import ShiftTimingModel from '../models/shift-timing.model';

const router = Router();

// GET /api/shift-timings - Get all shift timings
router.get('/', authenticateJWT, checkPermission('shift:read'), async (req: Request, res: Response) => {
  try {
    const shiftTimings = await ShiftTimingModel.findAll();
    return res.json({
      success: true,
      message: 'Shift timings retrieved successfully',
      data: { shiftTimings }
    });
  } catch (error) {
    console.error('Get shift timings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/shift-timings/:id - Get shift timing by ID
router.get('/:id', authenticateJWT, checkPermission('shift:read'), async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const shiftTimingId = parseInt(idStr as string);

    if (isNaN(shiftTimingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shift timing ID'
      });
    }

    const shiftTiming = await ShiftTimingModel.findById(shiftTimingId);
    if (!shiftTiming) {
      return res.status(404).json({
        success: false,
        message: 'Shift timing not found'
      });
    }

    return res.json({
      success: true,
      message: 'Shift timing retrieved successfully',
      data: { shiftTiming }
    });
  } catch (error) {
    console.error('Get shift timing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/shift-timings - Create new shift timing
router.post('/', authenticateJWT, checkPermission('shift:create'), async (req: Request, res: Response) => {
  try {
    const { user_id, shift_name, start_time, end_time, effective_from, effective_to, override_branch_id } = req.body;

    // Validate required fields
    if (!shift_name || !start_time || !end_time || !effective_from) {
      return res.status(400).json({
        success: false,
        message: 'Shift name, start time, end time, and effective from are required'
      });
    }

    const shiftTimingData = {
      user_id: user_id || null,
      shift_name,
      start_time,
      end_time,
      effective_from: new Date(effective_from),
      effective_to: effective_to ? new Date(effective_to) : null,
      override_branch_id: override_branch_id || null
    };

    const newShiftTiming = await ShiftTimingModel.create(shiftTimingData);

    return res.status(201).json({
      success: true,
      message: 'Shift timing created successfully',
      data: { shiftTiming: newShiftTiming }
    });
  } catch (error) {
    console.error('Create shift timing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/shift-timings/:id - Update shift timing
router.put('/:id', authenticateJWT, checkPermission('shift:update'), async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const shiftTimingId = parseInt(idStr as string);
    const { shift_name, start_time, end_time, effective_from, effective_to, override_branch_id } = req.body;

    if (isNaN(shiftTimingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shift timing ID'
      });
    }

    const existingShiftTiming = await ShiftTimingModel.findById(shiftTimingId);
    if (!existingShiftTiming) {
      return res.status(404).json({
        success: false,
        message: 'Shift timing not found'
      });
    }

    const updateData: any = {};
    if (shift_name !== undefined) updateData.shift_name = shift_name;
    if (start_time !== undefined) updateData.start_time = start_time;
    if (end_time !== undefined) updateData.end_time = end_time;
    if (effective_from !== undefined) updateData.effective_from = new Date(effective_from);
    if (effective_to !== undefined) updateData.effective_to = effective_to ? new Date(effective_to) : null;
    if (override_branch_id !== undefined) updateData.override_branch_id = override_branch_id;

    const updatedShiftTiming = await ShiftTimingModel.update(shiftTimingId, updateData);

    return res.json({
      success: true,
      message: 'Shift timing updated successfully',
      data: { shiftTiming: updatedShiftTiming }
    });
  } catch (error) {
    console.error('Update shift timing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/shift-timings/:id - Delete shift timing
router.delete('/:id', authenticateJWT, checkPermission('shift:delete'), async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const shiftTimingId = parseInt(idStr as string);

    if (isNaN(shiftTimingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shift timing ID'
      });
    }

    const deleted = await ShiftTimingModel.delete(shiftTimingId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Shift timing not found'
      });
    }

    return res.json({
      success: true,
      message: 'Shift timing deleted successfully'
    });
  } catch (error) {
    console.error('Delete shift timing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;