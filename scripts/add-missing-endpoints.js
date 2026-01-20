import fs from 'fs';

// Read the existing Postman collection
const collectionPath = './hr_management_system_complete.postman_collection.json';
const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

// Define the missing endpoints to add to each section
const leaveTypeEndpoints = [
  {
    "name": "Get Leave Type by ID",
    "request": {
      "method": "GET",
      "header": [
        {
          "key": "Authorization",
          "value": "Bearer {{accessToken}}"
        }
      ],
      "url": {
        "raw": "{{baseUrl}}/api/leave-types/{{leaveTypeId}}",
        "host": ["{{baseUrl}}"],
        "path": ["api", "leave-types", "{{leaveTypeId}}"]
      },
      "description": "Retrieve a specific leave type by ID"
    },
    "response": []
  },
  {
    "name": "Create Leave Type",
    "request": {
      "method": "POST",
      "header": [
        {
          "key": "Content-Type",
          "value": "application/json"
        },
        {
          "key": "Authorization",
          "value": "Bearer {{accessToken}}"
        }
      ],
      "body": {
        "mode": "raw",
        "raw": "{\n  \"name\": \"Annual Leave\",\n  \"days_per_year\": 20,\n  \"is_paid\": true,\n  \"allow_carryover\": true,\n  \"carryover_limit\": 5\n}"
      },
      "url": {
        "raw": "{{baseUrl}}/api/leave-types",
        "host": ["{{baseUrl}}"],
        "path": ["api", "leave-types"]
      },
      "description": "Create a new leave type"
    },
    "response": []
  },
  {
    "name": "Update Leave Type",
    "request": {
      "method": "PUT",
      "header": [
        {
          "key": "Content-Type",
          "value": "application/json"
        },
        {
          "key": "Authorization",
          "value": "Bearer {{accessToken}}"
        }
      ],
      "body": {
        "mode": "raw",
        "raw": "{\n  \"name\": \"Updated Annual Leave\",\n  \"days_per_year\": 25,\n  \"is_paid\": true\n}"
      },
      "url": {
        "raw": "{{baseUrl}}/api/leave-types/{{leaveTypeId}}",
        "host": ["{{baseUrl}}"],
        "path": ["api", "leave-types", "{{leaveTypeId}}"]
      },
      "description": "Update an existing leave type"
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
          "value": "Bearer {{accessToken}}"
        }
      ],
      "url": {
        "raw": "{{baseUrl}}/api/leave-types/{{leaveTypeId}}",
        "host": ["{{baseUrl}}"],
        "path": ["api", "leave-types", "{{leaveTypeId}}"]
      },
      "description": "Delete (deactivate) a leave type"
    },
    "response": []
  }
];

const rolePermissionEndpoints = [
  {
    "name": "Get Role Permissions",
    "request": {
      "method": "GET",
      "header": [
        {
          "key": "Authorization",
          "value": "Bearer {{accessToken}}"
        }
      ],
      "url": {
        "raw": "{{baseUrl}}/api/permissions/roles/{{roleId}}/permissions",
        "host": ["{{baseUrl}}"],
        "path": ["api", "permissions", "roles", "{{roleId}}", "permissions"]
      },
      "description": "Get permissions assigned to a specific role"
    },
    "response": []
  },
  {
    "name": "Assign Multiple Permissions to Role",
    "request": {
      "method": "POST",
      "header": [
        {
          "key": "Content-Type",
          "value": "application/json"
        },
        {
          "key": "Authorization",
          "value": "Bearer {{accessToken}}"
        }
      ],
      "body": {
        "mode": "raw",
        "raw": "{\n  \"permissions\": [\"user.create\", \"user.read\"]\n}"
      },
      "url": {
        "raw": "{{baseUrl}}/api/permissions/roles/{{roleId}}/permissions",
        "host": ["{{baseUrl}}"],
        "path": ["api", "permissions", "roles", "{{roleId}}", "permissions"]
      },
      "description": "Assign multiple permissions to a role"
    },
    "response": []
  },
  {
    "name": "Remove Multiple Permissions from Role",
    "request": {
      "method": "DELETE",
      "header": [
        {
          "key": "Content-Type",
          "value": "application/json"
        },
        {
          "key": "Authorization",
          "value": "Bearer {{accessToken}}"
        }
      ],
      "body": {
        "mode": "raw",
        "raw": "{\n  \"permissions\": [\"user.create\", \"user.read\"]\n}"
      },
      "url": {
        "raw": "{{baseUrl}}/api/permissions/roles/{{roleId}}/permissions",
        "host": ["{{baseUrl}}"],
        "path": ["api", "permissions", "roles", "{{roleId}}", "permissions"]
      },
      "description": "Remove multiple permissions from a role"
    },
    "response": []
  }
];

