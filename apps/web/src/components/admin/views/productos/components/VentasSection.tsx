'use client';

import { useState } from 'react';
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';

interface VentasSectionProps {
  productoId: string;
  productoNombre: string;
  productoTipo: string;
  productoPrecio: number;
}

/**
 * VentasSection - Sección de ventas para productos Físico/Digital
 *
 * Muestra:
 * - Estadísticas del producto
 * - Link a MercadoPago (si configurado)
 * - Información sobre cómo trackear ventas
 */
export function VentasSection({
  productoId,
  productoNombre,
  productoTipo,
  productoPrecio,
}: VentasSectionProps) {
  const [showInfo, setShowInfo] = useState(false);

  const isPhysical = productoTipo === 'Fisico';
  const isDigital = productoTipo === 'Digital';

  return (
    <div className="p-5 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-[var(--admin-accent)]" />
          <h3 className="text-lg font-semibold text-[var(--admin-text)]">
            {isPhysical ? 'Ventas y Stock' : 'Ventas Digitales'}
          </h3>
        </div>
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
            isPhysical ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
          }`}
        >
          {isPhysical ? 'Producto Físico' : 'Producto Digital'}
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-[var(--admin-surface-2)] rounded-xl">
          <div className="flex items-center gap-2 text-[var(--admin-text-muted)] mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs">Precio</span>
          </div>
          <p className="text-lg font-bold text-[var(--status-success)]">
            {formatCurrency(productoPrecio)}
          </p>
        </div>

        <div className="p-4 bg-[var(--admin-surface-2)] rounded-xl">
          <div className="flex items-center gap-2 text-[var(--admin-text-muted)] mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Ventas totales</span>
          </div>
          <p className="text-lg font-bold text-[var(--admin-text)]">
            -
            <span className="text-xs font-normal text-[var(--admin-text-muted)] ml-1">
              No disponible
            </span>
          </p>
        </div>

        {isPhysical && (
          <div className="p-4 bg-[var(--admin-surface-2)] rounded-xl">
            <div className="flex items-center gap-2 text-[var(--admin-text-muted)] mb-2">
              <Package className="w-4 h-4" />
              <span className="text-xs">Stock</span>
            </div>
            <p className="text-lg font-bold text-[var(--admin-text)]">
              -
              <span className="text-xs font-normal text-[var(--admin-text-muted)] ml-1">
                No configurado
              </span>
            </p>
          </div>
        )}

        {isDigital && (
          <div className="p-4 bg-[var(--admin-surface-2)] rounded-xl">
            <div className="flex items-center gap-2 text-[var(--admin-text-muted)] mb-2">
              <ExternalLink className="w-4 h-4" />
              <span className="text-xs">Descargas</span>
            </div>
            <p className="text-lg font-bold text-[var(--admin-text)]">
              -
              <span className="text-xs font-normal text-[var(--admin-text-muted)] ml-1">
                No disponible
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-[var(--status-info-muted)] rounded-xl border border-[var(--status-info)]/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[var(--status-info)] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-[var(--admin-text)] mb-1">
              Sistema de ventas en desarrollo
            </h4>
            <p className="text-xs text-[var(--admin-text-muted)]">
              {isPhysical
                ? 'Para productos físicos como remeras o libros, las ventas se gestionan actualmente a través de MercadoPago o de forma manual. El sistema de stock integrado estará disponible próximamente.'
                : 'Para productos digitales como PDFs o guías, las ventas se gestionan actualmente a través de MercadoPago. El sistema de descargas y acceso automático estará disponible próximamente.'}
            </p>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-xs text-[var(--status-info)] hover:underline mt-2"
            >
              {showInfo ? 'Ver menos' : 'Ver más información'}
            </button>

            {showInfo && (
              <div className="mt-3 p-3 bg-[var(--admin-surface-1)] rounded-lg text-xs text-[var(--admin-text-muted)] space-y-2">
                <p>
                  <strong>Opciones actuales para gestionar ventas:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <strong>MercadoPago:</strong> Crear un link de pago desde tu cuenta de
                    MercadoPago con el precio del producto.
                  </li>
                  <li>
                    <strong>Manual:</strong> Registrar las ventas en una planilla externa y
                    conciliar periódicamente.
                  </li>
                  {isDigital && (
                    <li>
                      <strong>Entrega:</strong> Enviar el archivo digital por email después de
                      confirmar el pago.
                    </li>
                  )}
                  {isPhysical && (
                    <li>
                      <strong>Envío:</strong> Coordinar el envío físico con el comprador después de
                      confirmar el pago.
                    </li>
                  )}
                </ul>
                <p className="mt-2 text-[var(--status-info)]">
                  En futuras versiones se habilitará el tracking de ventas integrado con MercadoPago
                  y gestión de inventario.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <a
          href={`https://www.mercadopago.com.ar/activities/balance`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--admin-surface-2)] text-[var(--admin-text)] rounded-lg text-sm hover:bg-[var(--admin-surface-1)] border border-[var(--admin-border)] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Ver actividad en MercadoPago
        </a>
      </div>
    </div>
  );
}

export default VentasSection;
