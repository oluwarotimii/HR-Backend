import fs from 'fs';

// Read the Postman collection
const collectionPath = './hr_management_system_complete.postman_collection.json';
const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

// Extract all endpoint paths and methods from the Postman collection
const postmanEndpoints = new Set();
for (const section of collection.item) {
  if (section.item && Array.isArray(section.item)) {
    for (const endpoint of section.item) {
      if (endpoint.request && endpoint.request.url && endpoint.request.url.path) {
        const path = endpoint.request.url.path.join('/');
        const method = endpoint.request.method;
        const combined = `${method} ${path}`.toLowerCase();
        postmanEndpoints.add(combined);
      }
    }
  }
}

// List of expected API routes from the codebase (method + path)
const expectedRoutes = [
  // Authentication
  'POST api/auth/login',
  'POST api/auth/refresh',
  'POST api/auth/logout',

  // System Initialization
  'POST api/system/initialize',
  'GET api/system/status',
  'POST api/system-complete/setup-complete',
  'GET api/system-complete/readiness',

  // Role Management
  'GET api/role-management',
  'POST api/role-management',
  'PUT api/role-management/:id',
  'DELETE api/role-management/:id',
  'GET api/role-management/permissions',

  // User Management
  'GET api/users',
  'POST api/users',
  'GET api/users/:id',
  'PUT api/users/:id',
  'DELETE api/users/:id',

  // Staff Management
  'GET api/staff',
  'POST api/staff',
  'GET api/staff/:id',
  'PUT api/staff/:id',
  'DELETE api/staff/:id',

  // Branch Management
  'GET api/branches',
  'POST api/branches',
  'GET api/branches/:id',
  'PUT api/branches/:id',
  'DELETE api/branches/:id',

  // Department Management
  'GET api/departments',
  'POST api/departments',
  'GET api/departments/:id',
  'PUT api/departments/:id',
  'DELETE api/departments/:id',

  // Staff Invitation
  'POST api/staff-invitation',
  'GET api/staff-invitation/roles',
  'GET api/staff-invitation/branches',
  'GET api/staff-invitation/departments',

  // Forms
  'GET api/forms',
  'POST api/forms',
  'GET api/forms/:id',
  'PUT api/forms/:id',
  'DELETE api/forms/:id',
  'GET api/form-fields',
  'POST api/form-fields',
  'GET api/form-fields/:id',
  'PUT api/form-fields/:id',
  'DELETE api/form-fields/:id',
  'GET api/form-submissions',
  'POST api/form-submissions',
  'GET api/form-submissions/:id',
  'PUT api/form-submissions/:id',
  'DELETE api/form-submissions/:id',

  // Leave
  'GET api/leave',
  'POST api/leave',
  'GET api/leave/:id',
  'PUT api/leave/:id',
  'DELETE api/leave/:id',
  'GET api/leave-types',  // Added this
  'POST api/leave-types',  // Added this
  'GET api/leave-types/:id',  // Added this
  'PUT api/leave-types/:id',  // Added this
  'DELETE api/leave-types/:id',  // Added this

  // Attendance
  'GET api/attendance',
  'POST api/attendance',
  'GET api/attendance/:id',
  'PUT api/attendance/:id',
  'DELETE api/attendance/:id',
  'GET api/attendance-locations',
  'POST api/attendance-locations',
  'GET api/attendance-locations/:id',
  'PUT api/attendance-locations/:id',
  'DELETE api/attendance-locations/:id',
  'GET api/holidays',
  'POST api/holidays',
  'GET api/holidays/:id',
  'PUT api/holidays/:id',
  'DELETE api/holidays/:id',

  // Payroll
  'GET api/payment-types',
  'POST api/payment-types',
  'GET api/payment-types/:id',
  'PUT api/payment-types/:id',
  'DELETE api/payment-types/:id',
  'GET api/staff-payment-structure',
  'POST api/staff-payment-structure',
  'GET api/staff-payment-structure/:id',
  'PUT api/staff-payment-structure/:id',
  'DELETE api/staff-payment-structure/:id',
  'GET api/payroll-runs',
  'POST api/payroll-runs',
  'GET api/payroll-runs/:id',
  'PUT api/payroll-runs/:id',
  'DELETE api/payroll-runs/:id',
  'GET api/payroll-records',
  'POST api/payroll-records',
  'GET api/payroll-records/:id',
  'PUT api/payroll-records/:id',
  'DELETE api/payroll-records/:id',
  'GET api/payslips',
  'POST api/payslips',
  'GET api/payslips/:id',
  'PUT api/payslips/:id',
  'DELETE api/payslips/:id',

  // Appraisals
  'GET api/metrics',
  'POST api/metrics',
  'GET api/metrics/:id',
  'PUT api/metrics/:id',
  'DELETE api/metrics/:id',
  'GET api/kpis',
  'POST api/kpis',
  'GET api/kpis/:id',
  'PUT api/kpis/:id',
  'DELETE api/kpis/:id',
  'GET api/kpi-assignments',
  'POST api/kpi-assignments',
  'GET api/kpi-assignments/:id',
  'PUT api/kpi-assignments/:id',
  'DELETE api/kpi-assignments/:id',
  'GET api/kpi-scores',
  'POST api/kpi-scores',
  'GET api/kpi-scores/:id',
  'PUT api/kpi-scores/:id',
  'DELETE api/kpi-scores/:id',
  'GET api/targets',
  'POST api/targets',
  'GET api/targets/:id',
  'PUT api/targets/:id',
  'DELETE api/targets/:id',
  'GET api/appraisals',
  'POST api/appraisals',
  'GET api/appraisals/:id',
  'PUT api/appraisals/:id',
  'DELETE api/appraisals/:id',
  'GET api/appraisal-templates',
  'POST api/appraisal-templates',
  'GET api/appraisal-templates/:id',
  'PUT api/appraisal-templates/:id',
  'DELETE api/appraisal-templates/:id',
  'GET api/performance',
  'GET api/performance/:id',
  'GET api/employees',
  'GET api/employees/:id',

  // Notifications
  'GET api/notifications',
  'POST api/notifications',
  'GET api/notifications/:id',
  'PUT api/notifications/:id',
  'DELETE api/notifications/:id',

  // Job Management
  'GET api/job-postings',
  'POST api/job-postings',
  'GET api/job-postings/:id',
  'PUT api/job-postings/:id',
  'DELETE api/job-postings/:id',
  'GET api/job-applications',
  'POST api/job-applications',
  'GET api/job-applications/:id',
  'PUT api/job-applications/:id',
  'DELETE api/job-applications/:id',
  'GET api/job-application-management',
  'POST api/job-application-management',
  'GET api/job-application-management/:id',
  'PUT api/job-application-management/:id',
  'DELETE api/job-application-management/:id',

  // Shift Scheduling
  'GET api/shift-scheduling',
  'POST api/shift-scheduling',
  'GET api/shift-scheduling/templates',
  'POST api/shift-scheduling/templates',
  'GET api/shift-scheduling/templates/:id',
  'PUT api/shift-scheduling/templates/:id',
  'DELETE api/shift-scheduling/templates/:id',
  'GET api/shift-scheduling/assignments',
  'POST api/shift-scheduling/assignments',
  'GET api/shift-scheduling/assignments/:id',
  'PUT api/shift-scheduling/assignments/:id',
  'DELETE api/shift-scheduling/assignments/:id',
  'GET api/shift-scheduling/exceptions',
  'POST api/shift-scheduling/exceptions',
  'GET api/shift-scheduling/exceptions/:id',
  'PUT api/shift-scheduling/exceptions/:id',
  'DELETE api/shift-scheduling/exceptions/:id',

  // Reporting & Analytics
  'GET api/reports',
  'POST api/reports',
  'GET api/reports/templates',
  'POST api/reports/templates',
  'GET api/reports/templates/:id',
  'PUT api/reports/templates/:id',
  'DELETE api/reports/templates/:id',
  'GET api/reports/scheduled',
  'POST api/reports/scheduled',
  'GET api/reports/scheduled/:id',
  'PUT api/reports/scheduled/:id',
  'DELETE api/reports/scheduled/:id',
  'GET api/reports/cache',
  'POST api/reports/cache',
  'GET api/reports/cache/:id',
  'PUT api/reports/cache/:id',
  'DELETE api/reports/cache/:id',
  'GET api/reports/metrics',
  'POST api/reports/metrics',
  'GET api/reports/metrics/:id',
  'PUT api/reports/metrics/:id',
  'DELETE api/reports/metrics/:id',
  'GET api/reports/exports',
  'POST api/reports/exports',
  'GET api/reports/exports/:id',
  'PUT api/reports/exports/:id',
  'DELETE api/reports/exports/:id',

  // Role Permissions (added missing)
  'GET api/permissions/available',
  'GET api/permissions/roles/:id/permissions',
  'POST api/permissions/roles/:id/permissions',
  'DELETE api/permissions/roles/:id/permissions',

  // Password Change (added missing)
  'POST api/password-change/change',
  'PATCH api/password-change/force/:id'
];

