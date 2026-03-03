# Attendance Module - Complete Status & Action Plan

**Date:** February 26, 2026
**Status:** ⚠️ Substantially Implemented - Critical Fixes Needed
**Estimated Completion:** 2-3 weeks for critical fixes, 4-6 weeks for full features

---

## 📊 Executive Summary

The attendance module is **70% complete** with solid infrastructure but requires critical fixes before production use.

### What Works ✅
- Check-in/check-out with GPS verification
- Shift templates and assignments
- Holiday management
- Location-based geofencing
- Attendance processing (manual)
- Basic reporting

### Critical Issues 🚨
1. **Worker not started** - Daily automated processing doesn't run
2. **Shift fields not populated** - Attendance lacks scheduled times
3. **Location storage inconsistency** - VARCHAR vs POINT types
4. **Settings not integrated** - Branch settings partially ignored
5. **Leave query bug** - Overlapping leaves not detected correctly

---

## 🗄️ Database Schema (12 Tables)

### Core Tables

| Table | Purpose | Status | Issues |
|-------|---------|--------|--------|
| `attendance` | Main attendance records | ✅ Complete | ⚠️ Shift fields not populated |
| `attendance_locations` | GPS geofencing locations | ✅ Complete | - |
| `attendance_settings` | Branch-level settings | ⚠️ Partial | ❌ Not integrated properly |
| `global_attendance_settings` | Company-wide settings | ⚠️ Partial | ❌ Not integrated properly |
| `holidays` | Company/branch holidays | ✅ Complete | - |

### Shift Management Tables

| Table | Purpose | Status | Issues |
|-------|---------|--------|--------|
| `shift_timings` | Legacy shift system | ⚠️ Deprecated | ❌ Still in use alongside new system |
| `shift_templates` | Reusable shift patterns | ✅ Complete | - |
| `employee_shift_assignments` | Employee shift assignments | ✅ Complete | ⚠️ Not linked to attendance creation |
| `shift_exceptions` | Special schedule exceptions | ✅ Complete | - |

### Related Tables

| Table | Purpose | Status |
|-------|---------|--------|--------|
| `branches` | Branch info with location | ✅ Complete | ⚠️ location_coordinates as VARCHAR |
| `leave_history` | Approved leave records | ✅ Complete | ❌ Query bug in date range |

---

## 📡 API Endpoints (50+)

### Attendance Core (`/api/attendance`)

| Method | Endpoint | Permission | Status | Notes |
|--------|----------|------------|--------|-------|
| GET | `/api/attendance` | attendance:read | ✅ | Get all records |
| GET | `/api/attendance/my` | (auth) | ✅ | User's own records |
| GET | `/api/attendance/summary` | attendance:read | ✅ | Summary stats |
| GET | `/api/attendance/my/summary` | (auth) | ✅ | User's summary |
| GET | `/api/attendance/history/user/:userId` | attendance:read | ✅ | User history |
| GET | `/api/attendance/records` | attendance:read | ✅ | Paginated list |
| GET | `/api/attendance/staff-data` | attendance:read | ✅ | Dashboard data |
| GET | `/api/attendance/reports/monthly` | attendance:read | ✅ | Monthly report |
| GET | `/api/attendance/:id` | attendance:read | ✅ | Single record |
| PUT | `/api/attendance/:id` | attendance:update | ✅ | Update record |
| POST | `/api/attendance/process-daily` | attendance:manage | ✅ | Batch process |

### Check-in/Check-out (`/api/attendance/check`)

| Method | Endpoint | Permission | Status | Notes |
|--------|----------|------------|--------|-------|
| POST | `/api/attendance/check-in` | (auth) | ⚠️ | ❌ Doesn't populate shift fields |
| POST | `/api/attendance/check-out` | (auth) | ⚠️ | ❌ Doesn't calculate working hours |

### Manual Attendance (`/api/attendance/manual`)

| Method | Endpoint | Permission | Status | Notes |
|--------|----------|------------|--------|-------|
| POST | `/api/attendance/manual` | (auth) | ⚠️ | ❌ Doesn't populate shift fields |

### Attendance Processing (`/api/attendance/process`)

| Method | Endpoint | Permission | Status | Notes |
|--------|----------|------------|--------|-------|
| POST | `/api/attendance/process` | attendance:manage | ✅ | Process single user |
| POST | `/api/attendance/process-batch` | attendance:manage | ✅ | Process multiple users |

