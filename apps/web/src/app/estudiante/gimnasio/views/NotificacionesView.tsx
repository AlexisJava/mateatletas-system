'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gamificacionApi, type Logro, type ProximaClase } from '@/lib/api/gamificacion.api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type FilterType = 'Todas' | 'Logros' | 'Clases' | 'Equipo';

interface Notificacion {
  tipo: 'logro' | 'clase' | 'equipo';
  emoji: string;
  titulo: string;
  descripcion: string;
  tiempo: string;
  nuevo: boolean;
  fecha?: Date;
  claseId?: string;
}

interface NotificacionesViewProps {
  estudiante: {
    id: string;
    nombre: string;
    apellido: string;
  };
}

export function NotificacionesView({ estudiante }: NotificacionesViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('Todas');
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar notificaciones del estudiante
  useEffect(() => {
    const cargarNotificaciones = async () => {
      try {
        setLoading(true);

        // Cargar dashboard (incluye próximas clases) y logros en paralelo
        const [dashboard, logros] = await Promise.all([
          gamificacionApi.getDashboard(estudiante.id),
          gamificacionApi.getLogros(estudiante.id),
        ]);

        const notifs: Notificacion[] = [];

        // Logros desbloqueados recientemente (últimos 30 días)
        const logrosRecientes = logros
          .filter((logro) => logro.desbloqueado && logro.fecha_desbloqueo)
          .sort((a, b) => {
            const dateA = new Date(a.fecha_desbloqueo!);
            const dateB = new Date(b.fecha_desbloqueo!);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5); // Últimos 5 logros

        logrosRecientes.forEach((logro) => {
          const fecha = new Date(logro.fecha_desbloqueo!);
          const ahora = new Date();
          const diffDias = Math.floor((ahora.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));

          let tiempo = '';
          if (diffDias === 0) {
            const diffHoras = Math.floor((ahora.getTime() - fecha.getTime()) / (1000 * 60 * 60));
            tiempo = diffHoras < 1 ? 'Hace unos minutos' : `Hace ${diffHoras}h`;
          } else if (diffDias === 1) {
            tiempo = 'Ayer';
          } else if (diffDias < 7) {
            tiempo = `Hace ${diffDias} días`;
          } else {
            tiempo = format(fecha, 'd MMM', { locale: es });
          }

          notifs.push({
            tipo: 'logro',
            emoji: logro.icono || '🏆',
            titulo: '¡Nuevo Logro!',
            descripcion: logro.titulo,
            tiempo,
            nuevo: diffDias === 0,
            fecha,
          });
        });

        // Próximas clases (de dashboard)
        if (dashboard.proximasClases && dashboard.proximasClases.length > 0) {
          dashboard.proximasClases.forEach((clase: ProximaClase) => {
            const fechaClase = new Date(clase.fecha_hora_inicio);
            const ahora = new Date();
            const diffMs = fechaClase.getTime() - ahora.getTime();
            const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutos = Math.floor(diffMs / (1000 * 60));

            let tiempo = '';
            let nuevo = false;
            if (diffMinutos < 0) {
              return; // Clase ya pasó
            } else if (diffMinutos < 60) {
              tiempo = `En ${diffMinutos} min`;
              nuevo = true;
            } else if (diffHoras < 24) {
              tiempo = `Hoy a las ${format(fechaClase, 'HH:mm')}`;
              nuevo = diffHoras < 2;
            } else if (diffHoras < 48) {
              tiempo = `Mañana a las ${format(fechaClase, 'HH:mm')}`;
              nuevo = true;
            } else {
              tiempo = format(fechaClase, "EEE d 'de' MMM", { locale: es });
            }

            notifs.push({
              tipo: 'clase',
              emoji: '📚',
              titulo: diffHoras < 2 ? 'Clase en breve' : 'Próxima clase',
              descripcion: clase.nombre || 'Clase de matemáticas',
              tiempo,
              nuevo,
              fecha: fechaClase,
              claseId: clase.id,
            });
          });
        }

        // Notificaciones de equipo (si aplica)
        // TODO: Cuando exista endpoint de equipo/grupo, agregar notificaciones de progreso del equipo

        // Ordenar por fecha (más recientes primero)
        notifs.sort((a, b) => {
          if (!a.fecha || !b.fecha) return 0;
          return b.fecha.getTime() - a.fecha.getTime();
        });

        setNotificaciones(notifs);
      } catch (error) {
        console.error('Error al cargar notificaciones:', error);
        // Dejar el array vacío si hay error
      } finally {
        setLoading(false);
      }
    };

    if (estudiante.id) {
      cargarNotificaciones();
    }
  }, [estudiante.id]);

  // Filtrar notificaciones según filtro activo
  const notificacionesFiltradas = notificaciones.filter((notif) => {
    if (activeFilter === 'Todas') return true;
    if (activeFilter === 'Logros') return notif.tipo === 'logro';
    if (activeFilter === 'Clases') return notif.tipo === 'clase';
    if (activeFilter === 'Equipo') return notif.tipo === 'equipo';
    return true;
  });

  // Contar notificaciones nuevas
  const notificacionesNuevas = notificaciones.filter((n) => n.nuevo).length;

  return (
    <div className="pt-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🔔</span>
          <h2 className="text-2xl font-black text-white">
            Notificaciones
          </h2>
        </div>
        <p className="text-white/60 text-sm font-medium pl-12">
          {loading ? 'Cargando...' : notificacionesNuevas > 0 ? `${notificacionesNuevas} nuevas` : 'Sin notificaciones nuevas'}
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['Todas', 'Logros', 'Clases', 'Equipo'] as FilterType[]).map((filtro) => (
          <button
            key={filtro}
            onClick={() => setActiveFilter(filtro)}
            className={`
              px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap
              transition-all duration-150
              ${activeFilter === filtro
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
              }
            `}
          >
            {filtro}
          </button>
        ))}
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-white/60 text-lg font-bold">Cargando notificaciones...</div>
          </div>
        ) : notificacionesFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🔔</span>
            <p className="text-white/60 text-lg font-bold">
              {activeFilter === 'Todas' ? 'No tienes notificaciones' : `No tienes notificaciones de ${activeFilter.toLowerCase()}`}
            </p>
          </div>
        ) : (
          notificacionesFiltradas.map((notif, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`
              w-full text-left
              bg-white/5 hover:bg-white/10
              rounded-2xl p-4
              border border-white/10
              transition-all duration-150
              cursor-pointer
              ${notif.nuevo ? 'border-l-4 border-l-blue-400' : ''}
            `}
          >
            <div className="flex items-start gap-3">
              {/* Emoji */}
              <div className="text-3xl flex-shrink-0">
                {notif.emoji}
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-white font-bold text-sm">
                    {notif.titulo}
                  </h3>
                  {notif.nuevo && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                      NUEVO
                    </span>
                  )}
                </div>
                <p className="text-white/70 text-xs font-medium mb-1">
                  {notif.descripcion}
                </p>
                <p className="text-white/40 text-xs">
                  {notif.tiempo}
                </p>
              </div>
            </div>

            {/* Acción para clases */}
            {notif.tipo === 'clase' && notif.nuevo && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <button
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-bold text-xs transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Acción para unirse a la clase
                  }}
                >
                  Unirse ahora
                </button>
              </div>
            )}
          </motion.div>
          ))
        )}
      </div>

      {/* Footer - Marcar todo como leído */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <button className="w-full text-white/60 hover:text-white text-sm font-medium transition-colors">
          Marcar todo como leído
        </button>
      </div>
    </div>
  );
}
