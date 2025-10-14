'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDocenteStore } from '@/store/docente.store';
import { Button } from '@/components/ui';
import { Clase, EstadoClase } from '@/types/clases.types';

/**
 * Mis Clases - Vista del docente
 *
 * Muestra todas las clases del docente con opciones para:
 * - Ver detalles de una clase
 * - Registrar asistencia
 * - Cancelar clase
 * - Filtrar por estado
 */
export default function MisClasesPage() {
  const router = useRouter();
  const {
    misClases,
    fetchMisClases,
    cancelarClase,
    mostrarClasesPasadas,
    toggleMostrarClasesPasadas,
    isLoading,
    isLoadingAction,
    error,
  } = useDocenteStore();

  const [claseACancelar, setClaseACancelar] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<EstadoClase | 'Todas'>('Todas');

  /**
   * Cargar clases al montar el componente
   */
  useEffect(() => {
    fetchMisClases();
  }, []);

  /**
   * Filtrar clases por estado
   */
  const clasesFiltradas = (misClases || []).filter((clase) => {
    if (filtroEstado === 'Todas') return true;
    return clase.estado === filtroEstado;
  });

  /**
   * Ordenar clases por fecha (más recientes primero)
   */
  const clasesOrdenadas = [...clasesFiltradas].sort(
    (a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
  );

  /**
   * Manejar cancelación de clase
   */
  const handleCancelar = async (claseId: string) => {
    const success = await cancelarClase(claseId);
    if (success) {
      setClaseACancelar(null);
    }
  };

  /**
   * Formatear fecha
   */
  const formatFecha = (isoDate: string) => {
    const date = new Date(isoDate);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('es-ES', options);
  };

  /**
   * Obtener color del estado
   */
  const getEstadoColor = (estado: EstadoClase) => {
    switch (estado) {
      case EstadoClase.Programada:
        return 'bg-[#4caf50] text-white';
      case EstadoClase.EnCurso:
        return 'bg-[#f7b801] text-[#2a1a5e]';
      case EstadoClase.Finalizada:
        return 'bg-gray-400 text-white';
      case EstadoClase.Cancelada:
        return 'bg-[#f44336] text-white';
      default:
        return 'bg-gray-300 text-gray-800';
    }
  };

  /**
   * Determinar si se puede cancelar una clase
   */
  const puedeCancelar = (clase: Clase) => {
    return clase.estado === EstadoClase.Programada;
  };

  /**
   * Determinar si se puede registrar asistencia
   */
  const puedeRegistrarAsistencia = (clase: Clase) => {
    return (
      clase.estado === EstadoClase.Programada ||
      clase.estado === EstadoClase.EnCurso ||
      clase.estado === EstadoClase.Finalizada
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#2a1a5e]">Mis Clases</h1>
        <p className="text-gray-600 mt-2">
          Gestiona todas tus clases programadas
        </p>
      </div>

      {/* Filtros y controles */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Filtro por estado */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">
              Filtrar por estado:
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as EstadoClase | 'Todas')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
            >
              <option value="Todas">Todas</option>
              <option value={EstadoClase.Programada}>Programadas</option>
              <option value={EstadoClase.EnCurso}>En Curso</option>
              <option value={EstadoClase.Finalizada}>Finalizadas</option>
              <option value={EstadoClase.Cancelada}>Canceladas</option>
            </select>
          </div>

          {/* Toggle clases pasadas */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={mostrarClasesPasadas}
                onChange={toggleMostrarClasesPasadas}
                className="w-4 h-4 text-[#ff6b35] rounded focus:ring-[#ff6b35]"
              />
              <span className="text-sm text-gray-700">Mostrar clases pasadas</span>
            </label>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-4 text-sm text-gray-600">
          {clasesOrdenadas.length} clase(s) encontrada(s)
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Lista de clases */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-[#ff6b35]"></div>
          <p className="text-gray-600 mt-4">Cargando clases...</p>
        </div>
      ) : clasesOrdenadas.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <span className="text-6xl">📭</span>
          <h3 className="text-xl font-bold text-[#2a1a5e] mt-4">
            No hay clases
          </h3>
          <p className="text-gray-600 mt-2">
            {filtroEstado === 'Todas'
              ? 'No tienes clases programadas'
              : `No tienes clases con estado "${filtroEstado}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {clasesOrdenadas.map((clase) => (
            <div
              key={clase.id}
              className="bg-white rounded-lg shadow-md p-6 border-l-4"
              style={{
                borderLeftColor: clase.rutaCurricular?.color || '#ff6b35',
              }}
            >
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                {/* Información de la clase */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-[#2a1a5e]">
                      {clase.titulo}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(clase.estado)}`}
                    >
                      {clase.estado}
                    </span>
                  </div>

                  {clase.descripcion && (
                    <p className="text-gray-600 mb-3">{clase.descripcion}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <span>📅</span>
                      {formatFecha(clase.fechaHora)}
                    </span>
                    <span className="flex items-center gap-2">
                      <span>⏱️</span>
                      {clase.duracionMinutos} minutos
                    </span>
                    <span className="flex items-center gap-2">
                      <span>👥</span>
                      {clase.cupoMaximo - clase.cupoDisponible}/{clase.cupoMaximo} inscritos
                    </span>
                    {clase.rutaCurricular && (
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
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

                {/* Acciones */}
                <div className="flex flex-col gap-2 lg:w-48">
                  {puedeRegistrarAsistencia(clase) && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        router.push(`/docente/clases/${clase.id}/asistencia`)
                      }
                    >
                      📝 Asistencia
                    </Button>
                  )}

                  {puedeCancelar(clase) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setClaseACancelar(clase.id)}
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      ❌ Cancelar
                    </Button>
                  )}
                </div>
              </div>

              {/* Modal de confirmación de cancelación */}
              {claseACancelar === clase.id && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                    <h3 className="text-xl font-bold text-[#2a1a5e] mb-4">
                      ¿Cancelar clase?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      ¿Estás seguro de que deseas cancelar la clase &quot;{clase.titulo}
                      &quot;? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setClaseACancelar(null)}
                        disabled={isLoadingAction}
                      >
                        No, mantener
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => handleCancelar(clase.id)}
                        isLoading={isLoadingAction}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Sí, cancelar clase
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
