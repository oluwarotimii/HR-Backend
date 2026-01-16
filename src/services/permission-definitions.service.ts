/**
 * Permission Definitions Service
 * Defines all available permissions in the system
 */

export interface PermissionDefinition {
  key: string;
  category: string;
  description: string;
}

// Hardcoded list of all available permissions in the system
export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  // Staff Management Permissions
  { key: 'staff:create', category: 'Staff Management', description: 'Create new staff members' },
  { key: 'staff:read', category: 'Staff Management', description: 'View staff information' },
  { key: 'staff:update', category: 'Staff Management', description: 'Update staff information' },
  { key: 'staff:delete', category: 'Staff Management', description: 'Delete staff members' },
  
  // User Management Permissions
  { key: 'users:create', category: 'User Management', description: 'Create new user accounts' },
  { key: 'users:read', category: 'User Management', description: 'View user information' },
  { key: 'users:update', category: 'User Management', description: 'Update user information' },
  { key: 'users:delete', category: 'User Management', description: 'Delete user accounts' },
  
  // Role Management Permissions
  { key: 'roles:create', category: 'Role Management', description: 'Create new roles' },
  { key: 'roles:read', category: 'Role Management', description: 'View roles' },
  { key: 'roles:update', category: 'Role Management', description: 'Update roles' },
  { key: 'roles:delete', category: 'Role Management', description: 'Delete roles' },
  
  // Permission Management Permissions
  { key: 'permissions:manage', category: 'Permission Management', description: 'Manage permissions' },
  
  // Form Management Permissions
  { key: 'forms:create', category: 'Form Management', description: 'Create new forms' },
  { key: 'forms:read', category: 'Form Management', description: 'View forms' },
  { key: 'forms:update', category: 'Form Management', description: 'Update forms' },
  { key: 'forms:delete', category: 'Form Management', description: 'Delete forms' },
  { key: 'forms:submit', category: 'Form Management', description: 'Submit forms' },
  
  // Report Management Permissions
  { key: 'reports:view', category: 'Report Management', description: 'View reports' },
  { key: 'reports:generate', category: 'Report Management', description: 'Generate reports' },
  
  // Attendance Management Permissions
  { key: 'attendance:record', category: 'Attendance Management', description: 'Record attendance' },
  { key: 'attendance:view', category: 'Attendance Management', description: 'View attendance records' },
  { key: 'attendance:manage', category: 'Attendance Management', description: 'Manage attendance records' },
  
  // Leave Management Permissions
  { key: 'leave:request', category: 'Leave Management', description: 'Request leave' },
  { key: 'leave:view', category: 'Leave Management', description: 'View leave records' },
  { key: 'leave:approve', category: 'Leave Management', description: 'Approve/reject leave requests' },
  
  // Payroll Management Permissions
  { key: 'payroll:manage', category: 'Payroll Management', description: 'Manage payroll' },
  
  // KPI Management Permissions
  { key: 'kpi:manage', category: 'KPI Management', description: 'Manage KPIs' },
  
  // Performance Management Permissions
  { key: 'performance:review', category: 'Performance Management', description: 'Review performance' },
  
  // Branch Management Permissions
  { key: 'branches:create', category: 'Branch Management', description: 'Create new branches' },
  { key: 'branches:read', category: 'Branch Management', description: 'View branches' },
  { key: 'branches:update', category: 'Branch Management', description: 'Update branches' },
  { key: 'branches:delete', category: 'Branch Management', description: 'Delete branches' },
  
  // Document Management Permissions
  { key: 'documents:upload', category: 'Document Management', description: 'Upload documents' },
  { key: 'documents:download', category: 'Document Management', description: 'Download documents' },
  
  // Settings Management Permissions
  { key: 'settings:configure', category: 'Settings Management', description: 'Configure system settings' },
  
  // Audit Trail Permissions
  { key: 'audit:read', category: 'Audit Trail', description: 'View audit logs' },
  
  // Appraisal Template Permissions
  { key: 'appraisal_template.read', category: 'Appraisal Management', description: 'View appraisal templates' },
  { key: 'appraisal_template.create', category: 'Appraisal Management', description: 'Create appraisal templates' },
  { key: 'appraisal_template.update', category: 'Appraisal Management', description: 'Update appraisal templates' },
  { key: 'appraisal_template.delete', category: 'Appraisal Management', description: 'Delete appraisal templates' },
  
  // Metric Management Permissions
  { key: 'metric.read', category: 'Metric Management', description: 'View metrics' },
  { key: 'metric.create', category: 'Metric Management', description: 'Create metrics' },
  { key: 'metric.update', category: 'Metric Management', description: 'Update metrics' },
  { key: 'metric.delete', category: 'Metric Management', description: 'Delete metrics' },
  
  // KPI Management Permissions (Additional)
  { key: 'kpi.read', category: 'KPI Management', description: 'View KPIs' },
  { key: 'kpi.create', category: 'KPI Management', description: 'Create KPIs' },
  { key: 'kpi.update', category: 'KPI Management', description: 'Update KPIs' },
  { key: 'kpi.delete', category: 'KPI Management', description: 'Delete KPIs' },
  
  // Target Management Permissions
  { key: 'target.read', category: 'Target Management', description: 'View targets' },
  { key: 'target.create', category: 'Target Management', description: 'Create targets' },
  { key: 'target.update', category: 'Target Management', description: 'Update targets' },
  { key: 'target.delete', category: 'Target Management', description: 'Delete targets' },
  
  // Appraisal Management Permissions
  { key: 'appraisal.read', category: 'Appraisal Management', description: 'View appraisals' },
  { key: 'appraisal.create', category: 'Appraisal Management', description: 'Create appraisals' },
  { key: 'appraisal.update', category: 'Appraisal Management', description: 'Update appraisals' },
  { key: 'appraisal.submit', category: 'Appraisal Management', description: 'Submit appraisals' },
  
  // Performance Review Permissions
  { key: 'performance.read', category: 'Performance Management', description: 'View performance reviews' },
];

// Get permissions by category
export const getPermissionsByCategory = (category: string): PermissionDefinition[] => {
  return PERMISSION_DEFINITIONS.filter(permission => permission.category === category);
};

// Get all unique categories
export const getAllPermissionCategories = (): string[] => {
  const categories = new Set(PERMISSION_DEFINITIONS.map(p => p.category));
  return Array.from(categories).sort();
};

// Validate if a permission exists in the system
export const isValidPermission = (permission: string): boolean => {
  return PERMISSION_DEFINITIONS.some(p => p.key === permission);
};

// Get permission by key
export const getPermissionByKey = (key: string): PermissionDefinition | undefined => {
  return PERMISSION_DEFINITIONS.find(p => p.key === key);
};