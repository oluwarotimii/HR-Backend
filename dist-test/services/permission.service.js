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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var user_model_1 = require("../models/user.model");
var user_permission_model_1 = require("../models/user-permission.model");
var role_permission_model_1 = require("../models/role-permission.model");
var PermissionService = /** @class */ (function () {
    function PermissionService() {
    }
    /**
     * Checks if a user has a specific permission
     * User-specific permissions take precedence over role-based permissions
     */
    PermissionService.hasPermission = function (userId, permission) {
        return __awaiter(this, void 0, void 0, function () {
            var userPermission, user, rolePermission;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, user_permission_model_1.default.findByUserAndPermission(userId, permission)];
                    case 1:
                        userPermission = _a.sent();
                        if (userPermission) {
                            // User has an explicit permission, return it
                            return [2 /*return*/, {
                                    hasPermission: userPermission.allow_deny === 'allow',
                                    source: 'user',
                                    allowDeny: userPermission.allow_deny
                                }];
                        }
                        return [4 /*yield*/, user_model_1.default.findById(userId)];
                    case 2:
                        user = _a.sent();
                        if (!user) {
                            return [2 /*return*/, {
                                    hasPermission: false,
                                    source: 'none',
                                    allowDeny: null
                                }];
                        }
                        return [4 /*yield*/, role_permission_model_1.default.findByRoleAndPermission(user.role_id, permission)];
                    case 3:
                        rolePermission = _a.sent();
                        if (rolePermission) {
                            // Role has the permission
                            return [2 /*return*/, {
                                    hasPermission: rolePermission.allow_deny === 'allow',
                                    source: 'role',
                                    allowDeny: rolePermission.allow_deny
                                }];
                        }
                        // No permission found anywhere
                        return [2 /*return*/, {
                                hasPermission: false,
                                source: 'none',
                                allowDeny: null
                            }];
                }
            });
        });
    };
    /**
     * Gets all permissions for a user (combining role and user-specific permissions)
     */
    PermissionService.getAllUserPermissions = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var user, userPermissions, userPermList, rolePermissions, rolePermList;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, user_model_1.default.findById(userId)];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, user_permission_model_1.default.getUserPermissions(userId)];
                    case 2:
                        userPermissions = _a.sent();
                        userPermList = userPermissions.map(function (perm) { return ({
                            permission: perm.permission,
                            source: 'user',
                            allowDeny: perm.allow_deny
                        }); });
                        return [4 /*yield*/, role_permission_model_1.default.getRolePermissions(user.role_id)];
                    case 3:
                        rolePermissions = _a.sent();
                        rolePermList = rolePermissions
                            .filter(function (rp) { return !userPermList.some(function (up) { return up.permission === rp.permission; }); }) // Exclude if already defined in user perms
                            .map(function (perm) { return ({
                            permission: perm.permission,
                            source: 'role',
                            allowDeny: perm.allow_deny
                        }); });
                        return [2 /*return*/, __spreadArray(__spreadArray([], userPermList, true), rolePermList, true)];
                }
            });
        });
    };
    /**
     * Generates a permission manifest for a user
     * This would be sent to the frontend to determine which UI elements to show
     */
    PermissionService.generatePermissionManifest = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var allPermissions, manifest;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAllUserPermissions(userId)];
                    case 1:
                        allPermissions = _a.sent();
                        manifest = {};
                        allPermissions.forEach(function (perm) {
                            manifest[perm.permission] = perm.allowDeny === 'allow';
                        });
                        return [2 /*return*/, manifest];
                }
            });
        });
    };
    return PermissionService;
}());
exports.default = PermissionService;
