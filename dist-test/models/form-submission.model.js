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
var FormSubmissionModel = /** @class */ (function () {
    function FormSubmissionModel() {
    }
    FormSubmissionModel.findAll = function (formId, userId, status) {
        return __awaiter(this, void 0, void 0, function () {
            var query, params, conditions, rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "SELECT * FROM ".concat(this.tableName);
                        params = [];
                        conditions = [];
                        if (formId) {
                            conditions.push('form_id = ?');
                            params.push(formId);
                        }
                        if (userId) {
                            conditions.push('user_id = ?');
                            params.push(userId);
                        }
                        if (status) {
                            conditions.push('status = ?');
                            params.push(status);
                        }
                        if (conditions.length > 0) {
                            query += ' WHERE ' + conditions.join(' AND ');
                        }
                        query += ' ORDER BY submitted_at DESC';
                        return [4 /*yield*/, database_1.pool.execute(query, params)];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows];
                }
            });
        });
    };
    FormSubmissionModel.findById = function (id) {
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
    FormSubmissionModel.findByFormId = function (formId) {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.pool.execute("SELECT * FROM ".concat(this.tableName, " WHERE form_id = ? ORDER BY submitted_at DESC"), [formId])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows];
                }
            });
        });
    };
    FormSubmissionModel.findByUserId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.pool.execute("SELECT * FROM ".concat(this.tableName, " WHERE user_id = ? ORDER BY submitted_at DESC"), [userId])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows];
                }
            });
        });
    };
    FormSubmissionModel.findByStatus = function (status) {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.pool.execute("SELECT * FROM ".concat(this.tableName, " WHERE status = ? ORDER BY submitted_at DESC"), [status])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows];
                }
            });
        });
    };
    FormSubmissionModel.create = function (submissionData) {
        return __awaiter(this, void 0, void 0, function () {
            var result, insertedId, createdItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.pool.execute("INSERT INTO ".concat(this.tableName, " (form_id, user_id, submission_data, status, notes) \n       VALUES (?, ?, ?, ?, ?)"), [
                            submissionData.form_id,
                            submissionData.user_id,
                            JSON.stringify(submissionData.submission_data),
                            submissionData.status || 'submitted',
                            submissionData.notes
                        ])];
                    case 1:
                        result = (_a.sent())[0];
                        insertedId = result.insertId;
                        return [4 /*yield*/, this.findById(insertedId)];
                    case 2:
                        createdItem = _a.sent();
                        if (!createdItem) {
                            throw new Error('Failed to create form submission');
                        }
                        return [2 /*return*/, createdItem];
                }
            });
        });
    };
    FormSubmissionModel.update = function (id, submissionData) {
        return __awaiter(this, void 0, void 0, function () {
            var updates, values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updates = [];
                        values = [];
                        if (submissionData.status !== undefined) {
                            updates.push('status = ?');
                            values.push(submissionData.status);
                        }
                        if (submissionData.reviewed_by !== undefined) {
                            updates.push('reviewed_by = ?');
                            values.push(submissionData.reviewed_by);
                        }
                        if (submissionData.reviewed_at !== undefined) {
                            updates.push('reviewed_at = ?');
                            values.push(submissionData.reviewed_at);
                        }
                        if (submissionData.notes !== undefined) {
                            updates.push('notes = ?');
                            values.push(submissionData.notes);
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
    FormSubmissionModel.delete = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.pool.execute("DELETE FROM ".concat(this.tableName, " WHERE id = ?"), [id])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.affectedRows > 0];
                }
            });
        });
    };
    FormSubmissionModel.tableName = 'form_submissions';
    return FormSubmissionModel;
}());
exports.default = FormSubmissionModel;
