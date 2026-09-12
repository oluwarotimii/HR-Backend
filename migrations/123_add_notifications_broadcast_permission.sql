-- Migration: Grant the new notifications:broadcast permission to HR and Manager
-- Description: notifications:broadcast gates POST /api/notifications/broadcast
-- (the "special note" ad-hoc announcement feature). Admin already has '*'.

INSERT IGNORE INTO roles_permissions (role_id, permission, allow_deny)
SELECT id, 'notifications:broadcast', 'allow' FROM roles WHERE name IN ('HR', 'Manager');
