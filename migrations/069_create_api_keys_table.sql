-- Migration: Create API Keys table
-- Description: Creates the api_keys table for managing API access to the HR system

CREATE TABLE IF NOT EXISTS api_keys (
  id INT PRIMARY KEY AUTO_INCREMENT,
  api_key VARCHAR(255) NOT NULL UNIQUE, -- Hashed API key (changed from 'key' to avoid reserved word)
  name VARCHAR(255) NOT NULL, -- Descriptive name for the key
  user_id INT NOT NULL, -- Foreign key to users table
  permissions TEXT NOT NULL, -- JSON array of permissions granted to this key (using TEXT instead of JSON for compatibility)
  is_active BOOLEAN DEFAULT TRUE, -- Whether the key is active
  expires_at TIMESTAMP NULL, -- Optional expiration date
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_api_key (api_key),
  INDEX idx_user_id (user_id),
  INDEX idx_is_active (is_active),
  INDEX idx_expires_at (expires_at)
);