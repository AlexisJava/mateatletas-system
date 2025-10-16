'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDocenteStore } from '@/store/docente.store';
import { useAsistenciaStore } from '@/store/asistencia.store';
import { Button } from '@/components/ui';
import { EstadoClase } from '@/types/clases.types';

/**
 * Dashboard Docente
 *
 * Muestra un resumen del panel del docente:
 * - Próximas clases
 * - Estadísticas de asistencia
 * - Acciones rápidas
 */
export default function DocenteDashboard() {
  const router = useRouter();
  const { misClases, fetchMisClases, isLoading } = useDocenteStore();
  const {
    resumenDocente,
    fetchResumenDocente,
    isLoading: isLoadingResumen,
  } = useAsistenciaStore();

  /**
   * Cargar datos al montar el componente
   */
  useEffect(() => {
    fetchMisClases(false); // Solo clases activas
    fetchResumenDocente();
  }, []);

  /**
   * Filtrar próximas clases (solo programadas)
   */
  const proximasClases = (misClases || [])
    .filter((clase) => clase.estado === EstadoClase.Programada)
    .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
    .slice(0, 5);

  /**
   * Navegar a una clase específica
   */
  const handleVerClase = (claseId: string) => {
    router.push(`/docente/clases/${claseId}/asistencia`);
  };

  /**
   * Formatear fecha
   */
  const formatFecha = (isoDate: string) => {
    const date = new Date(isoDate);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('es-ES', options);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-indigo-900 dark:text-white">
          Dashboard Docente
        </h1>
        <p className="text-purple-600 dark:text-purple-300 mt-2">
          Bienvenido al panel de gestión de clases y asistencia
        </p>
      </div>

      {/* Grid de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total de clases */}
        <div className="glass-card p-6 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-300 mb-1 font-medium">Total de Clases</p>
              <p className="text-3xl font-bold text-indigo-900 dark:text-white">
                {isLoading ? '...' : (misClases?.length || 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/40">
              <span className="text-2xl">📚</span>
            </div>
          </div>
        </div>

        {/* Próximas clases */}
        <div className="glass-card p-6 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-300 mb-1 font-medium">Próximas Clases</p>
              <p className="text-3xl font-bold text-indigo-900 dark:text-white">
                {isLoading ? '...' : proximasClases.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/40">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        {/* Tasa de asistencia promedio */}
        <div className="glass-card p-6 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-300 mb-1 font-medium">Asistencia Promedio</p>
              <p className="text-3xl font-bold text-indigo-900 dark:text-white">
                {isLoadingResumen
                  ? '...'
                  : resumenDocente
                    ? `${Math.round(resumenDocente.promedioAsistencia)}%`
                    : 'N/A'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/40">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Próximas clases */}
      <div className="glass-card-strong p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-indigo-900 dark:text-white">
            Próximas Clases
          </h2>
          <button
            onClick={() => router.push('/docente/mis-clases')}
            className="px-4 py-2 rounded-lg bg-purple-100/60 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200 font-semibold hover:bg-purple-200/70 dark:hover:bg-purple-800/50 transition-all text-sm"
          >
            Ver todas
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 dark:border-purple-400 border-t-transparent"></div>
            <p className="text-purple-600 dark:text-purple-300 mt-4">Cargando clases...</p>
          </div>
        ) : proximasClases.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-6xl">📭</span>
            <p className="text-purple-600 dark:text-purple-300 mt-4">No tienes clases programadas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {proximasClases.map((clase) => (
              <div
                key={clase.id}
                className="flex items-center justify-between p-4 bg-white/30 dark:bg-indigo-900/20 border border-purple-200/40 dark:border-purple-700/40 rounded-xl hover:bg-white/50 dark:hover:bg-indigo-900/30 hover:shadow-lg hover:shadow-purple-200/20 dark:hover:shadow-purple-900/30 transition-all"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-indigo-900 dark:text-white">
                    {clase.titulo}
                  </h3>
                  <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">
                    {formatFecha(clase.fechaHora)} • {clase.duracionMinutos} min
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-purple-500 dark:text-purple-400">
                      Cupo: {clase.cupoDisponible}/{clase.cupoMaximo}
                    </span>
                    {clase.rutaCurricular && (
                      <span
                        className="text-xs px-2 py-1 rounded-full font-semibold"
                        style={{
                          backgroundColor: `${clase.rutaCurricular.color}20`,
                          color: clase.rutaCurricular.color,
                        }}
                      >
                        {clase.rutaCurricular.nombre}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleVerClase(clase.id)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/50 transition-all text-sm"
                >
                  Ver Clase
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="glass-card-strong p-6">
        <h2 className="text-xl font-bold text-indigo-900 dark:text-white mb-6">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/docente/mis-clases')}
            className="flex items-center gap-4 p-4 bg-white/30 dark:bg-indigo-900/20 border border-purple-200/40 dark:border-purple-700/40 rounded-xl hover:bg-white/50 dark:hover:bg-indigo-900/30 hover:shadow-lg hover:shadow-purple-200/20 dark:hover:shadow-purple-900/30 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/40">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <p className="font-semibold text-indigo-900 dark:text-white">Ver Mis Clases</p>
              <p className="text-sm text-purple-600 dark:text-purple-300">
                Gestiona todas tus clases programadas
              </p>
            </div>
          </button>

          <button
            onClick={() => router.push('/docente/perfil')}
            className="flex items-center gap-4 p-4 bg-white/30 dark:bg-indigo-900/20 border border-purple-200/40 dark:border-purple-700/40 rounded-xl hover:bg-white/50 dark:hover:bg-indigo-900/30 hover:shadow-lg hover:shadow-purple-200/20 dark:hover:shadow-purple-900/30 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/40">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <p className="font-semibold text-indigo-900 dark:text-white">Mi Perfil</p>
              <p className="text-sm text-purple-600 dark:text-purple-300">
                Actualiza tu información personal
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
