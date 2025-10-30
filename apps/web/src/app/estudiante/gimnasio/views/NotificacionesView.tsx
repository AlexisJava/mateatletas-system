'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

type FilterType = 'Todas' | 'Logros' | 'Clases' | 'Equipo';

export function NotificacionesView() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('Todas');

  const notificaciones = [
    {
      tipo: 'logro',
      emoji: '🏆',
      titulo: '¡Nuevo Logro!',
      descripcion: 'Maestro de las Tablas',
      tiempo: 'Hace 2h',
      nuevo: true
    },
    {
      tipo: 'clase',
      emoji: '📚',
      titulo: 'Clase en 30 min',
      descripcion: 'Álgebra - Profe Juan',
      tiempo: 'Hoy',
      nuevo: true
    },
    {
      tipo: 'equipo',
      emoji: '🔥',
      titulo: 'Equipo Fénix',
      descripcion: '73/100 ejercicios',
      tiempo: 'Hace 1h',
      nuevo: true
    },
    {
      tipo: 'logro',
      emoji: '⭐',
      titulo: 'Racha de 5 días',
      descripcion: '¡Sigue así!',
      tiempo: 'Ayer',
      nuevo: false
    },
    {
      tipo: 'clase',
      emoji: '📝',
      titulo: 'Tarea completada',
      descripcion: 'Geometría - Nivel 3',
      tiempo: 'Ayer',
      nuevo: false
    },
  ];

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
          3 nuevas
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
        {notificaciones.map((notif, i) => (
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
        ))}
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
