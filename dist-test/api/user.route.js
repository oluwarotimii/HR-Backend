"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var user_controller_1 = require("../controllers/user.controller");
var auth_middleware_1 = require("../middleware/auth.middleware");
var router = express_1.default.Router();
// User management routes
router.get('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('user.view'), user_controller_1.getAllUsers);
router.get('/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('user.view'), user_controller_1.getUserById);
router.post('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('user.create'), user_controller_1.createUser);
router.put('/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('user.update'), user_controller_1.updateUser);
router.delete('/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('user.delete'), user_controller_1.deleteUser);
router.patch('/:id/terminate', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('user.terminate'), user_controller_1.terminateUser);
// User permissions management routes
router.get('/:id/permissions', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('user.permissions.view'), user_controller_1.getUserPermissions);
router.post('/:id/permissions', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('user.permissions.manage'), user_controller_1.addUserPermission);
router.delete('/:id/permissions/:permission', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('user.permissions.manage'), user_controller_1.removeUserPermission);
exports.default = router;
