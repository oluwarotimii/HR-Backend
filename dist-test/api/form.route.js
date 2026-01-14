"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var form_controller_1 = require("../controllers/form.controller");
var auth_middleware_1 = require("../middleware/auth.middleware");
var router = express_1.default.Router();
// Form management routes
router.get('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('form.view'), form_controller_1.getAllForms);
router.get('/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('form.view'), form_controller_1.getFormById);
router.post('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('form.create'), form_controller_1.createForm);
router.put('/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('form.update'), form_controller_1.updateForm);
router.delete('/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('form.delete'), form_controller_1.deleteForm);
// Get form fields
router.get('/:id/fields', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('form.view'), form_controller_1.getFormFields);
exports.default = router;
