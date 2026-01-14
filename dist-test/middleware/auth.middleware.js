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
exports.attachPermissions = exports.checkPermission = exports.authenticateJWT = void 0;
var jwt_util_1 = require("../utils/jwt.util");
var user_model_1 = require("../models/user.model");
var permission_service_1 = require("../services/permission.service");
var authenticateJWT = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var authHeader, token, decoded, user, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                authHeader = req.headers.authorization;
                token = authHeader && authHeader.split(' ')[1];
                if (!token) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            message: 'Access token is required'
                        })];
                }
                decoded = jwt_util_1.default.verifyAccessToken(token);
                return [4 /*yield*/, user_model_1.default.findById(decoded.userId)];
            case 1:
                user = _a.sent();
                if (!user || user.status !== 'active') {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            message: 'Invalid or inactive user'
                        })];
                }
                // Attach user info to request object
                req.currentUser = {
                    id: user.id,
                    email: user.email,
                    role_id: user.role_id,
                    branch_id: user.branch_id
                };
                return [2 /*return*/, next()];
            case 2:
                error_1 = _a.sent();
                console.error('Authentication error:', error_1);
                return [2 /*return*/, res.status(403).json({
                        success: false,
                        message: 'Invalid or expired token'
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.authenticateJWT = authenticateJWT;
// Higher-order function to create permission check middleware
var checkPermission = function (permission) {
    return function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var permissionResult, error_2;
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
                    return [4 /*yield*/, permission_service_1.default.hasPermission(req.currentUser.id, permission)];
                case 1:
                    permissionResult = _a.sent();
                    if (!permissionResult.hasPermission) {
                        return [2 /*return*/, res.status(403).json({
                                success: false,
                                message: "Insufficient permissions. Required: ".concat(permission),
                                requiredPermission: permission,
                                permissionSource: permissionResult.source
                            })];
                    }
                    return [2 /*return*/, next()];
                case 2:
                    error_2 = _a.sent();
                    console.error('Permission check error:', error_2);
                    return [2 /*return*/, res.status(500).json({
                            success: false,
                            message: 'Internal server error during permission check'
                        })];
                case 3: return [2 /*return*/];
            }
        });
    }); };
};
exports.checkPermission = checkPermission;
// Middleware to attach user permissions manifest to the request
var attachPermissions = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var permissions, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                if (!req.currentUser) return [3 /*break*/, 2];
                return [4 /*yield*/, permission_service_1.default.generatePermissionManifest(req.currentUser.id)];
            case 1:
                permissions = _a.sent();
                req.currentUser.permissions = permissions;
                _a.label = 2;
            case 2: return [2 /*return*/, next()];
            case 3:
                error_3 = _a.sent();
                console.error('Error attaching permissions:', error_3);
                return [2 /*return*/, next()];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.attachPermissions = attachPermissions;
