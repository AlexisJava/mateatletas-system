'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useGamificacionStore } from '@/store/gamificacion.store';
import apiClient from '@/lib/axios';
import {
  Brain,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Timer,
  Target
} from 'lucide-react';
import Confetti from 'react-confetti';

/**
 * T020 - Módulo de Evaluación Diagnóstica Gamificada
 *
 * Features:
 * - Preguntas con animaciones coloridas
 * - Feedback visual inmediato (correcto/incorrecto)
 * - Diseño tipo juego (no examen aburrido)
 * - Progreso visible (X/20 preguntas)
 */

interface Pregunta {
  id: number;
  area: 'calculo' | 'logica' | 'geometria' | 'algebra';
  nivel: 1 | 2 | 3;
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number;
  emoji: string;
}

const PREGUNTAS_MOCK: Pregunta[] = [
  // Cálculo (Nivel 1)
  {
    id: 1,
    area: 'calculo',
    nivel: 1,
    pregunta: '¿Cuánto es 15 + 28?',
    opciones: ['41', '43', '45', '47'],
    respuestaCorrecta: 1,
    emoji: '🧮'
  },
  {
    id: 2,
    area: 'calculo',
    nivel: 1,
    pregunta: '¿Cuánto es 9 × 7?',
    opciones: ['56', '63', '72', '54'],
    respuestaCorrecta: 1,
    emoji: '✖️'
  },
  // Lógica (Nivel 1)
  {
    id: 3,
    area: 'logica',
    nivel: 1,
    pregunta: 'Si tengo 5 manzanas y me regalan 3 más, ¿cuántas tengo?',
    opciones: ['6', '7', '8', '9'],
    respuestaCorrecta: 2,
    emoji: '🍎'
  },
  {
    id: 4,
    area: 'logica',
    nivel: 1,
    pregunta: '¿Qué número sigue? 2, 4, 6, 8, ...',
    opciones: ['9', '10', '11', '12'],
    respuestaCorrecta: 1,
    emoji: '🔢'
  },
  // Geometría (Nivel 1)
  {
    id: 5,
    area: 'geometria',
    nivel: 1,
    pregunta: '¿Cuántos lados tiene un triángulo?',
    opciones: ['2', '3', '4', '5'],
    respuestaCorrecta: 1,
    emoji: '📐'
  },
  {
    id: 6,
    area: 'geometria',
    nivel: 1,
    pregunta: '¿Qué figura tiene 4 lados iguales?',
    opciones: ['Triángulo', 'Cuadrado', 'Círculo', 'Pentágono'],
    respuestaCorrecta: 1,
    emoji: '⬛'
  },
  // Álgebra (Nivel 1)
  {
    id: 7,
    area: 'algebra',
    nivel: 1,
    pregunta: 'Si x + 5 = 12, ¿cuánto vale x?',
    opciones: ['5', '6', '7', '8'],
    respuestaCorrecta: 2,
    emoji: '🎯'
  },
  {
    id: 8,
    area: 'algebra',
    nivel: 1,
    pregunta: '¿Cuánto es 2x si x = 4?',
    opciones: ['6', '8', '10', '12'],
    respuestaCorrecta: 1,
    emoji: '📊'
  },
  // Nivel 2 - Cálculo
  {
    id: 9,
    area: 'calculo',
    nivel: 2,
    pregunta: '¿Cuánto es 45 - 27?',
    opciones: ['16', '17', '18', '19'],
    respuestaCorrecta: 2,
    emoji: '➖'
  },
  {
    id: 10,
    area: 'calculo',
    nivel: 2,
    pregunta: '¿Cuánto es 144 ÷ 12?',
    opciones: ['10', '11', '12', '13'],
    respuestaCorrecta: 2,
    emoji: '➗'
  },
  // Nivel 2 - Lógica
  {
    id: 11,
    area: 'logica',
    nivel: 2,
    pregunta: 'Si un libro cuesta $15 y compro 3, ¿cuánto pago?',
    opciones: ['$40', '$45', '$50', '$55'],
    respuestaCorrecta: 1,
    emoji: '📚'
  },
  {
    id: 12,
    area: 'logica',
    nivel: 2,
    pregunta: '¿Qué número falta? 3, 6, 9, __, 15',
    opciones: ['10', '11', '12', '13'],
    respuestaCorrecta: 2,
    emoji: '🧩'
  },
  // Nivel 2 - Geometría
  {
    id: 13,
    area: 'geometria',
    nivel: 2,
    pregunta: '¿Cuántos grados tiene un ángulo recto?',
    opciones: ['45°', '60°', '90°', '180°'],
    respuestaCorrecta: 2,
    emoji: '📏'
  },
  {
    id: 14,
    area: 'geometria',
    nivel: 2,
    pregunta: 'El perímetro de un cuadrado de lado 5 cm es:',
    opciones: ['15 cm', '20 cm', '25 cm', '30 cm'],
    respuestaCorrecta: 1,
    emoji: '📐'
  },
  // Nivel 2 - Álgebra
  {
    id: 15,
    area: 'algebra',
    nivel: 2,
    pregunta: 'Si 3x = 15, ¿cuánto vale x?',
    opciones: ['3', '4', '5', '6'],
    respuestaCorrecta: 2,
    emoji: '🎲'
  },
  {
    id: 16,
    area: 'algebra',
    nivel: 2,
    pregunta: '¿Cuánto es x + x + x si x = 6?',
    opciones: ['12', '15', '18', '21'],
    respuestaCorrecta: 2,
    emoji: '🔢'
  },
  // Nivel 3 - Mix avanzado
  {
    id: 17,
    area: 'calculo',
    nivel: 3,
    pregunta: '¿Cuánto es 15% de 200?',
    opciones: ['25', '30', '35', '40'],
    respuestaCorrecta: 1,
    emoji: '💯'
  },
  {
    id: 18,
    area: 'logica',
    nivel: 3,
    pregunta: 'Si hoy es martes, ¿qué día será en 10 días?',
    opciones: ['Jueves', 'Viernes', 'Sábado', 'Domingo'],
    respuestaCorrecta: 1,
    emoji: '📅'
  },
  {
    id: 19,
    area: 'geometria',
    nivel: 3,
    pregunta: 'El área de un rectángulo de 6×4 cm es:',
    opciones: ['20 cm²', '24 cm²', '28 cm²', '32 cm²'],
    respuestaCorrecta: 1,
    emoji: '📊'
  },
  {
    id: 20,
    area: 'algebra',
    nivel: 3,
    pregunta: 'Si 2x + 4 = 14, ¿cuánto vale x?',
    opciones: ['4', '5', '6', '7'],
    respuestaCorrecta: 1,
    emoji: '🎯'
  },
];

