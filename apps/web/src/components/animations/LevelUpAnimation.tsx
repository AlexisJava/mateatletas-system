'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

/**
 * Level Up Animation Component
 *
 * Animación explosiva que se muestra cuando el estudiante sube de nivel.
 *
 * Features:
 * - Explosión de confetti multi-color
 * - Animación de escala y brillo
 * - Muestra nivel anterior y nuevo
 * - Mensaje de felicitación personalizado
 * - Auto-cierre después de 4 segundos
 *
 * Props:
 * - nivelAnterior: { numero: number, nombre: string, icono: string }
 * - nivelNuevo: { numero: number, nombre: string, icono: string, color: string }
 * - onComplete: () => void - Callback cuando termina la animación
 */

interface LevelUpAnimationProps {
  nivelAnterior: {
    numero: number;
    nombre: string;
    icono: string;
  };
  nivelNuevo: {
    numero: number;
    nombre: string;
    icono: string;
    color: string;
  };
  onComplete: () => void;
}

export function LevelUpAnimation({
  nivelAnterior,
  nivelNuevo,
  onComplete,
}: LevelUpAnimationProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Explosión inicial de confetti
    const timer1 = setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#00CED1', '#32CD32'],
      });
    }, 300);

    // Segunda explosión
    const timer2 = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { x: 0.3, y: 0.6 },
        colors: [nivelNuevo.color, '#FFD700', '#FFA500'],
      });
    }, 600);

    // Tercera explosión
    const timer3 = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { x: 0.7, y: 0.6 },
        colors: [nivelNuevo.color, '#FFD700', '#FFA500'],
      });
    }, 900);

    // Confetti de estrellas
    const timer4 = setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 360,
        ticks: 200,
        origin: { y: 0.5 },
        shapes: ['star'],
        colors: ['#FFD700', '#FFA500', nivelNuevo.color],
      });
    }, 1200);

    // Ocultar después de 4 segundos
    const hideTimer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500);
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(hideTimer);
    };
  }, [nivelNuevo, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-lg"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.95) 100%)',
          }}
        >
          <div className="text-center">
            {/* ¡NIVEL SUBIDO! Text */}
            <motion.h1
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                duration: 0.8,
                bounce: 0.5,
              }}
              className="text-7xl font-black text-transparent bg-clip-text mb-8"
              style={{
                backgroundImage: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6347 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(255, 215, 0, 0.5)',
              }}
            >
              ¡NIVEL SUBIDO!
            </motion.h1>

            {/* Transición de niveles */}
            <div className="flex items-center justify-center gap-8 mb-8">
              {/* Nivel Anterior */}
              <motion.div
                initial={{ x: 0, opacity: 1 }}
                animate={{ x: -50, opacity: 0.3, scale: 0.8 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div
                  className="rounded-2xl px-6 py-4 text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '4px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <div className="text-5xl mb-2">{nivelAnterior.icono}</div>
                  <div className="text-white/50 text-sm font-bold">NIVEL {nivelAnterior.numero}</div>
                  <div className="text-white/50 text-lg font-bold">{nivelAnterior.nombre}</div>
                </div>
              </motion.div>

              {/* Flecha */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="text-6xl"
              >
                →
              </motion.div>

              {/* Nivel Nuevo - ANIMACIÓN EXPLOSIVA */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: [0, 1.3, 1],
                  rotate: [- 180, 10, -10, 0],
                }}
                transition={{
                  delay: 1,
                  duration: 0.8,
                  type: 'spring',
                  bounce: 0.6,
                }}
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      `0 0 20px ${nivelNuevo.color}`,
                      `0 0 60px ${nivelNuevo.color}`,
                      `0 0 20px ${nivelNuevo.color}`,
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="rounded-2xl px-8 py-6 text-center relative"
                  style={{
                    background: nivelNuevo.color,
                    border: '6px solid #000',
                    boxShadow: `0 0 40px ${nivelNuevo.color}, 12px 12px 0 0 rgba(0, 0, 0, 1)`,
                  }}
                >
                  {/* Estrellitas flotantes */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        rotate: [0, 360],
                        x: [0, (i % 2 ? 1 : -1) * (30 + i * 10)],
                        y: [0, -40 - i * 10],
                      }}
                      transition={{
                        delay: 1.2 + i * 0.1,
                        duration: 1.5,
                        ease: 'easeOut',
                      }}
                      className="absolute top-1/2 left-1/2 text-2xl"
                    >
                      ⭐
                    </motion.div>
                  ))}

                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="text-7xl mb-3"
                  >
                    {nivelNuevo.icono}
                  </motion.div>
                  <div
                    className="text-white text-sm font-bold mb-1"
                    style={{ textShadow: '2px 2px 0 #000' }}
                  >
                    NIVEL {nivelNuevo.numero}
                  </div>
                  <div
                    className="text-white text-3xl font-black"
                    style={{ textShadow: '3px 3px 0 #000' }}
                  >
                    {nivelNuevo.nombre}
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Mensaje de felicitación */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              <p className="text-3xl font-bold text-white mb-2">
                ¡FELICITACIONES!
              </p>
              <p className="text-xl text-white/80">
                Seguí así y alcanzarás la cima 🚀
              </p>
            </motion.div>

            {/* Barra de progreso de cierre */}
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 4, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-2"
              style={{
                background: `linear-gradient(90deg, ${nivelNuevo.color} 0%, #FFD700 100%)`,
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
