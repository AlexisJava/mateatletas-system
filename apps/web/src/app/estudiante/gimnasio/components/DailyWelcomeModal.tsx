'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Award } from 'lucide-react';
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
  '¡BIENVENIDO DE VUELTA, CAMPEÓN!',
  '¡EL GUERRERO HA REGRESADO!',
  '¡LISTO PARA CONQUISTAR EL DÍA!',
  '¡HORA DE BRILLAR, ESTRELLA!',
  '¡PREPÁRATE PARA VENCER!',
  '¡EL HÉROE MATEMÁTICO ESTÁ AQUÍ!',
  '¡IMPARABLE COMO SIEMPRE!',
  '¡TU RACHA ES INCREÍBLE!',
];

export function DailyWelcomeModal({
  estudiante,
  racha,
  onClose,
}: DailyWelcomeModalProps) {
  const [saludoEpico] = useState(() =>
    SALUDOS_EPICOS[Math.floor(Math.random() * SALUDOS_EPICOS.length)]
  );

  const esPrimerDia = racha.dias_consecutivos === 1;
  const esRecordNuevo = racha.dias_consecutivos > racha.record_personal;

  // Cerrar automáticamente después de 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* Backdrop oscuro */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal centrado */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative w-full max-w-2xl mx-4"
        >
          {/* Card principal */}
          <div className="bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-cyan-900/90
                          backdrop-blur-xl rounded-3xl border-4 border-white/30
                          p-8 shadow-2xl">

            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full
                         bg-white/10 hover:bg-white/20
                         flex items-center justify-center
                         transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Saludo épico */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 10 }}
              className="text-center mb-6"
            >
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2
                           font-[family-name:var(--font-lilita)]
                           drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                {saludoEpico}
              </h1>
              <p className="text-2xl font-bold text-cyan-300">
                {estudiante.nombre} {estudiante.apellido}
              </p>
            </motion.div>

            {/* Racha del día - GRANDE */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: 'spring', damping: 15 }}
              className="flex flex-col items-center justify-center gap-4 mb-6"
            >
              {/* Llama animada */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Flame className="w-24 h-24 text-orange-500 drop-shadow-[0_0_30px_rgba(255,100,0,0.8)]" />
              </motion.div>

              {/* Número de racha */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring', damping: 10 }}
                  className="text-8xl font-black text-white mb-2
                           drop-shadow-[0_0_30px_rgba(255,165,0,0.8)]"
                >
                  {racha.dias_consecutivos}
                </motion.div>
                <p className="text-2xl font-black text-orange-300">
                  {racha.dias_consecutivos === 1 ? 'DÍA' : 'DÍAS'} DE RACHA
                </p>
              </div>
            </motion.div>

            {/* Mensaje motivacional */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center space-y-3"
            >
              {esPrimerDia ? (
                <>
                  <p className="text-xl font-bold text-white">
                    🎉 ¡Comenzaste una nueva racha!
                  </p>
                  <p className="text-lg text-cyan-300">
                    ¡Cada día cuenta! Sigue así para desbloquear recompensas.
                  </p>
                </>
              ) : esRecordNuevo ? (
                <>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Award className="w-8 h-8 text-yellow-400" />
                    <p className="text-2xl font-black text-yellow-400">
                      ¡NUEVO RÉCORD PERSONAL!
                    </p>
                    <Award className="w-8 h-8 text-yellow-400" />
                  </div>
                  <p className="text-lg text-white">
                    Superaste tu mejor racha de {racha.record_personal} {racha.record_personal === 1 ? 'día' : 'días'}
                  </p>
                  <p className="text-lg text-cyan-300">
                    ¡Eres imparable! 🚀
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold text-white">
                    ¡Mantén el ritmo! 💪
                  </p>
                  <p className="text-lg text-cyan-300">
                    Tu récord es de {racha.record_personal} {racha.record_personal === 1 ? 'día' : 'días'}.
                    {racha.dias_consecutivos >= 7 && ' ¡Vas por buen camino!'}
                  </p>
                </>
              )}

              {/* Bonificación por racha */}
              {racha.dias_consecutivos >= 7 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: 'spring' }}
                  className="mt-4 p-4 bg-yellow-500/20 border-2 border-yellow-400/50 rounded-2xl"
                >
                  <p className="text-lg font-black text-yellow-300">
                    🎁 BONUS POR RACHA DE 7+ DÍAS: +100 PUNTOS
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Botón de cierre (opcional) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex justify-center mt-6"
            >
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600
                         hover:from-cyan-600 hover:to-blue-700
                         text-white font-black text-lg rounded-full
                         shadow-lg hover:shadow-xl
                         transition-all transform hover:scale-105"
              >
                ¡VAMOS A ESTUDIAR!
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
