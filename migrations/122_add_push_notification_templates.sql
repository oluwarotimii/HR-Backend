-- Migration: Add notification_templates rows for real push features
-- Description: clock_in_reminder (daily "shift starts soon" nudge) and
-- special_note (ad-hoc HR/Admin broadcast) both need a template row —
-- queueNotification() looks templates up by name and throws if missing.
-- Both default to the 'push' channel since they're meant to be an
-- immediate phone nudge, not an email.

INSERT IGNORE INTO notification_templates (name, title_template, body_template, subject_template, channel, variables, enabled) VALUES
('clock_in_reminder', 'Time to clock in', 'Your shift at {branch_name} starts in 10 minutes ({start_time}). Don''t forget to check in!', NULL, 'push', '["branch_name", "start_time"]', TRUE);

INSERT IGNORE INTO notification_templates (name, title_template, body_template, subject_template, channel, variables, enabled) VALUES
('special_note', '{title}', '{message}', NULL, 'push', '["title", "message"]', TRUE);
