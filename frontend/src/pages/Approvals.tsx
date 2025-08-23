import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types';
import { 
  permissionTypeLabels, 
  getStatusColor, 
  formatDate, 
  formatFullName,
  canApprovePermission 
} from '../utils';
import ApprovalModal from '../components/forms/ApprovalModal';

export default function Approvals() {
  const { user } = useAuth();
  const { permissions, loading, fetchPendingApprovals } = usePermissions();
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const handleApprove = (permission: Permission) => {
    if (canApprovePermission(user?.role || '', permission.status)) {
      setSelectedPermission(permission);
      setIsApprovalModalOpen(true);
    }
  };

  const handleModalClose = (refreshData?: boolean) => {
    setIsApprovalModalOpen(false);
    setSelectedPermission(null);
    if (refreshData) {
      fetchPendingApprovals();
    }
  };

  const canUserApprove = (permission: Permission) => {
    return user ? canApprovePermission(user.role, permission.status) : false;
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Aprobaciones Pendientes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Revisa y procesa las solicitudes de permisos que requieren tu aprobación.
          </p>
        </div>
      </div>

      {/* Pending Approvals Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empleado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fechas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado Actual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Solicitado
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                      </td>
                    </tr>
                  ) : permissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No hay solicitudes pendientes de aprobación.
                      </td>
                    </tr>
                  ) : (
                    permissions.map((permission) => (
                      <tr key={permission.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {permission.employee?.firstName?.charAt(0)}
                                  {permission.employee?.lastName?.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {formatFullName(
                                  permission.employee?.firstName || '',
                                  permission.employee?.lastName || ''
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {permission.employee?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {permissionTypeLabels[permission.type]}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(permission.startDate)} - {formatDate(permission.endDate)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {permission.businessDays} días hábiles
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(permission.status)}`}>
                            {permission.status === 'pending_immediate_supervisor' && 'Pendiente Supervisor'}
                            {permission.status === 'pending_area_manager' && 'Pendiente Jefe Área'}
                            {permission.status === 'pending_hr' && 'Pendiente HR'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(permission.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {canUserApprove(permission) ? (
                            <button
                              onClick={() => handleApprove(permission)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <CheckIcon className="h-4 w-4 mr-1" />
                              Procesar
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">No autorizado</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {permissions.length > 0 && (
        <div className="mt-8 space-y-4">
          {permissions.map((permission) => (
            permission.comments && (
              <div key={`${permission.id}-comments`} className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-900">
                  Comentarios de {formatFullName(
                    permission.employee?.firstName || '',
                    permission.employee?.lastName || ''
                  )}:
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {permission.comments}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Approval Modal */}
      {isApprovalModalOpen && selectedPermission && (
        <ApprovalModal
          permission={selectedPermission}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}