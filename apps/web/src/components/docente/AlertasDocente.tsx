import React from 'react';
import { AlertCircle, AlertTriangle, ChevronRight, Eye } from 'lucide-react';
import { Alerta } from '../../types/docente.types';

interface AlertasDocenteProps {
  alertas: Alerta[];
}

export const AlertasDocente: React.FC<AlertasDocenteProps> = ({ alertas }) => {
  if (alertas.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide px-1">
        Alertas Pendientes
      </h3>
      <div className="space-y-3">
        {alertas.map((alerta) => (
          <div
            key={alerta.id}
            className={`relative overflow-hidden rounded-2xl p-4 border transition-all cursor-pointer group ${
              alerta.severidad === 'alta'
                ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                : 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10'
            }`}
          >
            <div className="flex items-start gap-3 relative z-10">
              <div
                className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                  alerta.severidad === 'alta'
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-amber-500/10 text-amber-400'
                }`}
              >
                {alerta.severidad === 'alta' ? (
                  <AlertCircle size={18} />
                ) : (
                  <AlertTriangle size={18} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4
                  className={`text-sm font-bold mb-0.5 ${
                    alerta.severidad === 'alta' ? 'text-red-200' : 'text-amber-200'
                  }`}
                >
                  {alerta.estudiante}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {alerta.mensaje}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] font-mono opacity-50 uppercase bg-slate-950/30 px-1.5 py-0.5 rounded">
                    {alerta.tipo}
                  </span>
                </div>
              </div>

              <div className="self-center">
                <div className="p-2 rounded-full bg-slate-900/50 text-slate-500 group-hover:text-white group-hover:bg-slate-900 transition-colors">
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