### Settings (`/api/attendance/settings`)

| Method | Endpoint | Permission | Status | Notes |
|--------|----------|------------|--------|-------|
| GET | `/api/attendance/settings` | attendance:manage | ⚠️ | ❌ Reads from wrong table |
| PATCH | `/api/attendance/settings` | attendance:manage | ⚠️ | ❌ Writes to wrong table |
| GET | `/api/attendance/settings/global` | attendance:manage | ⚠️ | ❌ Not integrated |
| PATCH | `/api/attendance/settings/global` | attendance:manage | ⚠️ | ❌ Not integrated |

### Locations (`/api/attendance-locations`)

| Method | Endpoint | Permission | Status |
|--------|----------|------------|--------|
| GET | `/api/attendance-locations` | attendance_location:read | ✅ |
| GET | `/api/attendance-locations/:id` | attendance_location:read | ✅ |
| POST | `/api/attendance-locations` | attendance-location:create | ✅ |
| PUT | `/api/attendance-locations/:id` | attendance-location:update | ✅ |
| DELETE | `/api/attendance-locations/:id` | attendance-location:delete | ✅ |

### Holidays (`/api/holidays`)

| Method | Endpoint | Permission | Status |
|--------|----------|------------|--------|
| GET | `/api/holidays` | holiday:read | ✅ |
| GET | `/api/holidays/:id` | holiday:read | ✅ |
| POST | `/api/holidays` | holiday:create | ✅ |
| PUT | `/api/holidays/:id` | holiday:update | ✅ |
| DELETE | `/api/holidays/:id` | holiday:delete | ✅ |

### Shift Timings (`/api/shift-timings`)

| Method | Endpoint | Permission | Status | Notes |
|--------|----------|------------|--------|-------|
| GET | `/api/shift-timings` | shift_timing:read | ✅ | Legacy system |
| GET | `/api/shift-timings/:id` | shift_timing:read | ✅ | Legacy system |
| POST | `/api/shift-timings` | shift:create | ⚠️ | Should use new tables |
| PUT | `/api/shift-timings/:id` | shift:update | ⚠️ | Should use new tables |
| DELETE | `/api/shift-timings/:id` | shift:delete | ⚠️ | Should use new tables |

### Shift Scheduling (`/api/shift-scheduling`)

**Shift Templates:**
| GET | `/api/shift-scheduling/shift-templates` | shift_template:read | ✅ |
| GET | `/api/shift-scheduling/shift-templates/:id` | shift_template:read | ✅ |
| POST | `/api/shift-scheduling/shift-templates` | shift_template:create | ✅ |
| PUT | `/api/shift-scheduling/shift-templates/:id` | shift_template:update | ✅ |
| DELETE | `/api/shift-scheduling/shift-templates/:id` | shift_template:delete | ✅ |

**Employee Shift Assignments:**
| GET | `/api/shift-scheduling/employee-shift-assignments` | employee_shift_assignment:read | ✅ |
| GET | `/api/shift-scheduling/employee-shift-assignments/:id` | employee_shift_assignment:read | ✅ |
| POST | `/api/shift-scheduling/employee-shift-assignments` | employee_shift_assignment:create | ✅ |
| POST | `/api/shift-scheduling/employee-shift-assignments/bulk` | employee_shift_assignment:create | ✅ |
| PUT | `/api/shift-scheduling/employee-shift-assignments/:id` | employee_shift_assignment:update | ✅ |
| GET | `/api/shift-scheduling/recurring-shifts` | employee_shift_assignment:read | ✅ |
| POST | `/api/shift-scheduling/recurring-shifts/bulk` | employee_shift_assignment:create | ✅ |
| PUT | `/api/shift-scheduling/recurring-shifts/:id` | employee_shift_assignment:update | ✅ |
| DELETE | `/api/shift-scheduling/recurring-shifts/:id` | employee_shift_assignment:update | ✅ |

**Schedule Requests:**
| GET | `/api/shift-scheduling/schedule-requests` | (auth) | ✅ |
| POST | `/api/shift-scheduling/schedule-requests` | (auth) | ✅ |
| PUT | `/api/shift-scheduling/schedule-requests/:id/approve` | schedule_request:approve | ✅ |
| PUT | `/api/shift-scheduling/schedule-requests/:id/reject` | schedule_request:reject | ✅ |
| PUT | `/api/shift-scheduling/schedule-requests/:id/cancel` | (auth) | ✅ |

