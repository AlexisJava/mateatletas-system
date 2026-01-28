'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  tutoresApi,
  type NotificacionTutor,
  type NotificacionesTutorResponse,
} from '@/lib/api/tutores.api';
import { getErrorMessage } from '@/lib/utils/error-handler';
import {
  Bell,
  CheckCircle,
  Trash2,
  RefreshCw,
  ArrowLeft,
  AlertTriangle,
  Info,
  AlertCircle,
  Loader2,
  CheckCheck,
} from 'lucide-react';

export default function TutorNotificacionesPage(): React.ReactNode {
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState<NotificacionTutor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotificaciones = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await tutoresApi.getNotificaciones({
        soloNoLeidas,
        page,
        limit: 20,
      });
      setNotificaciones(response.data);
      setTotal(response.total);
      setHasMore(response.hasMore);
    } catch (err) {
      setError(getErrorMessage(err, 'Error al cargar notificaciones'));
    } finally {
      setIsLoading(false);
    }
  }, [soloNoLeidas, page]);

  useEffect(() => {
    loadNotificaciones();
  }, [loadNotificaciones]);

  const handleMarcarLeida = async (id: string) => {
    if (loadingIds.has(id)) return;
    try {
      setLoadingIds((prev) => new Set(prev).add(id));
      await tutoresApi.marcarNotificacionLeida(id);
      setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    } catch (err) {
      alert(getErrorMessage(err, 'Error al marcar como leída'));
    } finally {
      setLoadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      setIsLoading(true);
      await tutoresApi.marcarTodasNotificacionesLeidas();
      await loadNotificaciones();
    } catch (err) {
      alert(getErrorMessage(err, 'Error al marcar todas como leídas'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminar = async (id: string) => {
    if (loadingIds.has(id)) return;
    if (!confirm('¿Eliminar esta notificación?')) return;
    try {
      setLoadingIds((prev) => new Set(prev).add(id));
      await tutoresApi.eliminarNotificacion(id);
      setNotificaciones((prev) => prev.filter((n) => n.id !== id));
      setTotal((prev) => prev - 1);
    } catch (err) {
      alert(getErrorMessage(err, 'Error al eliminar notificación'));
    } finally {
      setLoadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const getPrioridadIcon = (prioridad: string) => {
    switch (prioridad) {
      case 'CRITICA':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'ALTA':
        return <AlertCircle className="w-5 h-5 text-orange-400" />;
      case 'MEDIA':
        return <Info className="w-5 h-5 text-yellow-400" />;
      default:
        return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'CRITICA':
        return 'border-red-500/30 bg-red-500/10';
      case 'ALTA':
        return 'border-orange-500/30 bg-orange-500/10';
      case 'MEDIA':
        return 'border-yellow-500/30 bg-yellow-500/10';
      default:
        return 'border-blue-500/30 bg-blue-500/10';
    }
  };

  const noLeidasCount = notificaciones.filter((n) => !n.leida).length;

  if (isLoading && notificaciones.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadNotificaciones}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/tutor/dashboard')}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Notificaciones</h1>
          <p className="text-gray-400 mt-1">
            {total} notificación{total !== 1 ? 'es' : ''} • {noLeidasCount} sin leer
          </p>
        </div>
        <div className="flex items-center gap-2">
          {noLeidasCount > 0 && (
            <button
              onClick={handleMarcarTodasLeidas}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-green-400 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas
            </button>
          )}
          <button
            onClick={loadNotificaciones}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <button
          onClick={() => {
            setSoloNoLeidas(!soloNoLeidas);
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg transition-colors ${
            soloNoLeidas ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Solo no leídas
        </button>
      </div>

      {/* Notifications List */}
      {notificaciones.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Sin notificaciones</h3>
          <p className="text-gray-400">
            {soloNoLeidas ? 'No tienes notificaciones sin leer.' : 'No tienes notificaciones.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notificaciones.map((notif) => {
            const isProcessing = loadingIds.has(notif.id);
            return (
              <div
                key={notif.id}
                className={`bg-white/5 backdrop-blur-xl border rounded-xl p-4 transition-all ${
                  notif.leida ? 'border-white/10 opacity-70' : getPrioridadColor(notif.prioridad)
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/5 rounded-lg shrink-0">
                    {getPrioridadIcon(notif.prioridad)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3
                          className={`font-medium ${notif.leida ? 'text-gray-400' : 'text-white'}`}
                        >
                          {notif.titulo}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">{notif.mensaje}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notif.fechaCreacion).toLocaleDateString('es-AR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!notif.leida && (
                          <button
                            onClick={() => handleMarcarLeida(notif.id)}
                            disabled={isProcessing}
                            className="p-2 bg-white/5 hover:bg-green-500/20 rounded-lg transition-colors"
                            title="Marcar como leída"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleEliminar(notif.id)}
                          disabled={isProcessing}
                          className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-red-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {(hasMore || page > 1) && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-gray-400">Página {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore || isLoading}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
