'use client';

import { motion } from 'framer-motion';
import { Users, Target, PartyPopper, Flame } from 'lucide-react';

interface MiGrupoViewProps {
  estudiante: {
    nombre: string;
  };
}

export function MiGrupoView({ estudiante }: MiGrupoViewProps) {
  // Datos mock del grupo
  const grupo = {
    nombre: 'Fénix',
    emoji: '🔥',
    color: 'from-orange-500 to-red-600',
    totalMiembros: 15,
  };

  const objetivoSemanal = {
    descripcion: 'Completar 100 ejercicios entre todos',
    progreso: 73,
    total: 100,
  };

  const celebraciones = [
    {
      avatar: '👧',
      nombre: 'Ana',
      logro: 'Desbloqueó "Maestro de Fracciones"',
      fecha: 'Hace 2 horas',
    },
    {
      avatar: '👦',
      nombre: 'Carlos',
      logro: '10 días de racha consecutivos 🔥',
      fecha: 'Hace 5 horas',
    },
    {
      avatar: '👧',
      nombre: 'María',
      logro: 'Completó Geometría I',
      fecha: 'Hace 1 día',
    },
    {
      avatar: '👦',
      nombre: 'Luis',
      logro: 'Alcanzó nivel 5 ⭐',
      fecha: 'Hace 1 día',
    },
  ];

  return (
    <div className="w-full h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 overflow-y-auto">
      <div className="p-8 space-y-6 max-w-5xl mx-auto">

        {/* Header del grupo */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-6"
        >
          <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${grupo.color} flex items-center justify-center text-6xl shadow-2xl border-4 border-white/30`}>
            {grupo.emoji}
          </div>
          <div>
            <h1 className="text-5xl font-black text-white">
              Grupo {grupo.nombre}
            </h1>
            <p className="text-white/70 text-lg mt-1">
              {grupo.totalMiembros} compañeros de estudio
            </p>
          </div>
        </motion.div>

        {/* Objetivo grupal colaborativo */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border-2 border-white/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white">
              🎯 Objetivo Semanal Grupal
            </h2>
          </div>

          <p className="text-white/90 text-lg mb-4">
            {objetivoSemanal.descripcion}
          </p>

          <div className="w-full h-10 bg-white/20 rounded-full overflow-hidden border-2 border-white/30">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(objetivoSemanal.progreso / objetivoSemanal.total) * 100}%` }}
              transition={{ delay: 0.3, duration: 1 }}
              className="h-full bg-gradient-to-r from-green-400 to-cyan-500 shadow-lg flex items-center justify-end pr-4"
            >
              <span className="text-white font-black text-sm">
                {objetivoSemanal.progreso}/{objetivoSemanal.total}
              </span>
            </motion.div>
          </div>

          <p className="text-sm text-white/70 mt-3 text-center">
            ¡Vamos {objetivoSemanal.progreso}/{objetivoSemanal.total}! Falta poco 💪
          </p>
        </motion.section>

        {/* Stats del grupo */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4"
        >
          <StatCard
            icon={<Users className="w-6 h-6" />}
            value="15"
            label="Miembros"
            gradient="from-cyan-500 to-blue-600"
          />
          <StatCard
            icon={<Flame className="w-6 h-6" />}
            value="8 días"
            label="Racha Grupal"
            gradient="from-orange-500 to-red-600"
          />
          <StatCard
            icon={<PartyPopper className="w-6 h-6" />}
            value="47"
            label="Logros Esta Semana"
            gradient="from-purple-500 to-pink-600"
          />
        </motion.div>

        {/* Celebraciones grupales (sin posiciones) */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border-2 border-white/20 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
              <PartyPopper className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white">
              🎉 Celebraciones Recientes
            </h2>
          </div>

          <div className="space-y-3">
            {celebraciones.map((celebracion, index) => (
              <CelebracionCard key={index} {...celebracion} delay={0.4 + index * 0.1} />
            ))}
          </div>
        </motion.section>

        {/* Mensaje motivacional */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-6 text-center border-4 border-white/30 shadow-2xl"
        >
          <p className="text-2xl font-black text-white mb-2">
            💪 Juntos somos más fuertes
          </p>
          <p className="text-white/90">
            Cada logro de un compañero inspira al grupo entero. ¡Sigamos aprendiendo juntos!
          </p>
        </motion.div>

      </div>
    </div>
  );
}

// Componente auxiliar: Stat card
function StatCard({
  icon,
  value,
  label,
  gradient,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  gradient: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 border-2 border-white/30 shadow-xl`}>
      <div className="flex flex-col items-center text-center">
        <div className="text-white mb-2">{icon}</div>
        <div className="text-white text-3xl font-black">{value}</div>
        <div className="text-white/80 text-xs font-bold uppercase tracking-wide mt-1">
          {label}
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar: Celebración card
function CelebracionCard({
  avatar,
  nombre,
  logro,
  fecha,
  delay,
}: {
  avatar: string;
  nombre: string;
  logro: string;
  fecha: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay }}
      className="bg-white/10 rounded-2xl p-4 border-2 border-white/20 hover:bg-white/20 transition-all flex items-center gap-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-3xl border-2 border-white/30">
        {avatar}
      </div>
      <div className="flex-1">
        <p className="text-white font-bold text-lg">{nombre}</p>
        <p className="text-white/80 text-sm">{logro}</p>
        <p className="text-white/50 text-xs mt-1">{fecha}</p>
      </div>
    </motion.div>
  );
}
