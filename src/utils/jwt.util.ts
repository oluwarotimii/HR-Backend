import jwt, { SignOptions } from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET: string | undefined = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET: string | undefined = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error(
    'JWT_SECRET and JWT_REFRESH_SECRET must be set in the environment — refusing to start with a default/fallback secret.'
  );
}

const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '2h';
const JWT_REFRESH_EXPIRES_IN: string = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

interface TokenPayload {
  userId: number;
  email: string;
  role: number; // Changed from string to number to match the usage
}

interface DecodedToken extends TokenPayload {
  jti: string;
  iat: number;
  exp: number;
}

export type TokenErrorCode = 'TOKEN_EXPIRED' | 'TOKEN_INVALID';

export class TokenVerificationError extends Error {
  code: TokenErrorCode;
  constructor(code: TokenErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'TokenVerificationError';
  }
}

// Parses the simple duration strings used by JWT_EXPIRES_IN / JWT_REFRESH_EXPIRES_IN
// (e.g. "2h", "7d", "90d") into seconds, for sizing the Redis denylist TTL.
function durationToSeconds(duration: string): number {
  const match = /^(\d+)\s*(s|m|h|d)$/.exec(duration.trim());
  if (!match) return 7 * 24 * 60 * 60; // sane fallback: 7 days
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return value * multipliers[unit];
}

class JwtUtil {
  static generateAccessToken(payload: TokenPayload, jti: string): string {
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any, jwtid: jti };
    return jwt.sign(payload, JWT_SECRET as string, options);
  }

  static generateRefreshToken(payload: TokenPayload, jti: string): string {
    const options: SignOptions = { expiresIn: JWT_REFRESH_EXPIRES_IN as any, jwtid: jti };
    return jwt.sign(payload, JWT_REFRESH_SECRET as string, options);
  }

  static verifyAccessToken(token: string): DecodedToken {
    try {
      return jwt.verify(token, JWT_SECRET as string) as DecodedToken;
    } catch (error: any) {
      if (error?.name === 'TokenExpiredError') {
        throw new TokenVerificationError('TOKEN_EXPIRED', 'Access token has expired');
      }
      throw new TokenVerificationError('TOKEN_INVALID', 'Invalid access token');
    }
  }

  static verifyRefreshToken(token: string): DecodedToken {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET as string) as DecodedToken;
    } catch (error: any) {
      if (error?.name === 'TokenExpiredError') {
        throw new TokenVerificationError('TOKEN_EXPIRED', 'Refresh token has expired');
      }
      throw new TokenVerificationError('TOKEN_INVALID', 'Invalid refresh token');
    }
  }

  static decodeToken(token: string): any {
    return jwt.decode(token);
  }

  static get accessTokenTtlSeconds(): number {
    return durationToSeconds(JWT_EXPIRES_IN);
  }

  static get refreshTokenTtlSeconds(): number {
    return durationToSeconds(JWT_REFRESH_EXPIRES_IN);
  }
}

export default JwtUtil;
