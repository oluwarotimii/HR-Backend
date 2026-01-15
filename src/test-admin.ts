import bcrypt from 'bcryptjs';
import { pool } from './config/database';

async function testAdminLogin() {
  console.log('Testing admin login credentials...');

  try {
    // Find the admin user
    const [users]: any = await pool.execute(
      'SELECT id, email, password_hash, full_name, role_id FROM users WHERE email = ?',
      ['admin@company.com']
    );

    if (users.length === 0) {
      console.log('❌ Admin user not found!');
      return;
    }

    const user = users[0];
    console.log('✅ Admin user found:', user.email);

    // Verify the password
    const isValidPassword = await bcrypt.compare('admin123', user.password_hash);
    
    if (isValidPassword) {
      console.log('✅ Admin password verified successfully!');
      console.log('\n📋 Admin User Details:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Full Name: ${user.full_name}`);
      console.log(`   Role ID: ${user.role_id}`);
      console.log(`   Password: admin123 (change this in production!)`);
      
      // Check if the role exists
      const [roles]: any = await pool.execute(
        'SELECT id, name, description FROM roles WHERE id = ?',
        [user.role_id]
      );
      
      if (roles.length > 0) {
        console.log(`   Role: ${roles[0].name} (${roles[0].description})`);
      }
      
      // Check if staff record exists
      const [staff]: any = await pool.execute(
        'SELECT id, designation, department FROM staff WHERE user_id = ?',
        [user.id]
      );
      
      if (staff.length > 0) {
        console.log(`   Staff Designation: ${staff[0].designation}`);
        console.log(`   Department: ${staff[0].department}`);
      }
    } else {
      console.log('❌ Admin password verification failed!');
    }
  } catch (error) {
    console.error('❌ Error testing admin login:', error);
  }
}

testAdminLogin();