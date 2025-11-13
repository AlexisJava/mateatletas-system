// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL DEL QUIZ
// Sistema de 5 pasos con animaciones y validación
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizResponses } from '@/types/courses';
import Pregunta1 from './Pregunta1';
import Pregunta2 from './Pregunta2';
import Pregunta3 from './Pregunta3';
import Pregunta4 from './Pregunta4';
import Pregunta5 from './Pregunta5';

interface QuizAsincronicoProps {
  onComplete: (respuestas: QuizResponses) => void;
}

const TOTAL_STEPS = 5;
const STORAGE_KEY = 'mateatletas-quiz-progress';

export default function QuizAsincronico({ onComplete }: QuizAsincronicoProps) {
  const [step, setStep] = useState(1);
  const [respuestas, setRespuestas] = useState<Partial<QuizResponses>>({
    actividades_tiempo_libre: [],
    juegos_favoritos: [],
    contenido_consume: []
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PERSISTENCIA EN LOCALSTORAGE
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRespuestas(parsed.respuestas || { interes_principal: [], objetivo: [] });
        setStep(parsed.step || 1);
      } catch (e) {
        console.error('Error al cargar quiz guardado:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ respuestas, step }));
  }, [respuestas, step]);

  // ═══════════════════════════════════════════════════════════════════════════
  // VALIDACIÓN POR PASO
  // ═══════════════════════════════════════════════════════════════════════════
  const canAdvance = (): boolean => {
    switch (step) {
      case 1:
        // Paso 1: Datos básicos
        return !!(respuestas.nombre_estudiante?.trim() && respuestas.edad);
      case 2:
        // Paso 2: Personalidad + Actividades tiempo libre (al menos 1)
        return !!(
          respuestas.personalidad_problema &&
          respuestas.actividades_tiempo_libre &&
          respuestas.actividades_tiempo_libre.length > 0
        );
      case 3:
        // Paso 3: Intereses específicos - condicional según actividades
        // Si seleccionó videojuegos, debe elegir al menos 1 juego
        // Contenido que consume (al menos 1)
        // Estilo creativo
        const needsJuegos = respuestas.actividades_tiempo_libre?.includes('videojuegos');
        const hasJuegos = respuestas.juegos_favoritos && respuestas.juegos_favoritos.length > 0;

        return !!(
          (needsJuegos ? hasJuegos : true) &&
          respuestas.contenido_consume && respuestas.contenido_consume.length > 0 &&
          respuestas.estilo_creativo
        );
      case 4:
        // Paso 4: Experiencia y habilidades
        return !!(
          respuestas.nivel_programacion &&
          respuestas.nivel_mate_escuela &&
          respuestas.disfruta_desafios
        );
      case 5:
        // Paso 5: Objetivos y motivación
        return !!(
          respuestas.objetivo_principal &&
          respuestas.nivel_motivacion &&
          respuestas.tiempo_disponible
        );
      default:
        return false;
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════
  const handleNext = () => {
    if (canAdvance() && step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    if (!canAdvance()) return;

    // Limpiar localStorage
    localStorage.removeItem(STORAGE_KEY);

    // Callback con respuestas completas
    onComplete(respuestas as QuizResponses);
  };

  // Manejar Enter key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && canAdvance()) {
        if (step < TOTAL_STEPS) {
          handleNext();
        } else {
          handleComplete();
        }
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [step, respuestas]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ANIMACIONES
  // ═══════════════════════════════════════════════════════════════════════════
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -20,
    }
  };

  const pageTransition = {
    duration: 0.3,
    ease: 'easeOut'
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05)_0%,transparent_50%)] bg-[length:100px_100px] pointer-events-none" />

      <div className="w-full max-w-3xl relative z-10">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-400 text-sm font-medium">
              Paso {step} de {TOTAL_STEPS}
            </span>
            <span className="text-slate-400 text-sm font-medium">
              {Math.round((step / TOTAL_STEPS) * 100)}% completado
            </span>
          </div>
          <div className="h-2.5 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/50">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              transition={{
                duration: 0.5,
                ease: 'easeInOut'
              }}
            />
          </div>
        </div>

        {/* Pregunta actual con AnimatePresence */}
        <motion.div
          className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-8 md:p-12 shadow-2xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              {step === 1 && <Pregunta1 respuestas={respuestas} setRespuestas={setRespuestas} />}
              {step === 2 && <Pregunta2 respuestas={respuestas} setRespuestas={setRespuestas} />}
              {step === 3 && <Pregunta3 respuestas={respuestas} setRespuestas={setRespuestas} />}
              {step === 4 && <Pregunta4 respuestas={respuestas} setRespuestas={setRespuestas} />}
              {step === 5 && <Pregunta5 respuestas={respuestas} setRespuestas={setRespuestas} />}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Botones de navegación */}
        <div className="flex justify-between items-center mt-6 gap-4">
          {/* Botón Anterior */}
          {step > 1 ? (
            <motion.button
              onClick={handlePrev}
              className="px-6 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-all border border-slate-700 font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ← Anterior
            </motion.button>
          ) : (
            <div /> // Spacer
          )}

          {/* Botón Siguiente o Completar */}
          {step < TOTAL_STEPS ? (
            <motion.button
              onClick={handleNext}
              disabled={!canAdvance()}
              className={`
                px-8 py-3 rounded-xl font-semibold transition-all
                ${canAdvance()
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700'
                }
              `}
              whileHover={canAdvance() ? { scale: 1.02 } : {}}
              whileTap={canAdvance() ? { scale: 0.98 } : {}}
            >
              Siguiente →
            </motion.button>
          ) : (
            <motion.button
              onClick={handleComplete}
              disabled={!canAdvance()}
              className={`
                px-10 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-2
                ${canAdvance()
                  ? 'bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 hover:from-emerald-400 hover:via-cyan-400 hover:to-purple-400 text-white shadow-2xl shadow-cyan-500/40'
                  : 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700'
                }
              `}
              whileHover={canAdvance() ? { scale: 1.05, boxShadow: '0 25px 50px -12px rgba(6, 182, 212, 0.5)' } : {}}
              whileTap={canAdvance() ? { scale: 0.98 } : {}}
            >
              Ver Mi Ruta Perfecta
              <span className="text-2xl">🚀</span>
            </motion.button>
          )}
        </div>

        {/* Hint de navegación con teclado */}
        {canAdvance() && (
          <motion.div
            className="text-center mt-4 text-sm text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Presioná <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-slate-400">Enter</kbd> para continuar
          </motion.div>
        )}
      </div>
    </div>
  );
}
