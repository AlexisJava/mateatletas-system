'use client';

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, AlertTriangle, ArrowRight, Check, CheckCheck, Loader2 } from 'lucide-react';
import { Alerta } from '../../types/docente.types';
import { notificacionesApi } from '@/lib/api/docentes.api';

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
  const queryClient = useQueryClient();

  // Mutación para marcar una alerta como leída
  const marcarLeidaMutation = useMutation({
    mutationFn: (id: string) => notificacionesApi.marcarComoLeida(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardDocente'] });
    },
  });

  // Mutación para marcar todas como leídas
  const marcarTodasMutation = useMutation({
    mutationFn: () => notificacionesApi.marcarTodasComoLeidas(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardDocente'] });
    },
  });

  const handleMarcarLeida = (e: React.MouseEvent, alertaId: string) => {
    e.stopPropagation();
    marcarLeidaMutation.mutate(alertaId);
  };

  const handleMarcarTodas = () => {
    marcarTodasMutation.mutate();
  };

  return (
    <div className="absolute top-14 right-6 w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animation-fade-in-up origin-top-right">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
        <h4 className="text-sm font-bold text-white">Notificaciones</h4>
        <div className="flex items-center gap-2">
          {alertas.length > 0 && (
            <>
              <button
                onClick={handleMarcarTodas}
                disabled={marcarTodasMutation.isPending}
                className="text-[10px] font-medium text-slate-400 hover:text-indigo-400 transition-colors disabled:opacity-50 flex items-center gap-1"
                title="Marcar todas como leídas"
              >
                {marcarTodasMutation.isPending ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <CheckCheck size={12} />
                )}
                Leer todas
              </button>
              <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded">
                {alertas.length} Nuevas
              </span>
            </>
          )}
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto no-scrollbar">
        {alertas.length === 0 ? (
          <div className="p-8 text-center">
            <Check className="w-10 h-10 mx-auto mb-2 text-green-400 opacity-50" />
            <p className="text-sm text-slate-400">No hay notificaciones nuevas</p>
          </div>
        ) : (
          alertas.map((alerta) => (
            <div
              key={alerta.id}
              onClick={(e) => handleMarcarLeida(e, alerta.id)}
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
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-200 mb-0.5">{alerta.estudiante}</p>
                  <p className="text-xs text-slate-400 leading-snug line-clamp-2">
                    {alerta.mensaje}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-1 uppercase font-bold tracking-wide">
                    {alerta.tipo}
                  </p>
                </div>
                <button
                  onClick={(e) => handleMarcarLeida(e, alerta.id)}
                  disabled={marcarLeidaMutation.isPending}
                  className="shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-700 transition-all"
                  title="Marcar como leída"
                >
                  {marcarLeidaMutation.isPending ? (
                    <Loader2 size={14} className="text-slate-400 animate-spin" />
                  ) : (
                    <Check size={14} className="text-green-400" />
                  )}
                </button>
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
