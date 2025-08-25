export interface GoogleTokenResult {
 email:string;
 email_verified:string;
 given_name:string;
 name:string;
 picture:string;
 id:string
}
export interface JWTPayload extends JWTUser{
 [key: string]: any; 
}
export interface JWTUser{
 id: string;
 email: string;
 expiresAt: Date;
 name:string;
 issuedAt: Date;
 tokenId: string;
}
export interface GraphqlContext{
 user?: JWTUser
}

export interface User{
 name: string;
 email: string;
 id: string;
 profileImage?: string | undefined;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}


export enum JWTErrorType {
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  MALFORMED_TOKEN = 'MALFORMED_TOKEN',
  MISSING_SECRET = 'MISSING_SECRET'
}

export interface AuthResult {
  user: User;
  tokens: TokenPair;
}

export interface PasswordResetToken {
  userId: string;
  token: string;
  expiresAt: Date;
}