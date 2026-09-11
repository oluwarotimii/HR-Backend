"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenVerificationError = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in the environment — refusing to start with a default/fallback secret.');
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
class TokenVerificationError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'TokenVerificationError';
    }
}
exports.TokenVerificationError = TokenVerificationError;
function durationToSeconds(duration) {
    const match = /^(\d+)\s*(s|m|h|d)$/.exec(duration.trim());
    if (!match)
        return 7 * 24 * 60 * 60;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * multipliers[unit];
}
class JwtUtil {
    static generateAccessToken(payload, jti) {
        const options = { expiresIn: JWT_EXPIRES_IN, jwtid: jti };
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
    }
    static generateRefreshToken(payload, jti) {
        const options = { expiresIn: JWT_REFRESH_EXPIRES_IN, jwtid: jti };
        return jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, options);
    }
    static verifyAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (error) {
            if (error?.name === 'TokenExpiredError') {
                throw new TokenVerificationError('TOKEN_EXPIRED', 'Access token has expired');
            }
            throw new TokenVerificationError('TOKEN_INVALID', 'Invalid access token');
        }
    }
    static verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
        }
        catch (error) {
            if (error?.name === 'TokenExpiredError') {
                throw new TokenVerificationError('TOKEN_EXPIRED', 'Refresh token has expired');
            }
            throw new TokenVerificationError('TOKEN_INVALID', 'Invalid refresh token');
        }
    }
    static decodeToken(token) {
        return jsonwebtoken_1.default.decode(token);
    }
    static get accessTokenTtlSeconds() {
        return durationToSeconds(JWT_EXPIRES_IN);
    }
    static get refreshTokenTtlSeconds() {
        return durationToSeconds(JWT_REFRESH_EXPIRES_IN);
    }
}
exports.default = JwtUtil;
//# sourceMappingURL=jwt.util.js.map