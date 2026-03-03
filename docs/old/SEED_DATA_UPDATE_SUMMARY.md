# Seed Data Update Summary

**Date:** March 1, 2026  
**Purpose:** Update seed data with new shift templates and employee location management

---

## Changes Made

### 1. Increased Employee Count

**File:** `/scripts/seed-database.ts`

```typescript
const CONFIG = {
  numEmployees: 100,        // Increased from 50 to 100
  sundayWorkers: 30,        // New: 30 employees work on Sundays
};
```

---

### 2. New Shift Templates

Created **3 shift templates** with different working hours:

#### Template 1: Standard Working Hours
- **Schedule:** Monday to Saturday
- **Time:** 8:00 AM - 6:30 PM (10.5 hours with 1 hour break)
- **Effective:** From January 1, 2024 (ongoing)
- **Applied to:** ALL 100 employees

```typescript
{
  name: 'Standard Working Hours',
  description: 'Monday to Saturday, 8:00 AM - 6:30 PM',
  start_time: '08:00:00',
  end_time: '18:30:00',
  break_duration_minutes: 60,
  effective_from: '2024-01-01',
  recurrence_pattern: 'weekly'
}
```

#### Template 2: Fasting Period Hours
- **Schedule:** Monday to Saturday
- **Time:** 8:00 AM - 6:00 PM (10 hours with 1 hour break)
- **Effective:** March 1 - April 30, 2024 (Ramadan period)
- **Applied to:** ALL 100 employees (automatically during fasting period)

```typescript
{
  name: 'Fasting Period Hours',
  description: 'Reduced hours during fasting period, 8:00 AM - 6:00 PM',
  start_time: '08:00:00',
  end_time: '18:00:00',
  break_duration_minutes: 60,
  effective_from: '2024-03-01',
  effective_to: '2024-04-30',
  recurrence_pattern: 'weekly'
}
```

#### Template 3: Sunday Working Hours
- **Schedule:** Sundays only
- **Time:** 12:00 PM - 8:00 PM (8 hours with 1 hour break)
- **Effective:** From January 1, 2024 (ongoing)
- **Applied to:** ONLY 30 designated Sunday workers

```typescript
{
  name: 'Sunday Working Hours',
  description: 'Sunday shift, 12:00 PM - 8:00 PM',
  start_time: '12:00:00',
  end_time: '20:00:00',
  break_duration_minutes: 60,
  effective_from: '2024-01-01',
  recurrence_pattern: 'weekly'
}
```

---

### 3. Employee Shift Assignments

#### All Employees (100 employees)
- **Monday to Saturday:** Standard Working Hours (8:00 AM - 6:30 PM)
- **Total assignments per employee:** 6 days × 100 employees = **600 assignments**

#### Sunday Workers (First 30 employees)
- **Sunday:** Sunday Working Hours (12:00 PM - 8:00 PM)
- **Total assignments:** 30 employees × 1 Sunday = **30 assignments**

**Grand Total:** 630 shift assignments

---

### 4. Employee Distribution

```
Total Employees: 100
├─ Sunday Workers: 30 employees (user_id: 1-30)
│  ├─ Work: Monday to Sunday (7 days/week)
│  └─ Sunday Shift: 12:00 PM - 8:00 PM
│
└─ Non-Sunday Workers: 70 employees (user_id: 31-100)
   ├─ Work: Monday to Saturday (6 days/week)
   └─ Sunday: OFF
```

---

## How to Run the Updated Seed

### Prerequisites

1. Ensure database is running
2. Have MySQL/MariaDB connection ready
3. Node.js 16+ installed

### Steps

#### Option 1: Fresh Seed (Recommended)

```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE IF EXISTS hr_app; CREATE DATABASE hr_app;"

# Run migrations
npm run migrate

# Run seed
npm run seed
```

#### Option 2: Update Existing Database

```bash
# Run only the new migration
mysql -u root -p hr_app < migrations/084_add_staff_location_assignment.sql

# Re-run seed (will skip existing records)
npm run seed
```

#### Option 3: Update Shift Templates Only

