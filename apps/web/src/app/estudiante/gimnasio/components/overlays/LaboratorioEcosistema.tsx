/**
 * LABORATORIO MÁGICO - ÁTOMO QUÍMICO INTERACTIVO
 * Núcleo central con electrones orbitando - hover para activar reacción
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap } from 'lucide-react';
import { useOverlayStack } from '../../contexts/OverlayStackProvider';
import { useState, useEffect } from 'react';
import { useSound } from '../../hooks/useSound';
import ParticleField from './ParticleField';

export interface LaboratorioEcosistemaProps {
  semanaId: string;
}

interface Electron {
  id: string;
  nombre: string;
  emoji: string;
  color: string;
  orbitRadius: number; // Radio de órbita en píxeles
  anglePosition: number; // Ángulo fijo en grados (0-360)
  size: number; // Tamaño del electrón
  completado: boolean;
  bloqueado: boolean;
  actividades: Actividad[];
}

interface Actividad {
  id: string;
  titulo: string;
  emoji: string;
  duracion: string;
  completada: boolean;
}

// 6 electrones distribuidos uniformemente: 360° / 6 = 60° entre cada uno
// Electrón 1: CLASE SINCRÓNICA (90 min) - MEGA experiencia
// Electrones 2-6: Actividades asincrónicas simples (~20 min cada una)
const ELECTRONES: Electron[] = [
  {
    id: 'clase-sincronica', // MEGA clase sincrónica de 90 min
    nombre: 'Clase: Laboratorio Mágico',
    emoji: '🎬',
    color: '#ef4444', // Rojo brillante para destacar
    orbitRadius: 140,
    anglePosition: 0, // 12:00 (arriba) - posición principal
    size: 85, // Más grande que los demás
    completado: false,
    bloqueado: false,
    actividades: [
      { id: 'quimica-clase-sincronica', titulo: 'Clase Virtual 90min', emoji: '🔴', duracion: '90 min', completada: false },
    ],
  },
  {
    id: '01', // quimica-01
    nombre: 'Introducción a los Átomos',
    emoji: '⚛️',
    color: '#3b82f6',
    orbitRadius: 200,
    anglePosition: 60, // 2:00
    size: 70,
    completado: false,
    bloqueado: false,
    actividades: [
      { id: 'quimica-01', titulo: 'Video: ¿Qué son los átomos?', emoji: '🎬', duracion: '10 min', completada: false },
    ],
  },
  {
    id: '02', // quimica-02
    nombre: 'Tabla Periódica',
    emoji: '🧪',
    color: '#10b981',
    orbitRadius: 220,
    anglePosition: 72, // 360/5 = 72° entre cada uno
    size: 70,
    completado: false,
    bloqueado: false,
    actividades: [
      { id: 'quimica-02', titulo: 'Tabla Periódica Interactiva', emoji: '📊', duracion: '15 min', completada: false },
    ],
  },
  {
    id: '03', // quimica-03
    nombre: 'Laboratorio Virtual',
    emoji: '🔬',
    color: '#8b5cf6',
    orbitRadius: 260,
    anglePosition: 144, // 72° × 2
    size: 70,
    completado: false,
    bloqueado: false,
    actividades: [
      { id: 'quimica-03', titulo: 'Laboratorio Virtual', emoji: '⚗️', duracion: '20 min', completada: false },
    ],
  },
  {
    id: 'concentraciones', // quimica-concentraciones
    nombre: 'Concentraciones',
    emoji: '💧',
    color: '#06b6d4',
    orbitRadius: 240,
    anglePosition: 216, // 72° × 3
    size: 70,
    completado: false,
    bloqueado: false,
    actividades: [
      { id: 'quimica-concentraciones', titulo: 'Simulador de Mezclas', emoji: '🧬', duracion: '15 min', completada: false },
    ],
  },
  {
    id: 'reacciones-cadena', // quimica-reacciones-cadena
    nombre: 'Reacciones',
    emoji: '💥',
    color: '#f59e0b',
    orbitRadius: 280,
    anglePosition: 288, // 72° × 4
    size: 70,
    completado: false,
    bloqueado: false,
    actividades: [
      { id: 'quimica-reacciones-cadena', titulo: 'Reacción en Cadena', emoji: '⚡', duracion: '20 min', completada: false },
    ],
  },
];

export function LaboratorioEcosistema({ semanaId: _semanaId }: LaboratorioEcosistemaProps) {
  const { pop, push } = useOverlayStack();
  const [electronSeleccionado, setElectronSeleccionado] = useState<string | null>(null);
  const [reaccionando, setReaccionando] = useState(false);
  const [electronHovered, setElectronHovered] = useState<string | null>(null);
  const [electronSplitActivo, setElectronSplitActivo] = useState<string | null>(null);
  const [explosionActiva, setExplosionActiva] = useState<{ x: number; y: number; color: string } | null>(null);

  const { playHoverSound, playClickSound, playWhooshSound, playAmbientLoop } = useSound();

  // Reproducir sonido ambiente al montar el componente
  useEffect(() => {
    playAmbientLoop();
    const interval = setInterval(() => {
      playAmbientLoop();
    }, 5000);

    return () => clearInterval(interval);
  }, [playAmbientLoop]);

  const handleElectronHover = (electronId: string) => {
    setElectronHovered(electronId);
    playHoverSound();
  };

  // const handleClearHover = () => {
  //   setElectronHovered(null);
  // }; // TODO: usar en onMouseLeave

  const handleElectronClickSplit = (electronId: string, event: React.MouseEvent) => {
    const electron = ELECTRONES.find((e) => e.id === electronId);
    if (!electron) return;

    // Sonido de click/zap
    playClickSound();

    // Capturar posición del click para la explosión
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Activar explosión de partículas
    setExplosionActiva({ x, y, color: electron.color });
    setTimeout(() => setExplosionActiva(null), 1000);

    // Primera vez o clickeando otro electrón: activa el split
    setElectronSplitActivo(electronId);
  };

  const handleIrAMision = () => {
    if (!electronSplitActivo) return;

    // Abrir vista de actividades del electrón seleccionado
    playWhooshSound();
    setReaccionando(true);
    setTimeout(() => {
      // Mapear electronId a actividadId
      const actividadId = `quimica-${electronSplitActivo}`;

      push({
        type: 'ejecutar-actividad',
        actividadId,
        semanaId: 'quimica',
      });

      setReaccionando(false);
      setElectronSplitActivo(null);
    }, 1000);
  };

  const handleCerrarSplit = () => {
    setElectronSplitActivo(null);
  };

  const handleVolver = () => {
    setReaccionando(true);
    setTimeout(() => {
      setElectronSeleccionado(null);
      setElectronHovered(null);
      setReaccionando(false);
    }, 800);
  };

  const electronActual = electronSeleccionado
    ? ELECTRONES.find((e) => e.id === electronSeleccionado)
    : null;

  const completados = ELECTRONES.filter((e) => e.completado).length;

  // Calcular energía acumulada (6 actividades totales, una por electrón)
  const actividadesCompletadasTotal = ELECTRONES.reduce(
    (total, electron) => total + electron.actividades.filter((a) => a.completada).length,
    0
  );
  const actividadesTotales = ELECTRONES.length; // 6 electrones = 6 actividades
  const energiaAcumulada = Math.floor((actividadesCompletadasTotal / actividadesTotales) * 100);

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f0a1e 50%, #000000 100%)',
      }}
    >
      {/* Campo de energía electromagnética - Componente memoizado */}
      <ParticleField />

      {/* Header - Layout simétrico con grid */}
      <header
        className="h-20 backdrop-blur-xl border-b-2 px-8 grid grid-cols-3 items-center relative z-50"
        style={{
          background: 'rgba(15, 10, 30, 0.7)',
          borderColor: 'rgba(139, 92, 246, 0.3)',
        }}
      >
        {/* Columna izquierda - Botón Volver */}
        <div className="flex justify-start">
          {!electronSeleccionado && (
            <button
              onClick={pop}
              className="flex items-center gap-3 bg-purple-500/20 hover:bg-purple-500/30 backdrop-blur-xl border-2 border-purple-400/30 rounded-2xl px-5 py-2.5 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-purple-200" strokeWidth={2.5} />
              <span className="font-bold text-purple-100">Volver</span>
            </button>
          )}
        </div>

        {/* Columna central - Título */}
        <div className="text-center">
          <h1
            className="font-display text-4xl text-white tracking-wide"
            style={{
              textShadow: '0 0 30px rgba(139, 92, 246, 0.8), 0 4px 16px rgba(0, 0, 0, 0.5)',
              WebkitTextStroke: '1px rgba(139, 92, 246, 0.5)',
            }}
          >
            MATEMÁTICAS Y LA QUÍMICA
          </h1>
          <p className="text-purple-200/80 text-sm mt-1 font-semibold">
            Posicionate en un electrón para ver detalles
          </p>
        </div>

        {/* Columna derecha - Stats */}
        <div className="flex justify-end items-center gap-3">
          {/* Contador de energía acumulada - Compacto con tooltip */}
          <div
            className="bg-purple-500/20 backdrop-blur-xl border-2 border-purple-400/30 rounded-2xl px-4 py-2.5 relative group cursor-help"
            title={`${actividadesCompletadasTotal} de ${actividadesTotales} actividades completadas`}
          >
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-yellow-400" fill="currentColor" />
              <div>
                <div className="text-purple-100 font-black text-lg leading-none">{energiaAcumulada}%</div>
                <div className="text-purple-200/70 text-[10px] font-semibold uppercase tracking-wide">Energía</div>
              </div>
            </div>

            {/* Tooltip personalizado */}
            <div className="absolute top-full right-0 mt-2 hidden group-hover:block z-50 pointer-events-none">
              <div className="bg-black/95 backdrop-blur-xl border-2 border-purple-400/50 rounded-xl px-4 py-2 whitespace-nowrap shadow-2xl">
                <p className="text-purple-100 text-sm font-semibold">
                  {actividadesCompletadasTotal} de {actividadesTotales} actividades completadas
                </p>
              </div>
            </div>
          </div>

          {/* Contador de electrones completados */}
          <div className="bg-purple-500/20 backdrop-blur-xl border-2 border-purple-400/30 rounded-2xl px-4 py-2.5">
            <div className="text-center">
              <div className="text-purple-100 font-black text-lg leading-none">
                {completados}/{ELECTRONES.length}
              </div>
              <div className="text-purple-200/70 text-[10px] font-semibold uppercase tracking-wide">Electrones</div>
            </div>
          </div>
        </div>
      </header>

      {/* Vista del Átomo */}
      <AnimatePresence mode="wait">
        {!electronSeleccionado ? (
          <motion.div
            key="atomo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 relative flex items-center"
          >
            {/* SPLIT: Texto gigante a la IZQUIERDA */}
            <AnimatePresence mode="wait">
              {electronSplitActivo && (
                <motion.div
                  key={electronSplitActivo}
                  className="absolute left-0 top-1/2 -translate-y-1/2 pl-20 z-20"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
                >
                  <div>
                    {/* Emoji gigante */}
                    <div
                      className="text-[200px] leading-none mb-6"
                      style={{
                        filter: `drop-shadow(0 0 40px ${ELECTRONES.find((e) => e.id === electronSplitActivo)?.color})`,
                      }}
                    >
                      {ELECTRONES.find((e) => e.id === electronSplitActivo)?.emoji}
                    </div>

                    {/* Nombre BRUTAL */}
                    <h2
                      className="font-display text-8xl text-white tracking-wide mb-4 leading-none"
                      style={{
                        textShadow: `0 0 80px ${ELECTRONES.find((e) => e.id === electronSplitActivo)?.color}, 0 0 40px ${ELECTRONES.find((e) => e.id === electronSplitActivo)?.color}, 0 4px 30px rgba(0, 0, 0, 0.8)`,
                        WebkitTextStroke: `3px ${ELECTRONES.find((e) => e.id === electronSplitActivo)?.color}`,
                        maxWidth: '500px',
                      }}
                    >
                      {ELECTRONES.find((e) => e.id === electronSplitActivo)?.nombre.toUpperCase()}
                    </h2>

                    {/* Botones de acción */}
                    <div className="flex items-center gap-4 mt-6">
                      <motion.button
                        onClick={handleIrAMision}
                        className="px-8 py-4 rounded-2xl border-3 font-black text-2xl transition-all shadow-2xl"
                        style={{
                          background: `linear-gradient(135deg, ${ELECTRONES.find((e) => e.id === electronSplitActivo)?.color} 0%, ${ELECTRONES.find((e) => e.id === electronSplitActivo)?.color}dd 100%)`,
                          borderColor: ELECTRONES.find((e) => e.id === electronSplitActivo)?.color,
                          color: 'white',
                          boxShadow: `0 10px 40px ${ELECTRONES.find((e) => e.id === electronSplitActivo)?.color}99, 0 0 60px ${ELECTRONES.find((e) => e.id === electronSplitActivo)?.color}66`,
                        }}
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        IR A LA MISIÓN
                      </motion.button>

                      <button
                        onClick={handleCerrarSplit}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-xl border-2 border-white/30 transition-all text-white font-bold text-lg"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TODO EL ÁTOMO (núcleo + electrones) - SE MUEVE A LA DERECHA en split */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{
                x: electronSplitActivo ? 250 : 0,
              }}
              transition={{
                duration: 0.5,
                type: 'spring',
                stiffness: 200,
                damping: 25,
              }}
            >
              {/* Órbitas permanentes visibles */}
              {ELECTRONES.map((electron) => (
                <div
                  key={`orbit-${electron.id}`}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 pointer-events-none"
                  style={{
                    width: electron.orbitRadius * 2,
                    height: electron.orbitRadius * 2,
                    borderColor: electronHovered === electron.id ? electron.color : 'rgba(139, 92, 246, 0.3)',
                    opacity: electronHovered === electron.id ? 1 : 0.4,
                    boxShadow: electronHovered === electron.id ? `0 0 20px ${electron.color}` : 'none',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
              {/* Núcleo atómico central */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  className="relative"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                {/* Glow del núcleo */}
                <motion.div
                  className="absolute inset-0 rounded-full blur-3xl"
                  style={{
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.7) 0%, rgba(251, 191, 36, 0.4) 50%, transparent 70%)',
                    width: '280px',
                    height: '280px',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 0.9, 0.7],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                  }}
                />

                {/* Núcleo - Protones y Neutrones */}
                <div className="relative">
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center relative z-10"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.9), rgba(99, 102, 241, 0.7))',
                      boxShadow: '0 0 80px rgba(139, 92, 246, 0.9), 0 0 40px rgba(251, 191, 36, 0.6), inset -10px -10px 25px rgba(0, 0, 0, 0.4)',
                      border: '3px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    {/* Partículas del núcleo */}
                    <div className="grid grid-cols-3 gap-1">
                      {[...Array(9)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            background: i % 2 === 0 ? '#fbbf24' : '#8b5cf6',
                            boxShadow: i % 2 === 0
                              ? '0 0 8px rgba(251, 191, 36, 0.8)'
                              : '0 0 8px rgba(139, 92, 246, 0.8)',
                          }}
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.8, 1, 0.8],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Anillos de energía del núcleo */}
                  {[0, 1, 2].map((ring) => (
                    <motion.div
                      key={ring}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                      style={{
                        width: `${140 + ring * 20}px`,
                        height: `${140 + ring * 20}px`,
                        borderColor: 'rgba(139, 92, 246, 0.2)',
                      }}
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: ring * 0.5,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
              </div>


              {/* Electrones girando como un CD - TODOS a la misma velocidad */}
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  width: '100%',
                  height: '100%',
                }}
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 40, // Rotación completa en 40 segundos (lenta y elegante)
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                {ELECTRONES.map((electron, index) => {
                  // Calcular posición x,y basado en ángulo fijo
                  const angleRad = (electron.anglePosition * Math.PI) / 180;
                  const x = Math.cos(angleRad) * electron.orbitRadius;
                  const y = Math.sin(angleRad) * electron.orbitRadius;

                  return (
                  <motion.div
                    key={electron.id}
                    className="absolute cursor-pointer pointer-events-auto"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onClick={(e) => !electron.bloqueado && handleElectronClickSplit(electron.id, e)}
                    onHoverStart={() => handleElectronHover(electron.id)}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      opacity: { delay: index * 0.15, duration: 0.3 },
                      scale: { delay: index * 0.15, type: 'spring', stiffness: 300, damping: 20 },
                    }}
                  >
                  {/* Glow sutil del electrón en hover */}
                  <AnimatePresence>
                    {electronHovered === electron.id && (
                      <>
                        {/* Glow intenso */}
                        <motion.div
                          className="absolute inset-0 rounded-full blur-2xl"
                          style={{
                            background: electron.color,
                            scale: 2.5,
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.9 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      </>
                    )}
                  </AnimatePresence>

                  {/* Cuerpo del electrón */}
                  <div className="relative">
                    {/* Anillo de progreso */}
                    {!electron.completado && !electron.bloqueado && (() => {
                      const actividadesCompletadas = electron.actividades.filter((a) => a.completada).length;
                      const totalActividades = electron.actividades.length;
                      const progreso = (actividadesCompletadas / totalActividades) * 100;

                      return progreso > 0 ? (
                        <svg
                          className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)]"
                          style={{ transform: 'rotate(-90deg)' }}
                        >
                          {/* Círculo de fondo */}
                          <circle
                            cx="50%"
                            cy="50%"
                            r="40%"
                            fill="none"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="3"
                          />
                          {/* Círculo de progreso */}
                          <motion.circle
                            cx="50%"
                            cy="50%"
                            r="40%"
                            fill="none"
                            stroke={electron.color}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                            animate={{
                              strokeDashoffset: 2 * Math.PI * 40 * (1 - progreso / 100),
                            }}
                            style={{
                              filter: `drop-shadow(0 0 6px ${electron.color})`,
                            }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </svg>
                      ) : null;
                    })()}

                    <div
                      className="relative rounded-full flex items-center justify-center border-4"
                      style={{
                        width: electron.size,
                        height: electron.size,
                        background: electronHovered === electron.id
                          ? `radial-gradient(circle at 30% 30%, ${electron.color}, ${electron.color}dd)`
                          : `radial-gradient(circle at 30% 30%, ${electron.color}ee, ${electron.color}99)`,
                        borderColor: electron.bloqueado ? '#666' : electron.color,
                        boxShadow: electronHovered === electron.id
                          ? `0 0 60px ${electron.color}, 0 0 30px ${electron.color}, inset -6px -6px 15px rgba(0, 0, 0, 0.4)`
                          : electron.completado
                          ? `0 0 40px ${electron.color}, inset -6px -6px 15px rgba(0, 0, 0, 0.4)`
                          : `0 0 20px ${electron.color}aa, inset -6px -6px 15px rgba(0, 0, 0, 0.4)`,
                        filter: electron.bloqueado ? 'grayscale(100%) brightness(0.5)' : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <span
                        className="text-3xl"
                        style={{
                          filter: `drop-shadow(0 2px 8px ${electron.color})`,
                          fontSize: electronHovered === electron.id ? '2.5rem' : '1.875rem',
                          transition: 'font-size 0.2s ease',
                        }}
                      >
                        {electron.bloqueado ? '🔒' : electron.emoji}
                      </span>

                      {/* Badge de progreso con contador */}
                      {!electron.completado && !electron.bloqueado && (() => {
                        const actividadesCompletadas = electron.actividades.filter((a) => a.completada).length;
                        const totalActividades = electron.actividades.length;

                        return actividadesCompletadas > 0 ? (
                          <motion.div
                            className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center shadow-lg font-bold text-xs"
                            style={{
                              background: `linear-gradient(135deg, ${electron.color} 0%, ${electron.color}dd 100%)`,
                              color: 'white',
                            }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          >
                            {actividadesCompletadas}/{totalActividades}
                          </motion.div>
                        ) : null;
                      })()}

                      {/* Badge completado */}
                      {electron.completado && (
                        <motion.div
                          className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-2 border-white flex items-center justify-center shadow-xl"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                        >
                          <span className="text-sm">✓</span>
                        </motion.div>
                      )}
                    </div>
                  </div>

                </motion.div>
                );
              })}
              </motion.div>
            </motion.div>

            {/* Instrucción */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-xl px-6 py-3 rounded-2xl border-2 border-purple-400/30"
            >
              <p className="text-purple-100 font-semibold text-sm text-center">
                Posicionate sobre un electrón para activarlo y click para iniciar
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="electron-detail"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex-1 relative flex items-center justify-center p-8"
          >
            {electronActual && (
              <div className="relative max-w-4xl w-full">
                {/* Electrón gigante de fondo */}
                <motion.div
                  className="absolute -top-20 -right-20 rounded-full blur-2xl opacity-30 pointer-events-none"
                  style={{
                    width: '500px',
                    height: '500px',
                    background: `radial-gradient(circle, ${electronActual.color} 0%, transparent 70%)`,
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: 360,
                  }}
                  transition={{
                    scale: { duration: 8, repeat: Infinity },
                    rotate: { duration: 40, repeat: Infinity, ease: 'linear' },
                  }}
                />

                {/* Panel principal */}
                <motion.div
                  className="relative bg-black/40 backdrop-blur-2xl rounded-3xl p-8 border-4"
                  style={{
                    borderColor: electronActual.color,
                    boxShadow: `0 20px 80px ${electronActual.color}99`,
                  }}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-5">
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-5xl border-4"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, ${electronActual.color}ee, ${electronActual.color}99)`,
                          borderColor: electronActual.color,
                          boxShadow: `0 0 40px ${electronActual.color}aa`,
                        }}
                      >
                        {electronActual.emoji}
                      </div>
                      <div>
                        <h2 className="text-white font-display text-4xl mb-1">{electronActual.nombre}</h2>
                        <p className="text-white/70 font-semibold">{electronActual.actividades.length} experimentos</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={handleVolver}
                      className="flex items-center gap-3 bg-purple-500/20 hover:bg-purple-500/30 backdrop-blur-xl border-2 border-purple-400/30 rounded-2xl px-6 py-3 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowLeft className="w-6 h-6 text-purple-200" strokeWidth={2.5} />
                      <span className="text-purple-100 font-bold text-lg">Volver al átomo</span>
                    </motion.button>
                  </div>

                  {/* Lista de actividades */}
                  <div className="space-y-4">
                    {electronActual.actividades.map((actividad, idx) => (
                      <motion.div
                        key={actividad.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-2xl p-5 border-2 border-white/10 cursor-pointer transition-all flex items-center gap-4 group"
                        whileHover={{ x: 8, scale: 1.02 }}
                      >
                        <div className="text-5xl">{actividad.emoji}</div>
                        <div className="flex-1">
                          <h4 className="text-white font-bold text-lg mb-1">{actividad.titulo}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-white/60 text-sm">⏱️ {actividad.duracion}</span>
                            {actividad.completada && <span className="text-green-400 text-sm font-bold">✓ Completada</span>}
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-white/10 group-hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
                          <span className="text-white text-xl">→</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explosión de partículas al click */}
      <AnimatePresence>
        {explosionActiva && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Partículas explosivas desde el centro */}
            {[...Array(30)].map((_, i) => {
              const angle = (i * 360) / 30;
              const distance = 150 + Math.random() * 100;
              const duration = 0.6 + Math.random() * 0.4;

              return (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    left: explosionActiva.x,
                    top: explosionActiva.y,
                    background: explosionActiva.color,
                    boxShadow: `0 0 15px ${explosionActiva.color}`,
                  }}
                  initial={{
                    x: 0,
                    y: 0,
                    scale: 1,
                    opacity: 1,
                  }}
                  animate={{
                    x: Math.cos((angle * Math.PI) / 180) * distance,
                    y: Math.sin((angle * Math.PI) / 180) * distance,
                    scale: 0,
                    opacity: 0,
                  }}
                  transition={{
                    duration,
                    ease: 'easeOut',
                  }}
                />
              );
            })}

            {/* Onda de choque */}
            <motion.div
              className="absolute rounded-full border-4"
              style={{
                left: explosionActiva.x,
                top: explosionActiva.y,
                transform: 'translate(-50%, -50%)',
                borderColor: explosionActiva.color,
                boxShadow: `0 0 40px ${explosionActiva.color}`,
              }}
              initial={{
                width: 0,
                height: 0,
                opacity: 1,
              }}
              animate={{
                width: 400,
                height: 400,
                opacity: 0,
              }}
              transition={{
                duration: 0.8,
                ease: 'easeOut',
              }}
            />

            {/* Flash brillante */}
            <motion.div
              className="absolute rounded-full"
              style={{
                left: explosionActiva.x,
                top: explosionActiva.y,
                transform: 'translate(-50%, -50%)',
                background: explosionActiva.color,
              }}
              initial={{
                width: 20,
                height: 20,
                opacity: 1,
              }}
              animate={{
                width: 200,
                height: 200,
                opacity: 0,
              }}
              transition={{
                duration: 0.5,
                ease: 'easeOut',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Efecto de transición con branding Mateatletas */}
      <AnimatePresence>
        {reaccionando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              background: 'radial-gradient(ellipse at center, #1e1b4b 0%, #0f0a1e 50%, #000000 100%)',
            }}
          >
            {/* Logo Mateatletas */}
            <motion.div
              className="relative z-10"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{
                duration: 0.6,
                ease: 'easeOut',
              }}
            >
              <h1
                className="font-display text-9xl text-white tracking-wider"
                style={{
                  textShadow: '0 0 60px rgba(139, 92, 246, 0.9), 0 0 30px rgba(139, 92, 246, 0.7), 0 4px 30px rgba(0, 0, 0, 0.8)',
                  WebkitTextStroke: '2px rgba(139, 92, 246, 0.6)',
                }}
              >
                Mateatletas
              </h1>
            </motion.div>

            {/* Ondas de energía sutiles detrás del logo */}
            {[0, 1, 2].map((ring) => (
              <motion.div
                key={ring}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                style={{
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  width: '300px',
                  height: '300px',
                }}
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 3 + ring * 1.5, opacity: 0 }}
                transition={{
                  duration: 1.2,
                  ease: 'easeOut',
                  delay: ring * 0.2,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
