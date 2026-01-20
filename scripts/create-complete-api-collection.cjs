const fs = require('fs');
const path = require('path');

// Create a comprehensive Postman collection with all endpoints
const fullCollection = {
  "info": {
    "_postman_id": "hr-management-full-api",
    "name": "HR Management System - Complete API Collection",
    "description": "Complete API collection for HR Management System with all endpoints and test data",
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
              "raw": "{{baseUrl}}/health",
              "host": ["{{baseUrl}}"],
              "path": ["health"]
            }
          },
          "response": []
        },
        {
          "name": "API Health Check",
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
          "name": "API Health Details",
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
          "name": "Staff Login",
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
                  "pm.test(\"Staff Login Successful\", function () {",
                  "    pm.response.to.have.status(200);",
                  "    var jsonData = pm.response.json();",
                  "    pm.environment.set(\"staff_token\", jsonData.data.token);",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "response": []
        },
        {
          "name": "Refresh Token",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/auth/refresh",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "refresh"]
            }
          },
          "response": []
        },
        {
          "name": "Logout",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/auth/logout",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "logout"]
            }
          },
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
          "name": "Get User by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/users/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "users", "1"]
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
        },
        {
          "name": "Update User",
          "request": {
            "method": "PUT",
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
              "raw": "{\n  \"full_name\": \"Updated Name\",\n  \"phone\": \"+2348012345679\",\n  \"role_id\": 3,\n  \"branch_id\": 1,\n  \"status\": \"active\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/users/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "users", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Delete User",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/users/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "users", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Get Own Profile",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/users/profile",
              "host": ["{{baseUrl}}"],
              "path": ["api", "users", "profile"]
            }
          },
          "response": []
        },
        {
          "name": "Update Own Profile",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"full_name\": \"Updated Staff Name\",\n  \"phone\": \"+2348012345679\",\n  \"branch_id\": 1\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/users/profile",
              "host": ["{{baseUrl}}"],
              "path": ["api", "users", "profile"]
            }
          },
          "response": []
        },
        {
          "name": "Change Password",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"current_password\": \"employee123\",\n  \"new_password\": \"newpassword123\",\n  \"confirm_new_password\": \"newpassword123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/password-change",
              "host": ["{{baseUrl}}"],
              "path": ["api", "password-change"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Role Management",
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
        },
        {
          "name": "Get Role by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/roles/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "roles", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Create Role",
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
              "raw": "{\n  \"name\": \"New Role\",\n  \"description\": \"Description of new role\",\n  \"permissions\": [\"staff:read\", \"leave:create\"]\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/roles",
              "host": ["{{baseUrl}}"],
              "path": ["api", "roles"]
            }
          },
          "response": []
        },
        {
          "name": "Update Role",
          "request": {
            "method": "PUT",
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
              "raw": "{\n  \"name\": \"Updated Role Name\",\n  \"description\": \"Updated description\",\n  \"permissions\": [\"staff:read\", \"leave:create\", \"payroll:view\"]\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/roles/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "roles", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Delete Role",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/roles/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "roles", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Get Role Permissions",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/role-permissions/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "role-permissions", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Update Role Permissions",
          "request": {
            "method": "PUT",
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
              "raw": "{\n  \"permissions\": [\"staff:read\", \"leave:create\", \"payroll:view\"]\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/role-permissions/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "role-permissions", "1"]
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
          "name": "Get Staff by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/staff/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "staff", "1"]
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
        },
        {
          "name": "Update Staff",
          "request": {
            "method": "PUT",
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
              "raw": "{\n  \"designation\": \"Senior Software Engineer\",\n  \"department\": \"IT\",\n  \"branch_id\": 1,\n  \"status\": \"active\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/staff/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "staff", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Delete Staff",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/staff/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "staff", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Get Own Staff Details",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/staff/me",
              "host": ["{{baseUrl}}"],
              "path": ["api", "staff", "me"]
            }
          },
          "response": []
        },
        {
          "name": "Update Own Staff Details",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"designation\": \"Updated Designation\",\n  \"department\": \"Updated Department\",\n  \"branch_id\": 1,\n  \"status\": \"active\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/staff/me",
              "host": ["{{baseUrl}}"],
              "path": ["api", "staff", "me"]
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
          "name": "Get All Leave Types",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/leave/types",
              "host": ["{{baseUrl}}"],
              "path": ["api", "leave", "types"]
            }
          },
          "response": []
        },
        {
          "name": "Get Leave Type by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/leave/types/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "leave", "types", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Create Leave Type",
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
              "raw": "{\n  \"name\": \"Casual Leave\",\n  \"description\": \"Casual leave for personal reasons\",\n  \"days_per_year\": 10,\n  \"is_paid\": true,\n  \"allow_carryover\": true,\n  \"carryover_limit\": 5,\n  \"expiry_rule_id\": 1\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/leave/types",
              "host": ["{{baseUrl}}"],
              "path": ["api", "leave", "types"]
            }
          },
          "response": []
        },
        {
          "name": "Update Leave Type",
          "request": {
            "method": "PUT",
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
              "raw": "{\n  \"name\": \"Updated Casual Leave\",\n  \"description\": \"Updated description\",\n  \"days_per_year\": 12,\n  \"is_paid\": true,\n  \"allow_carryover\": true,\n  \"carryover_limit\": 6\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/leave/types/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "leave", "types", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Delete Leave Type",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/leave/types/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "leave", "types", "1"]
            }
          },
          "response": []
        },
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
        },
        {
          "name": "Get Leave Request by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/leave/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "leave", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Submit Leave Request",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"leave_type_id\": 1,\n  \"start_date\": \"2026-02-01\",\n  \"end_date\": \"2026-02-05\",\n  \"days_requested\": 5,\n  \"reason\": \"Personal reasons\",\n  \"attachments\": []\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/leave",
              "host": ["{{baseUrl}}"],
              "path": ["api", "leave"]
            }
          },
          "response": []
        },
        {
          "name": "Update Leave Request",
          "request": {
            "method": "PUT",
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
              "raw": "{\n  \"status\": \"approved\",\n  \"reason\": \"Updated reason for approval\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/leave/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "leave", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Cancel Leave Request",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/leave/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "leave", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Get Own Leave Requests",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/leave/my-requests",
              "host": ["{{baseUrl}}"],
              "path": ["api", "leave", "my-requests"]
            }
          },
          "response": []
        },
        {
          "name": "Get Leave Allocations",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/leave/allocations",
              "host": ["{{baseUrl}}"],
              "path": ["api", "leave", "allocations"]
            }
          },
          "response": []
        },
        {
          "name": "Get Leave Allocation by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/leave/allocations/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "leave", "allocations", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Create Leave Allocation",
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
              "raw": "{\n  \"user_id\": 1,\n  \"leave_type_id\": 1,\n  \"allocated_days\": 20,\n  \"used_days\": 0,\n  \"carried_over_days\": 0,\n  \"cycle_start_date\": \"2026-01-01\",\n  \"cycle_end_date\": \"2026-12-31\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/leave/allocations",
              "host": ["{{baseUrl}}"],
              "path": ["api", "leave", "allocations"]
            }
          },
          "response": []
        },
        {
          "name": "Get Leave Allocation Balance",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/leave/allocations/balance",
              "host": ["{{baseUrl}}"],
              "path": ["api", "leave", "allocations", "balance"]
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
          "name": "Get All Attendance Records",
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
        },
        {
          "name": "Get Attendance by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/attendance/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "attendance", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Create Attendance Record",
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
              "raw": "{\n  \"user_id\": 1,\n  \"date\": \"2026-01-20\",\n  \"check_in_time\": \"08:30:00\",\n  \"check_out_time\": \"17:00:00\",\n  \"status\": \"present\",\n  \"location\": \"Office\",\n  \"notes\": \"Normal attendance\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/attendance",
              "host": ["{{baseUrl}}"],
              "path": ["api", "attendance"]
            }
          },
          "response": []
        },
        {
          "name": "Update Attendance Record",
          "request": {
            "method": "PUT",
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
              "raw": "{\n  \"check_in_time\": \"08:45:00\",\n  \"check_out_time\": \"17:15:00\",\n  \"status\": \"late\",\n  \"notes\": \"Came in late today\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/attendance/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "attendance", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Delete Attendance Record",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/attendance/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "attendance", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Mark Attendance Check-In",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"date\": \"2026-01-20\",\n  \"check_in_time\": \"08:30:00\",\n  \"location\": \"Office\",\n  \"status\": \"present\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/attendance/check-in",
              "host": ["{{baseUrl}}"],
              "path": ["api", "attendance", "check-in"]
            }
          },
          "response": []
        },
        {
          "name": "Mark Attendance Check-Out",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"date\": \"2026-01-20\",\n  \"check_out_time\": \"17:00:00\",\n  \"location\": \"Office\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/attendance/check-out",
              "host": ["{{baseUrl}}"],
              "path": ["api", "attendance", "check-out"]
            }
          },
          "response": []
        },
        {
          "name": "Get Own Attendance Records",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/attendance/my-records",
              "host": ["{{baseUrl}}"],
              "path": ["api", "attendance", "my-records"]
            }
          },
          "response": []
        },
        {
          "name": "Get Attendance Summary",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/attendance/summary",
              "host": ["{{baseUrl}}"],
              "path": ["api", "attendance", "summary"]
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
          "name": "Get All Payment Types",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/payment-types",
              "host": ["{{baseUrl}}"],
              "path": ["api", "payment-types"]
            }
          },
          "response": []
        },
        {
          "name": "Get Payment Type by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/payment-types/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "payment-types", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Create Payment Type",
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
              "raw": "{\n  \"name\": \"Basic Salary\",\n  \"payment_category\": \"earning\",\n  \"calculation_type\": \"fixed\",\n  \"value\": 100000,\n  \"description\": \"Basic monthly salary\",\n  \"applies_to_all\": true\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/payment-types",
              "host": ["{{baseUrl}}"],
              "path": ["api", "payment-types"]
            }
          },
          "response": []
        },
        {
          "name": "Update Payment Type",
          "request": {
            "method": "PUT",
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
              "raw": "{\n  \"name\": \"Updated Basic Salary\",\n  \"description\": \"Updated description\",\n  \"value\": 120000\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/payment-types/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "payment-types", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Delete Payment Type",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/payment-types/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "payment-types", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Get Staff Payment Structure",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/staff-payment-structures",
              "host": ["{{baseUrl}}"],
              "path": ["api", "staff-payment-structures"]
            }
          },
          "response": []
        },
        {
          "name": "Get Staff Payment Structure by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/staff-payment-structures/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "staff-payment-structures", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Create Staff Payment Structure",
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
              "raw": "{\n  \"staff_id\": 1,\n  \"payment_type_id\": 1,\n  \"value\": 100000,\n  \"effective_from\": \"2026-01-01\",\n  \"description\": \"Monthly basic salary\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/staff-payment-structures",
              "host": ["{{baseUrl}}"],
              "path": ["api", "staff-payment-structures"]
            }
          },
          "response": []
        },
        {
          "name": "Get All Payroll Runs",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/payroll/runs",
              "host": ["{{baseUrl}}"],
              "path": ["api", "payroll", "runs"]
            }
          },
          "response": []
        },
        {
          "name": "Get Payroll Run by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/payroll/runs/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "payroll", "runs", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Create Payroll Run",
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
              "raw": "{\n  \"month\": \"January\",\n  \"year\": 2026,\n  \"branch_id\": 1,\n  \"description\": \"January 2026 payroll run\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/payroll/runs",
              "host": ["{{baseUrl}}"],
              "path": ["api", "payroll", "runs"]
            }
          },
          "response": []
        },
        {
          "name": "Get All Payroll Records",
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
        },
        {
          "name": "Get Payroll Record by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/payroll/records/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "payroll", "records", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Get Own Payroll History",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/staff/1/payroll-history",
              "host": ["{{baseUrl}}"],
              "path": ["api", "staff", "1", "payroll-history"]
            }
          },
          "response": []
        },
        {
          "name": "Generate Payslip",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/payslips/view/1/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "payslips", "view", "1", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Download Payslip",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/payslips/download/1/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "payslips", "download", "1", "1"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "KPI & Performance Management",
      "item": [
        {
          "name": "Get All KPI Definitions",
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
          "name": "Get KPI by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/kpis/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "kpis", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Create KPI Definition",
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
              "raw": "{\n  \"name\": \"Customer Satisfaction Score\",\n  \"metric_type\": \"numeric\",\n  \"target_value\": 4.5,\n  \"unit\": \"rating\",\n  \"calculation_formula\": \"(positive_responses / total_responses) * 5\",\n  \"weight\": 20,\n  \"data_source\": \"system\",\n  \"department_id\": 1,\n  \"role_id\": 1\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/kpis",
              "host": ["{{baseUrl}}"],
              "path": ["api", "kpis"]
            }
          },
          "response": []
        },
        {
          "name": "Update KPI Definition",
          "request": {
            "method": "PUT",
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
              "raw": "{\n  \"name\": \"Updated Customer Satisfaction Score\",\n  \"target_value\": 4.7,\n  \"weight\": 25\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/kpis/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "kpis", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Get All KPI Assignments",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/kpi-assignments",
              "host": ["{{baseUrl}}"],
              "path": ["api", "kpi-assignments"]
            }
          },
          "response": []
        },
        {
          "name": "Create KPI Assignment",
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
              "raw": "{\n  \"user_id\": 1,\n  \"kpi_definition_id\": 1,\n  \"cycle_start_date\": \"2026-01-01\",\n  \"cycle_end_date\": \"2026-12-31\",\n  \"custom_target_value\": 4.8,\n  \"notes\": \"Quarterly customer satisfaction target\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/kpi-assignments",
              "host": ["{{baseUrl}}"],
              "path": ["api", "kpi-assignments"]
            }
          },
          "response": []
        },
        {
          "name": "Get All KPI Scores",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/kpi-scores",
              "host": ["{{baseUrl}}"],
              "path": ["api", "kpi-scores"]
            }
          },
          "response": []
        },
        {
          "name": "Get KPI Scores by Assignment",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/kpi-scores/assignment/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "kpi-scores", "assignment", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Get All Appraisal Templates",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/appraisal-templates",
              "host": ["{{baseUrl}}"],
              "path": ["api", "appraisal-templates"]
            }
          },
          "response": []
        },
        {
          "name": "Create Appraisal Template",
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
              "raw": "{\n  \"name\": \"Annual Performance Review\",\n  \"description\": \"Annual performance review template\",\n  \"department_id\": 1,\n  \"role_id\": 1,\n  \"formula_definition\": \"(KPI1 * 0.4) + (KPI2 * 0.3) + (KPI3 * 0.3)\",\n  \"weight_distribution\": {\"KPI1\": 40, \"KPI2\": 30, \"KPI3\": 30}\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/appraisal-templates",
              "host": ["{{baseUrl}}"],
              "path": ["api", "appraisal-templates"]
            }
          },
          "response": []
        },
        {
          "name": "Get All Appraisal Cycles",
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
        },
        {
          "name": "Get Appraisal by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/appraisals/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "appraisals", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Get Assigned KPIs",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/kpis/assignments",
              "host": ["{{baseUrl}}"],
              "path": ["api", "kpis", "assignments"]
            }
          },
          "response": []
        },
        {
          "name": "Get Own KPI Scores",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/kpi-scores/my-scores",
              "host": ["{{baseUrl}}"],
              "path": ["api", "kpi-scores", "my-scores"]
            }
          },
          "response": []
        },
        {
          "name": "Submit Self-Assessment",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"appraisal_assignment_id\": 1,\n  \"scores\": {\n    \"kpi1\": 4.5,\n    \"kpi2\": 4.2,\n    \"kpi3\": 4.8\n  },\n  \"comments\": \"Self-assessment for Q4 2025\",\n  \"supporting_evidence\": []\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/appraisals/self-assessment",
              "host": ["{{baseUrl}}"],
              "path": ["api", "appraisals", "self-assessment"]
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
        },
        {
          "name": "Get Form by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/forms/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "forms", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Create Form",
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
              "raw": "{\n  \"name\": \"Leave Request Form\",\n  \"description\": \"Form for requesting leave\",\n  \"form_type\": \"leave_request\",\n  \"branch_id\": 1,\n  \"is_active\": true\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/forms",
              "host": ["{{baseUrl}}"],
              "path": ["api", "forms"]
            }
          },
          "response": []
        },
        {
          "name": "Update Form",
          "request": {
            "method": "PUT",
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
              "raw": "{\n  \"name\": \"Updated Leave Request Form\",\n  \"description\": \"Updated description\",\n  \"is_active\": true\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/forms/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "forms", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Delete Form",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/forms/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "forms", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Get Form Fields",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/forms/1/fields",
              "host": ["{{baseUrl}}"],
              "path": ["api", "forms", "1", "fields"]
            }
          },
          "response": []
        },
        {
          "name": "Add Form Field",
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
              "raw": "{\n  \"field_name\": \"reason_for_leave\",\n  \"field_label\": \"Reason for Leave\",\n  \"field_type\": \"textarea\",\n  \"is_required\": true,\n  \"validation_rule\": \"min_length:10\",\n  \"field_order\": 3\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/forms/1/fields",
              "host": ["{{baseUrl}}"],
              "path": ["api", "forms", "1", "fields"]
            }
          },
          "response": []
        },
        {
          "name": "Get All Form Submissions",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/forms/submissions",
              "host": ["{{baseUrl}}"],
              "path": ["api", "forms", "submissions"]
            }
          },
          "response": []
        },
        {
          "name": "Submit Form",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"form_id\": 1,\n  \"submission_data\": {\n    \"field1\": \"value1\",\n    \"field2\": \"value2\"\n  },\n  \"attachments\": []\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/forms/1/submit",
              "host": ["{{baseUrl}}"],
              "path": ["api", "forms", "1", "submit"]
            }
          },
          "response": []
        },
        {
          "name": "Get Own Submissions",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/forms/submissions/my-submissions",
              "host": ["{{baseUrl}}"],
              "path": ["api", "forms", "submissions", "my-submissions"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Shift Scheduling & Time Off Banks",
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
          "name": "Get Shift Timing by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/shift-timings/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "shift-timings", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Create Shift Timing",
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
              "raw": "{\n  \"user_id\": 1,\n  \"shift_name\": \"Morning Shift\",\n  \"start_time\": \"08:00:00\",\n  \"end_time\": \"16:00:00\",\n  \"effective_from\": \"2026-01-01\",\n  \"effective_to\": \"2026-12-31\",\n  \"override_branch_id\": 1\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/shift-timings",
              "host": ["{{baseUrl}}"],
              "path": ["api", "shift-timings"]
            }
          },
          "response": []
        },
        {
          "name": "Update Shift Timing",
          "request": {
            "method": "PUT",
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
              "raw": "{\n  \"shift_name\": \"Updated Morning Shift\",\n  \"start_time\": \"08:30:00\",\n  \"end_time\": \"16:30:00\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/shift-timings/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "shift-timings", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Get All Time Off Banks",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/shift-scheduling/time-off-banks",
              "host": ["{{baseUrl}}"],
              "path": ["api", "shift-scheduling", "time-off-banks"]
            }
          },
          "response": []
        },
        {
          "name": "Get My Time Off Bank Balance",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/shift-scheduling/time-off-banks/my-balance",
              "host": ["{{baseUrl}}"],
              "path": ["api", "shift-scheduling", "time-off-banks", "my-balance"]
            }
          },
          "response": []
        },
        {
          "name": "Create Time Off Bank",
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
              "raw": "{\n  \"user_id\": 2,\n  \"program_name\": \"Sunday Compensatory Time\",\n  \"description\": \"Time off bank for employees who worked on Sundays\",\n  \"total_entitled_days\": 5,\n  \"valid_from\": \"2026-01-01\",\n  \"valid_to\": \"2026-12-31\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/shift-scheduling/time-off-banks",
              "host": ["{{baseUrl}}"],
              "path": ["api", "shift-scheduling", "time-off-banks"]
            }
          },
          "response": []
        },
        {
          "name": "Get All Schedule Requests",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/shift-scheduling/schedule-requests",
              "host": ["{{baseUrl}}"],
              "path": ["api", "shift-scheduling", "schedule-requests"]
            }
          },
          "response": []
        },
        {
          "name": "Get My Schedule Requests",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/shift-scheduling/schedule-requests",
              "host": ["{{baseUrl}}"],
              "path": ["api", "shift-scheduling", "schedule-requests"]
            }
          },
          "response": []
        },
        {
          "name": "Submit Schedule Request",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"request_type\": \"time_off_request\",\n  \"request_subtype\": \"compensatory_time_use\",\n  \"requested_date\": \"2026-02-01\",\n  \"requested_duration_days\": 1,\n  \"reason\": \"Using compensatory time for Sunday work\",\n  \"scheduled_for\": \"2026-02-01\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/shift-scheduling/schedule-requests",
              "host": ["{{baseUrl}}"],
              "path": ["api", "shift-scheduling", "schedule-requests"]
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
        },
        {
          "name": "Create Holiday",
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
              "raw": "{\n  \"holiday_name\": \"New Year\",\n  \"date\": \"2026-01-01\",\n  \"is_mandatory\": true,\n  \"description\": \"New Year Holiday\",\n  \"branch_id\": 1\n}"
            },
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
          "name": "Get All Notifications",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/notifications",
              "host": ["{{baseUrl}}"],
              "path": ["api", "notifications"]
            }
          },
          "response": []
        },
        {
          "name": "Get My Notifications",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/notifications/my-notifications",
              "host": ["{{baseUrl}}"],
              "path": ["api", "notifications", "my-notifications"]
            }
          },
          "response": []
        },
        {
          "name": "Mark Notification as Read",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/notifications/1/read",
              "host": ["{{baseUrl}}"],
              "path": ["api", "notifications", "1", "read"]
            }
          },
          "response": []
        },
        {
          "name": "Get Notification Preferences",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{staff_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/notifications/preferences",
              "host": ["{{baseUrl}}"],
              "path": ["api", "notifications", "preferences"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Job Applications & Recruitment",
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
          "name": "Get Job Posting by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/job-postings/1",
              "host": ["{{baseUrl}}"],
              "path": ["api", "job-postings", "1"]
            }
          },
          "response": []
        },
        {
          "name": "Create Job Posting",
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
              "raw": "{\n  \"title\": \"Software Engineer\",\n  \"description\": \"Looking for experienced software engineers\",\n  \"department\": \"IT\",\n  \"location\": \"Lagos\",\n  \"salary_range_min\": 150000,\n  \"salary_range_max\": 250000,\n  \"posted_by\": 1\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/job-postings",
              "host": ["{{baseUrl}}"],
              "path": ["api", "job-postings"]
            }
          },
          "response": []
        },
        {
          "name": "Get All Job Applications",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/applications",
              "host": ["{{baseUrl}}"],
              "path": ["api", "applications"]
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
        },
        {
          "name": "Get My Applications",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/api/applications/my-applications/aduragbatolu@example.com",
              "host": ["{{baseUrl}}"],
              "path": ["api", "applications", "my-applications", "aduragbatolu@example.com"]
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
        },
        {
          "name": "Get Attendance Analytics",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/reports/attendance-analytics",
              "host": ["{{baseUrl}}"],
              "path": ["api", "reports", "attendance-analytics"]
            }
          },
          "response": []
        },
        {
          "name": "Get Leave Utilization Report",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/reports/leave-utilization",
              "host": ["{{baseUrl}}"],
              "path": ["api", "reports", "leave-utilization"]
            }
          },
          "response": []
        },
        {
          "name": "Get Payroll Summary Report",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/reports/payroll-summary",
              "host": ["{{baseUrl}}"],
              "path": ["api", "reports", "payroll-summary"]
            }
          },
          "response": []
        },
        {
          "name": "Get Performance Analytics",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/reports/performance-analytics",
              "host": ["{{baseUrl}}"],
              "path": ["api", "reports", "performance-analytics"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "System Initialization",
      "item": [
        {
          "name": "Initialize Complete System",
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
              "raw": "{\n  \"admin_email\": \"oluwarotimiadewumi@gmail.com\",\n  \"admin_password\": \"admin123\",\n  \"company_name\": \"Tripa HR Solutions\",\n  \"initial_branches\": [\n    {\n      \"name\": \"Head Office\",\n      \"location\": \"Lagos\"\n    }\n  ],\n  \"initial_departments\": [\n    {\n      \"name\": \"Human Resources\",\n      \"description\": \"HR Department\"\n    }\n  ]\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/system-complete/setup-complete",
              "host": ["{{baseUrl}}"],
              "path": ["api", "system-complete", "setup-complete"]
            }
          },
          "response": []
        },
        {
          "name": "Check Initialization Status",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/api/system-complete/check-status",
              "host": ["{{baseUrl}}"],
              "path": ["api", "system-complete", "check-status"]
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
      "key": "staff_token",
      "value": "",
      "type": "string"
    }
  ]
};

// Write the complete collection
const outputPath = path.join(__dirname, 'hr_management_system_complete_api.postman_collection.json');
fs.writeFileSync(outputPath, JSON.stringify(fullCollection, null, 2));

console.log('Complete HR Management System Postman collection created successfully!');
console.log(`File saved as: ${outputPath}`);