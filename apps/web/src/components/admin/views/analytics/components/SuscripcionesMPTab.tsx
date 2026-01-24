'use client';

import {
  CreditCard,
  AlertTriangle,
  Clock,
  XCircle,
  DollarSign,
  Percent,
  Users,
  Mail,
} from 'lucide-react';
import type { SuscripcionesMPData } from '../hooks';
import type { SuscripcionMorosa } from '@/lib/api/admin.api';

/**
 * SuscripcionesMPTab - Métricas de Mercado Pago
 *
 * Muestra:
 * - KPIs de suscripciones (activas, morosas, canceladas)
 * - Lista de suscripciones morosas
 * - Tasa de cancelación
 */

interface SuscripcionesMPTabProps {
  suscripcionesMP: SuscripcionesMPData;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: typeof CreditCard;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]">
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: bgColor }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div>
          <p className="text-sm text-[var(--admin-text-muted)]">{label}</p>
          <p className="text-2xl font-bold" style={{ color }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SuscripcionesMPTab({ suscripcionesMP }: SuscripcionesMPTabProps) {
  const { metricas, morosas = [], totalMorosas = 0 } = suscripcionesMP;

  return (
    <div className="h-full overflow-auto p-4 space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          icon={CreditCard}
          label="Suscripciones Activas"
          value={metricas.totalActivas}
          color="#10b981"
          bgColor="rgba(16, 185, 129, 0.1)"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Morosas"
          value={metricas.totalMorosas}
          color="#ef4444"
          bgColor="rgba(239, 68, 68, 0.1)"
        />
        <MetricCard
          icon={Clock}
          label="En Período de Gracia"
          value={metricas.totalEnGracia}
          color="#f59e0b"
          bgColor="rgba(245, 158, 11, 0.1)"
        />
        <MetricCard
          icon={XCircle}
          label="Canceladas este Mes"
          value={metricas.totalCanceladasMes}
          color="#6b7280"
          bgColor="rgba(107, 114, 128, 0.1)"
        />
        <MetricCard
          icon={DollarSign}
          label="Ingresos del Mes"
          value={formatCurrency(metricas.ingresosMes)}
          color="#10b981"
          bgColor="rgba(16, 185, 129, 0.1)"
        />
        <MetricCard
          icon={Percent}
          label="Tasa de Cancelación"
          value={`${metricas.tasaCancelacion.toFixed(1)}%`}
          color={metricas.tasaCancelacion > 5 ? '#ef4444' : '#10b981'}
          bgColor={
            metricas.tasaCancelacion > 5 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'
          }
        />
      </div>

      {/* Lista de Morosas */}
      <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--admin-text)]">Suscripciones Morosas</h3>
          {totalMorosas > 0 && (
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm">
              {totalMorosas} total
            </span>
          )}
        </div>

        {morosas.length > 0 ? (
          <div className="space-y-3">
            {morosas.slice(0, 10).map((suscripcion: SuscripcionMorosa) => (
              <div
                key={suscripcion.id}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--admin-text)]">
                        {suscripcion.tutorNombre}
                      </p>
                      {suscripcion.tutorEmail && (
                        <div className="flex items-center gap-1 text-sm text-[var(--admin-text-muted)]">
                          <Mail className="w-3 h-3" />
                          <span>{suscripcion.tutorEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[var(--admin-text)]">
                      {formatCurrency(suscripcion.montoMensual)}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm ${
                          suscripcion.diasMorosos > 15 ? 'text-red-400' : 'text-amber-400'
                        }`}
                      >
                        {suscripcion.diasMorosos} días
                      </span>
                      {suscripcion.enGracia && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                          En gracia
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {totalMorosas > 10 && (
              <p className="text-center text-sm text-[var(--admin-text-muted)] pt-2">
                +{totalMorosas - 10} más...
              </p>
            )}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-[var(--admin-text)]">Sin suscripciones morosas</p>
            <p className="text-sm text-[var(--admin-text-muted)] mt-1">
              Todas las suscripciones están al día
            </p>
          </div>
        )}
      </div>

      {/* Info adicional */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm text-blue-400 font-medium">Integración Mercado Pago</p>
            <p className="text-sm text-[var(--admin-text-muted)] mt-1">
              Los datos se actualizan automáticamente cuando se reciben webhooks de MP. Las
              suscripciones morosas son aquellas con pagos fallidos después del período de gracia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuscripcionesMPTab;
