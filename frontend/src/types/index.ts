// Types for the permissions system

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  role: 'employee' | 'immediate_supervisor' | 'area_manager' | 'hr';
  department?: string;
  position?: string;
  immediateManagerId?: string;
  areaManagerId?: string;
  isActive: boolean;
  signature?: string;
  createdAt: string;
  updatedAt: string;
  immediateManager?: User;
  areaManager?: User;
  subordinates?: User[];
  areaSubordinates?: User[];
}

export interface Permission {
  id: string;
  employeeId: string;
  type: 'vacation' | 'medical_leave' | 'personal_leave' | 'maternity_leave' | 'paternity_leave' | 'study_permit' | 'other';
  startDate: string;
  endDate: string;
  totalDays: number;
  businessDays: number;
  reason: string;
  comments?: string;
  status: 'pending_immediate_supervisor' | 'pending_area_manager' | 'pending_hr' | 'approved' | 'rejected';
  rejectionReason?: string;
  supportingDocuments?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  workCoverage?: string;
  createdAt: string;
  updatedAt: string;
  employee?: User;
  approvals?: Approval[];
}

export interface Approval {
  id: string;
  permissionId: string;
  approverId: string;
  approverRole: 'immediate_supervisor' | 'area_manager' | 'hr';
  status: 'approved' | 'rejected';
  comments?: string;
  signature?: string;
  approvedAt: string;
  createdAt: string;
  updatedAt: string;
  approver?: User;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  details?: any[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PermissionFormData {
  type: Permission['type'];
  startDate: string;
  endDate: string;
  comments?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  workCoverage?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  role: User['role'];
  department?: string;
  position?: string;
  immediateManagerId?: string;
  areaManagerId?: string;
}

export interface PermissionStats {
  totalPermissions: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byMonth: Record<string, number>;
  totalDays: number;
}

export interface ApprovePrmissionData {
  status: 'approved' | 'rejected';
  comments?: string;
  signature?: string;
}