```bash
# Connect to database
mysql -u root -p hr_app

# Delete existing shift assignments
DELETE FROM employee_shift_assignments;
DELETE FROM shift_templates;

# Re-run seed (will create new templates and assignments)
npm run seed
```

---

## Verification

### Check Shift Templates

```sql
SELECT 
  id,
  name,
  start_time,
  end_time,
  break_duration_minutes,
  effective_from,
  effective_to,
  recurrence_pattern
FROM shift_templates
ORDER BY id;
```

**Expected Output:**
```
| id | name                      | start_time | end_time | break | effective_from | effective_to | recurrence_pattern |
|----|---------------------------|------------|----------|-------|----------------|--------------|-------------------|
| 1  | Standard Working Hours    | 08:00:00   | 18:30:00 | 60    | 2024-01-01     | NULL         | weekly            |
| 2  | Fasting Period Hours      | 08:00:00   | 18:00:00 | 60    | 2024-03-01     | 2024-04-30   | weekly            |
| 3  | Sunday Working Hours      | 12:00:00   | 20:00:00 | 60    | 2024-01-01     | NULL         | weekly            |
```

---

### Check Employee Assignments

```sql
SELECT 
  u.full_name,
  s.employee_id,
  st.name AS shift_name,
  esa.recurrence_day_of_week,
  esa.effective_from,
  esa.notes
FROM employee_shift_assignments esa
JOIN users u ON esa.user_id = u.id
JOIN staff s ON esa.user_id = s.user_id
JOIN shift_templates st ON esa.shift_template_id = st.id
WHERE esa.status = 'active'
ORDER BY esa.user_id, 
         FIELD(esa.recurrence_day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
```

---

### Check Sunday Workers

```sql
SELECT 
  u.full_name,
  s.employee_id,
  st.name AS sunday_shift,
  st.start_time,
  st.end_time
FROM employee_shift_assignments esa
JOIN users u ON esa.user_id = u.id
JOIN staff s ON esa.user_id = s.user_id
JOIN shift_templates st ON esa.shift_template_id = st.id
WHERE esa.recurrence_day_of_week = 'sunday'
  AND esa.status = 'active'
ORDER BY s.employee_id
LIMIT 30;
```

**Expected:** 30 rows (Sunday workers)

---

### Check Non-Sunday Workers

```sql
SELECT 
  COUNT(DISTINCT u.user_id) AS non_sunday_workers
FROM users u
JOIN staff s ON u.id = s.user_id
LEFT JOIN employee_shift_assignments esa 
  ON u.user_id = esa.user_id 
  AND esa.recurrence_day_of_week = 'sunday'
  AND esa.status = 'active'
WHERE esa.id IS NULL  -- No Sunday shift assigned
  AND s.status = 'active';
```

**Expected:** 70 rows

---

## Attendance Location Management

### New Migration: Staff Location Assignment

**File:** `/migrations/084_add_staff_location_assignment.sql`

**Changes:**
1. Added `assigned_location_id` column to `staff` table
2. Added `location_assignments` JSON column for multiple locations
3. Added `location_notes` TEXT column
4. Created `staff_location_assignments` view for easy lookup

### Usage Examples

#### Assign Employee to Specific Location

```sql
-- Assign employee 123 to location 5 (Remote - Karen)
UPDATE staff 
SET assigned_location_id = 5 
WHERE user_id = 123;
```

#### Assign Multiple Employees to Office

```sql
-- Assign first 70 employees to main office (location ID 1)
UPDATE staff 
SET assigned_location_id = 1 
WHERE user_id <= 70;
```

#### Assign Remote Workers to Individual Locations

```sql
-- Create 30 locations for remote workers first
-- Then assign each employee to their location

-- Employee 71 → Location 2 (Karen)
UPDATE staff SET assigned_location_id = 2 WHERE user_id = 71;

-- Employee 72 → Location 3 (Gigiri)
UPDATE staff SET assigned_location_id = 3 WHERE user_id = 72;

-- ... repeat for all 30 remote employees
```

#### View All Location Assignments

```sql
SELECT * FROM staff_location_assignments;
```

