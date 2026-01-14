import request from 'supertest';
import app from '../src/index';
import RoleModel from '../src/models/role.model';

// Mock the database connection
jest.mock('../src/config/database', () => ({
  pool: {
    execute: jest.fn()
  },
  testConnection: jest.fn()
}));

describe('Role Management API', () => {
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

  describe('GET /api/roles', () => {
    it('should return all roles', async () => {
      // Mock the database call
      (RoleModel.findAll as jest.MockedFunction<typeof RoleModel.findAll>)
        .mockResolvedValue([mockRole]);

      const response = await request(app)
        .get('/api/roles')
        .set('Authorization', 'Bearer valid-access-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.roles).toHaveLength(1);
      expect(response.body.data.roles[0]).toEqual(mockRole);
    });
  });

  describe('GET /api/roles/:id', () => {
    it('should return a specific role', async () => {
      // Mock the database call
      (RoleModel.findById as jest.MockedFunction<typeof RoleModel.findById>)
        .mockResolvedValue(mockRole);

      const response = await request(app)
        .get('/api/roles/1')
        .set('Authorization', 'Bearer valid-access-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toEqual(mockRole);
    });

    it('should return 404 for non-existent role', async () => {
      // Mock the database call to return null
      (RoleModel.findById as jest.MockedFunction<typeof RoleModel.findById>)
        .mockResolvedValue(null);

      const response = await request(app)
        .get('/api/roles/999')
        .set('Authorization', 'Bearer valid-access-token')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Role not found');
    });
  });

  describe('POST /api/roles', () => {
    it('should create a new role', async () => {
      // Mock the database call
      (RoleModel.findByName as jest.MockedFunction<typeof RoleModel.findByName>)
        .mockResolvedValue(null); // No existing role with this name
      (RoleModel.create as jest.MockedFunction<typeof RoleModel.create>)
        .mockResolvedValue(mockRole);

      const response = await request(app)
        .post('/api/roles')
        .set('Authorization', 'Bearer valid-access-token')
        .send({
          name: 'New Role',
          description: 'A new role',
          permissions: ['some.permission']
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.role.name).toBe('New Role');
    });

    it('should return error when role name already exists', async () => {
      // Mock the database call to return an existing role
      (RoleModel.findByName as jest.MockedFunction<typeof RoleModel.findByName>)
        .mockResolvedValue(mockRole);

      const response = await request(app)
        .post('/api/roles')
        .set('Authorization', 'Bearer valid-access-token')
        .send({
          name: 'Admin', // Already exists
          description: 'Another admin role',
          permissions: ['some.permission']
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('A role with this name already exists');
    });
  });
});