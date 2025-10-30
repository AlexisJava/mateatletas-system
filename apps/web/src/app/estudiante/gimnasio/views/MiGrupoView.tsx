'use client';

import { motion } from 'framer-motion';

interface MiGrupoViewProps {
  estudiante: {
    nombre: string;
  };
}

export function MiGrupoView({ estudiante }: MiGrupoViewProps) {
  return (
    <div className="w-full h-full flex flex-col p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-14 h-14 rounded-2xl bg-white/20
                       flex items-center justify-center text-3xl"
        >
          🔥
        </div>
        <h1 className="text-5xl font-black text-white font-[family-name:var(--font-lilita)]">
          MI EQUIPO
        </h1>
      </div>

      {/* Grid 3 columnas - LAYOUT HORIZONTAL */}
      <div className="flex-1 grid grid-cols-3 gap-6">
        {/* COLUMNA 1: Info del equipo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-900/60 backdrop-blur-xl rounded-3xl p-6
                     border-2 border-white/20 flex flex-col items-center justify-center gap-4"
        >
          <div
            className="w-20 h-20 rounded-2xl
                         bg-gradient-to-br from-yellow-400 to-orange-500
                         flex items-center justify-center text-5xl
                         border-4 border-white/30 shadow-xl"
          >
            🔥
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-black text-white mb-2">EQUIPO FÉNIX</h2>
            <p className="text-white/70 text-lg font-bold">9,800 puntos</p>
            <p className="text-white/70 text-lg font-bold">15 atletas</p>
          </div>
        </motion.div>

        {/* COLUMNA 2: Misión grupal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-900/60 backdrop-blur-xl rounded-3xl p-6
                     border-2 border-white/20 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🎯</span>
              <h3 className="text-2xl font-black text-white">MISIÓN SEMANAL</h3>
            </div>

            <p className="text-white/80 text-lg font-bold mb-6">
              Completar 100 ejercicios entre todos
            </p>
          </div>

          {/* Barra de progreso */}
          <div>
            <div className="relative h-10 bg-black/40 rounded-xl overflow-hidden border-2 border-white/20 mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '73%' }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-black text-xl">73 / 100</span>
              </div>
            </div>
            <p className="text-white/70 text-center text-sm font-bold">¡Solo faltan 27! 💪</p>
          </div>
        </motion.div>

        {/* COLUMNA 3: Actividad reciente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-900/60 backdrop-blur-xl rounded-3xl p-6
                     border-2 border-white/20 flex flex-col"
        >
          <h3 className="text-2xl font-black text-white mb-4">ACTIVIDAD RECIENTE</h3>

          <div className="flex-1 space-y-3">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-white font-bold">Juan</p>
              <p className="text-white/70 text-sm">+20 puntos</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-white font-bold">María</p>
              <p className="text-white/70 text-sm">+15 puntos</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-white font-bold">Pedro</p>
              <p className="text-white/70 text-sm">+12 puntos</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Banner inferior: Aporte personal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 bg-blue-900/60 backdrop-blur-xl rounded-2xl px-8 py-4
                   border-2 border-white/20 flex items-center justify-between"
      >
        <p className="text-white text-xl font-bold">🏆 Tu aporte esta semana</p>
        <div className="text-yellow-400 text-3xl font-black">+120 puntos</div>
      </motion.div>
    </div>
  );
}
