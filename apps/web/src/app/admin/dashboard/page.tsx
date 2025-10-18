'use client';

import { useEffect } from 'react';
import { useAdminStore } from '@/store/admin.store';

export default function AdminDashboard() {
  const { stats, fetchStats, isLoading } = useAdminStore();

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Usuarios Totales', value: stats?.totalUsuarios || 0, icon: '👥', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { label: 'Tutores', value: stats?.totalTutores || 0, icon: '👨‍👩‍👧', gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' },
    { label: 'Docentes', value: stats?.totalDocentes || 0, icon: '👨‍🏫', gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' },
    { label: 'Estudiantes', value: stats?.totalEstudiantes || 0, icon: '🎓', gradient: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)' },
    { label: 'Clases Totales', value: stats?.totalClases || 0, icon: '📚', gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' },
    { label: 'Clases Activas', value: stats?.clasesActivas || 0, icon: '✅', gradient: 'linear-gradient(135deg, #34d399 0%, #059669 100%)' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">
        Dashboard Administrativo
      </h1>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-emerald-400 border-t-transparent"></div>
          <p className="text-white/60 mt-4">Cargando estadísticas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="backdrop-blur-xl bg-emerald-500/[0.05] border border-emerald-500/20 rounded-2xl shadow-2xl shadow-emerald-500/10 p-6 hover:shadow-emerald-500/20 hover:bg-emerald-500/[0.08] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-white">{card.value}</p>
                </div>
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: card.gradient }}
                >
                  <span className="text-3xl">{card.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="backdrop-blur-xl bg-emerald-500/[0.05] border border-emerald-500/20 rounded-2xl shadow-2xl shadow-emerald-500/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/admin/usuarios"
            className="flex items-center gap-4 p-4 border border-emerald-500/20 rounded-xl hover:border-emerald-400/40 hover:bg-emerald-500/[0.08] hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 group"
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              <span className="text-3xl">👥</span>
            </div>
            <div>
              <p className="font-semibold text-white">Gestionar Usuarios</p>
              <p className="text-sm text-white/60">Ver y administrar todos los usuarios</p>
            </div>
          </a>
          <a
            href="/admin/clases"
            className="flex items-center gap-4 p-4 border border-emerald-500/20 rounded-xl hover:border-emerald-400/40 hover:bg-emerald-500/[0.08] hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 group"
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
              style={{ background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' }}
            >
              <span className="text-3xl">📚</span>
            </div>
            <div>
              <p className="font-semibold text-white">Gestionar Clases</p>
              <p className="text-sm text-white/60">Ver y administrar todas las clases</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
