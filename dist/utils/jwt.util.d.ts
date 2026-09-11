interface TokenPayload {
    userId: number;
    email: string;
    role: number;
}
interface DecodedToken extends TokenPayload {
    jti: string;
    iat: number;
    exp: number;
}
export type TokenErrorCode = 'TOKEN_EXPIRED' | 'TOKEN_INVALID';
export declare class TokenVerificationError extends Error {
    code: TokenErrorCode;
    constructor(code: TokenErrorCode, message: string);
}
declare class JwtUtil {
    static generateAccessToken(payload: TokenPayload, jti: string): string;
    static generateRefreshToken(payload: TokenPayload, jti: string): string;
    static verifyAccessToken(token: string): DecodedToken;
    static verifyRefreshToken(token: string): DecodedToken;
    static decodeToken(token: string): any;
    static get accessTokenTtlSeconds(): number;
    static get refreshTokenTtlSeconds(): number;
}
export default JwtUtil;
//# sourceMappingURL=jwt.util.d.ts.map