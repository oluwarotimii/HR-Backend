# Complete Guide: Shift Scheduling, Attendance & Branch Management

**Last Updated:** March 1, 2026  
**Status:** ✅ Production Ready (with critical fixes)

---

## Table of Contents

1. [Overview](#overview)
2. [Module Relationships](#module-relationships)
3. [Branch Configuration & Impact](#branch-configuration--impact)
4. [Shift Scheduling Module](#shift-scheduling-module)
5. [Attendance Module](#attendance-module)
6. [Leave Module Integration](#leave-module-integration)
7. [Attendance Processor Worker](#attendance-processor-worker)
8. [Settings & Configuration](#settings--configuration)
9. [Complete API Reference](#complete-api-reference)
10. [Frontend Implementation Guide](#frontend-implementation-guide)
11. [Critical Fixes Checklist](#critical-fixes-checklist)

---

## Overview

This document provides a complete understanding of how **Shift Scheduling**, **Attendance**, **Leave**, and **Branch Configuration** work together in the HR Management System.

### Key Concepts

- **Shift Templates**: Reusable shift patterns (e.g., "Morning Shift 8:00-17:00")
- **Shift Assignments**: Assigning shifts to employees with recurrence rules
- **Attendance**: Tracking actual check-in/check-out times with location verification
- **Leave Integration**: Approved leave automatically marks attendance as "leave"
- **Branch Settings**: Control attendance behavior per branch
- **Automated Processing**: Daily worker marks absent/leave/holiday attendance

---

## Module Relationships

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         DATA DEPENDENCY GRAPH                            │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   BRANCHES      │────────────────────────────────────────────┐
│ - attendance_mode                                            │
│ - location_coordinates                                       │
│ - location_radius_meters                                     │
└─────────────────┘                                            │
         │                                                     │
         ▼                                                     ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│ ATTENDANCE_     │     │  SHIFT TEMPLATE  │────▶│ EMPLOYEE SHIFT      │
│ SETTINGS        │     │  (Reusable)      │     │ ASSIGNMENT          │
│ - require_check_in   └─────────────────┘     │ - recurrence_pattern  │
│ - grace_period                               │ - day_of_week         │
│ - auto_checkout                              └─────────────────────┘
└─────────────────┘                                          │
         │                                                   │
         │                                                   ▼
         │                                          ┌─────────────────────┐
         │                                          │  ATTENDANCE         │
         │                                          │  - check_in_time    │
         │                                          │  - check_out_time   │
         │◀────────────────────────────────────────│  - scheduled_start  │
         │   Location Verification                  │  - scheduled_end    │
         │                                          │  - is_late          │
         │                                          │  - working_hours    │
         │                                          └─────────────────────┘
         │                                                   ▲
         │                                                   │
┌─────────────────┐                                         │
│ ATTENDANCE_     │                                         │
│ LOCATIONS       │                                         │
│ - multiple      │                                         │
│   locations     │                                         │
└─────────────────┘                                         │
                                                            │
┌─────────────────┐        ┌──────────────────┐            │
│  LEAVE REQUEST  │───────▶│  LEAVE HISTORY   │────────────┘
│  - submitted    │        │  - approved      │
│  - pending      │        │  - dates         │
└─────────────────┘        └──────────────────┘
                                    │
                                    ▼
                          ┌─────────────────────┐
                          │ ATTENDANCE WORKER   │
                          │ (runs daily)        │
                          │ - marks "leave"     │
                          │ - marks "absent"    │
                          │ - marks "holiday"   │
                          └─────────────────────┘
```

---

## Branch Configuration & Impact

### Branch Table Structure

```sql
CREATE TABLE branches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  manager_user_id INT,
  
  -- Location & Attendance Fields
  location_coordinates POINT,              -- GPS: POINT(longitude latitude)
  location_radius_meters INT,              -- Geofence radius (e.g., 100)
  attendance_mode ENUM('branch_based', 'multiple_locations', 'flexible'),
  
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  SPATIAL INDEX(location_coordinates)
);
```

### How Branch Configuration Affects Attendance

#### 1. **Attendance Mode**

| Mode | Behavior | Use Case |
|------|----------|----------|
| `branch_based` | Employee must check in from branch location only | Single office location |
| `multiple_locations` | Employee can check in from any approved location | Field staff, multiple sites |
| `flexible` | No location verification required | Remote workers |

#### 2. **Location Coordinates**

```typescript
// Stored as WKT (Well-Known Text) format
"POINT(36.817223 -1.286389)"  // POINT(longitude latitude)

// Used for geofencing calculations
const distance = calculateDistance(
  branchCoords,  // POINT(36.817223 -1.286389)
  userCoords     // POINT(36.817500 -1.286500)
);

const isWithinGeofence = distance <= location_radius_meters;
```

#### 3. **Location Radius**

```typescript
// Typical values:
// - Small office: 50-100 meters
// - Large campus: 200-500 meters
// - Multiple buildings: 500-1000 meters

// Affects check-in validation
if (distance <= branch.location_radius_meters) {
  location_verified = true;
  // Can check in successfully
} else {
  location_verified = false;
  // Check-in may be rejected or flagged
}
```

### Branch Configuration Examples

#### Example 1: Single Office Branch

```json
{
  "name": "Nairobi Headquarters",
  "code": "NBO-HQ",
  "address": "Westlands, Nairobi",
  "city": "Nairobi",
  "country": "Kenya",
  "location_coordinates": "POINT(36.817223 -1.286389)",
  "location_radius_meters": 100,
  "attendance_mode": "branch_based",
  "status": "active"
}
```

**Impact:**
- All employees at this branch must check in within 100m of coordinates
- GPS verification is enforced
- Cannot check in from home or other locations

#### Example 2: Multiple Location Branch

```json
{
  "name": "Sales Team - Nairobi",
  "code": "NBO-SALES",
  "attendance_mode": "multiple_locations",
  "location_radius_meters": 150
}
```

**Impact:**
- Employees can check in from any approved attendance location
- Admin must create multiple `attendance_locations` records
- Each location has its own coordinates and radius

#### Example 3: Remote/Flexible Branch

```json
{
  "name": "Remote Workers",
  "code": "REMOTE",
  "attendance_mode": "flexible"
}
```

**Impact:**
- No location verification required
- Employees can check in from anywhere
- GPS coordinates optional

### Branch Settings vs Attendance Settings

```
┌─────────────────────────────────────────────────────────┐
│ BRANCH TABLE                                            │
│ - attendance_mode (branch_based/multiple_locations)     │
│ - location_coordinates (main office GPS)                │
│ - location_radius_meters (geofence size)                │
└─────────────────────────────────────────────────────────┘
                        │
                        │ Determines
                        ▼
┌─────────────────────────────────────────────────────────┐
│ ATTENDANCE_SETTINGS TABLE                               │
│ - require_check_in (true/false)                         │
│ - require_check_out (true/false)                        │
│ - grace_period_minutes (e.g., 15)                       │
│ - auto_checkout_enabled (true/false)                    │
│ - enable_location_verification (true/false)             │
│ - allow_manual_attendance_entry (true/false)            │
└─────────────────────────────────────────────────────────┘
```

**Key Difference:**
- **Branch table**: Physical location and attendance mode
- **Attendance settings table**: Behavioral rules and policies

---

## Shift Scheduling Module

### Purpose

Defines **when** employees are expected to work, including:
- Standard shifts (e.g., 8:00-17:00)
- Recurring adjustments (e.g., every Monday 10:00-17:00)
- Temporary changes (e.g., special project week)

### Database Schema

#### Shift Templates Table

```sql
CREATE TABLE shift_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,                    -- e.g., "Morning Shift"
  description TEXT,                               -- e.g., "Standard 8-hour shift"
  start_time TIME NOT NULL,                       -- e.g., "08:00:00"
  end_time TIME NOT NULL,                         -- e.g., "17:00:00"
  break_duration_minutes INT DEFAULT 60,
  effective_from DATE NOT NULL,
  effective_to DATE,
  recurrence_pattern ENUM('daily', 'weekly', 'monthly', 'custom') DEFAULT 'weekly',
  recurrence_days JSON,                           -- e.g., ["monday", "wednesday", "friday"]
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_active (is_active),
  INDEX idx_effective (effective_from, effective_to)
);
```

#### Employee Shift Assignments Table

```sql
CREATE TABLE employee_shift_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  shift_template_id INT,
  custom_start_time TIME,                         -- Override template start
  custom_end_time TIME,                           -- Override template end
  custom_break_duration_minutes INT DEFAULT 0,
  effective_from DATE NOT NULL,
  effective_to DATE,
  assignment_type ENUM('permanent', 'temporary', 'rotating') DEFAULT 'permanent',
  
  -- Recurring Shift Fields
  recurrence_pattern ENUM('none', 'daily', 'weekly', 'monthly') DEFAULT 'none',
  recurrence_day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
  recurrence_day_of_month INT,                    -- 1-31 for monthly
  recurrence_end_date DATE,
  
  assigned_by INT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_by INT,
  approved_at TIMESTAMP,
  status ENUM('pending', 'approved', 'active', 'expired', 'cancelled') DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (shift_template_id) REFERENCES shift_templates(id),
  FOREIGN KEY (assigned_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  
  INDEX idx_user_recurrence (user_id, recurrence_pattern, recurrence_day_of_week),
  INDEX idx_effective (effective_from, effective_to)
);
```

#### Shift Exceptions Table

```sql
CREATE TABLE shift_exceptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  exception_date DATE NOT NULL,
  exception_type ENUM('special_day', 'makeup_day', 'half_day', 'overtime') DEFAULT 'special_day',
  new_start_time TIME,
  new_end_time TIME,
  new_break_duration_minutes INT,
  reason TEXT,
  status ENUM('pending', 'approved', 'active', 'cancelled') DEFAULT 'active',
  approved_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  UNIQUE KEY unique_user_date (user_id, exception_date)
);
```

### Shift Types & Use Cases

#### 1. Standard Permanent Shift

**Use Case:** Employee works same hours every day

```json
{
  "shift_template": {
    "name": "Standard Shift",
    "start_time": "08:00:00",
    "end_time": "17:00:00",
    "break_duration_minutes": 60
  },
  "assignment": {
    "assignment_type": "permanent",
    "recurrence_pattern": "none",
    "effective_from": "2026-01-01"
  }
}
```

#### 2. Recurring Weekly Adjustment (Resume Late/Close Early)

**Use Case:** Employee has different schedule on specific day(s) each week

```json
{
  "shift_template": {
    "name": "Resume Late - 2 Hours",
    "start_time": "10:00:00",
    "end_time": "17:00:00",
    "break_duration_minutes": 60
  },
  "assignment": {
    "assignment_type": "rotating",
    "recurrence_pattern": "weekly",
    "recurrence_day_of_week": "monday",
    "effective_from": "2026-02-23",
    "recurrence_end_date": "2026-12-31"
  }
}
```

**Result:**
- Every Monday: Expected at 10:00 (not 08:00)
- Tuesday-Friday: Expected at 08:00 (standard shift)
- No late marks on Mondays for arriving at 10:15

#### 3. Temporary Shift Assignment

**Use Case:** Short-term schedule change (e.g., special project)

```json
{
  "shift_template": {
    "name": "Night Shift - Project X",
    "start_time": "22:00:00",
    "end_time": "06:00:00",
    "break_duration_minutes": 30
  },
  "assignment": {
    "assignment_type": "temporary",
    "effective_from": "2026-03-01",
    "effective_to": "2026-03-31"
  }
}
```

#### 4. Shift Exception (One-Time Change)

**Use Case:** Single day schedule override

```json
{
  "exception_date": "2026-03-15",
  "exception_type": "special_day",
  "new_start_time": "09:00:00",
  "new_end_time": "15:00:00",
  "reason": "Team building event afternoon"
}
```

### How Shift Schedule is Determined

```typescript
// Algorithm: Get Effective Schedule for Date
async function getScheduleForDate(userId: number, date: Date) {
  
  // Priority 1: Shift Exception (highest priority)
  const exception = await findException(userId, date);
  if (exception) {
    return {
      start_time: exception.new_start_time,
      end_time: exception.new_end_time,
      type: 'exception',
      note: exception.reason
    };
  }
  
  // Priority 2: Recurring Shift Assignment
  const recurring = await findRecurringAssignment(userId, date);
  const dayOfWeek = getDayOfWeek(date); // "monday", "tuesday", etc.
  
  if (recurring && recurring.recurrence_day_of_week === dayOfWeek) {
    return {
      start_time: recurring.custom_start_time || recurring.template_start_time,
      end_time: recurring.custom_end_time || recurring.template_end_time,
      type: 'recurring',
      note: recurring.template_name
    };
  }
  
  // Priority 3: Permanent/Standard Assignment
  const permanent = await findPermanentAssignment(userId);
  if (permanent) {
    return {
      start_time: permanent.start_time,
      end_time: permanent.end_time,
      type: 'standard',
      note: 'Standard shift'
    };
  }
  
  // No schedule found - employee not expected to work
  return null;
}
```

### Schedule Priority Hierarchy

```
┌─────────────────────────────────────────┐
│ 1. SHIFT EXCEPTION                      │  ← Highest priority
│    (Specific date override)             │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ 2. RECURRING ASSIGNMENT                 │  ← For specific day of week
│    (e.g., every Monday 10:00-17:00)     │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ 3. PERMANENT ASSIGNMENT                 │  ← Default schedule
│    (Standard daily shift)               │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ NO SCHEDULE                             │  ← Not expected to work
└─────────────────────────────────────────┘
```

---

## Attendance Module

### Purpose

Tracks **actual** employee work times and compares against **expected** schedule to determine:
- Present/Absent status
- Late arrival
- Early departure
- Working hours calculation

### Database Schema

#### Attendance Table

```sql
CREATE TABLE attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  
  -- Status
  status ENUM('present', 'absent', 'late', 'half_day', 'leave', 'holiday') DEFAULT 'absent',
  
  -- Check-in/out Times
  check_in_time TIME,
  check_out_time TIME,
  
  -- Location Tracking
  location_coordinates POINT,                    -- GPS: POINT(longitude latitude)
  location_verified BOOLEAN DEFAULT FALSE,
  location_address TEXT,
  
  -- Shift Schedule (populated from shift assignment)
  scheduled_start_time TIME,                     -- Expected start time
  scheduled_end_time TIME,                       -- Expected end time
  scheduled_break_duration_minutes INT DEFAULT 0,
  
  -- Attendance Metrics
  is_late BOOLEAN DEFAULT NULL,                  -- Calculated from check_in vs scheduled_start
  is_early_departure BOOLEAN DEFAULT NULL,       -- Calculated from check_out vs scheduled_end
  actual_working_hours DECIMAL(4,2),             -- (check_out - check_in) - break
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_date (user_id, date),
  INDEX idx_date (date),
  INDEX idx_status (status),
  SPATIAL INDEX(location_coordinates)
);
```

### Check-in Process

```typescript
// POST /api/attendance/check-in
async function checkIn(userId: number, checkInData: CheckInInput) {
  
  // Step 1: Validate required fields
  if (!checkInData.date || !checkInData.check_in_time) {
    throw new Error('Date and check_in_time are required');
  }
  
  // Step 2: Check if already checked in today
  const existingAttendance = await AttendanceModel.findByUserIdAndDate(userId, checkInData.date);
  if (existingAttendance && existingAttendance.check_in_time) {
    throw new Error('Already checked in today');
  }
  
  // Step 3: Get employee's branch
  const staff = await StaffModel.findByUserId(userId);
  const branch = await BranchModel.findById(staff.branch_id);
  
  // Step 4: Verify location (if required)
  let locationVerified = false;
  if (branch.attendance_mode === 'branch_based' && checkInData.location_coordinates) {
    const distance = calculateDistance(
      branch.location_coordinates,
      checkInData.location_coordinates
    );
    locationVerified = distance <= branch.location_radius_meters;
  } else if (branch.attendance_mode === 'multiple_locations') {
    const nearbyLocations = await AttendanceLocationModel.getLocationsNearby(
      checkInData.location_coordinates.latitude,
      checkInData.location_coordinates.longitude,
      branch.location_radius_meters
    );
    locationVerified = nearbyLocations.length > 0;
  }
  
  // Step 5: Get expected schedule for today
  const schedule = await ShiftSchedulingService.getEffectiveScheduleForDate(userId, checkInData.date);
  
  // Step 6: Determine status (present/late)
  let status: 'present' | 'late' = 'present';
  if (schedule && schedule.start_time) {
    const scheduledStart = parseTime(schedule.start_time);
    const checkIn = parseTime(checkInData.check_in_time);
    
    // Apply grace period if configured
    const gracePeriodMs = getGracePeriod(branch.id) * 60 * 1000;
    const adjustedStart = scheduledStart + gracePeriodMs;
    
    if (checkIn > adjustedStart) {
      status = 'late';
    }
  }
  
  // Step 7: Create attendance record
  const attendance = await AttendanceModel.create({
    user_id: userId,
    date: checkInData.date,
    status: status,
    check_in_time: checkInData.check_in_time,
    location_coordinates: checkInData.location_coordinates,
    location_verified: locationVerified,
    location_address: checkInData.location_address
  });
  
  // Step 8: Update with shift schedule info
  await ShiftSchedulingService.updateAttendanceWithScheduleInfo(
    attendance.id,
    userId,
    checkInData.date,
    checkInData.check_in_time,
    null  // check_out_time
  );
  
  return attendance;
}
```

### Check-out Process

```typescript
// POST /api/attendance/check-out
async function checkOut(userId: number, checkOutData: CheckOutInput) {
  
  // Step 1: Find existing attendance record
  const attendance = await AttendanceModel.findByUserIdAndDate(userId, checkOutData.date);
  if (!attendance) {
    throw new Error('No check-in found for today');
  }
  if (attendance.check_out_time) {
    throw new Error('Already checked out today');
  }
  
  // Step 2: Verify location (optional at check-out)
  let locationVerified = attendance.location_verified;
  if (checkOutData.location_coordinates) {
    // Same verification logic as check-in
    locationVerified = await verifyLocation(userId, checkOutData.location_coordinates);
  }
  
  // Step 3: Update check-out time
  await AttendanceModel.update(attendance.id, {
    check_out_time: checkOutData.check_out_time,
    location_coordinates: checkOutData.location_coordinates,
    location_verified: locationVerified
  });
  
  // Step 4: Recalculate working hours and early departure
  await ShiftSchedulingService.updateAttendanceWithScheduleInfo(
    attendance.id,
    userId,
    checkOutData.date,
    attendance.check_in_time,
    checkOutData.check_out_time
  );
  
  return attendance;
}
```

### Working Hours Calculation

```typescript
async function calculateWorkingHours(
  date: Date,
  checkInTime: string,
  checkOutTime: string,
  scheduledBreakMinutes: number
): Promise<number> {
  
  // Parse times
  const checkIn = parseTime(checkInTime);      // e.g., 08:55:00 → milliseconds
  const checkOut = parseTime(checkOutTime);    // e.g., 17:05:00 → milliseconds
  
  // Calculate raw duration
  let durationMs = checkOut - checkIn;
  
  // Subtract break time
  const breakMs = scheduledBreakMinutes * 60 * 1000;
  durationMs -= breakMs;
  
  // Convert to hours
  const workingHours = durationMs / (1000 * 60 * 60);
  
  // Ensure non-negative
  return Math.max(0, parseFloat(workingHours.toFixed(2)));
}

// Example:
// Check-in:  08:55:00
// Check-out: 17:05:00
// Break:     60 minutes
// Result:    (17:05 - 08:55) - 60 = 8:10 - 1:00 = 7.17 hours
```

### Late Detection Logic

```typescript
async function isLate(
  scheduledStartTime: string,
  checkInTime: string,
  gracePeriodMinutes: number
): Promise<boolean> {
  
  const scheduled = parseTime(scheduledStartTime);
  const checkIn = parseTime(checkInTime);
  const graceMs = gracePeriodMinutes * 60 * 1000;
  
  // Employee is late if they arrive after scheduled start + grace period
  return checkIn > (scheduled + graceMs);
}

// Example:
// Scheduled:  08:00:00
// Grace:      15 minutes
// Check-in:   08:12:00  → NOT late (within grace)
// Check-in:   08:20:00  → LATE (5 minutes after grace)
```

### Early Departure Detection

```typescript
async function isEarlyDeparture(
  scheduledEndTime: string,
  checkOutTime: string,
  toleranceMinutes: number = 0
): Promise<boolean> {
  
  const scheduled = parseTime(scheduledEndTime);
  const checkOut = parseTime(checkOutTime);
  const toleranceMs = toleranceMinutes * 60 * 1000;
  
  // Employee left early if they leave before scheduled end - tolerance
  return checkOut < (scheduled - toleranceMs);
}

// Example:
// Scheduled:  17:00:00
// Tolerance:  5 minutes
// Check-out:  16:58:00  → NOT early (within tolerance)
// Check-out:  16:50:00  → EARLY DEPARTURE
```

### Attendance Status Determination

```typescript
// Automated by Attendance Processor Worker

async function determineAttendanceStatus(userId: number, date: Date): Promise<'present' | 'absent' | 'leave' | 'holiday'> {
  
  // Check 1: Is it a holiday?
  const isHoliday = await HolidayModel.isHoliday(date);
  if (isHoliday) {
    return 'holiday';
  }
  
  // Check 2: Does employee have approved leave?
  const leave = await LeaveHistoryModel.findByUserIdAndDateRange(userId, date, date);
  if (leave.length > 0) {
    return 'leave';
  }
  
  // Check 3: Does employee have a shift scheduled?
  const schedule = await ShiftSchedulingService.getEffectiveScheduleForDate(userId, date);
  if (!schedule) {
    return null;  // Not expected to work
  }
  
  // Check 4: Did employee check in?
  const attendance = await AttendanceModel.findByUserIdAndDate(userId, date);
  if (attendance && attendance.check_in_time) {
    return attendance.status;  // present or late
  }
  
  // No check-in recorded → Absent
  return 'absent';
}
```

---

## Leave Module Integration

### How Leave Affects Attendance

```
┌─────────────────────────────────────────────────────────────────┐
│ LEAVE REQUEST WORKFLOW                                          │
└─────────────────────────────────────────────────────────────────┘

1. Employee submits leave request
   POST /api/leave-request
   {
     "leave_type_id": 3,
     "start_date": "2026-03-15",
     "end_date": "2026-03-17",
     "reason": "Family vacation"
   }

2. Manager approves request
   PUT /api/leave-request/:id
   {
     "status": "approved"
   }

3. System creates leave_history record
   INSERT INTO leave_history
   (user_id, leave_type_id, start_date, end_date, days_taken)
   VALUES (123, 3, '2026-03-15', '2026-03-17', 3)

4. Attendance worker runs (daily at midnight)
   AttendanceProcessorWorker.processYesterdayAttendance()
   
   For each employee:
     - Check if leave_history exists for yesterday
     - If yes, create attendance record with status = "leave"
   
   Result:
   {
     "user_id": 123,
     "date": "2026-03-15",
     "status": "leave",
     "notes": "On approved leave"
   }
```

### Leave Request Data Flow

```typescript
┌─────────────────┐
│ LEAVE_REQUEST   │  ← Pending approval
│ - status: submitted              │
└─────────────────┘
        │
        │ Manager approves
        ▼
┌─────────────────┐
│ LEAVE_HISTORY   │  ← Approved leave record
│ - start_date    │
│ - end_date      │
│ - days_taken    │
└─────────────────┘
        │
        │ Attendance worker reads
        ▼
┌─────────────────┐
│ ATTENDANCE      │  ← Final attendance marked
│ - status: leave │
└─────────────────┘
```

### Leave Balance Calculation

```typescript
async function getLeaveBalance(userId: number, leaveTypeId: number, year: number): Promise<{
  allocated: number;
  used: number;
  remaining: number;
  pending: number;
}> {
  
  // Get allocation for this year
  const allocation = await LeaveAllocationModel.findByUserAndType(userId, leaveTypeId, year);
  const allocated = allocation?.allocated_days || 0;
  
  // Get used days from leave_history
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  const used = await LeaveHistoryModel.getTotalDaysTaken(userId, leaveTypeId, startDate, endDate);
  
  // Get pending requests
  const pendingRequests = await LeaveRequestModel.findByUserIdAndStatus(userId, 'submitted');
  const pending = pendingRequests.reduce((sum, req) => sum + req.days_requested, 0);
  
  return {
    allocated,
    used,
    remaining: allocated - used,
    pending
  };
}
```

---

## Attendance Processor Worker

### Purpose

Automated background job that runs **daily at midnight** to:
- Mark absent employees (scheduled but no check-in)
- Mark employees on leave (from approved leave_history)
- Mark employees on holiday (from holidays table)

### Implementation

```typescript
// File: /src/workers/attendance-processor.worker.ts

class AttendanceProcessorWorker {
  
  // Main entry point - starts the worker
  static async start() {
    console.log('Starting Attendance Processor Worker...');
    
    // Process yesterday's attendance immediately (in case it was missed)
    await this.processYesterdayAttendance();
    
    // Schedule daily processing at 12:05 AM
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setDate(nextRun.getDate() + 1);
    nextRun.setHours(0, 5, 0, 0);  // 12:05 AM
    
    const msUntilNextRun = nextRun.getTime() - now.getTime();
    
    setTimeout(() => {
      this.processYesterdayAttendance();
      
      // Recur every 24 hours
      setInterval(() => {
        this.processYesterdayAttendance();
      }, 24 * 60 * 60 * 1000);
      
    }, msUntilNextRun);
  }
  
  // Process attendance for yesterday
  static async processYesterdayAttendance() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    await this.processAttendanceForDate(yesterday);
  }
  
  // Process attendance for a specific date
  static async processAttendanceForDate(date: Date) {
    console.log(`Processing attendance for ${date.toISOString().split('T')[0]}`);
    
    // Get all active employees
    const employees = await this.getActiveEmployees();
    
    // Check if holiday
    const isHoliday = await HolidayModel.isHoliday(date);
    
    for (const employee of employees) {
      // Skip if attendance already exists
      const existing = await AttendanceModel.findByUserIdAndDate(employee.user_id, date);
      if (existing) {
        continue;  // Already processed
      }
      
      // Holiday handling
      if (isHoliday) {
        await AttendanceModel.create({
          user_id: employee.user_id,
          date: date,
          status: 'holiday',
          notes: 'Public holiday'
        });
        continue;
      }
      
      // Leave handling
      const leave = await LeaveHistoryModel.findByUserIdAndDateRange(
        employee.user_id,
        date,
        date
      );
      if (leave.length > 0) {
        await AttendanceModel.create({
          user_id: employee.user_id,
          date: date,
          status: 'leave',
          notes: 'On approved leave'
        });
        continue;
      }
      
      // Shift schedule check
      const schedule = await ShiftSchedulingService.getEffectiveScheduleForDate(
        employee.user_id,
        date
      );
      
      if (!schedule) {
        continue;  // Not expected to work
      }
      
      // No check-in recorded → Absent
      await AttendanceModel.create({
        user_id: employee.user_id,
        date: date,
        status: 'absent',
        notes: 'Scheduled shift but no check-in'
      });
    }
  }
}

// CRITICAL: Start the worker in /src/index.ts
import AttendanceProcessorWorker from './workers/attendance-processor.worker';

// After app initialization:
AttendanceProcessorWorker.start();
```

### Worker Execution Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│ DAILY EXECUTION SCHEDULE                                        │
└─────────────────────────────────────────────────────────────────┘

Day 1 (March 1)                                    Day 2 (March 2)
│                                                   │
│ 08:00  Employees check in/out                     │
│ 17:00  Employees check out                        │
│ 23:59  Day ends                                   │
│                                                   │
│                          00:00  Day 2 begins      │
│                          00:05  WORKER RUNS       │
│                               └─ Processes March 1 attendance
│                                   - Marks absent (no check-in)
│                                   - Marks leave (from leave_history)
│                                   - Marks holiday (if applicable)
│                                   - Skips present/late (already checked in)
│
│ 08:00  Employees check in for Day 2
```

---

## Settings & Configuration

### Attendance Settings Table

```sql
CREATE TABLE attendance_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  branch_id INT NOT NULL UNIQUE,
  
  -- Check-in/out Requirements
  require_check_in BOOLEAN DEFAULT TRUE,
  require_check_out BOOLEAN DEFAULT TRUE,
  
  -- Auto-checkout
  auto_checkout_enabled BOOLEAN DEFAULT FALSE,
  auto_checkout_minutes_after_close INT DEFAULT 30,
  
  -- Manual Entry
  allow_manual_attendance_entry BOOLEAN DEFAULT TRUE,
  allow_future_attendance_entry BOOLEAN DEFAULT FALSE,
  
  -- Grace Period
  grace_period_minutes INT DEFAULT 0,
  
  -- Verification
  enable_location_verification BOOLEAN DEFAULT TRUE,
  enable_face_recognition BOOLEAN DEFAULT FALSE,
  enable_biometric_verification BOOLEAN DEFAULT FALSE,
  
  -- Notifications
  notify_absent_employees BOOLEAN DEFAULT TRUE,
  notify_supervisors_daily_summary BOOLEAN DEFAULT TRUE,
  
  -- Weekend/Holiday
  enable_weekend_attendance BOOLEAN DEFAULT FALSE,
  enable_holiday_attendance BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);
```

### Global Attendance Settings Table

```sql
CREATE TABLE global_attendance_settings (
  id INT PRIMARY KEY,  -- Always 1
  
  -- Same fields as attendance_settings (act as defaults)
  auto_checkout_enabled BOOLEAN DEFAULT FALSE,
  auto_checkout_minutes_after_close INT DEFAULT 30,
  grace_period_minutes INT DEFAULT 0,
  enable_face_recognition BOOLEAN DEFAULT FALSE,
  notify_absent_employees BOOLEAN DEFAULT TRUE,
  enable_weekend_attendance BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Default record
INSERT INTO global_attendance_settings (id) VALUES (1);
```

### Settings Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│ SETTINGS PRECEDENCE                                     │
└─────────────────────────────────────────────────────────┘

1. Branch-specific attendance_settings (highest priority)
   ↓ (if not set)
2. Global attendance_settings (defaults)
   ↓ (if not set)
3. Hardcoded defaults in code
```

### Settings Usage in Code

```typescript
async function getAttendanceSettings(branchId: number) {
  // Try branch-specific settings first
  const branchSettings = await pool.execute(
    'SELECT * FROM attendance_settings WHERE branch_id = ?',
    [branchId]
  );
  
  if (branchSettings.length > 0) {
    return branchSettings[0];
  }
  
  // Fall back to global settings
  const globalSettings = await pool.execute(
    'SELECT * FROM global_attendance_settings WHERE id = 1'
  );
  
  return globalSettings[0] || getDefaultSettings();
}

function getDefaultSettings() {
  return {
    require_check_in: true,
    require_check_out: true,
    auto_checkout_enabled: false,
    grace_period_minutes: 0,
    enable_location_verification: true
  };
}
```

---

## Complete API Reference

### Base URL

```
Development: http://localhost:3001/api
Production:  https://yourdomain.com/api
```

### Authentication

All endpoints require JWT token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

---

### BRANCH ENDPOINTS

#### Get All Branches

```http
GET /api/branches
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Branches retrieved successfully",
  "data": {
    "branches": [
      {
        "id": 1,
        "name": "Nairobi Headquarters",
        "code": "NBO-HQ",
        "address": "Westlands",
        "city": "Nairobi",
        "country": "Kenya",
        "phone": "+254700000000",
        "email": "nairobi@company.com",
        "location_coordinates": "POINT(36.817223 -1.286389)",
        "location_radius_meters": 100,
        "attendance_mode": "branch_based",
        "status": "active",
        "created_at": "2026-01-01T00:00:00.000Z",
        "updated_at": "2026-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

#### Get Branch by ID

```http
GET /api/branches/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Branch retrieved successfully",
  "data": {
    "branch": {
      "id": 1,
      "name": "Nairobi Headquarters",
      "code": "NBO-HQ",
      "address": "Westlands",
      "city": "Nairobi",
      "country": "Kenya",
      "location_coordinates": "POINT(36.817223 -1.286389)",
      "location_radius_meters": 100,
      "attendance_mode": "branch_based",
      "status": "active"
    }
  }
}
```

---

#### Create Branch

```http
POST /api/branches
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Mombasa Branch",
  "code": "MBA-01",
  "address": "Moi Avenue",
  "city": "Mombasa",
  "country": "Kenya",
  "phone": "+254711111111",
  "email": "mombasa@company.com",
  "location_coordinates": "POINT(39.668206 -4.043477)",
  "location_radius_meters": 150,
  "attendance_mode": "branch_based"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Branch created successfully",
  "data": {
    "branch": {
      "id": 2,
      "name": "Mombasa Branch",
      "code": "MBA-01",
      "location_coordinates": "POINT(39.668206 -4.043477)",
      "location_radius_meters": 150,
      "attendance_mode": "branch_based",
      "status": "active",
      "created_at": "2026-03-01T10:30:00.000Z"
    }
  }
}
```

---

#### Update Branch

```http
PUT /api/branches/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Mombasa Branch - Updated",
  "location_radius_meters": 200,
  "attendance_mode": "multiple_locations"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Branch updated successfully",
  "data": {
    "branch": {
      "id": 2,
      "name": "Mombasa Branch - Updated",
      "location_radius_meters": 200,
      "attendance_mode": "multiple_locations",
      "updated_at": "2026-03-01T11:00:00.000Z"
    }
  }
}
```

---

### ATTENDANCE SETTINGS ENDPOINTS

#### Get Branch Attendance Settings

```http
GET /api/attendance/settings?branchId=1
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance settings retrieved successfully",
  "data": {
    "settings": {
      "branch_id": 1,
      "branch_name": "Nairobi Headquarters",
      "attendance_mode": "branch_based",
      "require_check_in": true,
      "require_check_out": true,
      "grace_period_minutes": 15,
      "auto_checkout_enabled": true,
      "auto_checkout_minutes_after_close": 30,
      "enable_location_verification": true,
      "allow_manual_attendance_entry": true
    }
  }
}
```

---

#### Update Branch Attendance Settings

```http
PATCH /api/attendance/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "branchId": 1,
  "settings": {
    "require_check_in": true,
    "require_check_out": true,
    "grace_period_minutes": 15,
    "auto_checkout_enabled": true,
    "auto_checkout_minutes_after_close": 30,
    "enable_location_verification": true,
    "enable_weekend_attendance": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance settings updated successfully",
  "data": {
    "settings": {
      "id": 1,
      "branch_id": 1,
      "require_check_in": true,
      "require_check_out": true,
      "grace_period_minutes": 15,
      "auto_checkout_enabled": true,
      "updated_at": "2026-03-01T12:00:00.000Z"
    }
  }
}
```

---

#### Get Global Attendance Settings

```http
GET /api/attendance/settings/global
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Global attendance settings retrieved successfully",
  "data": {
    "settings": {
      "id": 1,
      "auto_checkout_enabled": false,
      "auto_checkout_minutes_after_close": 30,
      "grace_period_minutes": 0,
      "notify_absent_employees": true,
      "enable_weekend_attendance": false
    }
  }
}
```

---

#### Update Global Attendance Settings

```http
PATCH /api/attendance/settings/global
Authorization: Bearer <token>
Content-Type: application/json

{
  "settings": {
    "auto_checkout_enabled": true,
    "grace_period_minutes": 15,
    "notify_absent_employees": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Global attendance settings updated successfully",
  "data": {
    "settings": {
      "id": 1,
      "auto_checkout_enabled": true,
      "grace_period_minutes": 15,
      "notify_absent_employees": true,
      "updated_at": "2026-03-01T12:30:00.000Z"
    }
  }
}
```

---

### ATTENDANCE CHECK-IN/CHECK-OUT ENDPOINTS

#### Employee Check-in

```http
POST /api/attendance/check-in
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2026-03-01",
  "check_in_time": "08:55:00",
  "location_coordinates": {
    "latitude": -1.286389,
    "longitude": 36.817223
  },
  "location_address": "Nairobi Headquarters, Westlands"
}
```

**Response (Success - Present):**
```json
{
  "success": true,
  "message": "Check-in recorded successfully",
  "data": {
    "attendance": {
      "id": 1234,
      "user_id": 456,
      "date": "2026-03-01",
      "status": "present",
      "check_in_time": "08:55:00",
      "check_out_time": null,
      "location_coordinates": "POINT(36.817223 -1.286389)",
      "location_verified": true,
      "location_address": "Nairobi Headquarters, Westlands",
      "scheduled_start_time": "08:00:00",
      "scheduled_end_time": "17:00:00",
      "is_late": false,
      "actual_working_hours": null,
      "created_at": "2026-03-01T08:55:00.000Z"
    }
  }
}
```

**Response (Late):**
```json
{
  "success": true,
  "message": "Check-in recorded successfully",
  "data": {
    "attendance": {
      "id": 1235,
      "user_id": 456,
      "date": "2026-03-01",
      "status": "late",
      "check_in_time": "08:25:00",
      "scheduled_start_time": "08:00:00",
      "is_late": true,
      "location_verified": true
    }
  }
}
```

**Response (Already Checked In):**
```json
{
  "success": false,
  "message": "You have already checked in today. Multiple check-ins are not allowed."
}
```

**Response (Location Not Verified):**
```json
{
  "success": true,
  "message": "Check-in recorded successfully",
  "data": {
    "attendance": {
      "id": 1236,
      "user_id": 456,
      "date": "2026-03-01",
      "status": "present",
      "check_in_time": "08:55:00",
      "location_verified": false,
      "notes": "Location outside geofence"
    }
  }
}
```

---

#### Employee Check-out

```http
POST /api/attendance/check-out
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2026-03-01",
  "check_out_time": "17:05:00",
  "location_coordinates": {
    "latitude": -1.286389,
    "longitude": 36.817223
  },
  "location_address": "Nairobi Headquarters, Westlands"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Check-out recorded successfully",
  "data": {
    "attendance": {
      "id": 1234,
      "user_id": 456,
      "date": "2026-03-01",
      "status": "present",
      "check_in_time": "08:55:00",
      "check_out_time": "17:05:00",
      "location_coordinates": "POINT(36.817223 -1.286389)",
      "location_verified": true,
      "scheduled_start_time": "08:00:00",
      "scheduled_end_time": "17:00:00",
      "is_late": false,
      "is_early_departure": false,
      "actual_working_hours": 7.17,
      "updated_at": "2026-03-01T17:05:00.000Z"
    }
  }
}
```

**Response (Early Departure):**
```json
{
  "success": true,
  "message": "Check-out recorded successfully",
  "data": {
    "attendance": {
      "id": 1234,
      "user_id": 456,
      "date": "2026-03-01",
      "check_out_time": "16:00:00",
      "scheduled_end_time": "17:00:00",
      "is_early_departure": true,
      "actual_working_hours": 6.08
    }
  }
}
```

**Response (No Check-in Found):**
```json
{
  "success": false,
  "message": "No attendance record found for this date. Please check in first."
}
```

---

### MANUAL ATTENDANCE ENDPOINTS

#### Manual Attendance Entry (Admin)

```http
POST /api/attendance/manual
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": 789,
  "date": "2026-03-01",
  "check_in_time": "09:00:00",
  "check_out_time": "18:00:00",
  "status": "present",
  "location_coordinates": {
    "latitude": -1.286389,
    "longitude": 36.817223
  },
  "location_address": "Nairobi Office",
  "notes": "Manual entry - system was down"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "attendance": {
      "id": 1240,
      "user_id": 789,
      "date": "2026-03-01",
      "status": "present",
      "check_in_time": "09:00:00",
      "check_out_time": "18:00:00",
      "location_verified": true,
      "actual_working_hours": 8.0,
      "created_at": "2026-03-01T20:00:00.000Z"
    }
  }
}
```

---

#### Update Attendance Record (Admin)

```http
PUT /api/attendance/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "present",
  "check_in_time": "08:50:00",
  "check_out_time": "17:10:00",
  "notes": "Corrected by admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance updated successfully",
  "data": {
    "attendance": {
      "id": 1234,
      "user_id": 456,
      "date": "2026-03-01",
      "status": "present",
      "check_in_time": "08:50:00",
      "check_out_time": "17:10:00",
      "notes": "Corrected by admin",
      "updated_at": "2026-03-01T20:00:00.000Z"
    }
  }
}
```

---

### GET ATTENDANCE RECORDS

#### Get My Attendance

```http
GET /api/attendance/my?startDate=2026-03-01&endDate=2026-03-31
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance records retrieved successfully",
  "data": {
    "attendance": [
      {
        "id": 1234,
        "user_id": 456,
        "date": "2026-03-01",
        "status": "present",
        "check_in_time": "08:55:00",
        "check_out_time": "17:05:00",
        "scheduled_start_time": "08:00:00",
        "scheduled_end_time": "17:00:00",
        "is_late": false,
        "actual_working_hours": 7.17
      },
      {
        "id": 1233,
        "user_id": 456,
        "date": "2026-02-28",
        "status": "late",
        "check_in_time": "08:30:00",
        "check_out_time": "17:00:00",
        "is_late": true,
        "actual_working_hours": 7.5
      }
    ],
    "pagination": {
      "total": 22,
      "page": 1,
      "limit": 50,
      "totalPages": 1
    }
  }
}
```

---

#### Get All Attendance (Admin)

```http
GET /api/attendance?startDate=2026-03-01&endDate=2026-03-31&userId=456&status=present
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attendance": [...],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 50,
      "totalPages": 3
    }
  }
}
```

---

#### Get Attendance Summary

```http
GET /api/attendance/summary?userId=456&startDate=2026-03-01&endDate=2026-03-31
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance summary retrieved successfully",
  "data": {
    "summary": {
      "total_days": 22,
      "present_days": 18,
      "absent_days": 2,
      "late_days": 2,
      "leave_days": 3,
      "holiday_days": 1,
      "attendance_percentage": 90.5,
      "total_working_hours": 156.5,
      "average_daily_hours": 8.7
    }
  }
}
```

---

#### Get My Attendance Summary

```http
GET /api/attendance/my/summary?startDate=2026-03-01&endDate=2026-03-31
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_days": 22,
      "present_days": 20,
      "late_days": 2,
      "attendance_percentage": 95.5
    }
  }
}
```

---

### SHIFT TEMPLATE ENDPOINTS

#### Get All Shift Templates

```http
GET /api/shift-templates?isActive=true&page=1&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shiftTemplates": [
      {
        "id": 1,
        "name": "Standard Shift",
        "description": "Regular 8-hour shift",
        "start_time": "08:00:00",
        "end_time": "17:00:00",
        "break_duration_minutes": 60,
        "effective_from": "2026-01-01",
        "recurrence_pattern": "weekly",
        "is_active": true,
        "created_at": "2026-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "name": "Resume Late - 2 Hours",
        "description": "Start 2 hours late",
        "start_time": "10:00:00",
        "end_time": "17:00:00",
        "break_duration_minutes": 60,
        "effective_from": "2026-02-23",
        "recurrence_pattern": "weekly",
        "is_active": true
      },
      {
        "id": 3,
        "name": "Close Early - 3 Hours",
        "description": "Leave 3 hours early",
        "start_time": "08:00:00",
        "end_time": "14:00:00",
        "break_duration_minutes": 30,
        "effective_from": "2026-02-23",
        "recurrence_pattern": "weekly",
        "is_active": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 3,
      "itemsPerPage": 10
    }
  }
}
```

---

#### Get Shift Template by ID

```http
GET /api/shift-templates/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shiftTemplate": {
      "id": 1,
      "name": "Standard Shift",
      "description": "Regular 8-hour shift",
      "start_time": "08:00:00",
      "end_time": "17:00:00",
      "break_duration_minutes": 60,
      "effective_from": "2026-01-01",
      "recurrence_pattern": "weekly",
      "is_active": true
    }
  }
}
```

---

#### Create Shift Template

```http
POST /api/shift-templates
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Night Shift",
  "description": "Overnight shift for security team",
  "start_time": "22:00:00",
  "end_time": "06:00:00",
  "break_duration_minutes": 30,
  "effective_from": "2026-03-01",
  "effective_to": "2026-12-31",
  "recurrence_pattern": "weekly",
  "recurrence_days": ["monday", "tuesday", "wednesday", "thursday", "friday"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Shift template created successfully",
  "data": {
    "shiftTemplate": {
      "id": 4,
      "name": "Night Shift",
      "description": "Overnight shift for security team",
      "start_time": "22:00:00",
      "end_time": "06:00:00",
      "break_duration_minutes": 30,
      "effective_from": "2026-03-01",
      "effective_to": "2026-12-31",
      "recurrence_pattern": "weekly",
      "is_active": true,
      "created_at": "2026-03-01T14:00:00.000Z"
    }
  }
}
```

---

#### Update Shift Template

```http
PUT /api/shift-templates/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Night Shift - Updated",
  "end_time": "07:00:00",
  "break_duration_minutes": 45,
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Shift template updated successfully",
  "data": {
    "shiftTemplate": {
      "id": 4,
      "name": "Night Shift - Updated",
      "end_time": "07:00:00",
      "break_duration_minutes": 45,
      "is_active": true,
      "updated_at": "2026-03-01T14:30:00.000Z"
    }
  }
}
```

---

#### Delete (Deactivate) Shift Template

```http
DELETE /api/shift-templates/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Shift template deactivated successfully"
}
```

---

### EMPLOYEE SHIFT ASSIGNMENT ENDPOINTS

#### Get All Employee Shift Assignments

```http
GET /api/employee-shift-assignments?userId=456&status=active&page=1&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shiftAssignments": [
      {
        "id": 101,
        "user_id": 456,
        "user_name": "John Doe",
        "shift_template_id": 1,
        "template_name": "Standard Shift",
        "custom_start_time": null,
        "custom_end_time": null,
        "effective_from": "2026-01-01",
        "effective_to": null,
        "assignment_type": "permanent",
        "recurrence_pattern": "none",
        "status": "active",
        "assigned_by": 1,
        "assigned_by_name": "HR Admin",
        "created_at": "2026-01-01T00:00:00.000Z"
      },
      {
        "id": 102,
        "user_id": 456,
        "user_name": "John Doe",
        "shift_template_id": 2,
        "template_name": "Resume Late - 2 Hours",
        "custom_start_time": null,
        "custom_end_time": null,
        "effective_from": "2026-02-23",
        "effective_to": "2026-12-31",
        "assignment_type": "rotating",
        "recurrence_pattern": "weekly",
        "recurrence_day_of_week": "monday",
        "status": "active",
        "assigned_by": 1,
        "created_at": "2026-02-20T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 2,
      "itemsPerPage": 10
    }
  }
}
```

---

#### Get Shift Assignment by ID

```http
GET /api/employee-shift-assignments/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shiftAssignment": {
      "id": 102,
      "user_id": 456,
      "shift_template_id": 2,
      "template_name": "Resume Late - 2 Hours",
      "effective_from": "2026-02-23",
      "recurrence_pattern": "weekly",
      "recurrence_day_of_week": "monday",
      "status": "active"
    }
  }
}
```

---

#### Assign Shift to Employee

```http
POST /api/employee-shift-assignments
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": 456,
  "shift_template_id": 1,
  "effective_from": "2026-03-01",
  "effective_to": "2026-12-31",
  "assignment_type": "permanent",
  "notes": "Standard day shift"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Shift assigned to employee successfully",
  "data": {
    "shiftAssignment": {
      "id": 103,
      "user_id": 456,
      "shift_template_id": 1,
      "template_name": "Standard Shift",
      "effective_from": "2026-03-01",
      "effective_to": "2026-12-31",
      "assignment_type": "permanent",
      "status": "active",
      "notes": "Standard day shift",
      "created_at": "2026-03-01T15:00:00.000Z"
    }
  }
}
```

---

#### Update Shift Assignment

```http
PUT /api/employee-shift-assignments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "effective_to": "2026-06-30",
  "status": "active",
  "notes": "Updated end date"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Shift assignment updated successfully",
  "data": {
    "shiftAssignment": {
      "id": 103,
      "user_id": 456,
      "effective_to": "2026-06-30",
      "notes": "Updated end date",
      "status": "active",
      "updated_at": "2026-03-01T15:30:00.000Z"
    }
  }
}
```

---

### RECURRING SHIFT ASSIGNMENT ENDPOINTS

#### Bulk Assign Recurring Shifts (Different Days)

```http
POST /api/recurring-shifts/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "assignments": [
    {
      "user_id": 123,
      "shift_template_id": 2,
      "day_of_week": "monday",
      "start_date": "2026-03-01",
      "end_date": "2026-12-31",
      "notes": "Resume Late - Team Lead Meeting Sundays"
    },
    {
      "user_id": 456,
      "shift_template_id": 2,
      "day_of_week": "tuesday",
      "start_date": "2026-03-01",
      "end_date": "2026-12-31",
      "notes": "Resume Late - Childcare"
    },
    {
      "user_id": 789,
      "shift_template_id": 3,
      "day_of_week": "wednesday",
      "start_date": "2026-03-01",
      "end_date": "2026-12-31",
      "notes": "Close Early - Weekly Appointment"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk recurring shift assignment completed. 3 succeeded, 0 failed.",
  "data": {
    "results": [
      {
        "user_id": 123,
        "success": true,
        "assignment": {
          "id": 201,
          "user_id": 123,
          "user_name": "Alice Johnson",
          "template_name": "Resume Late - 2 Hours",
          "start_time": "10:00:00",
          "end_time": "17:00:00",
          "recurrence_pattern": "weekly",
          "recurrence_day_of_week": "monday",
          "effective_from": "2026-03-01",
          "recurrence_end_date": "2026-12-31",
          "status": "active"
        }
      },
      {
        "user_id": 456,
        "success": true,
        "assignment": {
          "id": 202,
          "user_id": 456,
          "user_name": "John Doe",
          "template_name": "Resume Late - 2 Hours",
          "start_time": "10:00:00",
          "end_time": "17:00:00",
          "recurrence_pattern": "weekly",
          "recurrence_day_of_week": "tuesday",
          "effective_from": "2026-03-01",
          "recurrence_end_date": "2026-12-31",
          "status": "active"
        }
      },
      {
        "user_id": 789,
        "success": true,
        "assignment": {
          "id": 203,
          "user_id": 789,
          "user_name": "Jane Smith",
          "template_name": "Close Early - 3 Hours",
          "start_time": "08:00:00",
          "end_time": "14:00:00",
          "recurrence_pattern": "weekly",
          "recurrence_day_of_week": "wednesday",
          "effective_from": "2026-03-01",
          "recurrence_end_date": "2026-12-31",
          "status": "active"
        }
      }
    ],
    "summary": {
      "total": 3,
      "successful": 3,
      "failed": 0
    }
  }
}
```

---

#### Get Recurring Shifts

```http
GET /api/recurring-shifts?userId=456
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recurringShifts": [
      {
        "id": 202,
        "user_id": 456,
        "user_name": "John Doe",
        "template_name": "Resume Late - 2 Hours",
        "start_time": "10:00:00",
        "end_time": "17:00:00",
        "recurrence_pattern": "weekly",
        "recurrence_day_of_week": "tuesday",
        "effective_from": "2026-03-01",
        "recurrence_end_date": "2026-12-31",
        "status": "active"
      }
    ]
  }
}
```

---

#### Update Recurring Shift

```http
PUT /api/recurring-shifts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "day_of_week": "thursday",
  "end_date": "2026-06-30",
  "notes": "Changed from Tuesday to Thursday"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Recurring shift updated successfully",
  "data": {
    "shiftAssignment": {
      "id": 202,
      "user_id": 456,
      "recurrence_day_of_week": "thursday",
      "recurrence_end_date": "2026-06-30",
      "notes": "Changed from Tuesday to Thursday",
      "updated_at": "2026-03-01T16:00:00.000Z"
    }
  }
}
```

---

#### Cancel Recurring Shift

```http
DELETE /api/recurring-shifts/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Recurring shift cancelled successfully"
}
```

---

### ATTENDANCE LOCATION ENDPOINTS

#### Get All Attendance Locations

```http
GET /api/attendance-locations?branchId=1
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attendanceLocations": [
      {
        "id": 1,
        "name": "Nairobi HQ - Main Entrance",
        "location_coordinates": "POINT(36.817223 -1.286389)",
        "location_radius_meters": 100,
        "branch_id": 1,
        "is_active": true,
        "created_at": "2026-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "name": "Nairobi HQ - Parking Lot",
        "location_coordinates": "POINT(36.817500 -1.286500)",
        "location_radius_meters": 150,
        "branch_id": 1,
        "is_active": true
      }
    ]
  }
}
```

---

#### Create Attendance Location

```http
POST /api/attendance-locations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Westlands Satellite Office",
  "location_coordinates": {
    "latitude": -1.285000,
    "longitude": 36.818000
  },
  "location_radius_meters": 100,
  "branch_id": 1,
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance location created successfully",
  "data": {
    "attendanceLocation": {
      "id": 3,
      "name": "Westlands Satellite Office",
      "location_coordinates": "POINT(36.818000 -1.285000)",
      "location_radius_meters": 100,
      "branch_id": 1,
      "is_active": true,
      "created_at": "2026-03-01T17:00:00.000Z"
    }
  }
}
```

---

#### Update Attendance Location

```http
PUT /api/attendance-locations/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Westlands Satellite Office - Updated",
  "location_radius_meters": 150
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance location updated successfully",
  "data": {
    "attendanceLocation": {
      "id": 3,
      "name": "Westlands Satellite Office - Updated",
      "location_radius_meters": 150,
      "updated_at": "2026-03-01T17:30:00.000Z"
    }
  }
}
```

---

#### Delete (Deactivate) Attendance Location

```http
DELETE /api/attendance-locations/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance location deactivated successfully"
}
```

---

## Frontend Implementation Guide

### Component Structure

```
src/
├── components/
│   ├── attendance/
│   │   ├── CheckInButton.tsx              # Employee check-in with GPS
│   │   ├── CheckOutButton.tsx             # Employee check-out with GPS
│   │   ├── AttendanceCalendar.tsx         # Monthly calendar view
│   │   ├── AttendanceHistory.tsx          # List view with filters
│   │   ├── AttendanceSummary.tsx          # Statistics cards
│   │   └── ManualAttendanceForm.tsx       # Admin manual entry
│   │
│   ├── shifts/
│   │   ├── ShiftTemplateList.tsx          # List all templates
│   │   ├── ShiftTemplateForm.tsx          # Create/edit template
│   │   ├── MySchedule.tsx                 # Employee view of their schedule
│   │   ├── RecurringShiftForm.tsx         # Assign recurring shift
│   │   └── BulkRecurringShiftForm.tsx     # Bulk assign to multiple employees
│   │
│   ├── branches/
│   │   ├── BranchList.tsx                 # List all branches
│   │   ├── BranchForm.tsx                 # Create/edit branch
│   │   ├── BranchMap.tsx                  # Map view with locations
│   │   └── AttendanceSettingsForm.tsx     # Configure attendance rules
│   │
│   └── locations/
│       ├── AttendanceLocationList.tsx     # List approved locations
│       ├── AttendanceLocationForm.tsx     # Add/edit location
│       └── LocationMapPicker.tsx          # Map coordinate selector
│
└── screens/
    ├── AttendanceScreen.tsx
    ├── ShiftManagementScreen.tsx
    ├── BranchManagementScreen.tsx
    └── MyAttendanceScreen.tsx
```

---

### React Component: CheckInButton

```typescript
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api-service';

interface CheckInButtonProps {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

const CheckInButton: React.FC<CheckInButtonProps> = ({ onSuccess, onError }) => {
  const [checkingIn, setCheckingIn] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get current location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        setError('Unable to retrieve your location. Please enable GPS.');
      }
    );
  };

  const handleCheckIn = async () => {
    if (!location) {
      setError('Waiting for location...');
      return;
    }

    setCheckingIn(true);
    setError(null);

    try {
      const now = new Date();
      const response = await apiService.request('/attendance/check-in', {
        method: 'POST',
        body: JSON.stringify({
          date: now.toISOString().split('T')[0],
          check_in_time: now.toTimeString().split(' ')[0],
          location_coordinates: {
            latitude: location.lat,
            longitude: location.lng
          },
          location_address: 'Fetching address...' // Could reverse geocode
        })
      });

      if (response.success) {
        onSuccess?.(response.data);
      } else {
        setError(response.message || 'Check-in failed');
        onError?.(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      onError?.(err.message);
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="check-in-button">
      <button
        onClick={handleCheckIn}
        disabled={checkingIn || !location}
        className="btn btn-primary"
      >
        {checkingIn ? 'Checking In...' : 'Check In'}
      </button>

      {location && (
        <p className="location-status">
          📍 Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
        </p>
      )}

      {error && (
        <p className="error-message">❌ {error}</p>
      )}
    </div>
  );
};

export default CheckInButton;
```

---

### React Component: AttendanceCalendar

```typescript
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api-service';

interface AttendanceRecord {
  id: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'leave' | 'holiday';
  check_in_time: string;
  check_out_time: string;
  is_late: boolean;
  actual_working_hours: number;
}

const AttendanceCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [currentMonth]);

  const fetchAttendance = async () => {
    setLoading(true);
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const response = await apiService.request(
      `/attendance/my?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
    );

    if (response.success) {
      setAttendanceRecords(response.data.attendance);
    }
    setLoading(false);
  };

  const getRecordForDate = (date: Date): AttendanceRecord | undefined => {
    const dateStr = date.toISOString().split('T')[0];
    return attendanceRecords.find(r => r.date === dateStr);
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      leave: 'bg-blue-100 text-blue-800',
      holiday: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: JSX.Element[] = [];

    // Empty cells for days before first day of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border"></div>);
    }

    // Days of month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const record = getRecordForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          className={`h-24 border p-2 ${isToday ? 'bg-blue-50' : ''}`}
        >
          <div className="font-bold">{day}</div>
          {record && (
            <div className={`mt-1 px-2 py-1 rounded text-xs ${getStatusColor(record.status)}`}>
              {record.status.toUpperCase()}
              {record.check_in_time && (
                <div className="text-xs mt-1">
                  {record.check_in_time} - {record.check_out_time || '...'}
                </div>
              )}
              {record.is_late && <div className="text-xs text-red-600">Late</div>}
              {record.actual_working_hours && (
                <div className="text-xs">{record.actual_working_hours}h</div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="attendance-calendar">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
          className="btn btn-secondary"
        >
          ← Previous
        </button>
        <h2 className="text-xl font-bold">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
          className="btn btn-secondary"
        >
          Next →
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-7 gap-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="h-8 font-bold text-center border-b">
              {day}
            </div>
          ))}
          {renderCalendarDays()}
        </div>
      )}

      <div className="mt-4 flex gap-4 text-sm">
        <span className="px-2 py-1 bg-green-100 rounded">Present</span>
        <span className="px-2 py-1 bg-red-100 rounded">Absent</span>
        <span className="px-2 py-1 bg-yellow-100 rounded">Late</span>
        <span className="px-2 py-1 bg-blue-100 rounded">Leave</span>
        <span className="px-2 py-1 bg-purple-100 rounded">Holiday</span>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
```

---

### React Component: MySchedule

```typescript
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api-service';

interface ShiftAssignment {
  id: number;
  template_name: string;
  start_time: string;
  end_time: string;
  recurrence_pattern: string;
  recurrence_day_of_week?: string;
  effective_from: string;
  recurrence_end_date?: string;
  assignment_type: string;
  status: string;
}

const MySchedule: React.FC = () => {
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [weeklySchedule, setWeeklySchedule] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    const response = await apiService.request('/employee-shift-assignments?status=active');
    
    if (response.success) {
      const activeAssignments = response.data.shiftAssignments;
      setAssignments(activeAssignments);
      calculateWeeklySchedule(activeAssignments);
    }
    setLoading(false);
  };

  const calculateWeeklySchedule = (assignments: ShiftAssignment[]) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const schedule: Record<string, any> = {};

    // Find standard/permanent shift
    const standardShift = assignments.find(
      a => a.recurrence_pattern === 'none' && a.assignment_type === 'permanent'
    );

    // Initialize all days with standard shift
    days.forEach(day => {
      schedule[day] = {
        start_time: standardShift?.start_time || '08:00',
        end_time: standardShift?.end_time || '17:00',
        template_name: standardShift?.template_name || 'Standard Shift',
        isAdjusted: false
      };
    });

    // Override with recurring shifts
    assignments.forEach(assignment => {
      if (assignment.recurrence_pattern === 'weekly' && assignment.recurrence_day_of_week) {
        schedule[assignment.recurrence_day_of_week] = {
          start_time: assignment.start_time,
          end_time: assignment.end_time,
          template_name: assignment.template_name,
          isAdjusted: true
        };
      }
    });

    setWeeklySchedule(schedule);
  };

  if (loading) return <div>Loading schedule...</div>;

  return (
    <div className="my-schedule">
      <h2 className="text-2xl font-bold mb-4">My Weekly Schedule</h2>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {Object.entries(weeklySchedule).map(([day, schedule]: [string, any]) => (
          <div
            key={day}
            className={`p-4 rounded-lg border-2 ${
              schedule.isAdjusted ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <h3 className="font-bold capitalize text-lg">{day}</h3>
            <div className="mt-2 text-2xl font-mono">
              {schedule.start_time} - {schedule.end_time}
            </div>
            <div className="mt-2">
              <span
                className={`px-2 py-1 rounded text-xs ${
                  schedule.isAdjusted ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'
                }`}
              >
                {schedule.template_name}
              </span>
            </div>
            {schedule.isAdjusted && (
              <div className="mt-2 text-xs text-blue-600">
                ⚠ Adjusted schedule
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h3 className="font-bold mb-2">Legend:</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-200"></div>
            <span>Standard Schedule</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 bg-blue-50"></div>
            <span>Adjusted Schedule (Recurring)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySchedule;
```

---

## Critical Fixes Checklist

### 🔴 CRITICAL (Fix Immediately)

- [ ] **Start Attendance Worker** in `/src/index.ts`
  ```typescript
  import AttendanceProcessorWorker from './workers/attendance-processor.worker';
  AttendanceProcessorWorker.start();
  ```

- [ ] **Call updateAttendanceWithScheduleInfo** after check-in/check-out
  - File: `/src/api/attendance-check.route.ts`
  - Already implemented but verify it's being called

- [ ] **Test automated absent marking**
  - Let worker run at midnight
  - Verify absent employees are marked correctly

---

### 🟠 HIGH PRIORITY (Fix This Week)

- [ ] **Fix location_coordinates type in branches table**
  ```sql
  ALTER TABLE branches 
  MODIFY COLUMN location_coordinates POINT,
  ADD SPATIAL INDEX(location_coordinates);
  ```

- [ ] **Integrate attendance_settings properly**
  - Update code to read from `attendance_settings` table
  - Not from `branches` table

- [ ] **Test grace period application**
  - Verify it's applied during check-in
  - Verify it's applied during worker processing

---

### 🟡 MEDIUM PRIORITY (Fix This Month)

- [ ] **Implement auto-checkout**
  - Run cron job at night to check out employees who forgot

- [ ] **Add early departure detection**
  - Already in schema (`is_early_departure`)
  - Ensure it's calculated and displayed

- [ ] **Add half-day attendance support**
  - Create UI for half-day requests
  - Update attendance calculation

---

### 🟢 LOW PRIORITY (Nice to Have)

- [ ] **Add audit logging** for attendance changes
- [ ] **Implement notifications** for absent employees
- [ ] **Add attendance export** to CSV/PDF
- [ ] **Create real-time dashboard** with WebSocket

---

## Testing Checklist

### Branch Configuration
- [ ] Create branch with branch_based attendance mode
- [ ] Create branch with multiple_locations attendance mode
- [ ] Create branch with flexible attendance mode
- [ ] Set location coordinates and radius
- [ ] Test geofencing with different coordinates

### Shift Scheduling
- [ ] Create standard shift template
- [ ] Create "Resume Late" shift template
- [ ] Create "Close Early" shift template
- [ ] Assign permanent shift to employee
- [ ] Assign recurring shift (every Monday)
- [ ] Bulk assign different days to multiple employees
- [ ] Employee views their weekly schedule
- [ ] Verify schedule shows adjusted days correctly

### Attendance Check-in
- [ ] Employee checks in from branch location (verified)
- [ ] Employee checks in from outside geofence (not verified)
- [ ] Employee checks in late (status = late)
- [ ] Employee checks in on time (status = present)
- [ ] Employee checks in on their "Resume Late" day (not late)
- [ ] Employee tries to check in twice (rejected)
- [ ] Employee checks in without GPS (if flexible mode)

### Attendance Check-out
- [ ] Employee checks out on time
- [ ] Employee checks out early (is_early_departure = true)
- [ ] Employee checks out and working hours calculated
- [ ] Employee tries to check out without checking in (rejected)
- [ ] Employee tries to check out twice (rejected)

### Attendance Settings
- [ ] Set grace period to 15 minutes
- [ ] Employee checks in 10 min late (not marked late)
- [ ] Employee checks in 20 min late (marked late)
- [ ] Disable check-out requirement
- [ ] Enable auto-checkout
- [ ] Disable location verification

### Automated Processing
- [ ] Worker runs at midnight
- [ ] Employees without check-in marked as absent
- [ ] Employees on leave marked as "leave"
- [ ] Holiday marking works
- [ ] Employees with shifts but no check-in marked absent
- [ ] Employees without shifts skipped

### Leave Integration
- [ ] Employee submits leave request
- [ ] Manager approves leave request
- [ ] Leave history created
- [ ] Worker marks attendance as "leave"
- [ ] Leave balance updated

---

## Summary

This document provides a complete understanding of how **Shift Scheduling**, **Attendance**, **Leave**, and **Branch Configuration** work together.

**Key Takeaways:**

1. **Branches** define physical locations and attendance modes
2. **Shift Templates** define reusable work schedules
3. **Shift Assignments** assign schedules to employees with recurrence rules
4. **Attendance** tracks actual check-in/out times vs expected schedule
5. **Leave** integrates by creating leave_history which worker reads
6. **Settings** control behavior (grace period, auto-checkout, etc.)
7. **Worker** automates daily attendance marking at midnight

**Data Flow:**
```
Branch Config → Attendance Mode & Location
     ↓
Shift Assignment → Expected Schedule
     ↓
Employee Check-in/out → Actual Times
     ↓
Comparison → Late? Early? Working Hours?
     ↓
Attendance Record (Complete)
```

**Next Steps:**
1. Fix critical issues (start worker, populate shift fields)
2. Test end-to-end workflows
3. Implement frontend components
4. Deploy to production
