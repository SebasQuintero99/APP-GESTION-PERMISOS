import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Permission, ApprovePrmissionData } from '../../types';
import { 
  permissionTypeLabels, 
  formatDate, 
  formatFullName 
} from '../../utils';
import { usePermissions } from '../../hooks/usePermissions';

interface ApprovalModalProps {
  permission: Permission;
  onClose: (refreshData?: boolean) => void;
}

export default function ApprovalModal({ permission, onClose }: ApprovalModalProps) {
  const { approvePermission, loading } = usePermissions();
  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ comments: string }>();

  const onSubmit = async (data: { comments: string }) => {
    if (!decision) return;

    const approvalData: ApprovePrmissionData = {
      status: decision,
      comments: data.comments,
    };

    const success = await approvePermission(permission.id, approvalData);
    if (success) {
      onClose(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Procesar Solicitud de Permiso
          </h3>
          <button
            onClick={() => onClose()}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Permission Details */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 mb-4">Detalles de la Solicitud</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Empleado:</span>
              <p className="text-sm text-gray-900">
                {formatFullName(
                  permission.employee?.firstName || '',
                  permission.employee?.lastName || ''
                )}
              </p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Tipo:</span>
              <p className="text-sm text-gray-900">
                {permissionTypeLabels[permission.type]}
              </p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Fecha inicio:</span>
              <p className="text-sm text-gray-900">
                {formatDate(permission.startDate)}
              </p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Fecha fin:</span>
              <p className="text-sm text-gray-900">
                {formatDate(permission.endDate)}
              </p>
            </div>
            
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-500">Días hábiles:</span>
              <p className="text-sm text-gray-900">{permission.businessDays}</p>
            </div>
            
            {permission.comments && (
              <div className="md:col-span-2">
                <span className="text-sm font-medium text-gray-500">Comentarios del empleado:</span>
                <p className="text-sm text-gray-900">{permission.comments}</p>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          {/* Decision Buttons */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Decisión
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setDecision('approved')}
                className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  decision === 'approved'
                    ? 'bg-green-100 border-green-500 text-green-700 ring-green-500'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <CheckIcon className="h-5 w-5 mr-2" />
                Aprobar
              </button>
              
              <button
                type="button"
                onClick={() => setDecision('rejected')}
                className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  decision === 'rejected'
                    ? 'bg-red-100 border-red-500 text-red-700 ring-red-500'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <XMarkIcon className="h-5 w-5 mr-2" />
                Rechazar
              </button>
            </div>
          </div>

          {/* Comments */}
          <div className="mb-6">
            <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
              Comentarios {decision === 'rejected' ? '(requerido)' : '(opcional)'}
            </label>
            <textarea
              {...register('comments', {
                required: decision === 'rejected' ? 'Los comentarios son requeridos para rechazar una solicitud' : false,
              })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Motivo de la decisión o información adicional..."
            />
            {errors.comments && (
              <p className="mt-1 text-sm text-red-600">{errors.comments.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => onClose()}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !decision}
              className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 ${
                decision === 'approved'
                  ? 'bg-green-600 hover:bg-green-700'
                  : decision === 'rejected'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gray-400'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </div>
              ) : (
                `${decision === 'approved' ? 'Aprobar' : decision === 'rejected' ? 'Rechazar' : 'Procesar'} Solicitud`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}