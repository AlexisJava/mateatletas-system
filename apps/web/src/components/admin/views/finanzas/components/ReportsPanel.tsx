'use client';

import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
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
 */

export function ReportsPanel() {
  const [loadingInscripcionesCSV, setLoadingInscripcionesCSV] = useState(false);
  const [loadingMetricasCSV, setLoadingMetricasCSV] = useState(false);
  const [loadingInscripcionesPDF, setLoadingInscripcionesPDF] = useState(false);
  const [loadingMetricasPDF, setLoadingMetricasPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExportInscripcionesCSV = async () => {
    setLoadingInscripcionesCSV(true);
    setError(null);
    try {
      const response = await exportInscripcionesCSV();
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
      const response = await exportInscripcionesPDF();
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

  return (
    <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
      <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4 flex items-center gap-2">
        <Download className="w-5 h-5 text-[var(--status-success)]" />
        Reportes y Exportacion
      </h3>

      {error && (
        <div className="mb-3 p-2 rounded-lg bg-red-500/10 text-red-400 text-sm">{error}</div>
      )}

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
            <span className="text-sm">Metricas CSV</span>
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
            <span className="text-sm">Metricas PDF</span>
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