### Branch Global Attendance (`/api/branches`)

| Method | Endpoint | Permission | Status |
|--------|----------|------------|--------|
| POST | `/api/branches/global-attendance-mode` | branches:update | ✅ |
| GET | `/api/branches/global-attendance-mode` | branches:read | ✅ |

### Analytics (`/api/reports`)

| Method | Endpoint | Permission | Status |
|--------|----------|------------|--------|
| GET | `/api/reports/attendance-metrics` | analytics:read | ✅ |

---

## 🚨 Critical Issues (Must Fix Before Production)

### Issue #1: Worker Not Started
**Severity:** 🔴 CRITICAL

**File:** `/src/index.ts`, `/src/workers/attendance-processor.worker.ts`

**Problem:**
- Attendance processor worker exists but is NOT imported or started in `index.ts`
- Daily automated attendance processing never runs
- Managers must manually run `/api/attendance/process-daily`

**Impact:**
- Employees not automatically marked absent
- Leave marking doesn't happen automatically
- Holiday marking doesn't happen automatically

**Fix:**
```typescript
// In src/index.ts, add:
import { AttendanceProcessorWorker } from './workers/attendance-processor.worker';

// After SystemInitService.initialize():
AttendanceProcessorWorker.start(); // Daily at midnight
```

**Estimated Time:** 30 minutes

---

### Issue #2: Shift Fields Not Populated
**Severity:** 🔴 CRITICAL

**Files:** 
- `/src/api/attendance-check.route.ts`
- `/src/api/attendance-create.route.ts`
- `/src/services/shift-scheduling.service.ts`

**Problem:**
- Attendance table has `scheduled_start_time`, `scheduled_end_time`, `is_late`, `actual_working_hours`
- These fields are NEVER populated during check-in/check-out
- `ShiftSchedulingService.updateAttendanceWithScheduleInfo()` exists but is never called

**Impact:**
- Cannot detect late arrivals
- Cannot calculate working hours
- Cannot detect early departures
- Attendance reports lack critical data

**Fix:**
```typescript
// After creating attendance in check-in route:
await ShiftSchedulingService.updateAttendanceWithScheduleInfo(userId, date, connection);

// After creating attendance in check-out route:
await ShiftSchedulingService.updateAttendanceWithScheduleInfo(userId, date, connection);
```

**Estimated Time:** 2 hours

---

### Issue #3: Location Coordinates Inconsistency
**Severity:** 🟠 HIGH

**Files:**
- `/migrations/002_create_branches_table.sql` (VARCHAR)
- `/migrations/023_create_attendance_locations_table.sql` (POINT)
- `/src/models/branch.model.ts`
- `/src/models/attendance-location.model.ts`

**Problem:**
- `branches.location_coordinates` is VARCHAR
- `attendance_locations.location_coordinates` is POINT
- Spatial queries (`ST_Distance_Sphere`) may not work with VARCHAR

**Impact:**
- Geofencing may fail
- Distance calculations inaccurate
- Location verification unreliable

**Fix:**
```sql
-- Migration to fix branches table
ALTER TABLE branches 
MODIFY COLUMN location_coordinates POINT,
ADD SPATIAL INDEX(location_coordinates);
```

**Estimated Time:** 2 hours

---

### Issue #4: Attendance Settings Not Integrated
**Severity:** 🟠 HIGH

**Files:**
- `/migrations/075_create_attendance_settings_table.sql`
- `/migrations/076_create_global_attendance_settings_table.sql`
- `/src/api/attendance-settings.route.ts`

**Problem:**
- Settings stored in `attendance_settings` table
- But code reads from `branches` table
- Settings like `grace_period_minutes`, `require_check_in` ignored

**Impact:**
- Branch-specific settings don't work
- Global settings don't work
- Configuration changes have no effect

**Fix:**
1. Update all code to read from `attendance_settings` instead of `branches`
2. Remove duplicate columns from `branches` table
3. Update settings routes to use correct table

**Estimated Time:** 4 hours

---

### Issue #5: Leave History Query Bug
**Severity:** 🟠 HIGH

**File:** `/src/models/leave-history.model.ts`

**Problem:**
```typescript
// Current (WRONG):
WHERE start_date >= ? AND end_date <= ?

// Should be (CORRECT):
WHERE start_date <= ? AND end_date >= ?
```

**Impact:**
- Overlapping leaves not detected
- Employees can submit conflicting leave requests
- Attendance processing misses leave dates

