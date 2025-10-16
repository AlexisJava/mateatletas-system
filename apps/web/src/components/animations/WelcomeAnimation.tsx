'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

/**
 * Welcome Animation Component
 *
 * Animación de bienvenida personalizada que se muestra cuando el estudiante
 * ingresa al dashboard por primera vez en la sesión.
 *
 * Features:
 * - Saludo personalizado con nombre del estudiante
 * - Muestra nivel actual con icono
 * - Efecto de confetti
 * - Se muestra solo una vez por sesión
 * - Animación smooth con framer-motion
 *
 * Props:
 * - studentName: string - Nombre del estudiante
 * - nivel: { nombre: string, icono: string, color: string } - Info del nivel
 * - onComplete: () => void - Callback cuando termina la animación
 */

interface WelcomeAnimationProps {
  studentName: string;
  nivel: {
    nombre: string;
    icono: string;
    color: string;
    nivelActual: number;
  };
  onComplete: () => void;
}

export function WelcomeAnimation({ studentName, nivel, onComplete }: WelcomeAnimationProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Lanzar confetti al aparecer
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#4169E1', '#32CD32'],
      });
    }, 500);

    // Ocultar después de 3.5 segundos
    const hideTimer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500); // Esperar a que termine la animación de salida
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [onComplete]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: 'spring',
              duration: 0.8,
              bounce: 0.4,
            }}
            className="text-center"
          >
            {/* Emoji de saludo animado */}
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
              transition={{
                duration: 1,
                delay: 0.5,
                repeat: 2,
              }}
              className="text-8xl mb-6"
            >
              👋
            </motion.div>

            {/* Saludo personalizado */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl font-bold text-white mb-4"
              style={{ textShadow: '4px 4px 0 #000' }}
            >
              {getGreeting()}, {studentName}!
            </motion.h1>

            {/* Nivel badge animado */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl"
              style={{
                background: nivel.color,
                border: '5px solid #000',
                boxShadow: '8px 8px 0 0 rgba(0, 0, 0, 1)',
              }}
            >
              <span className="text-5xl">{nivel.icono}</span>
              <div className="text-left">
                <div
                  className="text-sm font-bold text-white"
                  style={{ textShadow: '1px 1px 0 #000' }}
                >
                  NIVEL {nivel.nivelActual}
                </div>
                <div
                  className="text-2xl font-bold text-white"
                  style={{ textShadow: '2px 2px 0 #000' }}
                >
                  {nivel.nombre}
                </div>
              </div>
            </motion.div>

            {/* Mensaje motivacional */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-2xl text-white/90 mt-8 font-semibold"
              style={{ textShadow: '2px 2px 0 rgba(0, 0, 0, 0.5)' }}
            >
              ¡Listo para conquistar las matemáticas! 🚀
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
