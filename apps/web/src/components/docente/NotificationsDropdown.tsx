'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, ArrowRight, Check, CheckCheck } from 'lucide-react';
import { Alerta } from '../../types/docente.types';

interface NotificationsDropdownProps {
  alertas: Alerta[];
  onClose: () => void;
  onViewAll: () => void;
  /** Callback para marcar una alerta como leída */
  onMarkAsRead?: (id: string) => void;
  /** Callback para marcar todas las alertas como leídas */
  onMarkAllAsRead?: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  alertas,
  onClose,
  onViewAll,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const handleMarcarLeida = (e: React.MouseEvent, alertaId: string) => {
    e.stopPropagation();
    onMarkAsRead?.(alertaId);
  };

  const handleMarcarTodas = () => {
    onMarkAllAsRead?.();
  };

  // Contar alertas no leídas
  const noLeidas = alertas.filter((a) => !a.leida).length;

  return (
    <div className="absolute top-14 right-6 w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
        <h4 className="text-sm font-bold text-white">Notificaciones</h4>
        <div className="flex items-center gap-2">
          {noLeidas > 0 && (
            <>
              <button
                onClick={handleMarcarTodas}
                className="text-[10px] font-medium text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1"
                title="Marcar todas como leídas"
              >
                <CheckCheck size={12} />
                Leer todas
              </button>
              <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded">
                {noLeidas} Nuevas
              </span>
            </>
          )}
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto no-scrollbar">
        {alertas.length === 0 ? (
          <div className="p-8 text-center">
            <Check className="w-10 h-10 mx-auto mb-2 text-green-400 opacity-50" />
            <p className="text-sm text-slate-400">No hay notificaciones</p>
          </div>
        ) : (
          alertas.map((alerta) => (
            <div
              key={alerta.id}
              onClick={(e) => !alerta.leida && handleMarcarLeida(e, alerta.id)}
              className={`p-4 border-b border-slate-800/50 transition-colors group ${
                alerta.leida ? 'bg-slate-900/30 opacity-60' : 'hover:bg-slate-800/50 cursor-pointer'
              }`}
            >
              <div className="flex gap-3">
                <div
                  className={`mt-0.5 shrink-0 ${
                    alerta.leida
                      ? 'text-slate-500'
                      : alerta.severidad === 'alta'
                        ? 'text-red-400'
                        : 'text-amber-400'
                  }`}
                >
                  {alerta.severidad === 'alta' ? (
                    <AlertCircle size={16} />
                  ) : (
                    <AlertTriangle size={16} />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-xs font-bold mb-0.5 ${alerta.leida ? 'text-slate-400' : 'text-slate-200'}`}
                  >
                    {alerta.estudiante}
                  </p>
                  <p
                    className={`text-xs leading-snug line-clamp-2 ${alerta.leida ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    {alerta.mensaje}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] text-slate-600 uppercase font-bold tracking-wide">
                      {alerta.tipo}
                    </p>
                    {alerta.leida && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                        <Check size={10} />
                        Leída
                      </span>
                    )}
                  </div>
                </div>
                {!alerta.leida && (
                  <button
                    onClick={(e) => handleMarcarLeida(e, alerta.id)}
                    className="shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-700 transition-all"
                    title="Marcar como leída"
                  >
                    <Check size={14} className="text-green-400" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
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