**Fix:**
Update `findByUserIdAndDateRange` method in LeaveHistoryModel

**Estimated Time:** 30 minutes

---

## ⚠️ Moderate Issues (Should Fix)

### Issue #6: Dual Shift Systems
**Severity:** 🟡 MEDIUM

**Problem:**
- Old system: `shift_timings` table
- New system: `shift_templates` + `employee_shift_assignments`
- Both systems active simultaneously

**Impact:**
- Confusion about which to use
- Data inconsistency
- Maintenance burden

**Fix:**
1. Deprecate `shift_timings` table
2. Migrate existing data to new tables
3. Update all code to use new system

**Estimated Time:** 8 hours

---

### Issue #7: Grace Period Not Applied
**Severity:** 🟡 MEDIUM

**File:** `/src/api/attendance-check.route.ts`

**Problem:**
- Grace period read from settings
- Only applied in check-in route
- Not applied during attendance processing

**Impact:**
- Employees marked late incorrectly during batch processing
- Inconsistent treatment

**Fix:**
Apply grace period in `AttendanceProcessorWorker.processDailyAttendance()`

**Estimated Time:** 1 hour

---

### Issue #8: Duplicate Holiday Routes
**Severity:** 🟡 MEDIUM

**Files:**
- `/src/api/attendance.route.ts` (uses `attendance:view`)
- `/src/api/holiday.route.ts` (uses `holiday:*`)

**Problem:**
- Same endpoints in two files
- Different permissions

**Fix:**
Remove holiday endpoints from `attendance.route.ts`

**Estimated Time:** 1 hour

---

## 📝 Minor Issues (Nice to Fix)

### Issue #9: Missing Permission Definition
**Severity:** 🟢 LOW

**File:** `/src/services/permission-definitions.service.ts`

**Problem:**
- `attendance:create` permission defined
- No route uses it

**Fix:**
Add to manual attendance creation route

**Estimated Time:** 15 minutes

---

### Issue #10: Hardcoded Role IDs
**Severity:** 🟢 LOW

**File:** `/src/api/attendance.route.ts`

**Problem:**
```typescript
if (userRole === 1 || userRole === 3) // Admin or HR
```

**Fix:**
Use permission checks instead

**Estimated Time:** 1 hour

---

### Issue #11: No Audit Logging
**Severity:** 🟢 LOW

**Problem:**
- Attendance updates don't create audit logs
- No trail of who changed what

**Fix:**
Add audit log entries on attendance updates

**Estimated Time:** 2 hours

---

## 🎯 Missing Features (Future Enhancements)

### Core Attendance
- [ ] Half-day attendance handling
- [ ] Early departure detection
- [ ] Overtime tracking
- [ ] Attendance regularization requests
- [ ] Attendance correction workflow
- [ ] Bulk attendance update
- [ ] Export to CSV/PDF

### Shift Management
- [ ] Shift rotation publishing
- [ ] Shift swap requests
- [ ] Shift coverage management
- [ ] Shift template cloning

### Location Management
- [ ] Location usage analytics
- [ ] IP-based attendance (office WiFi)

### Advanced Features
- [ ] Face recognition integration
- [ ] Biometric verification
- [ ] Auto-checkout implementation
- [ ] Weekend attendance enforcement

### Notifications
- [ ] Absent employee notifications
- [ ] Supervisor daily summary
- [ ] Late arrival notifications
- [ ] Early departure notifications

### Analytics
- [ ] Attendance trend analysis
- [ ] Department-wise comparison
- [ ] Branch-wise comparison
- [ ] Anomaly detection
- [ ] Real-time dashboard

---

## 📋 Implementation Plan

### Phase 1: Critical Fixes (Week 1)

**Day 1-2:**
- [ ] Fix Issue #1: Start attendance processor worker
- [ ] Fix Issue #5: Leave history query bug
- [ ] Test automated processing

**Day 3-4:**
- [ ] Fix Issue #2: Populate shift fields
- [ ] Test check-in/check-out with shift data
- [ ] Verify working hours calculation

**Day 5:**
- [ ] Fix Issue #3: Location coordinates
- [ ] Test geofencing
- [ ] Migrate existing data

### Phase 2: Settings Integration (Week 2)

**Day 1-3:**
- [ ] Fix Issue #4: Attendance settings
- [ ] Update all code to use `attendance_settings`
- [ ] Remove duplicate columns from branches

