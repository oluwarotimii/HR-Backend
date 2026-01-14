"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsonwebtoken_1 = require("jsonwebtoken");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';
var JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
var JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
var JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
var JwtUtil = /** @class */ (function () {
    function JwtUtil() {
    }
    JwtUtil.generateAccessToken = function (payload) {
        var options = { expiresIn: JWT_EXPIRES_IN };
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
    };
    JwtUtil.generateRefreshToken = function (payload) {
        var options = { expiresIn: JWT_REFRESH_EXPIRES_IN };
        return jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, options);
    };
    JwtUtil.verifyAccessToken = function (token) {
        try {
            return jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (error) {
            throw new Error('Invalid access token');
        }
    };
    JwtUtil.verifyRefreshToken = function (token) {
        try {
            return jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
        }
        catch (error) {
            throw new Error('Invalid refresh token');
        }
    };
    JwtUtil.decodeToken = function (token) {
        return jsonwebtoken_1.default.decode(token);
    };
    return JwtUtil;
}());
exports.default = JwtUtil;
