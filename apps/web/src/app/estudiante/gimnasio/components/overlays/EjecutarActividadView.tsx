/**
 * Vista de Ejecución de Actividad Individual
 * FULLSCREEN (100vw × 100vh) para ejecutar una actividad específica
 * Estética Brawl Stars pura
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useOverlayStack } from '../../contexts/OverlayStackProvider';
import { getActividadById } from '../../data/actividades-mes-ciencia';
import { TIPO_ACTIVIDAD_COLORS } from '../../types/actividad.types';
import { MultipleChoiceQuestion } from '../ejercicios/MultipleChoiceQuestion';
import { FillBlankQuestion } from '../ejercicios/FillBlankQuestion';
import { VerdaderoFalsoQuestion } from '../ejercicios/VerdaderoFalsoQuestion';
import { VideoPlayer } from '../ejercicios/VideoPlayer';
import { ResultsView } from '../results/ResultsView';
import { calcularResultado } from '../../utils/results-calculator';
import type { OverlayConfig, Pregunta, ContenidoEjercicio, ContenidoVideo } from '../../types/actividad.types';
import type { RespuestaRegistrada, ResultadoCalculado } from '../../utils/results-calculator';

export interface EjecutarActividadViewProps {
  config?: OverlayConfig & { type: 'ejecutar-actividad'; actividadId: string; semanaId: string };
  estudiante?: {
    nombre: string;
    id?: string;
  };
}

export function EjecutarActividadView({ config, estudiante }: EjecutarActividadViewProps) {
  const { pop } = useOverlayStack();

  if (!config || config.type !== 'ejecutar-actividad') {
    return null;
  }

  const actividad = getActividadById(config.actividadId);

  if (!actividad) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-red-950 to-pink-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-3xl font-black">❌ Actividad no encontrada</p>
          <button onClick={pop} className="mt-6 text-cyan-300 underline">
            Volver
          </button>
        </div>
      </div>
    );
  }

  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<RespuestaRegistrada[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [resultado, setResultado] = useState<ResultadoCalculado | null>(null);

  const tiempoInicioRef = useRef<number>(Date.now());

  const tipoColors = TIPO_ACTIVIDAD_COLORS[actividad.tipo];

  // State para ejercicios
  const contenidoEjercicio =
    actividad.contenido.tipo === 'ejercicio' || actividad.contenido.tipo === 'evaluacion'
      ? (actividad.contenido as ContenidoEjercicio)
      : null;

  const totalPreguntas = contenidoEjercicio?.preguntas.length || 0;
  const preguntasRespondidas = respuestas.length;
  const progresoEjercicio = totalPreguntas > 0 ? (preguntasRespondidas / totalPreguntas) * 100 : 0;

  const handleRespuesta = (esCorrecta: boolean, respuesta: string | boolean) => {
    const nuevasRespuestas = [...respuestas, { pregunta: preguntaActual, esCorrecta, respuesta }];
    setRespuestas(nuevasRespuestas);

    // Avanzar a la siguiente pregunta después de 2 segundos
    setTimeout(() => {
      if (preguntaActual < totalPreguntas - 1) {
        setPreguntaActual(preguntaActual + 1);
      } else {
        // Todas las preguntas respondidas - calcular resultados
        const tiempoEmpleado = Math.floor((Date.now() - tiempoInicioRef.current) / 1000);
        const resultadoCalculado = calcularResultado(actividad, nuevasRespuestas, tiempoEmpleado);

        setResultado(resultadoCalculado);
        setMostrarResultados(true);
      }
    }, 2000);
  };

  const handleReintentar = () => {
    setPreguntaActual(0);
    setRespuestas([]);
    setMostrarResultados(false);
    setResultado(null);
    tiempoInicioRef.current = Date.now();
  };

  const handleVolver = () => {
    pop();
  };

  const renderContenido = () => {
    switch (actividad.contenido.tipo) {
      case 'video': {
        const contenidoVideo = actividad.contenido as ContenidoVideo;
        return <VideoPlayer contenido={contenidoVideo} />;
      }

      case 'ejercicio':
      case 'evaluacion': {
        if (!contenidoEjercicio || contenidoEjercicio.preguntas.length === 0) {
          return (
            <div className="text-center text-white text-2xl">
              ⚠️ No hay preguntas configuradas para este ejercicio
            </div>
          );
        }

        const pregunta = contenidoEjercicio.preguntas[preguntaActual];

        return (
          <div className="w-full">
            {/* Indicador de pregunta */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <span
                className="text-2xl font-black text-cyan-300"
                style={{
                  textShadow: '0 3px 0 rgba(0,0,0,0.4)',
                  WebkitTextStroke: '2px black',
                }}
              >
                PREGUNTA {preguntaActual + 1} DE {totalPreguntas}
              </span>
            </motion.div>

            {/* Render de pregunta según tipo */}
            <AnimatePresence mode="wait">
              <motion.div
                key={preguntaActual}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                {renderPregunta(pregunta)}
              </motion.div>
            </AnimatePresence>
          </div>
        );
      }

      case 'juego': {
        return (
          <div className="text-center">
            <div className="text-9xl mb-6">🎮</div>
            <h3
              className="text-4xl font-black text-white mb-4"
              style={{
                textShadow: '0 4px 0 rgba(0,0,0,0.4)',
                WebkitTextStroke: '2px black',
              }}
            >
              JUEGO EN DESARROLLO
            </h3>
            <p className="text-white text-xl">
              ID del juego: {actividad.contenido.juegoId}
            </p>
          </div>
        );
      }

      default:
        return <div className="text-white text-2xl">Tipo de actividad no soportado</div>;
    }
  };

  const renderPregunta = (pregunta: Pregunta) => {
    switch (pregunta.tipo) {
      case 'multiple-choice':
        return (
          <MultipleChoiceQuestion
            pregunta={pregunta}
            onRespuesta={(esCorrecta, opcion) => handleRespuesta(esCorrecta, opcion)}
          />
        );

      case 'fill-blank':
        return (
          <FillBlankQuestion
            pregunta={pregunta}
            onRespuesta={(esCorrecta, respuesta) => handleRespuesta(esCorrecta, respuesta)}
          />
        );

      case 'verdadero-falso':
        return (
          <VerdaderoFalsoQuestion
            pregunta={pregunta}
            onRespuesta={(esCorrecta, respuesta) => handleRespuesta(esCorrecta, respuesta)}
          />
        );

      default:
        return <div className="text-white">Tipo de pregunta no soportado</div>;
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className={`
        fixed inset-0 z-50 flex flex-col overflow-hidden
        bg-gradient-to-br ${tipoColors.gradient.replace('from-', 'from-').replace(' to-', '/90 to-')}/90
      `}
    >
      {/* Header FIJO (h-24) */}
      <div
        className="relative h-24 flex-shrink-0 px-6 flex items-center border-b-4 border-black"
        style={{
          backgroundColor: `${tipoColors.border}33`,
        }}
      >
        {/* Back Button */}
        <button
          onClick={pop}
          className="
            bg-gradient-to-b from-cyan-400 to-blue-500
            border-[5px] border-black
            rounded-2xl
            w-14 h-14
            flex items-center justify-center
            shadow-[0_6px_0_rgba(0,0,0,0.4)]
            hover:translate-y-[-4px]
            hover:shadow-[0_10px_0_rgba(0,0,0,0.4)]
            active:translate-y-[2px]
            active:shadow-[0_2px_0_rgba(0,0,0,0.4)]
            flex-shrink-0
          "
          style={{ transition: 'none' }}
        >
          <ChevronLeft className="w-8 h-8 text-black" strokeWidth={4} />
        </button>

        {/* Título + Progress */}
        <div className="flex-1 ml-6 flex items-center justify-between">
          {/* Título + Emoji */}
          <div className="flex items-center gap-3">
            <span className="text-5xl drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]">
              {actividad.emoji}
            </span>
            <div>
              <h1
                className="
                  font-[family-name:var(--font-lilita)]
                  text-2xl
                  font-black
                  uppercase
                  text-white
                  leading-none
                "
                style={{
                  textShadow: '0 4px 0 rgba(0,0,0,0.4)',
                  WebkitTextStroke: '2px black',
                  paintOrder: 'stroke fill',
                }}
              >
                {actividad.titulo}
              </h1>
              <p
                className="text-xs font-black uppercase text-cyan-300 mt-1"
                style={{
                  textShadow: '0 2px 0 rgba(0,0,0,0.4)',
                  WebkitTextStroke: '1px black',
                }}
              >
                {actividad.tipo === 'video'
                  ? 'VIDEO'
                  : actividad.tipo === 'ejercicio'
                    ? 'EJERCICIO'
                    : actividad.tipo === 'juego'
                      ? 'JUEGO'
                      : 'EVALUACIÓN'}
              </p>
            </div>
          </div>

          {/* Progress para ejercicios */}
          {contenidoEjercicio && (
            <div className="flex items-center gap-4">
              <div className="bg-black/40 border-4 border-black rounded-xl px-4 py-2">
                <span
                  className="text-xl font-black text-white"
                  style={{
                    WebkitTextStroke: '2px black',
                  }}
                >
                  {Math.round(progresoEjercicio)}%
                </span>
              </div>

              <span
                className="text-lg font-black text-white"
                style={{
                  textShadow: '0 2px 0 rgba(0,0,0,0.4)',
                  WebkitTextStroke: '2px black',
                }}
              >
                {preguntasRespondidas}/{totalPreguntas}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Contenido - h-[calc(100vh-6rem)] */}
      <div className="flex-1 h-[calc(100vh-6rem)] flex items-center justify-center p-8 overflow-y-auto">
        {renderContenido()}
      </div>

      {/* Pantalla de Resultados (overlay) */}
      {mostrarResultados && resultado && (
        <ResultsView
          resultado={resultado}
          onVolver={handleVolver}
          onReintentar={handleReintentar}
        />
      )}
    </motion.div>
  );
}
