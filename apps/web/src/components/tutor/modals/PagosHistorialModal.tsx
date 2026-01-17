'use client';

import { useState, useEffect } from 'react';
import { X, DollarSign, Clock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { tutoresApi, MisInscripcionesResponse, PagoPendiente } from '@/lib/api/tutores.api';

interface PagosHistorialModalProps {
  pagosPendientes: PagoPendiente[];
  onClose: () => void;
}

/**
 * Modal con historial completo de pagos
 * Muestra pagos pendientes y el historial de inscripciones
 */
export function PagosHistorialModal({ pagosPendientes, onClose }: PagosHistorialModalProps) {
  const [inscripciones, setInscripciones] = useState<MisInscripcionesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInscripciones = async () => {
      try {
        const data = await tutoresApi.getMisInscripciones();
        setInscripciones(data);
      } catch (error) {
        console.error('Error cargando inscripciones:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInscripciones();
  }, []);

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
      year: 'numeric',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Historial de Pagos</h2>
              <p className="text-sm text-slate-400">Tus inscripciones y estado de pago</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Pagos pendientes */}
          {pagosPendientes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Pendientes de Pago
              </h3>
              <div className="space-y-2">
                {pagosPendientes.map((pago) => (
                  <PagoItem key={pago.id} pago={pago} />
                ))}
              </div>
            </div>
          )}

          {/* Resumen */}
          {inscripciones && (
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <p className="text-sm text-slate-400 mb-1">Total Pendiente</p>
                <p className="text-2xl font-bold text-red-400">
                  {formatMoney(inscripciones.resumen.totalPendiente)}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <p className="text-sm text-slate-400 mb-1">Total Pagado</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {formatMoney(inscripciones.resumen.totalPagado)}
                </p>
              </div>
            </div>
          )}

          {/* Lista de inscripciones */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Todas las Inscripciones
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
              </div>
            ) : inscripciones && inscripciones.inscripciones.length > 0 ? (
              <div className="space-y-2">
                {inscripciones.inscripciones.map((insc) => (
                  <div
                    key={insc.id}
                    className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <StatusIcon estado={insc.estadoPago} />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {insc.estudiante.nombre} {insc.estudiante.apellido}
                        </p>
                        <p className="text-xs text-slate-400">Período: {insc.periodo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">
                        {formatMoney(Number(insc.precioFinal))}
                      </p>
                      <p
                        className={`text-xs ${
                          insc.estadoPago === 'Pagado'
                            ? 'text-emerald-400'
                            : insc.estadoPago === 'Vencido'
                              ? 'text-red-400'
                              : 'text-amber-400'
                        }`}
                      >
                        {insc.estadoPago}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400">No hay inscripciones registradas</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PagoItem({ pago }: { pago: PagoPendiente }) {
  const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const isVencido = pago.estaVencido;

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border ${
        isVencido ? 'bg-red-950/30 border-red-500/30' : 'bg-amber-950/30 border-amber-500/30'
      }`}
    >
      <div className="flex items-center gap-3">
        {isVencido ? (
          <AlertTriangle className="w-5 h-5 text-red-400" />
        ) : (
          <Clock className="w-5 h-5 text-amber-400" />
        )}
        <div>
          <p className="text-sm font-medium text-white">{pago.estudianteNombre}</p>
          <p className="text-xs text-slate-400">
            Vence: {formatDate(pago.fechaVencimiento)}
            {isVencido && ` (${Math.abs(pago.diasParaVencer)} días de atraso)`}
          </p>
        </div>
      </div>
      <p className={`text-lg font-bold ${isVencido ? 'text-red-400' : 'text-amber-400'}`}>
        {formatMoney(pago.monto)}
      </p>
    </div>
  );
}

function StatusIcon({ estado }: { estado: string }) {
  switch (estado) {
    case 'Pagado':
      return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    case 'Vencido':
      return <AlertTriangle className="w-5 h-5 text-red-400" />;
    default:
      return <Clock className="w-5 h-5 text-amber-400" />;
  }
}
