# Database Seeding Guide

## Overview

This guide explains the enhanced database seeding system that populates the HR App with realistic test data spanning from **2024-01-01 to 2026-02-28**.

## What's New

### Extended Date Range
- **Previous:** 2024-07-01 to 2025-02-16 (~7 months)
- **New:** 2024-01-01 to 2026-02-28 (~2 years 2 months)

### New Seeded Data

#### 1. Leave Allocations (NEW)
- Creates allocations for **2024, 2025, and 2026**
- Pro-rated allocations for employees who joined mid-year
- Carried-over days from previous year (0-5 days random)
- Used days calculated from approved leave requests

#### 2. Forms (NEW)
Five different form types are created:
- **Employee Feedback Form** - Submit workplace feedback
- **IT Support Request** - Request IT help
- **Training Request Form** - Request training approval
- **Remote Work Request** - Request to work from home
- **Performance Appraisal** - Annual/mid-year reviews

#### 3. Form Submissions (NEW)
- 5-15 submissions per form
- Various statuses (submitted, under_review, approved, rejected)
- Realistic submission data based on form type
- 30% of submissions have attachments

#### 4. Leave Request Attachments (NEW)
- 40% of leave requests have attachments
- Uses unified `form_attachments` table
- Medical certificates, supporting documents, doctor's notes

### Enhanced Holidays
- Complete Kenyan public holidays for **2024, 2025, and 2026**
- Includes all major holidays (New Year, Good Friday, Easter, Labour Day, Madaraka, Mashujaa, Jamhuri, Christmas, Boxing Day)

### Enhanced Leave Requests
- **2-5 requests per employee** (increased from 1-3)
- Dates span the full range (2024-2026)
- Better distribution of statuses

## Running the Seed Script

### Prerequisites
1. Database must be migrated first
2. MySQL server running
3. Database credentials configured in `.env`

### Commands

```bash
# Run the seed script
npm run seed

# Or using pnpm
pnpm seed
```

### What Gets Seeded

```
📈 Database Summary:
   branches                 : 5 records
   users                    : 50+ records
   staff                    : 50+ records
   departments              : 6 records
   holidays                 : 33 records (2024-2026)
   shift_timings            : 50+ records
   attendance               : 10,000+ records
   leave_types              : 4+ records
   leave_allocations        : 600+ records (50 employees × 3 leave types × 3 years)
   leave_requests           : 150+ records
   leave_history            : 50+ records
   forms                    : 5 records
   form_submissions         : 50+ records
   form_attachments         : 100+ records
```

## Data Structure

### Leave Allocations

Each active employee gets allocations for each year they were employed:

```typescript
{
  user_id: 123,
  leave_type_id: 1,  // Annual Leave
  year: 2025,
  allocated_days: 21,
  carried_over_days: 3,  // From previous year
  used_days: 5,          // Calculated from approved requests
  expiry_date: '2026-03-31'
}
```

### Forms Structure

```
Form: "Training Request Form"
├── Fields:
│   ├── Training Type (select)
│   ├── Training Name (text)
│   ├── Provider (text)
│   ├── Start Date (date)
│   ├── End Date (date)
│   ├── Estimated Cost (number)
│   ├── Justification (textarea)
│   └── Brochure/Link (file)
└── Submissions:
    ├── Submission #1 (approved) - with 2 attachments
    ├── Submission #2 (pending)
    └── Submission #3 (rejected)
```

### Attachments

All attachments use the unified `form_attachments` table:

```sql
-- For leave requests
INSERT INTO form_attachments (leave_request_id, file_name, file_path, ...)
VALUES (123, 'medical_cert.pdf', '/uploads/attachments/leave_123_file_1.pdf', ...);

-- For form submissions
INSERT INTO form_attachments (form_submission_id, field_id, file_name, file_path, ...)
VALUES (456, 3, 'document.pdf', '/uploads/attachments/sample_file_10.pdf', ...);
```

## Testing the Data

### 1. Test Leave Request with Attachments

```bash
# Submit a leave request with files
curl -X POST http://localhost:3000/api/leave \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "leave_type_id=1" \
  -F "start_date=2026-03-15" \
  -F "end_date=2026-03-20" \
  -F "reason=Medical appointment" \
  -F "files=@/path/to/medical_cert.pdf"
```

