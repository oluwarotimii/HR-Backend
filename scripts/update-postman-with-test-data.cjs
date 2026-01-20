const fs = require('fs');
const path = require('path');

// Read the main Postman collection file
const collectionPath = path.join(__dirname, 'hr_management_system_api.postman_collection.json');
let collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

// Update the base URL and authentication credentials
function updateCollection(obj) {
  if (obj && typeof obj === 'object') {
    // Update authentication request
    if (obj.request && obj.request.body && obj.request.body.raw) {
      try {
        const body = JSON.parse(obj.request.body.raw);
        if (body.email && body.password) {
          // Update admin credentials
          if (body.email === 'admin@company.com' || body.email.includes('admin')) {
            body.email = 'oluwarotimiadewumi@gmail.com';
            body.password = 'admin123';
          }
          obj.request.body.raw = JSON.stringify(body, null, 2);
        }
      } catch (e) {
        // Ignore parsing errors for non-JSON bodies
      }
    }
    
    // Update URLs to match current API structure
    if (obj.request && obj.request.url && obj.request.url.raw) {
      // Update any deprecated endpoints to current ones
      obj.request.url.raw = obj.request.url.raw
        .replace('{{baseUrl}}/api/auth/login', '{{baseUrl}}/api/auth/login')
        .replace('{{baseUrl}}/api/auth/refresh', '{{baseUrl}}/api/auth/refresh')
        .replace('{{baseUrl}}/api/auth/logout', '{{baseUrl}}/api/auth/logout')
        .replace('{{baseUrl}}/api/auth/permissions', '{{baseUrl}}/api/auth/permissions')
        .replace('{{baseUrl}}/api/users', '{{baseUrl}}/api/users')
        .replace('{{baseUrl}}/api/staff', '{{baseUrl}}/api/staff')
        .replace('{{baseUrl}}/api/forms', '{{baseUrl}}/api/forms')
        .replace('{{baseUrl}}/api/leave', '{{baseUrl}}/api/leave')
        .replace('{{baseUrl}}/api/attendance', '{{baseUrl}}/api/attendance')
        .replace('{{baseUrl}}/api/payroll', '{{baseUrl}}/api/payroll')
        .replace('{{baseUrl}}/api/kpis', '{{baseUrl}}/api/kpis')
        .replace('{{baseUrl}}/api/appraisals', '{{baseUrl}}/api/appraisals')
        .replace('{{baseUrl}}/api/reports', '{{baseUrl}}/api/reports')
        .replace('{{baseUrl}}/api/notifications', '{{baseUrl}}/api/notifications')
        .replace('{{baseUrl}}/api/job-postings', '{{baseUrl}}/api/job-postings')
        .replace('{{baseUrl}}/api/applications', '{{baseUrl}}/api/applications')
        .replace('{{baseUrl}}/api/shift-timings', '{{baseUrl}}/api/shift-timings')
        .replace('{{baseUrl}}/api/holidays', '{{baseUrl}}/api/holidays');
    }
    
    // Update all object properties recursively
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        updateCollection(obj[key]);
      }
    }
  }
}

// Apply updates to the collection
updateCollection(collection);

