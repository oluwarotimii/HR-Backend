import { Request, Response, NextFunction } from 'express';

// Mock authentication middleware for testing
export const mockAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // In test mode, we'll mock a user
  (req as any).user = {
    id: 1,
    email: 'test@example.com',
    role_id: 1,
    branch_id: 1,
    permissions: ['*:*'] // Wildcard permissions for testing
  };
  next();
};

// Mock authentication middleware that allows specifying user details
export const mockAuthWithUser = (userDetails: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    (req as any).user = userDetails;
    next();
  };
};