/**
 * ProductCard - Tarjeta de producto en catálogo
 *
 * Muestra información resumida del producto con diseño chunky
 * estilo Crash Bandicoot y colores según el tipo.
 *
 * @example
 * ```tsx
 * <ProductCard
 *   producto={producto}
 *   onClick={() => handleDetail(producto.id)}
 * />
 * ```
 */

import { Card, Badge, Button } from '@/components/ui';
import { Producto, TipoProducto } from '@/types/catalogo.types';

interface ProductCardProps {
  producto: Producto;
  onClick?: () => void;
}

export function ProductCard({ producto, onClick }: ProductCardProps) {
  // Colores según tipo de producto
  const tipoBadgeConfig = {
    [TipoProducto.Suscripcion]: {
      bg: 'bg-[#00d9ff]', // cyan
      text: 'text-[#2a1a5e]',
      emoji: '💎',
    },
    [TipoProducto.Curso]: {
      bg: 'bg-[#ff6b35]', // naranja
      text: 'text-white',
      emoji: '📚',
    },
    [TipoProducto.RecursoDigital]: {
      bg: 'bg-[#f7b801]', // amarillo
      text: 'text-[#2a1a5e]',
      emoji: '🎁',
    },
  };

  const config = tipoBadgeConfig[producto.tipo];

  return (
    <Card
      className="
        cursor-pointer
        border-3 border-black
        shadow-[5px_5px_0px_rgba(0,0,0,1)]
        hover:shadow-[8px_8px_0px_rgba(0,0,0,1)]
        hover:scale-105
        transition-all duration-200
        overflow-hidden
      "
      onClick={onClick}
    >
      {/* Imagen placeholder con emoji grande */}
      <div
        className={`
          h-48
          bg-gradient-to-br from-primary/20 to-secondary/20
          flex items-center justify-center
          text-7xl
          border-b-3 border-black
        `}
      >
        {config.emoji}
      </div>

      {/* Contenido */}
      <div className="p-5 space-y-4">
        {/* Badge tipo */}
        <Badge
          className={`
            ${config.bg}
            ${config.text}
            font-bold
            px-3 py-1
            text-sm
            shadow-[3px_3px_0px_rgba(0,0,0,1)]
            border-2 border-black
          `}
        >
          {producto.tipo}
        </Badge>

        {/* Título */}
        <h3 className="font-[family-name:var(--font-fredoka)] text-2xl text-dark leading-tight line-clamp-2 min-h-[3.5rem]">
          {producto.nombre}
        </h3>

        {/* Descripción */}
        <p className="text-gray-600 text-sm line-clamp-3 min-h-[3.75rem]">{producto.descripcion}</p>

        {/* Precio y duración */}
        <div className="pt-2 border-t-2 border-gray-200">
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-3xl font-bold text-primary font-[family-name:var(--font-fredoka)]">
              ${producto.precio}
            </span>
            {producto.duracion_dias && (
              <span className="text-sm text-gray-600">/ {producto.duracion_dias} días</span>
            )}
          </div>

          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            Ver detalles →
          </Button>
        </div>
      </div>
    </Card>
  );
}
