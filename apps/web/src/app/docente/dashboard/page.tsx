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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#2a1a5e]">Dashboard Docente</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido al panel de gestión de clases y asistencia
        </p>
      </div>

      {/* Grid de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total de clases */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#ff6b35]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Clases</p>
              <p className="text-3xl font-bold text-[#2a1a5e]">
                {isLoading ? '...' : (misClases?.length || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#ff6b35]/10 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
          </div>
        </div>

        {/* Próximas clases */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#f7b801]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Próximas Clases</p>
              <p className="text-3xl font-bold text-[#2a1a5e]">
                {isLoading ? '...' : proximasClases.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#f7b801]/10 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        {/* Tasa de asistencia promedio */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#4caf50]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Asistencia Promedio</p>
              <p className="text-3xl font-bold text-[#2a1a5e]">
                {isLoadingResumen
                  ? '...'
                  : resumenDocente
                    ? `${Math.round(resumenDocente.promedioAsistencia)}%`
                    : 'N/A'}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#4caf50]/10 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Próximas clases */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#2a1a5e]">Próximas Clases</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/docente/mis-clases')}
          >
            Ver todas
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35]"></div>
            <p className="text-gray-600 mt-4">Cargando clases...</p>
          </div>
        ) : proximasClases.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-6xl">📭</span>
            <p className="text-gray-600 mt-4">No tienes clases programadas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {proximasClases.map((clase) => (
              <div
                key={clase.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#ff6b35] hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#2a1a5e]">
                    {clase.titulo}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatFecha(clase.fechaHora)} • {clase.duracionMinutos} min
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-500">
                      Cupo: {clase.cupoDisponible}/{clase.cupoMaximo}
                    </span>
                    {clase.rutaCurricular && (
                      <span
                        className="text-xs px-2 py-1 rounded-full"
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

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleVerClase(clase.id)}
                >
                  Ver Clase
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-[#2a1a5e] mb-6">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/docente/mis-clases')}
            className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-[#ff6b35] hover:shadow-md transition-all text-left"
          >
            <div className="w-12 h-12 bg-[#ff6b35]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <p className="font-semibold text-[#2a1a5e]">Ver Mis Clases</p>
              <p className="text-sm text-gray-600">
                Gestiona todas tus clases programadas
              </p>
            </div>
          </button>

          <button
            onClick={() => router.push('/docente/perfil')}
            className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-[#ff6b35] hover:shadow-md transition-all text-left"
          >
            <div className="w-12 h-12 bg-[#f7b801]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <p className="font-semibold text-[#2a1a5e]">Mi Perfil</p>
              <p className="text-sm text-gray-600">
                Actualiza tu información personal
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
