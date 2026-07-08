-- Migration: Add missing tracking columns to staff_invitations
ALTER TABLE staff_invitations
  ADD COLUMN IF NOT EXISTS first_login_at TIMESTAMP NULL DEFAULT NULL AFTER profile_completed,
  ADD COLUMN IF NOT EXISTS first_login_ip VARCHAR(45) NULL DEFAULT NULL AFTER first_login_at,
  ADD COLUMN IF NOT EXISTS profile_completed TINYINT(1) DEFAULT 0 AFTER first_login_ip;
