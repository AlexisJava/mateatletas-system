/**
 * ProductFilter - Barra de filtros para productos
 *
 * Permite filtrar productos por tipo con diseño chunky
 * estilo Crash Bandicoot.
 *
 * @example
 * ```tsx
 * <ProductFilter
 *   filtroActivo="todos"
 *   onFiltroChange={(filtro) => setFiltro(filtro)}
 * />
 * ```
 */

import { FiltroProducto, TipoProducto } from '@/types/catalogo.types';

interface ProductFilterProps {
  filtroActivo: FiltroProducto;
  onFiltroChange: (_filtro: FiltroProducto) => void;
  productCount?: Record<string, number>;
}

export function ProductFilter({ filtroActivo, onFiltroChange, productCount }: ProductFilterProps) {
  const filtros: Array<{
    value: FiltroProducto;
    label: string;
    emoji: string;
    color: string;
  }> = [
    {
      value: 'todos',
      label: 'Todos',
      emoji: '🎯',
      color: 'hover:bg-primary/10 active:bg-primary',
    },
    {
      value: 'Evento',
      label: 'Eventos',
      emoji: '🎪',
      color: 'hover:bg-amber-500/10 active:bg-amber-500',
    },
    {
      value: 'Curso',
      label: 'Cursos',
      emoji: '📚',
      color: 'hover:bg-emerald-500/10 active:bg-emerald-500',
    },
    {
      value: 'Digital',
      label: 'Digitales',
      emoji: '📱',
      color: 'hover:bg-violet-500/10 active:bg-violet-500',
    },
  ];

  const getActiveStyles = (filtro: FiltroProducto) => {
    if (filtroActivo === filtro) {
      return 'bg-primary text-white shadow-[3px_3px_0px_rgba(0,0,0,1)] scale-105';
    }
    return 'bg-white text-dark shadow-[3px_3px_0px_rgba(0,0,0,0.2)]';
  };

  return (
    <div className="flex flex-wrap gap-3">
      {filtros.map((filtro) => {
        const count = productCount?.[filtro.value] ?? 0;
        const isActivo = filtroActivo === filtro.value;

        return (
          <button
            key={filtro.value}
            onClick={() => onFiltroChange(filtro.value)}
            className={`
              px-5 py-2.5
              rounded-full
              font-bold
              text-sm
              border-2 border-black
              transition-all duration-200
              ${getActiveStyles(filtro.value)}
              ${filtro.color}
              flex items-center gap-2
              hover:scale-105
            `}
          >
            <span className="text-lg">{filtro.emoji}</span>
            <span>{filtro.label}</span>
            {count > 0 && (
              <span
                className={`
                  ml-1 px-2 py-0.5
                  rounded-full
                  text-xs
                  ${isActivo ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}
                `}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
