'use client';

import { AlertTriangle, Clock, BookOpen, TrendingDown } from 'lucide-react';
import type { AlertaDashboard, TipoAlerta } from '@/lib/api/tutores.api';

interface AlertasBannerProps {
  alertas: AlertaDashboard[];
}

const ALERTA_CONFIG: Record<TipoAlerta, { icon: typeof AlertTriangle; color: string }> = {
  pagoVencido: { icon: AlertTriangle, color: 'text-red-400' },
  pagoPorVencer: { icon: Clock, color: 'text-amber-400' },
  claseHoy: { icon: BookOpen, color: 'text-cyan-400' },
  asistenciaBaja: { icon: TrendingDown, color: 'text-orange-400' },
};

/**
 * Banner de alertas en la parte superior del dashboard
 * Muestra un resumen compacto de las alertas activas
 */
export function AlertasBanner({ alertas }: AlertasBannerProps) {
  if (alertas.length === 0) return null;

  // Agrupar alertas por tipo
  const alertasPorTipo = alertas.reduce(
    (acc, alerta) => {
      acc[alerta.tipo] = (acc[alerta.tipo] || 0) + 1;
      return acc;
    },
    {} as Record<TipoAlerta, number>,
  );

  // Calcular prioridad máxima
  const hasAlta = alertas.some((a) => a.prioridad === 'alta');
  const bgColor = hasAlta
    ? 'bg-red-950/60 border-red-500/30'
    : 'bg-amber-950/60 border-amber-500/30';

  return (
    <div className={`h-12 shrink-0 ${bgColor} border-b px-6 flex items-center gap-4`}>
      <div className="flex items-center gap-2">
        <AlertTriangle className={`w-5 h-5 ${hasAlta ? 'text-red-400' : 'text-amber-400'}`} />
        <span className="text-sm font-medium text-white">
          {alertas.length} {alertas.length === 1 ? 'alerta' : 'alertas'}
        </span>
      </div>

      <div className="h-4 w-px bg-slate-700" />

      <div className="flex items-center gap-4 flex-1">
        {Object.entries(alertasPorTipo).map(([tipo, count]) => {
          const config = ALERTA_CONFIG[tipo as TipoAlerta];
          const Icon = config.icon;
          const label = getAlertaLabel(tipo as TipoAlerta, count);

          return (
            <div key={tipo} className="flex items-center gap-1.5">
              <Icon className={`w-4 h-4 ${config.color}`} />
              <span className={`text-sm ${config.color}`}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getAlertaLabel(tipo: TipoAlerta, count: number): string {
  switch (tipo) {
    case 'pagoVencido':
      return `${count} pago${count > 1 ? 's' : ''} vencido${count > 1 ? 's' : ''}`;
    case 'pagoPorVencer':
      return `${count} pago${count > 1 ? 's' : ''} por vencer`;
    case 'claseHoy':
      return `${count} clase${count > 1 ? 's' : ''} hoy`;
    case 'asistenciaBaja':
      return `Asistencia baja`;
    default:
      return `${count} alerta${count > 1 ? 's' : ''}`;
  }
}
