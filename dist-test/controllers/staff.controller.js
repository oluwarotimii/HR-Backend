"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.getStaffByDepartment = exports.terminateStaff = exports.deleteStaff = exports.updateStaff = exports.createStaff = exports.getStaffById = exports.getAllStaff = void 0;
var staff_model_1 = require("../models/staff.model");
var user_model_1 = require("../models/user.model");
var audit_log_model_1 = require("../models/audit-log.model");
// Controller for staff management
var getAllStaff = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var page, limit, branchId, offset, _a, staff, totalCount, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                page = parseInt(req.query.page) || 1;
                limit = parseInt(req.query.limit) || 20;
                branchId = req.query.branchId ? parseInt(req.query.branchId) : undefined;
                offset = (page - 1) * limit;
                return [4 /*yield*/, staff_model_1.default.findAll(limit, offset, branchId)];
            case 1:
                _a = _b.sent(), staff = _a.staff, totalCount = _a.totalCount;
                return [2 /*return*/, res.json({
                        success: true,
                        message: 'Staff retrieved successfully',
                        data: {
                            staff: staff,
                            pagination: {
                                currentPage: page,
                                totalPages: Math.ceil(totalCount / limit),
                                totalItems: totalCount,
                                itemsPerPage: limit
                            }
                        }
                    })];
            case 2:
                error_1 = _b.sent();
                console.error('Get all staff error:', error_1);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: 'Internal server error'
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getAllStaff = getAllStaff;
var getStaffById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, staffIdStr, staffId, staff, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                staffIdStr = Array.isArray(id) ? id[0] : id;
                staffId = parseInt(staffIdStr);
                if (isNaN(staffId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid staff ID'
                        })];
                }
                return [4 /*yield*/, staff_model_1.default.findById(staffId)];
            case 1:
                staff = _a.sent();
                if (!staff) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'Staff not found'
                        })];
                }
                return [2 /*return*/, res.json({
                        success: true,
                        message: 'Staff retrieved successfully',
                        data: { staff: staff }
                    })];
            case 2:
                error_2 = _a.sent();
                console.error('Get staff by ID error:', error_2);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: 'Internal server error'
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getStaffById = getStaffById;
var createStaff = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, user_id, employee_id, designation, department, branch_id, joining_date, employment_type, user, existingStaff, staffData, newStaff, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                _a = req.body, user_id = _a.user_id, employee_id = _a.employee_id, designation = _a.designation, department = _a.department, branch_id = _a.branch_id, joining_date = _a.joining_date, employment_type = _a.employment_type;
                // Validate required fields
                if (!user_id) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'User ID is required'
                        })];
                }
                return [4 /*yield*/, user_model_1.default.findById(user_id)];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'User not found'
                        })];
                }
                return [4 /*yield*/, staff_model_1.default.findByUserId(user_id)];
            case 2:
                existingStaff = _b.sent();
                if (existingStaff) {
                    return [2 /*return*/, res.status(409).json({
                            success: false,
                            message: 'Staff record already exists for this user'
                        })];
                }
                staffData = {
                    user_id: user_id,
                    employee_id: employee_id,
                    designation: designation,
                    department: department,
                    branch_id: branch_id,
                    joining_date: joining_date ? new Date(joining_date) : undefined,
                    employment_type: employment_type || 'full_time'
                };
                return [4 /*yield*/, staff_model_1.default.create(staffData)];
            case 3:
                newStaff = _b.sent();
                if (!req.currentUser) return [3 /*break*/, 5];
                return [4 /*yield*/, audit_log_model_1.default.logStaffOperation(req.currentUser.id, 'staff.created', newStaff.id, null, newStaff, req.ip, req.get('User-Agent') || undefined)];
            case 4:
                _b.sent();
                _b.label = 5;
            case 5:
                res.status(201).json({
                    success: true,
                    message: 'Staff created successfully',
                    data: { staff: newStaff }
                });
                return [3 /*break*/, 7];
            case 6:
                error_3 = _b.sent();
                console.error('Create staff error:', error_3);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.createStaff = createStaff;
