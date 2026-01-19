import request from 'supertest';
import app from '../test-app';
import StaffModel from '../models/staff.model';
import UserModel from '../models/user.model';

// Mock the models to test the API endpoints
jest.mock('../models/staff.model');
jest.mock('../models/user.model');

// Mock the authentication middleware
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

describe('Staff Management API', () => {
  const mockStaff = {
    id: 1,
    user_id: 1,
    employee_id: 'EMP001',
    designation: 'Software Engineer',
    department: 'Engineering',
    branch_id: 1,
    joining_date: new Date('2023-01-15'),
    employment_type: 'full_time' as const,
    status: 'active' as const,
    created_at: new Date(),
    updated_at: new Date()
  };

  const mockUser = {
    id: 1,
    email: 'john.doe@example.com',
    password_hash: '$2a$10$5HxOQjVJyJe5z8XvL.sNkedHkqTAc1f.Ckx6q1UqQp6YyZG9.yMKW',
    full_name: 'John Doe',
    phone: '+1234567890',
    role_id: 1,
    branch_id: 1,
    status: 'active' as const,
    must_change_password: false,
    created_at: new Date(),
    updated_at: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/staff', () => {
    it('should return all staff', async () => {
      // Mock the database call
      (StaffModel.findAll as jest.MockedFunction<typeof StaffModel.findAll>)
        .mockResolvedValue({ staff: [mockStaff], totalCount: 1 });

      const response = await request(app)
        .get('/api/staff')
        .set('Authorization', 'Bearer valid-access-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.staff).toHaveLength(1);
      expect(response.body.data.staff[0]).toEqual(mockStaff);
    });
  });

  describe('GET /api/staff/:id', () => {
    it('should return a specific staff', async () => {
      // Mock the database call
      (StaffModel.findById as jest.MockedFunction<typeof StaffModel.findById>)
        .mockResolvedValue(mockStaff);

      const response = await request(app)
        .get('/api/staff/1')
        .set('Authorization', 'Bearer valid-access-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.staff).toEqual(mockStaff);
    });

    it('should return 404 for non-existent staff', async () => {
      // Mock the database call to return null
      (StaffModel.findById as jest.MockedFunction<typeof StaffModel.findById>)
        .mockResolvedValue(null);

      const response = await request(app)
        .get('/api/staff/999')
        .set('Authorization', 'Bearer valid-access-token')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Staff not found');
    });
  });

  describe('POST /api/staff', () => {
    it('should create a new staff', async () => {
      // Mock the database calls
      (UserModel.findById as jest.MockedFunction<typeof UserModel.findById>)
        .mockResolvedValue(mockUser);
      (StaffModel.findByUserId as jest.MockedFunction<typeof StaffModel.findByUserId>)
        .mockResolvedValue(null); // No existing staff for this user
      (StaffModel.create as jest.MockedFunction<typeof StaffModel.create>)
        .mockResolvedValue(mockStaff);

      const response = await request(app)
        .post('/api/staff')
        .set('Authorization', 'Bearer valid-access-token')
        .send({
          user_id: 1,
          employee_id: 'EMP001',
          designation: 'Software Engineer',
          department: 'Engineering',
          branch_id: 1
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.staff.employee_id).toBe('EMP001');
    });

    it('should return error when user does not exist', async () => {
      // Mock the database call to return null for user
      (UserModel.findById as jest.MockedFunction<typeof UserModel.findById>)
        .mockResolvedValue(null);

      const response = await request(app)
        .post('/api/staff')
        .set('Authorization', 'Bearer valid-access-token')
        .send({
          user_id: 999, // Non-existent user
          employee_id: 'EMP002',
          designation: 'Designer',
          department: 'Design'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('PUT /api/staff/:id', () => {
    it('should update a staff record', async () => {
      // Mock the database calls
      (StaffModel.findById as jest.MockedFunction<typeof StaffModel.findById>)
        .mockResolvedValue(mockStaff);
      (StaffModel.update as jest.MockedFunction<typeof StaffModel.update>)
        .mockResolvedValue({ ...mockStaff, designation: 'Senior Engineer' });

      const response = await request(app)
        .put('/api/staff/1')
        .set('Authorization', 'Bearer valid-access-token')
        .send({
          designation: 'Senior Engineer'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.staff.designation).toBe('Senior Engineer');
    });
  });
});