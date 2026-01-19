import request from 'supertest';
import app from '../test-app';
import UserModel from '../models/user.model';
import RoleModel from '../models/role.model';
import bcrypt from 'bcryptjs';

// Mock the authentication middleware (for endpoints that require auth)
jest.mock('../middleware/auth.middleware', () => ({
  authenticateJWT: (req: any, res: any, next: any) => {
    req.currentUser = {
      id: 1,
      email: 'test@example.com',
      role_id: 1,
      branch_id: 1
    };
    next();
  },
  checkPermission: (permission: string) => (req: any, res: any, next: any) => {
    next();
  }
}));

// Mock the models to test the API endpoints
jest.mock('../models/user.model');
jest.mock('../models/role.model');

describe('Authentication API', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password_hash: '$2a$10$5HxOQjVJyJe5z8XvL.sNkedHkqTAc1f.Ckx6q1UqQp6YyZG9.yMKW', // bcrypt hash for 'password123'
    full_name: 'Test User',
    phone: '+1234567890',
    role_id: 1,
    branch_id: 1,
    status: 'active' as const,
    must_change_password: false,
    created_at: new Date(),
    updated_at: new Date()
  };

  const mockRole = {
    id: 1,
    name: 'Admin',
    description: 'Administrator role',
    permissions: ['user.create', 'user.view', 'user.update', 'user.delete'],
    created_at: new Date(),
    updated_at: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      // Mock the database calls
      (UserModel.findByEmail as jest.MockedFunction<typeof UserModel.findByEmail>)
        .mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('should return error for invalid credentials', async () => {
      // Mock the database call to return null (user not found)
      (UserModel.findByEmail as jest.MockedFunction<typeof UserModel.findByEmail>)
        .mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return error when email or password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          // Missing password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email and password are required');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'valid-refresh-token'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('should return error for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid-refresh-token'
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid or expired refresh token');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user', async () => {
      // Note: This test would require a valid JWT token in the Authorization header
      // For simplicity, we're just testing the route exists and returns expected response
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer valid-access-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });
  });
});