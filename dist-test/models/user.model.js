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
var bcryptjs_1 = require("bcryptjs");
var UserModel = /** @class */ (function () {
    function UserModel() {
    }
    UserModel.findAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.pool.execute("SELECT * FROM ".concat(this.tableName, " ORDER BY created_at DESC"))];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows];
                }
            });
        });
    };
    UserModel.findById = function (id) {
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
    UserModel.findByEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.pool.execute("SELECT * FROM ".concat(this.tableName, " WHERE email = ?"), [email])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows[0] || null];
                }
            });
        });
    };
    UserModel.create = function (userData) {
        return __awaiter(this, void 0, void 0, function () {
            var hashedPassword, result, insertedId, createdItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, bcryptjs_1.default.hash(userData.password, 10)];
                    case 1:
                        hashedPassword = _a.sent();
                        return [4 /*yield*/, database_1.pool.execute("INSERT INTO ".concat(this.tableName, " (email, password_hash, full_name, phone, role_id, branch_id, status)\n       VALUES (?, ?, ?, ?, ?, ?, 'active')"), [
                                userData.email,
                                hashedPassword,
                                userData.full_name,
                                userData.phone,
                                userData.role_id,
                                userData.branch_id
                            ])];
                    case 2:
                        result = (_a.sent())[0];
                        insertedId = result.insertId;
                        return [4 /*yield*/, this.findById(insertedId)];
                    case 3:
                        createdItem = _a.sent();
                        if (!createdItem) {
                            throw new Error('Failed to create user');
                        }
                        return [2 /*return*/, createdItem];
                }
            });
        });
    };
    UserModel.update = function (id, userData) {
        return __awaiter(this, void 0, void 0, function () {
            var updates, values, hashedPassword;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updates = [];
                        values = [];
                        if (userData.email !== undefined) {
                            updates.push('email = ?');
                            values.push(userData.email);
                        }
                        if (!(userData.password !== undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, bcryptjs_1.default.hash(userData.password, 10)];
                    case 1:
                        hashedPassword = _a.sent();
                        updates.push('password_hash = ?');
                        values.push(hashedPassword);
                        _a.label = 2;
                    case 2:
                        if (userData.full_name !== undefined) {
                            updates.push('full_name = ?');
                            values.push(userData.full_name);
                        }
                        if (userData.phone !== undefined) {
                            updates.push('phone = ?');
                            values.push(userData.phone);
                        }
                        if (userData.role_id !== undefined) {
                            updates.push('role_id = ?');
                            values.push(userData.role_id);
                        }
                        if (userData.branch_id !== undefined) {
                            updates.push('branch_id = ?');
                            values.push(userData.branch_id);
                        }
                        if (userData.status !== undefined) {
                            updates.push('status = ?');
                            values.push(userData.status);
                        }
                        if (updates.length === 0) {
                            return [2 /*return*/, this.findById(id)];
                        }
                        values.push(id);
                        return [4 /*yield*/, database_1.pool.execute("UPDATE ".concat(this.tableName, " SET ").concat(updates.join(', '), " WHERE id = ?"), values)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.findById(id)];
                }
            });
        });
    };
    UserModel.delete = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.pool.execute("UPDATE ".concat(this.tableName, " SET status = 'inactive' WHERE id = ?"), [id])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.affectedRows > 0];
                }
            });
        });
    };
    UserModel.softDelete = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.pool.execute("UPDATE ".concat(this.tableName, " SET status = 'terminated' WHERE id = ?"), [id])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.affectedRows > 0];
                }
            });
        });
    };
    UserModel.comparePassword = function (inputPassword, hashedPassword) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, bcryptjs_1.default.compare(inputPassword, hashedPassword)];
            });
        });
    };
    UserModel.tableName = 'users';
    return UserModel;
}());
exports.default = UserModel;
