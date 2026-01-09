'use client';

import { useState, useEffect } from 'react';
import { estudiantesApi, type FeedItem, type FeedResponse } from '@/lib/api/estudiantes.api';
import { useAuthStore } from '@/store/auth.store';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Trophy,
  Zap,
  BookOpen,
  CheckCircle,
  Star,
  Clock,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { ModalFelicitacion } from './ModalFelicitacion';

const EMOJIS_PERMITIDOS = ['👏', '🔥', '💪', '🚀'];

const TIPO_CONFIG: Record<
  string,
  { icon: React.ReactNode; color: string; bgColor: string; label: string }
> = {
  LECCION_COMPLETADA: {
    icon: <BookOpen className="w-4 h-4" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    label: 'Lección',
  },
  CLASE_COMPLETADA: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    label: 'Clase',
  },
  TAREA_COMPLETADA: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    label: 'Tarea',
  },
  TAREA_PERFECTA: {
    icon: <Star className="w-4 h-4" />,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    label: 'Perfecta',
  },
  PLANIFICACION_COMPLETADA: {
    icon: <Trophy className="w-4 h-4" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    label: 'Planificación',
  },
  LOGRO_DESBLOQUEADO: {
    icon: <Trophy className="w-4 h-4" />,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    label: 'Logro',
  },
  NIVEL_SUBIDO: {
    icon: <Zap className="w-4 h-4" />,
    color: 'text-fuchsia-400',
    bgColor: 'bg-fuchsia-500/20',
    label: 'Nivel',
  },
  RACHA_EXTENDIDA: {
    icon: <Clock className="w-4 h-4" />,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    label: 'Racha',
  },
};

interface ActivityFeedProps {
  mode?: 'casa' | 'personal' | 'general' | 'comision';
  limit?: number;
  showTitle?: boolean;
  compact?: boolean;
}

