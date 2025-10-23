import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, User, Users, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { ClaseListado } from '@/types/admin-clases.types';

interface ClasesCardsProps {
  clases: ClaseListado[];
}

// Configuración de colores por sector - Mateatletas OS
const SECTOR_COLORS = {
  'Matemática': {
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/[0.08]',
    border: 'border-blue-500/30',
    text: 'text-blue-300',
    shadow: 'shadow-blue-500/20',
    icon: '🧮',
  },
  'Programación': {
    gradient: 'from-purple-500 to-indigo-500',
    bg: 'bg-purple-500/[0.08]',
    border: 'border-purple-500/30',
    text: 'text-purple-300',
    shadow: 'shadow-purple-500/20',
    icon: '💻',
  },
  'Ciencias': {
    gradient: 'from-green-500 to-emerald-500',
    bg: 'bg-green-500/[0.08]',
    border: 'border-green-500/30',
    text: 'text-green-300',
    shadow: 'shadow-green-500/20',
    icon: '🔬',
  },
} as const;


/**
 * Componente de cards para mostrar clases
 * Vista moderna con filtros por sector
 */
export function ClasesCards({ clases }: ClasesCardsProps) {
  const router = useRouter();
  if (clases.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="backdrop-blur-xl bg-emerald-500/[0.05] rounded-2xl p-12 border border-emerald-500/20 max-w-md mx-auto shadow-2xl shadow-emerald-500/10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30">
            <Calendar className="w-10 h-10 text-emerald-400" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">No hay clases</h3>
          <p className="text-white/60">No se encontraron clases con los filtros seleccionados</p>
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
            onClick={() => router.push(`/admin/clases/${clase.id}`)}
            className={`group backdrop-blur-xl bg-white/[0.03] rounded-2xl border ${sectorConfig.border} shadow-xl ${sectorConfig.shadow} hover:shadow-2xl hover:bg-white/[0.06] hover:scale-[1.02] transition-all duration-300 overflow-hidden flex flex-col cursor-pointer`}
          >
            {/* Header con gradiente del sector */}
            <div className={`bg-gradient-to-r ${sectorConfig.gradient} p-5 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 text-8xl opacity-5 select-none -mt-4 -mr-4">
                {sectorConfig.icon}
              </div>
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                      {sectorConfig.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-black text-white mb-1 line-clamp-2 group-hover:text-white/90 transition-colors">
                        {clase.nombre}
                      </h3>
                      <p className="text-white/80 text-sm font-semibold">
                        {sectorNombre}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </div>
            </div>

            {/* Contenido de la card - Solo info esencial */}
            <div className="p-5 space-y-4 flex-1 flex flex-col">
              {/* Docente */}
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${sectorConfig.gradient} flex items-center justify-center shadow-lg ${sectorConfig.shadow} flex-shrink-0`}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/40 font-medium mb-0.5">Docente</p>
                  <p className="text-white font-bold text-sm truncate">
                    {clase.docente?.nombre} {clase.docente?.apellido}
                  </p>
                </div>
              </div>

              {/* Fecha y Hora */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-white/40" />
                  <span className="text-white/90 font-medium">
                    {format(new Date(clase.fecha_hora_inicio), 'dd/MM/yyyy', { locale: es })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white/40" />
                  <span className="text-white/90 font-medium">
                    {format(new Date(clase.fecha_hora_inicio), 'HH:mm', { locale: es })} hs
                  </span>
                </div>
              </div>

              {/* Capacidad */}
              <div className="mt-auto pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-white/40" />
                    <span className="text-xs text-white/40 font-medium">Capacidad</span>
                  </div>
                  <span className="text-sm font-bold text-white">
                    {inscripciones} / {cupoMaximo}
                  </span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${
                      (inscripciones / cupoMaximo) * 100 >= 90
                        ? 'from-red-500 to-rose-500'
                        : (inscripciones / cupoMaximo) * 100 >= 75
                        ? 'from-orange-500 to-amber-500'
                        : 'from-green-500 to-emerald-500'
                    } transition-all duration-500`}
                    style={{ width: `${(inscripciones / cupoMaximo) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
