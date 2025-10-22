import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, User, Users, Eye, UserPlus, Ban, Edit } from 'lucide-react';

import type { ClaseListado } from '@/types/admin-clases.types';

interface ClasesCardsProps {
  clases: ClaseListado[];
  onViewClase: (clase: ClaseListado) => void;
  onCancelClase: (clase: ClaseListado) => void;
  onEditClase: (clase: ClaseListado) => void;
  onManageStudents: (clase: ClaseListado) => void;
}

// Configuración de colores por sector
const SECTOR_COLORS = {
  'Matemática': {
    gradient: 'from-blue-600 to-cyan-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: '📐',
  },
  'Programación': {
    gradient: 'from-purple-600 to-violet-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    icon: '💻',
  },
  'Ciencias': {
    gradient: 'from-green-600 to-emerald-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    icon: '🔬',
  },
} as const;

// Componente de barra de capacidad
function CapacityBar({ current, max }: { current: number; max: number }) {
  const percentage = (current / max) * 100;

  // Determinar color según el porcentaje
  let colorClass = 'from-green-500 to-emerald-500';
  let textColor = 'text-green-600';

  if (percentage >= 90) {
    colorClass = 'from-red-500 to-rose-500';
    textColor = 'text-red-600';
  } else if (percentage >= 75) {
    colorClass = 'from-orange-500 to-amber-500';
    textColor = 'text-orange-600';
  } else if (percentage >= 50) {
    colorClass = 'from-yellow-500 to-amber-500';
    textColor = 'text-yellow-600';
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 font-medium flex items-center gap-2">
          <Users className="w-4 h-4" />
          Capacidad
        </span>
        <span className={`font-bold ${textColor}`}>
          {current} / {max}
        </span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
        <div
          className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Componente de cards para mostrar clases
 * Vista moderna con filtros por sector
 */
export function ClasesCards({
  clases,
  onViewClase,
  onCancelClase,
  onEditClase,
  onManageStudents,
}: ClasesCardsProps) {
  if (clases.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-white rounded-2xl p-12 border border-gray-200 max-w-md mx-auto shadow-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">No hay clases</h3>
          <p className="text-gray-600">No se encontraron clases con los filtros seleccionados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {clases.map((clase) => {
        const sectorNombre = (clase.sector?.nombre || 'Matemática') as keyof typeof SECTOR_COLORS;
        const sectorConfig = SECTOR_COLORS[sectorNombre] || SECTOR_COLORS['Matemática'];
        const inscripciones = clase._count?.inscripciones || 0;
        const cupoMaximo = clase.cupo_maximo;

        return (
          <div
            key={clase.id}
            className={`bg-white rounded-xl border-2 ${sectorConfig.border} shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col`}
          >
            {/* Header con gradiente del sector - MÁS COMPACTO */}
            <div className={`bg-gradient-to-r ${sectorConfig.gradient} p-4 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 text-6xl opacity-10 select-none">
                {sectorConfig.icon}
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-lg bg-white/20 backdrop-blur-xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                    {sectorConfig.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-white line-clamp-1">
                      {clase.nombre}
                    </h3>
                    <p className="text-white/90 text-xs font-semibold">
                      {sectorNombre}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold shadow-md flex-shrink-0 ${
                      clase.estado === 'Programada'
                        ? 'bg-green-500 text-white'
                        : clase.estado === 'Cancelada'
                        ? 'bg-red-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    {clase.estado}
                  </span>
                </div>
              </div>
            </div>

            {/* Contenido de la card - MÁS COMPACTO */}
            <div className="p-4 space-y-3 flex-1 flex flex-col">
              {/* Docente */}
              <div className={`flex items-center gap-2.5 ${sectorConfig.bg} rounded-lg p-3 border ${sectorConfig.border}`}>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${sectorConfig.gradient} flex items-center justify-center shadow-sm flex-shrink-0`}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Docente</p>
                  <p className={`${sectorConfig.text} font-bold text-sm truncate`}>
                    {clase.docente?.nombre} {clase.docente?.apellido}
                  </p>
                </div>
              </div>

              {/* Fecha, Hora y Duración en una sola línea compacta */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className={`w-3.5 h-3.5 ${sectorConfig.text}`} />
                    <p className="text-xs text-gray-500 font-medium">Fecha</p>
                  </div>
                  <p className="text-gray-900 font-bold text-xs">
                    {format(new Date(clase.fecha_hora_inicio), 'dd/MM/yyyy', { locale: es })}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className={`w-3.5 h-3.5 ${sectorConfig.text}`} />
                    <p className="text-xs text-gray-500 font-medium">Hora</p>
                  </div>
                  <p className="text-gray-900 font-bold text-xs">
                    {format(new Date(clase.fecha_hora_inicio), 'HH:mm', { locale: es })} hs
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className={`w-3.5 h-3.5 ${sectorConfig.text}`} />
                    <p className="text-xs text-gray-500 font-medium">Duración</p>
                  </div>
                  <p className="text-gray-900 font-bold text-xs">
                    {clase.duracion_minutos} min
                  </p>
                </div>
              </div>

              {/* Barra de capacidad */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <CapacityBar current={inscripciones} max={cupoMaximo} />
              </div>

              {/* Acciones - MÁS COMPACTO */}
              <div className="grid grid-cols-2 gap-2 mt-auto">
                <button
                  onClick={() => onViewClase(clase)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold text-sm transition-all"
                >
                  <Eye className="w-4 h-4" />
                  Ver
                </button>
                <button
                  onClick={() => onManageStudents(clase)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r ${sectorConfig.gradient} text-white rounded-lg font-semibold text-sm transition-all shadow-sm hover:shadow-md`}
                >
                  <UserPlus className="w-4 h-4" />
                  Alumnos
                </button>

                {clase.estado === 'Programada' && (
                  <>
                    <button
                      onClick={() => onEditClase(clase)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 border-2 border-amber-300 hover:bg-amber-100 text-amber-700 rounded-lg font-semibold text-sm transition-all"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => onCancelClase(clase)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 border-2 border-red-300 hover:bg-red-100 text-red-700 rounded-lg font-semibold text-sm transition-all"
                    >
                      <Ban className="w-4 h-4" />
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
