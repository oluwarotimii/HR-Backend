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
exports.getFormFields = exports.deleteForm = exports.updateForm = exports.createForm = exports.getFormById = exports.getAllForms = void 0;
var form_model_1 = require("../models/form.model");
var form_field_model_1 = require("../models/form-field.model");
var audit_log_model_1 = require("../models/audit-log.model");
// Controller for form management
var getAllForms = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var branchId, forms, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                branchId = req.query.branchId ? parseInt(req.query.branchId) : undefined;
                return [4 /*yield*/, form_model_1.default.findAll(branchId)];
            case 1:
                forms = _a.sent();
                res.json({
                    success: true,
                    message: 'Forms retrieved successfully',
                    data: { forms: forms }
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Get all forms error:', error_1);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getAllForms = getAllForms;
var getFormById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, formId, form, fields, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                id = req.params.id;
                formId = parseInt(Array.isArray(id) ? id[0] : id);
                if (isNaN(formId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid form ID'
                        })];
                }
                return [4 /*yield*/, form_model_1.default.findById(formId)];
            case 1:
                form = _a.sent();
                if (!form) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'Form not found'
                        })];
                }
                return [4 /*yield*/, form_field_model_1.default.findByFormId(formId)];
            case 2:
                fields = _a.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: 'Form retrieved successfully',
                        data: { form: form, fields: fields }
                    })];
            case 3:
                error_2 = _a.sent();
                console.error('Get form by ID error:', error_2);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: 'Internal server error'
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getFormById = getFormById;
var createForm = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_1, description, form_type, branch_id, fields, formData, newForm, _i, fields_1, field, fieldData, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 7, , 8]);
                _a = req.body, name_1 = _a.name, description = _a.description, form_type = _a.form_type, branch_id = _a.branch_id, fields = _a.fields;
                // Validate required fields
                if (!name_1 || !form_type) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Form name and type are required'
                        })];
                }
                if (!req.currentUser) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            message: 'Authentication required'
                        })];
                }
                formData = {
                    name: name_1,
                    description: description,
                    form_type: form_type,
                    branch_id: branch_id,
                    created_by: req.currentUser.id
                };
                return [4 /*yield*/, form_model_1.default.create(formData)];
            case 1:
                newForm = _b.sent();
                if (!(fields && Array.isArray(fields))) return [3 /*break*/, 5];
                _i = 0, fields_1 = fields;
                _b.label = 2;
            case 2:
                if (!(_i < fields_1.length)) return [3 /*break*/, 5];
                field = fields_1[_i];
                fieldData = {
                    form_id: newForm.id,
                    field_name: field.field_name,
                    field_label: field.field_label,
                    field_type: field.field_type,
                    is_required: field.is_required || false,
                    placeholder: field.placeholder,
                    help_text: field.help_text,
                    validation_rule: field.validation_rule,
                    options: field.options,
                    field_order: field.field_order
                };
                return [4 /*yield*/, form_field_model_1.default.create(fieldData)];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: 
            // Log the form creation
            return [4 /*yield*/, audit_log_model_1.default.logStaffOperation(req.currentUser.id, 'form.created', newForm.id, null, newForm, req.ip, req.get('User-Agent') || undefined)];
            case 6:
                // Log the form creation
                _b.sent();
                return [2 /*return*/, res.status(201).json({
                        success: true,
                        message: 'Form created successfully',
                        data: { form: newForm }
                    })];
            case 7:
                error_3 = _b.sent();
                console.error('Create form error:', error_3);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: 'Internal server error'
                    })];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.createForm = createForm;
