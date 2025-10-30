/**
 * CLASE SINCRÓNICA - EL LABORATORIO DE MEZCLAS MÁGICAS
 * 90 minutos de aventura educativa donde matemática + química salvan la ciudad
 *
 * NARRATIVA COMPLETA:
 * Los estudiantes son aprendices en el Laboratorio de Mezclas Mágicas.
 * La ciudad está en peligro: el agua se está volviendo gris y sin sabor.
 * La Dra. Luna necesita ayuda para crear el "Cristal Arcoíris", un compuesto
 * que puede purificar toda el agua de la ciudad.
 *
 * Para lograrlo, deben aprender:
 * - Qué son los átomos y moléculas
 * - Cómo funcionan las mezclas y concentraciones
 * - Proporciones matemáticas en recetas químicas
 * - Balanceo de ecuaciones
 * - Gestión de presupuesto con recursos limitados
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Video,
  Users,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Beaker,
  Droplet,
  DollarSign,
  Trophy,
  Star
} from 'lucide-react';
import { useOverlayStack } from '../../contexts/OverlayStackProvider';
import { obtenerGrupoEtario } from '../../utils/edad.utils';
import type { OverlayConfig } from '../../types/overlay.types';

export interface ClaseSincronicaQuimicaProps {
  config?: OverlayConfig & { type: 'ejecutar-actividad'; actividadId: string };
  estudiante?: {
    nombre: string;
    apellido?: string;
    fecha_nacimiento?: string;
    id?: string;
  };
  onFinalizar?: () => void;
}

type Fase =
  | 'acceso'         // Pantalla inicial con link de Meet
  | 'introduccion'   // Historia: La ciudad en peligro
  | 'teoria'         // Teoría: Átomos, moléculas, mezclas
  | 'tutorial'       // Tutorial: Cómo usar el laboratorio
  | 'experimento1'   // Experimento guiado: Mezcla de colores
  | 'experimento2'   // Experimento guiado: Concentraciones
  | 'quizzes'        // Quizzes educativos con explicaciones
  | 'desafio'        // Desafío final: Crear el Cristal Arcoíris
  | 'cierre';        // Celebración y resumen

export function ClaseSincronicaQuimica({ config, estudiante, onFinalizar }: ClaseSincronicaQuimicaProps) {
  const { pop } = useOverlayStack();
  const [faseActual, setFaseActual] = useState<Fase>('acceso');

  const handleVolver = () => {
    if (onFinalizar) {
      onFinalizar();
    } else {
      pop();
    }
  };

  // Calcular grupo etario del estudiante
  const grupoEtario = estudiante?.fecha_nacimiento
    ? obtenerGrupoEtario(estudiante.fecha_nacimiento)
    : '8-9';

  // Mock de link de Meet (en producción vendría del backend)
  const LINK_MEET_EJEMPLO = 'https://meet.google.com/abc-defg-hij';

  const handleIniciarClase = () => {
    setFaseActual('introduccion');
  };

  const handleUnirseAMeet = () => {
    window.open(LINK_MEET_EJEMPLO, '_blank');
  };

  const renderPantalla = () => {
    switch (faseActual) {
      case 'acceso':
        return <PantallaAcceso
          linkMeet={LINK_MEET_EJEMPLO}
          onIniciarClase={handleIniciarClase}
          onUnirseAMeet={handleUnirseAMeet}
          estudiante={estudiante}
        />;

      case 'introduccion':
        return <FaseIntroduccion
          grupoEtario={grupoEtario}
          estudiante={estudiante}
          onContinuar={() => setFaseActual('teoria')}
        />;

      case 'teoria':
        return <FaseTeoria
          grupoEtario={grupoEtario}
          onContinuar={() => setFaseActual('tutorial')}
        />;

      case 'tutorial':
        return <FaseTutorial
          grupoEtario={grupoEtario}
          onContinuar={() => setFaseActual('experimento1')}
        />;

      case 'experimento1':
        return <FaseExperimento1
          grupoEtario={grupoEtario}
          onContinuar={() => setFaseActual('experimento2')}
        />;

      case 'experimento2':
        return <FaseExperimento2
          grupoEtario={grupoEtario}
          onContinuar={() => setFaseActual('quizzes')}
        />;

      case 'quizzes':
        return <FaseQuizzes
          grupoEtario={grupoEtario}
          onContinuar={() => setFaseActual('desafio')}
        />;

      case 'desafio':
        return <FaseDesafioFinal
          grupoEtario={grupoEtario}
          onContinuar={() => setFaseActual('cierre')}
        />;

      case 'cierre':
        return <FaseCierre
          grupoEtario={grupoEtario}
          onVolver={handleVolver}
        />;

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Background base */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #0a4b3e 0%, #064e3b 50%, #1e3a5f 100%)',
        }}
      />

      {/* Partículas sutiles de fondo */}
      <ParticulasQuimicas />

      {/* Header con info de la clase */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex items-center justify-between">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleVolver}
            className="
              bg-black/40 backdrop-blur-md
              border-2 border-white/30
              rounded-xl px-4 py-2
              flex items-center gap-2
              text-white font-bold
              hover:bg-black/60
            "
            style={{ transition: 'none' }}
          >
            <ArrowLeft className="w-5 h-5" />
            VOLVER
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="
              bg-black/40 backdrop-blur-md
              border-2 border-emerald-400/50
              rounded-xl px-6 py-2
            "
          >
            <div className="text-center">
              <div className="text-emerald-300 font-black text-lg">
                🧪 EL LABORATORIO DE MEZCLAS MÁGICAS
              </div>
              <div className="text-white/70 text-sm font-bold">
                Clase Sincrónica • 90 minutos
              </div>
            </div>
          </motion.div>

          <div className="w-[120px]" /> {/* Spacer */}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-0 h-full pt-20">
        <AnimatePresence mode="wait">
          {renderPantalla()}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * ============================================================================
 * COMPONENTE: Partículas de fondo
 * ============================================================================
 */
function ParticulasQuimicas() {
  const particulas = Array.from({ length: 20 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particulas.map((_, i) => {
        const size = 10 + Math.random() * 30;
        const duration = 20 + Math.random() * 15;
        const delay = Math.random() * 5;
        const xMovement = (Math.random() - 0.5) * 30;

        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: size,
              height: size,
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.1, 0.3, 0.2, 0.3, 0.1],
              scale: [1, 1.05, 1.02, 1.05, 1],
              x: [0, xMovement, -xMovement, 0],
              rotate: [0, 180],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                background: `radial-gradient(circle, ${
                  i % 3 === 0 ? '#10b981' : i % 3 === 1 ? '#3b82f6' : '#a855f7'
                }40, transparent)`,
                filter: 'blur(2px)',
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * ============================================================================
 * FASE 0: PANTALLA DE ACCESO
 * ============================================================================
 */
interface PantallaAccesoProps {
  linkMeet: string;
  onIniciarClase: () => void;
  onUnirseAMeet: () => void;
  estudiante?: { nombre: string };
}

function PantallaAcceso({ linkMeet, onIniciarClase, onUnirseAMeet, estudiante }: PantallaAccesoProps) {
  return (
    <div className="h-full p-6 relative flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full h-full rounded-3xl p-8 border-4 relative overflow-hidden flex flex-col"
        style={{
          background: 'rgba(6, 78, 59, 0.4)',
          borderColor: 'rgba(16, 185, 129, 0.5)',
          backdropFilter: 'blur(40px) saturate(180%)',
        }}
      >
        {/* Bienvenida */}
        <div className="text-center mb-4 relative z-10 flex-shrink-0">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-2"
          >
            🧪
          </motion.div>
          <h2 className="font-black text-4xl mb-1 leading-tight">
            <span
              className="text-emerald-300"
              style={{
                textShadow: '0 3px 0 rgba(0,0,0,0.4), 0 0 20px rgba(16,185,129,0.6)',
                WebkitTextStroke: '2px rgba(0,0,0,0.3)',
              }}
            >
              ¡Bienvenida, {estudiante?.nombre}!
            </span>
          </h2>
          <p className="text-white/80 text-lg font-bold">
            Al Laboratorio de Mezclas Mágicas
          </p>
        </div>

        {/* Grid horizontal: Requerimientos + Google Meet */}
        <div className="grid grid-cols-2 gap-4 mb-4 flex-1 min-h-0">
          {/* Requerimientos */}
          <div
            className="rounded-2xl p-6 border-3 overflow-auto"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-400" strokeWidth={3} />
              <h3
                className="text-2xl font-black text-white"
                style={{ textShadow: '0 2px 0 rgba(0,0,0,0.4)' }}
              >
                NECESITAS
              </h3>
            </div>

            <div className="space-y-3">
              {[
                { emoji: '💻', text: 'Computadora o tablet' },
                { emoji: '🌐', text: 'Conexión a internet' },
                { emoji: '📝', text: 'Papel y lápiz para anotar' },
                { emoji: '🎧', text: 'Auriculares (recomendado)' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="text-white font-bold text-lg">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Google Meet */}
          <div
            className="rounded-2xl p-6 border-3"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderColor: 'rgba(59, 130, 246, 0.4)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Video className="w-8 h-8 text-blue-400" strokeWidth={3} />
              <h3
                className="text-2xl font-black text-white"
                style={{ textShadow: '0 2px 0 rgba(0,0,0,0.4)' }}
              >
                GOOGLE MEET
              </h3>
            </div>

            <div className="space-y-4">
              <p className="text-white/90 text-base font-bold leading-relaxed">
                La clase se realizará por videollamada con tu docente y compañeros.
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onUnirseAMeet}
                className="
                  w-full
                  bg-gradient-to-b from-blue-500 to-blue-600
                  border-4 border-blue-700
                  rounded-2xl
                  p-4
                  flex items-center justify-center gap-3
                  shadow-[0_6px_0_rgba(30,64,175,1)]
                  hover:shadow-[0_8px_0_rgba(30,64,175,1)]
                  active:shadow-[0_2px_0_rgba(30,64,175,1)]
                  active:translate-y-1
                "
                style={{ transition: 'none' }}
              >
                <ExternalLink className="w-6 h-6 text-white" strokeWidth={3} />
                <span
                  className="text-white font-black text-xl"
                  style={{ textShadow: '0 2px 0 rgba(0,0,0,0.3)' }}
                >
                  UNIRSE A MEET
                </span>
              </motion.button>

              <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/20 border-2 border-blue-400/30">
                <AlertCircle className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
                <p className="text-blue-200 text-sm font-bold">
                  Únete cuando tu docente te indique
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* INICIAR CLASE button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onIniciarClase}
          className="
            w-full
            text-white
            font-black text-2xl
            py-4
            rounded-2xl
            border-4
            flex-shrink-0
            shadow-[0_8px_0_rgba(0,0,0,0.6)]
            hover:shadow-[0_10px_0_rgba(0,0,0,0.6)]
            active:shadow-[0_2px_0_rgba(0,0,0,0.6)]
            active:translate-y-1
          "
          style={{
            background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
            borderColor: '#047857',
            textShadow: '0 3px 0 rgba(0,0,0,0.4)',
            transition: 'none',
          }}
        >
          ✨ INICIAR CLASE ✨
        </motion.button>
      </motion.div>
    </div>
  );
}

/**
 * ============================================================================
 * FASE 1: INTRODUCCIÓN - LA HISTORIA
 * "La Ciudad en Peligro"
 * Duración: ~5 minutos
 * ============================================================================
 */
interface FaseIntroduccionProps {
  grupoEtario: string;
  estudiante?: { nombre: string };
  onContinuar: () => void;
}

function FaseIntroduccion({ grupoEtario, estudiante, onContinuar }: FaseIntroduccionProps) {
  const [paso, setPaso] = useState(0);

  const historia = obtenerHistoriaIntroduccion(grupoEtario);

  const pasoActual = historia[paso];

  const avanzar = () => {
    if (paso < historia.length - 1) {
      setPaso(paso + 1);
    } else {
      onContinuar();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full p-8 flex items-center justify-center"
    >
      <div className="max-w-4xl w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={paso}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="
              rounded-3xl p-8 border-4
              backdrop-blur-xl
            "
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              borderColor: 'rgba(16, 185, 129, 0.5)',
            }}
          >
            {/* Emoji grande */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-center text-8xl mb-6"
            >
              {pasoActual.emoji}
            </motion.div>

            {/* Título */}
            <h2
              className="text-4xl font-black text-center mb-6"
              style={{
                textShadow: '0 3px 0 rgba(0,0,0,0.4), 0 0 20px rgba(16,185,129,0.6)',
              }}
            >
              <span className="text-emerald-300">{pasoActual.titulo}</span>
            </h2>

            {/* Texto */}
            <div className="space-y-4 mb-8">
              {pasoActual.parrafos.map((parrafo, idx) => (
                <motion.p
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="text-white text-xl leading-relaxed font-bold text-center"
                >
                  {parrafo}
                </motion.p>
              ))}
            </div>

            {/* Progreso */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {historia.map((_, idx) => (
                <div
                  key={idx}
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: idx === paso ? 32 : 12,
                    background: idx === paso ? '#10b981' : 'rgba(255,255,255,0.3)',
                  }}
                />
              ))}
            </div>

            {/* Botón */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={avanzar}
              className="
                w-full
                bg-gradient-to-b from-emerald-500 to-emerald-600
                border-4 border-emerald-700
                rounded-2xl
                py-4
                text-white font-black text-2xl
                shadow-[0_6px_0_rgba(4,120,87,1)]
                hover:shadow-[0_8px_0_rgba(4,120,87,1)]
                active:shadow-[0_2px_0_rgba(4,120,87,1)]
                active:translate-y-1
              "
              style={{
                textShadow: '0 2px 0 rgba(0,0,0,0.3)',
                transition: 'none',
              }}
            >
              {paso < historia.length - 1 ? 'CONTINUAR →' : '¡ACEPTAR MISIÓN! ✨'}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function obtenerHistoriaIntroduccion(grupoEtario: string) {
  const historiaBase = [
    {
      emoji: '🏙️',
      titulo: 'La Ciudad en Peligro',
      parrafos: [
        'Nuestra hermosa ciudad siempre tuvo agua cristalina y pura.',
        'Pero algo terrible está sucediendo...',
        'El agua se está volviendo gris, sin sabor, y las plantas están marchitándose.',
      ],
    },
    {
      emoji: '👩‍🔬',
      titulo: 'La Dra. Luna',
      parrafos: [
        'La Dra. Luna, la científica más brillante del Laboratorio de Mezclas Mágicas, descubrió algo importante:',
        '¡El problema puede solucionarse con el CRISTAL ARCOÍRIS!',
        'Un compuesto químico especial que puede purificar toda el agua de la ciudad.',
      ],
    },
    {
      emoji: '🎯',
      titulo: 'Tu Misión',
      parrafos: [
        `¡Bienvenido al laboratorio, aprendiz!`,
        'Para crear el Cristal Arcoíris, necesitas aprender a combinar sustancias químicas usando matemáticas precisas.',
        '¿Estás list@ para esta aventura?',
      ],
    },
  ];

  return historiaBase;
}

/**
 * ============================================================================
 * FASE 2: TEORÍA - FUNDAMENTOS DE QUÍMICA
 * "¿Por qué la química necesita matemáticas?"
 * Duración: ~10 minutos
 * ============================================================================
 */
interface FaseTeoriaProps {
  grupoEtario: string;
  onContinuar: () => void;
}

function FaseTeoria({ grupoEtario, onContinuar }: FaseTeoriaProps) {
  const [concepto, setConcepto] = useState(0);

  const conceptos = obtenerConceptosTeoria(grupoEtario);

  const conceptoActual = conceptos[concepto];

  const avanzar = () => {
    if (concepto < conceptos.length - 1) {
      setConcepto(concepto + 1);
    } else {
      onContinuar();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full p-8 flex items-center justify-center"
    >
      <div className="max-w-5xl w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={concepto}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="
              rounded-3xl p-8 border-4
              backdrop-blur-xl
            "
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              borderColor: 'rgba(59, 130, 246, 0.5)',
            }}
          >
            {/* Badge del concepto */}
            <div className="flex justify-center mb-4">
              <div
                className="px-6 py-2 rounded-full border-3"
                style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  borderColor: 'rgba(59, 130, 246, 0.5)',
                }}
              >
                <span className="text-blue-300 font-black text-sm">
                  CONCEPTO {concepto + 1} DE {conceptos.length}
                </span>
              </div>
            </div>

            {/* Emoji */}
            <div className="text-center text-7xl mb-4">
              {conceptoActual.emoji}
            </div>

            {/* Título */}
            <h2
              className="text-3xl font-black text-center mb-6"
              style={{
                textShadow: '0 3px 0 rgba(0,0,0,0.4)',
              }}
            >
              <span className="text-blue-300">{conceptoActual.titulo}</span>
            </h2>

            {/* Explicación */}
            <div className="space-y-4 mb-6">
              {conceptoActual.explicacion.map((parrafo, idx) => (
                <motion.p
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="text-white text-lg leading-relaxed font-bold"
                >
                  {parrafo}
                </motion.p>
              ))}
            </div>

            {/* Ejemplo visual */}
            {conceptoActual.ejemplo && (
              <div
                className="rounded-2xl p-6 mb-6 border-3"
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-300 font-black text-sm">EJEMPLO</span>
                </div>
                <p className="text-white text-lg font-bold leading-relaxed">
                  {conceptoActual.ejemplo}
                </p>
              </div>
            )}

            {/* Progreso */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {conceptos.map((_, idx) => (
                <div
                  key={idx}
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: idx === concepto ? 32 : 12,
                    background: idx === concepto ? '#3b82f6' : 'rgba(255,255,255,0.3)',
                  }}
                />
              ))}
            </div>

            {/* Botón */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={avanzar}
              className="
                w-full
                bg-gradient-to-b from-blue-500 to-blue-600
                border-4 border-blue-700
                rounded-2xl
                py-4
                text-white font-black text-2xl
                shadow-[0_6px_0_rgba(30,64,175,1)]
                hover:shadow-[0_8px_0_rgba(30,64,175,1)]
                active:shadow-[0_2px_0_rgba(30,64,175,1)]
                active:translate-y-1
              "
              style={{
                textShadow: '0 2px 0 rgba(0,0,0,0.3)',
                transition: 'none',
              }}
            >
              {concepto < conceptos.length - 1 ? 'SIGUIENTE →' : '¡ENTENDIDO! ✓'}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function obtenerConceptosTeoria(grupoEtario: string) {
  // Adaptamos la complejidad según edad
  const esChico = grupoEtario === '6-7';
  const esMedio = grupoEtario === '8-9';

  return [
    {
      emoji: '⚛️',
      titulo: '¿Qué son los Átomos?',
      explicacion: esChico
        ? [
            'Los átomos son las piezas más pequeñas de todo lo que existe.',
            'Son como los ladrillos con los que se construye todo: el agua, el aire, ¡hasta tú estás hecho de átomos!',
            'Son tan pequeños que no puedes verlos, pero están en todas partes.',
          ]
        : [
            'Los átomos son las unidades más pequeñas de la materia.',
            'Imagina que todo en el universo está hecho de piezas microscópicas llamadas átomos.',
            'Hay diferentes tipos de átomos (oxígeno, hidrógeno, carbono...) y cada uno tiene propiedades únicas.',
          ],
      ejemplo: esChico
        ? '🧱 Piensa en los átomos como bloques de LEGO: puedes unirlos de diferentes formas para construir cosas distintas.'
        : '⚛️ El oxígeno que respiras está hecho de átomos de oxígeno (O). Dos átomos de oxígeno juntos forman O₂.',
    },
    {
      emoji: '🔗',
      titulo: '¿Qué son las Moléculas?',
      explicacion: esChico
        ? [
            'Cuando unes dos o más átomos, formas una molécula.',
            'Es como cuando juntas dos bloques de LEGO: ahora tienes una pieza más grande.',
            'El agua que tomas es una molécula hecha de 2 átomos de hidrógeno y 1 de oxígeno.',
          ]
        : [
            'Una molécula es un grupo de átomos unidos entre sí.',
            'Por ejemplo, el agua (H₂O) es una molécula formada por 2 átomos de hidrógeno y 1 de oxígeno.',
            'Las moléculas determinan las propiedades de las sustancias que conocemos.',
          ],
      ejemplo: esChico
        ? '💧 AGUA = H₂O = 2 hidrógenos + 1 oxígeno'
        : '💧 H₂O (agua) es diferente de H₂O₂ (agua oxigenada) aunque ambas tienen hidrógeno y oxígeno. ¡Las proporciones importan!',
    },
    {
      emoji: '🎨',
      titulo: 'Mezclas y Concentraciones',
      explicacion: esChico
        ? [
            'Cuando juntas dos sustancias, haces una mezcla.',
            'Por ejemplo, cuando mezclas agua con jugo en polvo, haces jugo.',
            'Si pones mucho polvo, el jugo queda muy fuerte. Si pones poco, queda aguado.',
          ]
        : [
            'Una mezcla combina dos o más sustancias sin cambiar su composición química.',
            'La concentración indica cuánto soluto (sustancia disuelta) hay en el solvente (líquido).',
            'Ejemplo: 100ml de agua + 20g de sal = solución con 20% de concentración.',
          ],
      ejemplo: esChico
        ? '🧃 Si tienes 1 taza de agua y le pones 2 cucharadas de azúcar, obtienes agua dulce. Si le pones 10 cucharadas, ¡queda súper dulce!'
        : '⚗️ Una solución al 10% significa: 10g de soluto por cada 100ml de solución total.',
    },
    {
      emoji: '🧮',
      titulo: '¿Por qué necesitamos Matemáticas?',
      explicacion: esChico
        ? [
            'Los científicos químicos usan matemáticas TODO EL TIEMPO.',
            'Para hacer una mezcla perfecta, necesitas las cantidades exactas.',
            'Si te equivocas en los números, ¡la mezcla no funcionará!',
          ]
        : [
            'La química es imposible sin matemáticas.',
            'Necesitas calcular proporciones exactas, balancear ecuaciones químicas, y optimizar recursos.',
            'Un error en los cálculos puede arruinar un experimento completo o incluso ser peligroso.',
          ],
      ejemplo: esChico
        ? '🍪 Es como seguir una receta de galletas: si la receta dice 2 tazas de harina y pones 10, las galletas quedarán horribles.'
        : '⚗️ Para crear 500ml de solución al 15%, necesitas calcular: 500ml × 0.15 = 75g de soluto.',
    },
  ];
}

/**
 * ============================================================================
 * FASE 3: TUTORIAL - CÓMO USAR EL LABORATORIO
 * Duración: ~5 minutos
 * ============================================================================
 */
interface FaseTutorialProps {
  grupoEtario: string;
  onContinuar: () => void;
}

function FaseTutorial({ grupoEtario, onContinuar }: FaseTutorialProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full p-8 flex items-center justify-center"
    >
      <div className="max-w-4xl w-full">
        <div
          className="rounded-3xl p-8 border-4 backdrop-blur-xl"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            borderColor: 'rgba(168, 85, 247, 0.5)',
          }}
        >
          <div className="text-center mb-6">
            <div className="text-7xl mb-4">🔬</div>
            <h2
              className="text-4xl font-black text-purple-300"
              style={{ textShadow: '0 3px 0 rgba(0,0,0,0.4)' }}
            >
              TU LABORATORIO VIRTUAL
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              {
                emoji: '⚗️',
                titulo: 'REACTIVOS',
                desc: 'Sustancias químicas que puedes mezclar',
              },
              {
                emoji: '🧪',
                titulo: 'MATRAZ',
                desc: 'Aquí mezclas las sustancias',
              },
              {
                emoji: '📊',
                titulo: 'MEDICIONES',
                desc: 'Ver temperatura, pH y cantidades',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="text-center p-4 rounded-2xl border-3"
                style={{
                  background: 'rgba(168, 85, 247, 0.1)',
                  borderColor: 'rgba(168, 85, 247, 0.3)',
                }}
              >
                <div className="text-5xl mb-2">{item.emoji}</div>
                <div className="text-purple-300 font-black text-lg mb-1">
                  {item.titulo}
                </div>
                <div className="text-white/70 text-sm font-bold">
                  {item.desc}
                </div>
              </motion.div>
            ))}
          </div>

          <div
            className="rounded-2xl p-6 mb-6 border-3"
            style={{
              background: 'rgba(234, 179, 8, 0.1)',
              borderColor: 'rgba(234, 179, 8, 0.3)',
            }}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <div className="text-yellow-300 font-black text-lg mb-2">
                  IMPORTANTE:
                </div>
                <p className="text-white font-bold leading-relaxed">
                  En un laboratorio REAL, los químicos deben seguir recetas EXACTAS.
                  Un error en las cantidades puede cambiar completamente el resultado.
                  ¡Por eso las matemáticas son tan importantes!
                </p>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onContinuar}
            className="
              w-full
              bg-gradient-to-b from-purple-500 to-purple-600
              border-4 border-purple-700
              rounded-2xl
              py-4
              text-white font-black text-2xl
              shadow-[0_6px_0_rgba(88,28,135,1)]
              hover:shadow-[0_8px_0_rgba(88,28,135,1)]
              active:shadow-[0_2px_0_rgba(88,28,135,1)]
              active:translate-y-1
            "
            style={{
              textShadow: '0 2px 0 rgba(0,0,0,0.3)',
              transition: 'none',
            }}
          >
            ¡EMPECEMOS A EXPERIMENTAR! 🔬
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * ============================================================================
 * FASE 4: EXPERIMENTO 1 - MEZCLA DE COLORES
 * "Aprende proporciones mezclando colores"
 * Duración: ~15 minutos
 * ============================================================================
 */
interface FaseExperimento1Props {
  grupoEtario: string;
  onContinuar: () => void;
}

function FaseExperimento1({ grupoEtario, onContinuar }: FaseExperimento1Props) {
  const [objetivo, setObjetivo] = useState(0);
  const [rojo, setRojo] = useState(0);
  const [azul, setAzul] = useState(0);
  const [amarillo, setAmarillo] = useState(0);
  const [resultado, setResultado] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const objetivos = [
    { color: 'VIOLETA', receta: { rojo: 2, azul: 3, amarillo: 0 }, emoji: '💜' },
    { color: 'VERDE', receta: { rojo: 0, azul: 2, amarillo: 3 }, emoji: '💚' },
    { color: 'NARANJA', receta: { rojo: 3, azul: 0, amarillo: 2 }, emoji: '🧡' },
  ];

  const objetivoActual = objetivos[objetivo];

  const mezclar = () => {
    const match =
      rojo === objetivoActual.receta.rojo &&
      azul === objetivoActual.receta.azul &&
      amarillo === objetivoActual.receta.amarillo;

    if (match) {
      setResultado(`¡Perfecto! Creaste ${objetivoActual.color}`);
      setExito(true);
    } else {
      setResultado(`Mmm... no es ${objetivoActual.color}. Revisa las proporciones.`);
      setExito(false);
    }
  };

  const siguienteObjetivo = () => {
    if (objetivo < objetivos.length - 1) {
      setObjetivo(objetivo + 1);
      setRojo(0);
      setAzul(0);
      setAmarillo(0);
      setResultado(null);
      setExito(false);
    } else {
      onContinuar();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full p-8 flex items-center justify-center"
    >
      <div className="max-w-6xl w-full">
        <div
          className="rounded-3xl p-8 border-4 backdrop-blur-xl"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            borderColor: 'rgba(236, 72, 153, 0.5)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">🎨</div>
            <h2
              className="text-3xl font-black text-pink-300 mb-2"
              style={{ textShadow: '0 3px 0 rgba(0,0,0,0.4)' }}
            >
              EXPERIMENTO 1: MEZCLA DE COLORES
            </h2>
            <p className="text-white/80 text-lg font-bold">
              Objetivo {objetivo + 1}/3: Crear el color <span className="text-pink-300">{objetivoActual.color}</span>
            </p>
          </div>

          {/* Receta */}
          <div
            className="rounded-2xl p-6 mb-6 border-3"
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              borderColor: 'rgba(16, 185, 129, 0.3)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 font-black">RECETA SECRETA</span>
            </div>
            <p className="text-white text-xl font-bold">
              {objetivoActual.emoji} {objetivoActual.color}: {objetivoActual.receta.rojo} Rojo + {objetivoActual.receta.azul} Azul + {objetivoActual.receta.amarillo} Amarillo
            </p>
          </div>

          {/* Controles */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { color: 'ROJO', valor: rojo, setter: setRojo, bg: '#ef4444' },
              { color: 'AZUL', valor: azul, setter: setAzul, bg: '#3b82f6' },
              { color: 'AMARILLO', valor: amarillo, setter: setAmarillo, bg: '#eab308' },
            ].map((item) => (
              <div
                key={item.color}
                className="rounded-2xl p-4 border-3"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  borderColor: `${item.bg}80`,
                }}
              >
                <div
                  className="text-center font-black text-lg mb-3"
                  style={{ color: item.bg }}
                >
                  {item.color}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => item.setter(Math.max(0, item.valor - 1))}
                    className="w-10 h-10 rounded-xl bg-black/40 border-2 border-white/30 text-white font-black text-xl"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center">
                    <div className="text-white font-black text-3xl">{item.valor}</div>
                  </div>
                  <button
                    onClick={() => item.setter(Math.min(5, item.valor + 1))}
                    className="w-10 h-10 rounded-xl bg-black/40 border-2 border-white/30 text-white font-black text-xl"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Resultado */}
          {resultado && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-2xl p-6 mb-6 border-3 ${
                exito ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'
              }`}
            >
              <p className={`text-xl font-black text-center ${exito ? 'text-green-300' : 'text-red-300'}`}>
                {resultado}
              </p>
            </motion.div>
          )}

          {/* Botones */}
          <div className="flex gap-4">
            {!exito ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={mezclar}
                className="
                  flex-1
                  bg-gradient-to-b from-pink-500 to-pink-600
                  border-4 border-pink-700
                  rounded-2xl
                  py-4
                  text-white font-black text-2xl
                  shadow-[0_6px_0_rgba(157,23,77,1)]
                "
                style={{ transition: 'none' }}
              >
                🔬 MEZCLAR
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={siguienteObjetivo}
                className="
                  flex-1
                  bg-gradient-to-b from-green-500 to-green-600
                  border-4 border-green-700
                  rounded-2xl
                  py-4
                  text-white font-black text-2xl
                  shadow-[0_6px_0_rgba(21,128,61,1)]
                "
                style={{ transition: 'none' }}
              >
                {objetivo < objetivos.length - 1 ? 'SIGUIENTE COLOR →' : '¡CONTINUAR! ✓'}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * ============================================================================
 * FASE 5: EXPERIMENTO 2 - CONCENTRACIONES
 * "Aprende concentraciones con soluto + solvente"
 * Duración: ~15 minutos
 * ============================================================================
 */
interface FaseExperimento2Props {
  grupoEtario: string;
  onContinuar: () => void;
}

function FaseExperimento2({ grupoEtario, onContinuar }: FaseExperimento2Props) {
  const [nivel, setNivel] = useState(0);
  const [agua, setAgua] = useState(0);
  const [soluto, setSoluto] = useState(0);
  const [resultado, setResultado] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const niveles = obtenerNivelesConcentracion(grupoEtario);
  const nivelActual = niveles[nivel];

  const calcularConcentracion = () => {
    if (agua === 0) return 0;
    return Math.round((soluto / (agua + soluto)) * 100);
  };

  const verificar = () => {
    const concentracionActual = calcularConcentracion();
    const diferencia = Math.abs(concentracionActual - nivelActual.objetivo);

    if (diferencia <= nivelActual.tolerancia) {
      setResultado(`¡Perfecto! Lograste ${concentracionActual}% (objetivo: ${nivelActual.objetivo}%)`);
      setExito(true);
    } else {
      setResultado(`Obtuviste ${concentracionActual}%, pero necesitas ${nivelActual.objetivo}%. ¡Intenta de nuevo!`);
      setExito(false);
    }
  };

  const siguienteNivel = () => {
    if (nivel < niveles.length - 1) {
      setNivel(nivel + 1);
      setAgua(0);
      setSoluto(0);
      setResultado(null);
      setExito(false);
    } else {
      onContinuar();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full p-8 flex items-center justify-center"
    >
      <div className="max-w-6xl w-full">
        <div
          className="rounded-3xl p-8 border-4 backdrop-blur-xl"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            borderColor: 'rgba(59, 130, 246, 0.5)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">💧</div>
            <h2
              className="text-3xl font-black text-blue-300 mb-2"
              style={{ textShadow: '0 3px 0 rgba(0,0,0,0.4)' }}
            >
              EXPERIMENTO 2: CONCENTRACIONES
            </h2>
            <p className="text-white/80 text-lg font-bold">
              Nivel {nivel + 1}/{niveles.length}: {nivelActual.nombre}
            </p>
          </div>

          {/* Objetivo */}
          <div
            className="rounded-2xl p-6 mb-6 border-3"
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              borderColor: 'rgba(16, 185, 129, 0.3)',
            }}
          >
            <div className="text-emerald-300 font-black text-lg mb-2">
              🎯 OBJETIVO:
            </div>
            <p className="text-white text-xl font-bold">
              Crear una solución con <span className="text-emerald-300">{nivelActual.objetivo}%</span> de concentración
            </p>
            <p className="text-white/70 text-sm font-bold mt-2">
              {nivelActual.contexto}
            </p>
          </div>

          {/* Explicación */}
          <div
            className="rounded-2xl p-4 mb-6 border-2"
            style={{
              background: 'rgba(234, 179, 8, 0.1)',
              borderColor: 'rgba(234, 179, 8, 0.3)',
            }}
          >
            <p className="text-yellow-200 text-sm font-bold">
              💡 Fórmula: Concentración% = (Soluto ÷ Total) × 100
            </p>
          </div>

          {/* Controles */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div
              className="rounded-2xl p-6 border-3"
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                borderColor: 'rgba(59, 130, 246, 0.3)',
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Droplet className="w-6 h-6 text-blue-400" />
                <span className="text-blue-300 font-black text-xl">AGUA (Solvente)</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAgua(Math.max(0, agua - 10))}
                  className="w-12 h-12 rounded-xl bg-black/40 border-2 border-white/30 text-white font-black text-2xl"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <div className="text-white font-black text-4xl">{agua}</div>
                  <div className="text-white/60 text-sm font-bold">ml</div>
                </div>
                <button
                  onClick={() => setAgua(agua + 10)}
                  className="w-12 h-12 rounded-xl bg-black/40 border-2 border-white/30 text-white font-black text-2xl"
                >
                  +
                </button>
              </div>
            </div>

            <div
              className="rounded-2xl p-6 border-3"
              style={{
                background: 'rgba(168, 85, 247, 0.1)',
                borderColor: 'rgba(168, 85, 247, 0.3)',
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Beaker className="w-6 h-6 text-purple-400" />
                <span className="text-purple-300 font-black text-xl">SOLUTO (Sal)</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSoluto(Math.max(0, soluto - 5))}
                  className="w-12 h-12 rounded-xl bg-black/40 border-2 border-white/30 text-white font-black text-2xl"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <div className="text-white font-black text-4xl">{soluto}</div>
                  <div className="text-white/60 text-sm font-bold">g</div>
                </div>
                <button
                  onClick={() => setSoluto(soluto + 5)}
                  className="w-12 h-12 rounded-xl bg-black/40 border-2 border-white/30 text-white font-black text-2xl"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Medición actual */}
          {agua + soluto > 0 && (
            <div className="text-center mb-6">
              <div className="text-white/60 text-sm font-bold mb-1">CONCENTRACIÓN ACTUAL:</div>
              <div className="text-cyan-300 font-black text-5xl">
                {calcularConcentracion()}%
              </div>
            </div>
          )}

          {/* Resultado */}
          {resultado && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-2xl p-6 mb-6 border-3 ${
                exito ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'
              }`}
            >
              <p className={`text-xl font-black text-center ${exito ? 'text-green-300' : 'text-red-300'}`}>
                {resultado}
              </p>
            </motion.div>
          )}

          {/* Botones */}
          <div className="flex gap-4">
            {!exito ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={verificar}
                disabled={agua + soluto === 0}
                className="
                  flex-1
                  bg-gradient-to-b from-blue-500 to-blue-600
                  border-4 border-blue-700
                  rounded-2xl
                  py-4
                  text-white font-black text-2xl
                  shadow-[0_6px_0_rgba(30,64,175,1)]
                  disabled:opacity-50
                "
                style={{ transition: 'none' }}
              >
                ✓ VERIFICAR
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={siguienteNivel}
                className="
                  flex-1
                  bg-gradient-to-b from-green-500 to-green-600
                  border-4 border-green-700
                  rounded-2xl
                  py-4
                  text-white font-black text-2xl
                  shadow-[0_6px_0_rgba(21,128,61,1)]
                "
                style={{ transition: 'none' }}
              >
                {nivel < niveles.length - 1 ? 'SIGUIENTE NIVEL →' : '¡CONTINUAR! ✓'}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function obtenerNivelesConcentracion(grupoEtario: string) {
  if (grupoEtario === '6-7') {
    return [
      {
        nombre: 'Nivel Principiante',
        objetivo: 50,
        tolerancia: 10,
        contexto: 'Mitad agua, mitad sal',
      },
      {
        nombre: 'Nivel Intermedio',
        objetivo: 25,
        tolerancia: 10,
        contexto: 'Un cuarto de sal',
      },
    ];
  } else if (grupoEtario === '8-9') {
    return [
      {
        nombre: 'Nivel 1',
        objetivo: 20,
        tolerancia: 5,
        contexto: 'Suero fisiológico',
      },
      {
        nombre: 'Nivel 2',
        objetivo: 50,
        tolerancia: 5,
        contexto: 'Agua de mar',
      },
      {
        nombre: 'Nivel 3',
        objetivo: 10,
        tolerancia: 3,
        contexto: 'Solución diluida',
      },
    ];
  } else {
    return [
      {
        nombre: 'Nivel 1',
        objetivo: 15,
        tolerancia: 3,
        contexto: 'Solución hipotónica',
      },
      {
        nombre: 'Nivel 2',
        objetivo: 35,
        tolerancia: 3,
        contexto: 'Solución hipertónica',
      },
      {
        nombre: 'Nivel 3',
        objetivo: 8,
        tolerancia: 2,
        contexto: 'Concentración precisa',
      },
    ];
  }
}

/**
 * ============================================================================
 * FASE 6: QUIZZES EDUCATIVOS
 * Duración: ~20 minutos
 * ============================================================================
 */
interface FaseQuizzesProps {
  grupoEtario: string;
  onContinuar: () => void;
}

function FaseQuizzes({ grupoEtario, onContinuar }: FaseQuizzesProps) {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<number | null>(null);
  const [mostrarExplicacion, setMostrarExplicacion] = useState(false);

  const preguntas = obtenerPreguntasQuiz(grupoEtario);
  const pregunta = preguntas[preguntaActual];

  const handleRespuesta = (idx: number) => {
    setRespuestaSeleccionada(idx);
    setMostrarExplicacion(true);
  };

  const siguientePregunta = () => {
    if (preguntaActual < preguntas.length - 1) {
      setPreguntaActual(preguntaActual + 1);
      setRespuestaSeleccionada(null);
      setMostrarExplicacion(false);
    } else {
      onContinuar();
    }
  };

  const esCorrecta = respuestaSeleccionada === pregunta.correcta;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full p-8 flex items-center justify-center"
    >
      <div className="max-w-4xl w-full">
        <div
          className="rounded-3xl p-8 border-4 backdrop-blur-xl"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            borderColor: 'rgba(251, 191, 36, 0.5)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">🧠</div>
            <h2
              className="text-3xl font-black text-yellow-300 mb-2"
              style={{ textShadow: '0 3px 0 rgba(0,0,0,0.4)' }}
            >
              QUIZZES EN VIVO
            </h2>
            <p className="text-white/80 text-lg font-bold">
              Pregunta {preguntaActual + 1} de {preguntas.length}
            </p>
          </div>

          {/* Pregunta */}
          <div className="mb-6">
            <p className="text-white text-2xl font-black text-center leading-relaxed">
              {pregunta.pregunta}
            </p>
          </div>

          {/* Opciones */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {pregunta.opciones.map((opcion, idx) => {
              let bgColor = 'rgba(255, 255, 255, 0.1)';
              let borderColor = 'rgba(255, 255, 255, 0.3)';

              if (mostrarExplicacion) {
                if (idx === pregunta.correcta) {
                  bgColor = 'rgba(34, 197, 94, 0.3)';
                  borderColor = 'rgba(34, 197, 94, 0.8)';
                } else if (idx === respuestaSeleccionada) {
                  bgColor = 'rgba(239, 68, 68, 0.3)';
                  borderColor = 'rgba(239, 68, 68, 0.8)';
                }
              }

              return (
                <motion.button
                  key={idx}
                  whileHover={!mostrarExplicacion ? { scale: 1.05 } : {}}
                  whileTap={!mostrarExplicacion ? { scale: 0.95 } : {}}
                  onClick={() => !mostrarExplicacion && handleRespuesta(idx)}
                  disabled={mostrarExplicacion}
                  className="
                    rounded-2xl
                    p-6
                    border-3
                    text-white
                    font-black
                    text-xl
                    disabled:cursor-not-allowed
                  "
                  style={{
                    background: bgColor,
                    borderColor,
                    transition: 'none',
                  }}
                >
                  {opcion}
                </motion.button>
              );
            })}
          </div>

          {/* Explicación */}
          {mostrarExplicacion && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-6 mb-6 border-3 ${
                esCorrecta
                  ? 'bg-green-500/20 border-green-500/50'
                  : 'bg-orange-500/20 border-orange-500/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{esCorrecta ? '✅' : '💡'}</div>
                <div>
                  <div
                    className={`font-black text-lg mb-2 ${
                      esCorrecta ? 'text-green-300' : 'text-orange-300'
                    }`}
                  >
                    {esCorrecta ? '¡CORRECTO!' : 'APRENDE:'}
                  </div>
                  <p className="text-white font-bold leading-relaxed">
                    {pregunta.explicacion}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Botón */}
          {mostrarExplicacion && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={siguientePregunta}
              className="
                w-full
                bg-gradient-to-b from-yellow-500 to-yellow-600
                border-4 border-yellow-700
                rounded-2xl
                py-4
                text-white font-black text-2xl
                shadow-[0_6px_0_rgba(161,98,7,1)]
              "
              style={{ transition: 'none' }}
            >
              {preguntaActual < preguntas.length - 1 ? 'SIGUIENTE PREGUNTA →' : '¡AL DESAFÍO FINAL! 🏆'}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function obtenerPreguntasQuiz(grupoEtario: string) {
  if (grupoEtario === '6-7') {
    return [
      {
        pregunta: '¿Qué son los átomos?',
        opciones: [
          'Las piezas más pequeñas de todo',
          'Un tipo de planeta',
          'Una mascota',
          'Un juguete',
        ],
        correcta: 0,
        explicacion: 'Los átomos son las piezas más pequeñas de todo lo que existe. Son como los bloques de LEGO del universo.',
      },
      {
        pregunta: 'Si mezclas 2 partes de rojo + 1 parte de amarillo, ¿qué color obtienes?',
        opciones: ['Verde', 'Naranja', 'Violeta', 'Azul'],
        correcta: 1,
        explicacion: 'Rojo + Amarillo = Naranja. Las proporciones importan: más rojo hace un naranja más rojizo.',
      },
      {
        pregunta: '¿Para qué sirven las matemáticas en química?',
        opciones: [
          'Para calcular las cantidades exactas',
          'Para hacer dibujos',
          'Para contar hasta 10',
          'No sirven para nada',
        ],
        correcta: 0,
        explicacion: 'Las matemáticas son SÚPER importantes en química para calcular cantidades exactas. Sin matemáticas, los experimentos no funcionan.',
      },
    ];
  } else if (grupoEtario === '8-9') {
    return [
      {
        pregunta: '¿Qué es H₂O?',
        opciones: [
          'Un código secreto',
          'La molécula del agua',
          'Un tipo de sal',
          'Un elemento químico',
        ],
        correcta: 1,
        explicacion: 'H₂O es la fórmula química del agua: 2 átomos de Hidrógeno + 1 átomo de Oxígeno forman una molécula de agua.',
      },
      {
        pregunta: 'Si tienes 100ml de agua y agregas 25g de sal, ¿qué concentración obtienes?',
        opciones: ['10%', '20%', '25%', '50%'],
        correcta: 1,
        explicacion: 'Concentración = (25 ÷ 125) × 100 = 20%. El total es 100ml + 25g = 125 unidades.',
      },
      {
        pregunta: '¿Por qué es importante seguir proporciones exactas en química?',
        opciones: [
          'Para que se vea bonito',
          'Para que la reacción funcione correctamente',
          'No es importante',
          'Solo para impresionar',
        ],
        correcta: 1,
        explicacion: 'Las proporciones exactas son CRÍTICAS. Un pequeño error puede cambiar completamente el resultado o hacer que la reacción no funcione.',
      },
    ];
  } else {
    return [
      {
        pregunta: '¿Qué representa el subíndice en H₂O?',
        opciones: [
          'El peso del átomo',
          'El número de átomos de ese elemento',
          'La temperatura',
          'El color',
        ],
        correcta: 1,
        explicacion: 'El subíndice indica cuántos átomos de ese elemento hay en la molécula. H₂O = 2 hidrógenos, 1 oxígeno (el 1 no se escribe).',
      },
      {
        pregunta: 'Para hacer una solución al 15%, necesitas 300ml total. ¿Cuántos gramos de soluto necesitas?',
        opciones: ['15g', '30g', '45g', '60g'],
        correcta: 2,
        explicacion: 'Soluto = 300ml × 0.15 = 45g. La concentración porcentual indica qué fracción del total es soluto.',
      },
      {
        pregunta: '¿Qué es balancear una ecuación química?',
        opciones: [
          'Hacer que pese lo mismo',
          'Igualar el número de átomos en ambos lados',
          'Mezclar todo parejo',
          'Usar la misma temperatura',
        ],
        correcta: 1,
        explicacion: 'Balancear significa asegurar que hay el MISMO número de átomos de cada elemento antes y después de la reacción. Los átomos no se crean ni destruyen.',
      },
    ];
  }
}

/**
 * ============================================================================
 * FASE 7: DESAFÍO FINAL - CREAR EL CRISTAL ARCOÍRIS
 * "Trabajo en equipos con presupuesto limitado"
 * Duración: ~20 minutos
 * ============================================================================
 */
interface FaseDesafioFinalProps {
  grupoEtario: string;
  onContinuar: () => void;
}

function FaseDesafioFinal({ grupoEtario, onContinuar }: FaseDesafioFinalProps) {
  const [paso, setPaso] = useState(0);

  const pasos = [
    {
      emoji: '🏆',
      titulo: 'EL DESAFÍO FINAL',
      contenido: (
        <div className="space-y-4">
          <p className="text-white text-xl font-bold leading-relaxed">
            ¡Ha llegado el momento de la verdad!
          </p>
          <p className="text-white text-xl font-bold leading-relaxed">
            Debes crear el <span className="text-cyan-300">CRISTAL ARCOÍRIS</span>, el compuesto que salvará toda el agua de la ciudad.
          </p>
          <div
            className="rounded-2xl p-6 border-3"
            style={{
              background: 'rgba(234, 179, 8, 0.1)',
              borderColor: 'rgba(234, 179, 8, 0.3)',
            }}
          >
            <p className="text-yellow-200 text-lg font-bold">
              ⚠️ RESTRICCIONES:
            </p>
            <ul className="text-white font-bold space-y-2 mt-3">
              <li>• Presupuesto limitado: $500</li>
              <li>• Debes producir exactamente 1000ml</li>
              <li>• Concentración objetivo: 30%</li>
              <li>• Trabajo en EQUIPO con tu grupo</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      emoji: '💰',
      titulo: 'GESTIÓN DE PRESUPUESTO',
      contenido: (
        <div className="space-y-4">
          <p className="text-white text-xl font-bold">
            Tu docente te dará el PRECIO de cada reactivo:
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { reactivo: 'Agua destilada', precio: '$5/100ml', emoji: '💧' },
              { reactivo: 'Cristales base', precio: '$10/50g', emoji: '💎' },
              { reactivo: 'Catalizador', precio: '$20/10ml', emoji: '⚗️' },
              { reactivo: 'Estabilizador', precio: '$15/25g', emoji: '🧪' },
            ].map((item) => (
              <div
                key={item.reactivo}
                className="rounded-xl p-4 border-2"
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                }}
              >
                <div className="text-3xl mb-2">{item.emoji}</div>
                <div className="text-blue-300 font-black text-sm mb-1">
                  {item.reactivo}
                </div>
                <div className="text-white font-bold">{item.precio}</div>
              </div>
            ))}
          </div>
          <p className="text-orange-300 text-lg font-black text-center">
            ¡Calcula bien! Si gastas más de $500, pierdes.
          </p>
        </div>
      ),
    },
    {
      emoji: '👥',
      titulo: 'TRABAJO EN EQUIPO',
      contenido: (
        <div className="space-y-4">
          <p className="text-white text-xl font-bold leading-relaxed">
            Este desafío es COLABORATIVO. Tu docente dividirá al grupo en equipos.
          </p>
          <div className="space-y-3">
            {[
              {
                rol: 'MATEMÁTICO',
                tarea: 'Calcula las proporciones exactas y el presupuesto',
                emoji: '🧮',
              },
              {
                rol: 'QUÍMICO',
                tarea: 'Decide qué reactivos usar y en qué orden',
                emoji: '🔬',
              },
              {
                rol: 'GERENTE',
                tarea: 'Coordina al equipo y toma decisiones finales',
                emoji: '👨‍💼',
              },
            ].map((item) => (
              <div
                key={item.rol}
                className="rounded-xl p-4 border-2 flex items-start gap-3"
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                }}
              >
                <div className="text-3xl">{item.emoji}</div>
                <div>
                  <div className="text-emerald-300 font-black mb-1">{item.rol}</div>
                  <div className="text-white font-bold text-sm">{item.tarea}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      emoji: '✨',
      titulo: '¡A CREAR EL CRISTAL!',
      contenido: (
        <div className="space-y-4">
          <p className="text-white text-2xl font-black text-center leading-relaxed">
            Tu docente guiará la simulación del experimento final.
          </p>
          <p className="text-white text-xl font-bold text-center leading-relaxed">
            Cada equipo presentará su plan y veremos quién logra crear el Cristal Arcoíris perfecto.
          </p>
          <div
            className="rounded-2xl p-6 border-3"
            style={{
              background: 'rgba(168, 85, 247, 0.2)',
              borderColor: 'rgba(168, 85, 247, 0.5)',
            }}
          >
            <p className="text-purple-300 text-lg font-black text-center">
              🎯 CRITERIOS DE ÉXITO:
            </p>
            <ul className="text-white font-bold space-y-2 mt-3 text-center">
              <li>✓ Concentración exacta (30% ±2%)</li>
              <li>✓ Volumen correcto (1000ml ±50ml)</li>
              <li>✓ Dentro del presupuesto ($500 máximo)</li>
              <li>✓ Trabajo en equipo y explicación clara</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const pasoActual = pasos[paso];

  const avanzar = () => {
    if (paso < pasos.length - 1) {
      setPaso(paso + 1);
    } else {
      onContinuar();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full p-8 flex items-center justify-center"
    >
      <div className="max-w-4xl w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={paso}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="
              rounded-3xl p-8 border-4
              backdrop-blur-xl
            "
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              borderColor: 'rgba(251, 191, 36, 0.5)',
            }}
          >
            {/* Emoji */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center text-8xl mb-6"
            >
              {pasoActual.emoji}
            </motion.div>

            {/* Título */}
            <h2
              className="text-4xl font-black text-center mb-6"
              style={{
                textShadow: '0 3px 0 rgba(0,0,0,0.4), 0 0 20px rgba(251,191,36,0.6)',
              }}
            >
              <span className="text-yellow-300">{pasoActual.titulo}</span>
            </h2>

            {/* Contenido */}
            <div className="mb-8">{pasoActual.contenido}</div>

            {/* Progreso */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {pasos.map((_, idx) => (
                <div
                  key={idx}
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: idx === paso ? 32 : 12,
                    background: idx === paso ? '#fbbf24' : 'rgba(255,255,255,0.3)',
                  }}
                />
              ))}
            </div>

            {/* Botón */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={avanzar}
              className="
                w-full
                bg-gradient-to-b from-yellow-500 to-yellow-600
                border-4 border-yellow-700
                rounded-2xl
                py-4
                text-white font-black text-2xl
                shadow-[0_6px_0_rgba(161,98,7,1)]
                hover:shadow-[0_8px_0_rgba(161,98,7,1)]
                active:shadow-[0_2px_0_rgba(161,98,7,1)]
                active:translate-y-1
              "
              style={{
                textShadow: '0 2px 0 rgba(0,0,0,0.3)',
                transition: 'none',
              }}
            >
              {paso < pasos.length - 1 ? 'CONTINUAR →' : '¡FINALIZAR CLASE! ✨'}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/**
 * ============================================================================
 * FASE 8: CIERRE Y CELEBRACIÓN
 * Duración: ~5 minutos
 * ============================================================================
 */
interface FaseCierreProps {
  grupoEtario: string;
  onVolver: () => void;
}

function FaseCierre({ grupoEtario, onVolver }: FaseCierreProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full p-8 flex items-center justify-center"
    >
      <div className="max-w-4xl w-full">
        <div
          className="rounded-3xl p-8 border-4 backdrop-blur-xl"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            borderColor: 'rgba(16, 185, 129, 0.5)',
          }}
        >
          {/* Celebración */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center text-9xl mb-6"
          >
            🎉
          </motion.div>

          <h2
            className="text-5xl font-black text-center mb-6"
            style={{
              textShadow: '0 4px 0 rgba(0,0,0,0.4), 0 0 30px rgba(16,185,129,0.8)',
            }}
          >
            <span className="text-emerald-300">¡LO LOGRASTE!</span>
          </h2>

          <p className="text-white text-2xl font-bold text-center mb-8 leading-relaxed">
            ¡Salvaste el agua de la ciudad con tus conocimientos de química y matemáticas!
          </p>

          {/* Logros */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { emoji: '⚛️', titulo: 'QUÍMICO EXPERTO', desc: 'Dominaste átomos y moléculas' },
              { emoji: '🧮', titulo: 'MATEMÁTICO PRO', desc: 'Calculaste proporciones perfectas' },
              { emoji: '🏆', titulo: 'SALVADOR', desc: 'Salvaste la ciudad' },
            ].map((logro, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2 * idx, type: 'spring', bounce: 0.6 }}
                className="text-center p-6 rounded-2xl border-3"
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  borderColor: 'rgba(16, 185, 129, 0.5)',
                }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="text-6xl mb-3"
                >
                  {logro.emoji}
                </motion.div>
                <div className="text-emerald-300 font-black text-lg mb-2">
                  {logro.titulo}
                </div>
                <div className="text-white/80 text-sm font-bold">
                  {logro.desc}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mensaje final */}
          <div
            className="rounded-2xl p-6 mb-8 border-3"
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              borderColor: 'rgba(59, 130, 246, 0.3)',
            }}
          >
            <p className="text-blue-200 text-xl font-bold text-center leading-relaxed">
              💡 Recuerda: Las matemáticas y la química trabajan juntas todo el tiempo.
              ¡Los científicos químicos son también matemáticos expertos!
            </p>
          </div>

          {/* Botón */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onVolver}
            className="
              w-full
              bg-gradient-to-b from-emerald-500 to-emerald-600
              border-4 border-emerald-700
              rounded-2xl
              py-4
              text-white font-black text-2xl
              shadow-[0_6px_0_rgba(4,120,87,1)]
              hover:shadow-[0_8px_0_rgba(4,120,87,1)]
              active:shadow-[0_2px_0_rgba(4,120,87,1)]
              active:translate-y-1
            "
            style={{
              textShadow: '0 2px 0 rgba(0,0,0,0.3)',
              transition: 'none',
            }}
          >
            ✨ FINALIZAR Y VOLVER ✨
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
