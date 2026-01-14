"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var role_controller_1 = require("../controllers/role.controller");
var auth_middleware_1 = require("../middleware/auth.middleware");
var router = express_1.default.Router();
// Role management routes
router.get('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('role.view'), role_controller_1.getAllRoles);
router.get('/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('role.view'), role_controller_1.getRoleById);
router.post('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('role.create'), role_controller_1.createRole);
router.put('/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('role.update'), role_controller_1.updateRole);
router.delete('/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('role.delete'), role_controller_1.deleteRole);
// Role permissions management routes
router.get('/:id/permissions', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('role.permissions.view'), role_controller_1.getRolePermissions);
router.post('/:id/permissions', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('role.permissions.manage'), role_controller_1.addRolePermission);
router.delete('/:id/permissions/:permission', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('role.permissions.manage'), role_controller_1.removeRolePermission);
exports.default = router;
