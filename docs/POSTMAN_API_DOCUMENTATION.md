# HR Management System - API Documentation

## Overview

This documentation covers the HR Management System API endpoints, focusing on **Attendance** and **Leave Management** as the core modules. All API requests require JWT authentication unless specified otherwise.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users Management](#users-management)
3. [Staff Management](#staff-management)
4. [Roles & Permissions](#roles--permissions)
5. [Branches Management](#branches-management)
6. [Departments Management](#departments-management)
7. [Attendance Management (Core Module)](#attendance-management)
8. [Leave Management (Core Module)](#leave-management)

---

## Base URL

```
http://localhost:3000/api
```

---

## Authentication

### 1. Login

**POST** `/auth/login`

Authenticate user and receive access token.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@company.co.ke",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@company.co.ke",
      "full_name": "Admin User",
      "role_id": 1
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpc2lzYXJlZnJlc2h0b2tlbi4uLg=="
  }
}
```

---

### 2. Logout

**POST** `/auth/logout`

Logout and invalidate the current token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 3. Refresh Token

**POST** `/auth/refresh`

Get new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "dGhpc2lzYXJlZnJlc2h0b2tlbi4uLg=="
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "bmV3cmVmcmVzaHRva2VuLi4u"
  }
}
```

---

### 4. Get User Permissions

**GET** `/auth/permissions`

Get current user's permissions.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "permissions": ["users:read", "users:update", "attendance:read", "attendance:manage"]
  }
}
```

---

## Users Management

### 1. Get All Users

**GET** `/users`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type   | Description         |
|-----------|--------|---------------------|
| page      | number | Page number (default: 1) |
| limit     | number | Items per page (default: 20) |

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "email": "admin@company.co.ke",
        "full_name": "Admin User",
        "role_id": 1,
        "branch_id": 1,
        "status": "active",
        "created_at": "2025-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_records": 50,
      "total_pages": 3
    }
  }
}
```

---

### 2. Get User by ID

**GET** `/users/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@company.co.ke",
      "full_name": "Admin User",
      "role_id": 1,
      "branch_id": 1,
      "status": "active"
    }
  }
}
```

---

### 3. Create User

**POST** `/users`

**Required Permission:** `user.create`

**Request Body:**
```json
{
  "email": "john.doe@company.co.ke",
  "password": "Password123!",
  "full_name": "John Doe",
  "role_id": 4,
  "branch_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": 2,
      "email": "john.doe@company.co.ke",
      "full_name": "John Doe",
      "role_id": 4,
      "branch_id": 1,
      "status": "active"
    }
  }
}
```

---

### 4. Update User

**PUT** `/users/:id`

**Required Permission:** `user.update`

**Request Body:**
```json
{
  "full_name": "John Doe Updated",
  "role_id": 3,
  "branch_id": 2
}
```

---

### 5. Delete User

**DELETE** `/users/:id`

**Required Permission:** `user.delete`

---

### 6. Terminate User

**PATCH** `/users/:id/terminate`

**Required Permission:** `user.terminate`

---

## Staff Management

### 1. Get All Staff

**GET** `/staff`

**Required Permission:** `staff:read`

**Query Parameters:**
| Parameter    | Type   | Description              |
|--------------|--------|--------------------------|
| page         | number | Page number              |
| limit        | number | Items per page           |
| branchId     | number | Filter by branch         |
| departmentId | number | Filter by department     |
| status       | string | Filter by status         |

**Response:**
```json
{
  "success": true,
  "data": {
    "staff": [
      {
        "id": 1,
        "user_id": 1,
        "employee_id": "EMP0001",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@company.co.ke",
        "designation": "Senior Officer",
        "department": "Information Technology",
        "branch": "Nairobi HQ",
        "joining_date": "2024-01-15",
        "employment_type": "full_time",
        "status": "active"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_records": 50,
      "total_pages": 3
    }
  }
}
```

---

### 2. Get Staff by ID

**GET** `/staff/:id`

**Required Permission:** `staff:read`

---

### 3. Create Staff

**POST** `/staff`

**Required Permission:** `staff.create`

**Request Body:**
```json
{
  "user_id": 2,
  "employee_id": "EMP0002",
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@company.co.ke",
  "designation": "Manager",
  "department_id": 1,
  "branch_id": 1,
  "joining_date": "2025-02-01",
  "employment_type": "full_time"
}
```

---

### 4. Update Staff

**PUT** `/staff/:id`

**Required Permission:** `staff.update`

**Request Body:**
```json
{
  "designation": "Senior Manager",
  "department_id": 2,
  "branch_id": 2
}
```

---

### 5. Get Current User Staff Details

**GET** `/staff/me`

Get authenticated user's own staff profile.

---

### 6. Terminate Staff

**PATCH** `/staff/:id/terminate`

**Required Permission:** `staff.terminate`

---

## Roles & Permissions

### 1. Get All Roles

**GET** `/roles`

**Required Permission:** `roles:read`

**Response:**
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "id": 1,
        "name": "Admin",
        "description": "System Administrator",
        "permissions": ["*"]
      },
      {
        "id": 2,
        "name": "Manager",
        "description": "Department/Branch Manager",
        "permissions": ["staff:read", "staff:update", "attendance:read", "attendance:manage"]
      },
      {
        "id": 3,
        "name": "HR",
        "description": "Human Resources",
        "permissions": ["staff:create", "staff:read", "users:read", "attendance:manage"]
      },
      {
        "id": 4,
        "name": "Employee",
        "description": "Regular Employee",
        "permissions": ["staff:read", "attendance:read", "leave:request"]
      }
    ]
  }
}
```

---

### 2. Create Role

**POST** `/roles`

**Required Permission:** `role.create`

**Request Body:**
```json
{
  "name": "Supervisor",
  "description": "Team Supervisor",
  "permissions": ["staff:read", "attendance:read", "attendance:manage", "leave:approve"]
}
```

---

### 3. Update Role

**PUT** `/roles/:id`

**Required Permission:** `role.update`

---

### 4. Get Role Permissions

**GET** `/roles/:id/permissions`

**Required Permission:** `role.permissions.view`

---

### 5. Add Role Permission

**POST** `/roles/:id/permissions`

**Required Permission:** `role.permissions.manage`

**Request Body:**
```json
{
  "permission": "reports:generate"
}
```

---

### 6. Remove Role Permission

**DELETE** `/roles/:id/permissions/:permission`

**Required Permission:** `role.permissions.manage`

---

## Branches Management

### 1. Get All Branches

**GET** `/branches`

**Required Permission:** `branches:read`

**Response:**
```json
{
  "success": true,
  "data": {
    "branches": [
      {
        "id": 1,
        "name": "Nairobi HQ",
        "code": "NAI",
        "city": "Nairobi",
        "country": "Kenya",
        "phone": "+254-100",
        "email": "nai@company.co.ke",
        "location_coordinates": "-1.286389,36.817223",
        "location_radius_meters": 100,
        "attendance_mode": "branch_based",
        "status": "active"
      },
      {
        "id": 2,
        "name": "Mombasa Branch",
        "code": "MBA",
        "city": "Mombasa",
        "country": "Kenya",
        "phone": "+254-200",
        "email": "mba@company.co.ke",
        "location_coordinates": "-4.0435,39.6682",
        "location_radius_meters": 150,
        "attendance_mode": "branch_based",
        "status": "active"
      }
    ]
  }
}
```

---

### 2. Get Branch by ID

**GET** `/branches/:id`

**Required Permission:** `branches:read`

---

### 3. Create Branch

**POST** `/branches`

**Required Permission:** `branches:create`

**Request Body:**
```json
{
  "name": "Kisumu Branch",
  "code": "KIS",
  "city": "Kisumu",
  "country": "Kenya",
  "phone": "+254-300",
  "email": "kis@company.co.ke",
  "location_coordinates": "-0.0917,34.7519",
  "location_radius_meters": 100,
  "attendance_mode": "branch_based"
}
```

---

### 4. Update Branch

**PUT** `/branches/:id`

**Required Permission:** `branches:update`

**Request Body:**
```json
{
  "name": "Kisumu Regional Office",
  "phone": "+254-350",
  "location_radius_meters": 200
}
```

---

### 5. Delete Branch

**DELETE** `/branches/:id`

**Required Permission:** `branches:delete`

Note: This deactivates the branch (soft delete).

---

## Departments Management

### 1. Get All Departments

**GET** `/departments`

**Required Permission:** `departments:read`

**Response:**
```json
{
  "success": true,
  "data": {
    "departments": [
      {
        "id": 1,
        "name": "Human Resources",
        "description": "Human Resources department",
        "branch_id": 1,
        "branch_name": "Nairobi HQ"
      },
      {
        "id": 2,
        "name": "Information Technology",
        "description": "IT department",
        "branch_id": 1,
        "branch_name": "Nairobi HQ"
      },
      {
        "id": 3,
        "name": "Finance & Accounting",
        "description": "Finance department",
        "branch_id": 1,
        "branch_name": "Nairobi HQ"
      }
    ]
  }
}
```

---

### 2. Get Department by ID

**GET** `/departments/:id`

**Required Permission:** `departments:read`

---

### 3. Create Department

**POST** `/departments`

**Required Permission:** `departments:create`

**Request Body:**
```json
{
  "name": "Operations",
  "description": "Operations department",
  "branch_id": 1
}
```

---

### 4. Update Department

**PUT** `/departments/:id`

**Required Permission:** `departments:update`

**Request Body:**
```json
{
  "name": "Operations & Logistics",
  "description": "Operations and Logistics department"
}
```

---

### 5. Delete Department

**DELETE** `/departments/:id`

**Required Permission:** `departments:delete`

---

## Attendance Management (Core Module)

### 1. Mark Check-In

**POST** `/attendance/check-in`

Mark attendance for the current day.

**Request Body:**
```json
{
  "location_coordinates": "-1.286389,36.817223",
  "location_address": "Nairobi HQ, Kenyatta Avenue"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Check-in successful",
  "data": {
    "attendance": {
      "id": 1,
      "user_id": 1,
      "date": "2025-02-19",
      "status": "present",
      "check_in_time": "08:45:00",
      "location_coordinates": "-1.286389,36.817223",
      "location_verified": true,
      "location_address": "Nairobi HQ, Kenyatta Avenue"
    }
  }
}
```

---

### 2. Mark Check-Out

**POST** `/attendance/check-out`

**Request Body:**
```json
{
  "location_coordinates": "-1.286389,36.817223",
  "location_address": "Nairobi HQ, Kenyatta Avenue"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Check-out successful",
  "data": {
    "attendance": {
      "id": 1,
      "user_id": 1,
      "date": "2025-02-19",
      "status": "present",
      "check_in_time": "08:45:00",
      "check_out_time": "17:30:00",
      "location_coordinates": "-1.286389,36.817223",
      "location_verified": true
    }
  }
}
```

---

### 3. Get My Attendance

**GET** `/attendance/my`

Get current user's attendance records.

**Query Parameters:**
| Parameter | Type   | Description                    |
|-----------|--------|--------------------------------|
| date      | string | Single date (YYYY-MM-DD)       |
| startDate | string | Start date for range query     |
| endDate   | string | End date for range query       |
| status    | string | Filter by status (present, late, absent, etc.) |

**Response:**
```json
{
  "success": true,
  "message": "Your attendance records retrieved successfully",
  "data": {
    "attendance": [
      {
        "id": 1,
        "user_id": 1,
        "date": "2025-02-19",
        "status": "present",
        "check_in_time": "08:45:00",
        "check_out_time": "17:30:00",
        "location_verified": true,
        "location_address": "Nairobi HQ",
        "notes": null
      }
    ]
  }
}
```

---

### 4. Get Attendance Records (Admin/HR)

**GET** `/attendance`

Get attendance records with filters.

**Query Parameters:**
| Parameter | Type   | Description                    |
|-----------|--------|--------------------------------|
| userId    | number | Filter by user ID              |
| date      | string | Single date                    |
| startDate | string | Start date for range           |
| endDate   | string | End date for range             |
| status    | string | Filter by status               |

**Response:**
```json
{
  "success": true,
  "message": "Attendance records retrieved successfully",
  "data": {
    "attendance": [
      {
        "id": 1,
        "user_id": 1,
        "email": "john.doe@company.co.ke",
        "full_name": "John Doe",
        "date": "2025-02-19",
        "status": "present",
        "check_in_time": "08:45:00",
        "check_out_time": "17:30:00"
      }
    ]
  }
}
```

---

### 5. Get Attendance Summary

**GET** `/attendance/my/summary`

Get current user's attendance summary.

**Query Parameters:**
| Parameter | Type   | Description          |
|-----------|--------|----------------------|
| startDate | string | Start date (required)|
| endDate   | string | End date (required)  |

**Response:**
```json
{
  "success": true,
  "message": "Your attendance summary retrieved successfully",
  "data": {
    "summary": {
      "total_days": 22,
      "present": 18,
      "late": 2,
      "absent": 1,
      "leave": 1,
      "holiday": 0,
      "attendance_percentage": 81.82
    }
  }
}
```

---

### 6. Get All Attendance Records with Pagination

**GET** `/attendance/records`

**Required Permission:** `attendance:read`

**Query Parameters:**
| Parameter | Type   | Description         |
|-----------|--------|---------------------|
| page      | number | Page number         |
| limit     | number | Items per page      |
| userId    | number | Filter by user      |
| date      | string | Single date         |
| startDate | string | Start date range    |
| endDate   | string | End date range      |
| status    | string | Filter by status    |

**Response:**
```json
{
  "success": true,
  "data": {
    "attendance": [...],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_records": 1500,
      "total_pages": 75
    }
  }
}
```

---

### 7. Get Monthly Attendance Report

**GET** `/attendance/reports/monthly`

**Query Parameters:**
| Parameter | Type   | Description          |
|-----------|--------|----------------------|
| year      | number | Year (required)      |
| month     | number | Month 1-12 (required)|
| userId    | number | Filter by user       |

**Response:**
```json
{
  "success": true,
  "message": "Monthly attendance report generated successfully",
  "data": {
    "report": {
      "year": 2025,
      "month": 2,
      "user_id": 1,
      "attendance_records": [...],
      "summary": {
        "total_days": 20,
        "present": 18,
        "late": 1,
        "absent": 0,
        "leave": 1,
        "attendance_percentage": 90.0
      }
    }
  }
}
```

---

### 8. Update Attendance Record

**PUT** `/attendance/:id`

**Required Permission:** `attendance:update`

**Request Body:**
```json
{
  "status": "present",
  "check_in_time": "09:00:00",
  "check_out_time": "18:00:00",
  "location_verified": true
}
```

---

### 9. Get Attendance by ID

**GET** `/attendance/:id`

**Required Permission:** `attendance:read`

---

### 10. Get Holidays

**GET** `/attendance/holidays`

**Query Parameters:**
| Parameter | Type   | Description              |
|-----------|--------|--------------------------|
| branchId  | number | Filter by branch         |
| date      | string | Single date              |
| startDate | string | Start date for range     |
| endDate   | string | End date for range       |

**Response:**
```json
{
  "success": true,
  "message": "Holidays retrieved successfully",
  "data": {
    "holidays": [
      {
        "id": 1,
        "holiday_name": "Madaraka Day",
        "date": "2025-06-01",
        "branch_id": null,
        "is_mandatory": true,
        "description": "Public holiday"
      }
    ]
  }
}
```

---

### 11. Get Staff Attendance Data (Dashboard)

**GET** `/attendance/staff-data`

**Required Permission:** `attendance:read`

**Query Parameters:**
| Parameter    | Type   | Description         |
|--------------|--------|---------------------|
| startDate    | string | Start date range    |
| endDate      | string | End date range      |
| branchId     | number | Filter by branch    |
| departmentId | number | Filter by department|

**Response:**
```json
{
  "success": true,
  "message": "Staff attendance data retrieved successfully",
  "data": {
    "staff": [
      {
        "id": 1,
        "user_id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "employee_id": "EMP0001",
        "department": "Information Technology",
        "branch": "Nairobi HQ",
        "present": 18,
        "late": 2,
        "early": 1,
        "absent": 1,
        "leave": 1,
        "holiday": 0
      }
    ]
  }
}
```

---

### 12. Get User Attendance History

**GET** `/attendance/history/user/:userId`

**Required Permission:** `attendance:read`

---

### 13. Get My Specific Attendance Record

**GET** `/attendance/my/:id`

---

### 14. Get Attendance Settings

**GET** `/attendance/settings`

**Required Permission:** `attendance:read`

---

### 15. Update Attendance Settings

**PUT** `/attendance/settings`

**Required Permission:** `attendance:update`

**Request Body:**
```json
{
  "grace_period_minutes": 15,
  "auto_checkout_time": "18:00:00",
  "location_verification_required": true
}
```

---

## Leave Management (Core Module)

### Leave Types

#### 1. Get All Leave Types

**GET** `/leave/types`

**Required Permission:** `leave_type:read`

**Response:**
```json
{
  "success": true,
  "data": {
    "leaveTypes": [
      {
        "id": 1,
        "name": "Annual Leave",
        "days_per_year": 21,
        "is_paid": true,
        "is_active": true
      },
      {
        "id": 2,
        "name": "Sick Leave",
        "days_per_year": 14,
        "is_paid": true,
        "is_active": true
      },
      {
        "id": 3,
        "name": "Personal Leave",
        "days_per_year": 5,
        "is_paid": true,
        "is_active": true
      },
      {
        "id": 4,
        "name": "Maternity Leave",
        "days_per_year": 90,
        "is_paid": true,
        "is_active": true
      },
      {
        "id": 5,
        "name": "Paternity Leave",
        "days_per_year": 14,
        "is_paid": true,
        "is_active": true
      },
      {
        "id": 6,
        "name": "Compassionate Leave",
        "days_per_year": 5,
        "is_paid": false,
        "is_active": true
      }
    ]
  }
}
```

---

#### 2. Create Leave Type

**POST** `/leave/types`

**Required Permission:** `leave_type:create`

**Request Body:**
```json
{
  "name": "Study Leave",
  "days_per_year": 30,
  "is_paid": false,
  "is_active": true
}
```

---

#### 3. Update Leave Type

**PUT** `/leave/types/:id`

**Required Permission:** `leave_type:update`

**Request Body:**
```json
{
  "name": "Annual Leave",
  "days_per_year": 24,
  "is_paid": true,
  "is_active": true
}
```

---

#### 4. Delete Leave Type

**DELETE** `/leave/types/:id`

**Required Permission:** `leave_type:delete`

---

### Leave Requests

#### 1. Get My Leave Requests

**GET** `/leave/requests/my`

Get current user's leave requests.

**Query Parameters:**
| Parameter | Type   | Description              |
|-----------|--------|--------------------------|
| status    | string | Filter by status         |
| page      | number | Page number              |
| limit     | number | Items per page           |

**Response:**
```json
{
  "success": true,
  "data": {
    "leaveRequests": [
      {
        "id": 1,
        "user_id": 1,
        "leave_type_id": 1,
        "leave_type_name": "Annual Leave",
        "start_date": "2025-03-01",
        "end_date": "2025-03-10",
        "days_requested": 10,
        "status": "pending",
        "reason": "Family vacation",
        "requested_at": "2025-02-15T10:00:00.000Z",
        "approved_by": null,
        "approved_at": null
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_records": 5,
      "total_pages": 1
    }
  }
}
```

---

#### 2. Create Leave Request

**POST** `/leave/requests`

**Required Permission:** `leave:request`

**Request Body:**
```json
{
  "leave_type_id": 1,
  "start_date": "2025-03-01",
  "end_date": "2025-03-10",
  "reason": "Family vacation",
  "attachment_url": "https://example.com/document.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leave request submitted successfully",
  "data": {
    "leaveRequest": {
      "id": 1,
      "user_id": 1,
      "leave_type_id": 1,
      "start_date": "2025-03-01",
      "end_date": "2025-03-10",
      "days_requested": 10,
      "status": "pending",
      "reason": "Family vacation"
    }
  }
}
```

---

#### 3. Get All Leave Requests (Admin/HR/Manager)

**GET** `/leave/requests`

**Required Permission:** `leave:view`

**Query Parameters:**
| Parameter   | Type   | Description              |
|-------------|--------|--------------------------|
| userId      | number | Filter by user           |
| status      | string | Filter by status         |
| leaveTypeId | number | Filter by leave type     |
| startDate   | string | Filter by start date     |
| endDate     | string | Filter by end date       |
| page        | number | Page number              |
| limit       | number | Items per page           |

**Response:**
```json
{
  "success": true,
  "data": {
    "leaveRequests": [
      {
        "id": 1,
        "user_id": 1,
        "employee_id": "EMP0001",
        "full_name": "John Doe",
        "leave_type_name": "Annual Leave",
        "start_date": "2025-03-01",
        "end_date": "2025-03-10",
        "days_requested": 10,
        "status": "pending",
        "reason": "Family vacation"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_records": 25,
      "total_pages": 2
    }
  }
}
```

---

#### 4. Get Leave Request by ID

**GET** `/leave/requests/:id`

**Required Permission:** `leave:view`

---

#### 5. Approve Leave Request

**POST** `/leave/requests/:id/approve`

**Required Permission:** `leave:approve`

**Request Body:**
```json
{
  "comments": "Approved. Enjoy your vacation!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leave request approved successfully",
  "data": {
    "leaveRequest": {
      "id": 1,
      "status": "approved",
      "approved_by": 2,
      "approved_at": "2025-02-19T14:30:00.000Z",
      "comments": "Approved. Enjoy your vacation!"
    }
  }
}
```

---

#### 6. Reject Leave Request

**POST** `/leave/requests/:id/reject`

**Required Permission:** `leave:approve`

**Request Body:**
```json
{
  "comments": "Cannot approve due to project deadline. Please reschedule."
}
```

---

#### 7. Cancel Leave Request

**POST** `/leave/requests/:id/cancel`

Cancel own pending leave request.

**Request Body:**
```json
{
  "reason": "Change of plans"
}
```

---

#### 8. Update Leave Request

**PUT** `/leave/requests/:id`

**Required Permission:** `leave:update`

**Request Body:**
```json
{
  "start_date": "2025-03-05",
  "end_date": "2025-03-15",
  "reason": "Updated reason"
}
```

---

### Leave Allocations

#### 1. Get My Leave Balance

**GET** `/leave/allocations/my`

Get current user's leave balances.

**Response:**
```json
{
  "success": true,
  "data": {
    "allocations": [
      {
        "leave_type_id": 1,
        "leave_type_name": "Annual Leave",
        "allocated_days": 21,
        "used_days": 5,
        "pending_days": 10,
        "available_days": 6
      },
      {
        "leave_type_id": 2,
        "leave_type_name": "Sick Leave",
        "allocated_days": 14,
        "used_days": 2,
        "pending_days": 0,
        "available_days": 12
      }
    ]
  }
}
```

---

#### 2. Get All Leave Allocations (Admin/HR)

**GET** `/leave/allocations`

**Required Permission:** `leave:manage`

**Query Parameters:**
| Parameter | Type   | Description         |
|-----------|--------|---------------------|
| userId    | number | Filter by user      |
| year      | number | Filter by year      |

---

#### 3. Create Leave Allocation

**POST** `/leave/allocations`

**Required Permission:** `leave:manage`

**Request Body:**
```json
{
  "user_id": 1,
  "leave_type_id": 1,
  "year": 2025,
  "allocated_days": 21
}
```

---

#### 4. Update Leave Allocation

**PUT** `/leave/allocations/:id`

**Required Permission:** `leave:manage`

**Request Body:**
```json
{
  "allocated_days": 24
}
```

---

#### 5. Bulk Allocate Leave

**POST** `/leave/allocations/bulk`

**Required Permission:** `leave:manage`

**Request Body:**
```json
{
  "leave_type_id": 1,
  "year": 2025,
  "allocated_days": 21,
  "user_ids": [1, 2, 3, 4, 5]
}
```

---

### Leave History

#### 1. Get Leave History

**GET** `/leave/history`

**Required Permission:** `leave:view`

**Query Parameters:**
| Parameter | Type   | Description         |
|-----------|--------|---------------------|
| userId    | number | Filter by user      |
| year      | number | Filter by year      |
| status    | string | Filter by status    |

**Response:**
```json
{
  "success": true,
  "data": {
    "leaveHistory": [
      {
        "id": 1,
        "user_id": 1,
        "employee_name": "John Doe",
        "leave_type_name": "Annual Leave",
        "start_date": "2025-01-10",
        "end_date": "2025-01-20",
        "days_taken": 11,
        "status": "approved",
        "reason": "Vacation",
        "approved_by": 2,
        "approved_at": "2025-01-05T10:00:00.000Z"
      }
    ]
  }
}
```

---

## Error Responses

All API errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development mode only)"
}
```

### Common HTTP Status Codes

| Code | Description                          |
|------|--------------------------------------|
| 200  | Success                              |
| 201  | Created                              |
| 400  | Bad Request (invalid input)          |
| 401  | Unauthorized (invalid/missing token) |
| 403  | Forbidden (insufficient permissions) |
| 404  | Not Found                            |
| 500  | Internal Server Error                |

---

## Authentication Token Usage

Include the JWT token in the `Authorization` header for all protected endpoints:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Permission Codes Reference

| Permission Code          | Description                    |
|--------------------------|--------------------------------|
| `users:read`             | View users                     |
| `users:create`           | Create users                   |
| `users:update`           | Update users                   |
| `users:delete`           | Delete users                   |
| `staff:read`             | View staff                     |
| `staff:create`           | Create staff                   |
| `staff:update`           | Update staff                   |
| `staff:delete`           | Delete staff                   |
| `attendance:read`        | View attendance                |
| `attendance:manage`      | Manage attendance              |
| `attendance:update`      | Update attendance records      |
| `leave:request`          | Request leave                  |
| `leave:view`             | View leave requests            |
| `leave:approve`          | Approve/reject leave           |
| `leave:manage`           | Manage leave allocations       |
| `leave_type:read`        | View leave types               |
| `leave_type:create`      | Create leave types             |
| `leave_type:update`      | Update leave types             |
| `branches:read`          | View branches                  |
| `branches:create`        | Create branches                |
| `branches:update`        | Update branches                |
| `departments:read`       | View departments               |
| `departments:create`     | Create departments             |
| `departments:update`     | Update departments             |

---

## Testing with Postman

1. **Import Collection**: Import the API endpoints into Postman
2. **Set Base URL**: Set environment variable `baseUrl` to `http://localhost:3000`
3. **Login First**: Use the Login endpoint to get your access token
4. **Auto-save Token**: Use Postman's test scripts to auto-save tokens:
   ```javascript
   pm.test("Save token", function() {
       var jsonData = pm.response.json();
       pm.environment.set("accessToken", jsonData.data.token);
   });
   ```
5. **Use Variables**: Reference token in headers: `Bearer {{accessToken}}`

---

## Support

For API support, contact the development team or refer to the internal documentation.
