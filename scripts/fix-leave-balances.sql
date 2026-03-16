-- ============================================
-- COMPLETE LEAVE BALANCE FIX
-- ============================================
-- Run this script to fix all leave balance issues
-- ============================================

SET @USER_ID = 1; -- CHANGE THIS TO YOUR USER ID

-- ============================================
-- STEP 1: Check Current State
-- ============================================

SELECT '=== BEFORE FIX ===' as '';
SELECT 
    lt.name,
    la.allocated_days,
    la.used_days,
    la.carried_over_days,
    la.allocated_days + la.carried_over_days - la.used_days as current_remaining
FROM leave_allocations la
LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
WHERE la.user_id = @USER_ID
  AND la.cycle_end_date >= CURDATE()
ORDER BY lt.id;

-- ============================================
-- STEP 2: Reset Carried Over Days to 0
-- ============================================
-- Most likely the issue is incorrect carried_over_days values

SELECT '=== RESETTING CARRIED OVER DAYS ===' as '';

UPDATE leave_allocations 
SET carried_over_days = 0.00
WHERE user_id = @USER_ID
  AND cycle_end_date >= CURDATE();

-- ============================================
-- STEP 3: Recalculate Used Days from Approved Requests
-- ============================================
-- This ensures used_days matches actual approved leave

SELECT '=== RECALCULATING USED DAYS ===' as '';

-- For each leave type, update used_days based on approved requests
UPDATE leave_allocations la
LEFT JOIN (
    SELECT 
        leave_type_id,
        SUM(days_requested) as total_used
    FROM leave_requests
    WHERE user_id = @USER_ID 
      AND status = 'approved'
    GROUP BY leave_type_id
) used ON la.leave_type_id = used.leave_type_id
SET la.used_days = COALESCE(used.total_used, 0.00)
WHERE la.user_id = @USER_ID
  AND la.cycle_end_date >= CURDATE();

-- ============================================
-- STEP 4: Verify the Fix
-- ============================================

SELECT '=== AFTER FIX ===' as '';
SELECT 
    lt.name as leave_type,
    la.allocated_days,
    la.used_days,
    la.carried_over_days,
    (SELECT COALESCE(SUM(days_requested), 0) 
     FROM leave_requests 
     WHERE user_id = @USER_ID 
       AND status IN ('submitted', 'pending')
       AND leave_type_id = la.leave_type_id) as pending_days,
    la.allocated_days + la.carried_over_days - la.used_days as remaining,
    CASE 
        WHEN la.allocated_days >= la.used_days THEN '✓ OK'
        ELSE '⚠️ ISSUE'
    END as status
FROM leave_allocations la
LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
WHERE la.user_id = @USER_ID
  AND la.cycle_end_date >= CURDATE()
ORDER BY lt.id;

-- ============================================
-- STEP 5: Expected Display After Fix
-- ============================================

SELECT '=== EXPECTED FRONTEND DISPLAY ===' as '';
SELECT 
    CONCAT(
        lt.name, ': ',
        GREATEST(0, la.allocated_days + COALESCE(la.carried_over_days, 0) - la.used_days - COALESCE(pending.pending_days, 0)),
        ' / ',
        la.allocated_days,
        ' days remaining'
    ) as expected_display
FROM leave_allocations la
LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
LEFT JOIN (
    SELECT 
        leave_type_id,
        SUM(days_requested) as pending_days
    FROM leave_requests
    WHERE user_id = @USER_ID 
      AND status IN ('submitted', 'pending')
    GROUP BY leave_type_id
) pending ON la.leave_type_id = pending.leave_type_id
WHERE la.user_id = @USER_ID
  AND la.cycle_end_date >= CURDATE()
ORDER BY lt.id;
