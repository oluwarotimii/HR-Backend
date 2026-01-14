-- Migration: Create roles_permissions junction table
-- Description: Creates the junction table for many-to-many relationship between roles and permissions

CREATE TABLE IF NOT EXISTS roles_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  permission VARCHAR(255) NOT NULL,
  allow_deny ENUM('allow', 'deny') DEFAULT 'allow',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_permission (role_id, permission),
  INDEX idx_role_id (role_id),
  INDEX idx_permission (permission)
);