**Day 4-5:**
- [ ] Fix Issue #6: Consolidate shift systems
- [ ] Migrate from `shift_timings` to new tables
- [ ] Update documentation

### Phase 3: Moderate Improvements (Week 3)

**Day 1-2:**
- [ ] Fix Issue #7: Grace period consistency
- [ ] Fix Issue #8: Duplicate holiday routes
- [ ] Fix Issue #9: Permission definitions

**Day 3-5:**
- [ ] Implement half-day attendance
- [ ] Implement early departure detection
- [ ] Add audit logging

### Phase 4: Testing & Documentation (Week 4)

**Day 1-2:**
- [ ] Write unit tests for models
- [ ] Write integration tests for routes
- [ ] Test all workflows end-to-end

**Day 3-4:**
- [ ] Create API documentation
- [ ] Create database schema documentation
- [ ] Create user guides

**Day 5:**
- [ ] Final testing
- [ ] Performance optimization
- [ ] Deploy to staging

---

## 🧪 Testing Checklist

### Core Attendance
- [ ] Check-in with GPS verification
- [ ] Check-out calculates working hours
- [ ] Late detection works
- [ ] Geofencing works (branch-based mode)
- [ ] Geofencing works (multiple locations mode)
- [ ] Manual attendance creation
- [ ] Attendance update (admin)
- [ ] Attendance history retrieval

### Automated Processing
- [ ] Worker starts on app launch
- [ ] Daily processing runs at midnight
- [ ] Absent marking works
- [ ] Leave marking works
- [ ] Holiday marking works
- [ ] Shift-based attendance works

### Shift Management
- [ ] Create shift template
- [ ] Assign shift to employee
- [ ] Recurring shifts work
- [ ] Schedule request workflow
- [ ] Shift exceptions work
- [ ] Bulk shift assignment

### Holiday Management
- [ ] Create company-wide holiday
- [ ] Create branch-specific holiday
- [ ] Holiday attendance auto-marking
- [ ] Holiday list retrieval

### Settings
- [ ] Branch settings CRUD
- [ ] Global settings CRUD
- [ ] Settings affect behavior
- [ ] Grace period applied

### Locations
- [ ] Create attendance location
- [ ] Update location
- [ ] Delete (deactivate) location
- [ ] Location verification during check-in

---

## 📊 Current Status Summary

| Category | Status | Completion |
|----------|--------|------------|
| **Database Schema** | ✅ Complete | 100% |
| **API Endpoints** | ✅ Complete | 100% |
| **Core Functionality** | ⚠️ Working | 85% |
| **Shift Management** | ⚠️ Working | 80% |
| **Settings Integration** | ❌ Broken | 40% |
| **Automation** | ❌ Not Started | 0% |
| **Testing** | ❌ Not Started | 0% |
| **Documentation** | ❌ Missing | 0% |

**Overall:** ⚠️ **70% Complete** - Critical fixes needed

---

## 🎯 Priority Matrix

| Priority | Issue | Impact | Effort |
|----------|-------|--------|--------|
| 🔴 P0 | Worker not started | HIGH | LOW |
| 🔴 P0 | Shift fields not populated | HIGH | MEDIUM |
| 🟠 P1 | Location storage | MEDIUM | MEDIUM |
| 🟠 P1 | Settings not integrated | HIGH | HIGH |
| 🟠 P1 | Leave query bug | MEDIUM | LOW |
| 🟡 P2 | Dual shift systems | MEDIUM | HIGH |
| 🟡 P2 | Grace period | LOW | LOW |
| 🟢 P3 | Minor issues | LOW | LOW |

---

## 📞 Next Steps

1. **Immediate (This Week):**
   - Fix worker startup (30 min)
   - Fix leave query bug (30 min)
   - Start populating shift fields (2 hours)

2. **Short Term (Next 2 Weeks):**
   - Fix location storage (2 hours)
   - Integrate settings (4 hours)
   - Consolidate shift systems (8 hours)

3. **Medium Term (Next Month):**
   - Implement missing features
   - Write comprehensive tests
   - Create documentation

4. **Long Term (Next Quarter):**
   - Advanced analytics
   - Face recognition
   - Mobile app integration

---

**Recommendation:** Start with Phase 1 critical fixes immediately. The module is usable but unreliable until automation works properly.

**Estimated Total Effort:** 80-120 hours (2-3 weeks full-time)
