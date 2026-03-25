// Create admin user for testing
// Usage: node create-admin-user.cjs
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  console.log('🔧 Creating admin user...\n');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hr_management_system'
  });
  
  try {
    // Check if admin user already exists
    const [existing] = await connection.execute(
      'SELECT id, email FROM users WHERE email = ?',
      ['admin@company.co.ke']
    );
    
    if (existing.length > 0) {
      console.log('ℹ️  Admin user already exists:');
      console.log(`   Email: ${existing[0].email}`);
      console.log(`   ID: ${existing[0].id}\n`);
      console.log('📝 Use these credentials to login:');
      console.log('   Email: admin@company.co.ke');
      console.log('   Password: Admin123!\n');
      await connection.end();
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    await connection.execute(`
      INSERT INTO users (email, password, full_name, status, is_active, must_change_password)
      VALUES (?, ?, 'System Administrator', 'active', TRUE, FALSE)
    `, ['admin@company.co.ke', hashedPassword]);
    
    const [result] = await connection.execute('SELECT LAST_INSERT_ID() as id');
    const userId = result[0].id;
    
    // Get admin role
    const [roles] = await connection.execute(
      "SELECT id FROM roles WHERE name = 'Admin' OR name = 'Super Admin' LIMIT 1"
    );
    
    if (roles.length > 0) {
      await connection.execute(
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
        [userId, roles[0].id]
      );
      console.log('✅ Admin role assigned');
    } else {
      console.log('⚠️  No admin role found in roles table');
    }
    
    console.log('\n✅ Admin user created successfully!\n');
    console.log('📝 Login credentials:');
    console.log('   Email: admin@company.co.ke');
    console.log('   Password: Admin123!\n');
    console.log('⚠️  Please change the password after first login!\n');
    
  } catch (error) {
    console.error('❌ Error creating admin user:');
    console.error(error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

createAdminUser();
