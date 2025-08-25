import { Request, Response, NextFunction } from 'express';
import TokenService from '../services/tokenservice';
import AuthService from '../services/authservice';
import { JWTError } from '../errors/jwterror';
import type { JWTUser } from '../auth_interface';

declare global {
  namespace Express {
    interface Request {
      user?: JWTUser;
    }
  }
}

class AuthMiddleware {
  private static instance: AuthMiddleware;
  private readonly tokenService: TokenService;
  private readonly authService: AuthService;

  private constructor() {
    this.tokenService = TokenService.getInstance();
    this.authService = AuthService.getInstance();
  }

  public static getInstance(): AuthMiddleware {
    if (!AuthMiddleware.instance) {
      AuthMiddleware.instance = new AuthMiddleware();
    }
    return AuthMiddleware.instance;
  }

  public authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = this.tokenService.extractTokenFromHeader(authHeader);

      if (!token) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'MISSING_TOKEN'
        });
        return;
      }

      const user = await this.tokenService.validateAccessToken(token);
      const existingUser = await this.authService.getUserById(user.id);
      if (!existingUser) {
        res.status(401).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
        return;
      }
      req.user = user;
      next();

    } catch (error) {
      if (error instanceof JWTError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
          code: error.type
        });
        return;
      }

      console.error('Authentication middleware error:', error);
      res.status(401).json({
        success: false,
        error: 'Authentication failed',
        code: 'AUTH_ERROR'
      });
    }
  };

  public optionalAuthenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = this.tokenService.extractTokenFromHeader(authHeader);

      if (token) {
        try {
          const user = await this.tokenService.validateAccessToken(token);
          const existingUser = await this.authService.getUserById(user.id);
          
          if (existingUser) {
            req.user = user;
          }
        } catch (error) {
          console.log('Optional auth token validation failed:', error);
        }
      }

      next();
    } catch (error) {
      console.error('Optional authentication middleware error:', error);
      next();
    }
  };

  public requireEmailVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'MISSING_TOKEN'
      });
      return;
    }

    try {
      const user = await this.authService.getUserById(req.user.id);
      
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Email verification middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error',
        code: 'SERVER_ERROR'
      });
    }
  };

  public autoRefreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      next();
      return;
    }

    try {
      if (this.tokenService.isTokenExpiringSoon(req.user)) {
        const refreshToken = req.headers['x-refresh-token'] as string;
        
        if (refreshToken) {
          try {
            const newTokens = await this.tokenService.refreshAccessToken(refreshToken);
           
            res.setHeader('X-New-Access-Token', newTokens.accessToken);
            res.setHeader('X-New-Refresh-Token', newTokens.refreshToken);
            res.setHeader('X-Token-Refreshed', 'true');
          } catch (error) {
            console.log('Auto refresh failed:', error);
          }
        }
      }
      
      next();
    } catch (error) {
      console.error('Auto refresh middleware error:', error);
      next();
    }
  };
}

export default AuthMiddleware;