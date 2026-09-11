declare class TokenDenylistService {
    revoke(jti: string, ttlSeconds: number): Promise<void>;
    isRevoked(jti: string): Promise<boolean>;
}
export declare const tokenDenylistService: TokenDenylistService;
export {};
//# sourceMappingURL=token-denylist.service.d.ts.map