var updateStaff = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, staffId, _a, employee_id, designation, department, branch_id, joining_date, employment_type, status_1, existingStaff, updateData, beforeUpdate, updatedStaff, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                id = req.params.id;
                staffId = parseInt(id);
                _a = req.body, employee_id = _a.employee_id, designation = _a.designation, department = _a.department, branch_id = _a.branch_id, joining_date = _a.joining_date, employment_type = _a.employment_type, status_1 = _a.status;
                if (isNaN(staffId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid staff ID'
                        })];
                }
                return [4 /*yield*/, staff_model_1.default.findById(staffId)];
            case 1:
                existingStaff = _b.sent();
                if (!existingStaff) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'Staff not found'
                        })];
                }
                updateData = {};
                if (employee_id !== undefined)
                    updateData.employee_id = employee_id;
                if (designation !== undefined)
                    updateData.designation = designation;
                if (department !== undefined)
                    updateData.department = department;
                if (branch_id !== undefined)
                    updateData.branch_id = branch_id;
                if (joining_date !== undefined)
                    updateData.joining_date = new Date(joining_date);
                if (employment_type !== undefined)
                    updateData.employment_type = employment_type;
                if (status_1 !== undefined)
                    updateData.status = status_1;
                beforeUpdate = __assign({}, existingStaff);
                return [4 /*yield*/, staff_model_1.default.update(staffId, updateData)];
            case 2:
                updatedStaff = _b.sent();
                if (!req.currentUser) return [3 /*break*/, 4];
                return [4 /*yield*/, audit_log_model_1.default.logStaffOperation(req.currentUser.id, 'staff.updated', staffId, beforeUpdate, updatedStaff, req.ip, req.get('User-Agent') || undefined)];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4:
                res.json({
                    success: true,
                    message: 'Staff updated successfully',
                    data: { staff: updatedStaff }
                });
                return [3 /*break*/, 6];
            case 5:
                error_4 = _b.sent();
                console.error('Update staff error:', error_4);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.updateStaff = updateStaff;
var deleteStaff = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, staffId, existingStaff, deactivated, updatedStaff, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                id = req.params.id;
                staffId = parseInt(id);
                if (isNaN(staffId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid staff ID'
                        })];
                }
                return [4 /*yield*/, staff_model_1.default.findById(staffId)];
            case 1:
                existingStaff = _a.sent();
                if (!existingStaff) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'Staff not found'
                        })];
                }
                return [4 /*yield*/, staff_model_1.default.deactivate(staffId)];
            case 2:
                deactivated = _a.sent();
                if (!deactivated) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'Staff not found'
                        })];
                }
                return [4 /*yield*/, staff_model_1.default.findById(staffId)];
            case 3:
                updatedStaff = _a.sent();
                if (!req.currentUser) return [3 /*break*/, 5];
                return [4 /*yield*/, audit_log_model_1.default.logStaffOperation(req.currentUser.id, 'staff.deactivated', staffId, existingStaff, updatedStaff, req.ip, req.get('User-Agent') || undefined)];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5:
                res.json({
                    success: true,
                    message: 'Staff deactivated successfully'
                });
                return [3 /*break*/, 7];
            case 6:
                error_5 = _a.sent();
                console.error('Deactivate staff error:', error_5);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.deleteStaff = deleteStaff;
var terminateStaff = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, staffId, existingStaff, updatedStaff, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                id = req.params.id;
                staffId = parseInt(id);
                if (isNaN(staffId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid staff ID'
                        })];
                }
                return [4 /*yield*/, staff_model_1.default.findById(staffId)];
            case 1:
                existingStaff = _a.sent();
                if (!existingStaff) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'Staff not found'
                        })];
                }
                return [4 /*yield*/, staff_model_1.default.update(staffId, { status: 'terminated' })];
            case 2:
                updatedStaff = _a.sent();
                if (!updatedStaff) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'Staff not found'
                        })];
                }
                if (!req.currentUser) return [3 /*break*/, 4];
                return [4 /*yield*/, audit_log_model_1.default.logStaffOperation(req.currentUser.id, 'staff.terminated', staffId, existingStaff, updatedStaff, req.ip, req.get('User-Agent') || undefined)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                res.json({
                    success: true,
                    message: 'Staff terminated successfully'
                });
                return [3 /*break*/, 6];
            case 5:
                error_6 = _a.sent();
                console.error('Terminate staff error:', error_6);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.terminateStaff = terminateStaff;
var getStaffByDepartment = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var department, branchId, staff, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                department = req.params.department;
                branchId = req.query.branchId ? parseInt(req.query.branchId) : undefined;
                if (!department) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Department is required'
                        })];
                }
                return [4 /*yield*/, staff_model_1.default.findByDepartment(department, branchId)];
            case 1:
                staff = _a.sent();
                res.json({
                    success: true,
                    message: 'Staff retrieved successfully',
                    data: { staff: staff, department: department, branchId: branchId }
                });
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                console.error('Get staff by department error:', error_7);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getStaffByDepartment = getStaffByDepartment;
