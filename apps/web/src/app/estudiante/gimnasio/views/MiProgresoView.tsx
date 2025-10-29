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
    <div className="w-full h-full flex flex-col p-8">

      {/* Header fijo */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20
                         flex items-center justify-center text-3xl">
            📊
          </div>
          <h1 className="text-5xl font-black text-white font-[family-name:var(--font-lilita)]">
            MI PROGRESO
          </h1>
        </div>
      </div>

      {/* Grid 3x2 - OCUPA TODO EL ESPACIO RESTANTE */}
      <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-6">

        {/* Card 1: Monedas */}
        <StatCard
          emoji="💰"
          value="168"
          label="Monedas"
          gradient="from-yellow-400 to-orange-500"
          delay={0}
        />

        {/* Card 2: Días estudiados */}
        <StatCard
          emoji="📅"
          value="12"
          label="Días este mes"
          gradient="from-blue-500 to-cyan-400"
          delay={0.05}
        />

        {/* Card 3: Racha */}
        <StatCard
          emoji="🔥"
          value="3"
          label="Días de racha"
          gradient="from-orange-500 to-red-600"
          delay={0.1}
        />

        {/* Card 4: Nivel */}
        <StatCard
          emoji="⭐"
          value="1"
          label="Nivel"
          gradient="from-purple-500 to-pink-600"
          delay={0.15}
        />

        {/* Card 5: Tema dominado */}
        <StatCard
          emoji="🎯"
          value="85%"
          label="Álgebra"
          gradient="from-green-500 to-emerald-600"
          delay={0.2}
        />

        {/* Card 6: Logros */}
        <StatCard
          emoji="🏆"
          value="12"
          label="Logros"
          gradient="from-amber-500 to-yellow-600"
          delay={0.25}
        />

      </div>
    </div>
  );
}

// Componente de Card SIMPLE
function StatCard({
  emoji,
  value,
  label,
  gradient,
  delay
}: {
  emoji: string;
  value: string;
  label: string;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }} // MUY SUTIL
      transition={{ duration: 0.3, delay }}
      className={`
        bg-gradient-to-br ${gradient}
        rounded-3xl p-8
        flex flex-col items-center justify-center
        shadow-xl
        border-4 border-white/20
      `}
    >
      {/* Emoji - NO animado */}
      <div className="text-6xl mb-4">
        {emoji}
      </div>

      {/* Valor grande */}
      <div className="text-5xl font-black text-white mb-2">
        {value}
      </div>

      {/* Label */}
      <div className="text-lg font-bold text-white/80 uppercase text-center">
        {label}
      </div>
    </motion.div>
  );
}
