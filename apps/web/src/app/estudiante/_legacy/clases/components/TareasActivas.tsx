'use client';

import { useEffect, useState } from 'react';
import { Target, Star, Clock, ChevronRight, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import {
  getMisTareas,
  type TareaAsignada,
  type MisTareasResponse,
} from '@/lib/api/estudiante-aula.api';

/**
 * Formatea fecha para mostrar en formato corto
 */
function formatFechaCorta(fecha: string | null): string {
  if (!fecha) return 'Sin fecha';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

/**
 * Determina el estado visual de la tarea
 */
function getEstadoVisual(
  tarea: TareaAsignada,
): 'pending' | 'in_progress' | 'completed' | 'overdue' {
  if (tarea.progreso.estado === 'COMPLETADA') return 'completed';
  if (tarea.vencida) return 'overdue';
  if (tarea.progreso.estado === 'EN_PROGRESO') return 'in_progress';
  return 'pending';
}

export function TareasActivas() {
  const [data, setData] = useState<MisTareasResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTareas() {
      try {
        setLoading(true);
        setError(null);
        const response = await getMisTareas('todas');
        setData(response);
      } catch (err) {
        console.error('Error al cargar tareas:', err);
        setError('No se pudieron cargar las tareas');
      } finally {
        setLoading(false);
      }
    }
    fetchTareas();
  }, []);

  const pendingCount = data?.resumen.pendientes ?? 0;

  return (
    <div className="flex-[2] min-h-[350px] lg:min-h-0 rounded-2xl bg-gradient-to-br from-amber-950/30 via-[#0f0f1a]/95 to-orange-950/20 backdrop-blur-sm border border-amber-500/20 overflow-hidden flex flex-col shadow-lg shadow-amber-500/5">
      {/* Header */}
      <div className="p-4 border-b border-amber-500/10 flex justify-between items-center shrink-0 bg-gradient-to-r from-amber-500/5 to-transparent">
        <h3 className="text-xs font-semibold text-white flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Target className="w-3 h-3 text-white" />
          </div>
          Tareas Activas
        </h3>
        <span className="text-[10px] text-white/40">{pendingCount} pendientes</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-amber-400/50 animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <AlertCircle className="w-8 h-8 text-red-400/50 mb-2" />
            <p className="text-white/40 text-xs">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && data?.tareas.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Target className="w-8 h-8 text-amber-400/30 mb-2" />
            <p className="text-white/40 text-xs">No tienes tareas asignadas</p>
          </div>
        )}

        {/* Task list */}
        {!loading &&
          !error &&
          data?.tareas.map((tarea) => {
            const estado = getEstadoVisual(tarea);
            const isCompleted = estado === 'completed';
            const isOverdue = estado === 'overdue';

            return (
              <div
                key={tarea.tareaAsignadaId}
                className={`rounded-xl p-4 cursor-pointer transition border ${
                  isCompleted
                    ? 'bg-white/[0.01] border-white/[0.03] opacity-60 hover:opacity-100'
                    : isOverdue
                      ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                }`}
              >
                {/* Top row */}
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      isCompleted
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : isOverdue
                          ? 'bg-red-500/10 text-red-400'
                          : estado === 'in_progress'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {isCompleted
                      ? 'Completada'
                      : isOverdue
                        ? 'Vencida'
                        : estado === 'in_progress'
                          ? 'En Progreso'
                          : 'Pendiente'}
                  </span>
                  {tarea.obligatoria && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-400/70">
                      <Star className="w-3 h-3" />
                      Obligatoria
                    </span>
                  )}
                </div>

                {/* Title */}
                <h4 className="text-sm font-medium text-white/80 leading-tight mb-1 line-clamp-2">
                  {tarea.contenido.titulo}
                </h4>

                {/* Planificación */}
                <p className="text-[10px] text-white/30 mb-3 line-clamp-1">
                  {tarea.clase.planificacion.titulo} - Clase {tarea.clase.numero}
                </p>

                {/* Bottom row */}
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <span className="text-[10px] text-white/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatFechaCorta(tarea.fechaLimite)}
                  </span>
                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <CheckCircle className="w-3 h-3" />
                      {tarea.progreso.calificacion ? `${tarea.progreso.calificacion}%` : 'OK'}
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white/30" />
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
