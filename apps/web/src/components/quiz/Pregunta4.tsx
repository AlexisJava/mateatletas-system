// ═══════════════════════════════════════════════════════════════════════════════
// PREGUNTA 4: EXPERIENCIA Y HABILIDADES - SIN SCROLL, CON SUB-STEPS
// Programación → Matemática → Desafíos
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizResponses, OPCIONES_QUIZ } from '@/types/courses';

interface Pregunta4Props {
  respuestas: Partial<QuizResponses>;
  setRespuestas: (respuestas: Partial<QuizResponses>) => void;
}

export default function Pregunta4({ respuestas, setRespuestas }: Pregunta4Props) {
  const [subStep, setSubStep] = useState(1);

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait">
        {subStep === 1 ? (
          // SUB-STEP 1: NIVEL PROGRAMACIÓN
          <motion.div
            key="programacion"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                ¿Ha programado o usado código antes?
              </h2>
              <p className="text-slate-400 text-lg">Esto nos ayuda a elegir el nivel adecuado</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto w-full">
              {OPCIONES_QUIZ.nivel_programacion.map((opcion) => {
                const isSelected = respuestas.nivel_programacion === opcion.value;

                return (
                  <motion.button
                    key={opcion.value}
                    onClick={() => {
                      setRespuestas({
                        ...respuestas,
                        nivel_programacion: opcion.value as any,
                      });
                      setTimeout(() => setSubStep(2), 300);
                    }}
                    className={`
                      px-8 py-6 rounded-2xl font-semibold transition-all
                      border-2 flex items-center gap-4
                      ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400 scale-[1.02]'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }
                    `}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-5xl">{opcion.emoji}</span>
                    <span className="text-white text-lg flex-1 text-left">{opcion.label}</span>
                    {isSelected && <span className="text-3xl text-cyan-400">→</span>}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : subStep === 2 ? (
          // SUB-STEP 2: NIVEL MATEMÁTICA
          <motion.div
            key="matematica"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                ¿Cómo le va en matemáticas en la escuela?
              </h2>
              <p className="text-slate-400 text-lg">Solo queremos saber el punto de partida</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto w-full">
              {OPCIONES_QUIZ.nivel_mate_escuela.map((opcion) => {
                const isSelected = respuestas.nivel_mate_escuela === opcion.value;

                return (
                  <motion.button
                    key={opcion.value}
                    onClick={() => {
                      setRespuestas({
                        ...respuestas,
                        nivel_mate_escuela: opcion.value as any,
                      });
                      setTimeout(() => setSubStep(3), 300);
                    }}
                    className={`
                      px-8 py-6 rounded-2xl font-semibold transition-all
                      border-2 flex items-center gap-4
                      ${
                        isSelected
                          ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400 scale-[1.02]'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }
                    `}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-5xl">{opcion.emoji}</span>
                    <span className="text-white text-lg flex-1 text-left">{opcion.label}</span>
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
          // SUB-STEP 3: DISFRUTA DESAFÍOS
          <motion.div
            key="desafios"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                ¿Le gustan los desafíos matemáticos o lógicos?
              </h2>
              <p className="text-slate-400 text-lg">Acertijos, puzzles, problemas para pensar</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto w-full">
              {OPCIONES_QUIZ.disfruta_desafios.map((opcion) => {
                const isSelected = respuestas.disfruta_desafios === opcion.value;

                return (
                  <motion.button
                    key={opcion.value}
                    onClick={() => {
                      setRespuestas({
                        ...respuestas,
                        disfruta_desafios: opcion.value as any,
                      });
                    }}
                    className={`
                      px-8 py-6 rounded-2xl font-semibold transition-all
                      border-2 flex items-center gap-4
                      ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400 scale-[1.02]'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }
                    `}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-5xl">{opcion.emoji}</span>
                    <span className="text-white text-lg flex-1 text-left">{opcion.label}</span>
                    {isSelected && <span className="text-3xl text-purple-400">✓</span>}
                  </motion.button>
                );
              })}
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
