import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  User, 
  Permission, 
  AuthResponse, 
  ApiResponse, 
  PaginatedResponse, 
  PermissionFormData, 
  LoginCredentials, 
  CreateUserData, 
  PermissionStats, 
  ApprovePrmissionData 
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  async getProfile(): Promise<{ user: User }> {
    const response = await this.api.get<{ user: User }>('/auth/me');
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await this.api.put<{ message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  async logout(): Promise<{ message: string }> {
    const response = await this.api.post<{ message: string }>('/auth/logout');
    return response.data;
  }

  // User endpoints
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    department?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<PaginatedResponse<User> & { users: User[] }> {
    const response = await this.api.get<PaginatedResponse<User> & { users: User[] }>('/users', { params });
    return response.data;
  }

  async getUserById(userId: string): Promise<{ user: User }> {
    const response = await this.api.get<{ user: User }>(`/users/${userId}`);
    return response.data;
  }

  async createUser(userData: CreateUserData): Promise<{ message: string; user: User }> {
    const response = await this.api.post<{ message: string; user: User }>('/users', userData);
    return response.data;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<{ message: string; user: User }> {
    const response = await this.api.put<{ message: string; user: User }>(`/users/${userId}`, updates);
    return response.data;
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await this.api.delete<{ message: string }>(`/users/${userId}`);
    return response.data;
  }

  async getManagers(): Promise<{ managers: User[] }> {
    const response = await this.api.get<{ managers: User[] }>('/users/managers');
    return response.data;
  }

  async resetPassword(userId: string, newPassword: string): Promise<{ message: string }> {
    const response = await this.api.put<{ message: string }>(`/users/${userId}/reset-password`, {
      newPassword,
    });
    return response.data;
  }

  async updateSignature(signature: string): Promise<{ message: string }> {
    const response = await this.api.put<{ message: string }>('/users/signature', { signature });
    return response.data;
  }

  // Permission endpoints
  async createPermission(permissionData: PermissionFormData): Promise<{ message: string; permission: Permission }> {
    const response = await this.api.post<{ message: string; permission: Permission }>('/permissions', permissionData);
    return response.data;
  }

  async getMyPermissions(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Permission> & { permissions: Permission[] }> {
    const response = await this.api.get<PaginatedResponse<Permission> & { permissions: Permission[] }>('/permissions/my-permissions', { params });
    return response.data;
  }

  async getAllPermissions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    department?: string;
    employeeId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Permission> & { permissions: Permission[] }> {
    const response = await this.api.get<PaginatedResponse<Permission> & { permissions: Permission[] }>('/permissions', { params });
    return response.data;
  }

  async getPermissionById(permissionId: string): Promise<{ permission: Permission }> {
    const response = await this.api.get<{ permission: Permission }>(`/permissions/${permissionId}`);
    return response.data;
  }

  async updatePermission(permissionId: string, updates: Partial<PermissionFormData>): Promise<{ message: string; permission: Permission }> {
    const response = await this.api.put<{ message: string; permission: Permission }>(`/permissions/${permissionId}`, updates);
    return response.data;
  }

  async deletePermission(permissionId: string): Promise<{ message: string }> {
    const response = await this.api.delete<{ message: string }>(`/permissions/${permissionId}`);
    return response.data;
  }

  async getPendingApprovals(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Permission> & { permissions: Permission[] }> {
    const response = await this.api.get<PaginatedResponse<Permission> & { permissions: Permission[] }>('/permissions/pending-approvals', { params });
    return response.data;
  }

  async approvePermission(permissionId: string, approvalData: ApprovePrmissionData): Promise<{ message: string; permission: Permission }> {
    const response = await this.api.put<{ message: string; permission: Permission }>(`/permissions/${permissionId}/approve`, approvalData);
    return response.data;
  }

  async getPermissionStats(year?: number): Promise<{ stats: PermissionStats }> {
    const params = year ? { year } : {};
    const response = await this.api.get<{ stats: PermissionStats }>('/permissions/stats', { params });
    return response.data;
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;