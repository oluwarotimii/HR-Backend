"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFormSubmission = exports.updateFormSubmission = exports.submitForm = exports.getFormSubmissionById = exports.getAllFormSubmissions = void 0;
var form_submission_model_1 = require("../models/form-submission.model");
var form_model_1 = require("../models/form.model");
var form_field_model_1 = require("../models/form-field.model");
var audit_log_model_1 = require("../models/audit-log.model");
// Controller for form submissions
var getAllFormSubmissions = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var formId, userId, status_1, submissions, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                formId = req.query.formId ? parseInt(req.query.formId) : undefined;
                userId = req.query.userId ? parseInt(req.query.userId) : undefined;
                status_1 = req.query.status;
                return [4 /*yield*/, form_submission_model_1.default.findAll(formId, userId, status_1)];
            case 1:
                submissions = _a.sent();
                res.json({
                    success: true,
                    message: 'Form submissions retrieved successfully',
                    data: { submissions: submissions }
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Get all form submissions error:', error_1);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getAllFormSubmissions = getAllFormSubmissions;
var getFormSubmissionById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, submissionId, submission, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                submissionId = parseInt(Array.isArray(id) ? id[0] : id);
                if (isNaN(submissionId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid submission ID'
                        })];
                }
                return [4 /*yield*/, form_submission_model_1.default.findById(submissionId)];
            case 1:
                submission = _a.sent();
                if (!submission) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'Form submission not found'
                        })];
                }
                return [2 /*return*/, res.json({
                        success: true,
                        message: 'Form submission retrieved successfully',
                        data: { submission: submission }
                    })];
            case 2:
                error_2 = _a.sent();
                console.error('Get form submission by ID error:', error_2);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: 'Internal server error'
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getFormSubmissionById = getFormSubmissionById;
var submitForm = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, form_id, submission_data, status_2, notes, form, formFields, errors, _i, formFields_1, field, fieldValue, emailRegex, date, regex, submissionData, newSubmission, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                _a = req.body, form_id = _a.form_id, submission_data = _a.submission_data, status_2 = _a.status, notes = _a.notes;
                if (!form_id || !submission_data) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Form ID and submission data are required'
                        })];
                }
                if (!req.currentUser) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            message: 'Authentication required'
                        })];
                }
                return [4 /*yield*/, form_model_1.default.findById(form_id)];
            case 1:
                form = _b.sent();
                if (!form) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'Form not found'
                        })];
                }
                return [4 /*yield*/, form_field_model_1.default.findByFormId(form_id)];
            case 2:
                formFields = _b.sent();
                errors = [];
                for (_i = 0, formFields_1 = formFields; _i < formFields_1.length; _i++) {
                    field = formFields_1[_i];
                    fieldValue = submission_data[field.field_name];
                    // Check required fields
                    if (field.is_required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
                        errors.push("Field '".concat(field.field_label, "' is required"));
                    }
                    // Validate field type
                    if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
                        switch (field.field_type) {
                            case 'email':
                                emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                if (!emailRegex.test(fieldValue)) {
                                    errors.push("Field '".concat(field.field_label, "' must be a valid email"));
                                }
                                break;
                            case 'number':
                                if (isNaN(fieldValue)) {
                                    errors.push("Field '".concat(field.field_label, "' must be a number"));
                                }
                                break;
                            case 'date':
                                date = new Date(fieldValue);
                                if (isNaN(date.getTime())) {
                                    errors.push("Field '".concat(field.field_label, "' must be a valid date"));
                                }
                                break;
                            // Add more validations as needed
                        }
                        // Validate against custom validation rule if provided
                        if (field.validation_rule) {
                            try {
                                regex = new RegExp(field.validation_rule);
                                if (!regex.test(fieldValue)) {
                                    errors.push("Field '".concat(field.field_label, "' does not match required format"));
                                }
                            }
                            catch (e) {
                                console.warn("Invalid validation rule for field ".concat(field.field_name, ": ").concat(field.validation_rule));
                            }
                        }
                    }
                }
                if (errors.length > 0) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Validation failed',
                            errors: errors
                        })];
                }
                submissionData = {
                    form_id: form_id,
                    user_id: req.currentUser.id,
                    submission_data: submission_data,
                    status: status_2 || 'submitted',
                    notes: notes
                };
                return [4 /*yield*/, form_submission_model_1.default.create(submissionData)];
            case 3:
                newSubmission = _b.sent();
                // Log the form submission
                return [4 /*yield*/, audit_log_model_1.default.logStaffOperation(req.currentUser.id, 'form.submitted', newSubmission.id, null, newSubmission, req.ip, req.get('User-Agent') || undefined)];
            case 4:
                // Log the form submission
                _b.sent();
                return [2 /*return*/, res.status(201).json({
                        success: true,
                        message: 'Form submitted successfully',
                        data: { submission: newSubmission }
                    })];
            case 5:
                error_3 = _b.sent();
                console.error('Submit form error:', error_3);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: 'Internal server error'
                    })];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.submitForm = submitForm;
var updateFormSubmission = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, submissionId, _a, status_3, reviewed_by, reviewed_at, notes, existingSubmission, updateData, updatedSubmission, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                id = req.params.id;
                submissionId = parseInt(Array.isArray(id) ? id[0] : id);
                _a = req.body, status_3 = _a.status, reviewed_by = _a.reviewed_by, reviewed_at = _a.reviewed_at, notes = _a.notes;
                if (isNaN(submissionId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid submission ID'
                        })];
                }
                return [4 /*yield*/, form_submission_model_1.default.findById(submissionId)];
            case 1:
                existingSubmission = _b.sent();
                if (!existingSubmission) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'Form submission not found'
                        })];
                }
                updateData = {};
                if (status_3 !== undefined)
                    updateData.status = status_3;
                if (reviewed_by !== undefined)
                    updateData.reviewed_by = reviewed_by;
                if (reviewed_at !== undefined)
                    updateData.reviewed_at = reviewed_at;
                if (notes !== undefined)
                    updateData.notes = notes;
                return [4 /*yield*/, form_submission_model_1.default.update(submissionId, updateData)];
            case 2:
                updatedSubmission = _b.sent();
                if (!req.currentUser) return [3 /*break*/, 4];
                return [4 /*yield*/, audit_log_model_1.default.logStaffOperation(req.currentUser.id, 'form.submission.updated', submissionId, existingSubmission, updatedSubmission, req.ip, req.get('User-Agent') || undefined)];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4: return [2 /*return*/, res.json({
                    success: true,
                    message: 'Form submission updated successfully',
                    data: { submission: updatedSubmission }
                })];
            case 5:
                error_4 = _b.sent();
                console.error('Update form submission error:', error_4);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: 'Internal server error'
                    })];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.updateFormSubmission = updateFormSubmission;
var deleteFormSubmission = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, submissionId, deleted, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                submissionId = parseInt(Array.isArray(id) ? id[0] : id);
                if (isNaN(submissionId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid submission ID'
                        })];
                }
                return [4 /*yield*/, form_submission_model_1.default.delete(submissionId)];
            case 1:
                deleted = _a.sent();
                if (!deleted) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'Form submission not found'
                        })];
                }
                return [2 /*return*/, res.json({
                        success: true,
                        message: 'Form submission deleted successfully'
                    })];
            case 2:
                error_5 = _a.sent();
                console.error('Delete form submission error:', error_5);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: 'Internal server error'
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.deleteFormSubmission = deleteFormSubmission;
