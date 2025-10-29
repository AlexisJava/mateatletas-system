'use client';

import { motion } from 'framer-motion';

interface MiGrupoViewProps {
  estudiante: {
    nombre: string;
  };
}

export function MiGrupoView({ estudiante }: MiGrupoViewProps) {
  return (
    <div className="min-h-full p-8 space-y-12">

      {/* HERO - Escudo del equipo gigante */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 1 }}
        className="text-center"
      >
        {/* Escudo 3D del equipo */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="inline-block relative"
        >
          {/* Glow animado */}
          <div className="absolute inset-0 bg-orange-500/50 blur-3xl rounded-full
                         animate-pulse" />

          {/* Escudo */}
          <div className="relative w-48 h-48 rounded-[40px]
                         bg-gradient-to-br from-orange-500 via-red-500 to-pink-600
                         flex items-center justify-center
                         shadow-2xl shadow-orange-500/50
                         border-8 border-yellow-400
                         transform rotate-[-5deg]">
            <span className="text-9xl">🔥</span>
          </div>

          {/* Sparkles alrededor */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl"
              style={{
                top: `${Math.sin(i * Math.PI / 3) * 120 + 90}px`,
                left: `${Math.cos(i * Math.PI / 3) * 120 + 90}px`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2
              }}
            >
              ✨
            </motion.div>
          ))}
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-7xl font-black text-white mt-8 mb-3
                     uppercase tracking-tight drop-shadow-2xl
                     font-[family-name:var(--font-lilita)]"
        >
          EQUIPO FÉNIX
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl text-white/90 font-bold"
        >
          15 Atletas Matemáticos Increíbles 🚀
        </motion.p>
      </motion.div>

      {/* MISIÓN GRUPAL DEL MES */}
      <motion.section
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30
                       backdrop-blur-xl rounded-[40px] p-10
                       border-4 border-white/30
                       shadow-2xl relative overflow-hidden">

          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 text-[200px] opacity-10">
            🎯
          </div>

          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500
                           flex items-center justify-center text-5xl
                           shadow-2xl shadow-yellow-500/50"
              >
                🎯
              </motion.div>
              <div>
                <div className="text-white/70 text-lg font-bold uppercase tracking-wide">
                  Misión Grupal
                </div>
                <h2 className="text-5xl font-black text-white font-[family-name:var(--font-lilita)]">
                  ¡A LA CONQUISTA!
                </h2>
              </div>
            </div>

            <p className="text-2xl text-white mb-6 font-bold">
              Completar 100 ejercicios entre todos esta semana
            </p>

            {/* Barra de progreso ÉPICA */}
            <div className="relative">
              {/* Fondo con patrón */}
              <div className="h-20 bg-gradient-to-r from-black/40 to-black/60
                             rounded-3xl overflow-hidden
                             border-4 border-white/20 relative">

                {/* Progreso animado */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '73%' }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-green-600
                             relative overflow-hidden"
                >
                  {/* Shine effect */}
                  <motion.div
                    animate={{ x: ['0%', '200%'] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                      ease: 'easeInOut'
                    }}
                    className="absolute inset-0 bg-gradient-to-r
                               from-transparent via-white/40 to-transparent"
                    style={{ width: '50%' }}
                  />

                  {/* Particles dentro de la barra */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute top-1/2 -translate-y-1/2 text-2xl"
                      initial={{ x: `${i * 10}%`, y: 0 }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [1, 0.5, 1]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    >
                      ⭐
                    </motion.div>
                  ))}
                </motion.div>

                {/* Texto encima */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-black text-3xl drop-shadow-lg">
                    73 / 100 ejercicios
                  </span>
                </div>

                {/* Emoji de celebración al final */}
                <motion.div
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  🎉
                </motion.div>
              </div>

              {/* Mensaje motivacional */}
              <motion.p
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-center text-yellow-400 text-xl font-black mt-4"
              >
                ¡Solo faltan 27! ¡Vamos equipo! 💪
              </motion.p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* HALL OF FAME - Celebraciones recientes */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600
                       flex items-center justify-center text-5xl
                       shadow-2xl shadow-pink-500/50"
          >
            🎊
          </motion.div>
          <h2 className="text-5xl font-black text-white font-[family-name:var(--font-lilita)]">
            ¡HALL OF FAME!
          </h2>
        </div>

        <div className="grid gap-6">
          {[
            {
              avatar: '👧',
              nombre: 'Ana',
              logro: "¡Maestra de Fracciones!",
              emoji: '🍕',
              color: 'from-pink-500 to-rose-600'
            },
            {
              avatar: '👦',
              nombre: 'Carlos',
              logro: '¡10 días de racha!',
              emoji: '🔥',
              color: 'from-orange-500 to-red-600'
            },
            {
              avatar: '👧',
              nombre: 'María',
              logro: '¡Completó Geometría!',
              emoji: '📐',
              color: 'from-blue-500 to-cyan-400'
            },
          ].map((celebracion, i) => (
            <motion.div
              key={i}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.15 }}
              whileHover={{
                scale: 1.03,
                x: 10,
                rotate: 1
              }}
              className={`
                bg-gradient-to-r ${celebracion.color}
                rounded-[30px] p-8
                shadow-2xl
                border-4 border-white/30
                cursor-pointer
                relative overflow-hidden
              `}
            >
              {/* Confetti de fondo */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-3xl"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      rotate: [0, 360],
                      opacity: [0.3, 0.7, 0.3]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                  >
                    {['⭐', '✨', '🎉', '🎊'][Math.floor(Math.random() * 4)]}
                  </motion.div>
                ))}
              </div>

              <div className="relative flex items-center gap-6">
                {/* Avatar grande */}
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm
                             flex items-center justify-center text-6xl
                             shadow-xl border-4 border-white/40"
                >
                  {celebracion.avatar}
                </motion.div>

                {/* Info */}
                <div className="flex-1">
                  <div className="text-white text-4xl font-black mb-2">
                    {celebracion.nombre}
                  </div>
                  <div className="text-white/90 text-xl font-bold">
                    {celebracion.logro}
                  </div>
                </div>

                {/* Emoji del logro */}
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-7xl"
                >
                  {celebracion.emoji}
                </motion.div>
              </div>

              {/* Badge "NUEVO" */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute top-4 right-4
                           bg-yellow-400 text-black text-sm font-black
                           px-4 py-2 rounded-full
                           shadow-xl uppercase"
              >
                ¡NUEVO!
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
