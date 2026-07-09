"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const staff_branch_time_mapping_model_1 = __importDefault(require("../models/staff-branch-time-mapping.model"));
const audit_log_model_1 = __importDefault(require("../models/audit-log.model"));
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('attendance:manage'), async (req, res) => {
    try {
        const mappings = await staff_branch_time_mapping_model_1.default.findAll();
        const enriched = mappings.map((m) => ({
            ...m,
            target_name: m.staff_first_name
                ? `${m.staff_first_name} ${m.staff_last_name}`
                : m.department_name || 'Unknown'
        }));
        return res.json({ success: true, data: { mappings: enriched } });
    }
    catch (error) {
        console.error('Get branch time mappings error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
router.post('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('attendance:manage'), async (req, res) => {
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
        const mapping = await staff_branch_time_mapping_model_1.default.create({
            staff_id: staff_id || null,
            department_id: department_id || null,
            branch_id,
            created_by: userId
        });
        await audit_log_model_1.default.create({
            user_id: userId,
            action: 'create',
            entity_type: 'staff_branch_time_mapping',
            entity_id: mapping.id,
            after_data: { staff_id, department_id, branch_id },
            ip_address: req.ip,
            user_agent: req.headers['user-agent']
        });
        return res.status(201).json({ success: true, message: 'Branch time mapping created', data: { mapping } });
    }
    catch (error) {
        console.error('Create branch time mapping error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
router.delete('/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('attendance:manage'), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }
        const existing = await staff_branch_time_mapping_model_1.default.findById(id);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Mapping not found' });
        }
        await staff_branch_time_mapping_model_1.default.delete(id);
        const userId = req.currentUser?.id;
        if (userId) {
            await audit_log_model_1.default.create({
                user_id: userId,
                action: 'delete',
                entity_type: 'staff_branch_time_mapping',
                entity_id: id,
                before_data: existing,
                ip_address: req.ip,
                user_agent: req.headers['user-agent']
            });
        }
        return res.json({ success: true, message: 'Branch time mapping deleted' });
    }
    catch (error) {
        console.error('Delete branch time mapping error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=branch-time-mapping.route.js.map