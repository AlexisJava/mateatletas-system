'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Target, Clock, Award } from 'lucide-react';

interface MiProgresoViewProps {
  estudiante: {
    nombre: string;
    puntos_totales: number;
  };
}

export function MiProgresoView({ estudiante }: MiProgresoViewProps) {
  // Datos mock para el prototipo
  const puntosUltimas4Semanas = [120, 180, 250, 450];
  const horasPorSemana = [1.5, 2.0, 1.8, 2.5];

  return (
    <div className="w-full h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 overflow-y-auto">
      <div className="p-8 space-y-8 max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-5xl font-black text-white mb-2">
            📊 MI PROGRESO
          </h1>
          <p className="text-white/80 text-lg">
            Tu evolución personal, {estudiante.nombre}
          </p>
        </motion.div>

        {/* Evolución de puntos */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border-2 border-white/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white">📈 Tu Evolución</h2>
          </div>

          {/* Gráfico simple con barras */}
          <div className="space-y-3 mt-6">
            {puntosUltimas4Semanas.map((puntos, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-white/70 text-sm font-bold min-w-[80px]">
                  Semana {index + 1}
                </span>
                <div className="flex-1 bg-white/10 rounded-full h-8 overflow-hidden border-2 border-white/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(puntos / 500) * 100}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-end pr-3"
                  >
                    <span className="text-white font-bold text-sm">{puntos} pts</span>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-white/70 mt-4 text-center">
            ¡Has sumado <span className="font-bold text-yellow-400">+450 puntos</span> este mes! 🚀
          </p>
        </motion.section>

        {/* Dominio por tema */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border-2 border-white/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white">🎯 Dominio por Tema</h2>
          </div>

          <div className="space-y-4">
            <SkillProgressBar tema="Álgebra" progreso={85} color="from-purple-500 to-pink-600" />
            <SkillProgressBar tema="Geometría" progreso={62} color="from-blue-500 to-cyan-600" />
            <SkillProgressBar tema="Fracciones" progreso={95} color="from-yellow-500 to-orange-600" />
            <SkillProgressBar tema="Multiplicación" progreso={78} color="from-green-500 to-emerald-600" />
          </div>
        </motion.section>

        {/* Tiempo de práctica */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border-2 border-white/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white">⏱️ Tiempo Practicado</h2>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-6">
            {horasPorSemana.map((horas, index) => (
              <div key={index} className="text-center">
                <div className="bg-white/20 rounded-2xl p-4 border-2 border-white/30 h-32 flex flex-col items-center justify-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(horas / 3) * 100}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                    className="w-full bg-gradient-to-t from-orange-500 to-yellow-400 rounded-xl mb-2"
                  />
                </div>
                <p className="text-white text-sm font-bold mt-2">{horas}h</p>
                <p className="text-white/60 text-xs">Sem {index + 1}</p>
              </div>
            ))}
          </div>

          <p className="text-white/70 mt-4 text-center">
            <span className="font-bold text-yellow-400">2.5 horas</span> esta semana 📚
          </p>
        </motion.section>

        {/* Próximos retos personales */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border-2 border-white/20 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white">🎯 Tus Próximos Retos</h2>
          </div>

          <div className="space-y-3">
            <RetoCard emoji="📐" texto="Completar Álgebra I" progreso={85} />
            <RetoCard emoji="🔥" texto="Llegar a 10 días de racha" progreso={30} />
            <RetoCard emoji="🏆" texto="Desbloquear 5 logros más" progreso={71} />
          </div>
        </motion.section>

      </div>
    </div>
  );
}

// Componente auxiliar: Barra de progreso de habilidad
function SkillProgressBar({ tema, progreso, color }: { tema: string; progreso: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-bold">{tema}</span>
        <span className="text-white/80 text-sm font-bold">{progreso}%</span>
      </div>
      <div className="w-full h-6 bg-white/20 rounded-full overflow-hidden border-2 border-white/30">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progreso}%` }}
          transition={{ delay: 0.3, duration: 1 }}
          className={`h-full bg-gradient-to-r ${color} shadow-lg`}
        />
      </div>
    </div>
  );
}

// Componente auxiliar: Tarjeta de reto
function RetoCard({ emoji, texto, progreso }: { emoji: string; texto: string; progreso: number }) {
  return (
    <div className="bg-white/10 rounded-2xl p-4 border-2 border-white/20 hover:bg-white/20 transition-all cursor-pointer">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{emoji}</span>
        <span className="text-white font-bold flex-1">{texto}</span>
      </div>
      <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progreso}%` }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="h-full bg-gradient-to-r from-green-400 to-cyan-500"
        />
      </div>
      <p className="text-white/60 text-sm mt-2 text-right">{progreso}% completado</p>
    </div>
  );
}
