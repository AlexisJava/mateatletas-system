'use client';

import { Download } from 'lucide-react';

/**
 * ReportsPanel - Panel de reportes y exportación
 *
 * Botones para exportar datos en diferentes formatos.
 */

export function ReportsPanel() {
  return (
    <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
      <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4 flex items-center gap-2">
        <Download className="w-5 h-5 text-[var(--status-success)]" />
        Reportes y Exportacion
      </h3>
      <div className="space-y-3">
        <button className="w-full p-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-xl text-white font-semibold transition-all flex items-center justify-between group">
          <span>Exportar Inscripciones (CSV)</span>
          <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
        </button>
        <button className="w-full p-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl text-white font-semibold transition-all flex items-center justify-between group">
          <span>Exportar Metricas (Excel)</span>
          <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

export default ReportsPanel;
