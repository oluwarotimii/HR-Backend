-- Migration: Add updated_at column to roles_permissions table
-- Description: Adds updated_at column to roles_permissions table for proper timestamp tracking

ALTER TABLE roles_permissions 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;