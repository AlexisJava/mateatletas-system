import React from 'react';
import { AlertCircle, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import { Alerta } from '../../types/docente.types';

interface NotificationsDropdownProps {
  alertas: Alerta[];
  onClose: () => void;
  onViewAll: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  alertas,
  onClose,
  onViewAll,
}) => {
  return (
    <div className="absolute top-14 right-6 w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animation-fade-in-up origin-top-right">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
        <h4 className="text-sm font-bold text-white">Notificaciones</h4>
        <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded">
          {alertas.length} Nuevas
        </span>
      </div>

      <div className="max-h-[300px] overflow-y-auto no-scrollbar">
        {alertas.map((alerta) => (
          <div
            key={alerta.id}
            className="p-4 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors group cursor-pointer"
          >
            <div className="flex gap-3">
              <div
                className={`mt-0.5 shrink-0 ${alerta.severidad === 'alta' ? 'text-red-400' : 'text-amber-400'}`}
              >
                {alerta.severidad === 'alta' ? (
                  <AlertCircle size={16} />
                ) : (
                  <AlertTriangle size={16} />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200 mb-0.5">{alerta.estudiante}</p>
                <p className="text-xs text-slate-400 leading-snug line-clamp-2">{alerta.mensaje}</p>
                <p className="text-[10px] text-slate-600 mt-1 uppercase font-bold tracking-wide">
                  {alerta.tipo}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        onClick={() => {
          onViewAll();
          onClose();
        }}
        className="p-3 bg-slate-950/50 hover:bg-slate-800 text-center cursor-pointer transition-colors border-t border-slate-800 flex items-center justify-center gap-2 group"
      >
        <span className="text-xs font-bold text-indigo-400 group-hover:text-white">
          Ver Centro de Alertas
        </span>
        <ArrowRight
          size={12}
          className="text-indigo-400 group-hover:text-white group-hover:translate-x-1 transition-transform"
        />
      </div>
    </div>
  );
};
