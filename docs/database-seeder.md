# Database Seeder Documentation

This script populates your HR database with realistic test data for development and testing purposes.

---

## Quick Start

```bash
# Run the seeder
npm run seed
```

Or directly:

```bash
npx ts-node scripts/seed-database.ts
```

---

## What Gets Seeded

The seeder creates comprehensive test data including:

| Table | Records | Description |
|-------|---------|-------------|
| `roles` | 4 | Admin, Manager, HR, Employee |
| `branches` | 5 | Nairobi, Mombasa, Kisumu, Nakuru, Eldoret |
| `users` | 51 | Admin + 50 employees |
| `staff` | 51 | Employee records linked to users |
| `departments` | 6 | HR, Finance, IT, Operations, Sales, Customer Service |
| `leave_types` | 7 | Annual, Sick, Personal, Maternity, Paternity, etc. |
| `holidays` | ~19 | Kenyan public holidays (2024-2025) |
| `shift_timings` | 51 | Work schedules for all employees |
| `attendance` | ~7,000+ | 6+ months of daily attendance records |
| `leave_history` | ~100+ | Leave requests per employee |

---

## Configuration

Edit `scripts/seed-database.ts` to customize:

```typescript
const CONFIG = {
  startDate: '2024-07-01', // Start date for attendance data
  endDate: '2025-02-16',   // End date
  numBranches: 5,          // Number of branches
  numEmployees: 50,        // Number of employees
};
```

### Branches

The seeder creates 5 Kenyan branches with GPS coordinates:

| Branch | Code | City | Coordinates |
|--------|------|------|-------------|
| Nairobi HQ | NAI | Nairobi | -1.286389, 36.817223 |
| Mombasa Branch | MBA | Mombasa | -4.0435, 39.6682 |
| Kisumu Branch | KIS | Kisumu | -0.0917, 34.7519 |
| Nakuru Branch | NAK | Nakuru | -0.3031, 36.0667 |
| Eldoret Branch | ELD | Eldoret | 0.5143, 35.2698 |

### Holidays

Kenyan public holidays for 2024-2025:

- Madaraka Day (June 1)
- Huduma Day (August 12)
- Mashujaa Day (October 10)
- Diwali (October 21)
- Jamhuri Day (December 12)
- Christmas Day (December 25)
- Boxing Day (December 26)
- New Year's Day (January 1)
- Good Friday & Easter Monday
- Labour Day (May 1)
- Eid al-Adha
- Ramadan

### Attendance Patterns

The seeder generates realistic attendance data:

| Status | Percentage | Description |
|--------|------------|-------------|
| Present | 78% | Normal attendance |
| Late | 10% | 15-60 minutes late |
| Absent | 3% | No show |
| Leave | 2% | On approved leave |
| Half Day | 2% | Partial day |
| Holiday | Variable | Public holidays |

### Location Verification

- 90-95% of check-ins have `location_verified = true`
- Coordinates are generated near the employee's branch location
- GPS variation simulates real-world accuracy (~100m radius)

---

## Test Credentials

After seeding, use these credentials to log in:

### Admin Account

```
Email: admin@company.co.ke
Password: Password123!
Role: Admin (role_id = 1)
```

### Regular Employees

```
Email: [firstname].[lastname][number]@company.co.ke
Password: Password123!
Role: Employee (role_id = 4)

Examples:
- john.smith2@company.co.ke
- mary.kamau3@company.co.ke
- james.ochieng4@company.co.ke
```

**All test accounts use the same password: `Password123!`**

---

## Attendance Data Details

### Date Range

- **Start:** July 1, 2024
- **End:** February 16, 2025
- **Total Days:** ~160 working days (excluding weekends)

### Check-in/Check-out Times

Based on assigned shifts:

| Shift | Hours | Check-in Range | Check-out |
|-------|-------|----------------|-----------|
| Morning | 8:00-17:00 | 7:50-8:05 | 17:00 |
| Standard | 9:00-18:00 | 8:50-9:05 | 18:00 |
| Late | 10:00-19:00 | 9:50-10:05 | 19:00 |
| Half Day | 9:00-13:00 | 8:50-9:00 | 13:00 |

