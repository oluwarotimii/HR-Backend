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
exports.removeRolePermission = exports.addRolePermission = exports.getRolePermissions = exports.deleteRole = exports.updateRole = exports.createRole = exports.getRoleById = exports.getAllRoles = void 0;
var role_model_1 = require("../models/role.model");
var role_permission_model_1 = require("../models/role-permission.model");
// Controller for role management
var getAllRoles = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var roles, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, role_model_1.default.findAll()];
            case 1:
                roles = _a.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: 'Roles retrieved successfully',
                        data: { roles: roles }
                    })];
            case 2:
                error_1 = _a.sent();
                console.error('Get all roles error:', error_1);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: 'Internal server error'
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getAllRoles = getAllRoles;
var getRoleById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, roleIdStr, roleId, role, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                roleIdStr = Array.isArray(id) ? id[0] : id;
                roleId = parseInt(roleIdStr);
                if (isNaN(roleId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid role ID'
                        })];
                }
                return [4 /*yield*/, role_model_1.default.findById(roleId)];
            case 1:
                role = _a.sent();
                if (!role) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'Role not found'
                        })];
                }
                return [2 /*return*/, res.json({
                        success: true,
                        message: 'Role retrieved successfully',
                        data: { role: role }
                    })];
            case 2:
                error_2 = _a.sent();
                console.error('Get role by ID error:', error_2);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: 'Internal server error'
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getRoleById = getRoleById;
var createRole = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_1, description, permissions, existingRole, roleData, newRole, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, name_1 = _a.name, description = _a.description, permissions = _a.permissions;
                // Validate required fields
                if (!name_1) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Role name is required'
                        })];
                }
                return [4 /*yield*/, role_model_1.default.findByName(name_1)];
            case 1:
                existingRole = _b.sent();
                if (existingRole) {
                    return [2 /*return*/, res.status(409).json({
                            success: false,
                            message: 'A role with this name already exists'
                        })];
                }
                roleData = {
                    name: name_1,
                    description: description || '',
                    permissions: permissions || []
                };
                return [4 /*yield*/, role_model_1.default.create(roleData)];
            case 2:
                newRole = _b.sent();
                res.status(201).json({
                    success: true,
                    message: 'Role created successfully',
                    data: { role: newRole }
                });
                return [3 /*break*/, 4];
            case 3:
                error_3 = _b.sent();
                console.error('Create role error:', error_3);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.createRole = createRole;
var updateRole = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, roleId, _a, name_2, description, permissions, existingRole, updateData, updatedRole, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                id = req.params.id;
                roleId = parseInt(id);
                _a = req.body, name_2 = _a.name, description = _a.description, permissions = _a.permissions;
                if (isNaN(roleId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid role ID'
                        })];
                }
                return [4 /*yield*/, role_model_1.default.findById(roleId)];
            case 1:
                existingRole = _b.sent();
                if (!existingRole) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'Role not found'
                        })];
                }
                updateData = {};
                if (name_2 !== undefined)
                    updateData.name = name_2;
                if (description !== undefined)
                    updateData.description = description;
                if (permissions !== undefined)
                    updateData.permissions = permissions;
                return [4 /*yield*/, role_model_1.default.update(roleId, updateData)];
            case 2:
                updatedRole = _b.sent();
                res.json({
                    success: true,
                    message: 'Role updated successfully',
                    data: { role: updatedRole }
                });
                return [3 /*break*/, 4];
            case 3:
                error_4 = _b.sent();
                console.error('Update role error:', error_4);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.updateRole = updateRole;
var deleteRole = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, roleId, deleted, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                roleId = parseInt(id);
                if (isNaN(roleId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid role ID'
                        })];
                }
                return [4 /*yield*/, role_model_1.default.delete(roleId)];
            case 1:
                deleted = _a.sent();
                if (!deleted) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'Role not found'
                        })];
                }
                res.json({
                    success: true,
                    message: 'Role deleted successfully'
                });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Delete role error:', error_5);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.deleteRole = deleteRole;
// Controller for role permissions management
var getRolePermissions = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, roleId, permissions, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                roleId = parseInt(id);
                if (isNaN(roleId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid role ID'
                        })];
                }
                return [4 /*yield*/, role_permission_model_1.default.getRolePermissions(roleId)];
            case 1:
                permissions = _a.sent();
                res.json({
                    success: true,
                    message: 'Role permissions retrieved successfully',
                    data: { permissions: permissions }
                });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Get role permissions error:', error_6);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getRolePermissions = getRolePermissions;
var addRolePermission = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, roleId, _a, permission, allow_deny, existingPermission, permissionData, newPermission, error_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                id = req.params.id;
                roleId = parseInt(id);
                _a = req.body, permission = _a.permission, allow_deny = _a.allow_deny;
                if (isNaN(roleId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid role ID'
                        })];
                }
                if (!permission) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Permission is required'
                        })];
                }
                return [4 /*yield*/, role_permission_model_1.default.findByRoleAndPermission(roleId, permission)];
            case 1:
                existingPermission = _b.sent();
                if (existingPermission) {
                    return [2 /*return*/, res.status(409).json({
                            success: false,
                            message: 'Permission already exists for this role'
                        })];
                }
                permissionData = {
                    role_id: roleId,
                    permission: permission,
                    allow_deny: allow_deny || 'allow'
                };
                return [4 /*yield*/, role_permission_model_1.default.create(permissionData)];
            case 2:
                newPermission = _b.sent();
                res.status(201).json({
                    success: true,
                    message: 'Role permission added successfully',
                    data: { permission: newPermission }
                });
                return [3 /*break*/, 4];
            case 3:
                error_7 = _b.sent();
                console.error('Add role permission error:', error_7);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.addRolePermission = addRolePermission;
var removeRolePermission = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, id, permission, roleId, deleted, error_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.params, id = _a.id, permission = _a.permission;
                roleId = parseInt(id);
                if (isNaN(roleId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid role ID'
                        })];
                }
                if (!permission) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Permission is required'
                        })];
                }
                return [4 /*yield*/, role_permission_model_1.default.deleteRolePermission(roleId, permission)];
            case 1:
                deleted = _b.sent();
                if (!deleted) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'Role permission not found'
                        })];
                }
                res.json({
                    success: true,
                    message: 'Role permission removed successfully'
                });
                return [3 /*break*/, 3];
            case 2:
                error_8 = _b.sent();
                console.error('Remove role permission error:', error_8);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.removeRolePermission = removeRolePermission;
