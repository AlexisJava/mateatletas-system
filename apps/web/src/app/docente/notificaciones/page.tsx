'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Bell,
  BookOpen,
  Calendar,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Search,
  Trophy,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  notificacionesApi,
  Notificacion,
  NotificacionesParams,
  TipoNotificacionDocente,
} from '@/lib/api/docentes.api';

// Tipos de notificación para el filtro
const TIPOS_NOTIFICACION: { value: TipoNotificacionDocente; label: string }[] = [
  { value: 'DOCENTE_CLASE_PROXIMA', label: 'Clase próxima' },
  { value: 'DOCENTE_CLASE_ASIGNADA', label: 'Nueva asignación' },
  { value: 'DOCENTE_ASISTENCIA_PENDIENTE', label: 'Asistencia pendiente' },
  { value: 'DOCENTE_ESTUDIANTE_ALERTA', label: 'Alerta de estudiante' },
  { value: 'DOCENTE_CLASE_CANCELADA', label: 'Clase cancelada' },
  { value: 'DOCENTE_LOGRO_ESTUDIANTE', label: 'Logro de estudiante' },
  { value: 'DOCENTE_NUEVO_ESTUDIANTE', label: 'Nuevo estudiante' },
  { value: 'DOCENTE_CLASE_REPROGRAMADA', label: 'Clase reprogramada' },
  { value: 'DOCENTE_REPORTE_MENSUAL', label: 'Reporte mensual' },
];

/** Mapeo de tipo de notificación a icono */
const getNotificationIcon = (tipo: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    DOCENTE_CLASE_PROXIMA: <Calendar size={20} />,
    DOCENTE_CLASE_ASIGNADA: <Calendar size={20} />,
    DOCENTE_ASISTENCIA_PENDIENTE: <Users size={20} />,
    DOCENTE_ESTUDIANTE_ALERTA: <AlertTriangle size={20} />,
    DOCENTE_CLASE_CANCELADA: <AlertCircle size={20} />,
    DOCENTE_LOGRO_ESTUDIANTE: <Trophy size={20} />,
    DOCENTE_NUEVO_ESTUDIANTE: <UserPlus size={20} />,
    DOCENTE_MATERIAL_ASIGNADO: <BookOpen size={20} />,
  };
  return iconMap[tipo] || <Bell size={20} />;
};

