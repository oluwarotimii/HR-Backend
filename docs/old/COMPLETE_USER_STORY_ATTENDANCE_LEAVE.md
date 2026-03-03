# 📚 Complete User Story: Attendance & Leave Management System

**Company:** Femtech Kenya Ltd  
**System:** HR Management System  
**Date:** February 26, 2026  
**Version:** 1.0.0

---

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [Key Characters](#key-characters)
3. [Leave Management Story](#leave-management-story)
4. [Attendance Management Story](#attendance-management-story)
5. [Shift Scheduling Story](#shift-scheduling-story)
6. [Complete Day-in-the-Life Scenarios](#complete-day-in-the-life-scenarios)
7. [System Capabilities Summary](#system-capabilities-summary)
8. [API Quick Reference](#api-quick-reference)

---

## 🎯 Introduction

This document tells the complete story of how the **Attendance and Leave Management System** works at Femtech Kenya Ltd, a company with **multiple branches** (Nairobi, Mombasa, Kisumu) and **200+ employees**.

The system handles:
- ✅ **Leave requests** (application, approval, tracking)
- ✅ **Leave allocations** (annual, sick, compassionate, maternity/paternity)
- ✅ **Daily attendance** (check-in/check-out with GPS verification)
- ✅ **Shift scheduling** (recurring assignments, templates, exceptions)
- ✅ **Automated processing** (absent marking, holiday detection, leave marking)
- ✅ **Multi-branch operations** (different working days per branch)
- ✅ **Geofencing** (location-based attendance verification)

---

## 👥 Key Characters

### 1. **Sarah Johnson** - HR Admin (Nairobi HQ)
- **Role:** HR Administrator
- **Email:** `sarah.johnson@femtech.co.ke`
- **Permissions:** `leave:approve`, `attendance:manage`, `staff:manage`
- **Responsibilities:**
  - Approve/reject leave requests
  - Manage employee shifts
  - Review attendance reports
  - Configure leave policies

### 2. **John Kamau** - Software Developer (Nairobi)
- **Role:** Senior Developer
- **Email:** `john.kamau@femtech.co.ke`
- **Branch:** Nairobi (Mon-Fri, 9:00 AM - 5:00 PM)
- **Shift:** Standard Hours (recurring weekly)
- **Leave Balance:** 21 days annual, 10 days sick

### 3. **Mary Achieng** - Customer Support (Mombasa)
- **Role:** Support Agent
- **Email:** `mary.achieng@femtech.co.ke`
- **Branch:** Mombasa (Mon-Sat, 8:00 AM - 4:00 PM)
- **Shift:** Rotating shifts (Morning/Evening)
- **Leave Balance:** 18 days annual, 8 days sick

### 4. **David Omondi** - Branch Manager (Kisumu)
- **Role:** Branch Manager
- **Email:** `david.omondi@femtech.co.ke`
- **Branch:** Kisumu (Mon-Fri, 8:30 AM - 5:30 PM)
- **Permissions:** `leave:approve` (for his branch only)
- **Responsibilities:** Approve leave for Kisumu team

---

## 🏖️ Leave Management Story

### Chapter 1: Leave Configuration (Admin Setup)

#### Scene 1.1: Setting Up Leave Types

**Sarah (HR Admin)** starts by configuring the company's leave policy:

```http
POST /api/leave/types
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Annual Leave",
  "description": "Paid annual leave for permanent employees",
  "default_days": 21,
  "paid": true,
  "requires_documentation": false,
  "max_consecutive_days": 30,
  "accrual_enabled": true,
  "accrual_frequency": "monthly"
}
```

**System Response:**
```json
{
  "success": true,
  "message": "Leave type created successfully",
  "data": {
    "leaveType": {
      "id": 1,
      "name": "Annual Leave",
      "default_days": 21,
      "paid": true,
      "created_at": "2026-01-01T00:00:00Z"
    }
  }
}
```

**Femtech's Leave Types:**
| ID | Type | Days | Paid | Documentation |
|----|------|------|------|---------------|
| 1 | Annual Leave | 21 | ✅ | ❌ |
| 2 | Sick Leave | 10 | ✅ | ✅ (after 3 days) |
| 3 | Compassionate Leave | 5 | ✅ | ✅ |
| 4 | Maternity Leave | 90 | ✅ | ✅ |
| 5 | Paternity Leave | 14 | ✅ | ✅ |
| 6 | Unpaid Leave | 0 | ❌ | ❌ |

#### Scene 1.2: Allocating Leave to Employees

**Sarah** allocates annual leave to all eligible employees:

```http
POST /api/leave/allocations
Authorization: Bearer <admin_token>

{
  "user_id": 45,  // John Kamau
  "leave_type_id": 1,  // Annual Leave
  "allocated_days": 21,
  "cycle_start_date": "2026-01-01",
  "cycle_end_date": "2026-12-31",
  "carried_over_days": 3  // From previous year
}
```

**System automatically:**
- ✅ Creates allocation record
- ✅ Sets `used_days = 0`
- ✅ Calculates `remaining_days = 21 + 3 = 24`
- ✅ Sends notification to John: "You have been allocated 21 days of Annual Leave"

**Current Allocation for John:**
```json
{
  "id": 156,
  "user_id": 45,
  "leave_type_id": 1,
  "allocated_days": 21,
  "used_days": 0,
  "carried_over_days": 3,
  "remaining_days": 24,
  "cycle_start_date": "2026-01-01",
  "cycle_end_date": "2026-12-31"
}
```

---

### Chapter 2: Employee Leave Request

#### Scene 2.1: John Needs Vacation

**Context:** John Kamau has been working hard for 6 months and wants to take a 10-day vacation to visit family in Western Kenya.

**Date:** March 15, 2026  
**Request:** April 1-12, 2026 (10 working days, excluding weekends)

**Step 1: Check Leave Balance**

John first checks his leave balance:

```http
GET /api/leave/balance
Authorization: Bearer <john_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Leave balances retrieved successfully",
  "data": {
    "balances": [
      {
        "leave_type_id": 1,
        "leave_type_name": "Annual Leave",
        "allocated_days": 21,
        "used_days": 5,
        "carried_over_days": 3,
        "pending_days": 0,
        "remaining_days": 19,  // 21 - 5 + 3 = 19
        "cycle_start_date": "2026-01-01",
        "cycle_end_date": "2026-12-31"
      },
      {
        "leave_type_id": 2,
        "leave_type_name": "Sick Leave",
        "allocated_days": 10,
        "used_days": 2,
        "carried_over_days": 0,
        "pending_days": 0,
        "remaining_days": 8,
        "cycle_start_date": "2026-01-01",
        "cycle_end_date": "2026-12-31"
      }
    ]
  }
}
```

✅ **John has 19 days of annual leave - enough for his 10-day request!**

**Step 2: Submit Leave Request**

John submits his leave request through the system:

```http
POST /api/leave
Authorization: Bearer <john_token>
Content-Type: application/json

{
  "leave_type_id": 1,
  "start_date": "2026-04-01",
  "end_date": "2026-04-12",
  "reason": "Visiting family in Western Kenya for Easter celebrations",
  "attachments": [
    {
      "file_name": "travel_itinerary.pdf",
      "file_url": "/uploads/leave/2026/03/john_travel.pdf"
    }
  ]
}
```

**System Validation:**
1. ✅ Checks if user has sufficient balance (19 days available, 10 days requested)
2. ✅ Validates dates (start date is in the future)
3. ✅ Checks for overlapping leave requests (none found)
4. ✅ Calculates days: April 1-12 = 10 working days (excludes 2 weekends)

**System Actions:**
1. ✅ Creates leave request with status `"submitted"`
2. ✅ Identifies all users with `leave:approve` permission
3. ✅ Queues email notifications to approvers (Sarah + David)
4. ✅ Updates John's pending leave days

**Response:**
```json
{
  "success": true,
  "message": "Leave request submitted successfully",
  "data": {
    "leaveRequest": {
      "id": 789,
      "user_id": 45,
      "user_name": "John Kamau",
      "leave_type_id": 1,
      "leave_type_name": "Annual Leave",
      "start_date": "2026-04-01",
      "end_date": "2026-04-12",
      "days_requested": 10,
      "reason": "Visiting family in Western Kenya for Easter celebrations",
      "status": "submitted",
      "submitted_at": "2026-03-15T10:30:00Z"
    }
  }
}
```

**Email Notification to Sarah (HR Admin):**
```
Subject: New Leave Request Pending Approval

Dear Sarah Johnson,

John Kamau has submitted a leave request:

Leave Type: Annual Leave
Start Date: April 1, 2026
End Date: April 12, 2026
Days Requested: 10
Reason: Visiting family in Western Kenya for Easter celebrations

Please review and approve/reject this request.

Best regards,
HR Management System
```

---

### Chapter 3: Manager Review & Approval

#### Scene 3.1: Sarah Reviews the Request

**Next day:** Sarah logs into the system and checks pending leave requests:

```http
GET /api/leave?status=pending
Authorization: Bearer <sarah_admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "leaveRequests": [
      {
        "id": 789,
        "user_id": 45,
        "user_name": "John Kamau",
        "user_email": "john.kamau@femtech.co.ke",
        "branch_name": "Nairobi",
        "leave_type_id": 1,
        "leave_type_name": "Annual Leave",
        "start_date": "2026-04-01",
        "end_date": "2026-04-12",
        "days_requested": 10,
        "reason": "Visiting family in Western Kenya for Easter celebrations",
        "status": "submitted",
        "submitted_at": "2026-03-15T10:30:00Z",
        "current_leave_balance": 19
      }
    ],
    "pagination": {
      "totalItems": 1,
      "currentPage": 1,
      "totalPages": 1
    }
  }
}
```

**Sarah's Review Checklist:**
- ✅ John has sufficient balance (19 days available)
- ✅ Request is properly documented
- ✅ No critical project deadlines during this period
- ✅ Other team members can cover his responsibilities

#### Scene 3.2: Sarah Approves the Leave

Sarah approves the leave request:

```http
PUT /api/leave/789
Authorization: Bearer <sarah_admin_token>
Content-Type: application/json

{
  "status": "approved",
  "reason": "Approved - Have a great trip!"
}
```

**System Actions (Inside a Transaction):**

1. ✅ **Updates leave request status:**
   ```sql
   UPDATE leave_requests 
   SET status = 'approved', 
       reviewed_by = 1,  -- Sarah's ID
       reviewed_at = NOW()
   WHERE id = 789
   ```

2. ✅ **Creates leave history record:**
   ```sql
   INSERT INTO leave_history 
   (user_id, leave_type_id, start_date, end_date, days_taken, reason, approved_at)
   VALUES 
   (45, 1, '2026-04-01', '2026-04-12', 10, '...', NOW())
   ```

3. ✅ **Deducts days from allocation:**
   ```sql
   UPDATE leave_allocations 
   SET used_days = used_days + 10 
   WHERE user_id = 45 AND leave_type_id = 1
   -- used_days: 5 → 15
   ```

4. ✅ **Sends approval notification to John:**
   ```
   Subject: Leave Request Approved
   
   Dear John Kamau,
   
   Your leave request has been approved:
   
   Leave Type: Annual Leave
   Start Date: April 1, 2026
   End Date: April 12, 2026
   Days Approved: 10
   
   Approved by: Sarah Johnson
   
   Best regards,
   HR Management System
   ```

**Updated Allocation for John:**
```json
{
  "allocated_days": 21,
  "used_days": 15,  // 5 + 10
  "carried_over_days": 3,
  "remaining_days": 9,  // 21 - 15 + 3
  "pending_days": 0
}
```

---

### Chapter 4: Special Leave Scenarios

#### Scene 4.1: Emergency Sick Leave (Mary Achieng)

**Context:** Mary wakes up sick on a Monday morning and needs to take immediate sick leave.

**Date:** March 20, 2026 (Monday)  
**Time:** 7:30 AM  
**Request:** Same-day sick leave (March 20)

**Mary's Actions:**

1. **Calls David (Branch Manager)** at 7:45 AM to inform him
2. **Submits sick leave request** from her phone:

```http
POST /api/leave
Authorization: Bearer <mary_token>

{
  "leave_type_id": 2,  // Sick Leave
  "start_date": "2026-03-20",
  "end_date": "2026-03-20",
  "reason": "High fever and flu symptoms. Visiting clinic today.",
  "attachments": []  // Will upload medical certificate later
}
```

**System Validation:**
- ✅ Checks sick leave balance (8 days available)
- ⚠️ Start date is today (allowed for sick leave)
- ✅ No overlapping requests

**Special Handling for Sick Leave:**
- System flags request as "Emergency/Same-Day"
- David receives SMS notification (in addition to email)
- System creates attendance record with status `"leave"` for March 20

**David's Quick Approval:**

David approves from his phone:

```http
PUT /api/leave/890
Authorization: Bearer <david_token>

{
  "status": "approved",
  "reason": "Get well soon. Please submit medical certificate if absent more than 3 days."
}
```

---

#### Scene 4.2: Maternity Leave Planning (Grace Wanjiru)

**Context:** Grace is expecting a baby in June 2026 and needs to plan her maternity leave.

**Date:** February 1, 2026  
**Expected Due Date:** June 15, 2026  
**Requested Leave:** June 1 - August 31, 2026 (90 days)

**Grace's Request:**

```http
POST /api/leave
Authorization: Bearer <grace_token>

{
  "leave_type_id": 4,  // Maternity Leave
  "start_date": "2026-06-01",
  "end_date": "2026-08-31",
  "reason": "Maternity leave - Expected due date: June 15, 2026",
  "attachments": [
    {
      "file_name": "medical_certificate.pdf",
      "file_url": "/uploads/leave/2026/02/grace_medical.pdf"
    }
  ]
}
```

**System Handling:**
- ✅ Maternity leave doesn't deduct from annual leave balance
- ✅ Requires medical certificate (validated by system)
- ✅ 90 days as per Kenyan employment law
- ✅ Automatically notifies HR for special processing

**Sarah (HR Admin) Actions:**
1. Reviews medical certificate
2. Coordinates with payroll for maternity leave pay
3. Sets up automatic notifications for Grace's return
4. Plans for temporary coverage

---

### Chapter 5: Leave Reporting & Analytics

#### Scene 5.1: Monthly Leave Report

**Sarah** generates a monthly leave report for March 2026:

```http
GET /api/leave/history?year=2026&status=approved
Authorization: Bearer <sarah_admin_token>
```

**Report Summary:**
```json
{
  "success": true,
  "data": {
    "leaveHistory": [
      {
        "id": 789,
        "user_name": "John Kamau",
        "leave_type_name": "Annual Leave",
        "start_date": "2026-04-01",
        "end_date": "2026-04-12",
        "days_taken": 10,
        "approved_at": "2026-03-16T09:00:00Z"
      },
      {
        "id": 890,
        "user_name": "Mary Achieng",
        "leave_type_name": "Sick Leave",
        "start_date": "2026-03-20",
        "end_date": "2026-03-20",
        "days_taken": 1,
        "approved_at": "2026-03-20T08:30:00Z"
      }
    ],
    "summary": {
      "total_leave_days_taken": 245,
      "annual_leave_days": 180,
      "sick_leave_days": 45,
      "compassionate_leave_days": 12,
      "maternity_leave_days": 0,
      "paternity_leave_days": 8,
      "average_days_per_employee": 1.2
    }
  }
}
```

**Sarah's Insights:**
- 📊 Sick leave usage is up 15% from February (flu season)
- 📊 April has highest annual leave requests (Easter holidays)
- 📊 Mombasa branch has higher leave usage than Nairobi
- 📊 3 employees approaching sick leave limit (10 days)

---

## ⏰ Attendance Management Story

### Chapter 6: Daily Attendance Workflow

#### Scene 6.1: John's Typical Monday Morning

**Context:** John Kamau arrives at the Nairobi office on a typical Monday.

**Date:** March 23, 2026 (Monday)  
**Time:** 8:45 AM  
**Location:** Nairobi Office (GPS: -1.2921° S, 36.8219° E)  
**Shift:** 9:00 AM - 5:00 PM (Standard Hours)

**Step 1: John Checks In**

John opens the mobile app and taps "Check In":

```http
POST /api/attendance/check-in
Authorization: Bearer <john_token>
Content-Type: application/json

{
  "date": "2026-03-23",
  "check_in_time": "08:45:00",
  "location_coordinates": {
    "latitude": -1.2921,
    "longitude": 36.8219
  },
  "location_address": "Nairobi Office, Upper Hill, Nairobi"
}
```

**System Processing:**

1. ✅ **Retrieves John's staff record:**
   - Branch: Nairobi
   - Status: Active

2. ✅ **Gets branch configuration:**
   ```json
   {
     "attendance_mode": "branch_based",
     "location_coordinates": "POINT(36.8219 -1.2921)",
     "location_radius_meters": 100
   }
   ```

3. ✅ **Verifies GPS location:**
   - Calculates distance between John's location and office
   - Distance: 15 meters (within 100m radius)
   - ✅ Location verified: `true`

4. ✅ **Gets John's shift schedule for today:**
   ```sql
   SELECT * FROM employee_shift_assignments
   WHERE user_id = 45 
     AND '2026-03-23' BETWEEN effective_from AND effective_to
     AND status = 'active'
   ```
   
   **Result:**
   ```json
   {
     "shift_template_id": 1,
     "template_name": "Standard Hours",
     "start_time": "09:00:00",
     "end_time": "17:00:00",
     "break_duration_minutes": 60,
     "recurrence_days": ["monday", "tuesday", "wednesday", "thursday", "friday"]
   }
   ```

5. ✅ **Determines attendance status:**
   - Scheduled start: 09:00:00
   - Actual check-in: 08:45:00
   - Grace period: 15 minutes
   - ✅ Status: `"present"` (arrived early)

6. ✅ **Creates attendance record:**
   ```sql
   INSERT INTO attendance 
   (user_id, date, status, check_in_time, location_coordinates, 
    location_verified, scheduled_start_time, scheduled_end_time)
   VALUES 
   (45, '2026-03-23', 'present', '08:45:00', 'POINT(36.8219 -1.2921)', 
    true, '09:00:00', '17:00:00')
   ```

7. ✅ **Updates attendance with shift metrics:**
   ```json
   {
     "scheduled_start_time": "09:00:00",
     "scheduled_end_time": "17:00:00",
     "is_late": false,
     "is_early_departure": null,
     "actual_working_hours": null  // Will calculate at check-out
   }
   ```

**Response:**
```json
{
  "success": true,
  "message": "Check-in recorded successfully",
  "data": {
    "attendance": {
      "id": 12345,
      "user_id": 45,
      "date": "2026-03-23",
      "status": "present",
      "check_in_time": "08:45:00",
      "location_verified": true,
      "scheduled_start_time": "09:00:00",
      "scheduled_end_time": "17:00:00",
      "is_late": false
    }
  }
}
```

**John's App Shows:**
```
✅ Check-in Successful!
Time: 08:45:00
Location: Nairobi Office (Verified)
Shift: 09:00 - 17:00
Status: On Time 🎉
```

---

#### Scene 6.2: Mary's Late Arrival (Mombasa)

**Context:** Mary Achieng gets stuck in traffic and arrives late.

**Date:** March 23, 2026 (Monday)  
**Time:** 8:25 AM  
**Shift:** 8:00 AM - 4:00 PM (Mombasa Support Shift)  
**Grace Period:** 15 minutes

**Mary Checks In:**

```http
POST /api/attendance/check-in
Authorization: Bearer <mary_token>

{
  "date": "2026-03-23",
  "check_in_time": "08:25:00",
  "location_coordinates": {
    "latitude": -4.0435,
    "longitude": 39.6682
  },
  "location_address": "Mombasa Office, Moi Avenue"
}
```

**System Processing:**

1. ✅ **Gets Mary's shift for today:**
   - Scheduled start: 08:00:00
   - Grace period: 15 minutes
   - Latest on-time arrival: 08:15:00

2. ✅ **Determines status:**
   - Actual check-in: 08:25:00
   - 10 minutes past grace period
   - ⚠️ Status: `"late"`

3. ✅ **Creates attendance record:**
   ```json
   {
     "status": "late",
     "check_in_time": "08:25:00",
     "scheduled_start_time": "08:00:00",
     "is_late": true,
     "late_minutes": 25
   }
   ```

**Mary's App Shows:**
```
⚠️ Check-in Recorded (Late)
Time: 08:25:00
Scheduled: 08:00:00
Late by: 25 minutes
Location: Mombasa Office (Verified)
```

**System Actions:**
- ✅ Records late arrival
- ✅ Notifies David (Branch Manager) of late arrival
- ✅ Updates monthly late count (Mary: 3 lates in March)

---

#### Scene 6.3: End of Day Check-Out

**John's Evening Routine:**

**Time:** 5:10 PM (17:10)  
**Location:** Nairobi Office

**John Checks Out:**

```http
POST /api/attendance/check-out
Authorization: Bearer <john_token>

{
  "date": "2026-03-23",
  "check_out_time": "17:10:00",
  "location_coordinates": {
    "latitude": -1.2921,
    "longitude": 36.8219
  },
  "location_address": "Nairobi Office, Upper Hill, Nairobi"
}
```

**System Processing:**

1. ✅ **Finds existing attendance record:**
   - ID: 12345
   - Check-in: 08:45:00
   - Check-out: null

2. ✅ **Verifies location (optional at check-out):**
   - Distance from office: 20 meters
   - ✅ Location verified

3. ✅ **Calculates working hours:**
   ```
   Check-in:  08:45:00
   Check-out: 17:10:00
   Total time: 8 hours 25 minutes
   
   Less break: 1 hour
   Actual working hours: 7 hours 25 minutes = 7.42 hours
   ```

4. ✅ **Updates attendance record:**
   ```sql
   UPDATE attendance 
   SET check_out_time = '17:10:00',
       actual_working_hours = 7.42,
       is_early_departure = false
   WHERE id = 12345
   ```

**Response:**
```json
{
  "success": true,
  "message": "Check-out recorded successfully",
  "data": {
    "attendance": {
      "id": 12345,
      "date": "2026-03-23",
      "check_in_time": "08:45:00",
      "check_out_time": "17:10:00",
      "actual_working_hours": 7.42,
      "scheduled_start_time": "09:00:00",
      "scheduled_end_time": "17:00:00",
      "is_late": false,
      "is_early_departure": false
    }
  }
}
```

**John's App Shows:**
```
✅ Check-out Successful!
Check-in:  08:45:00
Check-out: 17:10:00
Working Hours: 7h 25m
Shift: 09:00 - 17:00
Status: Complete Day ✓
```

---

### Chapter 7: Automated Attendance Processing

#### Scene 7.1: Midnight Attendance Processor

**Context:** Every night at midnight, the system automatically processes attendance for all employees.

**Time:** March 24, 2026, 12:00 AM (processing March 23 data)

**Worker Execution:**

```typescript
// AttendanceProcessorWorker.start() runs daily
await AttendanceProcessorWorker.processYesterdayAttendance();
```

**Processing Steps:**

**Step 1: Get all active employees**
```sql
SELECT s.user_id FROM staff s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'active' AND u.status = 'active'
-- Returns: 245 employees
```

**Step 2: Check if it's a holiday**
```sql
SELECT * FROM holidays 
WHERE holiday_date = '2026-03-23' 
  AND (branch_id IS NULL OR branch_id IN (1, 2, 3))
-- Returns: 0 holidays (not a public holiday)
```

**Step 3: Process each employee**

For each of the 245 employees:

**Case A: Employee already checked in/out (John, Mary, etc.)**
```
Employee: John Kamau (ID: 45)
Existing attendance: YES
Action: SKIP (already processed)
```

**Case B: Employee on approved leave (Grace Wanjiru)**
```
Employee: Grace Wanjiru (ID: 67)
Existing attendance: NO
Check leave history: FOUND (Maternity leave)
Action: CREATE attendance with status "leave"
```

```sql
INSERT INTO attendance 
(user_id, date, status, notes)
VALUES 
(67, '2026-03-23', 'leave', 'On approved leave')
```

**Case C: Employee absent without notice (Peter Mwangi)**
```
Employee: Peter Mwangi (ID: 89)
Existing attendance: NO
Check leave history: NOT FOUND
Check shift assignment: FOUND (Standard Hours)
Action: CREATE attendance with status "absent"
```

```sql
INSERT INTO attendance 
(user_id, date, status, notes)
VALUES 
(89, '2026-03-23', 'absent', 'Scheduled shift but no check-in recorded')
```

**Case D: Employee not scheduled (Weekend for some staff)**
```
Employee: Jane Wambui (ID: 102)
Existing attendance: NO
Check shift assignment: NOT FOUND (no weekend shift)
Action: SKIP (not scheduled to work)
```

**Final Processing Summary:**
```
Total Employees: 245
Already Processed: 198
Marked on Leave: 12
Marked Absent: 23
Skipped (Not Scheduled): 12
```

**Notifications Generated:**
- 23 "Absent Employee" notifications to branch managers
- 1 daily summary to HR (Sarah)

---

### Chapter 8: Special Attendance Scenarios

#### Scene 8.1: Remote Work Attendance

**Context:** John is working from a coffee shop in Westlands (remote work approved).

**Date:** March 25, 2026  
**Location:** Java House, Westlands (GPS: -1.2647° S, 36.8089° E)  
**Distance from Office:** 5.2 km

**Challenge:** John is outside the 100m office radius.

**Solution 1: Multiple Locations Mode**

Nairobi branch has configured "multiple_locations" mode:

```json
{
  "branch_id": 1,
  "attendance_mode": "multiple_locations"
}
```

**Approved Attendance Locations:**
```sql
SELECT * FROM attendance_locations 
WHERE branch_id = 1 AND is_active = true;
```

| ID | Name | Coordinates | Radius |
|----|------|-------------|--------|
| 1 | Nairobi HQ | POINT(36.8219 -1.2921) | 100m |
| 2 | Java House Westlands | POINT(36.8089 -1.2647) | 50m |
| 3 | The Alchemist | POINT(36.8100 -1.2650) | 50m |

**John Checks In:**

```http
POST /api/attendance/check-in
Authorization: Bearer <john_token>

{
  "date": "2026-03-25",
  "check_in_time": "09:05:00",
  "location_coordinates": {
    "latitude": -1.2647,
    "longitude": 36.8089
  },
  "location_address": "Java House, Westlands"
}
```

**System Processing:**
1. ✅ Gets approved locations for Nairobi branch
2. ✅ Calculates distance to each location
3. ✅ Finds match: Java House (0 meters from approved location)
4. ✅ Marks `location_verified = true`

**Response:**
```json
{
  "success": true,
  "message": "Check-in recorded successfully",
  "data": {
    "attendance": {
      "id": 12456,
      "status": "present",
      "location_verified": true,
      "location_name": "Java House Westlands"
    }
  }
}
```

---

#### Scene 8.2: Branch-Based Attendance (Mombasa)

**Context:** Mombasa branch uses strict "branch_based" mode - employees MUST be at the office.

**Date:** March 25, 2026  
**Employee:** Mary Achieng  
**Attempt:** Trying to check in from home

**Mary's Attempt:**

```http
POST /api/attendance/check-in
Authorization: Bearer <mary_token>

{
  "date": "2026-03-25",
  "check_in_time": "08:00:00",
  "location_coordinates": {
    "latitude": -4.0500,  // Home location (far from office)
    "longitude": 39.6700
  },
  "location_address": "Home, Nyali, Mombasa"
}
```

**System Processing:**
1. ✅ Gets Mombasa branch configuration:
   ```json
   {
     "attendance_mode": "branch_based",
     "location_coordinates": "POINT(39.6682 -4.0435)",
     "location_radius_meters": 100
   }
   ```

2. ✅ Calculates distance:
   - Office: (-4.0435, 39.6682)
   - Mary's location: (-4.0500, 39.6700)
   - Distance: 750 meters

3. ❌ **Location NOT verified** (750m > 100m radius)

**Response:**
```json
{
  "success": true,
  "message": "Check-in recorded successfully",
  "data": {
    "attendance": {
      "id": 23456,
      "status": "present",
      "location_verified": false,  // ⚠️ Flagged for review
      "location_warning": "Check-in outside approved location"
    }
  }
}
```

**System Actions:**
- ✅ Records attendance but flags for review
- ✅ Notifies David (Branch Manager): "Mary checked in from unverified location"
- ✅ Adds note to attendance record

**David's Follow-up:**
- Calls Mary to confirm she's working from home (approved)
- Updates attendance record manually if needed

---

#### Scene 8.3: Early Departure Detection

**Context:** Mary has a dental appointment at 2 PM and needs to leave early.

**Date:** March 26, 2026  
**Shift:** 08:00 - 16:00  
**Actual Check-out:** 14:00 (2:00 PM)

**Mary Checks Out:**

```http
POST /api/attendance/check-out
Authorization: Bearer <mary_token>

{
  "date": "2026-03-26",
  "check_out_time": "14:00:00",
  "location_coordinates": {
    "latitude": -4.0435,
    "longitude": 39.6682
  }
}
```

**System Processing:**
1. ✅ Gets scheduled end time: 16:00:00
2. ✅ Calculates difference: 2 hours early
3. ⚠️ Marks `is_early_departure = true`

**Attendance Record:**
```json
{
  "id": 23567,
  "date": "2026-03-26",
  "check_in_time": "08:00:00",
  "check_out_time": "14:00:00",
  "scheduled_start_time": "08:00:00",
  "scheduled_end_time": "16:00:00",
  "actual_working_hours": 6.0,
  "is_early_departure": true,
  "early_departure_minutes": 120
}
```

**System Actions:**
- ✅ Records early departure
- ✅ Notifies David (Branch Manager)
- ✅ Updates monthly early departure count

---

### Chapter 9: Attendance Reporting

#### Scene 9.1: Monthly Attendance Report

**Sarah (HR Admin)** generates March 2026 attendance report:

```http
GET /api/attendance/reports/monthly?month=2026-03&branch_id=1
Authorization: Bearer <sarah_admin_token>
```

**Report Summary:**
```json
{
  "success": true,
  "data": {
    "report_period": "March 2026",
    "branch": "Nairobi",
    "summary": {
      "total_employees": 120,
      "total_working_days": 22,
      "total_expected_attendances": 2640,
      "actual_present": 2456,
      "absent": 89,
      "on_leave": 67,
      "on_holiday": 28,
      "attendance_rate": 93.03
    },
    "late_arrivals": {
      "total_count": 145,
      "unique_employees": 45,
      "average_late_minutes": 18,
      "most_frequent_offenders": [
        {"employee": "Peter Mwangi", "late_count": 8},
        {"employee": "Jane Wambui", "late_count": 6}
      ]
    },
    "early_departures": {
      "total_count": 34,
      "unique_employees": 22
    },
    "overtime": {
      "total_hours": 456.5,
      "average_per_employee": 3.8
    }
  }
}
```

**Sarah's Insights:**
- 📊 Attendance rate improved from 91% (February) to 93% (March)
- 📊 Peter Mwangi has 8 late arrivals - needs coaching
- 📊 Overtime increased by 20% (project deadline month)
- 📊 89 absent days: 45 excused, 44 unexcused

---

## 🔄 Shift Scheduling Story

### Chapter 10: Shift Management

#### Scene 10.1: Creating Shift Templates

**Sarah (HR Admin)** creates standard shift templates:

**Template 1: Standard Hours (Nairobi Office)**

```http
POST /api/shift-scheduling/shift-templates
Authorization: Bearer <sarah_admin_token>

{
  "name": "Standard Hours",
  "description": "Monday to Friday, 9 AM to 5 PM",
  "start_time": "09:00:00",
  "end_time": "17:00:00",
  "break_duration_minutes": 60,
  "effective_from": "2026-01-01",
  "recurrence_pattern": "weekly",
  "recurrence_days": ["monday", "tuesday", "wednesday", "thursday", "friday"]
}
```

**Template 2: Mombasa Support Shift (Rotating)**

```http
POST /api/shift-scheduling/shift-templates
Authorization: Bearer <sarah_admin_token>

{
  "name": "Morning Shift",
  "description": "Mombasa Support - Morning (Mon-Sat)",
  "start_time": "08:00:00",
  "end_time": "16:00:00",
  "break_duration_minutes": 30,
  "effective_from": "2026-01-01",
  "recurrence_pattern": "weekly",
  "recurrence_days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
}
```

**Template 3: Evening Shift (Customer Support)**

```http
POST /api/shift-scheduling/shift-templates
Authorization: Bearer <sarah_admin_token>

{
  "name": "Evening Shift",
  "description": "Mombasa Support - Evening (Mon-Sat)",
  "start_time": "12:00:00",
  "end_time": "20:00:00",
  "break_duration_minutes": 30,
  "effective_from": "2026-01-01",
  "recurrence_pattern": "weekly",
  "recurrence_days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
}
```

---

#### Scene 10.2: Assigning Shifts to Employees

**Bulk Assignment: Nairobi Office**

Sarah assigns standard hours to all Nairobi employees:

```http
POST /api/shift-scheduling/recurring-shifts/bulk-assign-branch
Authorization: Bearer <sarah_admin_token>

{
  "branch_id": 1,  // Nairobi
  "shift_template_id": 1,  // Standard Hours
  "effective_from": "2026-01-01",
  "assignment_type": "permanent",
  "notes": "Standard office hours for all Nairobi staff"
}
```

**System Processing:**
1. ✅ Gets all active employees in Nairobi branch
2. ✅ Creates shift assignment for each employee
3. ✅ Deactivates any existing conflicting assignments

**Result:**
```json
{
  "success": true,
  "message": "Bulk shift assignment completed",
  "data": {
    "branch_id": 1,
    "employees_assigned": 120,
    "shift_template": "Standard Hours",
    "effective_from": "2026-01-01"
  }
}
```

**Individual Assignment: Mary's Rotating Shift**

Mary rotates between morning and evening shifts weekly.

Sarah creates custom assignment:

```http
POST /api/shift-scheduling/employee-shift-assignments
Authorization: Bearer <sarah_admin_token>

{
  "user_id": 78,  // Mary
  "shift_template_id": 2,  // Morning Shift
  "effective_from": "2026-03-01",
  "effective_to": "2026-03-31",
  "assignment_type": "temporary",
  "notes": "Morning shift for March 2026"
}
```

**Next Month (April):**

```http
POST /api/shift-scheduling/employee-shift-assignments
Authorization: Bearer <sarah_admin_token>

{
  "user_id": 78,
  "shift_template_id": 3,  // Evening Shift
  "effective_from": "2026-04-01",
  "effective_to": "2026-04-30",
  "assignment_type": "temporary",
  "notes": "Evening shift for April 2026"
}
```

---

#### Scene 10.3: Shift Exception (One-Time Change)

**Context:** John needs to come in early on April 5 for a client meeting.

**Date:** April 5, 2026 (Tuesday)  
**Normal Shift:** 09:00 - 17:00  
**Exception:** 07:00 - 15:00

**Sarah Creates Exception:**

```http
POST /api/shift-scheduling/shift-exceptions
Authorization: Bearer <sarah_admin_token>

{
  "user_id": 45,  // John
  "exception_date": "2026-04-05",
  "exception_type": "special_assignment",
  "new_start_time": "07:00:00",
  "new_end_time": "15:00:00",
  "new_break_duration_minutes": 30,
  "reason": "Client meeting - early start required"
}
```

**System Actions:**
1. ✅ Creates shift exception record
2. ✅ Overrides normal shift for that specific date
3. ✅ Notifies John of schedule change

**John's Notification:**
```
Subject: Schedule Change Notification

Dear John,

Your shift for April 5, 2026 has been changed:

Normal Schedule: 09:00 - 17:00
New Schedule: 07:00 - 15:00
Reason: Client meeting - early start required

Please plan accordingly.

Best regards,
HR Management System
```

**Attendance Processing on April 5:**
- System uses exception schedule (07:00 - 15:00)
- Late detection based on 07:00 (not 09:00)
- Working hours calculated against 7.5-hour expectation

---

### Chapter 11: Branch Working Days Configuration

#### Scene 11.1: Different Schedules Per Branch

**Context:** 
- Nairobi: Mon-Fri (5 days)
- Mombasa: Mon-Sat (6 days)
- Kisumu: Mon-Fri (5 days)

**Sarah Configures Branch Working Days:**

**Nairobi (Mon-Fri):**

```http
POST /api/branch-working-days
Authorization: Bearer <sarah_admin_token>

{
  "branch_id": 1,
  "monday": {"is_working_day": true, "start_time": "09:00:00", "end_time": "17:00:00"},
  "tuesday": {"is_working_day": true, "start_time": "09:00:00", "end_time": "17:00:00"},
  "wednesday": {"is_working_day": true, "start_time": "09:00:00", "end_time": "17:00:00"},
  "thursday": {"is_working_day": true, "start_time": "09:00:00", "end_time": "17:00:00"},
  "friday": {"is_working_day": true, "start_time": "09:00:00", "end_time": "17:00:00"},
  "saturday": {"is_working_day": false},
  "sunday": {"is_working_day": false}
}
```

**Mombasa (Mon-Sat):**

```http
POST /api/branch-working-days
Authorization: Bearer <sarah_admin_token>

{
  "branch_id": 2,
  "monday": {"is_working_day": true, "start_time": "08:00:00", "end_time": "16:00:00"},
  "tuesday": {"is_working_day": true, "start_time": "08:00:00", "end_time": "16:00:00"},
  "wednesday": {"is_working_day": true, "start_time": "08:00:00", "end_time": "16:00:00"},
  "thursday": {"is_working_day": true, "start_time": "08:00:00", "end_time": "16:00:00"},
  "friday": {"is_working_day": true, "start_time": "08:00:00", "end_time": "16:00:00"},
  "saturday": {"is_working_day": true, "start_time": "09:00:00", "end_time": "13:00:00"},
  "sunday": {"is_working_day": false}
}
```

**System Usage:**
- Attendance processor checks branch working days
- Employees only marked absent on working days
- Weekend attendance optional (unless Saturday is working day)

---

## 🎭 Complete Day-in-the-Life Scenarios

### Scenario 1: Perfect Day (John Kamau)

**Date:** March 30, 2026 (Monday)

| Time | Event | System Action |
|------|-------|---------------|
| 08:45 | John arrives at office | Opens app, taps "Check In" |
| 08:45 | GPS verified (15m from office) | ✅ Check-in successful |
| 08:45 | Status: Present (on time) | Shift: 09:00-17:00 |
| 13:00 | Lunch break | No action required |
| 13:30 | Back from lunch | No action required (break configured) |
| 17:05 | End of day | Taps "Check Out" |
| 17:05 | Working hours: 7h 20m | ✅ Complete day |

**End of Day Summary:**
```json
{
  "employee": "John Kamau",
  "date": "2026-03-30",
  "check_in": "08:45:00",
  "check_out": "17:05:00",
  "scheduled_start": "09:00:00",
  "scheduled_end": "17:00:00",
  "actual_working_hours": 7.33,
  "is_late": false,
  "is_early_departure": false,
  "location_verified": true,
  "status": "present"
}
```

---

### Scenario 2: Problem Day (Peter Mwangi)

**Date:** March 31, 2026 (Tuesday)

| Time | Event | System Action |
|------|-------|---------------|
| 09:00 | Shift starts | Peter not at office |
| 09:15 | Grace period ends | System marks Peter as "late" |
| 09:30 | Peter arrives | Checks in (45 min late) |
| 09:30 | GPS verified | ⚠️ Late arrival recorded |
| 12:00 | Peter leaves early | Emergency - no check-out |
| 17:00 | Shift ends | No check-out recorded |
| 00:05 | Midnight processor runs | Marks as "incomplete" |

**End of Day Summary:**
```json
{
  "employee": "Peter Mwangi",
  "date": "2026-03-31",
  "check_in": "09:30:00",
  "check_out": null,
  "scheduled_start": "09:00:00",
  "scheduled_end": "17:00:00",
  "actual_working_hours": null,
  "is_late": true,
  "late_minutes": 30,
  "is_early_departure": null,
  "status": "incomplete",
  "notes": "No check-out recorded"
}
```

**Notifications:**
- ✅ Manager notified: "Peter Mwangi arrived 30 minutes late"
- ✅ Manager notified: "Peter Mwangi did not check out"
- ✅ HR daily summary includes Peter's attendance issues

**Next Day:**
- Manager calls Peter for explanation
- HR updates attendance record (excused early departure)

---

### Scenario 3: Leave + Attendance Integration (Mary Achieng)

**Context:** Mary has approved leave for April 1-3, 2026.

**Timeline:**

**March 15:** Mary submits leave request
- ✅ Request created: April 1-3 (3 days)
- ✅ Status: "submitted"
- ✅ Manager notified

**March 16:** Manager approves
- ✅ Status: "approved"
- ✅ Leave history created
- ✅ Allocation updated: used_days +3

**April 1 (Leave Day 1):**
- ✅ Midnight processor runs
- ✅ Finds Mary's approved leave
- ✅ Creates attendance: status "leave"
- ✅ Mary does NOT need to check in

**April 2 (Leave Day 2):**
- ✅ Same process
- ✅ Attendance: "leave"

**April 3 (Leave Day 3):**
- ✅ Same process
- ✅ Attendance: "leave"

**April 4 (Back to Work):**
- ✅ Mary checks in normally at 08:00
- ✅ System recognizes end of leave period
- ✅ Attendance: "present"

---

## 📊 System Capabilities Summary

### ✅ Leave Management Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Leave Types** | Configurable types (Annual, Sick, Maternity, etc.) | ✅ Complete |
| **Leave Allocation** | Assign leave days to employees (annual cycles) | ✅ Complete |
| **Leave Requests** | Employees submit requests with dates/reason | ✅ Complete |
| **Leave Balance Check** | Real-time balance including pending requests | ✅ Complete |
| **Leave Approval Workflow** | Multi-level approval with notifications | ✅ Complete |
| **Leave History** | Track all approved leaves | ✅ Complete |
| **Carry Over** | Unused days roll to next year | ✅ Complete |
| **Pending Tracking** | Shows pending requests in balance | ✅ Complete |
| **File Attachments** | Upload medical certificates, etc. | ✅ Complete |
| **Overlap Detection** | Prevents conflicting leave requests | ✅ Complete |
| **Automated Deductions** | Days deducted on approval | ✅ Complete |
| **Day Refund** | Days refunded on cancellation | ✅ Complete |
| **Leave Reporting** | Monthly/annual leave reports | ✅ Complete |

---

### ✅ Attendance Management Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Check-In/Check-Out** | GPS-verified attendance marking | ✅ Complete |
| **Geofencing (Branch-Based)** | Verify employee at branch location | ✅ Complete |
| **Geofencing (Multiple Locations)** | Verify at any approved location | ✅ Complete |
| **Shift Integration** | Auto-populate scheduled times | ✅ Complete |
| **Late Detection** | Compare check-in vs scheduled start | ✅ Complete |
| **Early Departure** | Compare check-out vs scheduled end | ✅ Complete |
| **Working Hours Calculation** | Actual hours worked (minus breaks) | ✅ Complete |
| **Grace Period** | Configurable late grace period | ✅ Complete |
| **Automated Processing** | Midnight worker marks absent/leave/holiday | ✅ Complete |
| **Holiday Detection** | Auto-mark holidays | ✅ Complete |
| **Leave Integration** | Auto-mark approved leave | ✅ Complete |
| **Attendance Settings** | Per-branch configuration | ✅ Complete |
| **Location History** | Track all check-in locations | ✅ Complete |
| **Attendance Reports** | Monthly summaries, late counts | ✅ Complete |
| **Incomplete Tracking** | Flag missing check-outs | ✅ Complete |

---

### ✅ Shift Management Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Shift Templates** | Reusable shift patterns | ✅ Complete |
| **Recurring Assignments** | Weekly/monthly shift schedules | ✅ Complete |
| **Bulk Assignment** | Assign shifts to entire branch | ✅ Complete |
| **Shift Exceptions** | One-time schedule changes | ✅ Complete |
| **Custom Times** | Override template times per employee | ✅ Complete |
| **Branch Working Days** | Different schedules per branch | ✅ Complete |
| **Schedule Requests** | Employees can request changes | ✅ Complete |
| **Shift Rotation** | Rotate between multiple templates | ✅ Complete |
| **Effective Dates** | Time-bound shift assignments | ✅ Complete |

---

### ✅ Multi-Branch Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Branch Isolation** | Each branch has separate data | ✅ Complete |
| **Branch-Specific Holidays** | Different holidays per branch | ✅ Complete |
| **Branch Working Days** | Different work schedules | ✅ Complete |
| **Branch Attendance Mode** | Branch-based or multiple locations | ✅ Complete |
| **Branch Managers** | Separate approval authority | ✅ Complete |
| **Branch Reporting** | Separate reports per branch | ✅ Complete |

---

### ✅ Notification Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Leave Request Notifications** | Notify approvers of new requests | ✅ Complete |
| **Leave Approval Notifications** | Notify employee of approval/rejection | ✅ Complete |
| **Absent Employee Notifications** | Notify managers of absences | ✅ Complete |
| **Late Arrival Notifications** | Notify managers of late arrivals | ✅ Complete |
| **Daily Summary** | HR daily attendance summary | ✅ Complete |
| **Email Notifications** | Send via Resend/cPanel | ✅ Complete |
| **Notification Queue** | Background processing | ✅ Complete |

---

## 🔌 API Quick Reference

### Leave Endpoints

```http
# Leave Types
GET    /api/leave/types              # List all leave types
POST   /api/leave/types              # Create leave type
PUT    /api/leave/types/:id          # Update leave type
DELETE /api/leave/types/:id          # Delete leave type

# Leave Allocations
GET    /api/leave/allocations        # List allocations
POST   /api/leave/allocations        # Create allocation
PUT    /api/leave/allocations/:id    # Update allocation

# Leave Requests (Main)
GET    /api/leave                    # List all requests (with filters)
GET    /api/leave/my-requests        # Get own requests
GET    /api/leave/balance            # Get leave balance
GET    /api/leave/history            # Get leave history
GET    /api/leave/:id                # Get specific request
POST   /api/leave                    # Create request
PUT    /api/leave/:id                # Approve/reject request
DELETE /api/leave/:id                # Cancel request

# Leave Files
POST   /api/leave/upload             # Upload attachment
GET    /api/leave/:id/files          # Get files for request
DELETE /api/leave/files/:id          # Delete file
```

### Attendance Endpoints

```http
# Core Attendance
GET    /api/attendance               # List all records
GET    /api/attendance/my            # Get own records
GET    /api/attendance/summary       # Get summary stats
GET    /api/attendance/history/user/:userId  # User history
GET    /api/attendance/records       # Paginated list
GET    /api/attendance/staff-data    # Dashboard data
GET    /api/attendance/reports/monthly  # Monthly report
PUT    /api/attendance/:id           # Update record
POST   /api/attendance/process-daily # Manual batch process

# Check-In/Check-Out
POST   /api/attendance/check-in      # Mark check-in
POST   /api/attendance/check-out     # Mark check-out

# Manual Attendance
POST   /api/attendance/manual        # Manual entry (admin)

# Attendance Processing
POST   /api/attendance/process       # Process single user
POST   /api/attendance/process-batch # Process multiple users

# Settings
GET    /api/attendance/settings      # Get branch settings
PATCH  /api/attendance/settings      # Update settings
GET    /api/attendance/settings/global  # Get global settings
PATCH  /api/attendance/settings/global  # Update global settings

# Locations
GET    /api/attendance-locations     # List locations
POST   /api/attendance-locations     # Create location
PUT    /api/attendance-locations/:id # Update location
DELETE /api/attendance-locations/:id # Delete location

# Holidays
GET    /api/holidays                 # List holidays
POST   /api/holidays                 # Create holiday
PUT    /api/holidays/:id             # Update holiday
DELETE /api/holidays/:id             # Delete holiday
```

### Shift Management Endpoints

```http
# Shift Templates
GET    /api/shift-scheduling/shift-templates
POST   /api/shift-scheduling/shift-templates
PUT    /api/shift-scheduling/shift-templates/:id
DELETE /api/shift-scheduling/shift-templates/:id

# Employee Shift Assignments
GET    /api/shift-scheduling/employee-shift-assignments
POST   /api/shift-scheduling/employee-shift-assignments
PUT    /api/shift-scheduling/employee-shift-assignments/:id
POST   /api/shift-scheduling/employee-shift-assignments/bulk
GET    /api/shift-scheduling/recurring-shifts
POST   /api/shift-scheduling/recurring-shifts/bulk
PUT    /api/shift-scheduling/recurring-shifts/:id
DELETE /api/shift-scheduling/recurring-shifts/:id

# Schedule Requests
GET    /api/shift-scheduling/schedule-requests
POST   /api/shift-scheduling/schedule-requests
PUT    /api/shift-scheduling/schedule-requests/:id/approve
PUT    /api/shift-scheduling/schedule-requests/:id/reject
PUT    /api/shift-scheduling/schedule-requests/:id/cancel

# Branch Working Days
GET    /api/branch-working-days/:branchId/working-days
POST   /api/branch-working-days
PUT    /api/branch-working-days/:id
```

---

## 🎯 Key Workflows

### Workflow 1: Employee Leave Request

```
1. Employee checks leave balance
   GET /api/leave/balance
   
2. Employee submits leave request
   POST /api/leave
   {
     "leave_type_id": 1,
     "start_date": "2026-04-01",
     "end_date": "2026-04-12",
     "reason": "..."
   }
   
3. System validates:
   - ✅ Sufficient balance
   - ✅ No overlapping requests
   - ✅ Dates are valid
   
4. System notifies approvers
   - Email to all users with leave:approve permission
   
5. Manager reviews pending requests
   GET /api/leave?status=pending
   
6. Manager approves/rejects
   PUT /api/leave/:id
   { "status": "approved" }
   
7. System updates:
   - ✅ Leave request status
   - ✅ Leave history
   - ✅ Allocation (used_days +N)
   - ✅ Notifies employee
```

---

### Workflow 2: Daily Attendance

```
1. Employee arrives at office
   - Opens mobile app
   - Taps "Check In"
   
2. App sends check-in request
   POST /api/attendance/check-in
   {
     "date": "2026-03-23",
     "check_in_time": "08:45:00",
     "location_coordinates": {...}
   }
   
3. System validates:
   - ✅ GPS location (geofencing)
   - ✅ Shift schedule
   - ✅ Determines late/present
   
4. System creates attendance record
   - scheduled_start_time from shift
   - is_late based on grace period
   - location_verified based on geofence
   
5. Employee leaves office
   - Taps "Check Out"
   
6. App sends check-out request
   POST /api/attendance/check-out
   {
     "date": "2026-03-23",
     "check_out_time": "17:10:00"
   }
   
7. System updates:
   - ✅ check_out_time
   - ✅ actual_working_hours
   - ✅ is_early_departure
```

---

### Workflow 3: Automated Attendance Processing

```
1. Midnight worker starts (12:05 AM daily)
   AttendanceProcessorWorker.start()
   
2. Get all active employees
   SELECT user_id FROM staff WHERE status = 'active'
   
3. Check if holiday
   SELECT * FROM holidays WHERE holiday_date = ?
   - If holiday: mark all as "holiday"
   
4. For each employee:
   a. Check if attendance exists
      - If YES: skip (already processed)
   
   b. Check if on approved leave
      SELECT * FROM leave_history WHERE user_id = ? AND ? BETWEEN start_date AND end_date
      - If YES: mark as "leave"
   
   c. Check if has shift assignment
      SELECT * FROM employee_shift_assignments WHERE user_id = ? AND status = 'active'
      - If NO: skip (not scheduled)
   
   d. Mark as "absent"
      INSERT INTO attendance (user_id, date, status) VALUES (?, ?, 'absent')
   
5. Send notifications:
   - Absent employee alerts to managers
   - Daily summary to HR
```

---

## 📱 Frontend Integration Guide

### For Frontend Developers

**Key Considerations:**

1. **GPS Permissions:**
   - Request location permissions on app launch
   - Handle permission denial gracefully
   - Show clear error messages

2. **Offline Support:**
   - Cache attendance records locally
   - Queue check-in/check-out if offline
   - Sync when connection restored

3. **Real-Time Updates:**
   - Use polling or WebSockets for leave status updates
   - Refresh balance after leave approval

4. **Validation:**
   - Client-side date validation (can't request past dates)
   - Show leave balance before submission
   - Confirm check-in/out with visual feedback

5. **User Experience:**
   - Show GPS verification status
   - Display scheduled shift times
   - Show late/early warnings
   - Provide attendance history calendar view

---

## 🔐 Permission Requirements

| Permission | Leave Operations | Attendance Operations |
|------------|-----------------|----------------------|
| `leave:read` | View all requests | - |
| `leave:create` | Submit requests | - |
| `leave:update` | Approve/reject requests | - |
| `leave:delete` | Cancel requests | - |
| `attendance:read` | - | View all records |
| `attendance:create` | - | Manual attendance entry |
| `attendance:update` | - | Edit attendance records |
| `attendance:manage` | - | Process attendance, settings |
| `attendance:view` | - | View attendance (read-only) |

**No Permission Required (Own Data):**
- `GET /api/leave/my-requests`
- `GET /api/leave/balance`
- `POST /api/attendance/check-in`
- `POST /api/attendance/check-out`
- `GET /api/attendance/my`

---

## 📈 Testing Scenarios

### Test Case 1: Happy Path (Leave Request)

```
Given: Employee has 20 days annual leave balance
When: Employee requests 5 days leave
And: Manager approves request
Then: Leave balance should be 15 days
And: Attendance should show "leave" for those dates
```

### Test Case 2: Insufficient Balance

```
Given: Employee has 3 days annual leave balance
When: Employee requests 5 days leave
Then: System should reject with "Insufficient leave balance"
```

### Test Case 3: Overlapping Leave

```
Given: Employee has approved leave April 1-5
When: Employee requests leave April 3-7
Then: System should reject with "Overlapping leave dates"
```

### Test Case 4: Geofencing

```
Given: Branch attendance mode is "branch_based"
And: Office location is (-1.2921, 36.8219) with 100m radius
When: Employee checks in from 500m away
Then: location_verified should be false
And: Manager should be notified
```

### Test Case 5: Late Detection

```
Given: Employee shift starts at 09:00
And: Grace period is 15 minutes
When: Employee checks in at 09:20
Then: Status should be "late"
And: is_late should be true
And: late_minutes should be 20
```

### Test Case 6: Automated Absent Marking

```
Given: Employee has shift assignment for today
And: Employee did NOT check in
When: Midnight worker runs
Then: Attendance should be created with status "absent"
And: Manager should receive notification
```

---

## 🎓 Learning Checklist

### For New Developers

- [ ] Understand leave allocation vs leave request
- [ ] Know how leave balance is calculated
- [ ] Understand check-in/check-out flow
- [ ] Know how geofencing works
- [ ] Understand shift templates and assignments
- [ ] Know how automated attendance processing works
- [ ] Understand branch-based vs multiple locations mode
- [ ] Know how late/early detection works
- [ ] Understand notification system
- [ ] Know all API endpoints for leave and attendance

### For Frontend Developers

- [ ] Know how to check leave balance
- [ ] Know how to submit leave request
- [ ] Know how to check in/out with GPS
- [ ] Handle GPS permission errors
- [ ] Display attendance history
- [ ] Show real-time leave balance updates
- [ ] Handle offline scenarios
- [ ] Display shift schedules
- [ ] Show late/early warnings

### For HR Users

- [ ] Know how to create leave types
- [ ] Know how to allocate leave
- [ ] Know how to approve/reject leave requests
- [ ] Know how to run leave reports
- [ ] Know how to configure attendance settings
- [ ] Know how to create shift templates
- [ ] Know how to assign shifts
- [ ] Know how to run attendance reports
- [ ] Understand automated absent marking

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue 1: "Insufficient leave balance" but employee has days**
- **Cause:** Pending requests are included in balance calculation
- **Solution:** Check pending requests, approve/reject them

**Issue 2: "Location not verified" at office**
- **Cause:** GPS accuracy issues or wrong office coordinates
- **Solution:** Update branch location coordinates or increase radius

**Issue 3: Employee marked absent but checked in**
- **Cause:** Attendance processor ran before check-in
- **Solution:** Manually update attendance status

**Issue 4: Leave request not appearing for approval**
- **Cause:** User doesn't have `leave:approve` permission
- **Solution:** Check user permissions, add to approver list

**Issue 5: Shift not applied to attendance**
- **Cause:** No active shift assignment for that date
- **Solution:** Create shift assignment with correct effective dates

---

## 📚 Additional Resources

- **API Documentation:** `/docs/LEAVE_MODULE_API_DOCUMENTATION.md`
- **Attendance Module Status:** `/docs/ATTENDANCE_MODULE_STATUS.md`
- **Shift Implementation:** `/docs/SHIFT_IMPLEMENTATION_SUMMARY.md`
- **File Upload Guide:** `/docs/LEAVE_REQUEST_FILE_UPLOAD_GUIDE.md`
- **Deployment Guide:** `/docs/DEPLOYMENT_GUIDE.md`

---

**Document Version:** 1.0.0  
**Last Updated:** February 26, 2026  
**Author:** HR Development Team  
**Contact:** tech@femtech.co.ke
