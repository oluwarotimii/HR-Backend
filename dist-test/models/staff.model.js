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
var StaffModel = /** @class */ (function () {
    function StaffModel() {
    }
    StaffModel.findAll = function () {
        return __awaiter(this, arguments, void 0, function (limit, offset, branchId) {
            var query, params, rows, countQuery, countParams, countResult, totalCount;
            if (limit === void 0) { limit = 20; }
            if (offset === void 0) { offset = 0; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "SELECT * FROM ".concat(this.tableName);
                        params = [];
                        if (branchId) {
                            query += ' WHERE branch_id = ?';
                            params.push(branchId);
                        }
                        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
                        params.push(limit, offset);
                        return [4 /*yield*/, database_1.pool.execute(query, params)];
                    case 1:
                        rows = (_a.sent())[0];
                        countQuery = "SELECT COUNT(*) as count FROM ".concat(this.tableName);
                        countParams = [];
                        if (branchId) {
                            countQuery += ' WHERE branch_id = ?';
                            countParams.push(branchId);
                        }
                        return [4 /*yield*/, database_1.pool.execute(countQuery, countParams)];
                    case 2:
                        countResult = (_a.sent())[0];
                        totalCount = countResult[0].count;
                        return [2 /*return*/, {
                                staff: rows,
                                totalCount: totalCount
                            }];
                }
            });
        });
    };
    StaffModel.findById = function (id) {
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
    StaffModel.findByUserId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.pool.execute("SELECT * FROM ".concat(this.tableName, " WHERE user_id = ?"), [userId])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows[0] || null];
                }
            });
        });
    };
    StaffModel.findByEmployeeId = function (employeeId) {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.pool.execute("SELECT * FROM ".concat(this.tableName, " WHERE employee_id = ?"), [employeeId])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows[0] || null];
                }
            });
        });
    };
    StaffModel.create = function (staffData) {
        return __awaiter(this, void 0, void 0, function () {
            var result, insertedId, createdItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.pool.execute("INSERT INTO ".concat(this.tableName, " (user_id, employee_id, designation, department, branch_id, joining_date, employment_type)\n       VALUES (?, ?, ?, ?, ?, ?, ?)"), [
                            staffData.user_id,
                            staffData.employee_id,
                            staffData.designation,
                            staffData.department,
                            staffData.branch_id,
                            staffData.joining_date,
                            staffData.employment_type || 'full_time'
                        ])];
                    case 1:
                        result = (_a.sent())[0];
                        insertedId = result.insertId;
                        return [4 /*yield*/, this.findById(insertedId)];
                    case 2:
                        createdItem = _a.sent();
                        if (!createdItem) {
                            throw new Error('Failed to create staff');
                        }
                        return [2 /*return*/, createdItem];
                }
            });
        });
    };
    StaffModel.update = function (id, staffData) {
        return __awaiter(this, void 0, void 0, function () {
            var updates, values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updates = [];
                        values = [];
                        if (staffData.employee_id !== undefined) {
                            updates.push('employee_id = ?');
                            values.push(staffData.employee_id);
                        }
                        if (staffData.designation !== undefined) {
                            updates.push('designation = ?');
                            values.push(staffData.designation);
                        }
                        if (staffData.department !== undefined) {
                            updates.push('department = ?');
                            values.push(staffData.department);
                        }
                        if (staffData.branch_id !== undefined) {
                            updates.push('branch_id = ?');
                            values.push(staffData.branch_id);
                        }
                        if (staffData.joining_date !== undefined) {
                            updates.push('joining_date = ?');
                            values.push(staffData.joining_date);
                        }
                        if (staffData.employment_type !== undefined) {
                            updates.push('employment_type = ?');
                            values.push(staffData.employment_type);
                        }
                        if (staffData.status !== undefined) {
                            updates.push('status = ?');
                            values.push(staffData.status);
                        }
                        if (!(updates.length === 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.findById(id)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        values.push(id);
                        return [4 /*yield*/, database_1.pool.execute("UPDATE ".concat(this.tableName, " SET ").concat(updates.join(', '), " WHERE id = ?"), values)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.findById(id)];
                    case 4: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    StaffModel.delete = function (id) {
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
    // Soft delete - deactivate staff
    StaffModel.deactivate = function (id) {
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
    // Get staff by department
    StaffModel.findByDepartment = function (department, branchId) {
        return __awaiter(this, void 0, void 0, function () {
            var query, params, rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "SELECT * FROM ".concat(this.tableName, " WHERE department = ?");
                        params = [department];
                        if (branchId) {
                            query += ' AND branch_id = ?';
                            params.push(branchId.toString());
                        }
                        return [4 /*yield*/, database_1.pool.execute(query, params)];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows];
                }
            });
        });
    };
    // Get staff by branch
    StaffModel.findByBranch = function (branchId) {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.pool.execute("SELECT * FROM ".concat(this.tableName, " WHERE branch_id = ?"), [branchId.toString()])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows];
                }
            });
        });
    };
    StaffModel.tableName = 'staff';
    return StaffModel;
}());
exports.default = StaffModel;