/** Color según prioridad */
const getPriorityStyles = (prioridad: string, leida: boolean) => {
  if (leida)
    return { bg: 'bg-slate-900/30', icon: 'text-slate-500', border: 'border-slate-800/30' };
  switch (prioridad) {
    case 'CRITICA':
      return { bg: 'bg-red-500/10', icon: 'text-red-400', border: 'border-red-500/20' };
    case 'ALTA':
      return { bg: 'bg-amber-500/10', icon: 'text-amber-400', border: 'border-amber-500/20' };
    case 'MEDIA':
      return { bg: 'bg-blue-500/10', icon: 'text-blue-400', border: 'border-blue-500/20' };
    default:
      return { bg: 'bg-slate-800/50', icon: 'text-slate-400', border: 'border-slate-700/50' };
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
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** Nombre legible del tipo */
const getTipoLabel = (tipo: string): string => {
  const found = TIPOS_NOTIFICACION.find((t) => t.value === tipo);
  if (found) return found.label;
  return tipo.replace('DOCENTE_', '').replace(/_/g, ' ');
};

type FilterEstado = 'todas' | 'no_leidas' | 'leidas';

export default function NotificacionesPage() {
  const router = useRouter();

  // Estado
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // Paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<FilterEstado>('todas');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');
  const [busquedaInput, setBusquedaInput] = useState('');

  // Fetch notificaciones
  const fetchNotificaciones = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: NotificacionesParams = {
        page,
        limit: 20,
      };

      if (filtroEstado === 'no_leidas') {
        params.soloNoLeidas = true;
      }
      if (filtroTipo) {
        params.tipo = filtroTipo;
      }
      if (busqueda) {
        params.busqueda = busqueda;
      }

      const response = await notificacionesApi.getAll(params);
      setNotificaciones(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, filtroEstado, filtroTipo, busqueda]);

  useEffect(() => {
    fetchNotificaciones();
  }, [fetchNotificaciones]);

  // Handlers
  const handleMarcarLeida = async (notifId: string) => {
    try {
      await notificacionesApi.marcarComoLeida(notifId);
      setNotificaciones((prev) => prev.map((n) => (n.id === notifId ? { ...n, leida: true } : n)));
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const handleMarcarTodas = async () => {
    try {
      setIsMarkingAll(true);
      await notificacionesApi.marcarTodasComoLeidas();
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    setBusqueda(busquedaInput);
    setPage(1);
  };

  const handleLimpiarFiltros = () => {
    setFiltroEstado('todas');
    setFiltroTipo('');
    setBusqueda('');
    setBusquedaInput('');
    setPage(1);
  };

  const hayFiltrosActivos = filtroEstado !== 'todas' || filtroTipo !== '' || busqueda !== '';
  const hayNoLeidas = notificaciones.some((n) => !n.leida);

  // Filtrar leídas localmente si el filtro es 'leidas' (backend no tiene este filtro)
  const notificacionesFiltradas =
    filtroEstado === 'leidas' ? notificaciones.filter((n) => n.leida) : notificaciones;

  return (
    <div className="h-full w-full text-slate-200 font-sans overflow-hidden flex flex-col">
      {/* Header */}
      <header className="shrink-0 bg-slate-900/50 border-b border-slate-800/50 px-6 py-4 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/docente/dashboard')}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Notificaciones</h1>
              <p className="text-sm text-slate-400">
                {total} notificacion{total !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>

          {hayNoLeidas && (
            <button
              onClick={handleMarcarTodas}
              disabled={isMarkingAll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isMarkingAll ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCheck size={16} />
              )}
              Marcar todas como leídas
            </button>
          )}
        </div>
      </header>

      {/* Filtros */}
      <div className="shrink-0 bg-slate-950/50 border-b border-slate-800/50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-4">
          {/* Búsqueda */}
          <form onSubmit={handleBuscar} className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                value={busquedaInput}
                onChange={(e) => setBusquedaInput(e.target.value)}
                placeholder="Buscar en título o mensaje..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Filtro Estado */}
          <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1 border border-slate-700">
            {(['todas', 'no_leidas', 'leidas'] as FilterEstado[]).map((estado) => (
              <button
                key={estado}
                onClick={() => {
                  setFiltroEstado(estado);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filtroEstado === estado
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {estado === 'todas' ? 'Todas' : estado === 'no_leidas' ? 'No leídas' : 'Leídas'}
              </button>
            ))}
          </div>

          {/* Filtro Tipo */}
          <div className="relative">
            <Filter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
            <select
              value={filtroTipo}
              onChange={(e) => {
                setFiltroTipo(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-8 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="">Todos los tipos</option>
              {TIPOS_NOTIFICACION.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Limpiar filtros */}
          {hayFiltrosActivos && (
            <button
              onClick={handleLimpiarFiltros}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors"
            >
              <X size={14} />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Lista de notificaciones */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          ) : notificacionesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Bell className="w-16 h-16 text-slate-700 mb-4" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">No hay notificaciones</h3>
              <p className="text-sm text-slate-500">
                {hayFiltrosActivos
                  ? 'No se encontraron notificaciones con los filtros aplicados'
                  : 'No tenés notificaciones por el momento'}
              </p>
            </div>
          ) : (
            notificacionesFiltradas.map((notif) => {
              const styles = getPriorityStyles(notif.prioridad, notif.leida);
              return (
                <div
                  key={notif.id}
                  className={`relative p-4 rounded-xl border transition-all ${styles.bg} ${styles.border} ${
                    !notif.leida ? 'hover:border-indigo-500/50' : ''
                  }`}
                >
                  {/* Indicador de no leída */}
                  {!notif.leida && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />
                  )}

                  <div className="flex gap-4">
                    {/* Icono */}
                    <div className={`shrink-0 mt-0.5 ${styles.icon}`}>
                      {getNotificationIcon(notif.tipo)}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3
                            className={`font-semibold mb-1 ${
                              notif.leida ? 'text-slate-400' : 'text-white'
                            }`}
                          >
                            {notif.titulo}
                          </h3>
                          <p
                            className={`text-sm leading-relaxed ${
                              notif.leida ? 'text-slate-500' : 'text-slate-300'
                            }`}
                          >
                            {notif.mensaje}
                          </p>
                        </div>

                        {/* Botón marcar como leída */}
                        {!notif.leida && (
                          <button
                            onClick={() => handleMarcarLeida(notif.id)}
                            className="shrink-0 p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-green-400 transition-colors"
                            title="Marcar como leída"
                          >
                            <Check size={18} />
                          </button>
                        )}
                      </div>

                      {/* Meta info */}
                      <div className="flex items-center gap-3 mt-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                            notif.leida
                              ? 'bg-slate-800 text-slate-500'
                              : 'bg-slate-800/80 text-slate-300'
                          }`}
                        >
                          {getTipoLabel(notif.tipo)}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                        {notif.leida && (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Check size={12} />
                            Leída
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Paginación */}
      {totalPages > 1 && (
        <footer className="shrink-0 bg-slate-950/50 border-t border-slate-800/50 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Página {page} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
                Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
