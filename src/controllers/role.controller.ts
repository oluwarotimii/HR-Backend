import { Request, Response } from 'express';
import RoleModel from '../models/role.model';
import RolePermissionModel from '../models/role-permission.model';
import { authenticateJWT, checkPermission } from '../middleware/auth.middleware';

// Controller for role management
export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await RoleModel.findAll();
    return res.json({
      success: true,
      message: 'Roles retrieved successfully',
      data: { roles }
    });
  } catch (error) {
    console.error('Get all roles error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const roleIdStr = Array.isArray(id) ? id[0] : id;
    const roleId = parseInt(roleIdStr);

    if (isNaN(roleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role ID'
      });
    }

    const role = await RoleModel.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    return res.json({
      success: true,
      message: 'Role retrieved successfully',
      data: { role }
    });
  } catch (error) {
    console.error('Get role by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, description, permissions } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Role name is required'
      });
    }

    // Check if role with this name already exists
    const existingRole = await RoleModel.findByName(name);
    if (existingRole) {
      return res.status(409).json({
        success: false,
        message: 'A role with this name already exists'
      });
    }

    // Create the role
    const roleData = {
      name,
      description: description || '',
      permissions: permissions || []
    };

    const newRole = await RoleModel.create(roleData);

    return res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: { role: newRole }
    });
  } catch (error) {
    console.error('Create role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const roleId = parseInt(id);
    const { name, description, permissions } = req.body;

    if (isNaN(roleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role ID'
      });
    }

    // Check if role exists
    const existingRole = await RoleModel.findById(roleId);
    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (permissions !== undefined) updateData.permissions = permissions;

    const updatedRole = await RoleModel.update(roleId, updateData);

    return res.json({
      success: true,
      message: 'Role updated successfully',
      data: { role: updatedRole }
    });
  } catch (error) {
    console.error('Update role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const roleId = parseInt(id);

    if (isNaN(roleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role ID'
      });
    }

    const deleted = await RoleModel.delete(roleId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    return res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Delete role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Controller for role permissions management
export const getRolePermissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const roleId = parseInt(id);

    if (isNaN(roleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role ID'
      });
    }

    const permissions = await RolePermissionModel.getRolePermissions(roleId);

    return res.json({
      success: true,
      message: 'Role permissions retrieved successfully',
      data: { permissions }
    });
  } catch (error) {
    console.error('Get role permissions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const addRolePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const roleId = parseInt(id);
    const { permission, allow_deny } = req.body;

    if (isNaN(roleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role ID'
      });
    }

    if (!permission) {
      return res.status(400).json({
        success: false,
        message: 'Permission is required'
      });
    }

    // Check if permission already exists for this role
    const existingPermission = await RolePermissionModel.findByRoleAndPermission(roleId, permission);
    if (existingPermission) {
      return res.status(409).json({
        success: false,
        message: 'Permission already exists for this role'
      });
    }

    const permissionData = {
      role_id: roleId,
      permission,
      allow_deny: allow_deny || 'allow'
    };

    const newPermission = await RolePermissionModel.create(permissionData);

    return res.status(201).json({
      success: true,
      message: 'Role permission added successfully',
      data: { permission: newPermission }
    });
  } catch (error) {
    console.error('Add role permission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const removeRolePermission = async (req: Request, res: Response) => {
  try {
    const { id, permission } = req.params;
    const roleId = parseInt(id);

    if (isNaN(roleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role ID'
      });
    }

    if (!permission) {
      return res.status(400).json({
        success: false,
        message: 'Permission is required'
      });
    }

    const deleted = await RolePermissionModel.deleteRolePermission(roleId, permission);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Role permission not found'
      });
    }

    return res.json({
      success: true,
      message: 'Role permission removed successfully'
    });
  } catch (error) {
    console.error('Remove role permission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};