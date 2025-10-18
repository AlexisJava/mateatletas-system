interface ClasesFiltersProps {
  filter: 'all' | 'Programada' | 'Cancelada';
  onFilterChange: (filter: 'all' | 'Programada' | 'Cancelada') => void;
  clasesCount: {
    all: number;
    programadas: number;
    canceladas: number;
  };
}

/**
 * Componente de filtros para clases
 * Responsabilidad: Solo renderizar y manejar filtros
 */
export function ClasesFilters({ filter, onFilterChange, clasesCount }: ClasesFiltersProps) {
  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => onFilterChange('all')}
        className={`px-4 py-2 rounded-lg transition-colors ${
          filter === 'all'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Todas ({clasesCount.all})
      </button>
      <button
        onClick={() => onFilterChange('Programada')}
        className={`px-4 py-2 rounded-lg transition-colors ${
          filter === 'Programada'
            ? 'bg-green-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Programadas ({clasesCount.programadas})
      </button>
      <button
        onClick={() => onFilterChange('Cancelada')}
        className={`px-4 py-2 rounded-lg transition-colors ${
          filter === 'Cancelada'
            ? 'bg-red-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Canceladas ({clasesCount.canceladas})
      </button>
    </div>
  );
}
