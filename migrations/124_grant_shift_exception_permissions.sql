-- Migration: Grant shift-exception:* permissions to HR and Manager
-- Description: These permissions gate the shift exception management
-- screens (Admin and mobile) but were never granted to any role via
-- migration or in the seed script's rolePermissions map — only Admin
-- (via the '*' wildcard) could actually use the feature in production.

INSERT IGNORE INTO roles_permissions (role_id, permission, allow_deny)
SELECT id, p.permission, 'allow'
FROM roles
CROSS JOIN (
  SELECT 'shift-exception:read' AS permission UNION ALL
  SELECT 'shift-exception:create' UNION ALL
  SELECT 'shift-exception:update' UNION ALL
  SELECT 'shift-exception:delete'
) p
WHERE roles.name IN ('HR', 'Manager');
