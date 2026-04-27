"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTemporaryPassword = void 0;
const generateTemporaryPassword = (length = 12) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};
exports.generateTemporaryPassword = generateTemporaryPassword;
//# sourceMappingURL=password-utils.js.map