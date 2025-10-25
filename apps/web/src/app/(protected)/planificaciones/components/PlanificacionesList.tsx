'use client';

import { PlanificacionListItem, EstadoPlanificacion } from '@/types/planificacion.types';
import { Calendar, Layers, Users, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface PlanificacionesListProps {
  planificaciones: PlanificacionListItem[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewPlanificacion: (id: string) => void;
}

const ESTADO_BADGES: Record<EstadoPlanificacion, { label: string; className: string; icon: string }> = {
  BORRADOR: {
    label: 'Borrador',
    className: 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/40',
    icon: '📝',
  },
  PUBLICADA: {
    label: 'Publicada',
    className: 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40',
    icon: '✅',
  },
  ARCHIVADA: {
    label: 'Archivada',
    className: 'bg-slate-500/20 text-slate-200 border border-slate-500/40',
    icon: '📦',
  },
};

const MESES = [
  '',
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const PlanificacionesList: React.FC<PlanificacionesListProps> = ({
  planificaciones,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onViewPlanificacion,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white/10 bg-white/5 animate-pulse h-48"
          />
        ))}
      </div>
    );
  }

  if (!planificaciones.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-10 text-center space-y-3">
        <div className="text-5xl">📭</div>
        <h3 className="text-xl font-semibold text-white">No hay planificaciones disponibles</h3>
        <p className="text-white/60 text-sm">
          Ajusta los filtros o vuelve a intentarlo más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {planificaciones.map((planificacion) => {
          const estadoConfig = ESTADO_BADGES[planificacion.estado] || ESTADO_BADGES.BORRADOR;
          return (
            <div
              key={planificacion.id}
              className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-800/70 to-slate-900/70 backdrop-blur-xl p-6 shadow-lg shadow-black/10"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-200 border border-blue-500/40">
                  <span>🎯</span>
                  <span>{planificacion.grupo?.codigo || planificacion.codigo_grupo}</span>
                </span>
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${estadoConfig.className}`}>
                  <span>{estadoConfig.icon}</span>
                  <span>{estadoConfig.label}</span>
                </span>
              </div>

              <div className="space-y-2 mb-5">
                <h3 className="text-lg font-semibold text-white line-clamp-2">
                  {planificacion.titulo}
                </h3>
                <p className="text-sm text-white/60 line-clamp-2">
                  {planificacion.descripcion || 'Sin descripción'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-white/70">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-white/50" />
                  <div>
                    <p className="font-semibold text-white">
                      {MESES[planificacion.mes]} {planificacion.anio}
                    </p>
                    <p>Período</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-white/50" />
                  <div>
                    <p className="font-semibold text-white">{planificacion.total_actividades}</p>
                    <p>Actividades</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-white/50" />
                  <div>
                    <p className="font-semibold text-white">{planificacion.total_asignaciones}</p>
                    <p>Asignaciones</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onViewPlanificacion(planificacion.id)}
                className="mt-6 inline-flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-pink-500/30 to-purple-500/30 border border-pink-500/40 px-4 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-pink-500/40 transition-all"
              >
                <Eye className="w-4 h-4" />
                Ver detalles
              </button>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
          <span>
            Página <span className="text-white font-semibold">{currentPage}</span> de{' '}
            <span className="text-white font-semibold">{totalPages}</span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-white/80 hover:bg-white/10 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-white/80 hover:bg-white/10 disabled:opacity-40"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