---

## API Endpoints for Location Management

### Create Attendance Location

```bash
POST /api/attendance-locations
Authorization: Bearer <token>
```

```json
{
  "name": "Remote Worker - Mombasa",
  "location_coordinates": {
    "latitude": -4.043477,
    "longitude": 39.668206
  },
  "location_radius_meters": 300,
  "branch_id": 1,
  "is_active": true
}
```

### Assign Location to Employee

```bash
PUT /api/staff/:id
Authorization: Bearer <token>
```

```json
{
  "assigned_location_id": 5,
  "location_notes": "Remote worker - Mombasa branch"
}
```

### Get Employee's Assigned Location

```bash
GET /api/staff/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "staff": {
      "user_id": 123,
      "employee_id": "EMP0123",
      "assigned_location_id": 5,
      "location_notes": "Remote worker - Mombasa"
    }
  }
}
```

---

## Testing Checklist

### Shift Templates
- [ ] Verify 3 templates created
- [ ] Check Standard Hours: 08:00-18:30
- [ ] Check Fasting Hours: 08:00-18:00 (Mar-Apr only)
- [ ] Check Sunday Hours: 12:00-20:00

### Shift Assignments
- [ ] All 100 employees have Mon-Sat shifts
- [ ] First 30 employees have Sunday shifts
- [ ] Total assignments = 630

### Location Assignment
- [ ] Run migration 084
- [ ] Verify `assigned_location_id` column exists
- [ ] Test assigning employee to location
- [ ] Test location verification during check-in

### Attendance Check-in
- [ ] Employee at assigned location → Check-in succeeds
- [ ] Employee at wrong location → Check-in fails or flags
- [ ] GPS coordinates recorded correctly
- [ ] Location verified flag set correctly

---

## Troubleshooting

### Issue: Shift Templates Not Created

**Solution:**
```sql
-- Manually create templates
INSERT INTO shift_templates (name, description, start_time, end_time, break_duration_minutes, effective_from, recurrence_pattern, is_active)
VALUES 
  ('Standard Working Hours', 'Monday to Saturday, 8:00 AM - 6:30 PM', '08:00:00', '18:30:00', 60, '2024-01-01', 'weekly', TRUE),
  ('Fasting Period Hours', 'Reduced hours during fasting period', '08:00:00', '18:00:00', 60, '2024-03-01', 'weekly', TRUE),
  ('Sunday Working Hours', 'Sunday shift', '12:00:00', '20:00:00', 60, '2024-01-01', 'weekly', TRUE);
```

### Issue: Employees Missing Shift Assignments

**Solution:**
```bash
# Re-run seed
npm run seed

# Or manually assign via SQL
# See seed-database.ts seedRecurringShiftAssignments() function
```

### Issue: Location Assignment Column Missing

**Solution:**
```bash
# Run the migration
mysql -u root -p hr_app < migrations/084_add_staff_location_assignment.sql
```

---

## Next Steps

1. **Run the seed:** `npm run seed`
2. **Verify data:** Run verification queries above
3. **Test attendance:** Try check-in with different locations
4. **Configure locations:** Set up attendance locations for your use case
5. **Assign employees:** Assign each employee to their approved location(s)

---

## Files Modified

| File | Changes |
|------|---------|
| `/scripts/seed-database.ts` | Updated CONFIG, seedRecurringShiftAssignments() |
| `/migrations/084_add_staff_location_assignment.sql` | NEW: Location assignment fields |
| `/docs/EMPLOYEE_ATTENDANCE_LOCATIONS_GUIDE.md` | NEW: Complete location management guide |
| `/docs/SEED_DATA_UPDATE_SUMMARY.md` | NEW: This file |

---

## Support

For questions or issues:
1. Check `/docs/EMPLOYEE_ATTENDANCE_LOCATIONS_GUIDE.md` for detailed location management
2. Check `/docs/SHIFTS_ATTENDANCE_BRANCHES_COMPLETE.md` for complete module documentation
3. Review Postman collection for API examples

---

**Last Updated:** March 1, 2026  
**Version:** 2.0
