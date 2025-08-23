import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Date utilities
export const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: es });
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
  } catch {
    return dateString;
  }
};

export const formatDateForInput = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'yyyy-MM-dd');
  } catch {
    return '';
  }
};

// Permission type translations
export const permissionTypeLabels: Record<string, string> = {
  vacation: 'Vacaciones',
  medical_leave: 'Permiso médico',
  personal_leave: 'Permiso personal',
  maternity_leave: 'Permiso de maternidad',
  paternity_leave: 'Permiso de paternidad',
  study_permit: 'Permiso de estudio',
  other: 'Otro',
};

// Permission status translations
export const permissionStatusLabels: Record<string, string> = {
  pending_immediate_supervisor: 'Pendiente supervisor',
  pending_area_manager: 'Pendiente jefe de área',
  pending_hr: 'Pendiente HR',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

// User role translations
export const userRoleLabels: Record<string, string> = {
  employee: 'Empleado',
  immediate_supervisor: 'Supervisor inmediato',
  area_manager: 'Jefe de área',
  hr: 'Recursos Humanos',
};

// Status colors for UI
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending_immediate_supervisor':
    case 'pending_area_manager':
    case 'pending_hr':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Role colors for UI
export const getRoleColor = (role: string): string => {
  switch (role) {
    case 'hr':
      return 'bg-purple-100 text-purple-800';
    case 'area_manager':
      return 'bg-blue-100 text-blue-800';
    case 'immediate_supervisor':
      return 'bg-indigo-100 text-indigo-800';
    case 'employee':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Calculate business days between dates
export const calculateBusinessDays = (startDate: string, endDate: string): number => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  let count = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Format full name
export const formatFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`;
};

// Check if user can approve permission
export const canApprovePermission = (userRole: string, permissionStatus: string): boolean => {
  switch (userRole) {
    case 'immediate_supervisor':
      return permissionStatus === 'pending_immediate_supervisor';
    case 'area_manager':
      return permissionStatus === 'pending_area_manager';
    case 'hr':
      return permissionStatus === 'pending_hr';
    default:
      return false;
  }
};

// Check if user can view all permissions
export const canViewAllPermissions = (userRole: string): boolean => {
  return ['area_manager', 'hr'].includes(userRole);
};

// Check if user can create users
export const canCreateUsers = (userRole: string): boolean => {
  return userRole === 'hr';
};

// Export utility functions as a group
export const dateUtils = {
  formatDate,
  formatDateTime,
  formatDateForInput,
  calculateBusinessDays,
};

export const permissionUtils = {
  permissionTypeLabels,
  permissionStatusLabels,
  getStatusColor,
  canApprovePermission,
};

export const userUtils = {
  userRoleLabels,
  getRoleColor,
  formatFullName,
  canViewAllPermissions,
  canCreateUsers,
};

export const validationUtils = {
  isValidEmail,
};