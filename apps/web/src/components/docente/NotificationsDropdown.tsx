'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  Check,
  CheckCheck,
  Loader2,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react';
import { notificacionesApi, Notificacion } from '@/lib/api/docentes.api';

interface NotificationsDropdownProps {
  onClose: () => void;
  /** Callback cuando se actualizan las notificaciones (para refrescar badge) */
  onNotificationsUpdated?: () => void;
}

/** Mapeo de tipo de notificación a icono */
const getNotificationIcon = (tipo: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    DOCENTE_CLASE_PROXIMA: <Calendar size={16} />,
    DOCENTE_CLASE_ASIGNADA: <Calendar size={16} />,
    DOCENTE_ASISTENCIA_PENDIENTE: <Users size={16} />,
    DOCENTE_ESTUDIANTE_ALERTA: <AlertTriangle size={16} />,
    DOCENTE_CLASE_CANCELADA: <AlertCircle size={16} />,
    DOCENTE_LOGRO_ESTUDIANTE: <Trophy size={16} />,
    DOCENTE_NUEVO_ESTUDIANTE: <UserPlus size={16} />,
    DOCENTE_MATERIAL_ASIGNADO: <BookOpen size={16} />,
  };
  return iconMap[tipo] || <Bell size={16} />;
};

/** Color según prioridad */
const getPriorityColor = (prioridad: string, leida: boolean) => {
  if (leida) return 'text-slate-500';
  switch (prioridad) {
    case 'CRITICA':
    case 'ALTA':
      return 'text-red-400';
    case 'MEDIA':
      return 'text-amber-400';
    default:
      return 'text-blue-400';
  }
};

/** Formato de fecha relativa */
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
};

/** Nombre legible del tipo */
const getTipoLabel = (tipo: string): string => {
  const labels: Record<string, string> = {
    DOCENTE_CLASE_PROXIMA: 'Clase próxima',
    DOCENTE_CLASE_ASIGNADA: 'Nueva asignación',
    DOCENTE_ASISTENCIA_PENDIENTE: 'Asistencia',
    DOCENTE_ESTUDIANTE_ALERTA: 'Alerta',
    DOCENTE_CLASE_CANCELADA: 'Cancelación',
    DOCENTE_LOGRO_ESTUDIANTE: 'Logro',
    DOCENTE_NUEVO_ESTUDIANTE: 'Nuevo estudiante',
    DOCENTE_MATERIAL_ASIGNADO: 'Material',
    DOCENTE_CLASE_REPROGRAMADA: 'Reprogramación',
    DOCENTE_REPORTE_MENSUAL: 'Reporte',
  };
  return labels[tipo] || tipo.replace('DOCENTE_', '').replace(/_/g, ' ');
};

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  onClose,
  onNotificationsUpdated,
}) => {
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // Cargar últimas 5 notificaciones al abrir
  useEffect(() => {
    const fetchNotificaciones = async () => {
      try {
        setIsLoading(true);
        const response = await notificacionesApi.getAll({ limit: 5 });
        setNotificaciones(response.data);
      } catch (error) {
        console.error('Error al cargar notificaciones:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotificaciones();
  }, []);

  const handleMarcarLeida = async (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation();
    try {
      await notificacionesApi.marcarComoLeida(notifId);
      setNotificaciones((prev) => prev.map((n) => (n.id === notifId ? { ...n, leida: true } : n)));
      onNotificationsUpdated?.();
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const handleMarcarTodas = async () => {
    try {
      setIsMarkingAll(true);
      await notificacionesApi.marcarTodasComoLeidas();
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      onNotificationsUpdated?.();
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleVerTodas = () => {
    onClose();
    router.push('/docente/notificaciones');
  };

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  return (
    <div className="absolute top-14 right-6 w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
        <h4 className="text-sm font-bold text-white">Notificaciones</h4>
        <div className="flex items-center gap-2">
          {noLeidas > 0 && (
            <>
              <button
                onClick={handleMarcarTodas}
                disabled={isMarkingAll}
                className="text-[10px] font-medium text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1 disabled:opacity-50"
                title="Marcar todas como leídas"
              >
                {isMarkingAll ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <CheckCheck size={12} />
                )}
                Leer todas
              </button>
              <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded">
                {noLeidas} Nueva{noLeidas > 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto no-scrollbar">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-2 text-indigo-400 animate-spin" />
            <p className="text-sm text-slate-400">Cargando...</p>
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="p-8 text-center">
            <Check className="w-10 h-10 mx-auto mb-2 text-green-400 opacity-50" />
            <p className="text-sm text-slate-400">No hay notificaciones</p>
          </div>
        ) : (
          notificaciones.map((notif) => (
            <div
              key={notif.id}
              onClick={(e) => !notif.leida && handleMarcarLeida(e, notif.id)}
              className={`p-4 border-b border-slate-800/50 transition-colors group ${
                notif.leida ? 'bg-slate-900/30 opacity-60' : 'hover:bg-slate-800/50 cursor-pointer'
              }`}
            >
              <div className="flex gap-3">
                <div
                  className={`mt-0.5 shrink-0 ${getPriorityColor(notif.prioridad, notif.leida)}`}
                >
                  {getNotificationIcon(notif.tipo)}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-bold mb-0.5 truncate ${
                      notif.leida ? 'text-slate-400' : 'text-slate-200'
                    }`}
                  >
                    {notif.titulo}
                  </p>
                  <p
                    className={`text-xs leading-snug line-clamp-2 ${
                      notif.leida ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {notif.mensaje}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] text-slate-600 uppercase font-bold tracking-wide">
                      {getTipoLabel(notif.tipo)}
                    </p>
                    <span className="text-[10px] text-slate-600">•</span>
                    <span className="text-[10px] text-slate-500">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                    {notif.leida && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-0.5 ml-auto">
                        <Check size={10} />
                        Leída
                      </span>
                    )}
                  </div>
                </div>
                {!notif.leida && (
                  <button
                    onClick={(e) => handleMarcarLeida(e, notif.id)}
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
        onClick={handleVerTodas}
        className="p-3 bg-slate-950/50 hover:bg-slate-800 text-center cursor-pointer transition-colors border-t border-slate-800 flex items-center justify-center gap-2 group"
      >
        <span className="text-xs font-bold text-indigo-400 group-hover:text-white">
          Ver todas las notificaciones
        </span>
        <ArrowRight
          size={12}
          className="text-indigo-400 group-hover:text-white group-hover:translate-x-1 transition-transform"
        />
      </div>
    </div>
  );
};
