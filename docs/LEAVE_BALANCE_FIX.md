# Leave Balance Fix - Complete Guide

## 🔴 The Problem

Your leave balances were showing **incorrect values** where `remaining_days > allocated_days`:

```
Annual Leave    25 / 21    days remaining  ❌ (How can you have 25 remaining when only 21 allocated?)
Sick Leave      15 / 14    days remaining  ❌
Compassionate   6 / 5      days remaining  ❌
```

## 🔍 Root Cause

The **seed script** (`Backend/scripts/seed-database.ts`) was adding **random `carried_over_days`** (0-5 days) to each allocation:

```typescript
// ❌ WRONG CODE (line 979 in seed-database.ts)
if (year > 2025 && joinDate.getFullYear() < year) {
  carriedOverDays = Math.floor(Math.random() * 5); // Random 0-5 days!
}
```

This caused:
- **Annual Leave**: 21 allocated + 4 random carried over = 25 total (WRONG!)
- **Sick Leave**: 14 allocated + 1 random carried over = 15 total (WRONG!)

## ✅ The Fix

### Option 1: Run Migration Script (Recommended)

```bash
# Navigate to backend
cd /home/frobenius/Desktop/Femtech/HR/Backend

# Run the migration
mysql -u root -p hr_db < migrations/092_fix_leave_allocations_carryover.sql
```

**What this does:**
1. ✅ Resets ALL `carried_over_days` to 0
2. ✅ Recalculates `used_days` from actual approved leave requests
3. ✅ Shows verification report
4. ✅ Safe to run multiple times

### Option 2: Manual SQL Fix

```sql
-- 1. Reset carried over days
UPDATE leave_allocations 
SET carried_over_days = 0.00
WHERE cycle_end_date >= CURDATE();

-- 2. Recalculate used days
UPDATE leave_allocations la
LEFT JOIN (
    SELECT user_id, leave_type_id, SUM(days_requested) as total_used
    FROM leave_requests
    WHERE status = 'approved'
    GROUP BY user_id, leave_type_id
) used ON la.user_id = used.user_id AND la.leave_type_id = used.leave_type_id
SET la.used_days = COALESCE(used.total_used, 0.00)
WHERE cycle_end_date >= CURDATE();

-- 3. Verify
SELECT 
    lt.name,
    la.allocated_days,
    la.used_days,
    la.carried_over_days,
    la.allocated_days - la.used_days as remaining
FROM leave_allocations la
LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
WHERE la.cycle_end_date >= CURDATE();
```

### Option 3: Re-seed Database (Nuclear Option)

If you want to start fresh:

```bash
# 1. Fix the seed script first (already done)
# The script now has: carriedOverDays = 0; // No random days!

# 2. Re-run the seed
cd Backend
npm run seed

# 3. This will:
# - Clear all transactional data (including leave_allocations)
# - Recreate allocations with CORRECT values (0 carried over days)
```

## 📊 Expected Result After Fix

```
Annual Leave      16 / 21    days remaining  ✅
Sick Leave        12 / 14    days remaining  ✅
Personal Leave     0 / 5     days remaining  ✅ (with 16 pending)
Maternity Leave   80 / 90    days remaining  ✅
Paternity Leave   14 / 14    days remaining  ✅
Compassionate      5 / 5     days remaining  ✅
Study Leave       30 / 30    days remaining  ✅
```

**Formula:**
```
Remaining = Allocated - Used - Pending
```

## 🧪 Testing

### 1. Check Backend Logs

After running the fix, refresh the Leave page and check logs:

```
[Leave Balance] Fetching balances for user 1
[Leave Balance] Found 7 leave types
[Leave Balance] Found 7 allocations for user 1
[Leave Balance] "Annual Leave" allocation: { allocated: 21, used: 5, carried: 0, pending: 0 }
[Leave Balance] "Annual Leave" calculation: 21 - 5 - 0 = 16  ✅
```

### 2. Verify in Database

```sql
SELECT 
    lt.name,
    la.allocated_days,
    la.used_days,
    la.carried_over_days,
    la.allocated_days - la.used_days as remaining
FROM leave_allocations la
LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
WHERE la.user_id = YOUR_USER_ID
  AND la.cycle_end_date >= CURDATE();
```

### 3. Test API Directly

```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your.email@example.com","password":"Password123!"}' \
  | jq -r '.data.tokens.accessToken')

# Test balance endpoint
curl -s http://localhost:3000/api/leave/balance \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data.balances[] | {name: .leave_type_name, allocated: .allocated_days, remaining: .remaining_days}'
```

## 🔧 Prevention

### Seed Script Fixed ✅

The seed script has been updated to **NOT** add random carried over days:

```typescript
// ✅ CORRECT CODE (line 970)
let carriedOverDays = 0; // DO NOT add random carried over days
```

### Future Carry Over

If you want to properly carry over unused days:

1. **Run at end of year** (Dec 31):
   ```sql
   -- Calculate unused days from current year
   UPDATE leave_allocations la
   SET carried_over_days = GREATEST(0, 
       la.allocated_days + la.carried_over_days - la.used_days
   )
   WHERE cycle_end_date = '2026-12-31';
   ```

2. **Create new year allocations** with carried over days:
   ```sql
   INSERT INTO leave_allocations 
     (user_id, leave_type_id, cycle_start_date, cycle_end_date, 
      allocated_days, carried_over_days, used_days)
   SELECT 
     user_id, leave_type_id, 
     '2027-01-01', '2027-12-31',
     lt.days_per_year,
     la.carried_over_days, -- Carry over from previous year
     0
   FROM leave_allocations la
   LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
   WHERE la.cycle_end_date = '2026-12-31';
   ```

## 📝 Files Changed

1. ✅ `Backend/scripts/seed-database.ts` - Fixed random carried_over_days
2. ✅ `Backend/migrations/092_fix_leave_allocations_carryover.sql` - Migration to fix existing data
3. ✅ `Backend/src/api/leave-request.route.ts` - Added debug logging
4. ✅ `Backend/docs/LEAVE_BALANCE_GUIDE.md` - Complete documentation
5. ✅ `Backend/scripts/fix-leave-balances.sql` - Quick fix script
6. ✅ `Backend/scripts/check-leave-allocations.sql` - Debug queries

## 🆘 Troubleshooting

### Issue: Balances still wrong after fix

**Solution:**
```bash
# 1. Check if migration ran
mysql -u root -p hr_db -e "SELECT * FROM leave_allocations WHERE carried_over_days > 0;"

# 2. If still has values, run again
mysql -u root -p hr_db < migrations/092_fix_leave_allocations_carryover.sql

# 3. Clear browser cache and refresh
```

### Issue: "Table doesn't exist" error

**Solution:**
```bash
# Run migrations first
cd Backend
npm run migrate
```

### Issue: Seed script fails

**Solution:**
```bash
# Check database connection
cd Backend
npm run db:test

# If fails, update .env
# DATABASE_URL=mysql://user:password@localhost:3306/hr_db
```

## ✅ Verification Checklist

After running the fix, verify:

- [ ] All `carried_over_days` = 0
- [ ] `remaining_days` ≤ `allocated_days` for all leave types
- [ ] Pending requests are deducted from balance
- [ ] Backend logs show correct calculation
- [ ] Frontend displays correct values
- [ ] No console errors

---

**Last Updated:** 2026-03-13  
**Migration Number:** 092  
**Status:** ✅ Ready to Deploy
