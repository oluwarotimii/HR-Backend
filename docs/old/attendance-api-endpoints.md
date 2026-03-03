# HR App Attendance API Documentation

Complete documentation for all attendance-related API endpoints.

---

## Table of Contents

1. [Core Attendance Endpoints](#1-core-attendance-endpoints)
2. [Check-In/Check-Out Endpoints](#2-check-incheck-out-endpoints)
3. [Summary & Reports Endpoints](#3-summary--reports-endpoints)
4. [Processing Endpoints](#4-processing-endpoints)
5. [Settings Endpoints](#5-settings-endpoints)
6. [Attendance Locations Endpoints](#6-attendance-locations-endpoints)
7. [Holidays Endpoints](#7-holidays-endpoints)
8. [Branch Global Attendance Endpoints](#8-branch-global-attendance-endpoints)
9. [Attendance Statuses](#attendance-statuses)
10. [Attendance Modes](#attendance-modes)
11. [Authentication & Permissions](#authentication--permissions)

---

## Base URL

```
http://localhost:3000/api
```

---

## 1. Core Attendance Endpoints

### GET `/attendance`

Get attendance records with optional filters.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | number | No | Filter by user ID (admins only for other users) |
| `date` | string | No | Filter by specific date (YYYY-MM-DD) |
| `startDate` | string | No | Start of date range |
| `endDate` | string | No | End of date range |
| `status` | string | No | Filter by status (present, absent, late, etc.) |

**Permissions:** `attendance:read`

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
        "date": "2023-10-15",
        "status": "present",
        "check_in_time": "09:00:00",
        "check_out_time": "17:00:00",
        "location_verified": true
      }
    ]
  }
}
```

---

### GET `/attendance/my`

Get **current user's** attendance records. No special permission required.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | No | Filter by specific date |
| `startDate` | string | No | Start of date range |
| `endDate` | string | No | End of date range |
| `status` | string | No | Filter by status |

**Permissions:** Authenticated user only

---

### GET `/attendance/:id`

Get specific attendance record by ID.

**Permissions:** `attendance:read`

**Access Control:** Users can only access their own records unless admin/HR.

---

### GET `/attendance/my/:id`

Get current user's specific attendance record by ID.

**Permissions:** Authenticated user only

---

### GET `/attendance/records`

Get **all** attendance records with pagination (admin-focused).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Records per page (default: 20) |
| `userId` | number | No | Filter by user ID |
| `date` | string | No | Filter by specific date |
| `startDate` | string | No | Start of date range |
| `endDate` | string | No | End of date range |
| `status` | string | No | Filter by status |

**Permissions:** `attendance:read`

**Response:**
```json
{
  "success": true,
  "message": "Attendance records retrieved successfully",
  "data": {
    "attendance": [...],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_records": 150,
      "total_pages": 8
    }
  }
}
```

---

### GET `/attendance/records/:id`

Alternative route to get specific attendance record by ID.

**Permissions:** `attendance:read`

---

### PUT `/attendance/:id`

Update attendance record (**admin only**).

**Permissions:** `attendance:update`

**Request Body:**
```json
{
  "status": "present",
  "check_in_time": "09:00:00",
  "check_out_time": "17:00:00",
  "location_verified": true
}
```

**Updatable Fields:**
- `status` - Attendance status
- `check_in_time` - Check-in time (HH:MM:SS)
- `check_out_time` - Check-out time (HH:MM:SS)
- `location_verified` - Boolean for location verification

---

### POST `/attendance/manual`

Manually create attendance record (**admin only**).

**Permissions:** Authenticated (admin recommended)

**Request Body:**
```json
{
  "date": "2023-10-15",
  "check_in_time": "09:00:00",
  "check_out_time": "17:00:00",
  "status": "present",
  "location_coordinates": {
    "latitude": -1.286389,
    "longitude": 36.817223
  },
  "location_address": "Nairobi Office",
  "user_id": 1
}
```

**Features:**
- Auto-detects holidays and marks as `holiday`
- Auto-detects approved leave and marks as `leave`
- Verifies location based on branch attendance mode
- Can create records for other users (admin)

---

## 2. Check-In/Check-Out Endpoints

### POST `/attendance/check-in`

Mark attendance check-in for current user.

**Permissions:** Authenticated user only

**Request Body:**
```json
{
  "date": "2023-10-15",
  "check_in_time": "09:00:00",
  "location_coordinates": {
    "latitude": -1.286389,
    "longitude": 36.817223
  },
  "location_address": "Nairobi Office"
}
```

**Features:**
- Verifies location based on branch attendance mode
- Auto-detects late status based on shift timing
- Applies grace period if configured
- Auto-marks as `holiday` or `leave` if applicable

**Response:**
```json
{
  "success": true,
  "message": "Check-in recorded successfully",
  "data": {
    "attendance": {
      "id": 1,
      "user_id": 1,
      "date": "2023-10-15",
      "status": "present",
      "check_in_time": "09:00:00",
      "location_verified": true
    }
  }
}
```

---

### POST `/attendance/check-out`

Mark attendance check-out for current user.

**Permissions:** Authenticated user only

**Request Body:**
```json
{
  "date": "2023-10-15",
  "check_out_time": "17:00:00",
  "location_coordinates": {
    "latitude": -1.286389,
    "longitude": 36.817223
  },
  "location_address": "Nairobi Office"
}
```

**Features:**
- Updates existing attendance record
- Requires prior check-in
- Verifies check-out location

---

## 3. Summary & Reports Endpoints

### GET `/attendance/summary`

Get attendance summary for a user.

**Permissions:** `attendance:read`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | number | No | User ID (admins can view any user) |
| `startDate` | string | Yes | Start of date range |
| `endDate` | string | Yes | End of date range |

**Response:**
```json
{
  "success": true,
  "message": "Attendance summary retrieved successfully",
  "data": {
    "summary": {
      "total_days": 30,
      "present_days": 25,
      "absent_days": 3,
      "late_days": 2,
      "half_day_days": 0,
      "attendance_percentage": 83.33
    }
  }
}
```

---

### GET `/attendance/my/summary`

Get **current user's** attendance summary.

**Permissions:** Authenticated user only

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | Yes | Start of date range |
| `endDate` | string | Yes | End of date range |

---

### GET `/attendance/history/user/:userId`

Get full attendance history for a specific user.

**Permissions:** `attendance:read`

**Access Control:** Users can only access their own history unless admin/HR.

---

### GET `/attendance/reports/monthly`

Generate monthly attendance report.

**Permissions:** `attendance:read`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | Yes | Year (e.g., 2023) |
| `month` | number | Yes | Month (1-12) |
| `userId` | number | No | User ID (defaults to current user) |

**Response:**
```json
{
  "success": true,
  "message": "Monthly attendance report generated successfully",
  "data": {
    "report": {
      "year": 2023,
      "month": 10,
      "user_id": 1,
      "attendance_records": [...],
      "summary": {
        "total_days": 31,
        "present_days": 22,
        "absent_days": 5,
        "late_days": 3,
        "half_day_days": 1,
        "attendance_percentage": 70.97
      }
    }
  }
}
```

---

## 4. Processing Endpoints

### POST `/attendance/process`

Process attendance for a specific date for one user.

**Permissions:** `attendance:manage`

**Request Body:**
```json
{
  "date": "2023-10-15",
  "userId": 1
}
```

**Features:**
- Auto-detects holidays → marks as `holiday`
- Auto-detects approved leave → marks as `leave`
- Checks for assigned shifts
- Marks as `absent` if no shift or no check-in

---

### POST `/attendance/process-batch`

Process attendance for multiple users.

**Permissions:** `attendance:manage`

**Request Body:**
```json
{
  "date": "2023-10-15",
  "userIds": [1, 2, 3, 4, 5]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Batch attendance processing completed",
  "data": {
    "results": [
      {
        "user_id": 1,
        "status": "success",
        "attendance": {...}
      },
      {
        "user_id": 2,
        "status": "skipped",
        "message": "Attendance already exists for this date"
      }
    ]
  }
}
```

---

### POST `/attendance/process-daily`

Process attendance for **all active staff** for a specific date.

**Permissions:** `attendance:manage`

**Request Body:**
```json
{
  "date": "2023-10-15"
}
```

**Use Case:** Typically called by a scheduled job/cron to process daily attendance automatically.

---

## 5. Settings Endpoints

### GET `/attendance/settings`

Get attendance settings for a branch.

**Permissions:** `attendance:manage`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `branchId` | number | No | Branch ID (defaults to user's branch) |

**Response:**
```json
{
  "success": true,
  "message": "Attendance settings retrieved successfully",
  "data": {
    "settings": {
      "branch_id": 1,
      "branch_name": "Nairobi Office",
      "attendance_mode": "branch_based",
      "location_coordinates": "POINT(36.817223 -1.286389)",
      "location_radius_meters": 100,
      "require_check_in": true,
      "require_check_out": true,
      "auto_checkout_enabled": false,
      "auto_checkout_minutes_after_close": 30,
      "allow_manual_attendance_entry": true,
      "allow_future_attendance_entry": false,
      "grace_period_minutes": 0,
      "enable_location_verification": true,
      "enable_face_recognition": false,
      "enable_biometric_verification": false,
      "notify_absent_employees": true,
      "notify_supervisors_daily_summary": true,
      "enable_weekend_attendance": false,
      "enable_holiday_attendance": false
    }
  }
}
```

---

### PATCH `/attendance/settings`

Update attendance settings for a branch.

**Permissions:** `attendance:manage`

**Request Body:**
```json
{
  "branchId": 1,
  "settings": {
    "attendance_mode": "branch_based",
    "location_radius_meters": 150,
    "grace_period_minutes": 15,
    "auto_checkout_enabled": true,
    "auto_checkout_minutes_after_close": 60
  }
}
```

**Updatable Settings:**
- `attendance_mode` - branch_based, multiple_locations, or flexible
- `location_coordinates` - GPS coordinates in POINT format
- `location_radius_meters` - Allowed radius for check-in
- `grace_period_minutes` - Minutes allowed for late check-in
- `auto_checkout_enabled` - Enable automatic check-out
- `auto_checkout_minutes_after_close` - Minutes after shift end for auto check-out
- `allow_manual_attendance_entry` - Allow manual attendance entries
- `allow_future_attendance_entry` - Allow marking attendance for future dates
- `enable_location_verification` - Require GPS verification
- `enable_face_recognition` - Enable face recognition (future feature)
- `enable_biometric_verification` - Enable biometric verification (future feature)
- `notify_absent_employees` - Send notifications for absences
- `notify_supervisors_daily_summary` - Send daily summaries to supervisors
- `enable_weekend_attendance` - Require weekend attendance
- `enable_holiday_attendance` - Require holiday attendance

---

### GET `/attendance/settings/global`

Get global attendance settings (apply across all branches).

**Permissions:** `attendance:manage`

---

### PATCH `/attendance/settings/global`

Update global attendance settings.

**Permissions:** `attendance:manage`

**Request Body:**
```json
{
  "settings": {
    "auto_checkout_enabled": true,
    "auto_checkout_minutes_after_close": 45,
    "grace_period_minutes": 10,
    "notify_absent_employees": true
  }
}
```

---

## 6. Attendance Locations Endpoints

### GET `/attendance-locations`

Get all attendance locations.

**Permissions:** `attendance_location:read`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `branchId` | number | No | Filter by branch ID |
| `isActive` | boolean | No | Filter by active status |

---

### GET `/attendance-locations/:id`

Get specific attendance location by ID.

**Permissions:** `attendance_location:read`

---

### POST `/attendance-locations`

Create new attendance location.

**Permissions:** `attendance-location:create`

**Request Body:**
```json
{
  "name": "Nairobi HQ",
  "location_coordinates": "POINT(36.817223 -1.286389)",
  "location_radius_meters": 100,
  "branch_id": 1,
  "is_active": true
}
```

---

### PUT `/attendance-locations/:id`

Update attendance location.

**Permissions:** `attendance-location:update`

**Request Body:**
```json
{
  "name": "Nairobi HQ - Updated",
  "location_coordinates": "POINT(36.817223 -1.286389)",
  "location_radius_meters": 150,
  "branch_id": 1,
  "is_active": true
}
```

---

### DELETE `/attendance-locations/:id`

Deactivate (soft delete) an attendance location.

**Permissions:** `attendance-location:delete`

**Note:** This deactivates the location rather than permanently deleting it.

---

## 7. Holidays Endpoints

### GET `/attendance/holidays`

Get holidays.

**Permissions:** `attendance:view`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `branchId` | number | No | Filter by branch ID |
| `date` | string | No | Get holidays for specific date |
| `startDate` | string | No | Start of date range |
| `endDate` | string | No | End of date range |

---

### GET `/attendance/holidays/:id`

Get specific holiday by ID.

**Permissions:** `attendance:view`

---

## 8. Branch Global Attendance Endpoints

### GET `/branch/global-attendance-mode`

Get current attendance mode for all branches.

**Permissions:** `branch.global_settings.read`

**Response:**
```json
{
  "success": true,
  "message": "Global attendance mode information retrieved successfully",
  "data": {
    "is_consistent": true,
    "current_modes": ["branch_based"],
    "branches": [
      {
        "id": 1,
        "name": "Nairobi Office",
        "attendance_mode": "branch_based"
      },
      {
        "id": 2,
        "name": "Mombasa Office",
        "attendance_mode": "branch_based"
      }
    ]
  }
}
```

---

### POST `/branch/global-attendance-mode`

Update attendance mode for **all branches** at once.

**Permissions:** `branch.global_settings.update`

**Request Body:**
```json
{
  "attendance_mode": "branch_based"
}
```

**Valid Values:** `branch_based`, `multiple_locations`

**Features:**
- Updates all branches in the system
- Logs changes to audit log
- Returns count of updated branches

---

## Attendance Statuses

| Status | Description |
|--------|-------------|
| `present` | Normal attendance - checked in on time |
| `absent` | No check-in recorded for the day |
| `late` | Check-in after shift start time (or grace period) |
| `half_day` | Partial day attendance |
| `leave` | On approved leave |
| `holiday` | Public holiday - no attendance required |

---

## Attendance Modes

| Mode | Description |
|------|-------------|
| `branch_based` | User must be at their assigned branch location within the configured radius |
| `multiple_locations` | User can check in from any of the approved attendance locations |
| `flexible` | No location verification required - user can check in from anywhere |

---

## Authentication & Permissions

### Authentication

All endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

### Permission Levels

| Permission | Description |
|------------|-------------|
| `attendance:read` | View attendance records |
| `attendance:update` | Update existing attendance records |
| `attendance:manage` | Process and manage attendance (admin functions) |
| `attendance:view` | View holidays and related data |
| `attendance_location:read` | View attendance locations |
| `attendance_location:create` | Create new attendance locations |
| `attendance_location:update` | Update attendance locations |
| `attendance_location:delete` | Delete/deactivate attendance locations |
| `branch.global_settings.read` | View global branch settings |
| `branch.global_settings.update` | Update global branch settings |

### Role-Based Access

| Role | Capabilities |
|------|--------------|
| **Staff** | Can only view and manage their own attendance |
| **Admin/HR** (role_id: 1 or 3) | Can view, update, and manage all attendance records |

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid user ID"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Cannot access other users' attendance records"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Attendance record not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Attendance already marked for this date"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Example cURL Commands

### Get Admin Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"oluwarotimiadewumi@gmail.com","password":"admin123"}'
```

### Get Staff Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"oluwarotimi.adewumi@tripa.com.ng","password":"7eM0xWOsZKe"}'
```

### Get My Attendance
```bash
curl -X GET http://localhost:3000/api/attendance/my \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json'
```

### Mark Check-In
```bash
curl -X POST http://localhost:3000/api/attendance/check-in \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "date": "2023-10-15",
    "check_in_time": "09:00:00",
    "location_coordinates": {
      "latitude": -1.286389,
      "longitude": 36.817223
    },
    "location_address": "Nairobi Office"
  }'
```

### Get Attendance Summary
```bash
curl -X GET 'http://localhost:3000/api/attendance/my/summary?startDate=2023-01-01&endDate=2023-12-31' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json'
```

---

## Related Files

- **Routes:** `src/api/attendance*.route.ts`
- **Models:** `src/models/attendance.model.ts`, `src/models/attendance-location.model.ts`
- **Controllers:** `src/controllers/branch-global-attendance.controller.ts`
- **Migrations:** `migrations/*attendance*.sql`
