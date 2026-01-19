'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, Loader2, Check } from 'lucide-react';
import { getAlertas, resolverAlerta, type AlertaAdmin } from '@/lib/api/admin.api';
import { formatCompactCurrency } from '@/lib/utils/format';

/**
 * AlertsPanel - Panel de alertas del sistema
 *
 * Muestra alertas de pagos pendientes + alertas del sistema (faltas, problemas, etc.)
 */

interface AlertsPanelProps {
  ingresosPendientes: number;
}

export function AlertsPanel({ ingresosPendientes }: AlertsPanelProps) {
  const queryClient = useQueryClient();

  const { data: alertas = [], isLoading } = useQuery({
    queryKey: ['adminAlertas'],
    queryFn: getAlertas,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  const resolverMutation = useMutation({
    mutationFn: (id: string) => resolverAlerta(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAlertas'] });
    },
  });

  const handleResolver = (e: React.MouseEvent, alertaId: string) => {
    e.stopPropagation();
    resolverMutation.mutate(alertaId);
  };

  return (
    <div className="h-full p-3 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)] flex flex-col overflow-hidden">
      <h2 className="text-base font-semibold text-[var(--admin-text)] mb-2 flex-shrink-0">
        Alertas del sistema
      </h2>
      <div className="flex-1 space-y-2 overflow-y-auto min-h-0">
        {/* Alerta de pagos pendientes */}
        {ingresosPendientes > 0 && (
          <AlertItemStatic
            type="warning"
            title={`${formatCompactCurrency(ingresosPendientes)} en pagos pendientes`}
            description="Revisar inscripciones sin confirmar pago"
          />
        )}

        {/* Alertas del sistema */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 text-[var(--admin-text-muted)] animate-spin" />
          </div>
        ) : alertas.length > 0 ? (
          alertas.map((alerta) => (
            <AlertItemDynamic
              key={alerta.id}
              alerta={alerta}
              onResolver={handleResolver}
              isResolving={resolverMutation.isPending}
            />
          ))
        ) : ingresosPendientes === 0 ? (
          <AlertItemStatic
            type="success"
            title="Todo en orden"
            description="No hay alertas pendientes"
          />
        ) : null}
      </div>
    </div>
  );
}

// Componente para alertas estáticas (pagos pendientes, todo ok)
function AlertItemStatic({
  type,
  title,
  description,
}: {
  type: 'warning' | 'success';
  title: string;
  description: string;
}) {
  const Icon = type === 'warning' ? AlertCircle : CheckCircle;
  const borderColor =
    type === 'warning' ? 'border-l-[var(--status-warning)]' : 'border-l-[var(--status-success)]';
  const iconBg =
    type === 'warning'
      ? 'text-[var(--status-warning)] bg-[var(--status-warning-muted)]'
      : 'text-[var(--status-success)] bg-[var(--status-success-muted)]';

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg bg-[var(--admin-surface-2)] border border-[var(--admin-border)] border-l-4 ${borderColor}`}
    >
      <div
        className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${iconBg}`}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--admin-text)] truncate">{title}</p>
        <p className="text-xs text-[var(--admin-text-muted)] truncate">{description}</p>
      </div>
    </div>
  );
}

// Componente para alertas dinámicas (del backend)
function AlertItemDynamic({
  alerta,
  onResolver,
  isResolving,
}: {
  alerta: AlertaAdmin;
  onResolver: (e: React.MouseEvent, id: string) => void;
  isResolving: boolean;
}) {
  const estudianteNombre = `${alerta.estudiante.nombre} ${alerta.estudiante.apellido}`;

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--admin-surface-2)] border border-[var(--admin-border)] border-l-4 border-l-[var(--status-warning)] group hover:border-[var(--admin-border-accent)] transition-colors">
      <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-[var(--status-warning)] bg-[var(--status-warning-muted)]">
        <AlertCircle className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--admin-text)] truncate">{estudianteNombre}</p>
        <p className="text-xs text-[var(--admin-text-muted)] truncate">{alerta.descripcion}</p>
        <p className="text-[10px] text-[var(--admin-text-muted)] truncate mt-0.5">
          {alerta.clase.nombre}
        </p>
      </div>
      <button
        onClick={(e) => onResolver(e, alerta.id)}
        disabled={isResolving}
        className="shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[var(--admin-surface-1)] transition-all disabled:opacity-50"
        title="Marcar como resuelta"
      >
        {isResolving ? (
          <Loader2 className="w-4 h-4 text-[var(--admin-text-muted)] animate-spin" />
        ) : (
          <Check className="w-4 h-4 text-[var(--status-success)]" />
        )}
      </button>
    </div>
  );
}
