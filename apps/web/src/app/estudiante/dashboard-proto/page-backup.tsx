'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useGamificacionStore } from '@/store/gamificacion.store';
import { useAuthStore } from '@/store/auth.store';
import { LoadingSpinner } from '@/components/effects';

// Animaciones SMOOTH - sin exageraciones
const smoothFadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } // easeInOutCubic
};

const smoothScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
};

// Componente de Card Chunky Reutilizable
const ChunkyCard = ({
  children,
  gradient,
  delay = 0,
  className = ""
}: {
  children: React.ReactNode;
  gradient: string;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{
      duration: 0.4,
      delay,
      ease: [0.25, 0.1, 0.25, 1]
    }}
    className={`relative overflow-hidden ${className}`}
    style={{
      background: gradient,
      borderRadius: '16px',
      border: '5px solid #000',
      boxShadow: '8px 8px 0 0 rgba(0, 0, 0, 1)',
    }}
  >
    {children}
  </motion.div>
);

// Botón Chunky con efecto smooth
const ChunkyButton = ({
  children,
  color,
  onClick,
  className = ""
}: {
  children: React.ReactNode;
  color: string;
  onClick?: () => void;
  className?: string;
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      whileHover={{
        x: -2,
        y: -2,
        transition: { duration: 0.2, ease: 'easeOut' }
      }}
      whileTap={{
        x: 0,
        y: 0,
        transition: { duration: 0.1 }
      }}
      className={`w-full font-bold text-white relative ${className}`}
      style={{
        background: color,
        borderRadius: '12px',
        border: '4px solid #000',
        boxShadow: isPressed ? 'none' : '6px 6px 0 0 rgba(0, 0, 0, 1)',
        textShadow: '2px 2px 0 #000',
        transition: 'box-shadow 0.1s ease-out',
      }}
    >
      {children}
    </motion.button>
  );
};

