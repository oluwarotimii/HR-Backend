# Leave Balance System - Complete Guide

## Overview

The leave balance system tracks how many leave days each employee has available for each leave type (Annual, Sick, Personal, etc.).

---

## Database Schema

### Tables Involved

1. **`leave_types`** - Defines leave categories
   - `id`: Primary key
   - `name`: "Annual Leave", "Sick Leave", etc.
   - `days_per_year`: Default allocation (e.g., 21.00)
   - `allow_carryover`: Can unused days roll over?
   - `carryover_limit`: Max days that can roll over

2. **`leave_allocations`** - Tracks allocations per user per leave type
   - `id`: Primary key
   - `user_id`: Employee ID
   - `leave_type_id`: Reference to leave_types
   - `cycle_start_date`: Start of leave year (e.g., 2026-01-01)
   - `cycle_end_date`: End of leave year (e.g., 2026-12-31)
   - `allocated_days`: Total days allocated for this cycle
   - `used_days`: Days already taken
   - `carried_over_days`: Days rolled over from previous cycle

3. **`leave_requests`** - Leave applications by employees
   - `id`: Primary key
   - `user_id`: Employee ID
   - `leave_type_id`: Type of leave
   - `start_date`, `end_date`: Leave period
   - `days_requested`: Number of days
   - `status`: 'submitted', 'approved', 'rejected', 'cancelled'

---

## Balance Calculation Formula

```
Remaining Days = (Allocated Days + Carried Over Days) - Used Days - Pending Days
```

Where:
- **Allocated Days**: Days given for current cycle (e.g., 21 for Annual Leave)
- **Carried Over Days**: Unused days from previous cycle (if allowed)
- **Used Days**: Days already taken (approved requests)
- **Pending Days**: Days in submitted but not yet approved requests

---

## API Flow

### Frontend Request
```
GET /api/leave/balance
Headers: Authorization: Bearer <token>
```

### Backend Process

1. **Get User ID** from JWT token
2. **Fetch All Leave Types** (Annual, Sick, etc.)
3. **Fetch User's Allocations** from `leave_allocations` table
4. **Fetch Pending Requests** from `leave_requests` table
5. **Calculate Balance** for each leave type:
   ```javascript
   const totalAvailable = allocated_days + carried_over_days;
   const remainingDays = totalAvailable - used_days - pending_days;
   ```
6. **Return Response**:
   ```json
   {
     "success": true,
     "data": {
       "balances": [
         {
           "leave_type_id": 1,
           "leave_type_name": "Annual Leave",
           "allocated_days": 21.00,
           "used_days": 5.00,
           "carried_over_days": 0.00,
           "pending_days": 2.00,
           "remaining_days": 14.00
         }
       ]
     }
   }
   ```

---

## Common Issues & Solutions

### Issue 1: Balance Shows 0 or Empty

**Symptoms:** Frontend shows "/ 21.00 days remaining" (allocated shows but remaining is blank)

**Cause:** No allocations exist in the database for this user

**Solution:**
```sql
-- Check if allocations exist
SELECT * FROM leave_allocations WHERE user_id = YOUR_USER_ID;

-- If empty, create allocations
INSERT INTO leave_allocations 
  (user_id, leave_type_id, cycle_start_date, cycle_end_date, allocated_days, used_days, carried_over_days)
VALUES 
  (1, 1, '2026-01-01', '2026-12-31', 21.00, 0.00, 0.00);
```

### Issue 2: Used Days Not Updating

**Symptoms:** Employee takes leave but used_days stays at 0

**Cause:** Leave request approval not updating allocation

**Solution:** Check the leave approval logic in `leave-request.route.ts`:
- When a request is approved, it should call:
  ```javascript
  await LeaveAllocationModel.updateUsedDays(allocationId, daysRequested);
  ```

### Issue 3: Old/Expired Allocations

**Symptoms:** Balance calculation using wrong cycle

**Cause:** Multiple allocations exist, including expired ones

