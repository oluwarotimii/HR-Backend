-- Migration: Grant the new attendance:export permission to existing HR and Manager roles
-- Description: attendance:export gates the new attendance report download endpoint
-- (CSV/PDF/Excel). Adding the permission string to seed-database.ts's rolePermissions
-- map only affects future fresh seeds — it does nothing for roles that already exist
-- in a deployed database, since seedRoles() skips roles that already exist. This
-- migration is what actually unlocks it here. Admin already has the '*' wildcard.

INSERT IGNORE INTO roles_permissions (role_id, permission, allow_deny)
SELECT id, 'attendance:export', 'allow' FROM roles WHERE name IN ('HR', 'Manager');
