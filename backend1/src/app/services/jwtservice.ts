import { SignJWT, jwtVerify } from "jose";
import * as dotenv from "dotenv";
import type { JWTVerifyResult } from "jose";
import type { JWTUser, JWTPayload } from "../auth_interface";
import { JWTErrorType as ErrorType } from "../auth_interface";
import { JWTError as JWTErrorClass } from "../errors/jwterror";
dotenv.config();
class JWTService {
  private static instance: JWTService;
  private readonly encodedKey: Uint8Array;

  private constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      throw new JWTErrorClass(
        ErrorType.MISSING_SECRET,
        'env bhul gya jwt_secret ni milra mereko',
        500
      );
    }
    this.encodedKey = new TextEncoder().encode(secret);
  }

  public static getInstance(): JWTService {
    if (!JWTService.instance) {
      JWTService.instance = new JWTService();
    }
    return JWTService.instance;
  }


  public async encode(payload: JWTPayload, expiry: string): Promise<string> {
    try {
      return new SignJWT(payload as any)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiry)
        .sign(this.encodedKey);
    } catch (error) {
      console.error('Token encoding failed:', error);
      throw new JWTErrorClass(
        ErrorType.INVALID_TOKEN,
        'Failed to encode token',
        500
      );
    }
  }

  public async decode(token: string): Promise<JWTUser> {
    if (!token?.trim()) {
      throw new JWTErrorClass(
        ErrorType.MALFORMED_TOKEN,
        'header me token dalde bhai'
      );
    }

    try {
      const { payload }: JWTVerifyResult = await jwtVerify(token, this.encodedKey, {
        algorithms: ['HS256']
      });

      const jwtPayload = payload as unknown as JWTPayload;

      if (!jwtPayload.id || !jwtPayload.email || !jwtPayload.name) {
        throw new JWTErrorClass(
          ErrorType.INVALID_TOKEN,
          'glt token format, missing required fields'
        );
      }

      return {
        id: jwtPayload.id,
        email: jwtPayload.email,
        name: jwtPayload.name,
        expiresAt: new Date((jwtPayload.exp || 0) * 1000),
        issuedAt: new Date((jwtPayload.iat || 0) * 1000),
        tokenId: jwtPayload.jti || 'unknown'
      };
    } catch (error: any) {
      console.error('Token validation failed:', error.message);
      
      if (error instanceof JWTErrorClass) {
        throw error;
      }

      if (error.code === 'ERR_JWT_EXPIRED') {
        throw new JWTErrorClass(
          ErrorType.TOKEN_EXPIRED,
          'Expiry'
        );
      }

      if (error.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
        throw new JWTErrorClass(
          ErrorType.INVALID_SIGNATURE,
          'Signed Wrong'
        );
      }

      throw new JWTErrorClass(
        ErrorType.INVALID_TOKEN,
        'Invalid'
      );
    }
  }
 }
 export default JWTService;