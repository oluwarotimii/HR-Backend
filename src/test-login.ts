import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from './config/database';

const app = express();
app.use(express.json());

// Simple login endpoint for testing
app.post('/test-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users]: any = await pool.execute(
      'SELECT id, email, password_hash, full_name, role_id FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token (using your existing JWT config)
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role_id 
      },
      process.env.JWT_SECRET || 'fallback_jwt_secret',
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        roleId: user.role_id
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('Test credentials:');
  console.log('- Email: admin@company.com');
  console.log('- Password: admin123');
  console.log('');
  console.log('To test: curl -X POST http://localhost:3001/test-login -H "Content-Type: application/json" -d \'{"email":"admin@company.com","password":"admin123"}\'');
});