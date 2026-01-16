# HR Management System API Documentation

## Base URL
`http://localhost:3000/api`

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## System Initialization

### Initialize Complete System
**POST** `/system-complete/setup-complete`

Initialize the complete system (runs migrations and creates Super Admin)

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "securePassword123",
  "fullName": "John Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "System initialized successfully...",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "fullName": "John Doe",
      "roleId": 1
    },
    "token": "jwt_token_here"
  }
}
```

### Check System Readiness
**GET** `/system-complete/readiness`

Check if the system is ready for initialization

**Response:**
```json
{
  "success": true,
  "data": {
    "schemaExists": true,
    "systemInitialized": true,
    "readyForInitialization": false
  }
}
```

## System Initialization (Alternative)

### Check Initialization Status
**GET** `/system/status`

Check if the system is already initialized

**Response:**
```json
{
  "success": true,
  "data": {
    "isInitialized": true
  }
}
```

### Initialize System (Without Migrations)
**POST** `/system/initialize`

Initialize the system assuming database schema exists

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "securePassword123",
  "fullName": "John Doe",
  "phone": "+1234567890"
}
```

## Role Management

### Get Available Permissions
**GET** `/role-management/permissions`

Get all available permissions for role creation

**Response:**
```json
{
  "success": true,
  "data": {
    "permissions": [...],
    "categories": [...]
  }
}
```

### Create Role
**POST** `/role-management`

Create a new role with selected permissions

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "HR Manager",
  "description": "Human Resources Manager",
  "permissions": ["staff:create", "staff:read", "staff:update"]
}
```

### Get All Roles
**GET** `/role-management`

Get all available roles

**Headers:**
```
Authorization: Bearer <token>
```

## Staff Invitation

### Invite Staff Member
**POST** `/staff-invitation`

Invite a new staff member and create their professional email account

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "personalEmail": "jane.personal@email.com",
  "phone": "+1987654321",
  "roleId": 2,
  "branchId": 1,
  "departmentId": 1
}
```

### Get Available Roles for Assignment
**GET** `/staff-invitation/roles`

Get all available roles for staff assignment

**Headers:**
```
Authorization: Bearer <token>
```

### Get Available Branches for Assignment
**GET** `/staff-invitation/branches`

Get all available branches for staff assignment

**Headers:**
```
Authorization: Bearer <token>
```

### Get Available Departments for Assignment
**GET** `/staff-invitation/departments`

Get all available departments for staff assignment

**Headers:**
```
Authorization: Bearer <token>
```

## Authentication

### Login
**POST** `/auth/login`

Authenticate user and get JWT token

**Body:**
```json
{
  "email": "user@example.com",
  "password": "userPassword123"
}
```

### Change Password
**POST** `/password-change/change`

Change user password

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

## Other Available Endpoints

The system also supports all standard HR operations:
- `/api/users` - User management
- `/api/staff` - Staff management
- `/api/roles` - Role management
- `/api/forms` - Form management
- `/api/leave` - Leave management
- `/api/attendance` - Attendance tracking
- `/api/payroll-runs` - Payroll management
- `/api/kpis` - KPI management
- `/api/appraisals` - Appraisal management
- And many more...