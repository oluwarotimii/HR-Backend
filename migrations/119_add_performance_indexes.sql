-- Migration: Add performance indexes identified by Phase 7 audit

-- 1. leave_history: critical for date-range overlap queries during check-in
CREATE INDEX IF NOT EXISTS idx_leave_history_user_date_status
ON leave_history (user_id, start_date, end_date, status);

-- 2. leave_requests: same date-range overlap pattern
CREATE INDEX IF NOT EXISTS idx_leave_requests_user_date_status
ON leave_requests (user_id, start_date, end_date, status);

-- 3. audit_logs: zero indexes besides PK — full table scans on every query
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
ON audit_logs (entity_type, entity_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user
ON audit_logs (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action
ON audit_logs (action, created_at);

-- 4. shift_exceptions: filtered by user + date + status
CREATE INDEX IF NOT EXISTS idx_shift_exceptions_user_date_status
ON shift_exceptions (user_id, exception_date, status);

-- 5. staff_branch_time_mappings: lookup by staff_id or department_id
CREATE INDEX IF NOT EXISTS idx_sbtm_staff
ON staff_branch_time_mappings (staff_id);
CREATE INDEX IF NOT EXISTS idx_sbtm_department
ON staff_branch_time_mappings (department_id);

-- 6. attendance: for lock/auto-mark queries filtering by date + lock status
CREATE INDEX IF NOT EXISTS idx_attendance_date_locked
ON attendance (date, is_locked);
