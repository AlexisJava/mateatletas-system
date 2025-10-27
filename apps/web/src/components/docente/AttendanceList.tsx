'use client';

import { useState } from 'react';
import Image from 'next/image';
import { InscripcionConAsistencia, EstadoAsistencia, MarcarAsistenciaDto } from '@/types/asistencia.types';
import AttendanceStatusButton from './AttendanceStatusButton';

interface AttendanceListProps {
  /** Lista de inscripciones con asistencia */
  inscripciones: InscripcionConAsistencia[];
  /** Callback para marcar asistencia */
  onMarcarAsistencia: (
    _estudianteId: string,
    _data: MarcarAsistenciaDto
  ) => Promise<boolean>;
  /** Si está guardando */
  isLoading?: boolean;
}

/**
 * AttendanceList - Lista de estudiantes para registro de asistencia
 *
 * Muestra una tabla/lista con todos los estudiantes inscritos en una clase
 * y permite al docente:
 * - Marcar estado de asistencia (Presente, Ausente, Justificado, Tardanza)
 * - Asignar puntos por asistencia
 * - Agregar observaciones
 *
 * @example
 * ```tsx
 * <AttendanceList
 *   inscripciones={listaAsistencia.inscripciones}
 *   onMarcarAsistencia={handleMarcar}
 *   isLoading={isLoadingMarcacion}
 * />
 * ```
 */
