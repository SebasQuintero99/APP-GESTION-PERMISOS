import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Permission, PermissionFormData } from '../../types';
import { permissionTypeLabels, formatDateForInput } from '../../utils';
import { usePermissions } from '../../hooks/usePermissions';

interface PermissionFormProps {
  permission?: Permission | null;
  onClose: (refreshData?: boolean) => void;
}

export default function PermissionForm({ permission, onClose }: PermissionFormProps) {
  const { createPermission, updatePermission, loading } = usePermissions();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PermissionFormData>();

  const startDate = watch('startDate');

  useEffect(() => {
    if (permission) {
      setValue('type', permission.type);
      setValue('startDate', formatDateForInput(permission.startDate));
      setValue('endDate', formatDateForInput(permission.endDate));
      setValue('comments', permission.comments || '');
    }
  }, [permission, setValue]);

  const onSubmit = async (data: PermissionFormData) => {
    let success = false;

    if (permission) {
      // Update existing permission
      success = await updatePermission(permission.id, data);
    } else {
      // Create new permission
      success = await createPermission(data);
    }

    if (success) {
      onClose(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {permission ? 'Editar Solicitud' : 'Nueva Solicitud de Permiso'}
          </h3>
          <button
            onClick={() => onClose()}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
          {/* Permission Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Tipo de Permiso
            </label>
            <select
              {...register('type', { required: 'El tipo de permiso es requerido' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Seleccionar tipo...</option>
              {Object.entries(permissionTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Fecha de Inicio
            </label>
            <input
              type="date"
              {...register('startDate', {
                required: 'La fecha de inicio es requerida',
                validate: (value) => {
                  const today = new Date().toISOString().split('T')[0];
                  if (value < today) {
                    return 'La fecha de inicio no puede ser anterior a hoy';
                  }
                },
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              Fecha de Fin
            </label>
            <input
              type="date"
              {...register('endDate', {
                required: 'La fecha de fin es requerida',
                validate: (value) => {
                  if (startDate && value <= startDate) {
                    return 'La fecha de fin debe ser posterior a la fecha de inicio';
                  }
                },
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
            )}
          </div>

          {/* Comments */}
          <div>
            <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
              Comentarios (opcional)
            </label>
            <textarea
              {...register('comments')}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Motivo de la solicitud o información adicional..."
            />
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
              disabled={loading}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </div>
              ) : (
                permission ? 'Actualizar' : 'Crear Solicitud'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}