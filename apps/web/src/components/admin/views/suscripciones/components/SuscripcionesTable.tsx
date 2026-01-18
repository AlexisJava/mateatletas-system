'use client';

import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SuscripcionFamiliarDetalle } from '@/lib/api/suscripcion-familiar.api';
import { formatCurrency, formatDate } from '@/lib/utils/format';

interface SuscripcionesTableProps {
  suscripciones: SuscripcionFamiliarDetalle[];
  onView: (suscripcion: SuscripcionFamiliarDetalle) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Badge de estado con colores */
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
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${className}`}>
      {label}
    </span>
  );
}

/** Badge de tier con colores */
function TierBadge({ tier }: { tier: string }) {
  const config: Record<string, { label: string; className: string }> = {
    STEAM_LIBROS: {
      label: 'Libros',
      className: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
    STEAM_ASINCRONICO: {
      label: 'Asincrónico',
      className: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    },
    STEAM_SINCRONICO: {
      label: 'Sincrónico',
      className: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    },
  };

  const { label, className } = config[tier] ?? {
    label: tier,
    className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${className}`}>
      {label}
    </span>
  );
}

/** Mobile card view for a subscription */
function SuscripcionCard({
  suscripcion,
  onView,
}: {
  suscripcion: SuscripcionFamiliarDetalle;
  onView: () => void;
}) {
  return (
    <div className="p-4 bg-[var(--admin-surface-1)] rounded-xl border border-[var(--admin-border)]">
      {/* Header: Tutor + Estado */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-[var(--admin-text)] truncate">{suscripcion.tutorNombre}</p>
          <p className="text-xs text-[var(--admin-text-muted)]">
            {suscripcion.cantidadEstudiantes} estudiante
            {suscripcion.cantidadEstudiantes !== 1 ? 's' : ''} • {suscripcion.cantidadActividades}{' '}
            actividad
            {suscripcion.cantidadActividades !== 1 ? 'es' : ''}
          </p>
        </div>
        <EstadoBadge estado={suscripcion.estado} />
      </div>

      {/* Info row: Tier + Monto */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <TierBadge tier={suscripcion.tier} />
        <span className="font-semibold text-[var(--admin-text)]">
          {formatCurrency(suscripcion.montoMensual)}
        </span>
      </div>

      {/* Footer: Próximo cobro + Action */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--admin-border)]">
        <div className="text-xs text-[var(--admin-text-muted)]">
          {suscripcion.fechaProximoCobro ? (
            <>
              Próx. cobro:{' '}
              <span className="text-[var(--admin-text)]">
                {formatDate(suscripcion.fechaProximoCobro)}
              </span>
            </>
          ) : (
            'Sin cobro programado'
          )}
        </div>
        <button
          type="button"
          onClick={onView}
          className="p-2 rounded-lg bg-[var(--admin-surface-2)] text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors"
          title="Ver detalle"
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Tabla de suscripciones familiares con paginación
 * - Mobile: Vista de cards
 * - Desktop: Vista de tabla
 */
export function SuscripcionesTable({
  suscripciones,
  onView,
  page,
  totalPages,
  onPageChange,
}: SuscripcionesTableProps) {
  if (suscripciones.length === 0) {
    return (
      <div className="text-center py-12 bg-[var(--admin-surface-1)] rounded-xl border border-[var(--admin-border)]">
        <p className="text-[var(--admin-text-muted)]">No se encontraron suscripciones</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile: Cards */}
      <div className="block md:hidden space-y-3">
        {suscripciones.map((suscripcion) => (
          <SuscripcionCard
            key={suscripcion.id}
            suscripcion={suscripcion}
            onView={() => onView(suscripcion)}
          />
        ))}
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-[var(--admin-border)]">
        <table className="w-full">
          <thead className="bg-[var(--admin-surface-2)]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                Tutor
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                Tier
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                Inscripciones
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                Monto
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                Próx. Cobro
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--admin-border)] bg-[var(--admin-surface-1)]">
            {suscripciones.map((suscripcion) => (
              <tr
                key={suscripcion.id}
                className="hover:bg-[var(--admin-surface-2)] transition-colors"
              >
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-[var(--admin-text)]">
                      {suscripcion.tutorNombre}
                    </p>
                    <p className="text-xs text-[var(--admin-text-muted)]">
                      {suscripcion.cantidadEstudiantes} estudiante
                      {suscripcion.cantidadEstudiantes !== 1 ? 's' : ''}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <EstadoBadge estado={suscripcion.estado} />
                </td>
                <td className="px-4 py-4">
                  <TierBadge tier={suscripcion.tier} />
                </td>
                <td className="px-4 py-4">
                  <span className="text-[var(--admin-text)]">
                    {suscripcion.cantidadActividades}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="font-medium text-[var(--admin-text)]">
                    {formatCurrency(suscripcion.montoMensual)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-[var(--admin-text-muted)]">
                    {suscripcion.fechaProximoCobro
                      ? formatDate(suscripcion.fechaProximoCobro)
                      : '-'}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onView(suscripcion)}
                    className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors"
                    title="Ver detalle"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-lg bg-[var(--admin-surface-1)] border border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-[var(--admin-text-muted)]">
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-lg bg-[var(--admin-surface-1)] border border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default SuscripcionesTable;
