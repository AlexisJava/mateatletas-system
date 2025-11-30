'use client';

import { PlanificacionListItem, EstadoPlanificacion } from '@/types/planificacion.types';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface PlanificacionesTableProps {
  planificaciones: PlanificacionListItem[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (_page: number) => void;
  onViewDetails: (_id: string) => void;
}

// ============================================================
// CONSTANTS & TYPES - Type-safe desde el inicio
// ============================================================

type ColorConfig = {
  readonly bg: string;
  readonly text: string;
  readonly border: string;
};

type EstadoColorConfig = ColorConfig & {
  readonly icon: string;
};

type GrupoCodigo = 'B1' | 'B2' | 'B3';

const ESTADO_COLORS: Readonly<Record<EstadoPlanificacion, EstadoColorConfig>> = {
  BORRADOR: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-300',
    border: 'border-yellow-400/30',
    icon: '📝',
  },
  PUBLICADA: {
    bg: 'bg-green-500/20',
    text: 'text-green-300',
    border: 'border-green-400/30',
    icon: '✅',
  },
  ARCHIVADA: {
    bg: 'bg-gray-500/20',
    text: 'text-gray-300',
    border: 'border-gray-400/30',
    icon: '📦',
  },
} as const;

const GRUPO_COLORS: Readonly<Record<GrupoCodigo, ColorConfig>> = {
  B1: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-400/30' },
  B2: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-400/30' },
  B3: { bg: 'bg-pink-500/20', text: 'text-pink-300', border: 'border-pink-400/30' },
} as const;

const MESES: readonly string[] = [
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
] as const;

const DEFAULT_GRUPO: GrupoCodigo = 'B1';

// ============================================================
// UTILITY FUNCTIONS - Pure functions con type safety
// ============================================================

/**
 * Obtiene el código de grupo validado, con fallback seguro
 */
const getValidatedGrupoCodigo = (codigo: string | null | undefined): GrupoCodigo => {
  const codigoNormalizado = codigo ?? DEFAULT_GRUPO;

  // Type guard: verificar si es un código válido
  if (isValidGrupoCodigo(codigoNormalizado)) {
    return codigoNormalizado;
  }

  return DEFAULT_GRUPO;
};

/**
 * Type guard para verificar si un string es un GrupoCodigo válido
 */
const isValidGrupoCodigo = (codigo: string): codigo is GrupoCodigo => {
  return codigo in GRUPO_COLORS;
};

/**
 * Obtiene la configuración de color para un grupo de forma segura
 */
const getGrupoColor = (codigo: string | null | undefined): ColorConfig => {
  const validatedCodigo = getValidatedGrupoCodigo(codigo);
  return GRUPO_COLORS[validatedCodigo];
};

/**
 * Obtiene la configuración de color para un estado
 */
const getEstadoColor = (estado: EstadoPlanificacion): EstadoColorConfig => {
  return ESTADO_COLORS[estado] ?? ESTADO_COLORS.BORRADOR;
};

/**
 * Formatea el nombre de un estado para visualización
 */
