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
exports.getPermissions = exports.refreshToken = exports.logout = exports.login = void 0;
var jwt_util_1 = require("../utils/jwt.util");
var user_model_1 = require("../models/user.model");
var permission_service_1 = require("../services/permission.service");
var login = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, user, isValidPassword, payload, accessToken, refreshToken_1, permissions, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, email = _a.email, password = _a.password;
                // Validate input
                if (!email || !password) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Email and password are required'
                        })];
                }
                return [4 /*yield*/, user_model_1.default.findByEmail(email)];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            message: 'Invalid email or password'
                        })];
                }
                // Check if user is active
                if (user.status !== 'active') {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            message: 'Account is inactive'
                        })];
                }
                return [4 /*yield*/, user_model_1.default.comparePassword(password, user.password_hash)];
            case 2:
                isValidPassword = _b.sent();
                if (!isValidPassword) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            message: 'Invalid email or password'
                        })];
                }
                payload = {
                    userId: user.id,
                    email: user.email,
                    role: user.role_id
                };
                accessToken = jwt_util_1.default.generateAccessToken(payload);
                refreshToken_1 = jwt_util_1.default.generateRefreshToken(payload);
                return [4 /*yield*/, permission_service_1.default.generatePermissionManifest(user.id)];
            case 3:
                permissions = _b.sent();
                // Return success response with tokens and user data
                return [2 /*return*/, res.json({
                        success: true,
                        message: 'Login successful',
                        data: {
                            user: {
                                id: user.id,
                                email: user.email,
                                fullName: user.full_name,
                                roleId: user.role_id,
                                branchId: user.branch_id,
                                status: user.status
                            },
                            permissions: permissions,
                            tokens: {
                                accessToken: accessToken,
                                refreshToken: refreshToken_1,
                                expiresIn: process.env.JWT_EXPIRES_IN || '15m'
                            }
                        }
                    })];
            case 4:
                error_1 = _b.sent();
                console.error('Login error:', error_1);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: 'Internal server error'
                    })];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.login = login;
var logout = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            // In a real implementation, you might want to blacklist the refresh token
            // For now, we'll just return a success response
            res.json({
                success: true,
                message: 'Logout successful'
            });
        }
        catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
        return [2 /*return*/];
    });
}); };
exports.logout = logout;
var refreshToken = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var refreshToken_2, decoded, user, payload, newAccessToken, newRefreshToken, error_2, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                refreshToken_2 = req.body.refreshToken;
                if (!refreshToken_2) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            message: 'Refresh token is required'
                        })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                decoded = jwt_util_1.default.verifyRefreshToken(refreshToken_2);
                return [4 /*yield*/, user_model_1.default.findById(decoded.userId)];
            case 2:
                user = _a.sent();
                if (!user || user.status !== 'active') {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            message: 'Invalid or inactive user'
                        })];
                }
                payload = {
                    userId: user.id,
                    email: user.email,
                    role: user.role_id
                };
                newAccessToken = jwt_util_1.default.generateAccessToken(payload);
                newRefreshToken = jwt_util_1.default.generateRefreshToken(payload);
                return [2 /*return*/, res.json({
                        success: true,
                        message: 'Tokens refreshed successfully',
                        data: {
                            tokens: {
                                accessToken: newAccessToken,
                                refreshToken: newRefreshToken,
                                expiresIn: process.env.JWT_EXPIRES_IN || '15m'
                            }
                        }
                    })];
            case 3:
                error_2 = _a.sent();
                return [2 /*return*/, res.status(403).json({
                        success: false,
                        message: 'Invalid or expired refresh token'
                    })];
            case 4: return [3 /*break*/, 6];
            case 5:
                error_3 = _a.sent();
                console.error('Refresh token error:', error_3);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: 'Internal server error'
                    })];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.refreshToken = refreshToken;
var getPermissions = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var permissions, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!req.currentUser) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            message: 'Authentication required'
                        })];
                }
                return [4 /*yield*/, permission_service_1.default.generatePermissionManifest(req.currentUser.id)];
            case 1:
                permissions = _a.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: 'Permissions retrieved successfully',
                        data: {
                            permissions: permissions
                        }
                    })];
            case 2:
                error_4 = _a.sent();
                console.error('Get permissions error:', error_4);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: 'Internal server error'
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getPermissions = getPermissions;