const AREA_STYLES = {
  calculo: {
    gradient: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    borderClass: 'border-blue-500/50',
    solidBorderClass: 'border-blue-500',
    iconClass: 'text-blue-400',
    label: 'Cálculo',
  },
  logica: {
    gradient: 'bg-gradient-to-r from-purple-500 to-pink-500',
    borderClass: 'border-purple-500/50',
    solidBorderClass: 'border-purple-500',
    iconClass: 'text-purple-400',
    label: 'Lógica',
  },
  geometria: {
    gradient: 'bg-gradient-to-r from-green-500 to-emerald-500',
    borderClass: 'border-green-500/50',
    solidBorderClass: 'border-green-500',
    iconClass: 'text-green-400',
    label: 'Geometría',
  },
  algebra: {
    gradient: 'bg-gradient-to-r from-orange-500 to-red-500',
    borderClass: 'border-orange-500/50',
    solidBorderClass: 'border-orange-500',
    iconClass: 'text-orange-400',
    label: 'Álgebra',
  },
} as const;

export default function EvaluacionDiagnosticaPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchDashboard } = useGamificacionStore();
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>([]);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<number | null>(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [esCorrecta, setEsCorrecta] = useState(false);
  const [evaluacionCompletada, setEvaluacionCompletada] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [tiempoInicio] = useState(Date.now());
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const [puntosGanados, setPuntosGanados] = useState(0);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTiempoTranscurrido(Math.floor((Date.now() - tiempoInicio) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [tiempoInicio]);

  const pregunta = PREGUNTAS_MOCK[preguntaActual];
  const areaInfo = AREA_STYLES[pregunta.area as keyof typeof AREA_STYLES];
  const progreso = ((preguntaActual + 1) / PREGUNTAS_MOCK.length) * 100;

  const handleSeleccionarOpcion = (index: number) => {
    if (mostrarFeedback) return;
    setOpcionSeleccionada(index);
  };

  const handleConfirmarRespuesta = async () => {
    if (opcionSeleccionada === null) return;

    const nuevasRespuestas = [...respuestas, opcionSeleccionada];
    setRespuestas(nuevasRespuestas);

    const correcta = opcionSeleccionada === pregunta.respuestaCorrecta;
    setEsCorrecta(correcta);
    setMostrarFeedback(true);

    // Auto-avanzar después de 2 segundos
    setTimeout(async () => {
      if (preguntaActual < PREGUNTAS_MOCK.length - 1) {
        setPreguntaActual(preguntaActual + 1);
        setOpcionSeleccionada(null);
        setMostrarFeedback(false);
      } else {
        // Evalución completada: registrar puntos en backend
        const { aciertos, porcentaje } = calcularResultadosTemp(nuevasRespuestas);
        const puntos = Math.floor(aciertos * 10); // 10 puntos por respuesta correcta
        setPuntosGanados(puntos);

        try {
          // Llamar al backend para registrar los puntos
          await apiClient.post('/gamificacion/registrar-puntos', {
            puntos: puntos,
            actividad: 'evaluacion_diagnostica',
            detalles: {
              aciertos,
              total: PREGUNTAS_MOCK.length,
              porcentaje,
              tiempoSegundos: tiempoTranscurrido
            }
          });

          // Refresh dashboard para mostrar nuevos puntos
          if (user?.id) {
            await fetchDashboard(user.id);
          }
        } catch (error: unknown) {
          // Error registering points
        }

        setEvaluacionCompletada(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }, 2000);
  };

  // Función helper para calcular resultados sin actualizar el estado
  const calcularResultadosTemp = (respuestasEvaluar = respuestas) => {
    let aciertos = 0;
    PREGUNTAS_MOCK.forEach((p, index) => {
      if (respuestasEvaluar[index] === p.respuestaCorrecta) aciertos++;
    });
    const porcentaje = (aciertos / PREGUNTAS_MOCK.length) * 100;
    return { aciertos, porcentaje };
  };

  const calcularResultados = () => {
    let aciertos = 0;
    const resultadosPorArea: Record<string, { total: number; correctas: number }> = {
      calculo: { total: 0, correctas: 0 },
      logica: { total: 0, correctas: 0 },
      geometria: { total: 0, correctas: 0 },
      algebra: { total: 0, correctas: 0 },
    };

    PREGUNTAS_MOCK.forEach((p, index) => {
      const respuestaUsuario = respuestas[index];
      const esCorrecta = respuestaUsuario === p.respuestaCorrecta;

      if (esCorrecta) aciertos++;

      resultadosPorArea[p.area].total++;
      if (esCorrecta) resultadosPorArea[p.area].correctas++;
    });

    const porcentaje = (aciertos / PREGUNTAS_MOCK.length) * 100;

    return { aciertos, porcentaje, resultadosPorArea };
  };

  const formatTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (evaluacionCompletada) {
    const { aciertos, porcentaje, resultadosPorArea } = calcularResultados();

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
        {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header de Resultados */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 rounded-3xl shadow-2xl p-8 text-center border-2 border-yellow-400"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
              className="text-8xl mb-4"
            >
              🏆
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
              ¡Evaluación Completada!
            </h1>
            <p className="text-white/90 text-xl font-semibold">
              Obtuviste {aciertos} de {PREGUNTAS_MOCK.length} respuestas correctas
            </p>
            <div className="mt-4 flex gap-4 justify-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/30">
                <div className="text-5xl font-black text-white">
                  {Math.round(porcentaje)}%
                </div>
                <div className="text-sm text-white/80 font-semibold">PUNTUACIÓN</div>
              </div>
              <div className="inline-block bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl px-6 py-3 border-2 border-yellow-400 shadow-lg shadow-yellow-500/50">
                <div className="text-5xl font-black text-white">
                  +{puntosGanados}
                </div>
                <div className="text-sm text-white/90 font-semibold">PUNTOS GANADOS 💎</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-white/80">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                <span className="font-semibold">{formatTiempo(tiempoTranscurrido)}</span>
              </div>
            </div>
          </motion.div>

          {/* Desglose por Área */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(resultadosPorArea).map(([area, datos]) => {
              const areaInfo =
                AREA_STYLES[area as keyof typeof AREA_STYLES] ?? AREA_STYLES.calculo;
              const porcentajeArea = (datos.correctas / datos.total) * 100;

              return (
                <motion.div
                  key={area}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border-2 border-slate-700 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{areaInfo.label}</h3>
                    <Target className={`w-6 h-6 ${areaInfo.iconClass}`} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm font-semibold">Aciertos:</span>
                      <span className="text-white text-2xl font-black">
                        {datos.correctas}/{datos.total}
                      </span>
                    </div>
                    <div className="relative w-full h-3 bg-black/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${porcentajeArea}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className={`h-full ${areaInfo.gradient} rounded-full`}
                      />
                    </div>
                    <div className="text-center">
                      <span className="text-lg font-bold text-white">
                        {Math.round(porcentajeArea)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={() => router.push('/estudiante/dashboard')}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all text-lg"
            >
              Volver al Dashboard
            </button>
            <button
              onClick={() => {
                setPreguntaActual(0);
                setRespuestas([]);
                setOpcionSeleccionada(null);
                setMostrarFeedback(false);
                setEvaluacionCompletada(false);
              }}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all text-lg"
            >
              Reintentar Evaluación
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header con Progreso */}
        <div className="space-y-4">
          {/* Botón Volver */}
          <button
            onClick={() => router.push('/estudiante/dashboard')}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Volver al Dashboard</span>
          </button>

          {/* Card de Progreso */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${areaInfo.gradient} rounded-3xl shadow-2xl p-6 border-2 ${areaInfo.borderClass}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Brain className="w-10 h-10 text-white" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-white">
                    Evaluación Diagnóstica
                  </h1>
                  <p className="text-white/90 text-sm font-semibold">
                    {areaInfo.label} • Pregunta {preguntaActual + 1} de {PREGUNTAS_MOCK.length}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-white/90 mb-1">
                  <Timer className="w-5 h-5" />
                  <span className="font-bold text-lg">{formatTiempo(tiempoTranscurrido)}</span>
                </div>
                <div className="text-xs text-white/70 font-semibold">Tiempo transcurrido</div>
              </div>
            </div>

            {/* Barra de Progreso */}
            <div className="relative w-full h-4 bg-black/30 rounded-full overflow-hidden border border-white/20">
              <motion.div
                initial={{ width: `${progreso - 5}%` }}
                animate={{ width: `${progreso}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </motion.div>
            </div>
            <div className="text-center mt-2">
              <span className="text-sm text-white/80 font-bold">{Math.round(progreso)}% completado</span>
            </div>
          </motion.div>
        </div>

        {/* Pregunta */}
        <AnimatePresence mode="wait">
          <motion.div
            key={preguntaActual}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl p-8 border-2 border-slate-700"
          >
            {/* Emoji y Pregunta */}
            <div className="text-center mb-8">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="text-8xl mb-6"
              >
                {pregunta.emoji}
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {pregunta.pregunta}
              </h2>
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold text-white ${areaInfo.gradient} border border-white/20`}>
                Nivel {pregunta.nivel} • {areaInfo.label}
              </div>
            </div>

            {/* Opciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {pregunta.opciones.map((opcion, index) => {
                const esSeleccionada = opcionSeleccionada === index;
                const esRespuestaCorrecta = mostrarFeedback && index === pregunta.respuestaCorrecta;
                const esRespuestaIncorrecta = mostrarFeedback && esSeleccionada && !esCorrecta;

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleSeleccionarOpcion(index)}
                    disabled={mostrarFeedback}
                    whileHover={!mostrarFeedback ? { scale: 1.02, y: -4 } : {}}
                    whileTap={!mostrarFeedback ? { scale: 0.98 } : {}}
                    className={`
                      relative p-6 rounded-2xl font-bold text-lg transition-all border-2
                      ${esRespuestaCorrecta ? 'bg-green-500 text-white border-green-400 shadow-lg shadow-green-500/50' : ''}
                      ${esRespuestaIncorrecta ? 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/50' : ''}
                      ${!mostrarFeedback && esSeleccionada ? `${areaInfo.gradient} text-white ${areaInfo.solidBorderClass} shadow-lg` : ''}
                      ${!mostrarFeedback && !esSeleccionada ? 'bg-slate-700 text-white border-slate-600 hover:bg-slate-600' : ''}
                      ${mostrarFeedback && !esRespuestaCorrecta && !esRespuestaIncorrecta ? 'opacity-50' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex-1 text-left">{opcion}</span>
                      {mostrarFeedback && esRespuestaCorrecta && (
                        <CheckCircle className="w-7 h-7 flex-shrink-0" />
                      )}
                      {mostrarFeedback && esRespuestaIncorrecta && (
                        <XCircle className="w-7 h-7 flex-shrink-0" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback Visual */}
            <AnimatePresence>
              {mostrarFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-6 rounded-2xl text-center ${
                    esCorrecta
                      ? 'bg-green-500/20 border-2 border-green-500/50'
                      : 'bg-red-500/20 border-2 border-red-500/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3 mb-2">
                    {esCorrecta ? (
                      <>
                        <Sparkles className="w-8 h-8 text-green-400" />
                        <span className="text-2xl font-black text-green-400">¡Excelente!</span>
                        <Sparkles className="w-8 h-8 text-green-400" />
                      </>
                    ) : (
                      <>
                        <span className="text-2xl font-black text-red-400">¡Casi! Sigue intentando</span>
                      </>
                    )}
                  </div>
                  <p className="text-white text-sm font-semibold">
                    {esCorrecta ? '+10 puntos' : 'La respuesta correcta era: ' + pregunta.opciones[pregunta.respuestaCorrecta]}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botón Confirmar */}
            {!mostrarFeedback && (
              <button
                onClick={handleConfirmarRespuesta}
                disabled={opcionSeleccionada === null}
                className={`
                  w-full font-bold py-4 text-lg rounded-xl transition-all
                  ${opcionSeleccionada !== null
                    ? `${areaInfo.gradient} text-white shadow-lg hover:shadow-xl`
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {opcionSeleccionada !== null ? 'Confirmar Respuesta' : 'Selecciona una opción'}
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
