'use client';
import { Button } from '@/components/ui';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAsistenciaStore } from '@/store/asistencia.store';
import { useDocenteStore } from '@/store/docente.store';
import { AttendanceList, AttendanceStatsCard } from '@/components/docente';
import { MarcarAsistenciaDto } from '@/types/asistencia.types';

/**
 * Página de Registro de Asistencia
 *
 * Permite al docente:
 * - Ver la lista completa de estudiantes inscritos
 * - Marcar asistencia (Presente, Ausente, Justificado, Tardanza)
 * - Asignar puntos por asistencia
 * - Agregar observaciones
 * - Ver estadísticas en tiempo real
 */
export default function AsistenciaPage() {
  const params = useParams();
  const router = useRouter();
  const claseId = params.id as string;

  const {
    listaAsistencia,
    fetchListaAsistencia,
    marcarAsistencia,
    isLoading,
    isLoadingMarcacion,
    error,
  } = useAsistenciaStore();

  const { claseActual, fetchClaseDetalle } = useDocenteStore();

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  /**
   * Cargar datos al montar el componente
   */
  useEffect(() => {
    if (claseId) {
      fetchClaseDetalle(claseId);
      fetchListaAsistencia(claseId);
    }
  }, [claseId]);

  /**
   * Manejar marcación de asistencia
   */
  const handleMarcarAsistencia = async (
    estudiante_id: string,
    data: MarcarAsistenciaDto
  ): Promise<boolean> => {
    const success = await marcarAsistencia(claseId, estudiante_id, data);

    if (success) {
      // Mostrar mensaje de éxito temporal
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }

    return success;
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

  return (
    <div className="space-y-8">
      {/* Breadcrumb y navegación */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <button
          onClick={() => router.push('/docente/mis-clases')}
          className="hover:text-[#ff6b35] transition-colors"
        >
          Mis Clases
        </button>
        <span>/</span>
        <span className="text-[#2a1a5e] font-semibold">Registro de Asistencia</span>
      </div>

      {/* Header con información de la clase */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35]"></div>
          <p className="text-gray-600 mt-4">Cargando información...</p>
        </div>
      ) : claseActual ? (
        (() => {
          const rutaCurricular =
            claseActual.ruta_curricular ?? claseActual.rutaCurricular ?? undefined;
          const cupoMaximo = claseActual.cupo_maximo ?? 0;
          const cuposOcupados =
            claseActual.cupos_ocupados ?? claseActual._count?.inscripciones ?? 0;
          const cuposDisponibles = Math.max(cupoMaximo - cuposOcupados, 0);

          return (
        <div
          className="bg-white rounded-lg shadow-md p-6 border-l-4"
          style={{
            borderLeftColor: rutaCurricular?.color || '#ff6b35',
          }}
        >
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[#2a1a5e]">
                {claseActual.titulo}
              </h1>
              {claseActual.descripcion && (
                <p className="text-gray-600 mt-2">{claseActual.descripcion}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <span>📅</span>
                  {formatFecha(claseActual.fecha_hora_inicio)}
                </span>
                <span className="flex items-center gap-2">
                  <span>⏱️</span>
                  {claseActual.duracion_minutos} minutos
                </span>
                <span className="flex items-center gap-2">
                  <span>👥</span>
                  {cuposOcupados}/{cupoMaximo} inscritos
                  {` (${cuposDisponibles} disponibles)`}
                </span>
                {rutaCurricular && (
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: `${rutaCurricular.color}20`,
                      color: rutaCurricular.color,
                    }}
                  >
                    {rutaCurricular.nombre}
                  </span>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/docente/mis-clases')}
            >
              ← Volver a Mis Clases
            </Button>
          </div>
        </div>
          );
        })()
      ) : null}

      {/* Mensaje de éxito */}
      {showSuccessMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3 animate-fade-in">
          <span className="text-2xl">✅</span>
          <span className="font-semibold">
            Asistencia guardada correctamente
          </span>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
          <span className="text-2xl">❌</span>
          <span>{error}</span>
        </div>
      )}

      {/* Estadísticas de asistencia */}
      {listaAsistencia && (
        <AttendanceStatsCard
          total={listaAsistencia.estadisticas.total}
          presentes={listaAsistencia.estadisticas.presentes}
          ausentes={listaAsistencia.estadisticas.ausentes}
          justificados={listaAsistencia.estadisticas.justificados}
          tardanzas={listaAsistencia.estadisticas.tardanzas}
          pendientes={listaAsistencia.estadisticas.pendientes}
        />
      )}

      {/* Lista de estudiantes */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-[#ff6b35]"></div>
          <p className="text-gray-600 mt-4">Cargando lista de estudiantes...</p>
        </div>
      ) : listaAsistencia ? (
        <AttendanceList
          inscripciones={listaAsistencia.inscripciones}
          onMarcarAsistencia={handleMarcarAsistencia}
          isLoading={isLoadingMarcacion}
        />
      ) : null}

      {/* Acciones finales */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#2a1a5e]">
              ¿Terminaste de registrar?
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Puedes volver a editar la asistencia en cualquier momento
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => router.push('/docente/mis-clases')}
          >
            Finalizar y Volver
          </Button>
        </div>
      </div>

      {/* Ayuda rápida */}
      <div className="bg-[#fff9e6] border-2 border-[#f7b801] rounded-lg p-6">
        <h3 className="text-lg font-bold text-[#2a1a5e] mb-3 flex items-center gap-2">
          <span>💡</span>
          Ayuda Rápida
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-[#ff6b35] font-bold">•</span>
            <span>
              <strong>Presente (✅):</strong> Estudiante asistió puntualmente - 10 puntos
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#ff6b35] font-bold">•</span>
            <span>
              <strong>Tardanza (⏰):</strong> Estudiante llegó tarde - 5 puntos
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#ff6b35] font-bold">•</span>
            <span>
              <strong>Justificado (📝):</strong> Ausencia con justificación - 7 puntos
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#ff6b35] font-bold">•</span>
            <span>
              <strong>Ausente (❌):</strong> No asistió sin justificar - 0 puntos
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#ff6b35] font-bold">•</span>
            <span>
              Haz clic en el botón <strong>▼</strong> para agregar observaciones y ajustar puntos
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
