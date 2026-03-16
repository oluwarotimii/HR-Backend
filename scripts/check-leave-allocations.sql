-- ============================================
-- LEAVE BALANCE DEBUGGING SCRIPT
-- ============================================
-- Run this to check the current state of leave allocations
-- ============================================

-- 1. Check all leave types
SELECT '=== LEAVE TYPES ===' as '';
SELECT 
    id,
    name,
    days_per_year,
    is_paid,
    allow_carryover,
    carryover_limit,
    is_active
FROM leave_types
ORDER BY id;

-- 2. Check allocations for a specific user (replace USER_ID with actual user ID)
-- Replace USER_ID with the actual user ID (e.g., 1, 2, etc.)
SET @USER_ID = 1; -- CHANGE THIS TO YOUR USER ID

SELECT '=== LEAVE ALLOCATIONS FOR USER ===' as '';
SELECT 
    la.id,
    la.user_id,
    la.leave_type_id,
    lt.name as leave_type_name,
    la.cycle_start_date,
    la.cycle_end_date,
    la.allocated_days,
    la.used_days,
    la.carried_over_days,
    (la.allocated_days + la.carried_over_days - la.used_days) as calculated_remaining,
    DATEDIFF(la.cycle_end_date, CURDATE()) as days_until_expiry
FROM leave_allocations la
LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
WHERE la.user_id = @USER_ID
ORDER BY la.leave_type_id, la.cycle_start_date DESC;

-- 3. Check if there are ANY allocations in the database
SELECT '=== ALL ALLOCATIONS (Sample) ===' as '';
SELECT 
    la.id,
    la.user_id,
    la.leave_type_id,
    lt.name as leave_type_name,
    la.allocated_days,
    la.used_days,
    la.carried_over_days,
    la.cycle_start_date,
    la.cycle_end_date
FROM leave_allocations la
LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
ORDER BY la.created_at DESC
LIMIT 20;

-- 4. Check pending leave requests for user
SELECT '=== PENDING LEAVE REQUESTS ===' as '';
SELECT 
    lr.id,
    lr.user_id,
    lr.leave_type_id,
    lt.name as leave_type_name,
    lr.start_date,
    lr.end_date,
    lr.days_requested,
    lr.status
FROM leave_requests lr
LEFT JOIN leave_types lt ON lr.leave_type_id = lt.id
WHERE lr.user_id = @USER_ID 
  AND lr.status IN ('submitted', 'pending')
ORDER BY lr.created_at DESC;

-- 5. Check approved leave requests (used days)
SELECT '=== APPROVED LEAVE REQUESTS (Used Days) ===' as '';
SELECT 
    lr.leave_type_id,
    lt.name as leave_type_name,
    COUNT(*) as request_count,
    SUM(lr.days_requested) as total_used_days
FROM leave_requests lr
LEFT JOIN leave_types lt ON lr.leave_type_id = lt.id
WHERE lr.user_id = @USER_ID 
  AND lr.status = 'approved'
GROUP BY lr.leave_type_id, lt.name;

-- 6. Find users without allocations
SELECT '=== USERS WITHOUT LEAVE ALLOCATIONS ===' as '';
SELECT 
    u.id,
    u.full_name,
    u.email,
    u.status
FROM users u
LEFT JOIN leave_allocations la ON u.id = la.user_id
WHERE la.id IS NULL
  AND u.status = 'active'
ORDER BY u.id;

-- ============================================
-- FIX SCRIPT: Create missing allocations
-- ============================================
-- Uncomment and run this section to create allocations for all active users
-- ============================================

-- -- Create Annual Leave allocations for all active users (21 days)
-- INSERT INTO leave_allocations (user_id, leave_type_id, cycle_start_date, cycle_end_date, allocated_days, used_days, carried_over_days)
-- SELECT 
--     u.id as user_id,
--     1 as leave_type_id, -- Annual Leave (change if different ID)
--     '2026-01-01' as cycle_start_date,
--     '2026-12-31' as cycle_end_date,
--     21.00 as allocated_days,
--     0.00 as used_days,
--     0.00 as carried_over_days
-- FROM users u
-- WHERE u.status = 'active'
--   AND NOT EXISTS (
--     SELECT 1 FROM leave_allocations la 
--     WHERE la.user_id = u.id 
--       AND la.leave_type_id = 1
--       AND la.cycle_end_date >= CURDATE()
--   );

-- -- Create Sick Leave allocations for all active users (14 days)
-- INSERT INTO leave_allocations (user_id, leave_type_id, cycle_start_date, cycle_end_date, allocated_days, used_days, carried_over_days)
-- SELECT 
--     u.id as user_id,
--     2 as leave_type_id, -- Sick Leave (change if different ID)
--     '2026-01-01' as cycle_start_date,
--     '2026-12-31' as cycle_end_date,
--     14.00 as allocated_days,
--     0.00 as used_days,
--     0.00 as carried_over_days
-- FROM users u
-- WHERE u.status = 'active'
--   AND NOT EXISTS (
--     SELECT 1 FROM leave_allocations la 
--     WHERE la.user_id = u.id 
--       AND la.leave_type_id = 2
--       AND la.cycle_end_date >= CURDATE()
--   );

-- -- Repeat for other leave types as needed...

-- ============================================
-- VERIFY FIX
-- ============================================
-- After running the fix, verify allocations were created

-- SELECT '=== VERIFICATION: Allocations Created ===' as '';
-- SELECT 
--     la.user_id,
--     u.full_name,
--     COUNT(*) as allocation_count,
--     GROUP_CONCAT(lt.name SEPARATOR ', ') as leave_types
-- FROM leave_allocations la
-- LEFT JOIN users u ON la.user_id = u.id
-- LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
-- GROUP BY la.user_id, u.full_name
-- ORDER BY la.user_id;
