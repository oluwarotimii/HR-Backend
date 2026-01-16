import { Router, Request, Response } from 'express';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';
import HolidayModel from '../models/holiday.model';

const router = Router();

// GET /api/holidays - Get all holidays
router.get('/', authenticateJWT, checkPermission('holiday:read'), async (req: Request, res: Response) => {
  try {
    const { branchId, date, startDate, endDate } = req.query;

    let holidays;
    if (startDate && endDate) {
      // Get holidays in date range
      const startDateVal = Array.isArray(startDate) ? startDate[0] : startDate;
      const endDateVal = Array.isArray(endDate) ? endDate[0] : endDate;
      const branchIdVal = Array.isArray(branchId) ? branchId[0] : branchId;

      const startDateStr = typeof startDateVal === 'string' ? startDateVal : '';
      const endDateStr = typeof endDateVal === 'string' ? endDateVal : '';
      const branchIdStr = typeof branchIdVal === 'string' ? branchIdVal : '';

      holidays = await HolidayModel.getHolidaysInRange(
        new Date(startDateStr),
        new Date(endDateStr),
        branchIdStr ? parseInt(branchIdStr) : undefined
      );
    } else if (branchId) {
      // Get holidays for specific branch
      const branchIdVal = Array.isArray(branchId) ? branchId[0] : branchId;
      const branchIdStr = typeof branchIdVal === 'string' ? branchIdVal : '';
      holidays = await HolidayModel.findByBranch(parseInt(branchIdStr));
    } else if (date) {
      // Get holidays for specific date
      const dateVal = Array.isArray(date) ? date[0] : date;
      const dateStr = typeof dateVal === 'string' ? dateVal : '';
      holidays = await HolidayModel.findByDate(new Date(dateStr));
    } else {
      // Get all holidays
      holidays = await HolidayModel.findAll();
    }

    return res.json({
      success: true,
      message: 'Holidays retrieved successfully',
      data: { holidays }
    });
  } catch (error) {
    console.error('Get holidays error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/holidays/:id - Get holiday by ID
router.get('/:id', authenticateJWT, checkPermission('holiday:read'), async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const holidayId = parseInt(idStr as string);

    if (isNaN(holidayId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid holiday ID'
      });
    }

    const holiday = await HolidayModel.findById(holidayId);
    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }

    return res.json({
      success: true,
      message: 'Holiday retrieved successfully',
      data: { holiday }
    });
  } catch (error) {
    console.error('Get holiday error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/holidays - Create new holiday
router.post('/', authenticateJWT, checkPermission('holiday:create'), async (req: Request, res: Response) => {
  try {
    const { holiday_name, date, branch_id, is_mandatory, description } = req.body;

    // Validate required fields
    if (!holiday_name || !date) {
      return res.status(400).json({
        success: false,
        message: 'Holiday name and date are required'
      });
    }

    const holidayData = {
      holiday_name,
      date: new Date(date),
      branch_id: branch_id || null,
      is_mandatory: is_mandatory !== undefined ? Boolean(is_mandatory) : true,
      description: description || null,
      created_by: req.currentUser?.id || null
    };

    const newHoliday = await HolidayModel.create(holidayData);

    return res.status(201).json({
      success: true,
      message: 'Holiday created successfully',
      data: { holiday: newHoliday }
    });
  } catch (error) {
    console.error('Create holiday error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/holidays/:id - Update holiday
router.put('/:id', authenticateJWT, checkPermission('holiday:update'), async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const holidayId = parseInt(idStr as string);
    const { holiday_name, date, branch_id, is_mandatory, description } = req.body;

    if (isNaN(holidayId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid holiday ID'
      });
    }

    const existingHoliday = await HolidayModel.findById(holidayId);
    if (!existingHoliday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }

    const updateData: any = {};
    if (holiday_name !== undefined) updateData.holiday_name = holiday_name;
    if (date !== undefined) updateData.date = new Date(date);
    if (branch_id !== undefined) updateData.branch_id = branch_id;
    if (is_mandatory !== undefined) updateData.is_mandatory = Boolean(is_mandatory);
    if (description !== undefined) updateData.description = description;

    const updatedHoliday = await HolidayModel.update(holidayId, updateData);

    return res.json({
      success: true,
      message: 'Holiday updated successfully',
      data: { holiday: updatedHoliday }
    });
  } catch (error) {
    console.error('Update holiday error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/holidays/:id - Delete holiday
router.delete('/:id', authenticateJWT, checkPermission('holiday:delete'), async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const holidayId = parseInt(idStr as string);

    if (isNaN(holidayId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid holiday ID'
      });
    }

    const deleted = await HolidayModel.delete(holidayId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }

    return res.json({
      success: true,
      message: 'Holiday deleted successfully'
    });
  } catch (error) {
    console.error('Delete holiday error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;