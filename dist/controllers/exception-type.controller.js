import ExceptionTypeModel from '../models/exception-type.model';
export const getAllExceptionTypes = async (req, res) => {
    try {
        const { activeOnly } = req.query;
        const types = await ExceptionTypeModel.findAll(activeOnly === 'true');
        return res.json({
            success: true,
            message: 'Exception types retrieved successfully',
            data: { exceptionTypes: types }
        });
    }
    catch (error) {
        console.error('Get exception types error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
export const getExceptionTypeById = async (req, res) => {
    try {
        const idParam = req.params.id;
        const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
        const exceptionTypeId = parseInt(idStr);
        if (isNaN(exceptionTypeId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid exception type ID'
            });
        }
        const exceptionType = await ExceptionTypeModel.findById(exceptionTypeId);
        if (!exceptionType) {
            return res.status(404).json({
                success: false,
                message: 'Exception type not found'
            });
        }
        return res.json({
            success: true,
            message: 'Exception type retrieved successfully',
            data: { exceptionType }
        });
    }
    catch (error) {
        console.error('Get exception type error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
export const createExceptionType = async (req, res) => {
    try {
        const { name, code, description, icon, color, default_start_time, default_end_time, default_break_duration, sort_order } = req.body;
        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: 'Name and code are required'
            });
        }
        const existing = await ExceptionTypeModel.findByCode(code);
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Exception type with this code already exists'
            });
        }
        const typeData = {
            name,
            code,
            description: description || null,
            icon: icon || 'AlertCircle',
            color: color || 'bg-gray-100 text-gray-700',
            default_start_time: default_start_time || null,
            default_end_time: default_end_time || null,
            default_break_duration: default_break_duration || 60,
            is_active: true,
            is_system: false,
            sort_order: sort_order || 0
        };
        const newType = await ExceptionTypeModel.create(typeData);
        return res.status(201).json({
            success: true,
            message: 'Exception type created successfully',
            data: { exceptionType: newType }
        });
    }
    catch (error) {
        console.error('Create exception type error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
export const updateExceptionType = async (req, res) => {
    try {
        const idParam = req.params.id;
        const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
        const exceptionTypeId = parseInt(idStr);
        if (isNaN(exceptionTypeId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid exception type ID'
            });
        }
        const { name, description, icon, color, default_start_time, default_end_time, default_break_duration, sort_order } = req.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (description !== undefined)
            updateData.description = description;
        if (icon !== undefined)
            updateData.icon = icon;
        if (color !== undefined)
            updateData.color = color;
        if (default_start_time !== undefined)
            updateData.default_start_time = default_start_time;
        if (default_end_time !== undefined)
            updateData.default_end_time = default_end_time;
        if (default_break_duration !== undefined)
            updateData.default_break_duration = default_break_duration;
        if (sort_order !== undefined)
            updateData.sort_order = sort_order;
        const updatedType = await ExceptionTypeModel.update(exceptionTypeId, updateData);
        if (!updatedType) {
            return res.status(404).json({
                success: false,
                message: 'Exception type not found'
            });
        }
        return res.json({
            success: true,
            message: 'Exception type updated successfully',
            data: { exceptionType: updatedType }
        });
    }
    catch (error) {
        console.error('Update exception type error:', error);
        if (error.message === 'Cannot modify system exception types') {
            return res.status(403).json({
                success: false,
                message: error.message
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
export const deleteExceptionType = async (req, res) => {
    try {
        const idParam = req.params.id;
        const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
        const exceptionTypeId = parseInt(idStr);
        if (isNaN(exceptionTypeId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid exception type ID'
            });
        }
        const deleted = await ExceptionTypeModel.delete(exceptionTypeId);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Exception type not found'
            });
        }
        return res.json({
            success: true,
            message: 'Exception type deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete exception type error:', error);
        if (error.message.includes('Cannot delete')) {
            return res.status(403).json({
                success: false,
                message: error.message
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
export const toggleExceptionTypeActive = async (req, res) => {
    try {
        const idParam = req.params.id;
        const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
        const exceptionTypeId = parseInt(idStr);
        if (isNaN(exceptionTypeId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid exception type ID'
            });
        }
        const toggledType = await ExceptionTypeModel.toggleActive(exceptionTypeId);
        if (!toggledType) {
            return res.status(404).json({
                success: false,
                message: 'Exception type not found'
            });
        }
        return res.json({
            success: true,
            message: `Exception type ${toggledType.is_active ? 'activated' : 'deactivated'} successfully`,
            data: { exceptionType: toggledType }
        });
    }
    catch (error) {
        console.error('Toggle exception type error:', error);
        if (error.message.includes('Cannot')) {
            return res.status(403).json({
                success: false,
                message: error.message
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
//# sourceMappingURL=exception-type.controller.js.map