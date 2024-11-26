export type UserRole = 'ADMIN' | 'SALES' | 'MANAGER';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

export interface Session {
  user: User;
  expires: string;
}

export interface AuthError {
  message: string;
  status: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

// Role-based permissions
export const ROLE_PERMISSIONS = {
  ADMIN: ['read', 'write', 'delete', 'manage_users'],
  MANAGER: ['read', 'write', 'approve_orders'],
  SALES: ['read', 'create_orders'],
} as const;

export type Permission = typeof ROLE_PERMISSIONS[UserRole][number];

// Helper functions
export function hasPermission(userRole: UserRole, requiredPermission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole].includes(requiredPermission);
}

export function validateRole(role: string): role is UserRole {
  return ['ADMIN', 'SALES', 'MANAGER'].includes(role);
}
