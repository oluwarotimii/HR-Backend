"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var auth_controller_1 = require("../controllers/auth.controller");
var auth_middleware_1 = require("../middleware/auth.middleware");
var router = express_1.default.Router();
// Public routes
router.post('/login', auth_controller_1.login);
router.post('/refresh', auth_controller_1.refreshToken);
// Protected routes
router.post('/logout', auth_middleware_1.authenticateJWT, auth_controller_1.logout);
router.get('/permissions', auth_middleware_1.authenticateJWT, auth_controller_1.getPermissions);
// Example of a route that requires a specific permission
// router.get('/admin-panel', authenticateJWT, checkPermission('admin.access'), adminController.getAdminData);
exports.default = router;
