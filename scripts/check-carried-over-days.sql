-- ============================================
-- CHECK CARRIED OVER DAYS ISSUE
-- ============================================
-- This will show if carried_over_days has incorrect values
-- ============================================

SET @USER_ID = 1; -- CHANGE TO YOUR USER ID

SELECT 
    '=== CURRENT ALLOCATIONS WITH CARRIED OVER DAYS ===' as '';

SELECT 
    la.id,
    la.user_id,
    la.leave_type_id,
    lt.name as leave_type_name,
    la.allocated_days,
    la.used_days,
    la.carried_over_days,
    (la.allocated_days + la.carried_over_days) as total_available,
    la.allocated_days + la.carried_over_days - la.used_days as remaining_without_pending,
    la.cycle_start_date,
    la.cycle_end_date,
    CASE 
        WHEN la.carried_over_days > 0 THEN '⚠️ HAS CARRIED OVER'
        ELSE '✓ No carried over'
    END as carried_status
FROM leave_allocations la
LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
WHERE la.user_id = @USER_ID
  AND la.cycle_end_date >= CURDATE()
ORDER BY la.leave_type_id;

-- ============================================
-- FIX: Reset carried_over_days to 0 if incorrect
-- ============================================
-- Uncomment ONLY if you want to reset all carried_over_days to 0

-- UPDATE leave_allocations 
-- SET carried_over_days = 0.00
-- WHERE user_id = @USER_ID
--   AND carried_over_days > 0;

-- ============================================
-- CHECK PENDING REQUESTS
-- ============================================

SELECT 
    '=== PENDING REQUESTS AFFECTING BALANCE ===' as '';

SELECT 
    lr.id,
    lr.leave_type_id,
    lt.name as leave_type_name,
    lr.start_date,
    lr.end_date,
    lr.days_requested,
    lr.status,
    CONCAT('Reducing balance by ', lr.days_requested, ' days') as impact
FROM leave_requests lr
LEFT JOIN leave_types lt ON lr.leave_type_id = lt.id
WHERE lr.user_id = @USER_ID 
  AND lr.status IN ('submitted', 'pending')
ORDER BY lr.leave_type_id;

-- ============================================
-- SHOW WHAT BALANCE SHOULD BE
-- ============================================

SELECT 
    '=== EXPECTED BALANCE CALCULATION ===' as '';

SELECT 
    lt.name as leave_type_name,
    COALESCE(la.allocated_days, 0) as allocated,
    COALESCE(la.carried_over_days, 0) as carried_over,
    COALESCE(la.used_days, 0) as used,
    COALESCE(pending.pending_days, 0) as pending,
    CONCAT(
        COALESCE(la.allocated_days, 0) + COALESCE(la.carried_over_days, 0),
        ' - ',
        COALESCE(la.used_days, 0),
        ' - ',
        COALESCE(pending.pending_days, 0),
        ' = ',
        GREATEST(0, COALESCE(la.allocated_days, 0) + COALESCE(la.carried_over_days, 0) - COALESCE(la.used_days, 0) - COALESCE(pending.pending_days, 0))
    ) as calculation,
    GREATEST(0, COALESCE(la.allocated_days, 0) + COALESCE(la.carried_over_days, 0) - COALESCE(la.used_days, 0) - COALESCE(pending.pending_days, 0)) as expected_remaining
FROM leave_types lt
LEFT JOIN leave_allocations la ON lt.id = la.leave_type_id 
    AND la.user_id = @USER_ID 
    AND la.cycle_end_date >= CURDATE()
LEFT JOIN (
    SELECT 
        leave_type_id,
        SUM(days_requested) as pending_days
    FROM leave_requests
    WHERE user_id = @USER_ID AND status IN ('submitted', 'pending')
    GROUP BY leave_type_id
) pending ON lt.id = pending.leave_type_id
WHERE lt.is_active = true
ORDER BY lt.id;
