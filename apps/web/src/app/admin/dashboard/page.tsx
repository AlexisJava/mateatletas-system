'use client';

import { useEffect } from 'react';
import { useAdminStore } from '@/store/admin.store';

export default function AdminDashboard() {
  const { stats, fetchStats, isLoading } = useAdminStore();

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Usuarios Totales', value: stats?.totalUsuarios || 0, icon: '👥', color: 'from-blue-500 to-blue-600' },
    { label: 'Tutores', value: stats?.totalTutores || 0, icon: '👨‍👩‍👧', color: 'from-green-500 to-green-600' },
    { label: 'Docentes', value: stats?.totalDocentes || 0, icon: '👨‍🏫', color: 'from-purple-500 to-purple-600' },
    { label: 'Estudiantes', value: stats?.totalEstudiantes || 0, icon: '🎓', color: 'from-orange-500 to-orange-600' },
    { label: 'Clases Totales', value: stats?.totalClases || 0, icon: '📚', color: 'from-pink-500 to-pink-600' },
    { label: 'Clases Activas', value: stats?.clasesActivas || 0, icon: '✅', color: 'from-teal-500 to-teal-600' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-[#2a1a5e]">Dashboard Administrativo</h1>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-[#ff6b35]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#ff6b35]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-[#2a1a5e]">{card.value}</p>
                </div>
                <div className={`w-16 h-16 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center shadow-lg`}>
                  <span className="text-3xl">{card.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-[#2a1a5e] mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/admin/usuarios" className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-[#ff6b35] hover:shadow-md transition-all">
            <span className="text-4xl">👥</span>
            <div>
              <p className="font-semibold text-[#2a1a5e]">Gestionar Usuarios</p>
              <p className="text-sm text-gray-600">Ver y administrar todos los usuarios</p>
            </div>
          </a>
          <a href="/admin/clases" className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-[#ff6b35] hover:shadow-md transition-all">
            <span className="text-4xl">📚</span>
            <div>
              <p className="font-semibold text-[#2a1a5e]">Gestionar Clases</p>
              <p className="text-sm text-gray-600">Ver y administrar todas las clases</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
