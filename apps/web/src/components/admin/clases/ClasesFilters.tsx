import { Filter, Calendar, XCircle, CheckCircle } from 'lucide-react';

type FilterEstado = 'all' | 'Programada' | 'Cancelada' | 'Activa';
type FilterSector = 'all' | 'Matemática' | 'Programación' | 'Ciencias';

interface ClasesFiltersProps {
  filter: FilterEstado;
  sectorFilter: FilterSector;
  onFilterChange: (filter: FilterEstado) => void;
  onSectorFilterChange: (sector: FilterSector) => void;
  clasesCount: {
    all: number;
    programadas: number;
    canceladas: number;
    activas: number;
  };
  sectoresCount: {
    all: number;
    matematica: number;
    programacion: number;
    ciencias: number;
  };
}

/**
 * Componente de filtros para clases
 * Con filtros por estado y sector
 */
export function ClasesFilters({
  filter,
  sectorFilter,
  onFilterChange,
  onSectorFilterChange,
  clasesCount,
  sectoresCount,
}: ClasesFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Filtros por Estado */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Estado</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center gap-2 ${
              filter === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Todas ({clasesCount.all})
          </button>

          <button
            onClick={() => onFilterChange('Programada')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center gap-2 ${
              filter === 'Programada'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Programadas ({clasesCount.programadas})
          </button>

          <button
            onClick={() => onFilterChange('Activa')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center gap-2 ${
              filter === 'Activa'
                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Activas ({clasesCount.activas})
          </button>

          <button
            onClick={() => onFilterChange('Cancelada')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center gap-2 ${
              filter === 'Cancelada'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Canceladas ({clasesCount.canceladas})
          </button>
        </div>
      </div>

      {/* Filtros por Sector */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📚</span>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Sector</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSectorFilterChange('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center gap-2 ${
              sectorFilter === 'all'
                ? 'bg-gradient-to-r from-gray-600 to-slate-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="text-base">📚</span>
            Todos ({sectoresCount.all})
          </button>

          <button
            onClick={() => onSectorFilterChange('Matemática')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center gap-2 ${
              sectorFilter === 'Matemática'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-blue-200'
            }`}
          >
            <span className="text-base">📐</span>
            Matemática ({sectoresCount.matematica})
          </button>

          <button
            onClick={() => onSectorFilterChange('Programación')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center gap-2 ${
              sectorFilter === 'Programación'
                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-purple-200'
            }`}
          >
            <span className="text-base">💻</span>
            Programación ({sectoresCount.programacion})
          </button>

          <button
            onClick={() => onSectorFilterChange('Ciencias')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center gap-2 ${
              sectorFilter === 'Ciencias'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-green-200'
            }`}
          >
            <span className="text-base">🔬</span>
            Ciencias ({sectoresCount.ciencias})
          </button>
        </div>
      </div>
    </div>
  );
}
