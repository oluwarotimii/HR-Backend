# Quick Reference: Resume Late, Close Early & Compensatory Leave

## Two Different Scenarios - Two Different Solutions

---

## Scenario 1: Resume Late / Close Early (Recurring)

**What it is:** Employee works different hours on a specific day each week

**Example:**
- Staff A: Every Monday → Start at 10:00 instead of 08:00
- Staff B: Every Wednesday → Leave at 14:00 instead of 17:00

**Key Point:** They still work full hours, just shifted. **NOT leave.**

### Solution: Recurring Shift Assignments

```
┌─────────────────────────────────────────────────────────┐
│  STEP 1: Create Shift Templates (One-Time)              │
├─────────────────────────────────────────────────────────┤
│  POST /api/shift-templates                              │
│  {                                                      │
│    "name": "Resume Late - 2 Hours",                     │
│    "start_time": "10:00:00",                            │
│    "end_time": "17:00:00",                              │
│    "effective_from": "2026-02-23"                       │
│  }                                                      │
│                                                         │
│  POST /api/shift-templates                              │
│  {                                                      │
│    "name": "Close Early - 3 Hours",                     │
│    "start_time": "08:00:00",                            │
│    "end_time": "14:00:00",                              │
│    "effective_from": "2026-02-23"                       │
│  }                                                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  STEP 2: Assign to Staff (Bulk - Different Days)        │
├─────────────────────────────────────────────────────────┤
│  POST /api/recurring-shifts/bulk                        │
│  {                                                      │
│    "assignments": [                                     │
│      {                                                  │
│        "user_id": 123,                                  │
│        "shift_template_id": 5,                          │
│        "day_of_week": "monday",                         │
│        "start_date": "2026-02-23",                      │
│        "end_date": "2026-12-31"                         │
│      },                                                 │
│      {                                                  │
│        "user_id": 456,                                  │
│        "shift_template_id": 5,                          │
│        "day_of_week": "tuesday",                        │
│        "start_date": "2026-02-24",                      │
│        "end_date": "2026-12-31"                         │
│      }                                                  │
│    ]                                                    │
│  }                                                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  RESULT:                                                │
│  - Staff A: Every Monday → 10:00-17:00 (not 08:00)      │
│  - Staff B: Every Tuesday → 10:00-17:00 (not 08:00)     │
│  - Attendance system knows expected times               │
│  - No late marks on adjusted days                       │
│  - NO leave deduction                                   │
└─────────────────────────────────────────────────────────┘
```

**Endpoints Used:**
- `POST /api/shift-templates` - Create templates
- `POST /api/recurring-shifts/bulk` - Assign to staff
- `GET /api/employee-shift-assignments` - View schedule

**Permissions:**
- `shift_template:create` - Create templates
- `employee_shift_assignment:create` - Assign shifts

---

## Scenario 2: Compensatory Leave (Working Holidays)

**What it is:** Employee worked on holiday, gets a free day off later

**Example:**
- Christmas Day (Dec 25) was a working day
- Company gives 1 comp-off day to all staff
- Staff can use it within 60 days
- When used, it's a full day off (no work)

**Key Point:** This IS leave. They don't work that day.

### Solution: Leave Allocation (Existing System)

```
┌─────────────────────────────────────────────────────────┐
│  STEP 1: Create Leave Type (One-Time)                   │
├─────────────────────────────────────────────────────────┤
│  POST /api/leave-types                                  │
│  {                                                      │
│    "name": "Compensatory Leave",                        │
│    "days_per_year": 0,  // Allocated ad-hoc             │
│    "is_paid": true,                                     │
│    "allow_carryover": false,                            │
│    "expiry_rule_id": 60  // Expires in 60 days          │
│  }                                                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  STEP 2: Allocate Days to Staff (After Holiday Work)    │
├─────────────────────────────────────────────────────────┤
│  POST /api/leave-allocations                            │
│  {                                                      │
│    "user_id": 123,                                      │
│    "leave_type_id": 5,  // Compensatory Leave           │
│    "allocated_days": 1,                                 │
│    "cycle_start_date": "2026-12-25",                    │
│    "cycle_end_date": "2027-02-23"  // 60 days           │
│  }                                                      │
│                                                         │
│  (Repeat for all staff who worked the holiday)          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  STEP 3: Employee Requests Their Day Off                │
├─────────────────────────────────────────────────────────┤
│  POST /api/leave                                        │
│  {                                                      │
│    "leave_type_id": 5,  // Compensatory Leave           │
│    "start_date": "2027-01-15",                          │
│    "end_date": "2027-01-15",                            │
│    "reason": "Using comp-off for Christmas"             │
│  }                                                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  STEP 4: Manager Approves                               │
├─────────────────────────────────────────────────────────┤
│  PUT /api/leave/:id                                     │
│  {                                                      │
│    "status": "approved"                                 │
│  }                                                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  RESULT:                                                │
│  - Employee gets Jan 15 off                             │
│  - Leave balance: Used = 1, Remaining = 0               │
│  - Attendance marked as "Compensatory Leave"            │
│  - No salary deduction                                  │
└─────────────────────────────────────────────────────────┘
```

