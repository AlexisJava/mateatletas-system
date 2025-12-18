'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SlideSimulacion } from '@/data/quimica/types';

interface SimulacionExperimentoProps {
  slide: SlideSimulacion;
  onComplete: () => void;
}

type Fase = 'vacio' | 'liquido' | 'esperando' | 'agregando-polvo' | 'reaccionando' | 'finalizado';

export default function SimulacionExperimento({ slide, onComplete }: SimulacionExperimentoProps) {
  // Obtener las dos categorías de opciones (nombres genéricos)
  const opcionesKeys = Object.keys(slide.opciones);
  const primeraCategoria = slide.opciones[opcionesKeys[0]] || [];
  const segundaCategoria = slide.opciones[opcionesKeys[1]] || [];

  type OpcionTipo = { id: string; nombre: string; emoji: string; fuerza: number; color: string };

  const [fase, setFase] = useState<Fase>('vacio');
  const [liquidoSeleccionado, setLiquidoSeleccionado] = useState<OpcionTipo | null>(null);
  const [polvoSeleccionado, setPolvoSeleccionado] = useState<OpcionTipo | null>(null);
  const [burbujas, setBurbujas] = useState<
    { id: number; x: number; delay: number; size: number }[]
  >([]);
  const [resultado, setResultado] = useState<{ intensidad: number; altura?: number } | null>(null);

  const descripcionFase = slide.fases.find((f) => f.fase === fase)?.descripcion || '';

  // Calcular intensidad de la reacción
  const calcularIntensidad = (
    liquido: typeof liquidoSeleccionado,
    polvo: typeof polvoSeleccionado,
  ) => {
    if (!liquido || !polvo) return 0;
    // La intensidad es el producto de las fuerzas (1-9)
    const intensidad = liquido.fuerza * polvo.fuerza;
    return intensidad;
  };

  // Generar burbujas basadas en la intensidad
  useEffect(() => {
    if (fase === 'reaccionando' && liquidoSeleccionado && polvoSeleccionado) {
      const intensidad = liquidoSeleccionado.fuerza * polvoSeleccionado.fuerza;
      const cantidadBurbujas = intensidad * 5; // 5 a 45 burbujas

      const nuevasBurbujas = Array.from({ length: cantidadBurbujas }, (_, i) => ({
        id: i,
        x: Math.random() * 80 + 10, // 10-90%
        delay: Math.random() * 2,
        size: Math.random() * 20 + 10, // 10-30px
      }));

      setBurbujas(nuevasBurbujas);
      setResultado({ intensidad, altura: intensidad * 10 }); // altura en cm

      // Pasar a finalizado después de 3 segundos
      setTimeout(() => {
        setFase('finalizado');
      }, 3000);
    }
  }, [fase, liquidoSeleccionado, polvoSeleccionado]);

  const seleccionarLiquido = (liquido: OpcionTipo) => {
    if (fase === 'vacio') {
      setLiquidoSeleccionado(liquido);
      setFase('liquido');
    }
  };

  const seleccionarPolvo = (polvo: OpcionTipo) => {
    if (fase === 'liquido') {
      setPolvoSeleccionado(polvo);
      setFase('esperando');
    }
  };

  const iniciarReaccion = () => {
    if (fase === 'esperando') {
      setFase('agregando-polvo');
      setTimeout(() => {
        setFase('reaccionando');
      }, 1500);
    }
  };

  const reiniciar = () => {
    setFase('vacio');
    setLiquidoSeleccionado(null);
    setPolvoSeleccionado(null);
    setBurbujas([]);
    setResultado(null);
  };

  const obtenerMensajeResultado = () => {
    if (!resultado) return '';
    const { intensidad } = resultado;

    // Detectar si es un slide de neuroquímica (B2) basado en el título
    const esNeuroquimica =
      slide.titulo.includes('Bienestar') ||
      slide.titulo.includes('Día Químico') ||
      slide.titulo.includes('Día Perfecto') ||
      slide.titulo.includes('Experimentá');

    if (intensidad === 9) {
      return esNeuroquimica
        ? '¡INCREÍBLE! ¡Tu bienestar está al MÁXIMO! 🏆'
        : '¡INCREÍBLE! ¡La reacción MÁS PODEROSA! 🏆';
    }
    if (intensidad >= 6) {
      return esNeuroquimica
        ? '¡MUY BIEN! ¡Excelente nivel de neurotransmisores! 💪'
        : '¡MUY BIEN! ¡Una reacción fuerte! 💪';
    }
    if (intensidad >= 4) {
      return esNeuroquimica
        ? '¡Bien! Buen nivel de bienestar. 👍'
        : '¡Bien! Una reacción normal. 👍';
    }
    return esNeuroquimica
      ? 'Bajo impacto... probá actividades más intensas. 💨'
      : 'Reacción débil... probá con ingredientes más fuertes. 💨';
  };

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 overflow-hidden">
      <div className="h-full max-w-7xl mx-auto flex flex-col">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 flex-shrink-0"
        >
          <h1 className="text-4xl font-black text-white mb-2">
            {slide.emoji} {slide.titulo}
          </h1>
          <p className="text-xl text-white/90">{slide.descripcion}</p>
        </motion.div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
          {/* PANEL IZQUIERDO: Selección de ingredientes */}
          <div className="space-y-3 overflow-y-auto pr-2">
            {/* Líquidos */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border-2 border-white/20"
            >
              <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                {slide.titulo.includes('Vida Media') || slide.titulo.includes('Nuclear')
                  ? '⚛️ Isótopos Radiactivos'
                  : slide.titulo.includes('Bienestar') ||
                      slide.titulo.includes('Día Químico') ||
                      slide.titulo.includes('Día Perfecto')
                    ? '🎯 Actividades'
                    : '💧 Líquidos Ácidos'}
                {fase !== 'vacio' && liquidoSeleccionado && <span className="text-lg">✅</span>}
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {primeraCategoria.map((liquido) => (
                  <button
                    key={liquido.id}
                    onClick={() => seleccionarLiquido(liquido)}
                    disabled={fase !== 'vacio'}
                    className={`
                      relative overflow-hidden rounded-xl p-3 transition-all
                      ${
                        fase === 'vacio'
                          ? 'hover:scale-105 cursor-pointer'
                          : 'opacity-50 cursor-not-allowed'
                      }
                      ${liquidoSeleccionado?.id === liquido.id ? 'ring-4 ring-white scale-105' : ''}
                    `}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${liquido.color} opacity-80`}
                    />
                    <div className="relative flex items-center gap-3">
                      <span className="text-4xl">{liquido.emoji}</span>
                      <div className="flex-1 text-left">
                        <p className="text-lg font-bold text-gray-900">{liquido.nombre}</p>
                        <div className="flex gap-1 mt-1">
                          {Array.from({ length: 3 }, (_, i) => (
                            <div
                              key={i}
                              className={`w-6 h-1.5 rounded ${
                                i < liquido.fuerza ? 'bg-gray-900' : 'bg-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Polvos */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border-2 border-white/20"
            >
              <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                {slide.titulo.includes('Vida Media') || slide.titulo.includes('Nuclear')
                  ? '⏱️ Tiempo de Decaimiento'
                  : slide.titulo.includes('Bienestar') ||
                      slide.titulo.includes('Día Químico') ||
                      slide.titulo.includes('Día Perfecto')
                    ? '💆 Hábitos Saludables'
                    : '⚪ Polvos Base'}
                {fase !== 'vacio' && fase !== 'liquido' && polvoSeleccionado && (
                  <span className="text-lg">✅</span>
                )}
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {segundaCategoria.map((polvo) => (
                  <button
                    key={polvo.id}
                    onClick={() => seleccionarPolvo(polvo)}
                    disabled={fase !== 'liquido'}
                    className={`
                      relative overflow-hidden rounded-xl p-3 transition-all
                      ${
                        fase === 'liquido'
                          ? 'hover:scale-105 cursor-pointer'
                          : 'opacity-50 cursor-not-allowed'
                      }
                      ${polvoSeleccionado?.id === polvo.id ? 'ring-4 ring-white scale-105' : ''}
                    `}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${polvo.color} opacity-80`}
                    />
                    <div className="relative flex items-center gap-3">
                      <span className="text-4xl">{polvo.emoji}</span>
                      <div className="flex-1 text-left">
                        <p className="text-lg font-bold text-gray-900">{polvo.nombre}</p>
                        <div className="flex gap-1 mt-1">
                          {Array.from({ length: 3 }, (_, i) => (
                            <div
                              key={i}
                              className={`w-6 h-1.5 rounded ${
                                i < polvo.fuerza ? 'bg-gray-900' : 'bg-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* PANEL DERECHO: Frasco y Reacción */}
          <div className="flex flex-col space-y-3 min-h-0">
            {/* Descripción de la fase */}
            <motion.div
              key={fase}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/20 backdrop-blur-lg rounded-xl p-4 border-2 border-white/30 flex-shrink-0"
            >
              <p className="text-lg text-white font-bold text-center">{descripcionFase}</p>
            </motion.div>

            {/* Frasco con la reacción */}
            <div className="relative flex-1 bg-white/10 backdrop-blur-lg rounded-2xl border-4 border-white/30 overflow-hidden min-h-0 max-h-[400px]">
              {/* Líquido en el frasco con efecto de ondas */}
              <AnimatePresence>
                {liquidoSeleccionado && (
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{
                      y: '40%',
                      scale: fase === 'reaccionando' ? [1, 1.02, 1] : 1,
                    }}
                    transition={{
                      y: { duration: 1, ease: 'easeOut' },
                      scale: {
                        duration: 0.5,
                        repeat: fase === 'reaccionando' ? Infinity : 0,
                        repeatType: 'reverse',
                      },
                    }}
                    className="absolute inset-0"
                  >
                    <div
                      className={`h-full bg-gradient-to-br ${liquidoSeleccionado.color} opacity-60`}
                    >
                      {/* Efecto de ondas en el líquido */}
                      {(fase === 'agregando-polvo' || fase === 'reaccionando') && (
                        <>
                          <motion.div
                            animate={{
                              scale: [1, 1.5, 2],
                              opacity: [0.3, 0.2, 0],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              repeatDelay: 0.5,
                            }}
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white"
                          />
                          <motion.div
                            animate={{
                              scale: [1, 1.5, 2],
                              opacity: [0.3, 0.2, 0],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              repeatDelay: 0.5,
                              delay: 0.3,
                            }}
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white"
                          />
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Polvo cayendo con partículas */}
              <AnimatePresence>
                {fase === 'agregando-polvo' && polvoSeleccionado && (
                  <>
                    {/* Emoji del polvo */}
                    <motion.div
                      initial={{ y: -100, opacity: 0 }}
                      animate={{ y: 200, opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 1.5, ease: 'easeIn' }}
                      className="absolute left-1/2 -translate-x-1/2 z-10"
                    >
                      <span className="text-6xl">{polvoSeleccionado.emoji}</span>
                    </motion.div>

                    {/* Partículas de polvo cayendo */}
                    {Array.from({ length: 15 }, (_, i) => (
                      <motion.div
                        key={`particula-${i}`}
                        initial={{
                          y: -50,
                          x: `${50 + (Math.random() - 0.5) * 30}%`,
                          opacity: 0,
                          scale: 0,
                        }}
                        animate={{
                          y: 300,
                          opacity: [0, 0.8, 0.6, 0],
                          scale: [0, 1, 0.8, 0],
                        }}
                        transition={{
                          duration: 1.5 + Math.random() * 0.5,
                          delay: Math.random() * 0.3,
                          ease: 'easeIn',
                        }}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          background: polvoSeleccionado.color.includes('purple')
                            ? '#a78bfa'
                            : polvoSeleccionado.color.includes('gray')
                              ? '#d1d5db'
                              : '#67e8f9',
                        }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>

              {/* Burbujas mejoradas */}
              <AnimatePresence>
                {fase === 'reaccionando' &&
                  burbujas.map((burbuja) => (
                    <motion.div
                      key={burbuja.id}
                      initial={{ y: '100%', opacity: 0, scale: 0 }}
                      animate={{
                        y: '-120%',
                        x: [0, Math.sin(burbuja.id) * 10, 0], // Movimiento sinusoidal
                        opacity: [0, 1, 1, 0.8, 0],
                        scale: [0, 1, 1.1, 1, 0],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 0.5,
                        delay: burbuja.delay,
                        ease: 'easeOut',
                      }}
                      style={{
                        position: 'absolute',
                        left: `${burbuja.x}%`,
                        width: burbuja.size,
                        height: burbuja.size,
                      }}
                      className="rounded-full bg-white/50 backdrop-blur-sm border-2 border-white/70 shadow-lg"
                    >
                      {/* Brillo interior de la burbuja */}
                      <div className="absolute top-1 left-1 w-1/3 h-1/3 rounded-full bg-white/60" />
                    </motion.div>
                  ))}
              </AnimatePresence>

              {/* Efecto de vapor/espuma en la superficie */}
              <AnimatePresence>
                {fase === 'reaccionando' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-[38%] left-0 right-0 h-12 pointer-events-none"
                  >
                    {Array.from({ length: 8 }, (_, i) => (
                      <motion.div
                        key={`vapor-${i}`}
                        initial={{ y: 0, opacity: 0, scale: 0.5 }}
                        animate={{
                          y: [-5, -15, -25],
                          opacity: [0, 0.6, 0],
                          scale: [0.5, 1, 1.5],
                        }}
                        transition={{
                          duration: 1.5,
                          delay: i * 0.2,
                          repeat: Infinity,
                          repeatDelay: 0.5,
                        }}
                        style={{
                          position: 'absolute',
                          left: `${10 + i * 11}%`,
                        }}
                        className="w-8 h-8 rounded-full bg-white/30 blur-sm"
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cohete (solo para slide 28) */}
              {slide.id === 28 && fase === 'finalizado' && resultado && (
                <motion.div
                  initial={{ y: '80%' }}
                  animate={{
                    y: `-${(resultado.altura ?? 0) * 2}%`, // Vuela proporcionalmente a la altura
                    rotate: [0, -5, 5, 0],
                  }}
                  transition={{
                    y: { duration: 1.5, ease: 'easeOut' },
                    rotate: { duration: 0.3, repeat: 3 },
                  }}
                  className="absolute left-1/2 -translate-x-1/2 text-7xl z-20"
                >
                  🚀
                  {/* Llama del cohete */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 0.2,
                      repeat: Infinity,
                    }}
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-4xl"
                  >
                    🔥
                  </motion.div>
                </motion.div>
              )}

              {/* Emoji central según la fase */}
              {fase === 'vacio' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-9xl opacity-20">{slide.id === 28 ? '🚀' : '🧪'}</span>
                </div>
              )}
            </div>

            {/* Botón de acción */}
            <div className="flex gap-3 flex-shrink-0">
              {fase === 'esperando' && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={iniciarReaccion}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-2xl py-4 rounded-xl shadow-2xl hover:shadow-green-500/50"
                >
                  🧪 ¡MEZCLAR!
                </motion.button>
              )}

              {fase === 'finalizado' && (
                <>
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={reiniciar}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black text-xl py-4 rounded-xl shadow-2xl"
                  >
                    🔄 Probar Otro
                  </motion.button>
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onComplete}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-xl py-4 rounded-xl shadow-2xl"
                  >
                    ✅ Continuar
                  </motion.button>
                </>
              )}
            </div>

            {/* Resultado */}
            <AnimatePresence>
              {fase === 'finalizado' && resultado && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-4 border-4 border-white/50 flex-shrink-0"
                >
                  <p className="text-xl font-black text-gray-900 text-center mb-3">
                    {obtenerMensajeResultado()}
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-white/50 rounded-lg p-3">
                      <p className="text-sm font-bold text-gray-700">Intensidad</p>
                      <p className="text-3xl font-black text-gray-900">{resultado.intensidad}/9</p>
                    </div>
                    {resultado.altura && slide.id === 28 && (
                      <div className="bg-white/50 rounded-lg p-3">
                        <p className="text-sm font-bold text-gray-700">Altura</p>
                        <p className="text-3xl font-black text-gray-900">{resultado.altura}cm</p>
                      </div>
                    )}
                    {slide.id === 15 && (
                      <div className="bg-white/50 rounded-lg p-3">
                        <p className="text-sm font-bold text-gray-700">Burbujas</p>
                        <p className="text-3xl font-black text-gray-900">{burbujas.length}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
