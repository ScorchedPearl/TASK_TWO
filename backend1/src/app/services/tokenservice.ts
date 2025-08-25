import { randomBytes } from "crypto";
import JWTService from "./jwtservice";
import type { User, TokenPair, JWTUser, JWTPayload } from "../auth_interface";
import { JWTErrorType as ErrorType } from "../auth_interface";
import { JWTError as JWTErrorClass } from "../errors/jwterror";
import * as dotenv from "dotenv";
dotenv.config();
class TokenService {
  private static instance: TokenService;
  private readonly jwtService: JWTService;
  private readonly config: {
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
  };

  private constructor() {
    this.jwtService = JWTService.getInstance();
    this.config = {
      accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
      refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
    };
  }

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  public async generateTokenPair(user: User): Promise<TokenPair> {
    try {
      const tokenId = this.generateTokenId();

      const accessPayload: JWTPayload = {
       id: user.id,
       email: user.email,
       name: user.name,
       tokenType: 'access',
       jti: tokenId,
       expiresAt: new Date(Date.now() + this.parseExpiryToSeconds(this.config.accessTokenExpiry) * 1000),
       issuedAt: new Date(Date.now()),
       tokenId: tokenId
      };

      const refreshPayload: JWTPayload = {
       id: user.id,
       email: user.email,
       name: user.name,
       tokenType: 'refresh',
       jti: `${tokenId}_refresh`,
       expiresAt: new Date(Date.now() + this.parseExpiryToSeconds(this.config.refreshTokenExpiry) * 1000),
       issuedAt: new Date(Date.now()),
       tokenId: tokenId
      };

      const accessToken = await this.jwtService.encode(accessPayload, this.config.accessTokenExpiry);
      const refreshToken = await this.jwtService.encode(refreshPayload, this.config.refreshTokenExpiry);

      const expiresIn = this.parseExpiryToSeconds(this.config.accessTokenExpiry);

      return {
        accessToken,
        refreshToken,
        expiresIn,
        tokenType: 'Bearer'
      };
    } catch (error) {
      console.error('Token pair generation failed:', error);
      throw new JWTErrorClass(
        ErrorType.INVALID_TOKEN,
        'Failed to generate token pair',
        500
      );
    }
  }

  public async generateAccessToken(user: User): Promise<string> {
    const tokenPair = await this.generateTokenPair(user);
    return tokenPair.accessToken;
  }

  public async validateAccessToken(token: string): Promise<JWTUser> {
    const decoded = await this.jwtService.decode(token);
    return decoded;
  }
  public async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    const decoded = await this.jwtService.decode(refreshToken);
    
    if (!decoded || !decoded.id) {
      throw new JWTErrorClass(
        ErrorType.INVALID_TOKEN,
        'Invalid refresh token'
      );
    }
    const user: User = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name
    };

    return await this.generateTokenPair(user);
  }
  public extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
  public isTokenExpiringSoon(user: JWTUser): boolean {
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    return user.expiresAt <= fiveMinutesFromNow;
  }

  private generateTokenId(): string {
    return randomBytes(16).toString('hex');
  }

  private parseExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 900; 

    const [, value, unit] = match;
    const num = parseInt(value!, 10);

    switch (unit) {
      case 's': return num;
      case 'm': return num * 60;
      case 'h': return num * 60 * 60;
      case 'd': return num * 60 * 60 * 24;
      default: return 900;
    }
  }
}

export default TokenService;