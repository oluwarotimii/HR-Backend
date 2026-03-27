ALTER TABLE branches
MODIFY COLUMN auto_mark_absent_timezone VARCHAR(50) DEFAULT 'Africa/Lagos';

UPDATE branches
SET auto_mark_absent_timezone = 'Africa/Lagos'
WHERE auto_mark_absent_timezone = 'Africa/Nairobi';

CREATE INDEX IF NOT EXISTS idx_auto_mark_time_enabled 
ON branches(auto_mark_absent_time, auto_mark_absent_enabled);
