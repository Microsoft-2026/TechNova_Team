import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/store';
import { UserEntity } from '../types/backendTypes';

export const JWT_SECRET = process.env.JWT_SECRET || 'deal-intelligence-agent-secret-key-prod-2026';

export interface AuthenticatedRequest extends Request {
  user?: UserEntity;
  companyId?: string;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication token missing or invalid.' },
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; companyId: string };
    const user = db.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User associated with token no longer exists.' },
      });
    }

    req.user = user;
    req.companyId = user.companyId; // Strictly derived from user identity
    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Authentication session expired or malformed.' },
    });
  }
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; companyId: string };
      const user = db.getUserById(decoded.userId);
      if (user) {
        req.user = user;
        req.companyId = user.companyId;
        return next();
      }
    } catch {
      // Fall through to default tenant
    }
  }

  // Default to first company tenant for demo evaluation if no auth token supplied
  const defaultUser = db.getUserByEmail('schen@enterprise.com');
  if (defaultUser) {
    req.user = defaultUser;
    req.companyId = defaultUser.companyId;
  }
  next();
}

export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient role permissions for this resource.' },
      });
    }
    next();
  };
}
