import axios from 'axios';

async function testApiEndpoints() {
  try {
    console.log('Testing API endpoints...\n');

    // First, try to login with admin credentials
    console.log('1. Attempting to login as admin...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@company.com',
      password: 'admin123'
    });

    console.log('✅ Login successful!');
    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));

    // Extract token from response (structure may vary)
    const token = loginResponse.data.data?.tokens?.accessToken || loginResponse.data.data?.token;
    if (!token) {
      console.log('❌ No token found in login response');
      return;
    }
    console.log('JWT Token received (first 50 chars):', token.substring(0, 50) + '...');

    // Check if permissions are already in the login response
    const permissions = loginResponse.data.data?.permissions;
    console.log('\nPermissions from login response:');
    console.log(JSON.stringify(permissions, null, 2));

    // Now test the permissions endpoint
    console.log('\n2. Testing permissions endpoint...');
    const permissionsResponse = await axios.get('http://localhost:3000/api/auth/permissions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Permissions endpoint response:');
    console.log(JSON.stringify(permissionsResponse.data, null, 2));

    // Test other admin endpoints
    console.log('\n3. Testing roles endpoint...');
    const rolesResponse = await axios.get('http://localhost:3000/api/roles', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Roles endpoint accessible:', rolesResponse.data.success);

    console.log('\n4. Testing users endpoint...');
    const usersResponse = await axios.get('http://localhost:3000/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Users endpoint accessible:', usersResponse.data.success);

  } catch (error: any) {
    if (error.response) {
      console.log('❌ API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.log('❌ Network Error: Could not reach server');
      console.log('Make sure the server is running on http://localhost:3000');
    } else {
      console.log('❌ Unexpected Error:', error.message);
    }
  }
}

testApiEndpoints();