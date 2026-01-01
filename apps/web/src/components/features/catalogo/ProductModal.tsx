/**
 * ProductModal - Modal de detalle de producto
 *
 * Muestra información completa del producto con opción de compra
 * en diseño chunky estilo Crash Bandicoot.
 *
 * @example
 * ```tsx
 * <ProductModal
 *   producto={producto}
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onComprar={() => handleCompra(producto.id)}
 * />
 * ```
 */

import { Modal, Button, Badge } from '@/components/ui';
import { Producto, TipoProducto } from '@/types/catalogo.types';

interface ProductModalProps {
  producto: Producto | null;
  isOpen: boolean;
  onClose: () => void;
  onComprar?: (_producto: Producto) => void;
}

export function ProductModal({ producto, isOpen, onClose, onComprar }: ProductModalProps) {
  if (!producto) return null;

  // Configuración visual por tipo
  const tipoConfig: Record<
    string,
    { bg: string; badgeBg: string; badgeText: string; emoji: string; beneficios: string[] }
  > = {
    Evento: {
      bg: 'bg-gradient-to-br from-amber-500/20 to-amber-500/5',
      badgeBg: 'bg-amber-500',
      badgeText: 'text-white',
      emoji: '🎪',
      beneficios: [
        'Evento presencial',
        'Material incluido',
        'Certificado de participación',
        'Refrigerio incluido',
      ],
    },
    Digital: {
      bg: 'bg-gradient-to-br from-violet-500/20 to-violet-500/5',
      badgeBg: 'bg-violet-500',
      badgeText: 'text-white',
      emoji: '📱',
      beneficios: [
        'Descarga inmediata',
        'Uso ilimitado',
        'Actualizaciones gratuitas',
        'Soporte básico',
      ],
    },
    Fisico: {
      bg: 'bg-gradient-to-br from-pink-500/20 to-pink-500/5',
      badgeBg: 'bg-pink-500',
      badgeText: 'text-white',
      emoji: '🎁',
      beneficios: [
        'Envío a domicilio',
        'Producto de calidad',
        'Garantía incluida',
        'Soporte postventa',
      ],
    },
    Curso: {
      bg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5',
      badgeBg: 'bg-emerald-500',
      badgeText: 'text-white',
      emoji: '📚',
      beneficios: [
        'Acceso completo al curso',
        'Certificado al completar',
        'Material descargable',
        'Soporte del instructor',
      ],
    },
    Servicio: {
      bg: 'bg-gradient-to-br from-blue-500/20 to-blue-500/5',
      badgeBg: 'bg-blue-500',
      badgeText: 'text-white',
      emoji: '👤',
      beneficios: [
        'Atención personalizada',
        'Horarios flexibles',
        'Seguimiento continuo',
        'Material personalizado',
      ],
    },
    Bundle: {
      bg: 'bg-gradient-to-br from-indigo-500/20 to-indigo-500/5',
      badgeBg: 'bg-indigo-500',
      badgeText: 'text-white',
      emoji: '📦',
      beneficios: [
        'Múltiples productos',
        'Precio especial',
        'Acceso combinado',
        'Soporte unificado',
      ],
    },
    Certificacion: {
      bg: 'bg-gradient-to-br from-yellow-500/20 to-yellow-500/5',
      badgeBg: 'bg-yellow-500',
      badgeText: 'text-black',
      emoji: '🏆',
      beneficios: [
        'Examen oficial',
        'Certificado reconocido',
        'Material de estudio',
        'Reintentos incluidos',
      ],
    },
  };

  const config = tipoConfig[producto.tipo] || {
    bg: 'bg-gradient-to-br from-gray-500/20 to-gray-500/5',
    badgeBg: 'bg-gray-500',
    badgeText: 'text-white',
    emoji: '📦',
    beneficios: ['Producto disponible'],
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="lg"
      className="border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]"
    >
      <div className="space-y-6">
        {/* Header con imagen y badge */}
        <div className={`${config.bg} rounded-lg p-8 border-2 border-black`}>
          <div className="flex items-start gap-6">
            {/* Emoji grande */}
            <div className="text-8xl">{config.emoji}</div>

            <div className="flex-1 space-y-3">
              {/* Badge tipo */}
              <Badge
                className={`
                  ${config.badgeBg}
                  ${config.badgeText}
                  font-bold px-3 py-1
                  border-2 border-black
                  shadow-[3px_3px_0px_rgba(0,0,0,1)]
                `}
              >
                {producto.tipo}
              </Badge>

              {/* Título */}
              <h2 className="font-[family-name:var(--font-fredoka)] text-4xl text-dark leading-tight">
                {producto.nombre}
              </h2>

              {/* Precio */}
              <div className="flex items-baseline gap-2">
                <span className="font-[family-name:var(--font-fredoka)] text-5xl text-primary">
                  ${producto.precio}
                </span>
                {producto.duracion_dias && (
                  <span className="text-lg text-gray-600">/ {producto.duracion_dias} días</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <h3 className="font-[family-name:var(--font-fredoka)] text-2xl text-dark mb-3">
            📝 Descripción
          </h3>
          <p className="text-gray-700 leading-relaxed">{producto.descripcion}</p>
        </div>

        {/* Beneficios */}
        <div>
          <h3 className="font-[family-name:var(--font-fredoka)] text-2xl text-dark mb-3">
            ✨ Incluye
          </h3>
          <ul className="space-y-2">
            {config.beneficios.map((beneficio, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-700">
                <span className="text-xl text-[#4caf50] mt-0.5">✓</span>
                <span>{beneficio}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Información adicional */}
        {producto.duracion_dias && (
          <div
            className="
              bg-[#fff9e6]
              border-2 border-[#f7b801]
              rounded-lg
              p-4
              flex items-center gap-3
            "
          >
            <span className="text-3xl">⏱️</span>
            <div>
              <p className="font-bold text-dark">Duración</p>
              <p className="text-sm text-gray-600">
                {producto.duracion_dias} días de acceso completo
              </p>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
          <Button variant="outline" onClick={onClose} className="flex-1" size="lg">
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => onComprar?.(producto)}
            className="flex-1"
            size="lg"
          >
            🛒 Comprar ahora
          </Button>
        </div>
      </div>
    </Modal>
  );
}
