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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {clases.map((clase) => {
        const sectorNombre = clase.docente?.sector?.nombre as keyof typeof SECTOR_COLORS || 'Matemática';
        const sectorConfig = SECTOR_COLORS[sectorNombre] || SECTOR_COLORS['Matemática'];
        const inscripciones = clase._count?.inscripciones || 0;
        const cupoMaximo = clase.cupo_maximo;

        return (
          <div
            key={clase.id}
            className={`bg-white rounded-2xl border-2 ${sectorConfig.border} shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden`}
          >
            {/* Header con gradiente del sector */}
            <div className={`bg-gradient-to-r ${sectorConfig.gradient} p-6 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 text-8xl opacity-10 select-none">
                {sectorConfig.icon}
              </div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-3xl shadow-lg">
                      {sectorConfig.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white line-clamp-1">
                        {clase.nombre}
                      </h3>
                      <p className="text-white/90 text-sm font-semibold">
                        {sectorNombre}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Estado */}
                <div className="flex items-center gap-2 mt-4">
                  <span
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold shadow-md ${
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

            {/* Contenido de la card */}
            <div className="p-6 space-y-4">
              {/* Docente */}
              <div className={`flex items-center gap-3 ${sectorConfig.bg} rounded-xl p-4 border ${sectorConfig.border}`}>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${sectorConfig.gradient} flex items-center justify-center shadow-sm`}>
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Docente</p>
                  <p className={`${sectorConfig.text} font-bold`}>
                    {clase.docente?.nombre} {clase.docente?.apellido}
                  </p>
                </div>
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className={`w-4 h-4 ${sectorConfig.text}`} />
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Fecha</p>
                  </div>
                  <p className="text-gray-900 font-bold text-sm">
                    {format(new Date(clase.fecha_hora_inicio), 'dd/MM/yyyy', { locale: es })}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className={`w-4 h-4 ${sectorConfig.text}`} />
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Hora</p>
                  </div>
                  <p className="text-gray-900 font-bold text-sm">
                    {format(new Date(clase.fecha_hora_inicio), 'HH:mm', { locale: es })} hs
                  </p>
                </div>
              </div>

              {/* Duración */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className={`w-4 h-4 ${sectorConfig.text}`} />
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Duración</p>
                </div>
                <p className="text-gray-900 font-bold">
                  {clase.duracion_minutos} minutos
                </p>
              </div>

              {/* Barra de capacidad */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <CapacityBar current={inscripciones} max={cupoMaximo} />
              </div>

              {/* Acciones */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => onViewClase(clase)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all"
                >
                  <Eye className="w-4 h-4" />
                  Ver
                </button>
                <button
                  onClick={() => onManageStudents(clase)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r ${sectorConfig.gradient} text-white rounded-xl font-semibold transition-all shadow-sm hover:shadow-md`}
                >
                  <UserPlus className="w-4 h-4" />
                  Estudiantes
                </button>

                {clase.estado === 'Programada' && (
                  <>
                    <button
                      onClick={() => onEditClase(clase)}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 border-2 border-amber-300 hover:bg-amber-100 text-amber-700 rounded-xl font-semibold transition-all"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => onCancelClase(clase)}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 border-2 border-red-300 hover:bg-red-100 text-red-700 rounded-xl font-semibold transition-all"
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
