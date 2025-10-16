'use client';

import { useEffect } from 'react';
import { useAdminStore } from '@/store/admin.store';

export default function AdminDashboard() {
  const { stats, fetchStats, isLoading } = useAdminStore();

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Usuarios Totales', value: stats?.totalUsuarios || 0, icon: '👥', gradient: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)' },
    { label: 'Tutores', value: stats?.totalTutores || 0, icon: '👨‍👩‍👧', gradient: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)' },
    { label: 'Docentes', value: stats?.totalDocentes || 0, icon: '👨‍🏫', gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' },
    { label: 'Estudiantes', value: stats?.totalEstudiantes || 0, icon: '🎓', gradient: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)' },
    { label: 'Clases Totales', value: stats?.totalClases || 0, icon: '📚', gradient: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)' },
    { label: 'Clases Activas', value: stats?.clasesActivas || 0, icon: '✅', gradient: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-fredoka)]">
        Dashboard Administrativo
      </h1>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-gray-600 mt-4">Cargando estadísticas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center shadow-md"
                  style={{ background: card.gradient }}
                >
                  <span className="text-3xl">{card.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-fredoka)] mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/admin/usuarios"
            className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-lg transition-all"
          >
            <div
              className="w-14 h-14 rounded-lg flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)' }}
            >
              <span className="text-3xl">👥</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Gestionar Usuarios</p>
              <p className="text-sm text-gray-600">Ver y administrar todos los usuarios</p>
            </div>
          </a>
          <a
            href="/admin/clases"
            className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-lg transition-all"
          >
            <div
              className="w-14 h-14 rounded-lg flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)' }}
            >
              <span className="text-3xl">📚</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Gestionar Clases</p>
              <p className="text-sm text-gray-600">Ver y administrar todas las clases</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
