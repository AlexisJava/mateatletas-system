/**
 * ROBOT BUSCADOR - SIMULADOR DE ALGORITMO DE ORDENAMIENTO
 * ==========================================================
 *
 * Simulación de Bubble Sort aplicado a búsqueda de videos
 * Enseña cómo funcionan los algoritmos de ordenamiento en plataformas como YouTube
 *
 * Conceptos:
 * - Algoritmo Bubble Sort (ordenamiento burbuja)
 * - Comparación de elementos
 * - Intercambio de posiciones
 * - Complejidad algorítmica
 *
 * Grupos: B1 (6-7 años)
 * Duración: 15-20 minutos
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Search,
  ArrowRight,
  ArrowRightLeft,
  Sparkles,
  Check,
  X,
} from 'lucide-react';

import { ThemeType, SimulationState, SortStep } from './types';
import { TEMAS, VIDEOS_DATA, CONFIG } from './constants';
import { mezclarVideos, bubbleSortDescendente } from './services/sorting';
import { VideoCard } from './components/VideoCard';
import { Robot } from './components/Robot';

interface RobotBuscadorProps {
  onCompleted?: () => void;
  onExit?: () => void;
}

export default function RobotBuscador({ onCompleted, onExit }: RobotBuscadorProps) {
  const [state, setState] = useState<SimulationState>({
    tema: null,
    videos: [],
    pasoActual: null,
    estadisticas: { comparaciones: 0, intercambios: 0 },
    fase: 'inicio',
    velocidad: CONFIG.VELOCIDADES.medio,
    pausado: false,
  });

  const sortGenRef = useRef<Generator<SortStep> | null>(null);
  const timerRef = useRef<number | null>(null);

  const startThemeSelection = () => setState((prev) => ({ ...prev, fase: 'seleccion-tema' }));

  const selectTheme = (themeKey: ThemeType) => {
    const mixedVideos = mezclarVideos(VIDEOS_DATA[themeKey]);
    setState({
      ...state,
      tema: themeKey,
      videos: mixedVideos,
      fase: 'ordenando',
      pasoActual: null,
      estadisticas: { comparaciones: 0, intercambios: 0 },
      pausado: false,
      velocidad: CONFIG.VELOCIDADES.medio,
    });
    sortGenRef.current = bubbleSortDescendente(mixedVideos);
  };

  const nextStep = useCallback(() => {
    if (!sortGenRef.current) return;
    const { value, done } = sortGenRef.current.next();

    if (done) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      setState((prev) => ({ ...prev, fase: 'resultado', pasoActual: null }));
    } else {
      const step = value as SortStep;
      setState((prev) => {
        const newStats = { ...prev.estadisticas };
        if (step.tipo === 'comparando') newStats.comparaciones++;
        if (step.tipo === 'intercambiando') newStats.intercambios++;
        return { ...prev, videos: step.videos, pasoActual: step, estadisticas: newStats };
      });
    }
  }, []);

  useEffect(() => {
    if (state.fase !== 'ordenando' || state.pausado) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      return;
    }

    const loop = () => {
      nextStep();
      const extraDelay = state.pasoActual?.tipo === 'comparando' ? 500 : 0;
      timerRef.current = window.setTimeout(loop, state.velocidad + extraDelay);
    };

    if (!state.pasoActual) {
      loop();
    } else {
      timerRef.current = window.setTimeout(loop, state.velocidad);
    }

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [state.fase, state.pausado, state.velocidad, nextStep, state.pasoActual]);

  const togglePause = () => setState((prev) => ({ ...prev, pausado: !prev.pausado }));

  const reset = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setState({
      tema: null,
      videos: [],
      pasoActual: null,
      estadisticas: { comparaciones: 0, intercambios: 0 },
      fase: 'inicio',
      velocidad: CONFIG.VELOCIDADES.medio,
      pausado: false,
    });
  };

  const handleExit = () => {
    if (onExit) {
      onExit();
    }
  };

  const Button = ({
    onClick,
    children,
    variant = 'primary' as 'primary' | 'secondary' | 'success' | 'warning',
    className = '',
  }: {
    onClick: () => void;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'warning';
    className?: string;
  }) => {
    const baseClass =
      'relative px-8 py-4 rounded-2xl font-bold uppercase tracking-wide flex items-center justify-center gap-3 transition-colors shadow-lg';
    const variants: Record<'primary' | 'secondary' | 'success' | 'warning', string> = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
      secondary: 'bg-white text-slate-700 hover:bg-slate-50',
      success: 'bg-emerald-500 text-white hover:bg-emerald-600',
      warning: 'bg-amber-400 text-white hover:bg-amber-500',
    };

    return (
      <button onClick={onClick} className={`${baseClass} ${variants[variant]} ${className}`}>
        {children}
      </button>
    );
  };

  const renderIntro = () => (
    <div className="flex flex-col items-center justify-center min-h-full p-4 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] shadow-2xl max-w-2xl w-full border border-white/50"
      >
        <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-6xl shadow-inner">
          🤖
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-indigo-900 mb-6 tracking-tight">
          Robot <span className="text-indigo-600">Buscador</span>
        </h1>
        <p className="text-2xl text-slate-600 font-medium mb-10 leading-relaxed">
          ¿Alguna vez te preguntaste cómo hace{' '}
          <span className="text-red-500 font-bold bg-red-100 px-2 rounded-lg">YouTube</span> para
          encontrar tus videos?
        </p>

        <Button onClick={startThemeSelection} className="w-full text-xl shadow-lg">
          <span>Descubrir el Secreto</span>
          <ArrowRight className="w-6 h-6" />
        </Button>
      </motion.div>
    </div>
  );

  const renderThemeSelection = () => (
    <div className="min-h-full flex flex-col items-center justify-center p-4">
      <div className="mb-8 max-w-2xl w-full">
        <Robot mensaje="Primero, elegí qué te gustaría buscar hoy." emotion="happy" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {Object.entries(TEMAS).map(([key, theme]) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => selectTheme(key as ThemeType)}
            className="bg-white h-48 rounded-[2rem] flex flex-col items-center justify-center gap-4 shadow-xl border-4 border-transparent hover:border-indigo-100 transition-all group relative overflow-hidden"
          >
            <div
              className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 ${theme.color}`}
            ></div>
            <span className="text-6xl drop-shadow-md z-10">{theme.emoji}</span>
            <span className="text-xl font-bold text-slate-700 uppercase tracking-wide z-10">
              {theme.nombre}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderSimulation = () => {
    const { videos, pasoActual, tema, estadisticas } = state;
    const themeConfig = tema ? TEMAS[tema] : TEMAS.roblox;

    const activeIndices = pasoActual?.indices || [];
    const isComparing = pasoActual?.tipo === 'comparando';
    const isSwapping = pasoActual?.tipo === 'intercambiando';
    const isMatched = pasoActual?.tipo === 'sin-cambio';

    let operatorIcon = null;
    let operatorColor = '';

    if (activeIndices.length === 2) {
      if (isComparing) {
        operatorIcon = <span className="text-6xl font-black">?</span>;
        operatorColor = 'bg-yellow-400 text-yellow-900';
      } else if (isSwapping) {
        operatorIcon = <ArrowRightLeft className="w-10 h-10 stroke-[3]" />;
        operatorColor = 'bg-indigo-500 text-white';
      } else if (isMatched) {
        operatorIcon = <Check className="w-10 h-10 stroke-[4]" />;
        operatorColor = 'bg-green-500 text-white';
      }
    }

    return (
      <div className="min-h-full flex flex-col max-w-6xl mx-auto p-4 md:p-6">
        {/* TOP BAR */}
        <header className="flex justify-between items-center mb-8 bg-white/60 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-white/50">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md text-white ${themeConfig.color}`}
            >
              {themeConfig.emoji}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs uppercase text-slate-500 font-bold tracking-wider">
                Buscando
              </div>
              <div className="text-2xl font-black text-slate-800">{themeConfig.nombre}</div>
            </div>
          </div>

          <div className="flex gap-6 pr-4">
            <div className="text-center">
              <div className="text-xs font-bold text-slate-400 uppercase">Pasos</div>
              <div className="text-xl font-black text-slate-700">{estadisticas.comparaciones}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-slate-400 uppercase">Cambios</div>
              <div className="text-xl font-black text-indigo-600">{estadisticas.intercambios}</div>
            </div>
          </div>
        </header>

        {/* CENTER STAGE */}
        <div className="flex-1 flex flex-col relative">
          <div className="mb-4 z-20">
            <Robot
              mensaje={pasoActual ? pasoActual.mensaje : '¡Manos a la obra!'}
              emotion={isComparing ? 'thinking' : isSwapping ? 'celebrating' : 'neutral'}
            />
          </div>

          <div className="flex-1 bg-white/40 backdrop-blur-sm rounded-[3rem] p-6 md:p-10 shadow-inner border border-white/40 relative flex flex-col items-center justify-center min-h-[500px]">
            <div className="absolute inset-0 flex items-center justify-center gap-8 pointer-events-none opacity-20">
              <div className="w-48 h-64 bg-indigo-200 rounded-[2rem]"></div>
              <div className="w-48 h-64 bg-indigo-200 rounded-[2rem]"></div>
            </div>

            <AnimatePresence>
              {activeIndices.length === 2 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className={`absolute z-30 w-20 h-20 rounded-full flex items-center justify-center shadow-xl ${operatorColor} top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-white`}
                >
                  {operatorIcon}
                </motion.div>
              )}
            </AnimatePresence>

            <LayoutGroup>
              <motion.div
                layout
                className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 w-full max-w-4xl mx-auto z-10 p-4"
              >
                {videos.map((video, idx) => {
                  const isActive = activeIndices.includes(idx);
                  return (
                    <VideoCard
                      key={video.id}
                      video={video}
                      isComparing={isActive && isComparing}
                      isSwapping={isActive && isSwapping}
                      isSorted={video.ordenado}
                      isDimmed={activeIndices.length > 0 && !isActive}
                    />
                  );
                })}
              </motion.div>
            </LayoutGroup>

            <div className="absolute bottom-4 text-center text-indigo-900/20 font-black text-4xl uppercase tracking-widest pointer-events-none select-none">
              Algoritmo
            </div>
          </div>
        </div>

        {/* BOTTOM CONTROLS */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur rounded-2xl p-4 shadow-lg">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {[
              { label: 'Lento', val: CONFIG.VELOCIDADES.lento },
              { label: 'Normal', val: CONFIG.VELOCIDADES.medio },
              { label: 'Turbo', val: CONFIG.VELOCIDADES.rapido },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => setState((s) => ({ ...s, velocidad: opt.val }))}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  state.velocidad === opt.val
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-indigo-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={reset} className="!p-3">
              <RotateCcw className="w-6 h-6" />
            </Button>

            <Button
              variant={state.pausado ? 'success' : 'warning'}
              onClick={togglePause}
              className="min-w-[160px]"
            >
              {state.pausado ? (
                <Play className="w-5 h-5 fill-current" />
              ) : (
                <Pause className="w-5 h-5 fill-current" />
              )}
              <span>{state.pausado ? 'Continuar' : 'Pausar'}</span>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    return (
      <div className="min-h-full flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/50 w-full max-w-5xl overflow-hidden flex flex-col lg:flex-row"
        >
          <div className="bg-indigo-600 p-10 flex flex-col text-white lg:w-1/3 justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

            <div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mb-6 backdrop-blur-md">
                🏆
              </div>
              <h2 className="text-4xl font-black mb-4 leading-tight">¡Búsqueda Completa!</h2>
              <p className="text-indigo-100 text-lg font-medium">
                Así es como el "cerebro" de la computadora te muestra siempre lo mejor primero.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <Button
                onClick={startThemeSelection}
                className="w-full bg-white text-indigo-700 hover:bg-indigo-50 shadow-none border-b-4 border-indigo-200 active:border-b-0 active:translate-y-1"
              >
                <Search className="w-5 h-5" />
                Buscar Otro
              </Button>
              {onCompleted && (
                <Button
                  onClick={onCompleted}
                  className="w-full bg-indigo-700 text-indigo-100 hover:bg-indigo-800 shadow-none border-b-4 border-indigo-900 active:border-b-0 active:translate-y-1"
                >
                  <ArrowRight className="w-5 h-5" />
                  Continuar
                </Button>
              )}
            </div>
          </div>

          <div className="p-8 lg:p-10 flex-1 bg-slate-50">
            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-6">
              Resultados Ordenados
            </h3>

            <div className="space-y-4">
              {state.videos.map((video, idx) => (
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  key={video.id}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 group hover:scale-[1.01] transition-transform"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      idx === 0
                        ? 'bg-yellow-400 text-yellow-900'
                        : idx === 1
                          ? 'bg-slate-300 text-slate-700'
                          : idx === 2
                            ? 'bg-amber-700 text-amber-100'
                            : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </div>

                  <div className="text-3xl">{video.emoji}</div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 text-lg truncate">{video.titulo}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${video.relevancia > 70 ? 'bg-green-500' : video.relevancia > 40 ? 'bg-yellow-400' : 'bg-red-400'}`}
                          style={{ width: `${video.relevancia}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-400">{video.relevancia}%</span>
                    </div>
                  </div>

                  {idx === 0 && <Sparkles className="text-yellow-400 w-6 h-6 animate-pulse" />}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div
      className="max-h-[85vh] h-full w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col overflow-y-auto rounded-lg shadow-2xl mx-auto my-4 text-slate-800 selection:bg-indigo-100 relative"
      style={{ maxWidth: '1400px' }}
    >
      {onExit && (
        <button
          onClick={handleExit}
          className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/80 hover:bg-red-500/20 text-slate-600 hover:text-red-600 rounded-xl transition-colors shadow-lg flex items-center justify-center backdrop-blur-sm"
        >
          <X size={20} />
        </button>
      )}

      {state.fase === 'inicio' && renderIntro()}
      {state.fase === 'seleccion-tema' && renderThemeSelection()}
      {state.fase === 'ordenando' && renderSimulation()}
      {state.fase === 'resultado' && renderResult()}
    </div>
  );
}
