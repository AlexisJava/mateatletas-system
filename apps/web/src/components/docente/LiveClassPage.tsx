'use client';

import React from 'react';
import { LiveClassPage as LiveClassPageReal, LiveClassConfig } from './live';
import { AlertCircle, Settings } from 'lucide-react';

/**
 * LiveClassPage - Wrapper para la página de clase en vivo
 *
 * Por ahora usa una config de demo. En producción debe recibir
 * la comisión o claseGrupo seleccionada.
 */

interface LiveClassPageWrapperProps {
  comisionId?: string;
  claseGrupoId?: string;
}

export const LiveClassPage: React.FC<LiveClassPageWrapperProps> = ({
  comisionId,
  claseGrupoId,
}) => {
  // Si no hay comisionId ni claseGrupoId, mostrar mensaje de configuración
  if (!comisionId && !claseGrupoId) {
    return (
      <div className="flex flex-col h-full bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Settings size={32} className="text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Configuración Requerida</h2>
          <p className="text-slate-400 mb-6">
            Para iniciar una clase en vivo, primero selecciona una comisión o clase desde el
            dashboard.
          </p>
          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-left">
            <h3 className="text-sm font-bold text-slate-300 mb-2">Pasos:</h3>
            <ol className="text-sm text-slate-400 space-y-2">
              <li>1. Ve a "Mis Comisiones" en el menú</li>
              <li>2. Selecciona la comisión para la clase</li>
              <li>3. Presiona "Iniciar Clase en Vivo"</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  const config: LiveClassConfig = {
    comisionId,
    claseGrupoId,
    title: 'Clase en Vivo',
    subtitle: comisionId ? `Comisión ${comisionId}` : `Clase ${claseGrupoId}`,
  };

  return <LiveClassPageReal config={config} />;
};
