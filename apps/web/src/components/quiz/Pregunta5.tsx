// ═══════════════════════════════════════════════════════════════════════════════
// PREGUNTA 5: MOTIVACIÓN Y OBJETIVOS - LA MÁS IMPORTANTE - SIN SCROLL
// Objetivo → Motivación → Tiempo + Email opcional
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizResponses, OPCIONES_QUIZ } from '@/types/courses';

interface Pregunta5Props {
  respuestas: Partial<QuizResponses>;
  setRespuestas: (respuestas: Partial<QuizResponses>) => void;
}

export default function Pregunta5({ respuestas, setRespuestas }: Pregunta5Props) {
  const [subStep, setSubStep] = useState(1);

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait">
        {subStep === 1 ? (
          // SUB-STEP 1: OBJETIVO PRINCIPAL
          <motion.div
            key="objetivo"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                ¡Última pregunta! ¿Qué quiere lograr?
              </h2>
              <p className="text-slate-400 text-lg">
                Esta es la <span className="text-yellow-400 font-semibold">más importante</span>{' '}
                para recomendar el curso perfecto
              </p>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-3 gap-3 max-w-5xl mx-auto w-full">
              {OPCIONES_QUIZ.objetivo_principal.map((opcion) => {
                const isSelected = respuestas.objetivo_principal === opcion.value;

                return (
                  <motion.button
                    key={opcion.value}
                    onClick={() => {
                      setRespuestas({
                        ...respuestas,
                        objetivo_principal: opcion.value,
                      });
                      setTimeout(() => setSubStep(2), 300);
                    }}
                    className={`
                      px-4 py-5 rounded-2xl font-semibold transition-all duration-200
                      border-2 flex flex-col items-center gap-2 text-center
                      ${
                        isSelected
                          ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400 text-white shadow-2xl shadow-yellow-500/30 scale-[1.05]'
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600 hover:text-white'
                      }
                    `}
                    whileHover={{ scale: isSelected ? 1.05 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-4xl">{opcion.emoji}</span>
                    <span className="text-sm leading-tight">{opcion.label}</span>
                    {isSelected && <span className="text-2xl text-yellow-400">→</span>}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : subStep === 2 ? (
          // SUB-STEP 2: NIVEL DE MOTIVACIÓN
          <motion.div
            key="motivacion"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                ¿Qué tan motivado/a está?
              </h2>
              <p className="text-slate-400 text-lg">
                Esto nos ayuda a saber el{' '}
                <span className="text-emerald-400 font-semibold">ritmo ideal</span>
              </p>
            </div>

            <div className="space-y-3 max-w-4xl mx-auto w-full">
              {OPCIONES_QUIZ.nivel_motivacion.map((opcion) => {
                const isSelected = respuestas.nivel_motivacion === opcion.value;

                return (
                  <motion.button
                    key={opcion.value}
                    onClick={() => {
                      setRespuestas({
                        ...respuestas,
                        nivel_motivacion: opcion.value as any,
                      });
                      setTimeout(() => setSubStep(3), 300);
                    }}
                    className={`
                      w-full px-6 py-5 rounded-2xl font-semibold text-left transition-all duration-200
                      border-2 flex items-center gap-4
                      ${
                        isSelected
                          ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-400 text-white shadow-xl shadow-emerald-500/20 scale-[1.02]'
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600 hover:text-white'
                      }
                    `}
                    whileHover={{ scale: isSelected ? 1.02 : 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-4xl flex-shrink-0">{opcion.emoji}</span>
                    <div className="flex-1">
                      <span className="text-lg">{opcion.label}</span>
                    </div>
                    {isSelected && <span className="text-3xl text-emerald-400">→</span>}
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setSubStep(1)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-all"
              >
                ← Volver
              </button>
            </div>
          </motion.div>
        ) : (
          // SUB-STEP 3: TIEMPO DISPONIBLE + EMAIL OPCIONAL
          <motion.div
            key="tiempo"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                ¿Cuánto tiempo puede dedicar por semana?
              </h2>
              <p className="text-slate-400 text-lg">
                Para que el ritmo sea{' '}
                <span className="text-purple-400 font-semibold">sostenible</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto w-full mb-6">
              {OPCIONES_QUIZ.tiempos.map((opcion) => {
                const isSelected = respuestas.tiempo_disponible === opcion.value;

                return (
                  <motion.button
                    key={opcion.value}
                    onClick={() =>
                      setRespuestas({
                        ...respuestas,
                        tiempo_disponible: opcion.value as any,
                      })
                    }
                    className={`
                      px-6 py-6 rounded-2xl font-semibold transition-all duration-200
                      border-2 flex flex-col items-center gap-3
                      ${
                        isSelected
                          ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400 text-white shadow-xl shadow-purple-500/20 scale-[1.05]'
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600 hover:text-white'
                      }
                    `}
                    whileHover={{ scale: isSelected ? 1.05 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-4xl">{opcion.emoji}</span>
                    <span className="text-lg">{opcion.label}</span>
                    {isSelected && <span className="text-2xl text-purple-400">✓</span>}
                  </motion.button>
                );
              })}
            </div>

            {/* EMAIL OPCIONAL - Compacto */}
            <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 max-w-3xl mx-auto w-full">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📧</span>
                <h3 className="text-base font-bold text-white">
                  ¿Querés recibir la ruta por email? (Opcional)
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <input
                  type="email"
                  value={respuestas.parent_email || ''}
                  onChange={(e) =>
                    setRespuestas({
                      ...respuestas,
                      parent_email: e.target.value,
                    })
                  }
                  placeholder="Tu email"
                  className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm"
                />
                <input
                  type="text"
                  value={respuestas.parent_name || ''}
                  onChange={(e) =>
                    setRespuestas({
                      ...respuestas,
                      parent_name: e.target.value,
                    })
                  }
                  placeholder="Tu nombre"
                  className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <p className="text-slate-500 text-xs mt-2 flex items-center gap-1">
                <span>🔒</span> No compartimos tu información con terceros
              </p>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setSubStep(2)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-all"
              >
                ← Volver
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
