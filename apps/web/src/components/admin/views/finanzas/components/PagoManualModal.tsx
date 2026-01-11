'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  X,
  Check,
  Loader2,
  Search,
  AlertCircle,
  DollarSign,
  User,
  Calendar,
} from 'lucide-react';
import {
  getInscripcionesPendientes,
  registrarPagoManual,
  type InscripcionPendiente,
  type PagoManualResult,
} from '@/lib/api/admin.api';

interface PagoManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: PagoManualResult) => void;
}

const METODOS_PAGO = ['Efectivo', 'Transferencia', 'MercadoPago', 'Otro'];

export function PagoManualModal({ isOpen, onClose, onSuccess }: PagoManualModalProps) {
  const [inscripciones, setInscripciones] = useState<InscripcionPendiente[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<PagoManualResult | null>(null);
  const [search, setSearch] = useState('');

  // Form state
  const [selectedInscripcion, setSelectedInscripcion] = useState<InscripcionPendiente | null>(null);
  const [monto, setMonto] = useState<number>(0);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [observaciones, setObservaciones] = useState('');

  const fetchInscripciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getInscripcionesPendientes({
        limit: 50,
        search: search || undefined,
      });
      setInscripciones(response.data);
    } catch {
      setError('Error al cargar inscripciones pendientes');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (isOpen) {
      fetchInscripciones();
      // Reset form
      setSelectedInscripcion(null);
      setMonto(0);
      setMetodoPago('Efectivo');
      setObservaciones('');
      setSuccess(null);
      setError(null);
    }
  }, [isOpen, fetchInscripciones]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen) fetchInscripciones();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, isOpen, fetchInscripciones]);

  const handleSelectInscripcion = (inscripcion: InscripcionPendiente) => {
    setSelectedInscripcion(inscripcion);
    setMonto(inscripcion.precioFinal);
    setSuccess(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedInscripcion) return;

    setSaving(true);
    setError(null);
    try {
      const result = await registrarPagoManual({
        inscripcionId: selectedInscripcion.id,
        monto,
        metodoPago,
        observaciones: observaciones || undefined,
      });
      setSuccess(result);
      onSuccess?.(result);
      // Refrescar lista para que desaparezca la inscripcion pagada
      fetchInscripciones();
      setSelectedInscripcion(null);
    } catch {
      setError('Error al registrar el pago');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Registrar Pago Manual</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Success message */}
          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-500 mb-1">Pago registrado</p>
                  <p className="text-xs text-[var(--admin-text-muted)]">
                    {success.inscripcion.estudiante} - {success.inscripcion.periodo}
                    <br />
                    Estado: {success.inscripcion.estadoAnterior} → {success.inscripcion.estadoNuevo}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--admin-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre de estudiante o tutor..."
              className="w-full pl-10 pr-4 py-3 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] placeholder:text-[var(--admin-text-disabled)] focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Inscripciones list */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-[var(--admin-text-muted)]">
              Inscripciones Pendientes ({inscripciones.length})
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-2 border border-[var(--admin-border)] rounded-xl p-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--admin-text-muted)]" />
                </div>
              ) : inscripciones.length === 0 ? (
                <p className="text-center py-8 text-sm text-[var(--admin-text-muted)]">
                  No hay inscripciones pendientes
                </p>
              ) : (
                inscripciones.map((ins) => (
                  <button
                    key={ins.id}
                    onClick={() => handleSelectInscripcion(ins)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedInscripcion?.id === ins.id
                        ? 'bg-emerald-500/20 border-emerald-500'
                        : 'bg-[var(--admin-surface-2)] hover:bg-[var(--admin-surface-1)]'
                    } border border-[var(--admin-border)]`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-[var(--admin-text-muted)]" />
                        <div>
                          <p className="text-sm font-medium text-[var(--admin-text)]">
                            {ins.estudiante.nombre}
                          </p>
                          <p className="text-xs text-[var(--admin-text-muted)]">
                            {ins.producto} - {ins.periodo}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-500">
                          ${ins.precioFinal.toLocaleString('es-AR')}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            ins.estadoPago === 'Vencido'
                              ? 'bg-red-500/20 text-red-400'
                              : ins.estadoPago === 'Parcial'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {ins.estadoPago}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Payment form */}
          {selectedInscripcion && (
            <div className="space-y-4 p-4 bg-[var(--admin-surface-2)] rounded-xl border border-[var(--admin-border)]">
              <h4 className="text-sm font-semibold text-[var(--admin-text)] flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Datos del Pago
              </h4>

              <div className="grid grid-cols-2 gap-4">
                {/* Monto */}
                <div>
                  <label className="block text-xs text-[var(--admin-text-muted)] mb-1">
                    Monto a Registrar
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
                    <input
                      type="number"
                      value={monto}
                      onChange={(e) => setMonto(Number(e.target.value))}
                      className="w-full pl-9 pr-4 py-2 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:border-emerald-500"
                      min="1"
                    />
                  </div>
                  {monto < selectedInscripcion.precioFinal && (
                    <p className="text-xs text-amber-400 mt-1">Pago parcial</p>
                  )}
                </div>

                {/* Metodo */}
                <div>
                  <label className="block text-xs text-[var(--admin-text-muted)] mb-1">
                    Metodo de Pago
                  </label>
                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="w-full px-4 py-2 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:border-emerald-500"
                  >
                    {METODOS_PAGO.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-xs text-[var(--admin-text-muted)] mb-1">
                  Observaciones (opcional)
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej: Pago recibido por Alexis"
                  className="w-full px-4 py-2 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] placeholder:text-[var(--admin-text-disabled)] focus:outline-none focus:border-emerald-500 resize-none"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-[var(--admin-border)]">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-[var(--admin-surface-2)] text-[var(--admin-text)] rounded-xl font-semibold border border-[var(--admin-border)] hover:bg-[var(--admin-surface-1)] transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !selectedInscripcion || monto <= 0}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Registrar Pago
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PagoManualModal;
