import { pool } from '../config/database';
import { PERMISSION_DEFINITIONS, isValidPermission, getAllPermissionCategories } from '../services/permission-definitions.service';
export const createRole = async (req, res) => {
    try {
        const { name, description, permissions } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Role name is required'
            });
        }
        if (permissions && Array.isArray(permissions)) {
            for (const permission of permissions) {
                if (!isValidPermission(permission)) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid permission: ${permission}`
                    });
                }
            }
        }
        const [existingRows] = await pool.execute('SELECT id FROM roles WHERE name = ?', [name]);
        if (existingRows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'A role with this name already exists'
            });
        }
        const [roleResult] = await pool.execute('INSERT INTO roles (name, description, permissions, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())', [name, description || '', JSON.stringify(permissions || [])]);
        const roleId = roleResult.insertId;
        if (permissions && Array.isArray(permissions) && permissions.length > 0) {
            for (const permission of permissions) {
                await pool.execute('INSERT INTO roles_permissions (role_id, permission, allow_deny, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())', [roleId, permission, 'allow']);
            }
        }
        const [newRoleRows] = await pool.execute('SELECT * FROM roles WHERE id = ?', [roleId]);
        const newRole = newRoleRows[0];
        return res.status(201).json({
            success: true,
            message: 'Role created successfully',
            data: {
                role: {
                    id: newRole.id,
                    name: newRole.name,
                    description: newRole.description,
                    permissions: JSON.parse(newRole.permissions || '[]'),
                    created_at: newRole.created_at
                }
            }
        });
    }
    catch (error) {
        console.error('Create role error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during role creation'
        });
    }
};
export const getAvailablePermissions = async (req, res) => {
    try {
        return res.json({
            success: true,
            data: {
                permissions: PERMISSION_DEFINITIONS,
                categories: getAllPermissionCategories()
            }
        });
    }
    catch (error) {
        console.error('Get available permissions error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while fetching permissions'
        });
    }
};
export const getAllRoles = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, name, description, permissions, created_at, updated_at FROM roles ORDER BY name');
        const roles = rows.map((role) => ({
            ...role,
            permissions: JSON.parse(role.permissions || '[]')
        }));
        return res.json({
            success: true,
            data: {
                roles
            }
        });
    }
    catch (error) {
        console.error('Get all roles error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while fetching roles'
        });
    }
};
export const updateRole = async (req, res) => {
    try {
        const idParam = req.params.id;
        const roleIdStr = Array.isArray(idParam) ? idParam[0] : idParam;
        const roleId = parseInt(typeof roleIdStr === 'string' ? roleIdStr : '');
        if (isNaN(roleId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role ID'
            });
        }
        const { name, description, permissions } = req.body;
        const [existingRows] = await pool.execute('SELECT id FROM roles WHERE id = ?', [roleId]);
        if (existingRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }
        if (permissions && Array.isArray(permissions)) {
            for (const permission of permissions) {
                if (!isValidPermission(permission)) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid permission: ${permission}`
                    });
                }
            }
        }
        const updates = [];
        const values = [];
        if (name !== undefined) {
            const [conflictRows] = await pool.execute('SELECT id FROM roles WHERE name = ? AND id != ?', [name, roleId]);
            if (conflictRows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'A role with this name already exists'
                });
            }
            updates.push('name = ?');
            values.push(name);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }
        if (permissions !== undefined) {
            updates.push('permissions = ?');
            values.push(JSON.stringify(permissions));
        }
        if (updates.length === 0) {
            const [currentRoleRows] = await pool.execute('SELECT * FROM roles WHERE id = ?', [roleId]);
            const currentRole = currentRoleRows[0];
            return res.json({
                success: true,
                message: 'No updates provided, returning current role',
                data: {
                    role: {
                        id: currentRole.id,
                        name: currentRole.name,
                        description: currentRole.description,
                        permissions: JSON.parse(currentRole.permissions || '[]'),
                        created_at: currentRole.created_at,
                        updated_at: currentRole.updated_at
                    }
                }
            });
        }
        values.push(roleId);
        await pool.execute(`UPDATE roles SET ${updates.join(', ')} WHERE id = ?`, values);
        if (permissions !== undefined) {
            await pool.execute('DELETE FROM roles_permissions WHERE role_id = ?', [roleId]);
            if (Array.isArray(permissions) && permissions.length > 0) {
                for (const permission of permissions) {
                    await pool.execute('INSERT INTO roles_permissions (role_id, permission, allow_deny, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())', [roleId, permission, 'allow']);
                }
            }
        }
        const [updatedRoleRows] = await pool.execute('SELECT * FROM roles WHERE id = ?', [roleId]);
        const updatedRole = updatedRoleRows[0];
        return res.json({
            success: true,
            message: 'Role updated successfully',
            data: {
                role: {
                    id: updatedRole.id,
                    name: updatedRole.name,
                    description: updatedRole.description,
                    permissions: JSON.parse(updatedRole.permissions || '[]'),
                    created_at: updatedRole.created_at,
                    updated_at: updatedRole.updated_at
                }
            }
        });
    }
    catch (error) {
        console.error('Update role error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during role update'
        });
    }
};
export const deleteRole = async (req, res) => {
    try {
        const idParam = req.params.id;
        const roleIdStr = Array.isArray(idParam) ? idParam[0] : idParam;
        const roleId = parseInt(typeof roleIdStr === 'string' ? roleIdStr : '');
        if (isNaN(roleId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role ID'
            });
        }
        const [existingRows] = await pool.execute('SELECT id, name FROM roles WHERE id = ?', [roleId]);
        if (existingRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }
        const roleName = existingRows[0].name;
        if (roleName === 'Super Admin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete Super Admin role'
            });
        }
        const [userRows] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role_id = ?', [roleId]);
        if (userRows[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete role that has users assigned to it'
            });
        }
        await pool.execute('DELETE FROM roles_permissions WHERE role_id = ?', [roleId]);
        await pool.execute('DELETE FROM roles WHERE id = ?', [roleId]);
        return res.json({
            success: true,
            message: 'Role deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete role error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during role deletion'
        });
    }
};
//# sourceMappingURL=role-management.controller.js.map