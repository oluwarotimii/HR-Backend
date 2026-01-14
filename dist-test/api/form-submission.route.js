"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var form_submission_controller_1 = require("../controllers/form-submission.controller");
var auth_middleware_1 = require("../middleware/auth.middleware");
var router = express_1.default.Router();
// Form submission routes
router.get('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('form.submission.view'), form_submission_controller_1.getAllFormSubmissions);
router.get('/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('form.submission.view'), form_submission_controller_1.getFormSubmissionById);
router.post('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('form.submission.create'), form_submission_controller_1.submitForm);
router.put('/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('form.submission.update'), form_submission_controller_1.updateFormSubmission);
router.delete('/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.checkPermission)('form.submission.delete'), form_submission_controller_1.deleteFormSubmission);
exports.default = router;
