import request from 'supertest';
import app from '../test-app';
import FormModel from '../models/form.model';

// Mock the models to test the API endpoints
jest.mock('../models/form.model');

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

describe('Forms Framework API', () => {
  const mockForm = {
    id: 1,
    name: 'Leave Request Form',
    description: 'Form for requesting leave',
    form_type: 'leave_request' as const,
    branch_id: 1,
    created_by: 1,
    created_at: new Date(),
    updated_at: new Date(),
    is_active: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/forms', () => {
    it('should return all forms', async () => {
      // Mock the database call
      (FormModel.findAll as jest.MockedFunction<typeof FormModel.findAll>)
        .mockResolvedValue([mockForm]);

      const response = await request(app)
        .get('/api/forms')
        .set('Authorization', 'Bearer valid-access-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.forms).toHaveLength(1);
      expect(response.body.data.forms[0]).toEqual(mockForm);
    });
  });

  describe('GET /api/forms/:id', () => {
    it('should return a specific form', async () => {
      // Mock the database call
      (FormModel.findById as jest.MockedFunction<typeof FormModel.findById>)
        .mockResolvedValue(mockForm);

      const response = await request(app)
        .get('/api/forms/1')
        .set('Authorization', 'Bearer valid-access-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.form).toEqual(mockForm);
    });
  });

  describe('POST /api/forms', () => {
    it('should create a new form', async () => {
      // Mock the database calls
      (FormModel.create as jest.MockedFunction<typeof FormModel.create>)
        .mockResolvedValue(mockForm);

      const response = await request(app)
        .post('/api/forms')
        .set('Authorization', 'Bearer valid-access-token')
        .send({
          name: 'New Form',
          description: 'A new form',
          form_type: 'custom',
          branch_id: 1
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.form.name).toBe('New Form');
    });
  });
});