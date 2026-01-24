'use client';

import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SuscripcionFamiliarDetalle } from '@/lib/api/suscripcion-familiar.api';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { AdminBadge } from '@/components/admin/primitives';
import {
  SUSCRIPCION_MP_ESTADO_COLORS,
  SUSCRIPCION_MP_ESTADO_LABELS,
  getPlanColors,
  type EstadoVariant,
} from '@/components/admin/constants/colors.constants';

interface SuscripcionesTableProps {
  suscripciones: SuscripcionFamiliarDetalle[];
  onView: (suscripcion: SuscripcionFamiliarDetalle) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Badge de estado con colores - usa CSS variables */
function EstadoBadge({ estado }: { estado: string }) {
  const config = SUSCRIPCION_MP_ESTADO_COLORS[estado];
  const label = SUSCRIPCION_MP_ESTADO_LABELS[estado] ?? estado;
  const variant: EstadoVariant = config?.variant ?? 'neutral';

  return <AdminBadge variant={variant}>{label}</AdminBadge>;
}

/** Badge de tier con colores - usa constantes centralizadas */
function TierBadge({ tier }: { tier: string }) {
  const TIER_LABELS: Record<string, string> = {
    STEAM_LIBROS: 'Libros',
    STEAM_ASINCRONICO: 'Asincrónico',
    STEAM_SINCRONICO: 'Sincrónico',
  };

  const planColors = getPlanColors(tier);
  const label = TIER_LABELS[tier] ?? tier;

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-md ${planColors.bg} ${planColors.text}`}
    >
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