var updateForm = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, formId, _a, name_2, description, form_type, branch_id, is_active, fields, existingForm, updateData, updatedForm, _i, fields_2, field, fieldData, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 10, , 11]);
                id = req.params.id;
                formId = parseInt(Array.isArray(id) ? id[0] : id);
                _a = req.body, name_2 = _a.name, description = _a.description, form_type = _a.form_type, branch_id = _a.branch_id, is_active = _a.is_active, fields = _a.fields;
                if (isNaN(formId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid form ID'
                        })];
                }
                return [4 /*yield*/, form_model_1.default.findById(formId)];
            case 1:
                existingForm = _b.sent();
                if (!existingForm) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'Form not found'
                        })];
                }
                updateData = {};
                if (name_2 !== undefined)
                    updateData.name = name_2;
                if (description !== undefined)
                    updateData.description = description;
                if (form_type !== undefined)
                    updateData.form_type = form_type;
                if (branch_id !== undefined)
                    updateData.branch_id = branch_id;
                if (is_active !== undefined)
                    updateData.is_active = is_active;
                return [4 /*yield*/, form_model_1.default.update(formId, updateData)];
            case 2:
                updatedForm = _b.sent();
                if (!(fields && Array.isArray(fields))) return [3 /*break*/, 7];
                // First, delete all existing fields for this form
                return [4 /*yield*/, form_field_model_1.default.deleteByFormId(formId)];
            case 3:
                // First, delete all existing fields for this form
                _b.sent();
                _i = 0, fields_2 = fields;
                _b.label = 4;
            case 4:
                if (!(_i < fields_2.length)) return [3 /*break*/, 7];
                field = fields_2[_i];
                fieldData = {
                    form_id: formId,
                    field_name: field.field_name,
                    field_label: field.field_label,
                    field_type: field.field_type,
                    is_required: field.is_required || false,
                    placeholder: field.placeholder,
                    help_text: field.help_text,
                    validation_rule: field.validation_rule,
                    options: field.options,
                    field_order: field.field_order
                };
                return [4 /*yield*/, form_field_model_1.default.create(fieldData)];
            case 5:
                _b.sent();
                _b.label = 6;
            case 6:
                _i++;
                return [3 /*break*/, 4];
            case 7:
                if (!req.currentUser) return [3 /*break*/, 9];
                return [4 /*yield*/, audit_log_model_1.default.logStaffOperation(req.currentUser.id, 'form.updated', formId, existingForm, updatedForm, req.ip, req.get('User-Agent') || undefined)];
            case 8:
                _b.sent();
                _b.label = 9;
            case 9: return [2 /*return*/, res.json({
                    success: true,
                    message: 'Form updated successfully',
                    data: { form: updatedForm }
                })];
            case 10:
                error_4 = _b.sent();
                console.error('Update form error:', error_4);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: 'Internal server error'
                    })];
            case 11: return [2 /*return*/];
        }
    });
}); };
exports.updateForm = updateForm;
var deleteForm = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, formId, existingForm, deactivated, updatedForm, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                id = req.params.id;
                formId = parseInt(Array.isArray(id) ? id[0] : id);
                if (isNaN(formId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid form ID'
                        })];
                }
                return [4 /*yield*/, form_model_1.default.findById(formId)];
            case 1:
                existingForm = _a.sent();
                if (!existingForm) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'Form not found'
                        })];
                }
                return [4 /*yield*/, form_model_1.default.delete(formId)];
            case 2:
                deactivated = _a.sent();
                if (!deactivated) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'Form not found'
                        })];
                }
                return [4 /*yield*/, form_model_1.default.findById(formId)];
            case 3:
                updatedForm = _a.sent();
                if (!req.currentUser) return [3 /*break*/, 5];
                return [4 /*yield*/, audit_log_model_1.default.logStaffOperation(req.currentUser.id, 'form.deactivated', formId, existingForm, updatedForm, req.ip, req.get('User-Agent') || undefined)];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5: return [2 /*return*/, res.json({
                    success: true,
                    message: 'Form deactivated successfully'
                })];
            case 6:
                error_5 = _a.sent();
                console.error('Deactivate form error:', error_5);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: 'Internal server error'
                    })];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.deleteForm = deleteForm;
var getFormFields = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, formId, fields, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                formId = parseInt(Array.isArray(id) ? id[0] : id);
                if (isNaN(formId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid form ID'
                        })];
                }
                return [4 /*yield*/, form_field_model_1.default.findByFormId(formId)];
            case 1:
                fields = _a.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: 'Form fields retrieved successfully',
                        data: { fields: fields, formId: formId }
                    })];
            case 2:
                error_6 = _a.sent();
                console.error('Get form fields error:', error_6);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: 'Internal server error'
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getFormFields = getFormFields;
