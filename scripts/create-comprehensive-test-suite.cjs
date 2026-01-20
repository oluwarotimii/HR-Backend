const fs = require('fs');
const path = require('path');

// Function to create a comprehensive test collection with all endpoints and test data
function createComprehensiveTestCollection() {
  return {
    "info": {
      "_postman_id": "comprehensive-hr-test-suite",
      "name": "Comprehensive HR Management System Test Suite",
      "description": "Complete test suite for HR Management System with all endpoints and test data",
      "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      "version": "1.0.0"
    },
    "item": [
      {
        "name": "Health Checks",
        "item": [
          {
            "name": "Health Check",
            "request": {
              "method": "GET",
              "header": [],
              "url": {
                "raw": "{{baseUrl}}/api/health",
                "host": ["{{baseUrl}}"],
                "path": ["api", "health"]
              }
            },
            "response": []
          },
          {
            "name": "Health Check Details",
            "request": {
              "method": "GET",
              "header": [],
              "url": {
                "raw": "{{baseUrl}}/api/health/details",
                "host": ["{{baseUrl}}"],
                "path": ["api", "health", "details"]
              }
            },
            "response": []
          }
        ]
      },
      {
        "name": "Authentication",
        "item": [
          {
            "name": "Admin Login",
            "request": {
              "method": "POST",
              "header": [
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"email\": \"oluwarotimiadewumi@gmail.com\",\n  \"password\": \"admin123\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/auth/login",
                "host": ["{{baseUrl}}"],
                "path": ["api", "auth", "login"]
              }
            },
            "event": [
              {
                "listen": "test",
                "script": {
                  "exec": [
                    "pm.test(\"Admin Login Successful\", function () {",
                    "    pm.response.to.have.status(200);",
                    "    var jsonData = pm.response.json();",
                    "    pm.environment.set(\"admin_token\", jsonData.data.token);",
                    "});"
                  ],
                  "type": "text/javascript"
                }
              }
            ],
            "response": []
          },
          {
            "name": "Employee Login",
            "request": {
              "method": "POST",
              "header": [
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"email\": \"aduragbatolu@example.com\",\n  \"password\": \"employee123\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/auth/login",
                "host": ["{{baseUrl}}"],
                "path": ["api", "auth", "login"]
              }
            },
            "event": [
              {
                "listen": "test",
                "script": {
                  "exec": [
                    "pm.test(\"Employee Login Successful\", function () {",
                    "    pm.response.to.have.status(200);",
                    "    var jsonData = pm.response.json();",
                    "    pm.environment.set(\"employee_token\", jsonData.data.token);",
                    "});"
                  ],
                  "type": "text/javascript"
                }
              }
            ],
            "response": []
          },
          {
            "name": "Get User Permissions",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{admin_token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/auth/permissions",
                "host": ["{{baseUrl}}"],
                "path": ["api", "auth", "permissions"]
              }
            },
            "response": []
          }
        ]
      },
      {
        "name": "User Management",
        "item": [
          {
            "name": "Get All Users",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{admin_token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/users",
                "host": ["{{baseUrl}}"],
                "path": ["api", "users"]
              }
            },
            "response": []
          },
          {
            "name": "Create User",
            "request": {
              "method": "POST",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{admin_token}}"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"email\": \"newemployee@example.com\",\n  \"full_name\": \"New Employee\",\n  \"phone\": \"+2348012345678\",\n  \"role_id\": 3,\n  \"branch_id\": 1,\n  \"password\": \"password123\",\n  \"status\": \"active\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/users",
                "host": ["{{baseUrl}}"],
                "path": ["api", "users"]
              }
            },
            "response": []
          }
        ]
      },
      {
        "name": "Staff Management",
        "item": [
          {
            "name": "Get All Staff",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{admin_token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/staff",
                "host": ["{{baseUrl}}"],
                "path": ["api", "staff"]
              }
            },
            "response": []
          },
          {
            "name": "Create Staff",
            "request": {
              "method": "POST",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{admin_token}}"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"user_id\": 1,\n  \"designation\": \"Software Engineer\",\n  \"department\": \"IT\",\n  \"branch_id\": 1,\n  \"joining_date\": \"2023-01-15\",\n  \"status\": \"active\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/staff",
                "host": ["{{baseUrl}}"],
                "path": ["api", "staff"]
              }
            },
            "response": []
          }
        ]
      },
      {
        "name": "Roles Management",
        "item": [
          {
            "name": "Get All Roles",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{admin_token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/roles",
                "host": ["{{baseUrl}}"],
                "path": ["api", "roles"]
              }
            },
            "response": []
          }
        ]
      },
      {
        "name": "Forms Management",
        "item": [
          {
            "name": "Get All Forms",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{admin_token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/forms",
                "host": ["{{baseUrl}}"],
                "path": ["api", "forms"]
              }
            },
            "response": []
          }
        ]
      },
      {
        "name": "Leave Management",
        "item": [
          {
            "name": "Get All Leave Requests",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{admin_token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/leave",
                "host": ["{{baseUrl}}"],
                "path": ["api", "leave"]
              }
            },
            "response": []
          }
        ]
      },
      {
        "name": "Attendance Management",
        "item": [
          {
            "name": "Get Attendance Records",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{admin_token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/attendance",
                "host": ["{{baseUrl}}"],
                "path": ["api", "attendance"]
              }
            },
            "response": []
          }
        ]
      },
      {
        "name": "Payroll Management",
        "item": [
          {
            "name": "Get Payroll Records",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{admin_token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/payroll/records",
                "host": ["{{baseUrl}}"],
                "path": ["api", "payroll", "records"]
              }
            },
            "response": []
          }
        ]
      },
      {
        "name": "KPI & Appraisal Management",
        "item": [
          {
            "name": "Get All KPIs",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{admin_token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/kpis",
                "host": ["{{baseUrl}}"],
                "path": ["api", "kpis"]
              }
            },
            "response": []
          },
          {
            "name": "Get All Appraisals",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{admin_token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/appraisals",
                "host": ["{{baseUrl}}"],
                "path": ["api", "appraisals"]
              }
            },
            "response": []
          }
        ]
      },
      {
        "name": "Job Applications",
        "item": [
          {
            "name": "Get All Job Postings",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{admin_token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/job-postings",
                "host": ["{{baseUrl}}"],
                "path": ["api", "job-postings"]
              }
            },
            "response": []
          },
          {
            "name": "Submit Job Application",
            "request": {
              "method": "POST",
              "header": [
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"job_posting_id\": 1,\n  \"applicant_name\": \"Aduragba Tolu\",\n  \"applicant_email\": \"aduragbatolu@example.com\",\n  \"applicant_phone\": \"+2348012345678\",\n  \"cover_letter\": \"I am interested in this position and have the required skills.\",\n  \"resume_file_path\": \"/uploads/resumes/aduragba_resume.pdf\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/applications",
                "host": ["{{baseUrl}}"],
                "path": ["api", "applications"]
              }
            },
            "response": []
          }
        ]
      },
      {
        "name": "Scheduling & Holidays",
        "item": [
          {
            "name": "Get All Shift Timings",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{admin_token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/shift-timings",
                "host": ["{{baseUrl}}"],
                "path": ["api", "shift-timings"]
              }
            },
            "response": []
          },
          {
            "name": "Get All Holidays",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{admin_token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/holidays",
                "host": ["{{baseUrl}}"],
                "path": ["api", "holidays"]
              }
            },
            "response": []
          }
        ]
      },
      {
        "name": "Notifications",
        "item": [
          {
            "name": "Get User Notifications",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{admin_token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/notifications/my-notifications",
                "host": ["{{baseUrl}}"],
                "path": ["api", "notifications", "my-notifications"]
              }
            },
            "response": []
          }
        ]
      },
      {
        "name": "Reporting & Analytics",
        "item": [
          {
            "name": "Get Dashboard Summary",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{admin_token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/reports/dashboard-summary",
                "host": ["{{baseUrl}}"],
                "path": ["api", "reports", "dashboard-summary"]
              }
            },
            "response": []
          }
        ]
      }
    ],
    "variable": [
      {
        "key": "baseUrl",
        "value": "http://localhost:3000",
        "type": "string"
      },
      {
        "key": "admin_token",
        "value": "",
        "type": "string"
      },
      {
        "key": "employee_token",
        "value": "",
        "type": "string"
      }
    ]
  };
}

// Write the comprehensive test collection
const collection = createComprehensiveTestCollection();
const outputPath = path.join(__dirname, 'hr_management_comprehensive_test_suite.postman_collection.json');
fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));

console.log('Comprehensive test collection created successfully!');
console.log(`File saved as: ${outputPath}`);