export default function AttendanceList({
  inscripciones,
  onMarcarAsistencia,
  isLoading = false,
}: AttendanceListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [observaciones, setObservaciones] = useState<Record<string, string>>({});
  const [puntos, setPuntos] = useState<Record<string, number>>({});
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  /**
   * Manejar cambio de estado de asistencia
   */
  const handleStatusChange = async (
    estudianteId: string,
    estado: EstadoAsistencia
  ) => {
    // Determinar puntos por defecto según el estado
    let puntosDefault = 0;
    switch (estado) {
      case EstadoAsistencia.Presente:
        puntosDefault = 10;
        break;
      case EstadoAsistencia.Tardanza:
        puntosDefault = 5;
        break;
      case EstadoAsistencia.Justificado:
        puntosDefault = 7;
        break;
      case EstadoAsistencia.Ausente:
        puntosDefault = 0;
        break;
    }

    const data: MarcarAsistenciaDto = {
      estudianteId,
      estado,
      puntosOtorgados: puntos[estudianteId] ?? puntosDefault,
      observaciones: observaciones[estudianteId] ?? undefined,
    };

    const success = await onMarcarAsistencia(estudianteId, data);

    if (success) {
      // Limpiar campos después de guardar
      setObservaciones((prev) => {
        const newObs = { ...prev };
        delete newObs[estudianteId];
        return newObs;
      });
      setPuntos((prev) => {
        const newPuntos = { ...prev };
        delete newPuntos[estudianteId];
        return newPuntos;
      });
      setExpandedId(null);

      // Mostrar toast de confirmación
      mostrarToast('✅ Asistencia registrada correctamente');
    }
  };

  /**
   * Marcar todos los estudiantes como presentes
   */
  const marcarTodosPresentes = async () => {
    if (isMarkingAll || isLoading) return;

    // Confirmar acción
    if (!window.confirm(`¿Estás seguro de marcar a todos los ${inscripciones.length} estudiantes como presentes?`)) {
      return;
    }

    setIsMarkingAll(true);
    let exitosos = 0;
    let fallidos = 0;

    for (const inscripcion of inscripciones) {
      const estudianteId = inscripcion.estudiante.id;

      // Solo marcar si no tiene asistencia registrada
      if (!inscripcion.asistencia) {
        const data: MarcarAsistenciaDto = {
          estudianteId,
          estado: EstadoAsistencia.Presente,
          puntosOtorgados: 10,
        };

        const success = await onMarcarAsistencia(estudianteId, data);
        if (success) {
          exitosos++;
        } else {
          fallidos++;
        }
      }
    }

    setIsMarkingAll(false);

    if (fallidos === 0) {
      mostrarToast(`✅ ${exitosos} estudiantes marcados como presentes`);
    } else {
      mostrarToast(`⚠️ ${exitosos} exitosos, ${fallidos} fallidos`);
    }
  };

  /**
   * Mostrar toast de notificación
   */
  const mostrarToast = (mensaje: string) => {
    setToastMessage(mensaje);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  /**
   * Calcular cuántos estudiantes faltan por marcar
   */
  const calcularPendientes = () => {
    return inscripciones.filter((ins) => !ins.asistencia).length;
  };

  /**
   * Toggle expand de detalles de un estudiante
   */
  const toggleExpand = (estudianteId: string) => {
    setExpandedId(expandedId === estudianteId ? null : estudianteId);
  };

  /**
   * Obtener valor de observaciones (del estado o del registro existente)
   */
  const getObservaciones = (inscripcion: InscripcionConAsistencia) => {
    return (
      observaciones[inscripcion.estudiante.id] ??
      inscripcion.asistencia?.observaciones ??
      ''
    );
  };

  /**
   * Obtener valor de puntos (del estado o del registro existente)
   */
  const getPuntos = (inscripcion: InscripcionConAsistencia) => {
    return puntos[inscripcion.estudiante.id] ?? inscripcion.asistencia?.puntosOtorgados ?? 0;
  };

  if (inscripciones.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <span className="text-6xl">👥</span>
        <h3 className="text-xl font-bold text-[#2a1a5e] mt-4">
          No hay estudiantes inscritos
        </h3>
        <p className="text-gray-600 mt-2">
          Esta clase no tiene estudiantes inscritos aún.
        </p>
      </div>
    );
  }

  const pendientes = calcularPendientes();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Toast de notificación */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl border-l-4 border-green-500 p-4 flex items-center gap-3">
            <span className="text-lg">{toastMessage}</span>
            <button
              onClick={() => setShowToast(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header de la tabla */}
      <div className="bg-gradient-to-r from-[#ff6b35] to-[#f7b801] px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-white">
              Lista de Asistencia ({inscripciones.length} estudiantes)
            </h3>
            {pendientes > 0 && (
              <span className="bg-white/30 text-white text-sm font-semibold px-3 py-1 rounded-full">
                {pendientes} pendiente{pendientes !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {pendientes > 0 && (
            <button
              onClick={marcarTodosPresentes}
              disabled={isMarkingAll || isLoading}
              className="bg-white text-[#ff6b35] font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isMarkingAll ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Marcando...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Marcar Todos Presentes
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Lista de estudiantes */}
      <div className="divide-y divide-gray-200">
        {inscripciones.map((inscripcion, index) => {
          const estudiante = inscripcion.estudiante;
          const asistencia = inscripcion.asistencia;
          const isExpanded = expandedId === estudiante.id;

          return (
            <div
              key={inscripcion.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              {/* Fila principal */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Número, foto y nombre */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#f7b801] flex items-center justify-center text-white font-bold flex-shrink-0">
                    {index + 1}
                  </div>

                  {/* Foto del estudiante */}
                  {estudiante.avatar ? (
                    <Image
                      src={estudiante.avatar}
                      alt={estudiante.nombre}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#ff6b35] flex-shrink-0"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg flex-shrink-0">
                      {estudiante.nombre.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h4 className="text-lg font-semibold text-[#2a1a5e] truncate">
                      {estudiante.nombre}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {estudiante.nivelEscolar || 'Sin nivel'}
                    </p>
                  </div>
                </div>

                {/* Botones de estado */}
                <div className="flex-shrink-0">
                  <AttendanceStatusButton
                    currentStatus={asistencia?.estado || null}
                    onStatusChange={(estado) =>
                      handleStatusChange(estudiante.id, estado)
                    }
                    disabled={isLoading}
                  />
                </div>

                {/* Botón de expandir */}
                <button
                  onClick={() => toggleExpand(estudiante.id)}
                  className="flex-shrink-0 p-2 text-[#ff6b35] hover:bg-[#ff6b35]/10 rounded-lg transition-colors"
                  aria-label={isExpanded ? 'Contraer' : 'Expandir'}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className={`w-6 h-6 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>
              </div>

              {/* Detalles expandibles */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  {/* Puntos */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Puntos otorgados
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={getPuntos(inscripcion)}
                      onChange={(e) =>
                        setPuntos({
                          ...puntos,
                          [estudiante.id]: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                      placeholder="Ej: 10"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Presente: 10pts • Tardanza: 5pts • Justificado: 7pts
                    </p>
                  </div>

                  {/* Observaciones */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Observaciones
                    </label>
                    <textarea
                      value={getObservaciones(inscripcion)}
                      onChange={(e) =>
                        setObservaciones({
                          ...observaciones,
                          [estudiante.id]: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Ej: Participó activamente en la clase..."
                    />
                  </div>

                  {/* Información adicional si ya tiene asistencia */}
                  {asistencia && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Registrado:</span>{' '}
                        {new Date(asistencia.fechaRegistro).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {asistencia.observaciones && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-semibold">Obs. guardadas:</span>{' '}
                          {asistencia.observaciones}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
