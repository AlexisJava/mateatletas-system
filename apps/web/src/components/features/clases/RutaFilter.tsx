/**
 * RutaFilter - Filtro por Ruta Curricular
 *
 * Muestra pills de filtro para cada ruta curricular (Álgebra, Geometría, etc.)
 * con su color característico y cuenta de clases disponibles.
 *
 * @example
 * ```tsx
 * <RutaFilter
 *   rutasCurriculares={rutas}
 *   rutaActiva={rutaId}
 *   onRutaChange={(id) => setFiltro({ rutaCurricularId: id })}
 *   claseCounts={counts}
 * />
 * ```
 */

import { RutaCurricular } from '@/types/clases.types';

interface RutaFilterProps {
  rutasCurriculares: RutaCurricular[];
  rutaActiva: string | undefined;
  onRutaChange: (_rutaId: string | undefined) => void;
  claseCounts?: Record<string, number>;
}

export function RutaFilter({
  rutasCurriculares,
  rutaActiva,
  onRutaChange,
  claseCounts = {},
}: RutaFilterProps) {
  // Calcular total de clases
  const totalClases = Object.values(claseCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-gray-600">Filtrar por ruta:</p>

      <div className="flex flex-wrap gap-3">
        {/* Botón "Todas" */}
        <button
          onClick={() => onRutaChange(undefined)}
          className={`
            px-5 py-2.5
            rounded-full
            font-bold
            text-sm
            border-2 border-black
            transition-all
            ${
              !rutaActiva
                ? 'bg-[#2a1a5e] text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] scale-105'
                : 'bg-white text-dark shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:scale-105'
            }
          `}
        >
          <span className="mr-2">🎯</span>
          Todas
          {totalClases > 0 && (
            <span
              className={`
                ml-2 px-2 py-0.5 rounded-full text-xs
                ${!rutaActiva ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}
              `}
            >
              {totalClases}
            </span>
          )}
        </button>

        {/* Botones de rutas */}
        {rutasCurriculares.map((ruta) => {
          const count = claseCounts[ruta.id] || 0;
          const isActive = rutaActiva === ruta.id;

          return (
            <button
              key={ruta.id}
              onClick={() => onRutaChange(ruta.id)}
              className={`
                px-5 py-2.5
                rounded-full
                font-bold
                text-sm
                border-2
                transition-all
                ${
                  isActive
                    ? 'shadow-[4px_4px_0px_rgba(0,0,0,1)] scale-105'
                    : 'shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:scale-105'
                }
              `}
              style={{
                backgroundColor: isActive ? ruta.color : `${ruta.color}20`,
                color: isActive ? '#ffffff' : ruta.color,
                borderColor: ruta.color,
              }}
            >
              <span className="mr-2">📚</span>
              {ruta.nombre}
              {count > 0 && (
                <span
                  className={`
                    ml-2 px-2 py-0.5 rounded-full text-xs
                    ${isActive ? 'bg-white/20 text-white' : 'text-gray-700'}
                  `}
                  style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Leyenda de colores (opcional) */}
      {rutasCurriculares.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs text-gray-500 pt-2">
          {rutasCurriculares.slice(0, 3).map((ruta) => (
            <div key={ruta.id} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: ruta.color }}
              ></div>
              <span>{ruta.nombre}</span>
            </div>
          ))}
          {rutasCurriculares.length > 3 && (
            <span className="text-gray-400">+{rutasCurriculares.length - 3} más</span>
          )}
        </div>
      )}
    </div>
  );
}
