-- Migration: Grant shift-exception, leave, and floating-day (time off)
-- management permissions to the custom "Shift Admin" role.
-- Description: Shift Admin is a custom role (not one of the seeded
-- Admin/Manager/HR/Employee roles), so it needs an explicit grant rather
-- than a rolePermissions map entry. Matches by LIKE on name so it isn't
-- broken by exact casing/spacing — narrow it to an exact role name if you
-- have more than one role with "shift" and "admin" in its name.

INSERT IGNORE INTO roles_permissions (role_id, permission, allow_deny)
SELECT roles.id, p.permission, 'allow'
FROM roles
CROSS JOIN (
  SELECT 'shift-exception:read' AS permission UNION ALL
  SELECT 'shift-exception:create' UNION ALL
  SELECT 'shift-exception:update' UNION ALL
  SELECT 'shift-exception:delete' UNION ALL
  SELECT 'leave:read' UNION ALL
  SELECT 'leave:update' UNION ALL
  SELECT 'leave:approve' UNION ALL
  SELECT 'floating_day:read' UNION ALL
  SELECT 'floating_day:clear' UNION ALL
  SELECT 'floating_day:approve' UNION ALL
  SELECT 'floating_day:reject'
) p
WHERE roles.name LIKE '%shift%admin%';
