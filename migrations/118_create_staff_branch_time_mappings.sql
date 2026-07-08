-- Create staff_branch_time_mappings table
-- Allows mapping staff/departments to specific branch resumption times

CREATE TABLE IF NOT EXISTS staff_branch_time_mappings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NULL,
    department_id INT NULL,
    branch_id INT NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_staff_branch_time_mapping_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    CONSTRAINT fk_staff_branch_time_mapping_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_staff_branch_time_mapping_target CHECK (
        (staff_id IS NOT NULL AND department_id IS NULL) OR
        (staff_id IS NULL AND department_id IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_staff_branch_time_mapping_staff ON staff_branch_time_mappings(staff_id);
CREATE INDEX idx_staff_branch_time_mapping_department ON staff_branch_time_mappings(department_id);
CREATE INDEX idx_staff_branch_time_mapping_branch ON staff_branch_time_mappings(branch_id);
