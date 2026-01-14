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
var FormFieldModel = /** @class */ (function () {
    function FormFieldModel() {
    }
    FormFieldModel.findAll = function (formId) {
        return __awaiter(this, void 0, void 0, function () {
            var query, params, rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "SELECT * FROM ".concat(this.tableName);
                        params = [];
                        if (formId) {
                            query += ' WHERE form_id = ?';
                            params.push(formId);
                        }
                        query += ' ORDER BY field_order ASC';
                        return [4 /*yield*/, database_1.pool.execute(query, params)];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows];
                }
            });
        });
    };
    FormFieldModel.findById = function (id) {
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
    FormFieldModel.findByFormId = function (formId) {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.pool.execute("SELECT * FROM ".concat(this.tableName, " WHERE form_id = ? ORDER BY field_order ASC"), [formId])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows];
                }
            });
        });
    };
    FormFieldModel.findByFormAndName = function (formId, fieldName) {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.pool.execute("SELECT * FROM ".concat(this.tableName, " WHERE form_id = ? AND field_name = ?"), [formId, fieldName])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows[0] || null];
                }
            });
        });
    };
    FormFieldModel.create = function (fieldData) {
        return __awaiter(this, void 0, void 0, function () {
            var result, insertedId, createdItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.pool.execute("INSERT INTO ".concat(this.tableName, " (form_id, field_name, field_label, field_type, is_required, placeholder, help_text, validation_rule, options, field_order) \n       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"), [
                            fieldData.form_id,
                            fieldData.field_name,
                            fieldData.field_label,
                            fieldData.field_type,
                            fieldData.is_required || false,
                            fieldData.placeholder,
                            fieldData.help_text,
                            fieldData.validation_rule,
                            fieldData.options ? JSON.stringify(fieldData.options) : null,
                            fieldData.field_order
                        ])];
                    case 1:
                        result = (_a.sent())[0];
                        insertedId = result.insertId;
                        return [4 /*yield*/, this.findById(insertedId)];
                    case 2:
                        createdItem = _a.sent();
                        if (!createdItem) {
                            throw new Error('Failed to create form field');
                        }
                        return [2 /*return*/, createdItem];
                }
            });
        });
    };
    FormFieldModel.update = function (id, fieldData) {
        return __awaiter(this, void 0, void 0, function () {
            var updates, values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updates = [];
                        values = [];
                        if (fieldData.field_name !== undefined) {
                            updates.push('field_name = ?');
                            values.push(fieldData.field_name);
                        }
                        if (fieldData.field_label !== undefined) {
                            updates.push('field_label = ?');
                            values.push(fieldData.field_label);
                        }
                        if (fieldData.field_type !== undefined) {
                            updates.push('field_type = ?');
                            values.push(fieldData.field_type);
                        }
                        if (fieldData.is_required !== undefined) {
                            updates.push('is_required = ?');
                            values.push(fieldData.is_required);
                        }
                        if (fieldData.placeholder !== undefined) {
                            updates.push('placeholder = ?');
                            values.push(fieldData.placeholder);
                        }
                        if (fieldData.help_text !== undefined) {
                            updates.push('help_text = ?');
                            values.push(fieldData.help_text);
                        }
                        if (fieldData.validation_rule !== undefined) {
                            updates.push('validation_rule = ?');
                            values.push(fieldData.validation_rule);
                        }
                        if (fieldData.options !== undefined) {
                            updates.push('options = ?');
                            values.push(fieldData.options ? JSON.stringify(fieldData.options) : null);
                        }
                        if (fieldData.field_order !== undefined) {
                            updates.push('field_order = ?');
                            values.push(fieldData.field_order);
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
    FormFieldModel.delete = function (id) {
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
    // Delete all fields for a specific form
    FormFieldModel.deleteByFormId = function (formId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.pool.execute("DELETE FROM ".concat(this.tableName, " WHERE form_id = ?"), [formId])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.affectedRows > 0];
                }
            });
        });
    };
    FormFieldModel.tableName = 'form_fields';
    return FormFieldModel;
}());
exports.default = FormFieldModel;
