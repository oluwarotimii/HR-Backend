import { pool } from './config/database';

async function testFormCreation() {
  console.log('Testing form creation process...');

  try {
    // First, let's check if the roles table has the admin role
    const [roles] = await pool.execute('SELECT * FROM roles WHERE name = ?', ['Admin']);
    console.log('Admin role exists:', roles.length > 0);
    if (roles.length > 0) {
      console.log('Admin role:', roles[0]);
    }

    // Check if the admin user exists
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', ['admin@company.com']);
    console.log('Admin user exists:', users.length > 0);
    if (users.length > 0) {
      console.log('Admin user:', users[0]);
    }

    // Check if the branches table has any records
    const [branches] = await pool.execute('SELECT * FROM branches LIMIT 1');
    console.log('Branches exist:', branches.length > 0);
    if (branches.length > 0) {
      console.log('Sample branch:', branches[0]);
    }

    // Check if the forms table exists and has any records
    const [forms] = await pool.execute('SELECT * FROM forms LIMIT 1');
    console.log('Forms table exists and has records:', forms.length > 0);

    console.log('✅ Database connectivity test completed successfully');
  } catch (error) {
    console.error('❌ Database test error:', error);
  }
}

testFormCreation();