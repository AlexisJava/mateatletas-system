import { TipoProducto } from '@/types/catalogo.types';
import { FilterType } from '../hooks/useProductos';

interface ProductoFiltersProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  showInactive: boolean;
  setShowInactive: (show: boolean) => void;
}

const filterOptions = [
  { value: 'all' as const, label: 'Todos' },
  { value: TipoProducto.Suscripcion, label: 'Suscripcion' },
  { value: TipoProducto.Curso, label: 'Curso' },
  { value: TipoProducto.Recurso, label: 'Recurso' },
  { value: 'inactive' as const, label: 'Inactivos' },
];

export const ProductoFilters: React.FC<ProductoFiltersProps> = ({
  filter,
  setFilter,
  showInactive,
  setShowInactive,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === option.value
                ? 'bg-[#ff6b35] text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={showInactive}
          onChange={(e) => setShowInactive(e.target.checked)}
          className="rounded"
        />
        Mostrar inactivos
      </label>
    </div>
  );
};
