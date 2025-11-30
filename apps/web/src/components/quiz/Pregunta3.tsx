// ═══════════════════════════════════════════════════════════════════════════════
// PREGUNTA 3: INTERESES ESPECÍFICOS - SIN SCROLL, CON SUB-STEPS
// Lógica condicional: si juega videojuegos → pregunta cuáles
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizResponses, OPCIONES_QUIZ } from '@/types/courses';

interface Pregunta3Props {
  respuestas: Partial<QuizResponses>;
  setRespuestas: (respuestas: Partial<QuizResponses>) => void;
}

export default function Pregunta3({ respuestas, setRespuestas }: Pregunta3Props) {
  const leGustanVideojuegos = respuestas.actividades_tiempo_libre?.includes('videojuegos');
  const [subStep, setSubStep] = useState(1);

  // Si no le gustan videojuegos, saltar el paso de juegos
  useEffect(() => {
    if (!leGustanVideojuegos && subStep === 1) {
      setSubStep(2); // Ir directo a contenido
    }
  }, [leGustanVideojuegos, subStep]);

  const toggleJuego = (juego: string) => {
    const juegosActuales = respuestas.juegos_favoritos || [];
    const yaSeleccionado = juegosActuales.includes(juego);

    const nuevosJuegos = yaSeleccionado
      ? juegosActuales.filter((j) => j !== juego)
      : [...juegosActuales, juego];

    setRespuestas({
      ...respuestas,
      juegos_favoritos: nuevosJuegos,
    });
  };

  const toggleContenido = (contenido: string) => {
    const contenidoActual = respuestas.contenido_consume || [];
    const yaSeleccionado = contenidoActual.includes(contenido);

    const nuevoContenido = yaSeleccionado
      ? contenidoActual.filter((c) => c !== contenido)
      : [...contenidoActual, contenido];

    setRespuestas({
      ...respuestas,
      contenido_consume: nuevoContenido,
    });
  };

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait">
        {subStep === 1 && leGustanVideojuegos ? (
          // SUB-STEP 1: JUEGOS FAVORITOS (solo si juega videojuegos)
          <motion.div
            key="juegos"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                ¿Cuáles son sus juegos favoritos? 🎮
              </h2>
              <p className="text-slate-400 text-lg">Esto nos da pistas clave sobre sus intereses</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-5xl mx-auto w-full">
              {OPCIONES_QUIZ.juegos_favoritos.map((opcion) => {
                const isSelected = respuestas.juegos_favoritos?.includes(opcion.value);

                return (
                  <motion.button
                    key={opcion.value}
                    onClick={() => toggleJuego(opcion.value)}
                    className={`
                      px-4 py-6 rounded-xl font-semibold text-center transition-all
                      border-2 flex flex-col items-center gap-2
                      ${
                        isSelected
                          ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400 shadow-lg'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-4xl">{opcion.emoji}</span>
                    <span className="text-sm text-white leading-tight">{opcion.label}</span>
                    {isSelected && <span className="text-xl text-purple-400">✓</span>}
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-6 text-center">
              {respuestas.juegos_favoritos && respuestas.juegos_favoritos.length > 0 ? (
                <>
                  <p className="text-slate-400 text-sm mb-3">
                    {respuestas.juegos_favoritos.length} seleccionados
                  </p>
                  <button
                    onClick={() => setSubStep(2)}
                    className="px-6 py-2 bg-purple-500/20 border border-purple-400 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-all"
                  >
                    Continuar →
                  </button>
                </>
              ) : (
                <p className="text-slate-500 text-sm">Seleccioná al menos uno</p>
              )}
            </div>
          </motion.div>
        ) : subStep === 2 ? (
          // SUB-STEP 2: CONTENIDO QUE CONSUME
          <motion.div
            key="contenido"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                ¿Qué videos mira en YouTube/TikTok?
              </h2>
              <p className="text-slate-400 text-lg">Nos ayuda a entender sus intereses</p>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-w-5xl mx-auto w-full">
              {OPCIONES_QUIZ.contenido_consume.map((opcion) => {
                const isSelected = respuestas.contenido_consume?.includes(opcion.value);

                return (
                  <motion.button
                    key={opcion.value}
                    onClick={() => toggleContenido(opcion.value)}
                    className={`
                      px-4 py-5 rounded-xl font-semibold text-center transition-all
                      border-2 flex flex-col items-center gap-2
                      ${
                        isSelected
                          ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-400 shadow-lg'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-3xl">{opcion.emoji}</span>
                    <span className="text-xs text-white leading-tight">{opcion.label}</span>
                    {isSelected && <span className="text-lg text-emerald-400">✓</span>}
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-center gap-4">
              {leGustanVideojuegos && (
                <button
                  onClick={() => setSubStep(1)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-all"
                >
                  ← Volver
                </button>
              )}
              {respuestas.contenido_consume && respuestas.contenido_consume.length > 0 ? (
                <>
                  <span className="text-slate-400 text-sm">
                    {respuestas.contenido_consume.length} seleccionados
                  </span>
                  <button
                    onClick={() => setSubStep(3)}
                    className="px-6 py-2 bg-emerald-500/20 border border-emerald-400 rounded-lg text-emerald-400 hover:bg-emerald-500/30 transition-all"
                  >
                    Continuar →
                  </button>
                </>
              ) : (
                <p className="text-slate-500 text-sm">Seleccioná al menos uno</p>
              )}
            </div>
          </motion.div>
        ) : (
          // SUB-STEP 3: ESTILO CREATIVO
          <motion.div
            key="estilo"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Cuando crea algo, ¿cómo lo hace?
              </h2>
              <p className="text-slate-400 text-lg">En Minecraft, dibujos, Legos, etc.</p>
            </div>

            <div className="grid gap-4 max-w-4xl mx-auto w-full">
              {OPCIONES_QUIZ.estilo_creativo.map((opcion) => {
                const isSelected = respuestas.estilo_creativo === opcion.value;

                return (
                  <motion.button
                    key={opcion.value}
                    onClick={() => {
                      setRespuestas({
                        ...respuestas,
                        estilo_creativo: opcion.value,
                      });
                    }}
                    className={`
                      px-8 py-6 rounded-2xl font-semibold text-left transition-all
                      border-2 flex items-center gap-4
                      ${
                        isSelected
                          ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400 scale-[1.02]'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
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
                    {isSelected && <span className="text-3xl text-yellow-400">✓</span>}
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
