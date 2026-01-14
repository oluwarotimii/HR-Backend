"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var staff_controller_1 = require("../controllers/staff.controller");
var auth_middleware_1 = require("../middleware/auth.middleware");
var router = express_1.default.Router();
// Staff management routes
router.get('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('staff.view'), staff_controller_1.getAllStaff);
router.get('/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('staff.view'), staff_controller_1.getStaffById);
router.post('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('staff.create'), staff_controller_1.createStaff);
router.put('/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('staff.update'), staff_controller_1.updateStaff);
router.delete('/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('staff.delete'), staff_controller_1.deleteStaff);
router.patch('/:id/terminate', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('staff.terminate'), staff_controller_1.terminateStaff);
// Get staff by department
router.get('/department/:department', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('staff.view'), staff_controller_1.getStaffByDepartment);
exports.default = router;
