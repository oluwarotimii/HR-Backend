import { Request, Response, NextFunction } from 'express';
import JwtUtil from '../utils/jwt.util';
import UserModel from '../models/user.model';
import PermissionService from '../services/permission.service';

declare global {
  namespace Express {
    interface Request {
      currentUser?: any;
    }
  }
}

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = JwtUtil.verifyAccessToken(token);

    // Fetch user from database to ensure they exist and are active
    const user = await UserModel.findById(decoded.userId);

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or inactive user'
      });
    }

    // Attach user info to request object
    req.currentUser = {
      id: user.id,
      email: user.email,
      role_id: user.role_id,
      branch_id: user.branch_id
    };

    return next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Higher-order function to create permission check middleware
export const checkPermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.currentUser) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if the user has the required permission
      const permissionResult = await PermissionService.hasPermission(req.currentUser.id, permission);

      if (!permissionResult.hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions. Required: ${permission}`,
          requiredPermission: permission,
          permissionSource: permissionResult.source
        });
      }

      return next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during permission check'
      });
    }
  };
};

// Middleware to attach user permissions manifest to the request
export const attachPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.currentUser) {
      const permissions = await PermissionService.generatePermissionManifest(req.currentUser.id);
      req.currentUser.permissions = permissions;
    }
    return next();
  } catch (error) {
    console.error('Error attaching permissions:', error);
    return next();
  }
};