'use client';

import { motion } from 'framer-motion';

export function NotificacionesView() {
  return (
    <div className="min-h-full p-8 space-y-8">

      {/* HERO */}
      <div className="text-center">
        <motion.div
          animate={{
            rotate: [0, -10, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block text-9xl mb-4"
        >
          🔔
        </motion.div>
        <h1 className="text-6xl font-black text-white mb-2 font-[family-name:var(--font-lilita)]">
          TUS MENSAJES
        </h1>
        <p className="text-2xl text-white/70 font-bold">
          7 notificaciones nuevas ✨
        </p>
      </div>

      {/* FILTROS */}
      <div className="flex gap-3 justify-center flex-wrap">
        {['Todas', 'Logros', 'Clases', 'Equipo'].map((filtro, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              px-8 py-4 rounded-2xl font-black text-lg
              ${i === 0
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/50'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
              }
              transition-all
            `}
          >
            {filtro}
          </motion.button>
        ))}
      </div>

      {/* LISTA DE NOTIFICACIONES */}
      <div className="space-y-4">
        {[
          {
            tipo: 'logro',
            emoji: '🏆',
            titulo: '¡Nuevo Logro Desbloqueado!',
            descripcion: 'Maestro de las Tablas - +100 puntos',
            color: 'from-yellow-500 to-orange-600',
            tiempo: 'Hace 2 horas',
            nuevo: true
          },
          {
            tipo: 'clase',
            emoji: '📚',
            titulo: 'Clase en 30 minutos',
            descripcion: 'Álgebra con Profe Juan - Lunes 19:30',
            color: 'from-blue-500 to-cyan-400',
            tiempo: 'Hoy',
            nuevo: true
          },
          {
            tipo: 'equipo',
            emoji: '🔥',
            titulo: 'Tu equipo está ON FIRE',
            descripcion: '¡73/100 ejercicios completados!',
            color: 'from-orange-500 to-red-600',
            tiempo: 'Hace 1 hora',
            nuevo: true
          },
          {
            tipo: 'logro',
            emoji: '⭐',
            titulo: 'Racha de 5 días',
            descripcion: '¡Sigue así campeón!',
            color: 'from-purple-500 to-pink-600',
            tiempo: 'Ayer',
            nuevo: false
          },
        ].map((notif, i) => (
          <motion.div
            key={i}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02, x: 10 }}
            className={`
              bg-gradient-to-r ${notif.color}
              rounded-3xl p-6
              shadow-xl
              border-3 border-white/30
              cursor-pointer
              relative
              ${notif.nuevo ? 'ring-4 ring-white ring-offset-4 ring-offset-transparent' : 'opacity-70'}
            `}
          >
            <div className="flex items-start gap-5">
              {/* Emoji grande */}
              <motion.div
                animate={notif.nuevo ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl"
              >
                {notif.emoji}
              </motion.div>

              {/* Contenido */}
              <div className="flex-1">
                <div className="text-white text-2xl font-black mb-2">
                  {notif.titulo}
                </div>
                <div className="text-white/90 text-lg font-medium">
                  {notif.descripcion}
                </div>
                <div className="text-white/60 text-sm font-bold mt-2">
                  {notif.tiempo}
                </div>
              </div>

              {/* Badge NUEVO */}
              {notif.nuevo && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="bg-white text-black px-3 py-1 rounded-full
                             text-xs font-black uppercase"
                >
                  NUEVO
                </motion.div>
              )}
            </div>

            {/* Botones de acción */}
            {notif.tipo === 'clase' && (
              <div className="mt-4 flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-white text-black py-3 rounded-2xl
                             font-black text-sm"
                >
                  ENTRAR A CLASE
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="px-6 bg-white/20 text-white py-3 rounded-2xl
                             font-bold text-sm"
                >
                  📅
                </motion.button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

    </div>
  );
}
