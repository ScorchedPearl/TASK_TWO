import { Request, Response, NextFunction } from 'express';
import type { JWTUser } from '../auth_interface';

declare global {
  namespace Express {
    interface Request {
      user?: JWTUser;
    }
  }
}

class RoleMiddleware {
  private static instance: RoleMiddleware;

  private constructor() {}

  public static getInstance(): RoleMiddleware {
    if (!RoleMiddleware.instance) {
      RoleMiddleware.instance = new RoleMiddleware();
    }
    return RoleMiddleware.instance;
  }

  public requireRole = (allowedRoles: ('buyer' | 'seller')[] | 'buyer' | 'seller') => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'MISSING_AUTH'
        });
        return;
      }

      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          error: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
        return;
      }

      next();
    };
  };

 
  public requireBuyer = (req: Request, res: Response, next: NextFunction): void => {
    this.requireRole('buyer')(req, res, next);
  };


  public requireSeller = (req: Request, res: Response, next: NextFunction): void => {
    this.requireRole('seller')(req, res, next);
  };

 
  public requireAnyRole = (req: Request, res: Response, next: NextFunction): void => {
    this.requireRole(['buyer', 'seller'])(req, res, next);
  };

  
  public requireOwnershipOrRole = (allowedRoles: ('buyer' | 'seller')[] | 'buyer' | 'seller', userIdParam: string = 'userId') => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'MISSING_AUTH'
        });
        return;
      }

      const targetUserId = req.params[userIdParam] || req.body[userIdParam];
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

     
      if (req.user.id === targetUserId) {
        next();
        return;
      }

     
      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          error: 'Access denied. You can only access your own resources.',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
        return;
      }

      next();
    };
  };
}

export default RoleMiddleware;

