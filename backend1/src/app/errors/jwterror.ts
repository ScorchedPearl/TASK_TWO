import { JWTErrorType } from "../auth_interface";

export class JWTError extends Error {
  constructor(
    public readonly type: JWTErrorType,
    message: string,
    public readonly statusCode: number = 401
  ) {
    super(message);
    this.name = 'JWTError';
  }
}