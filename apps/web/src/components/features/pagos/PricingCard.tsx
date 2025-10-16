/**
 * PricingCard - Tarjeta de plan de suscripción
 *
 * Muestra un plan de suscripción con pricing, beneficios
 * y botón de compra en diseño chunky.
 *
 * @example
 * ```tsx
 * <PricingCard
 *   producto={suscripcion}
 *   destacado={true}
 *   onComprar={() => handleCompra(producto.id)}
 * />
 * ```
 */

import { Button, Badge, Card } from '@/components/ui';
import { Producto } from '@/types/catalogo.types';

interface PricingCardProps {
  producto: Producto;
  destacado?: boolean;
  onComprar: (productoId: string) => void;
  isLoading?: boolean;
}

export function PricingCard({
  producto,
  destacado = false,
  onComprar,
  isLoading = false,
}: PricingCardProps) {
  // Beneficios por defecto para suscripciones
  const beneficios = [
    'Acceso ilimitado a clases',
    'Prioridad en reservas',
    'Contenido exclusivo',
    'Soporte premium 24/7',
    'Certificados oficiales',
    'Material descargable',
  ];

  // Precio con descuento simulado
  const precioOriginal = producto.precio * 1.3;
  const descuento = Math.round(((precioOriginal - producto.precio) / precioOriginal) * 100);

  return (
    <Card
      className={`
        relative
        border-4
        ${destacado ? 'border-primary scale-110' : 'border-black'}
        ${destacado ? 'shadow-[8px_8px_0px_rgba(0,0,0,1)]' : 'shadow-[5px_5px_0px_rgba(0,0,0,1)]'}
        ${destacado ? 'bg-gradient-to-br from-[#ff6b35]/10 to-[#f7b801]/10' : ''}
        transition-all
        duration-300
        hover:scale-105
        hover:shadow-[8px_8px_0px_rgba(0,0,0,1)]
      `}
    >
      {/* Badge "Popular" si está destacado */}
      {destacado && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge
            className="
              bg-[#f7b801]
              text-[#2a1a5e]
              font-bold
              px-4 py-1
              text-sm
              border-2 border-black
              shadow-[3px_3px_0px_rgba(0,0,0,1)]
            "
          >
            ⭐ MÁS POPULAR
          </Badge>
        </div>
      )}

      <div className="space-y-6 pt-8">
        {/* Header */}
        <div className="text-center space-y-3">
          {/* Emoji grande */}
          <div className="text-6xl">💎</div>

          {/* Nombre del plan */}
          <h3 className="font-[family-name:var(--font-fredoka)] text-3xl text-dark">
            {producto.nombre}
          </h3>

          {/* Precio */}
          <div className="space-y-1">
            {/* Precio original tachado */}
            {descuento > 0 && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-gray-400 line-through text-xl">
                  ${precioOriginal.toFixed(0)}
                </span>
                <Badge className="bg-[#4caf50] text-white font-bold text-xs px-2 py-0.5">
                  -{descuento}%
                </Badge>
              </div>
            )}

            {/* Precio actual */}
            <div className="flex items-baseline justify-center gap-1">
              <span className="font-[family-name:var(--font-fredoka)] text-5xl text-primary">
                ${producto.precio}
              </span>
              {producto.duracion_dias && (
                <span className="text-gray-600">
                  / {producto.duracion_dias} días
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Descripción corta */}
        <p className="text-center text-gray-600 text-sm px-4">
          {producto.descripcion}
        </p>

        {/* Beneficios */}
        <div className="space-y-3 px-4">
          <p className="font-bold text-dark text-sm">✨ Incluye:</p>
          <ul className="space-y-2">
            {beneficios.map((beneficio, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <span className="text-[#4caf50] text-lg flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <span>{beneficio}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Botón CTA */}
        <div className="pt-4 border-t-2 border-gray-200">
          <Button
            variant={destacado ? 'primary' : 'secondary'}
            size="lg"
            className="w-full"
            onClick={() => onComprar(producto.id)}
            isLoading={isLoading}
          >
            {isLoading ? 'Procesando...' : '🛒 Suscribirme ahora'}
          </Button>
        </div>

        {/* Info adicional */}
        {producto.duracion_dias && (
          <div className="text-center text-xs text-gray-500 px-4">
            Se renueva automáticamente. Cancela cuando quieras.
          </div>
        )}
      </div>
    </Card>
  );
}
