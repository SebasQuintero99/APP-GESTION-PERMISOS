import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../types';
import { permissionTypeLabels, permissionStatusLabels, getStatusColor, formatDate } from '../utils';
import PermissionForm from '../components/forms/PermissionForm';

export default function MyPermissions() {
  const { 
    permissions, 
    loading, 
    pagination, 
    fetchMyPermissions, 
    deletePermission 
  } = usePermissions();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchMyPermissions({
      page: 1,
      limit: 10,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    });
  }, [statusFilter]);

  const handleEdit = (permission: Permission) => {
    // Only allow editing pending permissions
    if (permission.status === 'pending_immediate_supervisor') {
      setEditingPermission(permission);
      setIsFormOpen(true);
    }
  };

  const handleDelete = async (permissionId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta solicitud?')) {
      const success = await deletePermission(permissionId);
      if (success) {
        fetchMyPermissions({
          page: pagination.page,
          limit: pagination.limit,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        });
      }
    }
  };

  const handleFormClose = (refreshData?: boolean) => {
    setIsFormOpen(false);
    setEditingPermission(null);
    if (refreshData) {
      fetchMyPermissions({
        page: 1,
        limit: pagination.limit,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
    }
  };

  const canEdit = (permission: Permission) => {
    return permission.status === 'pending_immediate_supervisor';
  };

  const canDelete = (permission: Permission) => {
    return permission.status === 'pending_immediate_supervisor';
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Mis Permisos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestiona tus solicitudes de permisos y vacaciones.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Nueva Solicitud
          </button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'pending_immediate_supervisor', label: 'Pendiente Supervisor' },
              { key: 'pending_area_manager', label: 'Pendiente Jefe Área' },
              { key: 'pending_hr', label: 'Pendiente HR' },
              { key: 'approved', label: 'Aprobados' },
              { key: 'rejected', label: 'Rechazados' },
            ].map((status) => (
              <button
                key={status.key}
                onClick={() => setStatusFilter(status.key)}
                className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium ${
                  statusFilter === status.key
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {status.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Permissions Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fechas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comentarios
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                      </td>
                    </tr>
                  ) : permissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No se encontraron solicitudes de permisos.
                      </td>
                    </tr>
                  ) : (
                    permissions.map((permission) => (
                      <tr key={permission.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
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
                            {permissionStatusLabels[permission.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {permission.comments || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2">
                            {canEdit(permission) && (
                              <button
                                onClick={() => handleEdit(permission)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                            )}
                            {canDelete(permission) && (
                              <button
                                onClick={() => handleDelete(permission.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            )}
                          </div>
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

      {/* Permission Form Modal */}
      {isFormOpen && (
        <PermissionForm
          permission={editingPermission}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}