// Check which routes are missing
const missingRoutes = [];
for (const route of expectedRoutes) {
  // Replace :param with generic parameter for matching
  let normalizedRoute = route.toLowerCase().replace(/:\w+/g, ':id');
  if (!postmanEndpoints.has(normalizedRoute)) {
    missingRoutes.push(route);
  }
}

console.log(`Total endpoints in Postman collection: ${postmanEndpoints.size}`);
console.log(`Expected endpoints from codebase: ${expectedRoutes.length}`);
console.log(`Missing endpoints: ${missingRoutes.length}\n`);

if (missingRoutes.length > 0) {
  console.log('Missing endpoints:');
  missingRoutes.forEach(route => console.log(`- ${route}`));
} else {
  console.log('✅ All expected endpoints are present in the Postman collection!');
}

// Also check for the specific sections we know should exist
const sectionNames = collection.item.map(item => item.name);
const expectedSections = [
  'Authentication',
  'System Initialization', 
  'Role Management',
  'Staff Management',
  'Leave',
  'Attendance',
  'Payroll Runs',
  'Payroll Records',
  'Payslips',
  'KPIs',
  'Appraisals',
  'Reports & Analytics',
  'Shift Scheduling'
];

console.log('\n🔍 Checking for expected sections:');
let missingSections = 0;
for (const section of expectedSections) {
  if (sectionNames.includes(section)) {
    console.log(`✅ ${section}`);
  } else {
    console.log(`❌ ${section}`);
    missingSections++;
  }
}

if (missingSections === 0) {
  console.log('\n🎉 All expected sections are present in the Postman collection!');
} else {
  console.log(`\n⚠️  ${missingSections} sections are missing from the Postman collection.`);
}