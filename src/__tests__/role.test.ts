import request from 'supertest';
import app from '../test-app';
import RoleModel from '../models/role.model';

// Mock the RoleModel to test the API endpoints
jest.mock('../models/role.model');

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
      (RoleModel.findAllWithFilters as jest.MockedFunction<any>)
        .mockResolvedValue({ roles: [mockRole], totalCount: 1 });

      const response = await request(app)
        .get('/api/roles')
        .set('Authorization', 'Bearer valid-access-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.roles).toHaveLength(1);
      // Compare only the essential properties since dates might be formatted differently
      expect(response.body.data.roles[0].id).toBe(mockRole.id);
      expect(response.body.data.roles[0].name).toBe(mockRole.name);
      expect(response.body.data.roles[0].description).toBe(mockRole.description);
      expect(response.body.data.roles[0].permissions).toEqual(mockRole.permissions);
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
      // Compare individual properties since dates might be serialized differently
      expect(response.body.data.role.id).toBe(mockRole.id);
      expect(response.body.data.role.name).toBe(mockRole.name);
      expect(response.body.data.role.description).toBe(mockRole.description);
      expect(response.body.data.role.permissions).toEqual(mockRole.permissions);
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
      // Create a new mock role for the creation test
      const newRole = {
        id: 2,
        name: 'New Role',
        description: 'A new role',
        permissions: ['some.permission'],
        created_at: new Date(),
        updated_at: new Date()
      };

      // Mock the database call
      (RoleModel.findByName as jest.MockedFunction<typeof RoleModel.findByName>)
        .mockResolvedValue(null); // No existing role with this name
      (RoleModel.create as jest.MockedFunction<typeof RoleModel.create>)
        .mockResolvedValue(newRole);

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