'use client';

import { DollarSign, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import type { MetricasDashboard, PagoPendiente } from '@/lib/api/tutores.api';

interface PagosResumenProps {
  metricas: MetricasDashboard | null;
  pagosPendientes: PagoPendiente[];
  onVerMas: () => void;
}

/**
 * Footer con resumen de pagos
 * Muestra total pendiente, pagado del año, y próximo vencimiento
 */
export function PagosResumen({ metricas, pagosPendientes, onVerMas }: PagosResumenProps) {
  // Calcular total pendiente
  const totalPendiente = pagosPendientes.reduce((sum, p) => sum + p.monto, 0);

  // Encontrar próximo vencimiento
  const proximoVencimiento = pagosPendientes
    .filter((p) => !p.estaVencido)
    .sort((a, b) => a.diasParaVencer - b.diasParaVencer)[0];

  const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  return (
    <footer
      className="h-20 shrink-0 bg-slate-800 border-t-2 border-cyan-500/50 px-6 flex items-center"
      data-testid="pagos-resumen-footer"
    >
      <div className="flex items-center gap-2 mr-4">
        <DollarSign className="w-5 h-5 text-emerald-400" />
        <span className="text-sm font-semibold text-slate-300">PAGOS</span>
      </div>

      <div className="flex items-center gap-8 flex-1">
        {/* Total pendiente */}
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${totalPendiente > 0 ? 'bg-red-500/10 border border-red-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}
          >
            <Clock
              className={`w-4 h-4 ${totalPendiente > 0 ? 'text-red-400' : 'text-emerald-400'}`}
            />
          </div>
          <div>
            <p className="text-xs text-slate-400">Pendiente</p>
            <p
              className={`text-lg font-bold ${totalPendiente > 0 ? 'text-red-400' : 'text-emerald-400'}`}
            >
              {formatMoney(totalPendiente)}
            </p>
          </div>
        </div>

        {/* Total pagado año */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Pagado este año</p>
            <p className="text-lg font-bold text-cyan-400">
              {formatMoney(metricas?.totalPagadoAnio ?? 0)}
            </p>
          </div>
        </div>

        {/* Próximo vencimiento */}
        {proximoVencimiento && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Próx. vencimiento</p>
              <p className="text-lg font-bold text-amber-400">
                {formatDate(proximoVencimiento.fechaVencimiento)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Ver más button */}
      <button
        onClick={onVerMas}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-all"
      >
        <span className="text-sm font-medium">Ver historial</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </footer>
  );
}