### 2. View Leave Allocations

```sql
SELECT 
  u.full_name,
  lt.name as leave_type,
  la.year,
  la.allocated_days,
  la.carried_over_days,
  la.used_days,
  (la.allocated_days + la.carried_over_days - la.used_days) as remaining_days
FROM leave_allocations la
JOIN users u ON la.user_id = u.id
JOIN leave_types lt ON la.leave_type_id = lt.id
WHERE u.id = 123 AND la.year = 2025;
```

### 3. View Form Submissions with Attachments

```sql
SELECT 
  f.name as form_name,
  u.full_name,
  fs.status,
  fs.submitted_at,
  COUNT(fa.id) as attachment_count
FROM form_submissions fs
JOIN forms f ON fs.form_id = f.id
JOIN users u ON fs.user_id = u.id
LEFT JOIN form_attachments fa ON fs.id = fa.form_submission_id
GROUP BY fs.id;
```

### 4. View Leave Requests with Attachments

```sql
SELECT 
  lr.id,
  u.full_name,
  lt.name as leave_type,
  lr.start_date,
  lr.end_date,
  lr.days_requested,
  lr.status,
  COUNT(fa.id) as attachments_count
FROM leave_requests lr
JOIN users u ON lr.user_id = u.id
JOIN leave_types lt ON lr.leave_type_id = lt.id
LEFT JOIN form_attachments fa ON lr.id = fa.leave_request_id
WHERE lr.status IN ('submitted', 'approved')
GROUP BY lr.id;
```

## Test Accounts

All seeded employees use the same password:
```
Password: Password123!
```

To find test user credentials:
```sql
SELECT u.id, u.full_name, u.email, s.employee_id
FROM users u
JOIN staff s ON u.id = s.user_id
WHERE u.status = 'active'
LIMIT 10;
```

## Data Relationships

```
users (50+)
├── staff (50+)
│   └── attendance (10,000+)
├── leave_requests (150+)
│   └── form_attachments (100+)
├── leave_allocations (600+)
├── form_submissions (50+)
│   └── form_attachments (50+)
└── departments (6)

leave_types (4+)
├── leave_requests
└── leave_allocations

forms (5)
├── form_fields (25+)
└── form_submissions (50+)
    └── form_attachments (50+)
```

## Troubleshooting

### Seed Script Fails

1. **Check database connection:**
   ```bash
   mysql -u your_user -p your_database
   ```

2. **Clear existing data:**
   The script automatically clears data before seeding, but you can manually truncate:
   ```sql
   SET FOREIGN_KEY_CHECKS = 0;
   TRUNCATE form_attachments;
   TRUNCATE form_submissions;
   TRUNCATE forms;
   TRUNCATE leave_allocations;
   TRUNCATE leave_requests;
   -- ... etc
   SET FOREIGN_KEY_CHECKS = 1;
   ```

3. **Check migration status:**
   Ensure all migrations have been run:
   ```bash
   npm run migrate
   ```

### Missing Data

If certain tables are empty:
1. Check the seed script output for errors
2. Verify the table exists in the database
3. Check foreign key constraints

### Attachments Not Showing

1. Verify `form_attachments` table has `leave_request_id` column
2. Check file paths exist in `uploads/attachments/` directory
3. Ensure migration 011 was run successfully

## Performance Notes

- **Attendance seeding** is the slowest operation (10,000+ records)
- Uses batch inserts (1000 records at a time) for performance
- Total seeding time: ~30-60 seconds depending on hardware

## Customization

To modify the seed data:

1. **Change date range:**
   ```typescript
   const CONFIG = {
     startDate: '2024-01-01',
     endDate: '2026-02-28',
   };
   ```

2. **Change number of employees:**
   ```typescript
   const CONFIG = {
     numEmployees: 100,  // Increase for more data
   };
   ```

3. **Add more forms:**
   Add to the `formTypes` array in `seedForms()` function

4. **Adjust attachment probability:**
   ```typescript
   if (Math.random() < 0.5) {  // Change 0.5 for higher/lower chance
   ```

## Next Steps

After seeding:
1. Test the leave request flow with attachments
2. Test form submission with file uploads
3. Verify leave balances and allocations
4. Test approval workflows
5. Check analytics and reporting features