export function ActivityFeed({
  mode = 'casa',
  limit = 10,
  showTitle = true,
  compact = false,
}: ActivityFeedProps) {
  const { user } = useAuthStore();
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actividadSeleccionada, setActividadSeleccionada] = useState<FeedItem | null>(null);

  useEffect(() => {
    loadFeed();
  }, [mode, limit]);

  const loadFeed = async () => {
    try {
      setIsLoading(true);
      let response: FeedResponse;

      switch (mode) {
        case 'casa':
          response = await estudiantesApi.getFeedMiCasa(limit);
          break;
        case 'personal':
          response = await estudiantesApi.getMisActividades(limit);
          break;
        case 'comision':
          response = await estudiantesApi.getFeedMiComision(limit);
          break;
        default:
          response = await estudiantesApi.getFeed({ limit });
      }

      setFeed(response.data);
      setHasMore(response.meta.hasMore);
      setPage(1);
    } catch (error) {
      console.error('Error cargando feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await estudiantesApi.getFeed({ limit, page: nextPage });

      setFeed((prev) => [...prev, ...response.data]);
      setHasMore(response.meta.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error('Error cargando más:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  /**
   * Aplica optimistic update a una actividad específica
   * Actualiza tanto el feed como la actividad seleccionada si está abierta
   */
  const applyOptimisticUpdate = (actividadId: string, emoji: string) => {
    const updateItem = (item: FeedItem): FeedItem => {
      if (item.id !== actividadId) return item;

      const existingReaction = item.reacciones.find((r) => r.emoji === emoji);
      const userHasReacted = existingReaction?.estudiantesIds.includes(user?.id || '');

      if (userHasReacted) {
        // Remove reaction
        return {
          ...item,
          reacciones: item.reacciones
            .map((r) =>
              r.emoji === emoji
                ? {
                    ...r,
                    count: r.count - 1,
                    estudiantesIds: r.estudiantesIds.filter((id) => id !== user?.id),
                  }
                : r,
            )
            .filter((r) => r.count > 0),
          totalReacciones: item.totalReacciones - 1,
        };
      } else {
        // Add reaction
        const updated = existingReaction
          ? item.reacciones.map((r) =>
              r.emoji === emoji
                ? {
                    ...r,
                    count: r.count + 1,
                    estudiantesIds: [...r.estudiantesIds, user?.id || ''],
                  }
                : r,
            )
          : [...item.reacciones, { emoji, count: 1, estudiantesIds: [user?.id || ''] }];

        return {
          ...item,
          reacciones: updated,
          totalReacciones: item.totalReacciones + 1,
        };
      }
    };

    // Update feed
    setFeed((prev) => prev.map(updateItem));

    // Update selected activity if it's the same
    if (actividadSeleccionada?.id === actividadId) {
      setActividadSeleccionada(updateItem(actividadSeleccionada));
    }
  };

  const handleReaction = async (actividadId: string, emoji: string) => {
    if (!user?.id) return;

    // Capturar estado antes del optimistic update para determinar acción
    const targetItem = feed.find((item) => item.id === actividadId);
    const existingReaction = targetItem?.reacciones.find((r) => r.emoji === emoji);
    const userHasReacted = existingReaction?.estudiantesIds.includes(user.id);

    // Optimistic update
    applyOptimisticUpdate(actividadId, emoji);

    // API call
    try {
      if (userHasReacted) {
        await estudiantesApi.removeReaction(actividadId, emoji);
      } else {
        await estudiantesApi.addReaction(actividadId, emoji);
      }
    } catch (error) {
      console.error('Error con reacción:', error);
      // Revert on error
      loadFeed();
      setActividadSeleccionada(null);
    }
  };

  const handleOpenModal = (item: FeedItem) => {
    setActividadSeleccionada(item);
  };

  const handleCloseModal = () => {
    setActividadSeleccionada(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
      </div>
    );
  }

  if (feed.length === 0) {
    const emptyMessage =
      mode === 'comision'
        ? 'Aún no hay actividad de tu equipo. ¡Completa tareas para aparecer aquí!'
        : mode === 'personal'
          ? 'Aún no tienes actividades registradas'
          : 'No hay actividad reciente';

    return (
      <div className="text-center py-8">
        <p className="text-white/50 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showTitle && (
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          {mode === 'casa'
            ? 'Actividad de tu Casa'
            : mode === 'personal'
              ? 'Tu Actividad'
              : mode === 'comision'
                ? 'Actividad de tu Equipo'
                : 'Feed'}
        </h3>
      )}

      <div className="space-y-2">
        {feed.map((item) => (
          <FeedItemCard
            key={item.id}
            item={item}
            compact={compact}
            currentUserId={user?.id}
            onReaction={handleReaction}
            onOpenModal={handleOpenModal}
          />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          {loadingMore ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Ver más
            </>
          )}
        </button>
      )}

      {/* Modal de Felicitación */}
      <ModalFelicitacion
        actividad={actividadSeleccionada}
        isOpen={!!actividadSeleccionada}
        onClose={handleCloseModal}
        onReaction={handleReaction}
      />
    </div>
  );
}

interface FeedItemCardProps {
  item: FeedItem;
  compact?: boolean;
  currentUserId?: string;
  onReaction: (actividadId: string, emoji: string) => void;
  onOpenModal: (item: FeedItem) => void;
}

const DEFAULT_CONFIG = {
  icon: <Star className="w-4 h-4" />,
  color: 'text-gray-400',
  bgColor: 'bg-gray-500/20',
  label: 'Actividad',
};

function FeedItemCard({
  item,
  compact,
  currentUserId,
  onReaction,
  onOpenModal,
}: FeedItemCardProps) {
  const config = TIPO_CONFIG[item.tipo] ?? DEFAULT_CONFIG;
  const timeAgo = formatDistanceToNow(new Date(item.creadoEn), { addSuffix: true, locale: es });

  return (
    <div
      className={`rounded-xl bg-white/5 border border-white/10 ${compact ? 'p-3' : 'p-4'} transition-colors hover:bg-white/8 cursor-pointer group`}
      onClick={() => onOpenModal(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenModal(item);
        }
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl flex items-center justify-center text-white font-bold shrink-0 transition-transform group-hover:scale-105`}
          style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
          }}
        >
          {item.estudiante.nombre.charAt(0).toUpperCase()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-sm">
              {item.estudiante.nombre} {item.estudiante.apellido}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${config.bgColor} ${config.color}`}
            >
              {config.icon}
              {config.label}
            </span>
          </div>

          <p className="text-white/70 text-sm mt-0.5">{item.mensaje}</p>

          {/* XP Badge */}
          {item.xpGanado > 0 && (
            <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-lg bg-yellow-500/20 text-yellow-400 text-xs font-bold">
              <Zap className="w-3 h-3" />+{item.xpGanado} XP
            </div>
          )}

          {/* Time */}
          <p className="text-white/40 text-xs mt-1">{timeAgo}</p>
        </div>
      </div>

      {/* Reactions summary - muestra solo los que tienen reacciones */}
      {item.totalReacciones > 0 && (
        <div className="flex items-center gap-1 mt-3" onClick={(e) => e.stopPropagation()}>
          {EMOJIS_PERMITIDOS.map((emoji) => {
            const reaction = item.reacciones.find((r) => r.emoji === emoji);
            const count = reaction?.count || 0;
            const hasReacted = reaction?.estudiantesIds.includes(currentUserId || '');

            if (count === 0) return null;

            return (
              <button
                key={emoji}
                onClick={(e) => {
                  e.stopPropagation();
                  onReaction(item.id, emoji);
                }}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm transition-all ${
                  hasReacted
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400/30'
                    : 'bg-white/5 hover:bg-white/10 border-white/10'
                } border`}
              >
                <span>{emoji}</span>
                <span className="text-white/70 text-xs font-medium">{count}</span>
              </button>
            );
          })}
          <span className="text-white/30 text-xs ml-1">Toca para felicitar</span>
        </div>
      )}

      {/* Si no hay reacciones, mostrar hint */}
      {item.totalReacciones === 0 && (
        <div className="mt-3 text-white/30 text-xs">Toca para felicitar</div>
      )}
    </div>
  );
}

export default ActivityFeed;
