-- Migration: Add notification template for pending leave requests
-- Description: Notifies users with leave:approve permission about new pending requests

INSERT INTO notification_templates (name, title_template, body_template, subject_template, channel, variables, enabled) VALUES
('leave_request_pending', 'New Leave Request Pending Approval', 'Dear {approver_name},<br><br>A new leave request requires your approval.<br><br>Employee: {staff_name}<br>Leave Type: {leave_type}<br>Dates: {start_date} to {end_date}<br>Days Requested: {days}<br>Reason: {reason}<br><br>Please log in to the HR system to review and approve/reject this request.', 'New Leave Request Pending - {company_name}', 'email', '["approver_name", "staff_name", "leave_type", "start_date", "end_date", "days", "reason", "company_name"]', TRUE);
