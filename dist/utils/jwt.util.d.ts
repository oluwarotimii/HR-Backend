interface TokenPayload {
    userId: number;
    email: string;
    role: number;
}
declare class JwtUtil {
    static generateAccessToken(payload: TokenPayload): string;
    static generateRefreshToken(payload: TokenPayload): string;
    static verifyAccessToken(token: string): any;
    static verifyRefreshToken(token: string): any;
    static decodeToken(token: string): any;
}
export default JwtUtil;
//# sourceMappingURL=jwt.util.d.ts.map