const formatEstadoLabel = (estado: EstadoPlanificacion): string => {
  const label = estado.toLowerCase();
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/**
 * Construye el className para badges de color
 */
const buildColorClassName = (baseClasses: string, colorConfig: ColorConfig): string => {
  return `${baseClasses} ${colorConfig.bg} ${colorConfig.text} border ${colorConfig.border}`;
};

/**
 * Calcula los números de página a mostrar en la paginación
 */
const calculatePageNumbers = (
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5,
): number[] => {
  const length = Math.min(maxVisible, totalPages);

  if (totalPages <= maxVisible) {
    return Array.from({ length }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return Array.from({ length }, (_, i) => i + 1);
  }

  if (currentPage >= totalPages - 2) {
    return Array.from({ length }, (_, i) => totalPages - maxVisible + 1 + i);
  }

  return Array.from({ length }, (_, i) => currentPage - 2 + i);
};

// ============================================================
// SUB-COMPONENTS - Separación de responsabilidades
// ============================================================

const LoadingState: React.FC = () => (
  <div className="relative rounded-2xl overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-slate-800/40 via-slate-700/40 to-slate-800/40 backdrop-blur-xl" />
    <div className="absolute inset-0 border-2 border-white/10 rounded-2xl" />
    <div className="relative p-12 text-center">
      <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500" />
      <p className="mt-4 text-white font-bold">Cargando planificaciones...</p>
    </div>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="relative rounded-2xl overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-slate-800/40 via-slate-700/40 to-slate-800/40 backdrop-blur-xl" />
    <div className="absolute inset-0 border-2 border-white/10 rounded-2xl" />
    <div className="relative p-12 text-center">
      <div className="text-6xl mb-4">📅</div>
      <p className="text-white text-lg font-bold mb-2">No hay planificaciones</p>
      <p className="text-white/40 text-sm font-medium">
        No se encontraron planificaciones con los filtros seleccionados.
      </p>
    </div>
  </div>
);

interface PlanificacionRowData {
  planificacion: PlanificacionListItem;
  grupoCodigo: string;
  grupoColor: ColorConfig;
  estadoColor: EstadoColorConfig;
  estadoLabel: string;
}

const getPlanificacionRowData = (planificacion: PlanificacionListItem): PlanificacionRowData => {
  const grupoCodigo = planificacion.grupo?.codigo ?? planificacion.codigo_grupo ?? DEFAULT_GRUPO;
  const grupoColor = getGrupoColor(grupoCodigo);
  const estadoColor = getEstadoColor(planificacion.estado);
  const estadoLabel = formatEstadoLabel(planificacion.estado);

  return {
    planificacion,
    grupoCodigo,
    grupoColor,
    estadoColor,
    estadoLabel,
  };
};

const DesktopTableRow: React.FC<{
  data: PlanificacionRowData;
  index: number;
  onViewDetails: (_id: string) => void;
}> = ({ data, index, onViewDetails }) => {
  const { planificacion, grupoCodigo, grupoColor, estadoColor, estadoLabel } = data;

  return (
    <tr
      className="border-b border-white/5 hover:bg-white/5 transition-all duration-300 group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={buildColorClassName(
            'inline-flex items-center px-3 py-1.5 text-sm font-black rounded-full',
            grupoColor,
          )}
        >
          {grupoCodigo}
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
        <span
          className={buildColorClassName(
            'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full',
            estadoColor,
          )}
        >
          <span>{estadoColor.icon}</span>
          <span>{estadoLabel}</span>
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-white">{planificacion.total_actividades}</span>
          <span className="text-xs text-white/40 font-medium">
            {planificacion.total_actividades === 1 ? 'actividad' : 'actividades'}
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
};

const MobileCard: React.FC<{
  data: PlanificacionRowData;
  index: number;
  onViewDetails: (_id: string) => void;
}> = ({ data, index, onViewDetails }) => {
  const { planificacion, grupoCodigo, grupoColor, estadoColor, estadoLabel } = data;

  return (
    <div
      className="p-4 hover:bg-white/5 transition-all duration-300"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex justify-between items-start mb-3">
        <span
          className={buildColorClassName(
            'inline-flex items-center px-3 py-1.5 text-xs font-black rounded-full',
            grupoColor,
          )}
        >
          {grupoCodigo}
        </span>
        <span
          className={buildColorClassName(
            'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full',
            estadoColor,
          )}
        >
          <span>{estadoColor.icon}</span>
          <span>{estadoLabel}</span>
        </span>
      </div>

      <h3 className="text-sm font-bold text-white mb-3">{planificacion.titulo}</h3>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-white/60 font-medium">Período:</span>
          <span className="text-white font-bold">
            {MESES[planificacion.mes]} {planificacion.anio}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/60 font-medium">Actividades:</span>
          <span className="text-white font-bold">{planificacion.total_actividades}</span>
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
};

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (_page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = calculatePageNumbers(currentPage, totalPages);

  return (
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
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <div className="hidden sm:flex gap-1">
            {pageNumbers.map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-4 py-2 text-sm rounded-xl font-bold transition-all duration-300 ${
                  currentPage === pageNum
                    ? 'bg-gradient-to-r from-pink-500/50 to-rose-500/50 border-2 border-pink-400/50 text-white shadow-lg shadow-pink-500/50'
                    : 'bg-white/5 border border-white/20 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
                aria-label={`Ir a página ${pageNum}`}
                aria-current={currentPage === pageNum ? 'page' : undefined}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/20 text-white font-bold hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
            aria-label="Página siguiente"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export const PlanificacionesTable: React.FC<PlanificacionesTableProps> = ({
  planificaciones,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onViewDetails,
}) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (!planificaciones?.length) {
    return <EmptyState />;
  }

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Glassmorphism background */}
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
              {planificaciones.map((planificacion, index) => (
                <DesktopTableRow
                  key={planificacion.id}
                  data={getPlanificacionRowData(planificacion)}
                  index={index}
                  onViewDetails={onViewDetails}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-white/5">
          {planificaciones.map((planificacion, index) => (
            <MobileCard
              key={planificacion.id}
              data={getPlanificacionRowData(planificacion)}
              index={index}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
};
