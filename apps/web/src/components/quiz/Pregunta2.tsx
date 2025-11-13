// ═══════════════════════════════════════════════════════════════════════════════
// PREGUNTA 2: PERSONALIDAD Y ACTIVIDADES - CON SUB-STEPS
// Sin scroll, cada sub-pregunta ocupa toda la pantalla
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizResponses, OPCIONES_QUIZ } from '@/types/courses';

interface Pregunta2Props {
  respuestas: Partial<QuizResponses>;
  setRespuestas: (respuestas: Partial<QuizResponses>) => void;
}

export default function Pregunta2({ respuestas, setRespuestas }: Pregunta2Props) {
  const [subStep, setSubStep] = useState(1);

  const toggleActividad = (actividad: string) => {
    const actividadesActuales = respuestas.actividades_tiempo_libre || [];
    const yaSeleccionado = actividadesActuales.includes(actividad);

    const nuevasActividades = yaSeleccionado
      ? actividadesActuales.filter(a => a !== actividad)
      : [...actividadesActuales, actividad];

    setRespuestas({
      ...respuestas,
      actividades_tiempo_libre: nuevasActividades
    });
  };

  const handlePersonalidadNext = () => {
    if (respuestas.personalidad_problema) {
      setSubStep(2);
    }
  };

  const handleActividadesBack = () => {
    setSubStep(1);
  };

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait">
        {subStep === 1 ? (
          // SUB-STEP 1: PERSONALIDAD
          <motion.div
            key="personalidad"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                ¿Cómo reacciona cuando enfrenta un problema difícil?
              </h2>
              <p className="text-slate-400 text-lg">
                Seleccioná la opción que más se acerque
              </p>
            </div>

            <div className="grid gap-4 max-w-4xl mx-auto w-full">
              {OPCIONES_QUIZ.personalidad_problema.map((opcion) => {
                const isSelected = respuestas.personalidad_problema === opcion.value;

                return (
                  <motion.button
                    key={opcion.value}
                    onClick={() => {
                      setRespuestas({
                        ...respuestas,
                        personalidad_problema: opcion.value as any
                      });
                      // Auto-avanzar después de 300ms
                      setTimeout(() => handlePersonalidadNext(), 300);
                    }}
                    className={`
                      px-8 py-6 rounded-2xl font-semibold text-left transition-all duration-200
                      border-2 flex items-center gap-4
                      ${isSelected
                        ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 border-cyan-400 scale-[1.02]'
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                      }
                    `}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-5xl">{opcion.emoji}</span>
                    <div className="flex-1">
                      <p className="text-white text-lg mb-1">{opcion.label}</p>
                      <p className="text-slate-400 text-sm">{opcion.descripcion}</p>
                    </div>
                    {isSelected && <span className="text-3xl text-cyan-400">→</span>}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          // SUB-STEP 2: ACTIVIDADES
          <motion.div
            key="actividades"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                ¿Qué le gusta hacer en su tiempo libre?
              </h2>
              <p className="text-slate-400 text-lg flex items-center justify-center gap-2">
                Seleccioná todo lo que aplique <span className="text-cyan-400">✨</span>
              </p>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-3 gap-3 max-w-5xl mx-auto w-full">
              {OPCIONES_QUIZ.actividades_tiempo_libre.map((opcion) => {
                const isSelected = respuestas.actividades_tiempo_libre?.includes(opcion.value);

                return (
                  <motion.button
                    key={opcion.value}
                    onClick={() => toggleActividad(opcion.value)}
                    className={`
                      px-4 py-6 rounded-xl font-semibold text-center transition-all
                      border-2 flex flex-col items-center gap-2
                      ${isSelected
                        ? 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-emerald-400 shadow-lg'
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-4xl">{opcion.emoji}</span>
                    <span className="text-sm text-white leading-tight">{opcion.label}</span>
                    {isSelected && <span className="text-xl text-emerald-400">✓</span>}
                  </motion.button>
                );
              })}
            </div>

            {/* Contador + botón volver */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={handleActividadesBack}
                className="px-4 py-2 text-slate-400 hover:text-white transition-all"
              >
                ← Volver
              </button>
              {respuestas.actividades_tiempo_libre && respuestas.actividades_tiempo_libre.length > 0 && (
                <div className="text-slate-400 text-sm">
                  {respuestas.actividades_tiempo_libre.length} seleccionadas
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
