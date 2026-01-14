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
var database_1 = require("../config/database");
var AuditLogModel = /** @class */ (function () {
    function AuditLogModel() {
    }
    AuditLogModel.findAll = function () {
        return __awaiter(this, arguments, void 0, function (limit, offset) {
            var rows;
            if (limit === void 0) { limit = 20; }
            if (offset === void 0) { offset = 0; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.pool.execute("SELECT * FROM ".concat(this.tableName, " ORDER BY created_at DESC LIMIT ? OFFSET ?"), [limit, offset])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows];
                }
            });
        });
    };
    AuditLogModel.findById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.pool.execute("SELECT * FROM ".concat(this.tableName, " WHERE id = ?"), [id])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows[0] || null];
                }
            });
        });
    };
    AuditLogModel.findByEntity = function (entityType, entityId) {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.pool.execute("SELECT * FROM ".concat(this.tableName, " WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC"), [entityType, entityId])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows];
                }
            });
        });
    };
    AuditLogModel.findByUser = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.pool.execute("SELECT * FROM ".concat(this.tableName, " WHERE user_id = ? ORDER BY created_at DESC"), [userId])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows];
                }
            });
        });
    };
    AuditLogModel.findByAction = function (action) {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.pool.execute("SELECT * FROM ".concat(this.tableName, " WHERE action = ? ORDER BY created_at DESC"), [action])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows];
                }
            });
        });
    };
    AuditLogModel.create = function (logData) {
        return __awaiter(this, void 0, void 0, function () {
            var result, insertedId, createdItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.pool.execute("INSERT INTO ".concat(this.tableName, " (user_id, action, entity_type, entity_id, before_data, after_data, ip_address, user_agent)\n       VALUES (?, ?, ?, ?, ?, ?, ?, ?)"), [
                            logData.user_id,
                            logData.action,
                            logData.entity_type,
                            logData.entity_id,
                            logData.before_data ? JSON.stringify(logData.before_data) : null,
                            logData.after_data ? JSON.stringify(logData.after_data) : null,
                            logData.ip_address,
                            logData.user_agent
                        ])];
                    case 1:
                        result = (_a.sent())[0];
                        insertedId = result.insertId;
                        return [4 /*yield*/, this.findById(insertedId)];
                    case 2:
                        createdItem = _a.sent();
                        if (!createdItem) {
                            throw new Error('Failed to create audit log');
                        }
                        return [2 /*return*/, createdItem];
                }
            });
        });
    };
    // Create a log for staff operations
    AuditLogModel.logStaffOperation = function (userId, action, staffId, beforeData, afterData, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function () {
            var logData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logData = {
                            user_id: userId,
                            action: action,
                            entity_type: 'staff',
                            entity_id: staffId,
                            before_data: beforeData,
                            after_data: afterData,
                            ip_address: ipAddress,
                            user_agent: userAgent
                        };
                        return [4 /*yield*/, this.create(logData)];
                    case 1:
                        result = _a.sent();
                        if (!result) {
                            throw new Error('Failed to create audit log');
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    AuditLogModel.tableName = 'audit_logs';
    return AuditLogModel;
}());
exports.default = AuditLogModel;
