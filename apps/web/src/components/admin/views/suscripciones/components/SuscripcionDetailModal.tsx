'use client';

import { useState } from 'react';
import {
  X,
  User,
  Package,
  Calendar,
  DollarSign,
  Percent,
  Pause,
  Play,
  Ban,
  Edit3,
  AlertTriangle,
  Loader2,
  Check,
} from 'lucide-react';
import type {
  SuscripcionFamiliarDetalle,
  InscripcionActividadDetalle,
  TierNombre,
} from '@/lib/api/suscripcion-familiar.api';
import { suscripcionFamiliarAdminApi } from '@/lib/api/suscripcion-familiar.api';
import { formatCurrency, formatDate } from '@/lib/utils/format';

interface SuscripcionDetailModalProps {
  suscripcion: SuscripcionFamiliarDetalle | null;
  onClose: () => void;
  onUpdate?: () => void;
}

type ActionType = 'pausar' | 'reactivar' | 'cancelar' | 'cambiarTier' | null;

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

/** Modal de confirmación de acción */
function ConfirmActionModal({
  title,
  description,
  confirmText,
  confirmColor = 'red',
  isLoading,
  requireMotivo,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmText: string;
  confirmColor?: 'red' | 'blue' | 'green';
  isLoading: boolean;
  requireMotivo: boolean;
  onConfirm: (motivo: string) => void;
  onCancel: () => void;
}) {
  const [motivo, setMotivo] = useState('');

  const colorClasses = {
    red: 'bg-red-600 hover:bg-red-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-emerald-600 hover:bg-emerald-700',
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative w-full max-w-md p-6 bg-[var(--admin-surface-1)] rounded-2xl border border-[var(--admin-border)] shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--admin-text)]">{title}</h3>
        </div>
        <p className="text-sm text-[var(--admin-text-muted)] mb-4">{description}</p>

        {requireMotivo && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--admin-text)] mb-2">
              Motivo <span className="text-red-400">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ingrese el motivo..."
              className="w-full px-3 py-2 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]"
              rows={3}
            />
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-[var(--admin-text-muted)] bg-[var(--admin-surface-2)] rounded-lg hover:bg-[var(--admin-surface-3)] transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(motivo)}
            disabled={isLoading || (requireMotivo && !motivo.trim())}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${colorClasses[confirmColor]}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Modal de cambiar tier de inscripción */