const passwordChangeEndpoints = [
  {
    "name": "Change Password After First Login",
    "request": {
      "method": "POST",
      "header": [
        {
          "key": "Content-Type",
          "value": "application/json"
        },
        {
          "key": "Authorization",
          "value": "Bearer {{accessToken}}"
        }
      ],
      "body": {
        "mode": "raw",
        "raw": "{\n  \"currentPassword\": \"temporaryPassword\",\n  \"newPassword\": \"secureNewPassword\"\n}"
      },
      "url": {
        "raw": "{{baseUrl}}/api/password-change/change",
        "host": ["{{baseUrl}}"],
        "path": ["api", "password-change", "change"]
      },
      "description": "Change password after first login"
    },
    "response": []
  },
  {
    "name": "Force Password Change for User",
    "request": {
      "method": "PATCH",
      "header": [
        {
          "key": "Content-Type",
          "value": "application/json"
        },
        {
          "key": "Authorization",
          "value": "Bearer {{accessToken}}"
        }
      ],
      "body": {
        "mode": "raw",
        "raw": "{\n  \"newPassword\": \"forcedNewPassword\",\n  \"resetRequired\": true\n}"
      },
      "url": {
        "raw": "{{baseUrl}}/api/password-change/force/{{userId}}",
        "host": ["{{baseUrl}}"],
        "path": ["api", "password-change", "force", "{{userId}}"]
      },
      "description": "Force password change for a specific user (admin only)"
    },
    "response": []
  }
];

// Find the Leave section and add the leave type endpoints if they don't already exist
const leaveSection = collection.item.find(section => section.name === "Leave");
if (leaveSection) {
  // Check which leave type endpoints already exist
  const existingLeaveTypeNames = new Set(leaveSection.item.map(item => item.name));
  const newLeaveTypeEndpoints = leaveTypeEndpoints.filter(endpoint => !existingLeaveTypeNames.has(endpoint.name));

  if (newLeaveTypeEndpoints.length > 0) {
    leaveSection.item = [...leaveSection.item, ...newLeaveTypeEndpoints];
    console.log(`Added ${newLeaveTypeEndpoints.length} leave type endpoints to the Leave section`);
  } else {
    console.log("Leave Type endpoints already exist in the Leave section");
  }
} else {
  console.log("Leave section not found!");
}

// Find the Role Management section and add the role permission endpoints if they don't already exist
const roleManagementSection = collection.item.find(section => section.name === "Role Management");
if (roleManagementSection) {
  // Check which role permission endpoints already exist
  const existingRolePermissionNames = new Set(roleManagementSection.item.map(item => item.name));
  const newRolePermissionEndpoints = rolePermissionEndpoints.filter(endpoint => !existingRolePermissionNames.has(endpoint.name));

  if (newRolePermissionEndpoints.length > 0) {
    roleManagementSection.item = [...roleManagementSection.item, ...newRolePermissionEndpoints];
    console.log(`Added ${newRolePermissionEndpoints.length} role permission endpoints to the Role Management section`);
  } else {
    console.log("Role Permission endpoints already exist in the Role Management section");
  }
} else {
  console.log("Role Management section not found!");
}

// Find or create a Users section for password change endpoints if they don't already exist
let usersSection = collection.item.find(section => section.name === "Users");
if (usersSection) {
  // Check which password change endpoints already exist
  const existingPasswordChangeNames = new Set(usersSection.item.map(item => item.name));
  const newPasswordChangeEndpoints = passwordChangeEndpoints.filter(endpoint => !existingPasswordChangeNames.has(endpoint.name));

  if (newPasswordChangeEndpoints.length > 0) {
    usersSection.item = [...usersSection.item, ...newPasswordChangeEndpoints];
    console.log(`Added ${newPasswordChangeEndpoints.length} password change endpoints to the Users section`);
  } else {
    console.log("Password Change endpoints already exist in the Users section");
  }
} else {
  // If Users section doesn't exist, create it
  usersSection = {
    "name": "Users",
    "item": [...passwordChangeEndpoints]
  };
  collection.item.push(usersSection);
  console.log(`Created Users section and added ${passwordChangeEndpoints.length} password change endpoints`);
}

// Write the updated collection back to the file
fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));

console.log('\nPostman collection updated successfully with all missing endpoints!');