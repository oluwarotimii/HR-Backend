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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUserPermission = exports.addUserPermission = exports.getUserPermissions = exports.terminateUser = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
var user_model_1 = require("../models/user.model");
var user_permission_model_1 = require("../models/user-permission.model");
// Controller for user management
var getAllUsers = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var users, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, user_model_1.default.findAll()];
            case 1:
                users = _a.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: 'Users retrieved successfully',
                        data: { users: users }
                    })];
            case 2:
                error_1 = _a.sent();
                console.error('Get all users error:', error_1);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: 'Internal server error'
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getAllUsers = getAllUsers;
var getUserById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, user, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                userId = parseInt(id);
                if (isNaN(userId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid user ID'
                        })];
                }
                return [4 /*yield*/, user_model_1.default.findById(userId)];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'User not found'
                        })];
                }
                res.json({
                    success: true,
                    message: 'User retrieved successfully',
                    data: { user: user }
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Get user by ID error:', error_2);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getUserById = getUserById;
var createUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, full_name, phone, role_id, branch_id, existingUser, userData, newUser, _b, password_hash, userWithoutPassword, error_3;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                _a = req.body, email = _a.email, password = _a.password, full_name = _a.full_name, phone = _a.phone, role_id = _a.role_id, branch_id = _a.branch_id;
                // Validate required fields
                if (!email || !password || !full_name || !role_id) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Email, password, full name, and role ID are required'
                        })];
                }
                return [4 /*yield*/, user_model_1.default.findByEmail(email)];
            case 1:
                existingUser = _c.sent();
                if (existingUser) {
                    return [2 /*return*/, res.status(409).json({
                            success: false,
                            message: 'A user with this email already exists'
                        })];
                }
                userData = {
                    email: email,
                    password: password,
                    full_name: full_name,
                    phone: phone,
                    role_id: role_id,
                    branch_id: branch_id
                };
                return [4 /*yield*/, user_model_1.default.create(userData)];
            case 2:
                newUser = _c.sent();
                _b = newUser, password_hash = _b.password_hash, userWithoutPassword = __rest(_b, ["password_hash"]);
                res.status(201).json({
                    success: true,
                    message: 'User created successfully',
                    data: { user: userWithoutPassword }
                });
                return [3 /*break*/, 4];
            case 3:
                error_3 = _c.sent();
                console.error('Create user error:', error_3);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.createUser = createUser;
var updateUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, _a, email, password, full_name, phone, role_id, branch_id, status_1, existingUser, updateData, updatedUser, _b, password_hash, userWithoutPassword, error_4;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                id = req.params.id;
                userId = parseInt(id);
                _a = req.body, email = _a.email, password = _a.password, full_name = _a.full_name, phone = _a.phone, role_id = _a.role_id, branch_id = _a.branch_id, status_1 = _a.status;
                if (isNaN(userId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid user ID'
                        })];
                }
                return [4 /*yield*/, user_model_1.default.findById(userId)];
            case 1:
                existingUser = _c.sent();
                if (!existingUser) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'User not found'
                        })];
                }
                updateData = {};
                if (email !== undefined)
                    updateData.email = email;
                if (password !== undefined)
                    updateData.password = password;
                if (full_name !== undefined)
                    updateData.full_name = full_name;
                if (phone !== undefined)
                    updateData.phone = phone;
                if (role_id !== undefined)
                    updateData.role_id = role_id;
                if (branch_id !== undefined)
                    updateData.branch_id = branch_id;
                if (status_1 !== undefined)
                    updateData.status = status_1;
                return [4 /*yield*/, user_model_1.default.update(userId, updateData)];
            case 2:
                updatedUser = _c.sent();
                // Don't return the password hash
                if (updatedUser) {
                    _b = updatedUser, password_hash = _b.password_hash, userWithoutPassword = __rest(_b, ["password_hash"]);
                    res.json({
                        success: true,
                        message: 'User updated successfully',
                        data: { user: userWithoutPassword }
                    });
                }
                else {
                    res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                }
                return [3 /*break*/, 4];
            case 3:
                error_4 = _c.sent();
                console.error('Update user error:', error_4);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.updateUser = updateUser;
var deleteUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, deleted, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                userId = parseInt(id);
                if (isNaN(userId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid user ID'
                        })];
                }
                return [4 /*yield*/, user_model_1.default.delete(userId)];
            case 1:
                deleted = _a.sent();
                if (!deleted) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'User not found'
                        })];
                }
                res.json({
                    success: true,
                    message: 'User deactivated successfully'
                });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Deactivate user error:', error_5);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.deleteUser = deleteUser;
var terminateUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, terminated, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                userId = parseInt(id);
                if (isNaN(userId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid user ID'
                        })];
                }
                return [4 /*yield*/, user_model_1.default.softDelete(userId)];
            case 1:
                terminated = _a.sent();
                if (!terminated) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'User not found'
                        })];
                }
                res.json({
                    success: true,
                    message: 'User terminated successfully'
                });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Terminate user error:', error_6);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.terminateUser = terminateUser;
// Controller for user permissions management
var getUserPermissions = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, permissions, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                userId = parseInt(id);
                if (isNaN(userId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid user ID'
                        })];
                }
                return [4 /*yield*/, user_permission_model_1.default.getUserPermissions(userId)];
            case 1:
                permissions = _a.sent();
                res.json({
                    success: true,
                    message: 'User permissions retrieved successfully',
                    data: { permissions: permissions }
                });
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                console.error('Get user permissions error:', error_7);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getUserPermissions = getUserPermissions;
var addUserPermission = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, _a, permission, allow_deny, existingPermission, permissionData, newPermission, error_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                id = req.params.id;
                userId = parseInt(id);
                _a = req.body, permission = _a.permission, allow_deny = _a.allow_deny;
                if (isNaN(userId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid user ID'
                        })];
                }
                if (!permission) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Permission is required'
                        })];
                }
                return [4 /*yield*/, user_permission_model_1.default.findByUserAndPermission(userId, permission)];
            case 1:
                existingPermission = _b.sent();
                if (existingPermission) {
                    return [2 /*return*/, res.status(409).json({
                            success: false,
                            message: 'Permission already exists for this user'
                        })];
                }
                permissionData = {
                    user_id: userId,
                    permission: permission,
                    allow_deny: allow_deny || 'allow'
                };
                return [4 /*yield*/, user_permission_model_1.default.create(permissionData)];
            case 2:
                newPermission = _b.sent();
                res.status(201).json({
                    success: true,
                    message: 'User permission added successfully',
                    data: { permission: newPermission }
                });
                return [3 /*break*/, 4];
            case 3:
                error_8 = _b.sent();
                console.error('Add user permission error:', error_8);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.addUserPermission = addUserPermission;
var removeUserPermission = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, id, permission, userId, deleted, error_9;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.params, id = _a.id, permission = _a.permission;
                userId = parseInt(id);
                if (isNaN(userId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Invalid user ID'
                        })];
                }
                if (!permission) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Permission is required'
                        })];
                }
                return [4 /*yield*/, user_permission_model_1.default.deleteUserPermission(userId, permission)];
            case 1:
                deleted = _b.sent();
                if (!deleted) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'User permission not found'
                        })];
                }
                res.json({
                    success: true,
                    message: 'User permission removed successfully'
                });
                return [3 /*break*/, 3];
            case 2:
                error_9 = _b.sent();
                console.error('Remove user permission error:', error_9);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.removeUserPermission = removeUserPermission;
