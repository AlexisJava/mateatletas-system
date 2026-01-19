'use client';

import { useState } from 'react';
import { Download, FileText, Loader2, Filter, Calendar, CheckCircle } from 'lucide-react';
import {
  exportInscripcionesCSV,
  exportMetricasCSV,
  downloadCSV,
  exportInscripcionesPDF,
  exportMetricasPDF,
  downloadPDF,
} from '@/lib/api/admin.api';

/**
 * ReportsPanel - Panel de reportes y exportación
 *
 * Botones funcionales para exportar datos en formato CSV y PDF.
 * Incluye filtros de período y estado.
 */

// Opciones de período (últimos 12 meses + año completo)
const PERIODOS = (() => {
  const options: { value: string; label: string }[] = [{ value: '', label: 'Todos los períodos' }];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return options;
})();

const ESTADOS = [
  { value: '', label: 'Todos los estados' },
  { value: 'ACTIVA', label: 'Activas' },
  { value: 'PAUSADA', label: 'Pausadas' },
  { value: 'CANCELADA', label: 'Canceladas' },
];

export function ReportsPanel() {
  const [loadingInscripcionesCSV, setLoadingInscripcionesCSV] = useState(false);
  const [loadingMetricasCSV, setLoadingMetricasCSV] = useState(false);
  const [loadingInscripcionesPDF, setLoadingInscripcionesPDF] = useState(false);
  const [loadingMetricasPDF, setLoadingMetricasPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [periodo, setPeriodo] = useState('');
  const [estado, setEstado] = useState('');

  const getFilters = () => ({
    ...(periodo && { periodo }),
    ...(estado && { estado }),
  });

  const handleExportInscripcionesCSV = async () => {
    setLoadingInscripcionesCSV(true);
    setError(null);
    try {
      const response = await exportInscripcionesCSV(getFilters());
      downloadCSV(response);
    } catch (err) {
      setError('Error al exportar inscripciones CSV');
      console.error(err);
    } finally {
      setLoadingInscripcionesCSV(false);
    }
  };

  const handleExportMetricasCSV = async () => {
    setLoadingMetricasCSV(true);
    setError(null);
    try {
      const response = await exportMetricasCSV(12);
      downloadCSV(response);
    } catch (err) {
      setError('Error al exportar métricas CSV');
      console.error(err);
    } finally {
      setLoadingMetricasCSV(false);
    }
  };

  const handleExportInscripcionesPDF = async () => {
    setLoadingInscripcionesPDF(true);
    setError(null);
    try {
      const response = await exportInscripcionesPDF(getFilters());
      downloadPDF(response);
    } catch (err) {
      setError('Error al exportar inscripciones PDF');
      console.error(err);
    } finally {
      setLoadingInscripcionesPDF(false);
    }
  };

  const handleExportMetricasPDF = async () => {
    setLoadingMetricasPDF(true);
    setError(null);
    try {
      const response = await exportMetricasPDF(12);
      downloadPDF(response);
    } catch (err) {
      setError('Error al exportar métricas PDF');
      console.error(err);
    } finally {
      setLoadingMetricasPDF(false);
    }
  };

  const hasFilters = periodo || estado;

  return (
    <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
      <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4 flex items-center gap-2">
        <Download className="w-5 h-5 text-[var(--status-success)]" />
        Reportes y Exportación
      </h3>

      {error && (
        <div className="mb-3 p-2 rounded-lg bg-red-500/10 text-red-400 text-sm">{error}</div>
      )}

      {/* Filtros */}
      <div className="mb-4 p-3 rounded-xl bg-[var(--admin-surface-2)] border border-[var(--admin-border)]">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-[var(--admin-text-muted)]" />
          <span className="text-sm font-medium text-[var(--admin-text)]">
            Filtros para Inscripciones
          </span>
          {hasFilters && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--admin-accent)]/20 text-[var(--admin-accent)]">
              Activos
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[var(--admin-text-muted)] mb-1 block flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Período
            </label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--admin-surface-1)] border border-[var(--admin-border)] text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)]"
            >
              {PERIODOS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--admin-text-muted)] mb-1 block flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Estado
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--admin-surface-1)] border border-[var(--admin-border)] text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)]"
            >
              {ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* CSV Exports */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExportInscripcionesCSV}
            disabled={loadingInscripcionesCSV}
            className="p-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all flex items-center justify-between group"
          >
            <span className="text-sm">Inscripciones CSV</span>
            {loadingInscripcionesCSV ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            )}
          </button>

          <button
            onClick={handleExportMetricasCSV}
            disabled={loadingMetricasCSV}
            className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all flex items-center justify-between group"
          >
            <span className="text-sm">Métricas CSV</span>
            {loadingMetricasCSV ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            )}
          </button>
        </div>

        {/* PDF Exports */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExportInscripcionesPDF}
            disabled={loadingInscripcionesPDF}
            className="p-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all flex items-center justify-between group"
          >
            <span className="text-sm">Inscripciones PDF</span>
            {loadingInscripcionesPDF ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            )}
          </button>

          <button
            onClick={handleExportMetricasPDF}
            disabled={loadingMetricasPDF}
            className="p-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all flex items-center justify-between group"
          >
            <span className="text-sm">Métricas PDF</span>
            {loadingMetricasPDF ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportsPanel;
