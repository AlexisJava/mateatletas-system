'use client';

import { X, User, Package, Calendar, DollarSign, Percent } from 'lucide-react';
import type { SuscripcionFamiliarDetalle } from '@/lib/api/suscripcion-familiar.api';
import { formatCurrency, formatDate } from '@/lib/utils/format';

interface SuscripcionDetailModalProps {
  suscripcion: SuscripcionFamiliarDetalle | null;
  onClose: () => void;
}

/** Badge de estado */
function EstadoBadge({ estado }: { estado: string }) {
  const config: Record<string, { label: string; className: string }> = {
    AUTHORIZED: {
      label: 'Activa',
      className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    PENDING: {
      label: 'Pendiente',
      className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    PAUSED: {
      label: 'Pausada',
      className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    CANCELLED: {
      label: 'Cancelada',
      className: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
  };

  const { label, className } = config[estado] ?? {
    label: estado,
    className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${className}`}>
      {label}
    </span>
  );
}

/** Badge de tier */
function TierBadge({ tier }: { tier: string }) {
  const config: Record<string, { label: string; className: string }> = {
    STEAM_LIBROS: {
      label: 'Libros',
      className: 'bg-purple-500/20 text-purple-400',
    },
    STEAM_ASINCRONICO: {
      label: 'Asincrónico',
      className: 'bg-cyan-500/20 text-cyan-400',
    },
    STEAM_SINCRONICO: {
      label: 'Sincrónico',
      className: 'bg-pink-500/20 text-pink-400',
    },
  };

  const { label, className } = config[tier] ?? {
    label: tier,
    className: 'bg-gray-500/20 text-gray-400',
  };

  return <span className={`px-2 py-0.5 text-xs font-medium rounded ${className}`}>{label}</span>;
}

/**
 * Modal de detalle de suscripción familiar
 *
 * Muestra:
 * - Información del tutor
 * - Estado y tier
 * - Monto mensual y próximo cobro
 * - Lista de inscripciones con detalle de precios
 *
 * Responsive:
 * - Mobile: Full screen modal con scroll
 * - Desktop: Centered modal con max-width
 */
export function SuscripcionDetailModal({ suscripcion, onClose }: SuscripcionDetailModalProps) {
  if (!suscripcion) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal - Full height on mobile, centered on desktop */}
      <div className="relative w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-[var(--admin-surface-1)] rounded-t-2xl sm:rounded-2xl border border-[var(--admin-border)] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 sm:p-6 bg-[var(--admin-surface-1)] border-b border-[var(--admin-border)] z-10">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--admin-text)]">
              Detalle de Suscripción
            </h2>
            <p className="text-xs sm:text-sm text-[var(--admin-text-muted)] truncate">
              ID: {suscripcion.id.slice(0, 8)}...
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-2 p-2 rounded-lg hover:bg-[var(--admin-surface-2)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Tutor Info */}
          <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-[var(--admin-surface-2)] rounded-xl">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--admin-accent)]/20 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--admin-accent)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--admin-text)] truncate">
                {suscripcion.tutorNombre}
              </p>
              <p className="text-xs sm:text-sm text-[var(--admin-text-muted)]">
                {suscripcion.cantidadEstudiantes} estudiante
                {suscripcion.cantidadEstudiantes !== 1 ? 's' : ''} •{' '}
                {suscripcion.cantidadActividades} actividad
                {suscripcion.cantidadActividades !== 1 ? 'es' : ''}
              </p>
            </div>
            <EstadoBadge estado={suscripcion.estado} />
          </div>

          {/* Stats Grid - Stack on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-[var(--admin-surface-2)] rounded-xl">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-xs sm:text-sm text-[var(--admin-text-muted)]">
                  Monto Mensual
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-[var(--admin-text)]">
                {formatCurrency(suscripcion.montoMensual)}
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-[var(--admin-surface-2)] rounded-xl">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-xs sm:text-sm text-[var(--admin-text-muted)]">
                  Próximo Cobro
                </span>
              </div>
              <p className="text-base sm:text-lg font-medium text-[var(--admin-text)]">
                {suscripcion.fechaProximoCobro
                  ? formatDate(suscripcion.fechaProximoCobro)
                  : 'No programado'}
              </p>
            </div>
          </div>

          {/* Inscripciones */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-[var(--admin-text)] mb-3 sm:mb-4">
              Inscripciones Activas
            </h3>
            <div className="space-y-3">
              {suscripcion.inscripciones.map((inscripcion) => (
                <div
                  key={inscripcion.id}
                  className="p-3 sm:p-4 bg-[var(--admin-surface-2)] rounded-xl border border-[var(--admin-border)]"
                >
                  {/* Header: Producto + Tier */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--admin-text-muted)] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base text-[var(--admin-text)] truncate">
                          {inscripcion.productoNombre}
                        </p>
                        <p className="text-xs sm:text-sm text-[var(--admin-text-muted)] truncate">
                          {inscripcion.estudianteNombre}
                        </p>
                      </div>
                    </div>
                    {inscripcion.tier && <TierBadge tier={inscripcion.tier} />}
                  </div>

                  {/* Precios - Stack on very small screens */}
                  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mt-3 pt-3 border-t border-[var(--admin-border)]">
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                      <span className="text-xs sm:text-sm text-[var(--admin-text-muted)]">
                        Base: {formatCurrency(inscripcion.precioBase)}
                      </span>
                      {inscripcion.descuentoAplicado > 0 && (
                        <span className="flex items-center gap-1 text-xs sm:text-sm text-emerald-400">
                          <Percent className="w-3 h-3" />
                          {inscripcion.descuentoAplicado}% desc.
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-sm sm:text-base text-[var(--admin-text)]">
                      {formatCurrency(inscripcion.precioConDescuento)}
                    </span>
                  </div>

                  {/* Clase/Comisión */}
                  {(inscripcion.claseGrupoNombre || inscripcion.comisionNombre) && (
                    <p className="text-xs text-[var(--admin-text-muted)] mt-2 truncate">
                      {inscripcion.claseGrupoNombre ?? inscripcion.comisionNombre}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Fechas - Stack on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 text-xs sm:text-sm text-[var(--admin-text-muted)] pt-4 border-t border-[var(--admin-border)]">
            <span>Creada: {formatDate(suscripcion.createdAt)}</span>
            <span>Actualizada: {formatDate(suscripcion.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuscripcionDetailModal;
