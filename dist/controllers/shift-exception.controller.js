import ShiftExceptionModel from '../models/shift-exception.model';
import StaffModel from '../models/staff.model';
class ShiftExceptionController {
    static async create(req, res) {
        try {
            const { user_id, exception_date, exception_type, new_start_time, new_end_time, new_break_duration_minutes, reason, is_recurring, day_of_week, end_date } = req.body;
            if (!user_id || !exception_date || !exception_type) {
                return res.status(400).json({
                    success: false,
                    message: 'user_id, exception_date, and exception_type are required'
                });
            }
            const staff = await StaffModel.findByUserId(user_id);
            if (!staff) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found or does not have a staff record'
                });
            }
            const exceptionData = {
                user_id,
                exception_date: new Date(exception_date),
                exception_type,
                new_start_time: new_start_time || null,
                new_end_time: new_end_time || null,
                new_break_duration_minutes: new_break_duration_minutes || 0,
                reason: reason || null,
                created_by: req.currentUser?.id || user_id,
                status: 'active'
            };
            const newException = await ShiftExceptionModel.create(exceptionData);
            return res.status(201).json({
                success: true,
                message: 'Shift exception created successfully',
                data: { exception: newException }
            });
        }
        catch (error) {
            console.error('Create shift exception error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async getAll(req, res) {
        try {
            const { startDate, endDate, userId } = req.query;
            let exceptions;
            if (userId) {
                const userIdNum = parseInt(userId);
                if (startDate && endDate) {
                    exceptions = await ShiftExceptionModel.findByDateRange(userIdNum, new Date(startDate), new Date(endDate));
                }
                else {
                    exceptions = await ShiftExceptionModel.findByUserId(userIdNum);
                }
            }
            else {
                exceptions = await ShiftExceptionModel.findAll();
            }
            return res.status(200).json({
                success: true,
                data: { exceptions }
            });
        }
        catch (error) {
            console.error('Get all shift exceptions error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async getMyShiftExceptions(req, res) {
        try {
            const userId = req.currentUser?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized - User ID not found'
                });
            }
            const { startDate, endDate } = req.query;
            let exceptions;
            if (startDate && endDate) {
                exceptions = await ShiftExceptionModel.findByDateRange(userId, new Date(startDate), new Date(endDate));
            }
            else {
                exceptions = await ShiftExceptionModel.findByUserId(userId);
            }
            return res.status(200).json({
                success: true,
                data: { exceptions }
            });
        }
        catch (error) {
            console.error('Get my shift exceptions error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const exception = await ShiftExceptionModel.findById(id);
            if (!exception) {
                return res.status(404).json({
                    success: false,
                    message: 'Shift exception not found'
                });
            }
            return res.status(200).json({
                success: true,
                data: { exception }
            });
        }
        catch (error) {
            console.error('Get shift exception error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async update(req, res) {
        try {
            const id = parseInt(req.params.id);
            const updateData = req.body;
            const existingException = await ShiftExceptionModel.findById(id);
            if (!existingException) {
                return res.status(404).json({
                    success: false,
                    message: 'Shift exception not found'
                });
            }
            const updatedException = await ShiftExceptionModel.update(id, updateData);
            return res.status(200).json({
                success: true,
                message: 'Shift exception updated successfully',
                data: { exception: updatedException }
            });
        }
        catch (error) {
            console.error('Update shift exception error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            const existingException = await ShiftExceptionModel.findById(id);
            if (!existingException) {
                return res.status(404).json({
                    success: false,
                    message: 'Shift exception not found'
                });
            }
            await ShiftExceptionModel.delete(id);
            return res.status(200).json({
                success: true,
                message: 'Shift exception deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete shift exception error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
export const { create: createShiftException, getAll: getAllShiftExceptions, getMyShiftExceptions, getById: getShiftExceptionById, update: updateShiftException, delete: deleteShiftException } = ShiftExceptionController;
export default ShiftExceptionController;
//# sourceMappingURL=shift-exception.controller.js.map