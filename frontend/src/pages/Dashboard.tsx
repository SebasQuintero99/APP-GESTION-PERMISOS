import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { permissionStatusLabels, formatDate } from '../utils';

interface DashboardStats {
  totalPermissions: number;
  pendingPermissions: number;
  approvedPermissions: number;
  rejectedPermissions: number;
}

interface RecentPermission {
  id: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPermissions: 0,
    pendingPermissions: 0,
    approvedPermissions: 0,
    rejectedPermissions: 0,
  });
  const [recentPermissions, setRecentPermissions] = useState<RecentPermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user's permissions for stats
        const permissionsResponse = await apiService.getMyPermissions({ limit: 100 });
        const permissions = permissionsResponse.permissions;

        // Calculate stats
        const newStats = {
          totalPermissions: permissions.length,
          pendingPermissions: permissions.filter(p => 
            p.status.includes('pending')
          ).length,
          approvedPermissions: permissions.filter(p => 
            p.status === 'approved'
          ).length,
          rejectedPermissions: permissions.filter(p => 
            p.status === 'rejected'
          ).length,
        };

        setStats(newStats);
        
        // Set recent permissions (last 5)
        setRecentPermissions(permissions.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon, color }: {
    title: string;
    value: number;
    icon: string;
    color: string;
  }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-2xl">{icon}</span>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className={`text-lg font-medium ${color}`}>{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-b border-gray-200 pb-4 mb-8">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">
          Bienvenido, {user?.firstName}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Resumen de tu actividad en el sistema de permisos
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total de Permisos"
          value={stats.totalPermissions}
          icon="📊"
          color="text-blue-600"
        />
        <StatCard
          title="Pendientes"
          value={stats.pendingPermissions}
          icon="⏳"
          color="text-yellow-600"
        />
        <StatCard
          title="Aprobados"
          value={stats.approvedPermissions}
          icon="✅"
          color="text-green-600"
        />
        <StatCard
          title="Rechazados"
          value={stats.rejectedPermissions}
          icon="❌"
          color="text-red-600"
        />
      </div>

      {/* Recent Permissions */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Solicitudes Recientes
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Tus últimas solicitudes de permisos
          </p>
        </div>
        <ul className="divide-y divide-gray-200">
          {recentPermissions.length > 0 ? (
            recentPermissions.map((permission) => (
              <li key={permission.id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {permission.type}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(permission.startDate)} - {formatDate(permission.endDate)}
                        </div>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          permission.status.includes('pending') 
                            ? 'bg-yellow-100 text-yellow-800'
                            : permission.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {permissionStatusLabels[permission.status]}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Creado el {formatDate(permission.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-8 text-center text-gray-500">
              No tienes solicitudes de permisos aún.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}