export default function EstudianteDashboardProto() {
  const { dashboard, fetchDashboard, isLoading } = useGamificacionStore();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user?.id && user?.role === 'estudiante') {
      fetchDashboard(user.id);
    }
  }, [user?.id]);

  const mockData = {
    estudiante: {
      nombre: 'Juan',
      apellido: 'Pérez',
      equipo: { nombre: 'ASTROS', color: '#FFD600' },
    },
    stats: {
      puntosToales: 1250,
      clasesAsistidas: 23,
      clasesTotales: 30,
      racha: 7,
    },
    proximasClases: [
      {
        id: '1',
        ruta_curricular: { nombre: 'Geometría', color: '#10B981' },
        docente: { nombre: 'María', apellido: 'González' },
        fecha_hora_inicio: new Date(Date.now() + 86400000),
      },
    ],
    equipoRanking: [
      { nombre: 'María', apellido: 'López', puntos: 1890, id: '1' },
      { nombre: 'Juan', apellido: 'Pérez', puntos: 1250, id: '2' },
      { nombre: 'Ana', apellido: 'Martínez', puntos: 1100, id: '3' },
    ],
  };

  const data = dashboard || mockData;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Cargando..." />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col p-4 gap-3 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">

      {/* Header Compacto - Celeste + Naranja */}
      <ChunkyCard
        gradient="linear-gradient(135deg, #FF7A00 0%, #00C2D1 50%, #0891b2 100%)"
        delay={0}
        className="flex-shrink-0"
      >
        <div className="p-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent" />
          <div className="relative z-10">
            <h1
              className="text-3xl font-bold text-white mb-1"
              style={{
                textShadow: '3px 3px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
              }}
            >
              ¡HOLA, {data.estudiante.nombre.toUpperCase()}! 👋
            </h1>
            <p
              className="text-white text-base font-semibold"
              style={{ textShadow: '2px 2px 0 #000' }}
            >
              Equipo: <span style={{ color: '#FFD600' }}>{data.estudiante.equipo.nombre}</span>
            </p>
          </div>
        </div>
      </ChunkyCard>

      {/* Grid 2x2 - Sin Scroll */}
      <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">

        {/* TOP LEFT: Portal de Competición (CELESTE/TURQUESA) */}
        <ChunkyCard
          gradient="linear-gradient(135deg, #00C2D1 0%, #0891b2 100%)"
          delay={0.1}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="absolute top-2 right-2 text-7xl opacity-10">⚔️</div>

            <h2
              className="text-xl font-bold text-white mb-3 relative z-10"
              style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000' }}
            >
              🎯 PORTAL DE COMPETICIÓN
            </h2>

            {data.proximasClases.length === 0 ? (
              <p className="text-white/90">No tenés clases programadas</p>
            ) : (
              <div className="flex-1 flex flex-col justify-between relative z-10">
                <div>
                  {data.proximasClases.slice(0, 1).map((clase) => (
                    <div key={clase.id} className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full border-2 border-black"
                          style={{ backgroundColor: clase.ruta_curricular.color }}
                        />
                        <p className="text-white font-bold text-lg">
                          {clase.ruta_curricular.nombre}
                        </p>
                      </div>
                      <p className="text-white/80 text-sm">
                        Prof. {clase.docente.nombre} {clase.docente.apellido}
                      </p>
                      <p className="text-yellow-300 font-bold mt-1">
                        Mañana - 16:00 hs
                      </p>
                    </div>
                  ))}
                </div>

                <ChunkyButton color="#FF7A00" className="py-3 text-lg">
                  ¡A LA ARENA! ⚔️
                </ChunkyButton>
              </div>
            )}
          </div>
        </ChunkyCard>

        {/* TOP RIGHT: Inicio de Circuito (NARANJA) */}
        <ChunkyCard
          gradient="linear-gradient(135deg, #FF7A00 0%, #E67300 100%)"
          delay={0.2}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="absolute top-2 right-2 text-7xl opacity-10">🎮</div>

            <h2
              className="text-xl font-bold text-white mb-3 relative z-10"
              style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000' }}
            >
              ⚡ INICIO DE CIRCUITO
            </h2>

            <div className="flex-1 flex flex-col justify-between relative z-10">
              <div>
                <p className="text-white text-base mb-2">Desafío del Día</p>
                <div
                  className="rounded-lg p-3 mb-2"
                  style={{
                    background: 'rgba(0,0,0,0.2)',
                    border: '3px solid #000'
                  }}
                >
                  <p className="text-white font-bold text-base mb-1">Álgebra Rápida ⚡</p>
                  <p className="text-white/90 text-sm">10 ecuaciones en 5 min</p>
                </div>

                <div className="flex gap-2 text-sm">
                  <span className="text-yellow-300 font-bold">⭐ +50 pts</span>
                  <span className="text-white/80">⏱️ 5 min</span>
                </div>
              </div>

              <ChunkyButton color="#007BFF" className="py-3 text-lg">
                ¡VAMOS! 🚀
              </ChunkyButton>
            </div>
          </div>
        </ChunkyCard>

        {/* BOTTOM LEFT: Estadísticas (MORADO/VIOLETA) */}
        <ChunkyCard
          gradient="linear-gradient(135deg, #7F00FF 0%, #9933FF 100%)"
          delay={0.3}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="absolute top-2 right-2 text-7xl opacity-10">📊</div>

            <h2
              className="text-xl font-bold text-white mb-3 relative z-10"
              style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000' }}
            >
              📍 TUS ESTADÍSTICAS
            </h2>

            <div className="flex-1 grid grid-cols-2 gap-2 relative z-10">
              {/* Puntos - AMARILLO */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3, ease: 'easeOut' }}
                className="rounded-lg p-3 text-center"
                style={{
                  background: '#FFD700',
                  border: '3px solid #000',
                  boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 1)',
                }}
              >
                <div className="text-2xl mb-1">⭐</div>
                <div className="text-xl font-bold text-black">
                  {mounted && <CountUp end={data.stats.puntosToales} duration={1.5} separator="," />}
                </div>
                <div className="text-xs font-semibold text-black/70">PUNTOS</div>
              </motion.div>

              {/* Clases - VERDE */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.3, ease: 'easeOut' }}
                className="rounded-lg p-3 text-center"
                style={{
                  background: '#00CC44',
                  border: '3px solid #000',
                  boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 1)',
                }}
              >
                <div className="text-2xl mb-1">📚</div>
                <div className="text-xl font-bold text-white" style={{ textShadow: '2px 2px 0 #000' }}>
                  {mounted && <CountUp end={data.stats.clasesAsistidas} duration={1.5} />}/{data.stats.clasesTotales}
                </div>
                <div className="text-xs font-semibold text-white" style={{ textShadow: '1px 1px 0 #000' }}>CLASES</div>
              </motion.div>

              {/* Racha - NARANJA/ROJO */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.3, ease: 'easeOut' }}
                className="rounded-lg p-3 text-center"
                style={{
                  background: '#FF6B35',
                  border: '3px solid #000',
                  boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 1)',
                }}
              >
                <div className="text-2xl mb-1">🔥</div>
                <div className="text-xl font-bold text-white" style={{ textShadow: '2px 2px 0 #000' }}>
                  {mounted && <CountUp end={data.stats.racha} duration={1.5} />}
                </div>
                <div className="text-xs font-semibold text-white" style={{ textShadow: '1px 1px 0 #000' }}>RACHA</div>
              </motion.div>

              {/* Ranking - MORADO */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.3, ease: 'easeOut' }}
                className="rounded-lg p-3 text-center"
                style={{
                  background: '#9933FF',
                  border: '3px solid #000',
                  boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 1)',
                }}
              >
                <div className="text-2xl mb-1">🏆</div>
                <div className="text-xl font-bold text-white" style={{ textShadow: '2px 2px 0 #000' }}>
                  #{data.equipoRanking.findIndex((e) => e.id === '2') + 1}
                </div>
                <div className="text-xs font-semibold text-white" style={{ textShadow: '1px 1px 0 #000' }}>EQUIPO</div>
              </motion.div>
            </div>
          </div>
        </ChunkyCard>

        {/* BOTTOM RIGHT: Top 3 Equipo (CELESTE) */}
        <ChunkyCard
          gradient="linear-gradient(135deg, #00C2D1 0%, #007BFF 100%)"
          delay={0.4}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="absolute top-2 right-2 text-7xl opacity-10">👥</div>

            <h2
              className="text-xl font-bold text-white mb-3 relative z-10"
              style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000' }}
            >
              🏅 TOP 3 EQUIPO
            </h2>

            <div className="flex-1 space-y-2 relative z-10">
              {data.equipoRanking.slice(0, 3).map((estudiante, index) => {
                const medals = ['🥇', '🥈', '🥉'];
                const bgColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

                return (
                  <motion.div
                    key={estudiante.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.6 + index * 0.1,
                      duration: 0.3,
                      ease: 'easeOut'
                    }}
                    className="rounded-lg p-2 flex items-center gap-2"
                    style={{
                      background: estudiante.id === '2' ? '#FF7A00' : bgColors[index],
                      border: '3px solid #000',
                      boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 1)',
                    }}
                  >
                    <span className="text-xl">{medals[index]}</span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-bold text-sm truncate"
                        style={{
                          color: estudiante.id === '2' ? '#fff' : '#000',
                          textShadow: estudiante.id === '2' ? '1px 1px 0 #000' : 'none',
                        }}
                      >
                        {estudiante.nombre} {estudiante.apellido}
                        {estudiante.id === '2' && (
                          <span className="ml-1 text-xs bg-yellow-300 text-black px-2 py-0.5 rounded-full border-2 border-black">
                            VOS
                          </span>
                        )}
                      </p>
                      <p
                        className="text-xs font-semibold"
                        style={{
                          color: estudiante.id === '2' ? '#FFD700' : '#000',
                          textShadow: estudiante.id === '2' ? '1px 1px 0 #000' : 'none',
                        }}
                      >
                        {estudiante.puntos} pts
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <ChunkyButton color="#7F00FF" className="py-2 text-sm mt-2">
              Ver Ranking Completo →
            </ChunkyButton>
          </div>
        </ChunkyCard>

      </div>
    </div>
  );
}