**Endpoints Used:**
- `POST /api/leave-types` - Create leave type
- `POST /api/leave-allocations` - Allocate days
- `POST /api/leave` - Employee requests day
- `PUT /api/leave/:id` - Manager approves

**Permissions:**
- `leave:request` - Create leave type
- `leave:approve` - Allocate/approve
- `leave:create` - Employee requests

---

## Comparison Table

| Feature | Resume Late/Close Early | Compensatory Leave |
|---------|------------------------|-------------------|
| **What is it?** | Shift adjustment | Actual leave |
| **Work that day?** | ✅ Yes, different hours | ❌ No, day off |
| **Leave deduction?** | ❌ No | ✅ Yes |
| **Module** | Shift Scheduling | Leave Management |
| **Recurring?** | ✅ Yes (weekly) | ❌ No (one-time) |
| **Approval needed?** | ❌ No (HR assigns) | ✅ Yes (manager) |
| **Balance tracking?** | ❌ No | ✅ Yes |
| **Expiry?** | ❌ No (until cancelled) | ✅ Yes (60 days) |

---

## What NOT to Use

### ❌ Time Off Banks

**Don't use Time Off Banks for either scenario!**

Time Off Banks were designed for complex scenarios like:
- Multiple leave programs per employee
- Dynamic accrual calculations
- Complex rollover rules

**Your use cases are simpler:**
- Resume Late/Close Early → Shift changes (no leave)
- Compensatory Leave → Standard leave allocation

---

## Frontend Implementation

### Resume Late / Close Early UI

```typescript
// HR Form: Assign Recurring Shifts
<BulkRecurringShiftForm />

// Employee View: Weekly Schedule
<EmployeeScheduleView />

// HR View: All Recurring Shifts
<WeeklyScheduleCalendar />
```

**See:** `/docs/shifts.md` for complete React components

---

### Compensatory Leave UI

```typescript
// HR Form: Allocate Leave
<LeaveAllocationForm 
  leaveType="compensatory"
  expiryDays={60}
/>

// Employee View: Leave Balance
<LeaveBalanceCard 
  leaveType="compensatory"
  showExpiry={true}
/>

// Employee Form: Request Leave
<LeaveRequestForm 
  leaveType="compensatory"
  requireReason={true}
/>

// Manager View: Pending Approvals
<LeaveApprovalQueue 
  filterType="compensatory"
/>
```

**See:** Existing leave management components in your codebase

---

## Quick Decision Tree

```
┌─────────────────────────────────────────┐
│  Do employees WORK on the adjusted day? │
└─────────────────────────────────────────┘
              │
        ┌─────┴─────┐
        │           │
       YES         NO
        │           │
        ▼           ▼
┌─────────────┐ ┌──────────────────┐
│ Is it       │ │ Is it a one-time │
│ recurring   │ │ day off earned   │
│ (weekly)?   │ │ from working     │
└─────────────┘ │ holiday?         │
    │           └──────────────────┘
┌───┴───┐               │
│       │              YES
│ YES   │ NO            │
│       │               ▼
│       │      ┌──────────────────┐
│       │      │ Use Leave        │
│       │      │ Allocation       │
│       │      │ (Compensatory    │
│       │      │ Leave type)      │
│       │      └──────────────────┘
│       │
│       ▼
│ ┌──────────────────┐
│ │ Use Standard     │
│ │ Shift Assignment │
│ │ (permanent)      │
│ └──────────────────┘
│
▼
┌──────────────────┐
│ Use Recurring    │
│ Shift Assignment │
│ (Resume Late/    │
│ Close Early)     │
└──────────────────┘
```

---

## Testing Checklist

### Resume Late / Close Early

- [ ] Create "Resume Late" shift template
- [ ] Create "Close Early" shift template
- [ ] Assign recurring shifts to 5 staff with different days
- [ ] Employee views schedule (shows adjusted days)
- [ ] Employee clocks in on adjusted day (no late mark)
- [ ] Employee clocks in on normal day (standard rules apply)
- [ ] HR updates recurring shift (changes day)
- [ ] HR cancels recurring shift

### Compensatory Leave

- [ ] Create "Compensatory Leave" leave type
- [ ] Allocate 1 day to employee with 60-day expiry
- [ ] Employee sees balance in leave dashboard
- [ ] Employee requests specific day
- [ ] Manager approves
- [ ] Leave balance updated (used = 1)
- [ ] Attendance marked as leave (not absent)

---

## Summary

| Scenario | Use This | Don't Use |
|----------|----------|-----------|
| **Resume Late** | Recurring Shifts | Time Off Banks |
| **Close Early** | Recurring Shifts | Time Off Banks |
| **Comp-Off Day** | Leave Allocation | Time Off Banks |

**Bottom Line:** You don't need Time Off Banks for these use cases!

---

**Last Updated:** February 20, 2026  
**Status:** ✅ Ready for Implementation
