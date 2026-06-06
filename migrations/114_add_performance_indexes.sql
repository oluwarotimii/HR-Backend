-- ============================================================
-- Migration 114: Add missing indexes for query performance
-- ============================================================

-- users: index on status and created_at (frequently filtered/sorted)
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- staff: index on joining_date and created_at
CREATE INDEX idx_staff_joining_date ON staff(joining_date);
CREATE INDEX idx_staff_created_at ON staff(created_at);

-- attendance: index on created_at
CREATE INDEX idx_attendance_created_at ON attendance(created_at);

-- leave_requests: index on created_at
CREATE INDEX idx_leave_requests_created_at ON leave_requests(created_at);

-- leave_history: index on leave_type_id (CRITICAL - missing FK, no auto-index) and created_at
CREATE INDEX idx_leave_history_leave_type_id ON leave_history(leave_type_id);
CREATE INDEX idx_leave_history_created_at ON leave_history(created_at);

-- leave_allocations: index on created_at
CREATE INDEX idx_leave_allocations_created_at ON leave_allocations(created_at);

-- kpi_assignments: index on cycle dates
CREATE INDEX idx_kpi_assignments_cycle_dates ON kpi_assignments(cycle_start_date, cycle_end_date);

-- performance_scores: index on period_start, period_end
CREATE INDEX idx_performance_scores_period ON performance_scores(period_start, period_end);

-- targets: index on period_start, period_end
CREATE INDEX idx_targets_period ON targets(period_start, period_end);
