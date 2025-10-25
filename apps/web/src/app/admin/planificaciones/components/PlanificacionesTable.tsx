'use client';

import { PlanificacionListItem, EstadoPlanificacion } from '@/types/planificacion.types';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface PlanificacionesTableProps {
  planificaciones: PlanificacionListItem[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewDetails: (id: string) => void;
}

const ESTADO_COLORS: Record<EstadoPlanificacion, { bg: string; text: string; border: string; icon: string }> = {
  borrador: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-400/30', icon: '📝' },
  publicada: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-400/30', icon: '✅' },
  archivada: { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-400/30', icon: '📦' },
};

const GRUPO_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  B1: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-400/30' },
  B2: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-400/30' },
  B3: { bg: 'bg-pink-500/20', text: 'text-pink-300', border: 'border-pink-400/30' },
};

const MESES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const PlanificacionesTable: React.FC<PlanificacionesTableProps> = ({
  planificaciones,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onViewDetails,
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/40 via-slate-700/40 to-slate-800/40 backdrop-blur-xl" />
        <div className="absolute inset-0 border-2 border-white/10 rounded-2xl" />
        <div className="relative p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500"></div>
          <p className="mt-4 text-white font-bold">Cargando planificaciones...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!planificaciones || planificaciones.length === 0) {
    return (
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/40 via-slate-700/40 to-slate-800/40 backdrop-blur-xl" />
        <div className="absolute inset-0 border-2 border-white/10 rounded-2xl" />
        <div className="relative p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-white text-lg font-bold mb-2">
            No hay planificaciones
          </p>
          <p className="text-white/40 text-sm font-medium">
            No se encontraron planificaciones con los filtros seleccionados.
          </p>
        </div>
      </div>
    );
  }

  // Tabla con estilo Mateatletas OS
  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Fondo glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/40 via-slate-700/40 to-slate-800/40 backdrop-blur-xl" />
      <div className="absolute inset-0 border-2 border-white/10 rounded-2xl" />

      <div className="relative">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-white/60">
                  Grupo
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-white/60">
                  Período
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-white/60">
                  Título
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-white/60">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-white/60">
                  Actividades
                </th>
                <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-white/60">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {planificaciones?.map((planificacion, index) => {
                // Mapear grupoId a codigo_grupo temporal para colores
                const grupoKey = 'B1'; // TODO: obtener codigo desde el grupo
                const grupoColor = GRUPO_COLORS[grupoKey] || GRUPO_COLORS.B1;
                const estadoColor = ESTADO_COLORS[planificacion.estado.toLowerCase() as EstadoPlanificacion] || ESTADO_COLORS.borrador;

                return (
                  <tr
                    key={planificacion.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-all duration-300 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 text-sm font-black rounded-full ${grupoColor.bg} ${grupoColor.text} border ${grupoColor.border}`}>
                        ID: {planificacion.grupoId.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-bold">
                        {MESES[planificacion.mes]} {planificacion.anio}
                      </div>
                      <div className="text-xs text-white/40 font-medium">
                        {String(planificacion.mes).padStart(2, '0')}/{planificacion.anio}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white font-bold max-w-xs truncate group-hover:text-pink-300 transition-colors">
                        {planificacion.titulo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full ${estadoColor.bg} ${estadoColor.text} border ${estadoColor.border}`}>
                        <span>{estadoColor.icon}</span>
                        <span>{planificacion.estado.charAt(0).toUpperCase() + planificacion.estado.slice(1)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-white">
                          {planificacion.activityCount}
                        </span>
                        <span className="text-xs text-white/40 font-medium">
                          {planificacion.activityCount === 1 ? 'actividad' : 'actividades'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => onViewDetails(planificacion.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500/30 to-rose-500/30 border border-pink-400/50 text-white font-bold hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300"
                      >
                        <Eye className="w-4 h-4" strokeWidth={2.5} />
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-white/5">
          {planificaciones?.map((planificacion, index) => {
            const grupoKey = 'B1'; // TODO: obtener codigo desde el grupo
            const grupoColor = GRUPO_COLORS[grupoKey] || GRUPO_COLORS.B1;
            const estadoColor = ESTADO_COLORS[planificacion.estado.toLowerCase() as EstadoPlanificacion] || ESTADO_COLORS.borrador;

            return (
              <div
                key={planificacion.id}
                className="p-4 hover:bg-white/5 transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`inline-flex items-center px-3 py-1.5 text-xs font-black rounded-full ${grupoColor.bg} ${grupoColor.text} border ${grupoColor.border}`}>
                    ID: {planificacion.grupoId.slice(0, 8)}...
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full ${estadoColor.bg} ${estadoColor.text} border ${estadoColor.border}`}>
                    <span>{estadoColor.icon}</span>
                    <span>{planificacion.estado.charAt(0).toUpperCase() + planificacion.estado.slice(1)}</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-3">
                  {planificacion.titulo}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60 font-medium">Período:</span>
                    <span className="text-white font-bold">
                      {MESES[planificacion.mes]} {planificacion.anio}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60 font-medium">Actividades:</span>
                    <span className="text-white font-bold">
                      {planificacion.activityCount}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onViewDetails(planificacion.id)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500/30 to-rose-500/30 border border-pink-400/50 text-white font-bold hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300"
                >
                  <Eye className="w-4 h-4" strokeWidth={2.5} />
                  <span>Ver Detalles</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-5 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60 font-medium">
                Página <span className="font-black text-white">{currentPage}</span> de{' '}
                <span className="font-black text-white">{totalPages}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/20 text-white font-bold hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                {/* Page numbers */}
                <div className="hidden sm:flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`px-4 py-2 text-sm rounded-xl font-bold transition-all duration-300 ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-pink-500/50 to-rose-500/50 border-2 border-pink-400/50 text-white shadow-lg shadow-pink-500/50'
                            : 'bg-white/5 border border-white/20 text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/20 text-white font-bold hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