### Late Arrivals

Late employees check in 15-60 minutes after their shift start time.

### Location Data

- Coordinates stored as `POINT(longitude latitude)`
- Branch radius: 100-200 meters
- Location verification uses distance calculation

---

## How Attendance is Generated

For each working day and each employee:

1. **Check if holiday** → Mark as `holiday`
2. **Random roll for attendance status:**
   - 0-3%: `absent` (no check-in/out)
   - 3-5%: `leave` (no check-in/out)
   - 5-15%: `late` (check-in 15-60 min late)
   - 15-17%: `half_day` (check-out at 13:00)
   - 17-100%: `present` (normal hours)
3. **Generate location coordinates** near branch
4. **Set location_verified** (90-95% true)

---

## Warnings

⚠️ **This script DELETES all existing data!**

The seeder clears the following tables before inserting new data:

- attendance
- leave_history
- leave_types
- shift_timings
- staff
- users
- departments
- holidays
- branches
- roles

**Do not run this on a production database!**

---

## Troubleshooting

### Error: Connection refused

Ensure your database is running and `.env` file is configured:

```bash
# Check .env file
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=hr_management_system
```

### Error: Table doesn't exist

Run migrations first:

```bash
# Run your migration script
node scripts/setup.js
```

### Seeder is slow

The attendance seeding creates ~7,000+ records. This is normal and takes 1-2 minutes.

### Duplicate email errors

The seeder clears all data before inserting. If you see duplicate errors, ensure the database was properly cleared.

---

## Customization

### Add More Employees

```typescript
const CONFIG = {
  // ...
  numEmployees: 200, // Increase from 50 to 200
};
```

### Change Date Range

```typescript
const CONFIG = {
  startDate: '2024-01-01', // Start from January
  endDate: '2025-12-31',   // Through end of 2025
};
```

### Add More Branches

Edit `BRANCH_DATA` array:

```typescript
const BRANCH_DATA = [
  // Existing branches...
  { 
    name: 'Thika Branch', 
    code: 'THI', 
    city: 'Thika', 
    coords: { lng: 37.0693, lat: -1.0332 } 
  },
];
```

### Change Attendance Patterns

Edit the probability thresholds in `seedAttendance()`:

```typescript
if (rand < 0.05) {
  // Increase from 3% to 5%
  status = 'absent';
}
```

---

## Verify Seeded Data

After seeding, verify the data:

```sql
-- Check record counts
SELECT 
  'branches' as table_name, COUNT(*) as count FROM branches
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'staff', COUNT(*) FROM staff
UNION ALL
SELECT 'attendance', COUNT(*) FROM attendance
UNION ALL
SELECT 'holidays', COUNT(*) FROM holidays;

-- Check attendance distribution
SELECT 
  status, 
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM attendance), 2) as percentage
FROM attendance
GROUP BY status
ORDER BY count DESC;

-- Check date range
SELECT 
  MIN(date) as earliest_date,
  MAX(date) as latest_date,
  COUNT(DISTINCT date) as unique_days
FROM attendance;
```

---

## Related Files

- **Seeder Script:** `scripts/seed-database.ts`
- **Attendance API:** `src/api/attendance.route.ts`
- **Branch Model:** `src/models/branch.model.ts`
- **Attendance Model:** `src/models/attendance.model.ts`

---

## Next Steps

After seeding:

1. **Test attendance check-in/out**
   ```bash
   curl -X POST http://localhost:3000/api/attendance/check-in \
     -H 'Authorization: Bearer YOUR_TOKEN' \
     -H 'Content-Type: application/json' \
     -d '{"date": "2025-02-16", "check_in_time": "09:00:00"}'
   ```

2. **View attendance reports**
   - Use the admin account to view all records
   - Test monthly reports
   - Check attendance summaries

3. **Test location verification**
   - Use coordinates near branch locations
   - Verify `location_verified` flag

4. **Test leave management**
   - Apply for leave
   - Approve/reject leave requests
   - Check leave balance

---

## Support

For issues or questions about the seeder, check:

- Database configuration in `.env`
- MySQL/MariaDB version compatibility
- Node.js version (requires Node 14+)
- TypeScript compilation errors