// Add new endpoints that might be missing
function addMissingEndpoints(collection) {
  // Find the authentication section
  let authSection = collection.item.find(item => item.name === 'Authentication');
  if (!authSection) {
    authSection = {
      name: 'Authentication',
      item: []
    };
    collection.item.unshift(authSection);
  }

  // Add health check endpoints
  const healthEndpoints = [
    {
      name: 'Health Check',
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: '{{baseUrl}}/api/health',
          host: ['{{baseUrl}}'],
          path: ['api', 'health']
        }
      },
      response: []
    },
    {
      name: 'Health Check Details',
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: '{{baseUrl}}/api/health/details',
          host: ['{{baseUrl}}'],
          path: ['api', 'health', 'details']
        }
      },
      response: []
    }
  ];

  // Add health endpoints to auth section
  healthEndpoints.forEach(endpoint => {
    if (!authSection.item.find(item => item.name === endpoint.name)) {
      authSection.item.push(endpoint);
    }
  });

  // Add other missing endpoints based on current API structure
  const missingEndpoints = [
    {
      name: 'Get All Staff',
      request: {
        method: 'GET',
        header: [
          {
            key: 'Authorization',
            value: 'Bearer {{token}}'
          }
        ],
        url: {
          raw: '{{baseUrl}}/api/staff',
          host: ['{{baseUrl}}'],
          path: ['api', 'staff']
        }
      },
      response: []
    },
    {
      name: 'Create Staff',
      request: {
        method: 'POST',
        header: [
          {
            key: 'Authorization',
            value: 'Bearer {{token}}'
          },
          {
            key: 'Content-Type',
            value: 'application/json'
          }
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            "user_id": 1,
            "designation": "Software Engineer",
            "department": "IT",
            "branch_id": 1,
            "joining_date": "2023-01-15",
            "status": "active"
          }, null, 2)
        },
        url: {
          raw: '{{baseUrl}}/api/staff',
          host: ['{{baseUrl}}'],
          path: ['api', 'staff']
        }
      },
      response: []
    },
    {
      name: 'Get All Forms',
      request: {
        method: 'GET',
        header: [
          {
            key: 'Authorization',
            value: 'Bearer {{token}}'
          }
        ],
        url: {
          raw: '{{baseUrl}}/api/forms',
          host: ['{{baseUrl}}'],
          path: ['api', 'forms']
        }
      },
      response: []
    },
    {
      name: 'Get All Leave Requests',
      request: {
        method: 'GET',
        header: [
          {
            key: 'Authorization',
            value: 'Bearer {{token}}'
          }
        ],
        url: {
          raw: '{{baseUrl}}/api/leave',
          host: ['{{baseUrl}}'],
          path: ['api', 'leave']
        }
      },
      response: []
    },
    {
      name: 'Get Attendance Records',
      request: {
        method: 'GET',
        header: [
          {
            key: 'Authorization',
            value: 'Bearer {{token}}'
          }
        ],
        url: {
          raw: '{{baseUrl}}/api/attendance',
          host: ['{{baseUrl}}'],
          path: ['api', 'attendance']
        }
      },
      response: []
    },
    {
      name: 'Get Payroll Records',
      request: {
        method: 'GET',
        header: [
          {
            key: 'Authorization',
            value: 'Bearer {{token}}'
          }
        ],
        url: {
          raw: '{{baseUrl}}/api/payroll/records',
          host: ['{{baseUrl}}'],
          path: ['api', 'payroll', 'records']
        }
      },
      response: []
    },
    {
      name: 'Get All KPIs',
      request: {
        method: 'GET',
        header: [
          {
            key: 'Authorization',
            value: 'Bearer {{token}}'
          }
        ],
        url: {
          raw: '{{baseUrl}}/api/kpis',
          host: ['{{baseUrl}}'],
          path: ['api', 'kpis']
        }
      },
      response: []
    },
    {
      name: 'Get All Appraisals',
      request: {
        method: 'GET',
        header: [
          {
            key: 'Authorization',
            value: 'Bearer {{token}}'
          }
        ],
        url: {
          raw: '{{baseUrl}}/api/appraisals',
          host: ['{{baseUrl}}'],
          path: ['api', 'appraisals']
        }
      },
      response: []
    },
    {
      name: 'Get All Job Postings',
      request: {
        method: 'GET',
        header: [
          {
            key: 'Authorization',
            value: 'Bearer {{token}}'
          }
        ],
        url: {
          raw: '{{baseUrl}}/api/job-postings',
          host: ['{{baseUrl}}'],
          path: ['api', 'job-postings']
        }
      },
      response: []
    },
    {
      name: 'Submit Job Application',
      request: {
        method: 'POST',
        header: [
          {
            key: 'Content-Type',
            value: 'application/json'
          }
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            "job_posting_id": 1,
            "applicant_name": "Aduragba Tolu",
            "applicant_email": "aduragbatolu@example.com",
            "applicant_phone": "+2348012345678",
            "cover_letter": "I am interested in this position...",
            "resume_file_path": "/uploads/resumes/aduragba_resume.pdf"
          }, null, 2)
        },
        url: {
          raw: '{{baseUrl}}/api/applications',
          host: ['{{baseUrl}}'],
          path: ['api', 'applications']
        }
      },
      response: []
    },
    {
      name: 'Get All Shift Timings',
      request: {
        method: 'GET',
        header: [
          {
            key: 'Authorization',
            value: 'Bearer {{token}}'
          }
        ],
        url: {
          raw: '{{baseUrl}}/api/shift-timings',
          host: ['{{baseUrl}}'],
          path: ['api', 'shift-timings']
        }
      },
      response: []
    },
    {
      name: 'Get All Holidays',
      request: {
        method: 'GET',
        header: [
          {
            key: 'Authorization',
            value: 'Bearer {{token}}'
          }
        ],
        url: {
          raw: '{{baseUrl}}/api/holidays',
          host: ['{{baseUrl}}'],
          path: ['api', 'holidays']
        }
      },
      response: []
    },
    {
      name: 'Get All Notifications',
      request: {
        method: 'GET',
        header: [
          {
            key: 'Authorization',
            value: 'Bearer {{token}}'
          }
        ],
        url: {
          raw: '{{baseUrl}}/api/notifications/my-notifications',
          host: ['{{baseUrl}}'],
          path: ['api', 'notifications', 'my-notifications']
        }
      },
      response: []
    }
  ];

  // Add missing endpoints to appropriate sections
  missingEndpoints.forEach(endpoint => {
    // Check if endpoint already exists
    const exists = collection.item.some(section => 
      section.item && section.item.some(item => item.name === endpoint.name)
    );
    
    if (!exists) {
      // Add to general API section or create one if it doesn't exist
      let apiSection = collection.item.find(item => item.name === 'API Endpoints');
      if (!apiSection) {
        apiSection = {
          name: 'API Endpoints',
          item: []
        };
        collection.item.push(apiSection);
      }
      apiSection.item.push(endpoint);
    }
  });
}

// Add missing endpoints
addMissingEndpoints(collection);

// Write the updated collection back to file
fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
console.log('Postman collection updated successfully!');

// Also update other collection files
const otherCollections = [
  'hr_management_system_api_cleaned.postman_collection.json',
  'hr_management_system_api_updated.postman_collection.json',
  'hr_management_system_complete.postman_collection.json',
  'hr_management_system_shift_scheduling.postman_collection.json'
];

otherCollections.forEach(filename => {
  const filePath = path.join(__dirname, filename);
  if (fs.existsSync(filePath)) {
    try {
      let otherCollection = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Apply same updates to other collections
      updateCollection(otherCollection);
      addMissingEndpoints(otherCollection);
      
      fs.writeFileSync(filePath, JSON.stringify(otherCollection, null, 2));
      console.log(`${filename} updated successfully!`);
    } catch (e) {
      console.log(`Could not update ${filename}: ${e.message}`);
    }
  }
});