**Solution:** Backend filters by `cycle_end_date >= CURDATE()` but you should:
```sql
-- Check for expired allocations
SELECT * FROM leave_allocations 
WHERE user_id = YOUR_USER_ID 
  AND cycle_end_date < CURDATE();

-- Optionally archive or delete old allocations
```

---

## Debugging Steps

### Step 1: Check Backend Logs

When you call `/api/leave/balance`, the backend now logs:
```
[Leave Balance] Fetching balances for user 123
[Leave Balance] Found 7 leave types
[Leave Balance] Found 5 allocations for user 123
[Leave Balance] Leave type "Annual Leave": 1 active allocations
[Leave Balance] "Annual Leave" allocation: { allocated: 21, used: 5, carried: 0, pending: 2 }
[Leave Balance] "Annual Leave" calculation: 21 - 5 - 2 = 14
```

### Step 2: Run SQL Debug Script

```bash
# Edit the script with your user ID
nano Backend/scripts/check-leave-allocations.sql

# Run in MySQL
mysql -u root -p hr_db < Backend/scripts/check-leave-allocations.sql
```

### Step 3: Test API Directly

```bash
# Get token first
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Then test balance endpoint
curl http://localhost:3000/api/leave/balance \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Creating Allocations for All Users

### Option 1: Using the API (Recommended)

```typescript
// Admin endpoint to create allocations
POST /api/leave/allocations/bulk
{
  "leave_type_id": 1,
  "allocated_days": 21,
  "cycle_start_date": "2026-01-01",
  "cycle_end_date": "2026-12-31",
  "carried_over_days": 0
}
```

### Option 2: Direct SQL

```sql
-- Annual Leave for all active users
INSERT INTO leave_allocations 
  (user_id, leave_type_id, cycle_start_date, cycle_end_date, allocated_days, used_days, carried_over_days)
SELECT 
  u.id,
  1, -- Annual Leave ID
  '2026-01-01',
  '2026-12-31',
  21.00,
  0.00,
  0.00
FROM users u
WHERE u.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM leave_allocations la 
    WHERE la.user_id = u.id AND la.leave_type_id = 1
  );
```

---

## Frontend Integration

### How the Frontend Uses Balances

```tsx
// LeaveManagementScreen.tsx
const balancesResponse = await leaveApi.getLeaveBalances();
setLeaveBalances(balancesResponse.data.balances);

// Display in UI
{leaveBalances.map((balance) => (
  <Card key={balance.leave_type_id}>
    <div>{balance.leave_type_name}</div>
    <div>{balance.remaining_days} / {balance.allocated_days}</div>
    <div>days remaining</div>
  </Card>
))}
```

### Expected Display

```
Annual Leave
14 / 21.00
days remaining

Sick Leave
12 / 14.00
days remaining
```

---

## Testing Checklist

- [ ] User has allocations in database
- [ ] Allocations have correct cycle dates (not expired)
- [ ] `allocated_days` > 0
- [ ] `used_days` updates when leave is approved
- [ ] `pending_days` includes submitted requests
- [ ] `remaining_days` calculation is correct
- [ ] Frontend displays balances correctly

---

## Quick Fix for Missing Allocations

If balances show as 0 or empty, run this SQL (adjust user_id and leave_type_id):

```sql
-- Fix for user ID 1, Annual Leave (type ID 1)
INSERT INTO leave_allocations 
  (user_id, leave_type_id, cycle_start_date, cycle_end_date, allocated_days, used_days, carried_over_days)
VALUES 
  (1, 1, '2026-01-01', '2026-12-31', 21.00, 0.00, 0.00)
ON DUPLICATE KEY UPDATE 
  allocated_days = 21.00;
```

---

## Contact & Support

If issues persist:
1. Check backend logs for `[Leave Balance]` messages
2. Run the debug SQL script
3. Verify database has allocations for the user
4. Test API endpoint directly with curl/Postman
