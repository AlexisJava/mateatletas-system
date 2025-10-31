'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Zap, Trophy, Star, Target } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DailyWelcomeModalProps {
  estudiante: {
    nombre: string;
    apellido: string;
  };
  racha: {
    dias_consecutivos: number;
    record_personal: number;
  };
  onClose: () => void;
}

const SALUDOS_EPICOS = [
  { texto: '¡BIENVENIDO AL RING!', emoji: '🥊', color: 'from-red-500 to-orange-600' },
  { texto: '¡HORA DE DOMINAR!', emoji: '💪', color: 'from-purple-500 to-pink-600' },
  { texto: '¡A ROMPERLA HOY!', emoji: '⚡', color: 'from-yellow-400 to-orange-500' },
  { texto: '¡IMPARABLE!', emoji: '🔥', color: 'from-orange-500 to-red-600' },
  { texto: '¡MODO BESTIA: ON!', emoji: '🦁', color: 'from-amber-500 to-yellow-600' },
  { texto: '¡ARRANCAMOS!', emoji: '🚀', color: 'from-cyan-500 to-blue-600' },
  { texto: '¡FUEGO EN LA CANCHA!', emoji: '🏀', color: 'from-orange-600 to-red-700' },
  { texto: '¡SIN FRENOS!', emoji: '💥', color: 'from-red-600 to-pink-700' },
];

