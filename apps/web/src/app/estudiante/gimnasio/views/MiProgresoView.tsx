'use client';

import { motion } from 'framer-motion';

interface MiProgresoViewProps {
  estudiante: {
    nombre: string;
    puntos_totales?: number;
  };
}

export function MiProgresoView({ estudiante }: MiProgresoViewProps) {
  return (
    <div className="min-h-full p-8 space-y-12">

      {/* HERO - Celebración del mes */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-9xl mb-4"
        >
          🚀
        </motion.div>
        <h1 className="text-6xl font-black text-white mb-2 font-[family-name:var(--font-lilita)]">
          ¡VAS INCREÍBLE!
        </h1>
        <p className="text-3xl text-yellow-400 font-black">
          +450 puntos este mes 🎉
        </p>
      </motion.div>

      {/* SECCIÓN 1: TU CAMINO (reemplaza gráfico de líneas) */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400
                          flex items-center justify-center text-3xl
                          shadow-2xl shadow-blue-500/50">
            🗺️
          </div>
          <h2 className="text-4xl font-black text-white font-[family-name:var(--font-lilita)]">
            TU CAMINO
          </h2>
        </div>

        {/* Mapa de aventura vertical */}
        <div className="relative pl-20">

          {/* Línea de conexión */}
          <div className="absolute left-8 top-0 bottom-0 w-2 bg-gradient-to-b
                          from-cyan-400 via-purple-500 to-pink-500 rounded-full" />

          {/* Semanas como niveles del mapa */}
          {[
            { semana: 1, puntos: 120, emoji: '🏔️', nombre: 'Montaña', completado: true },
            { semana: 2, puntos: 180, emoji: '🌲', nombre: 'Bosque', completado: true },
            { semana: 3, puntos: 250, emoji: '🏰', nombre: 'Castillo', completado: true },
            { semana: 4, puntos: 450, emoji: '🚀', nombre: 'Cohete', completado: true, actual: true },
          ].map((nivel, i) => (
            <motion.div
              key={i}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.15 }}
              className="relative mb-8 last:mb-0"
            >
              {/* Nodo del mapa */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={`
                  absolute -left-12 w-16 h-16 rounded-2xl
                  flex items-center justify-center text-4xl
                  shadow-2xl
                  ${nivel.actual
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-yellow-500/50 ring-4 ring-white'
                    : 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-500/50'
                  }
                `}
              >
                {nivel.emoji}
              </motion.div>

              {/* Card de info */}
              <motion.div
                whileHover={{ x: 10, scale: 1.02 }}
                className={`
                  bg-white/10 backdrop-blur-xl rounded-3xl p-6
                  border-2
                  ${nivel.actual ? 'border-yellow-400' : 'border-white/20'}
                  ${nivel.actual ? 'shadow-2xl shadow-yellow-500/30' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white/70 text-sm font-bold uppercase mb-1">
                      Semana {nivel.semana}
                    </div>
                    <div className="text-white text-3xl font-black">
                      {nivel.nombre}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-yellow-400 text-4xl font-black">
                      {nivel.puntos}
                    </div>
                    <div className="text-white/70 text-sm font-bold">
                      puntos
                    </div>
                  </div>
                </div>

                {/* Checkmark si completado */}
                {nivel.completado && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-3 -right-3 w-12 h-12
                               bg-green-500 rounded-full
                               flex items-center justify-center
                               shadow-xl shadow-green-500/50"
                  >
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}

                {/* Badge "ACTUAL" */}
                {nivel.actual && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -top-3 -left-3
                               bg-gradient-to-r from-yellow-400 to-orange-500
                               text-white text-xs font-black uppercase
                               px-4 py-2 rounded-full
                               shadow-xl shadow-yellow-500/50"
                  >
                    ¡Estás aquí!
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          ))}

        </div>
      </section>

      {/* SECCIÓN 2: DOMINIO POR TEMA (reemplaza barras aburridas) */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500
                          flex items-center justify-center text-3xl
                          shadow-2xl shadow-purple-500/50">
            🎯
          </div>
          <h2 className="text-4xl font-black text-white font-[family-name:var(--font-lilita)]">
            TUS SUPERPODERES
          </h2>
        </div>

        <div className="grid gap-6">
          {[
            { tema: 'Álgebra', progreso: 85, emoji: '📐', color: 'from-red-500 to-pink-500' },
            { tema: 'Geometría', progreso: 62, emoji: '📏', color: 'from-blue-500 to-cyan-400' },
            { tema: 'Fracciones', progreso: 95, emoji: '🍕', color: 'from-green-500 to-emerald-400' },
          ].map((tema, i) => (
            <motion.div
              key={i}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              whileHover={{ scale: 1.03, x: 10 }}
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-6
                         border-2 border-white/20 hover:border-white/40
                         transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                {/* Emoji grande */}
                <div className={`
                  w-20 h-20 rounded-2xl
                  bg-gradient-to-br ${tema.color}
                  flex items-center justify-center text-5xl
                  shadow-2xl
                `}>
                  {tema.emoji}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="text-white text-2xl font-black mb-1">
                    {tema.tema}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Estrellas de progreso */}
                    {Array.from({ length: 5 }).map((_, starIndex) => {
                      const filled = (tema.progreso / 20) > starIndex;
                      return (
                        <motion.div
                          key={starIndex}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.8 + i * 0.1 + starIndex * 0.05 }}
                        >
                          {filled ? (
                            <span className="text-3xl">⭐</span>
                          ) : (
                            <span className="text-3xl opacity-30">☆</span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Porcentaje grande */}
                <div className="text-right">
                  <div className="text-5xl font-black text-white">
                    {tema.progreso}%
                  </div>
                  {tema.progreso >= 90 && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-yellow-400 text-sm font-black uppercase mt-1"
                    >
                      ¡MAESTRO!
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Barra visual SIMPLE pero linda */}
              <div className="relative h-3 bg-black/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${tema.progreso}%` }}
                  transition={{ duration: 1, delay: 0.8 + i * 0.1 }}
                  className={`h-full bg-gradient-to-r ${tema.color} rounded-full`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 3: PRÓXIMOS RETOS */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500
                          flex items-center justify-center text-3xl
                          shadow-2xl shadow-orange-500/50">
            🎪
          </div>
          <h2 className="text-4xl font-black text-white font-[family-name:var(--font-lilita)]">
            PRÓXIMOS RETOS
          </h2>
        </div>

        <div className="grid gap-4">
          {[
            { emoji: '📐', texto: 'Completar Álgebra I', progreso: 85, meta: 'Falta 15%' },
            { emoji: '🔥', texto: 'Llegar a 10 días de racha', progreso: 30, meta: '3/10 días' },
            { emoji: '🏆', texto: 'Desbloquear 5 logros más', progreso: 71, meta: '12/17 logros' },
          ].map((reto, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 + i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm
                         rounded-2xl p-5 border border-white/20
                         hover:border-white/40 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">{reto.emoji}</div>
                <div className="flex-1">
                  <div className="text-white font-black text-lg mb-2">
                    {reto.texto}
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Mini barra */}
                    <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${reto.progreso}%` }}
                        transition={{ duration: 1, delay: 1.3 + i * 0.1 }}
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                      />
                    </div>
                    <span className="text-white/70 text-sm font-bold min-w-[80px]">
                      {reto.meta}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
