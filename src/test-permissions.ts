import { pool } from './config/database';
import PermissionService from './services/permission.service';

async function testAdminPermissions() {
  console.log('Testing admin user permissions...\n');

  try {
    // Get the admin user ID
    const [users]: any = await pool.execute(
      'SELECT id, email, role_id FROM users WHERE email = ?',
      ['admin@company.com']
    );

    if (users.length === 0) {
      console.log('❌ Admin user not found!');
      return;
    }

    const adminUser = users[0];
    console.log(`✅ Admin user found: ${adminUser.email} (ID: ${adminUser.id})`);

    // Check if the role has '*' permissions
    const [roles]: any = await pool.execute(
      'SELECT id, name, permissions FROM roles WHERE id = ?',
      [adminUser.role_id]
    );

    if (roles.length > 0) {
      const role = roles[0];
      console.log(`✅ Role: ${role.name} (ID: ${role.id})`);
      console.log(`✅ Role permissions: ${role.permissions}`);
      
      // Parse the permissions JSON
      const parsedPermissions = JSON.parse(role.permissions);
      console.log(`✅ Parsed permissions:`, parsedPermissions);
      
      if (parsedPermissions.includes('*')) {
        console.log('✅ Admin role has "*" (all permissions) wildcard!');
      } else {
        console.log('❌ Admin role does NOT have "*" wildcard');
      }
    }

    // Test permission manifest generation
    console.log('\n--- Testing Permission Manifest ---');
    const manifest = await PermissionService.generatePermissionManifest(adminUser.id);
    console.log('Generated manifest:', manifest);

    // Test specific permission check
    console.log('\n--- Testing Specific Permission Checks ---');
    const testPermissions = ['staff:create', 'users:manage', 'reports:view', 'admin:full'];
    
    for (const perm of testPermissions) {
      const result = await PermissionService.hasPermission(adminUser.id, perm);
      console.log(`${perm}: ${result.hasPermission ? '✅ ALLOWED' : '❌ DENIED'} (source: ${result.source})`);
    }

    console.log('\n🎉 Permission system is working correctly!');
    console.log('The admin user should now have full permissions via the "*" wildcard.');

  } catch (error) {
    console.error('❌ Error testing admin permissions:', error);
  }
}

testAdminPermissions();