-- ============================================
-- MIGRATION: Fix Incorrect Leave Allocations
-- ============================================
-- Description: Resets incorrect carried_over_days values caused by seed script
-- Run Date: 2026-03-13
-- Issue: Seed script was adding random carried_over_days (0-5) causing incorrect balances
-- ============================================

-- IMPORTANT: Backup your database before running this!
-- mysqldump -u root -p hr_db > backup_before_fix.sql

-- ============================================
-- STEP 1: Show Current State
-- ============================================

SELECT '=== BEFORE FIX: Current Allocations with Carried Over Days ===' as status;

SELECT 
    la.user_id,
    u.full_name,
    lt.name as leave_type,
    la.allocated_days,
    la.used_days,
    la.carried_over_days,
    la.allocated_days + la.carried_over_days - la.used_days as current_remaining,
    la.cycle_start_date,
    la.cycle_end_date
FROM leave_allocations la
LEFT JOIN users u ON la.user_id = u.id
LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
WHERE la.carried_over_days > 0
  AND la.cycle_end_date >= CURDATE()
ORDER BY la.user_id, lt.id;

-- ============================================
-- STEP 2: Reset Carried Over Days to 0
-- ============================================
-- This fixes the root cause - seed script added random carried_over_days

SELECT '=== RESETTING: Setting all carried_over_days to 0 ===' as status;

UPDATE leave_allocations 
SET carried_over_days = 0.00,
    updated_at = CURRENT_TIMESTAMP
WHERE carried_over_days > 0
  AND cycle_end_date >= CURDATE();

SELECT 
    CONCAT(ROW_COUNT(), ' allocations updated') as result;

-- ============================================
-- STEP 3: Verify Used Days Match Approved Requests
-- ============================================
-- This ensures used_days is accurate

SELECT '=== VERIFYING: Recalculating used_days from approved requests ===' as status;

UPDATE leave_allocations la
LEFT JOIN (
    SELECT 
        user_id,
        leave_type_id,
        SUM(days_requested) as total_used
    FROM leave_requests
    WHERE status = 'approved'
    GROUP BY user_id, leave_type_id
) used ON la.user_id = used.user_id 
      AND la.leave_type_id = used.leave_type_id
SET la.used_days = COALESCE(used.total_used, 0.00),
    la.updated_at = CURRENT_TIMESTAMP
WHERE la.cycle_end_date >= CURDATE();

SELECT 
    CONCAT(ROW_COUNT(), ' allocations updated') as result;

-- ============================================
-- STEP 4: Verification Query
-- ============================================
-- Run this to verify the fix worked

SELECT '=== AFTER FIX: Verified Balances ===' as status;

SELECT 
    la.user_id,
    u.full_name,
    lt.name as leave_type,
    la.allocated_days,
    la.used_days,
    la.carried_over_days,
    (SELECT COALESCE(SUM(lr.days_requested), 0) 
     FROM leave_requests lr 
     WHERE lr.user_id = la.user_id 
       AND lr.leave_type_id = la.leave_type_id
       AND lr.status IN ('submitted', 'pending')) as pending_days,
    GREATEST(0, la.allocated_days + la.carried_over_days - la.used_days - (
        SELECT COALESCE(SUM(lr.days_requested), 0) 
        FROM leave_requests lr 
        WHERE lr.user_id = la.user_id 
          AND lr.leave_type_id = la.leave_type_id
          AND lr.status IN ('submitted', 'pending')
    )) as correct_remaining,
    CASE 
        WHEN la.allocated_days >= la.used_days AND la.carried_over_days = 0 THEN '✓ OK'
        WHEN la.carried_over_days > 0 THEN '⚠️ STILL HAS CARRIED OVER'
        ELSE '⚠️ CHECK'
    END as status
FROM leave_allocations la
LEFT JOIN users u ON la.user_id = u.id
LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
WHERE la.cycle_end_date >= CURDATE()
ORDER BY la.user_id, lt.id;

-- ============================================
-- STEP 5: Summary
-- ============================================

SELECT '=== SUMMARY ===' as status;

SELECT 
    COUNT(*) as total_allocations,
    SUM(CASE WHEN carried_over_days > 0 THEN 1 ELSE 0 END) as still_have_carried_over,
    SUM(CASE WHEN carried_over_days = 0 THEN 1 ELSE 0 END) as fixed_allocations,
    CONCAT('Fixed: ', SUM(CASE WHEN carried_over_days = 0 THEN 1 ELSE 0 END), ' / ', COUNT(*)) as progress
FROM leave_allocations
WHERE cycle_end_date >= CURDATE();

-- ============================================
-- DONE
-- ============================================

SELECT '✅ Migration complete! Refresh your browser to see correct balances.' as message;
