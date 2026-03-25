import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
class JwtUtil {
    static generateAccessToken(payload) {
        const options = { expiresIn: JWT_EXPIRES_IN };
        return jwt.sign(payload, JWT_SECRET, options);
    }
    static generateRefreshToken(payload) {
        const options = { expiresIn: JWT_REFRESH_EXPIRES_IN };
        return jwt.sign(payload, JWT_REFRESH_SECRET, options);
    }
    static verifyAccessToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        }
        catch (error) {
            throw new Error('Invalid access token');
        }
    }
    static verifyRefreshToken(token) {
        try {
            return jwt.verify(token, JWT_REFRESH_SECRET);
        }
        catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
    static decodeToken(token) {
        return jwt.decode(token);
    }
}
export default JwtUtil;
//# sourceMappingURL=jwt.util.js.map