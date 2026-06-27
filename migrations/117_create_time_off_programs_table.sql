-- Migration: Create time_off_programs table
-- Description: Separates the program definition from per-employee assignments.
-- time_off_programs stores the program (e.g. "Democracy Day", "Eid El Kabir").
-- time_off_banks now references program_id and tracks per-employee usage.
-- Existing data is migrated automatically.

CREATE TABLE IF NOT EXISTS time_off_programs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  program_name VARCHAR(255) NOT NULL,
  description TEXT,
  total_entitled_days DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_program_name (program_name)
);

-- Add program_id column to time_off_banks
ALTER TABLE time_off_banks
  ADD COLUMN program_id INT NULL AFTER id,
  ADD INDEX idx_program_id (program_id);

-- Migrate existing time_off_banks data into programs
INSERT INTO time_off_programs (program_name, description, total_entitled_days, valid_from, valid_to, created_by)
SELECT DISTINCT
  tob.program_name,
  tob.description,
  tob.total_entitled_days,
  tob.valid_from,
  tob.valid_to,
  tob.created_by
FROM time_off_banks tob;

-- Set program_id on existing time_off_banks rows
UPDATE time_off_banks tob
JOIN time_off_programs top
  ON tob.program_name = top.program_name
  AND tob.total_entitled_days = top.total_entitled_days
  AND tob.valid_from = top.valid_from
  AND tob.valid_to = top.valid_to
  AND tob.created_by = top.created_by
SET tob.program_id = top.id;

-- Add foreign key constraint (must be done after data migration)
ALTER TABLE time_off_banks
  ADD FOREIGN KEY (program_id) REFERENCES time_off_programs(id) ON DELETE CASCADE;
