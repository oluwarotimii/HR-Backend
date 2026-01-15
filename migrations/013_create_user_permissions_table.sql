-- Migration: Create user_permissions table
-- Description: Creates the user_permissions table for storing individual user permissions

CREATE TABLE IF NOT EXISTS user_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  permission VARCHAR(255) NOT NULL,
  allow_deny ENUM('allow', 'deny') DEFAULT 'allow',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_permission (user_id, permission),
  INDEX idx_user_id (user_id),
  INDEX idx_permission (permission)
);