function CambiarTierModal({
  inscripcion,
  isLoading,
  onConfirm,
  onCancel,
}: {
  inscripcion: InscripcionActividadDetalle;
  isLoading: boolean;
  onConfirm: (nuevoTier: TierNombre, motivo?: string) => void;
  onCancel: () => void;
}) {
  const [nuevoTier, setNuevoTier] = useState<TierNombre>(inscripcion.tier ?? 'STEAM_SINCRONICO');
  const [motivo, setMotivo] = useState('');

  const tiers: { value: TierNombre; label: string; price: string }[] = [
    { value: 'STEAM_LIBROS', label: 'STEAM Libros', price: '$18.000' },
    { value: 'STEAM_ASINCRONICO', label: 'STEAM Asincrónico', price: '$29.000' },
    { value: 'STEAM_SINCRONICO', label: 'STEAM Sincrónico', price: '$39.000' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative w-full max-w-md p-6 bg-[var(--admin-surface-1)] rounded-2xl border border-[var(--admin-border)] shadow-2xl">
        <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-2">Cambiar Tier</h3>
        <p className="text-sm text-[var(--admin-text-muted)] mb-4">
          {inscripcion.estudianteNombre} - {inscripcion.productoNombre}
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--admin-text)] mb-2">
            Tier actual: <TierBadge tier={inscripcion.tier ?? 'No definido'} />
          </label>
        </div>

        <div className="space-y-2 mb-4">
          {tiers.map((tier) => (
            <label
              key={tier.value}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                nuevoTier === tier.value
                  ? 'border-[var(--admin-accent)] bg-[var(--admin-accent)]/10'
                  : 'border-[var(--admin-border)] bg-[var(--admin-surface-2)] hover:border-[var(--admin-border-hover)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="tier"
                  value={tier.value}
                  checked={nuevoTier === tier.value}
                  onChange={(e) => setNuevoTier(e.target.value as TierNombre)}
                  className="w-4 h-4 text-[var(--admin-accent)]"
                />
                <span className="text-sm font-medium text-[var(--admin-text)]">{tier.label}</span>
              </div>
              <span className="text-sm text-[var(--admin-text-muted)]">{tier.price}</span>
            </label>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--admin-text)] mb-2">
            Motivo (opcional)
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej: Upgrade solicitado por el tutor..."
            className="w-full px-3 py-2 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]"
            rows={2}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-[var(--admin-text-muted)] bg-[var(--admin-surface-2)] rounded-lg hover:bg-[var(--admin-surface-3)] transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(nuevoTier, motivo || undefined)}
            disabled={isLoading || nuevoTier === inscripcion.tier}
            className="px-4 py-2 text-sm font-medium text-white bg-[var(--admin-accent)] rounded-lg hover:bg-[var(--admin-accent-hover)] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Guardar Cambio
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal de detalle de suscripción familiar
 *
 * Muestra:
 * - Información del tutor
 * - Estado y tier
 * - Monto mensual y próximo cobro
 * - Lista de inscripciones con detalle de precios
 * - Acciones admin: Pausar, Reactivar, Cancelar
 * - Cambio de tier por inscripción
 */
export function SuscripcionDetailModal({
  suscripcion,
  onClose,
  onUpdate,
}: SuscripcionDetailModalProps) {
  const [actionType, setActionType] = useState<ActionType>(null);
  const [selectedInscripcion, setSelectedInscripcion] =
    useState<InscripcionActividadDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!suscripcion) return null;

  const canPause = suscripcion.estado === 'AUTHORIZED';
  const canReactivate = suscripcion.estado === 'PAUSED';
  const canCancel = suscripcion.estado !== 'CANCELLED';

  const handleAction = async (motivo: string) => {
    if (!actionType) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (actionType === 'pausar') {
        await suscripcionFamiliarAdminApi.pausar(suscripcion.id, { motivo });
        setSuccessMessage('Suscripción pausada exitosamente');
      } else if (actionType === 'reactivar') {
        await suscripcionFamiliarAdminApi.reactivar(suscripcion.id, {
          motivo: motivo || undefined,
        });
        setSuccessMessage('Suscripción reactivada exitosamente');
      } else if (actionType === 'cancelar') {
        await suscripcionFamiliarAdminApi.cancelar(suscripcion.id, { motivo });
        setSuccessMessage('Suscripción cancelada exitosamente');
      }

      setActionType(null);
      onUpdate?.();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al procesar la acción';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCambiarTier = async (nuevoTier: TierNombre, motivo?: string) => {
    if (!selectedInscripcion) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await suscripcionFamiliarAdminApi.cambiarTierInscripcion(selectedInscripcion.id, {
        nuevoTier,
        motivo,
      });

      setSuccessMessage('Tier actualizado exitosamente');
      setSelectedInscripcion(null);
      onUpdate?.();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al cambiar tier';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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

          {/* Messages */}
          {successMessage && (
            <div className="mx-4 sm:mx-6 mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">{successMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="mx-4 sm:mx-6 mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">{errorMessage}</span>
            </div>
          )}

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

            {/* Admin Actions */}
            <div className="flex flex-wrap gap-2">
              {canPause && (
                <button
                  type="button"
                  onClick={() => setActionType('pausar')}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  Pausar
                </button>
              )}
              {canReactivate && (
                <button
                  type="button"
                  onClick={() => setActionType('reactivar')}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Reactivar
                </button>
              )}
              {canCancel && (
                <button
                  type="button"
                  onClick={() => setActionType('cancelar')}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <Ban className="w-4 h-4" />
                  Cancelar
                </button>
              )}
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
                    {/* Header: Producto + Tier + Edit */}
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
                      <div className="flex items-center gap-2">
                        {inscripcion.tier && <TierBadge tier={inscripcion.tier} />}
                        {suscripcion.estado !== 'CANCELLED' && (
                          <button
                            type="button"
                            onClick={() => setSelectedInscripcion(inscripcion)}
                            className="p-1.5 rounded-lg hover:bg-[var(--admin-surface-3)] text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors"
                            title="Cambiar tier"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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

      {/* Action Modals */}
      {actionType === 'pausar' && (
        <ConfirmActionModal
          title="Pausar Suscripción"
          description="La suscripción será pausada y no se realizarán cobros automáticos hasta que sea reactivada. El acceso a contenido puede verse afectado."
          confirmText="Pausar Suscripción"
          confirmColor="blue"
          isLoading={isLoading}
          requireMotivo={true}
          onConfirm={handleAction}
          onCancel={() => setActionType(null)}
        />
      )}
      {actionType === 'reactivar' && (
        <ConfirmActionModal
          title="Reactivar Suscripción"
          description="La suscripción será reactivada y se reanudarán los cobros automáticos según el calendario normal."
          confirmText="Reactivar Suscripción"
          confirmColor="green"
          isLoading={isLoading}
          requireMotivo={false}
          onConfirm={handleAction}
          onCancel={() => setActionType(null)}
        />
      )}
      {actionType === 'cancelar' && (
        <ConfirmActionModal
          title="Cancelar Suscripción"
          description="Esta acción es IRREVERSIBLE. La suscripción será cancelada permanentemente y no se podrá reactivar. El tutor deberá crear una nueva suscripción si desea continuar."
          confirmText="Cancelar Permanentemente"
          confirmColor="red"
          isLoading={isLoading}
          requireMotivo={true}
          onConfirm={handleAction}
          onCancel={() => setActionType(null)}
        />
      )}
      {selectedInscripcion && (
        <CambiarTierModal
          inscripcion={selectedInscripcion}
          isLoading={isLoading}
          onConfirm={handleCambiarTier}
          onCancel={() => setSelectedInscripcion(null)}
        />
      )}
    </>
  );
}

export default SuscripcionDetailModal;
