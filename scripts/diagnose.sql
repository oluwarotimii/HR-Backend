-- ============================================================
-- DIAGNOSE LATE ATTENDANCE ISSUE
-- 
-- Run these queries in order and share ALL output.
-- ============================================================

-- 1. LATE ATTENDANCE RECORDS
SELECT a.id, a.user_id, u.full_name AS employee,
       a.date, a.check_in_time, a.scheduled_start_time,
       a.is_late, a.status
FROM attendance a
JOIN users u ON u.id = a.user_id
WHERE a.status = 'late'
  AND a.date BETWEEN '2026-06-01' AND '2026-06-17'
ORDER BY a.date DESC, u.full_name
LIMIT 50;


-- 2. SHIFT EXCEPTIONS for same period
SELECT se.user_id, u.full_name AS employee,
       se.exception_date, se.exception_type,
       se.new_start_time, se.new_end_time,
       se.status AS exc_status
FROM shift_exceptions se
JOIN users u ON u.id = se.user_id
WHERE se.exception_date BETWEEN '2026-06-01' AND '2026-06-17'
  AND se.status = 'active'
ORDER BY se.exception_date DESC, u.full_name;


-- 3. USERS WHO HAVE EXCEPTIONS BUT ARE MARKED LATE (side-by-side)
SELECT a.date, a.user_id, u.full_name AS employee,
       a.check_in_time, a.scheduled_start_time,
       a.status AS att_status, a.is_late,
       se.exception_type, se.new_start_time, se.new_end_time,
       se.status AS exc_status
FROM attendance a
JOIN users u ON a.user_id = u.id
LEFT JOIN shift_exceptions se
    ON se.user_id = a.user_id
   AND se.exception_date = a.date
   AND se.status = 'active'
WHERE a.status = 'late'
  AND a.date BETWEEN '2026-06-01' AND '2026-06-17'
ORDER BY a.date DESC, u.full_name;


-- 4. USER SHIFT ASSIGNMENTS (to see their recurring schedules)
SELECT esa.user_id, u.full_name AS employee,
       st.name AS template_name, st.start_time, st.end_time,
       esa.custom_start_time, esa.custom_end_time,
       esa.effective_from, esa.effective_to,
       esa.status AS assignment_status
FROM employee_shift_assignments esa
JOIN users u ON u.id = esa.user_id
LEFT JOIN shift_templates st ON st.id = esa.shift_template_id
WHERE esa.user_id IN (
    SELECT DISTINCT user_id FROM attendance
    WHERE status = 'late' AND date BETWEEN '2026-06-01' AND '2026-06-17'
)
ORDER BY u.full_name, esa.effective_from DESC;



-- 5. SPECIFIC EXAMPLE: Aderibigbe Victoria (if name contains "Aderibigbe")
SELECT a.date, u.full_name AS employee,
       a.check_in_time, a.scheduled_start_time,
       a.status, a.is_late,
       se.exception_type, se.new_start_time, se.new_end_time
FROM attendance a
JOIN users u ON u.id = a.user_id
LEFT JOIN shift_exceptions se
    ON se.user_id = a.user_id
   AND se.exception_date = a.date
   AND se.status = 'active'
WHERE u.full_name LIKE '%Aderibigbe%'
  AND a.date BETWEEN '2026-06-01' AND '2026-06-17'
ORDER BY a.date DESC;
