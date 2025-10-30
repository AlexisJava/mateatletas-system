'use client';

import { motion } from 'framer-motion';

export function AjustesView() {
  return (
    <div className="min-h-full p-8 space-y-12">

      {/* HERO */}
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="inline-block text-9xl mb-4"
        >
          ⚙️
        </motion.div>
        <h1 className="text-6xl font-black text-white font-[family-name:var(--font-lilita)]">
          TU LABORATORIO
        </h1>
        <p className="text-2xl text-white/70 font-bold mt-2">
          Personaliza tu experiencia 🎨
        </p>
      </div>

      {/* SECCIÓN 1: TU AVATAR */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600
                         flex items-center justify-center text-4xl
                         shadow-xl">
            👤
          </div>
          <h2 className="text-4xl font-black text-white font-[family-name:var(--font-lilita)]">TU AVATAR</h2>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-600/30 to-pink-600/30
                     backdrop-blur-xl rounded-[40px] p-10
                     border-4 border-white/30"
        >
          <div className="flex items-center gap-8">
            {/* Preview del avatar */}
            <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600
                           flex items-center justify-center
                           shadow-2xl shadow-cyan-500/50 relative overflow-hidden">
              {/* Avatar real aquí */}
              <span className="text-8xl">🧑</span>

              {/* Sparkles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  animate={{
                    x: [0, Math.random() * 40 - 20],
                    y: [0, Math.random() * 40 - 20],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </div>

            {/* Botones */}
            <div className="flex-1 space-y-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500
                           text-white py-5 rounded-2xl
                           font-black text-xl
                           shadow-xl shadow-yellow-500/50"
              >
                🎨 CAMBIAR AVATAR
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-white/10 text-white py-5 rounded-2xl
                           font-bold text-lg hover:bg-white/20"
              >
                👕 CAMBIAR OUTFIT
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECCIÓN 2: SONIDO Y MÚSICA */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600
                         flex items-center justify-center text-4xl
                         shadow-xl">
            🎵
          </div>
          <h2 className="text-4xl font-black text-white font-[family-name:var(--font-lilita)]">SONIDO</h2>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Música de fondo', emoji: '🎵', enabled: true },
            { label: 'Efectos de sonido', emoji: '🔊', enabled: true },
            { label: 'Voz del narrador', emoji: '🗣️', enabled: false },
          ].map((config, i) => (
            <motion.div
              key={i}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-3xl p-6
                         border-2 border-white/20
                         flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl">{config.emoji}</span>
                <span className="text-white text-2xl font-black">
                  {config.label}
                </span>
              </div>

              {/* Toggle switch */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                className={`
                  w-24 h-12 rounded-full relative
                  ${config.enabled ? 'bg-green-500' : 'bg-gray-600'}
                  shadow-xl transition-colors
                `}
              >
                <motion.div
                  animate={{ x: config.enabled ? 48 : 4 }}
                  className="absolute top-1 w-10 h-10 rounded-full bg-white
                             shadow-xl"
                />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 3: NOTIFICACIONES */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-500 to-red-600
                         flex items-center justify-center text-4xl
                         shadow-xl">
            🔔
          </div>
          <h2 className="text-4xl font-black text-white font-[family-name:var(--font-lilita)]">ALERTAS</h2>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Recordatorios de clases', enabled: true },
            { label: 'Nuevos logros', enabled: true },
            { label: 'Actividad del equipo', enabled: false },
          ].map((config, i) => (
            <motion.div
              key={i}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-3xl p-6
                         border-2 border-white/20
                         flex items-center justify-between"
            >
              <span className="text-white text-xl font-bold">
                {config.label}
              </span>

              <motion.button
                whileTap={{ scale: 0.9 }}
                className={`
                  w-20 h-10 rounded-full relative
                  ${config.enabled ? 'bg-green-500' : 'bg-gray-600'}
                  shadow-lg transition-colors
                `}
              >
                <motion.div
                  animate={{ x: config.enabled ? 40 : 4 }}
                  className="absolute top-1 w-8 h-8 rounded-full bg-white
                             shadow-lg"
                />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BOTÓN DE SALIDA */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-red-500 to-pink-600
                   text-white py-6 rounded-3xl
                   font-black text-2xl
                   shadow-2xl shadow-red-500/50
                   border-4 border-white/30"
      >
        🚪 CERRAR SESIÓN
      </motion.button>

    </div>
  );
}
