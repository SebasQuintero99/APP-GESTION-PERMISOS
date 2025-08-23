import { useState, useEffect } from 'react';
import { Permission, PermissionFormData, ApprovePrmissionData } from '../types';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchMyPermissions = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    try {
      setLoading(true);
      const response = await apiService.getMyPermissions(params);
      setPermissions(response.permissions);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error('Error al cargar permisos');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPermissions = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    department?: string;
    employeeId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      setLoading(true);
      const response = await apiService.getAllPermissions(params);
      setPermissions(response.permissions);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error('Error al cargar permisos');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingApprovals = async (params?: {
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      const response = await apiService.getPendingApprovals(params);
      setPermissions(response.permissions);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error('Error al cargar aprobaciones pendientes');
    } finally {
      setLoading(false);
    }
  };

  const createPermission = async (permissionData: PermissionFormData): Promise<boolean> => {
    try {
      setLoading(true);
      await apiService.createPermission(permissionData);
      toast.success('Solicitud de permiso creada exitosamente');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al crear permiso';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePermission = async (permissionId: string, updates: Partial<PermissionFormData>): Promise<boolean> => {
    try {
      setLoading(true);
      await apiService.updatePermission(permissionId, updates);
      toast.success('Permiso actualizado exitosamente');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al actualizar permiso';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deletePermission = async (permissionId: string): Promise<boolean> => {
    try {
      setLoading(true);
      await apiService.deletePermission(permissionId);
      toast.success('Permiso eliminado exitosamente');
      // Remove from local state
      setPermissions(prev => prev.filter(p => p.id !== permissionId));
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al eliminar permiso';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const approvePermission = async (permissionId: string, approvalData: ApprovePrmissionData): Promise<boolean> => {
    try {
      setLoading(true);
      await apiService.approvePermission(permissionId, approvalData);
      toast.success(`Permiso ${approvalData.status === 'approved' ? 'aprobado' : 'rechazado'} exitosamente`);
      // Update local state
      setPermissions(prev => prev.filter(p => p.id !== permissionId));
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al procesar aprobación';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    permissions,
    loading,
    pagination,
    fetchMyPermissions,
    fetchAllPermissions,
    fetchPendingApprovals,
    createPermission,
    updatePermission,
    deletePermission,
    approvePermission,
  };
}

export default usePermissions;