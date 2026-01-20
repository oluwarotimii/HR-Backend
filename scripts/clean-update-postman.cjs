const fs = require('fs');
const path = require('path');

// Read the existing staff test suite
const staffCollectionPath = path.join(__dirname, 'hr_management_system_staff_test_suite.postman_collection.json');
let collection = JSON.parse(fs.readFileSync(staffCollectionPath, 'utf8'));

// Function to add missing endpoints for Time Off Banks and Schedule Requests
function addMissingEndpoints(col) {
  // Find the Staff Scheduling section
  let schedulingSection = col.item.find(item => item.name === 'Staff Scheduling');
  if (!schedulingSection) {
    // Create scheduling section if it doesn't exist
    schedulingSection = {
      name: 'Staff Scheduling',
      item: []
    };
    col.item.push(schedulingSection);
  }

  // Add Time Off Banks endpoints
  const timeOffBankEndpoints = [
    {
      name: "Get My Time Off Bank Balance",
      request: {
        method: "GET",
        header: [
          {
            key: "Authorization",
            value: "Bearer {{staff_token}}"
          }
        ],
        url: {
          raw: "{{baseUrl}}/api/shift-scheduling/time-off-banks/my-balance",
          host: ["{{baseUrl}}"],
          path: ["api", "shift-scheduling", "time-off-banks", "my-balance"]
        }
      },
      response: []
    },
    {
      name: "Get All Time Off Banks (Admin)",
      request: {
        method: "GET",
        header: [
          {
            key: "Authorization",
            value: "Bearer {{admin_token}}"
          }
        ],
        url: {
          raw: "{{baseUrl}}/api/shift-scheduling/time-off-banks",
          host: ["{{baseUrl}}"],
          path: ["api", "shift-scheduling", "time-off-banks"]
        }
      },
      response: []
    },
    {
      name: "Create Time Off Bank (Admin)",
      request: {
        method: "POST",
        header: [
          {
            key: "Authorization",
            value: "Bearer {{admin_token}}"
          },
          {
            key: "Content-Type",
            value: "application/json"
          }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            "user_id": 2,
            "program_name": "Sunday Compensatory Time",
            "description": "Time off bank for employees who worked on Sundays",
            "total_entitled_days": 5,
            "valid_from": "2026-01-01",
            "valid_to": "2026-12-31"
          }, null, 2)
        },
        url: {
          raw: "{{baseUrl}}/api/shift-scheduling/time-off-banks",
          host: ["{{baseUrl}}"],
          path: ["api", "shift-scheduling", "time-off-banks"]
        }
      },
      response: []
    }
  ];

  // Add time off bank endpoints to the scheduling section
  timeOffBankEndpoints.forEach(endpoint => {
    if (!schedulingSection.item.find(item => item.name === endpoint.name)) {
      schedulingSection.item.push(endpoint);
    }
  });

  // Add schedule request endpoints
  const scheduleRequestEndpoints = [
    {
      name: "Get My Schedule Requests",
      request: {
        method: "GET",
        header: [
          {
            key: "Authorization",
            value: "Bearer {{staff_token}}"
          }
        ],
        url: {
          raw: "{{baseUrl}}/api/shift-scheduling/schedule-requests",
          host: ["{{baseUrl}}"],
          path: ["api", "shift-scheduling", "schedule-requests"]
        }
      },
      response: []
    },
    {
      name: "Get Schedule Request by ID",
      request: {
        method: "GET",
        header: [
          {
            key: "Authorization",
            value: "Bearer {{staff_token}}"
          }
        ],
        url: {
          raw: "{{baseUrl}}/api/shift-scheduling/schedule-requests/1",
          host: ["{{baseUrl}}"],
          path: ["api", "shift-scheduling", "schedule-requests", "1"]
        }
      },
      response: []
    },
    {
      name: "Submit Schedule Request (Time Off)",
      request: {
        method: "POST",
        header: [
          {
            key: "Authorization",
            value: "Bearer {{staff_token}}"
          },
          {
            key: "Content-Type",
            value: "application/json"
          }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            "request_type": "time_off_request",
            "request_subtype": "compensatory_time_use",
            "requested_date": "2026-02-01",
            "requested_duration_days": 1,
            "reason": "Using compensatory time for Sunday work",
            "scheduled_for": "2026-02-01"
          }, null, 2)
        },
        url: {
          raw: "{{baseUrl}}/api/shift-scheduling/schedule-requests",
          host: ["{{baseUrl}}"],
          path: ["api", "shift-scheduling", "schedule-requests"]
        }
      },
      response: []
    },
    {
      name: "Update Schedule Request",
      request: {
        method: "PUT",
        header: [
          {
            key: "Authorization",
            value: "Bearer {{staff_token}}"
          },
          {
            key: "Content-Type",
            value: "application/json"
          }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            "reason": "Updated reason for time off request"
          }, null, 2)
        },
        url: {
          raw: "{{baseUrl}}/api/shift-scheduling/schedule-requests/1",
          host: ["{{baseUrl}}"],
          path: ["api", "shift-scheduling", "schedule-requests", "1"]
        }
      },
      response: []
    },
    {
      name: "Cancel Schedule Request",
      request: {
        method: "PUT",
        header: [
          {
            key: "Authorization",
            value: "Bearer {{staff_token}}"
          }
        ],
        url: {
          raw: "{{baseUrl}}/api/shift-scheduling/schedule-requests/1/cancel",
          host: ["{{baseUrl}}"],
          path: ["api", "shift-scheduling", "schedule-requests", "1", "cancel"]
        }
      },
      response: []
    }
  ];

  // Add schedule request endpoints to the scheduling section
  scheduleRequestEndpoints.forEach(endpoint => {
    if (!schedulingSection.item.find(item => item.name === endpoint.name)) {
      schedulingSection.item.push(endpoint);
    }
  });

  // Add shift template endpoints
  const shiftTemplateEndpoints = [
    {
      name: "Get Available Shift Templates",
      request: {
        method: "GET",
        header: [
          {
            key: "Authorization",
            value: "Bearer {{staff_token}}"
          }
        ],
        url: {
          raw: "{{baseUrl}}/api/shift-scheduling/shift-templates",
          host: ["{{baseUrl}}"],
          path: ["api", "shift-scheduling", "shift-templates"]
        }
      },
      response: []
    },
    {
      name: "Get My Shift Assignment",
      request: {
        method: "GET",
        header: [
          {
            key: "Authorization",
            value: "Bearer {{staff_token}}"
          }
        ],
        url: {
          raw: "{{baseUrl}}/api/shift-scheduling/employee-shift-assignments",
          host: ["{{baseUrl}}"],
          path: ["api", "shift-scheduling", "employee-shift-assignments"]
        }
      },
      response: []
    }
  ];

  // Add shift template endpoints to scheduling section
  shiftTemplateEndpoints.forEach(endpoint => {
    if (!schedulingSection.item.find(item => item.name === endpoint.name)) {
      schedulingSection.item.push(endpoint);
    }
  });

  // Add leave allocation endpoints if they don't exist
  let leaveSection = col.item.find(item => item.name === 'Staff Leave Management');
  if (!leaveSection) {
    leaveSection = {
      name: 'Staff Leave Management',
      item: []
    };
    // Insert after the authentication section if it exists
    const authIndex = col.item.findIndex(item => item.name === 'Staff Authentication');
    if (authIndex !== -1) {
      col.item.splice(authIndex + 1, 0, leaveSection);
    } else {
      col.item.push(leaveSection);
    }
  }

  // Add endpoints for leave allocation balance
  const leaveAllocationEndpoints = [
    {
      name: "Get Leave Allocation Balance",
      request: {
        method: "GET",
        header: [
          {
            key: "Authorization",
            value: "Bearer {{staff_token}}"
          }
        ],
        url: {
          raw: "{{baseUrl}}/api/leave/allocations/balance",
          host: ["{{baseUrl}}"],
          path: ["api", "leave", "allocations", "balance"]
        }
      },
      response: []
    },
    {
      name: "Get Leave Allocation History",
      request: {
        method: "GET",
        header: [
          {
            key: "Authorization",
            value: "Bearer {{staff_token}}"
          }
        ],
        url: {
          raw: "{{baseUrl}}/api/leave/allocations/history",
          host: ["{{baseUrl}}"],
          path: ["api", "leave", "allocations", "history"]
        }
      },
      response: []
    }
  ];

  // Add leave allocation endpoints to the leave section
  leaveAllocationEndpoints.forEach(endpoint => {
    if (!leaveSection.item.find(item => item.name === endpoint.name)) {
      leaveSection.item.push(endpoint);
    }
  });
}

// Apply updates to the collection
addMissingEndpoints(collection);

// Write the updated collection back to file
fs.writeFileSync(staffCollectionPath, JSON.stringify(collection, null, 2));
console.log('Staff test suite updated with missing endpoints!');

// Also update the main collection if it exists
const mainCollectionPath = path.join(__dirname, 'hr_management_system_api.postman_collection.json');
if (fs.existsSync(mainCollectionPath)) {
  let mainCollection = JSON.parse(fs.readFileSync(mainCollectionPath, 'utf8'));
  addMissingEndpoints(mainCollection);
  fs.writeFileSync(mainCollectionPath, JSON.stringify(mainCollection, null, 2));
  console.log('Main collection updated with missing endpoints!');
}