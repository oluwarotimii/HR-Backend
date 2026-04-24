-- Migration 109: Add nationality, state_of_origin, and lga fields to staff table
-- Safe to run multiple times

ALTER TABLE staff
ADD COLUMN IF NOT EXISTS nationality VARCHAR(100) NULL AFTER date_of_birth;

ALTER TABLE staff
ADD COLUMN IF NOT EXISTS state_of_origin VARCHAR(100) NULL AFTER nationality;

ALTER TABLE staff
ADD COLUMN IF NOT EXISTS lga VARCHAR(100) NULL AFTER state_of_origin;