export function DailyWelcomeModal({
  estudiante,
  racha,
  onClose,
}: DailyWelcomeModalProps) {
  const [saludoEpico] = useState(() =>
    SALUDOS_EPICOS[Math.floor(Math.random() * SALUDOS_EPICOS.length)]
  );
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  const esPrimerDia = racha.dias_consecutivos === 1;
  const esRecordNuevo = racha.dias_consecutivos > racha.record_personal;
  const rachaFuerte = racha.dias_consecutivos >= 7;
  const rachaImparable = racha.dias_consecutivos >= 30;

  // Calcular próximo milestone
  const proximoMilestone = rachaFuerte ? (rachaImparable ? 60 : 30) : 7;
  const diasParaMilestone = proximoMilestone - racha.dias_consecutivos;

  // Generar partículas de fondo
  useEffect(() => {
    const generatedParticles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setParticles(generatedParticles);
  }, []);

  // Cerrar automáticamente después de 6 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 6000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
        {/* Backdrop con gradiente */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/50 to-black"
        />

        {/* Partículas de fondo flotantes */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              y: [0, -100],
            }}
            transition={{
              duration: 3,
              delay: particle.delay,
              repeat: Infinity,
              repeatDelay: 1,
              ease: 'easeOut',
            }}
            className="absolute w-1 h-1 bg-yellow-400/80 rounded-full blur-sm"
            style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
          />
        ))}

        {/* Modal centrado - DISEÑO ÉPICO */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0, rotateX: -90 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          exit={{ scale: 0.3, opacity: 0, rotateX: 90 }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 200,
          }}
          className="relative w-full max-w-5xl mx-4 pointer-events-auto"
        >
          {/* Glow effect exterior */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 rounded-3xl blur-3xl" />

          {/* Card principal */}
          <div className="relative bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95
                          backdrop-blur-2xl rounded-3xl
                          border-4 border-white/20
                          shadow-2xl overflow-hidden">

            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full
                         bg-black/40 hover:bg-black/60 backdrop-blur-sm
                         flex items-center justify-center
                         border-2 border-white/20 hover:border-white/40
                         transition-all group"
            >
              <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Header con emoji y saludo */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 20 }}
              className="relative pt-12 pb-6 px-8"
            >
              {/* Emoji gigante animado */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, -10, 10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="text-9xl text-center mb-4 drop-shadow-2xl"
              >
                {saludoEpico.emoji}
              </motion.div>

              {/* Saludo épico */}
              <h1 className={`text-6xl md:text-7xl font-black text-center mb-4
                           font-[family-name:var(--font-lilita)]
                           bg-gradient-to-r ${saludoEpico.color} bg-clip-text text-transparent
                           drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]`}>
                {saludoEpico.texto}
              </h1>

              {/* Nombre del estudiante */}
              <p className="text-3xl font-bold text-center text-white/90">
                {estudiante.nombre} {estudiante.apellido}
              </p>
            </motion.div>

            {/* Contenedor principal con 2 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 pb-8">

              {/* COLUMNA IZQUIERDA: Racha gigante */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="bg-gradient-to-br from-orange-600/20 to-red-700/20
                           backdrop-blur-xl rounded-3xl p-8
                           border-2 border-orange-500/40
                           flex flex-col items-center justify-center gap-6"
              >
                {/* Llama animada */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    filter: [
                      'drop-shadow(0 0 20px rgba(255,100,0,0.8))',
                      'drop-shadow(0 0 40px rgba(255,100,0,1))',
                      'drop-shadow(0 0 20px rgba(255,100,0,0.8))',
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Flame className="w-32 h-32 text-orange-500" />
                </motion.div>

                {/* Número de racha ENORME */}
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring', damping: 10 }}
                    className="text-[10rem] font-black text-white leading-none
                             drop-shadow-[0_0_40px_rgba(255,165,0,1)]"
                  >
                    {racha.dias_consecutivos}
                  </motion.div>
                  <p className="text-4xl font-black text-orange-400 mt-2">
                    {racha.dias_consecutivos === 1 ? 'DÍA' : 'DÍAS'}
                  </p>
                  <p className="text-xl font-bold text-orange-300 mt-1">DE RACHA</p>
                </div>

                {/* Badge de récord si aplica */}
                {esRecordNuevo && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 1, type: 'spring', damping: 10 }}
                    className="flex items-center gap-2 px-6 py-3
                               bg-yellow-500/30 border-2 border-yellow-400
                               rounded-full"
                  >
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <span className="text-lg font-black text-yellow-300">
                      ¡NUEVO RÉCORD!
                    </span>
                    <Trophy className="w-6 h-6 text-yellow-400" />
                  </motion.div>
                )}
              </motion.div>

              {/* COLUMNA DERECHA: Info y Logros */}
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="flex flex-col gap-6"
              >
                {/* Card: Mensaje motivacional */}
                <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20
                               backdrop-blur-xl rounded-2xl p-6
                               border-2 border-purple-500/40">
                  <div className="flex items-start gap-4">
                    <Zap className="w-10 h-10 text-yellow-400 flex-shrink-0" />
                    <div>
                      {esPrimerDia ? (
                        <>
                          <h3 className="text-2xl font-black text-white mb-2">
                            ¡ARRANCASTE UNA RACHA!
                          </h3>
                          <p className="text-lg text-purple-200">
                            Cada día cuenta. Volvé mañana para mantenerla viva y desbloquear recompensas.
                          </p>
                        </>
                      ) : esRecordNuevo ? (
                        <>
                          <h3 className="text-2xl font-black text-yellow-400 mb-2">
                            ¡SUPERASTE TU RÉCORD!
                          </h3>
                          <p className="text-lg text-white">
                            Antes tu mejor era {racha.record_personal} {racha.record_personal === 1 ? 'día' : 'días'}.
                            ¡Ahora vas por {racha.dias_consecutivos}! 🚀
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-2xl font-black text-white mb-2">
                            ¡SEGUÍ ASÍ, CRACK!
                          </h3>
                          <p className="text-lg text-purple-200">
                            Tu récord es de <span className="font-black text-yellow-400">{racha.record_personal}</span> días.
                            {diasParaMilestone > 0 && (
                              <span className="block mt-2 text-cyan-300">
                                Te faltan <span className="font-black">{diasParaMilestone}</span> días para {proximoMilestone} días 🎯
                              </span>
                            )}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card: Bonificaciones activas */}
                <div className="bg-gradient-to-br from-cyan-600/20 to-blue-700/20
                               backdrop-blur-xl rounded-2xl p-6
                               border-2 border-cyan-500/40">
                  <div className="flex items-center gap-3 mb-4">
                    <Star className="w-8 h-8 text-cyan-400" />
                    <h3 className="text-xl font-black text-white">BONIFICACIONES</h3>
                  </div>

                  <div className="space-y-3">
                    {/* Bonus diario base */}
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-400" />
                        <span className="text-sm font-bold text-white">Login Diario</span>
                      </div>
                      <span className="text-sm font-black text-green-400">+50 PTS</span>
                    </div>

                    {/* Bonus por racha >= 7 */}
                    {rachaFuerte && (
                      <div className="flex items-center justify-between p-3 bg-orange-500/20 rounded-xl border border-orange-500/40">
                        <div className="flex items-center gap-2">
                          <Flame className="w-5 h-5 text-orange-400" />
                          <span className="text-sm font-bold text-white">Racha de 7+ días</span>
                        </div>
                        <span className="text-sm font-black text-orange-400">+100 PTS</span>
                      </div>
                    )}

                    {/* Bonus por racha >= 30 */}
                    {rachaImparable && (
                      <div className="flex items-center justify-between p-3 bg-yellow-500/20 rounded-xl border border-yellow-500/40">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-400" />
                          <span className="text-sm font-bold text-white">Racha Imparable 30+</span>
                        </div>
                        <span className="text-sm font-black text-yellow-400">+300 PTS</span>
                      </div>
                    )}

                    {/* Bonus por récord */}
                    {esRecordNuevo && (
                      <div className="flex items-center justify-between p-3 bg-pink-500/20 rounded-xl border border-pink-500/40">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-pink-400" />
                          <span className="text-sm font-bold text-white">¡Nuevo Récord!</span>
                        </div>
                        <span className="text-sm font-black text-pink-400">+200 PTS</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer: Botón de acción */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center pb-8 px-8"
            >
              <button
                onClick={onClose}
                className="group px-12 py-5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600
                         hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700
                         text-white font-black text-2xl rounded-2xl
                         shadow-2xl hover:shadow-cyan-500/50
                         transition-all transform hover:scale-105 active:scale-95
                         border-2 border-white/20
                         relative overflow-hidden"
              >
                {/* Efecto de brillo */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                               translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                <span className="relative">¡A ENTRENAR! 💪</span>
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
