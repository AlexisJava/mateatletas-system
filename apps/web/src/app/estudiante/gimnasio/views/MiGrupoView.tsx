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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20
                         flex items-center justify-center text-3xl">
            🔥
          </div>
          <h1 className="text-5xl font-black text-white font-[family-name:var(--font-lilita)]">
            MI EQUIPO
          </h1>
        </div>
      </div>

      {/* Contenido - 3 secciones verticales */}
      <div className="flex-1 flex flex-col gap-6">

        {/* SECCIÓN 1: Info del equipo (25%) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-orange-500 to-red-600
                     rounded-3xl p-8
                     flex items-center gap-6
                     border-4 border-white/20
                     shadow-xl"
        >
          {/* Escudo - NO animado */}
          <div className="w-24 h-24 rounded-2xl
                         bg-gradient-to-br from-yellow-400 to-orange-500
                         flex items-center justify-center
                         text-6xl
                         border-4 border-white/30
                         shadow-2xl">
            🔥
          </div>

          <div className="flex-1">
            <h2 className="text-4xl font-black text-white mb-2">
              EQUIPO FÉNIX
            </h2>
            <div className="flex items-center gap-6 text-white/90 text-xl font-bold">
              <span>9,800 puntos</span>
              <span>•</span>
              <span>15 atletas</span>
            </div>
          </div>
        </motion.div>

        {/* SECCIÓN 2: Misión grupal (40%) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="bg-white/10 backdrop-blur-sm
                     rounded-3xl p-8
                     border-2 border-white/20
                     flex-1"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="text-5xl">🎯</div>
            <h3 className="text-3xl font-black text-white">
              MISIÓN DE LA SEMANA
            </h3>
          </div>

          <p className="text-xl text-white mb-4 font-bold">
            Completar 100 ejercicios entre todos
          </p>

          {/* Barra de progreso SIMPLE */}
          <div className="relative h-12 bg-black/40 rounded-2xl overflow-hidden border-2 border-white/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '73%' }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-black text-2xl drop-shadow-lg">
                73 / 100
              </span>
            </div>
          </div>

          <p className="text-white/80 text-center mt-4 font-bold text-lg">
            ¡Solo faltan 27! 💪
          </p>
        </motion.div>

        {/* SECCIÓN 3: Aporte del equipo (25%) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="bg-white/10 backdrop-blur-sm
                     rounded-3xl p-8
                     border-2 border-white/20
                     flex items-center justify-between"
        >
          <div>
            <div className="text-white/70 text-sm font-bold uppercase mb-2">
              Aporte del equipo
            </div>
            <div className="text-white text-3xl font-black">
              Esta semana sumaron
            </div>
          </div>

          <div className="text-right">
            <div className="text-yellow-400 text-5xl font-black">
              +1,250
            </div>
            <div className="text-white/70 text-lg font-bold">
              puntos juntos ✨
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
