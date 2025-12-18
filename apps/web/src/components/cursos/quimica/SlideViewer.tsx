/**
 * SLIDE VIEWER - Renderiza todos los tipos de slides
 * ====================================================
 *
 * Componente que toma un slide y lo renderiza según su tipo.
 * Para nenes de 6-7 años - TODO interactivo, SIN código.
 */

'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import ReactMarkdown from 'react-markdown';
import { DragDropGame, MatchingGame, OrdenarGame } from '@/components/core';
import SimulacionExperimento from '@/components/quimica/SimulacionExperimento';
import {
  SimulacionInercia,
  SimulacionFuerzaComparacion,
  SimulacionEspacioSinFriccion,
  SimulacionRampaAceleracion,
} from '@/components/simulations';
import type {
  Slide as SlideQuimica,
  SlideCuento,
  SlideTeoria,
  SlideAnalogia,
  SlideQuiz,
  SlideVerdaderoFalso,
  SlideDragDrop,
  SlideMatching,
  SlideOrdenar,
  SlideSimulacion,
  SlideCelebracion,
} from '@/data/quimica/types';

import type { Slide as SlideAstroB1 } from '@/data/astronomia/slides-sistema-solar-b1';
import type { Slide as SlideAstroB2 } from '@/data/astronomia/slides-estrellas-b2';
import type { Slide as SlideAstroB3 } from '@/data/astronomia/slides-universo-b3';

// Type for física slides - they follow similar structure to química but with different content
type SlideFisica = {
  tipo: string;
  titulo?: string;
  title?: string;
  description?: string;
  contenido?: string;
  content?: any[];
  [key: string]: any; // Allow other properties
};

type SlideUnion = SlideQuimica | SlideAstroB1 | SlideAstroB2 | SlideAstroB3 | SlideFisica;

interface SlideViewerProps {
  slide: SlideUnion;
  onCompleted?: () => void;
}

export default function SlideViewer({ slide, onCompleted }: SlideViewerProps) {
  // Detectar simuladores especiales de astronomía
  // DISABLED: Components removed
  // if (slide.tipo === 'simulacion_supernova') {
  //   return <SimuladorSupernova onComplete={onCompleted || (() => {})} />;
  // }

  // if (slide.tipo === 'simulacion_quasar') {
  //   return <SimuladorQuasar onComplete={onCompleted || (() => {})} />;
  // }

  switch (slide.tipo) {
    case 'cuento':
      // Detectar si es formato química (con escenas) o física (con contenido)
      if ('escenas' in slide) {
        return <CuentoSlide slide={slide as SlideCuento} onCompleted={onCompleted} />;
      } else {
        return (
          <CuentoFisicaSlide
            slide={slide as SlideFisica & { tipo: 'cuento' }}
            onCompleted={onCompleted}
          />
        );
      }
    case 'teoria':
      // Detectar formato
      if ('puntosClave' in slide) {
        return <TeoriaSlide slide={slide as SlideTeoria} onCompleted={onCompleted} />;
      } else {
        return (
          <TeoriaFisicaSlide
            slide={slide as SlideFisica & { tipo: 'teoria' }}
            onCompleted={onCompleted}
          />
        );
      }
    case 'analogia':
      // Detectar formato
      if ('comparacion' in slide) {
        return <AnalogiaSilde slide={slide as SlideAnalogia} onCompleted={onCompleted} />;
      } else {
        return (
          <AnalogiaSlideFisica
            slide={slide as SlideFisica & { tipo: 'analogia' }}
            onCompleted={onCompleted}
          />
        );
      }
    case 'quiz':
      // Detectar formato
      if (
        'opciones' in slide &&
        Array.isArray(slide.opciones) &&
        slide.opciones.length > 0 &&
        typeof slide.opciones[0] === 'object'
      ) {
        return <QuizSlide slide={slide as SlideQuiz} onCompleted={onCompleted} />;
      } else {
        return (
          <QuizFisicaSlide
            slide={slide as SlideFisica & { tipo: 'quiz' }}
            onCompleted={onCompleted}
          />
        );
      }
    case 'verdadero_falso':
      // Detectar si usa formato de afirmaciones múltiples o formato simple
      if ('afirmaciones' in slide && slide.afirmaciones && slide.afirmaciones.length > 0) {
        return (
          <VerdaderoFalsoSlide slide={slide as SlideVerdaderoFalso} onCompleted={onCompleted} />
        );
      } else {
        return (
          <VerdaderoFalsoSimpleSlide
            slide={slide as SlideFisica & { tipo: 'verdadero_falso' }}
            onCompleted={onCompleted}
          />
        );
      }
    case 'drag_drop':
      return <DragDropSlide slide={slide as SlideDragDrop} onCompleted={onCompleted} />;
    case 'matching':
      return <MatchingSlide slide={slide as SlideMatching} onCompleted={onCompleted} />;
    case 'ordenar':
      return <OrdenarSlide slide={slide as SlideOrdenar} onCompleted={onCompleted} />;
    case 'simulacion':
      return <SimulacionSlide slide={slide as SlideSimulacion} onCompleted={onCompleted} />;
    case 'celebracion':
      // Detectar formato
      if ('logros' in slide) {
        return <CelebracionSlide slide={slide as SlideCelebracion} />;
      } else {
        return <CelebracionFisicaSlide slide={slide as SlideFisica & { tipo: 'celebracion' }} />;
      }
    case 'intro':
      return (
        <IntroSlide slide={slide as SlideFisica & { tipo: 'intro' }} onCompleted={onCompleted} />
      );
    case 'actividad_fisica':
      return (
        <ActividadFisicaSlide
          slide={slide as SlideFisica & { tipo: 'actividad_fisica' }}
          onCompleted={onCompleted}
        />
      );
    case 'reflexion':
      return (
        <ReflexionSlide
          slide={slide as SlideFisica & { tipo: 'reflexion' }}
          onCompleted={onCompleted}
        />
      );
    case 'simulacion_fisica':
      const simSlide = slide as SlideFisica & {
        tipo: 'simulacion_fisica';
        simulacion_tipo: string;
      };
      switch (simSlide.simulacion_tipo) {
        case 'inercia':
          return <SimulacionInercia onComplete={onCompleted} />;
        case 'fuerza_comparacion':
          return <SimulacionFuerzaComparacion onComplete={onCompleted} />;
        case 'espacio_sin_friccion':
          return <SimulacionEspacioSinFriccion onComplete={onCompleted} />;
        case 'rampa_aceleracion':
          return <SimulacionRampaAceleracion onComplete={onCompleted} />;
        default:
          return <div>Simulación no encontrada</div>;
      }
    default:
      return <div>Tipo de slide desconocido</div>;
  }
}

// ============================================================================
// CUENTO: Historia con escenas (QUÍMICA)
// ============================================================================

function CuentoSlide({ slide, onCompleted }: { slide: SlideCuento; onCompleted?: () => void }) {
  const [escenaActual, setEscenaActual] = useState(0);

  // Verificar que escenas existe y tiene contenido
  if (!slide.escenas || slide.escenas.length === 0) {
    return <div className="text-white text-center">Error: Slide sin escenas</div>;
  }

  const escena = slide.escenas[escenaActual];
  const esUltima = escenaActual === slide.escenas.length - 1;

  const siguiente = () => {
    if (esUltima) {
      onCompleted?.();
    } else {
      setEscenaActual(escenaActual + 1);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center animate-fadeIn px-4">
      <div
        className={`max-w-7xl w-full bg-gradient-to-br ${escena.color || 'from-purple-900 to-blue-900'} rounded-3xl p-8 md:p-12 border-4 border-white/20`}
      >
        {/* Emoji gigante */}
        <div className="text-9xl text-center mb-8 animate-bounce">{escena.imagen}</div>

        {/* Texto de la escena */}
        <p className="text-3xl text-white text-center leading-relaxed font-bold mb-8">
          {escena.texto}
        </p>

        {/* Indicador de progreso */}
        <div className="flex justify-center gap-3 mb-8">
          {slide.escenas.map((_: any, i: number) => (
            <div
              key={i}
              className={`h-3 rounded-full transition-all ${
                i === escenaActual
                  ? 'w-12 bg-white'
                  : i < escenaActual
                    ? 'w-3 bg-green-400'
                    : 'w-3 bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Botón */}
        <button
          onClick={siguiente}
          className="w-full px-8 py-6 bg-white text-purple-900 rounded-2xl font-black text-2xl hover:scale-105 transition-transform shadow-2xl"
        >
          {esUltima ? '¡Siguiente! →' : 'Continuar →'}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// TEORÍA: Explicación de concepto
// ============================================================================

function TeoriaSlide({ slide, onCompleted }: { slide: SlideTeoria; onCompleted?: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4 py-4 animate-fadeIn">
      <div className="max-w-7xl w-full">
        {/* Título */}
        <h2 className="text-3xl md:text-4xl font-black text-center mb-3 md:mb-4">
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {slide.emoji} {slide.titulo}
          </span>
        </h2>

        {/* Contenido principal */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-3 md:p-5 mb-3 border-2 border-cyan-500/30">
          <p className="text-lg md:text-xl text-white leading-relaxed text-center">
            {slide.contenido}
          </p>
        </div>

        {/* Puntos clave */}
        <div className="grid gap-2 mb-3">
          {slide.puntosClave.map((punto: string, i: number) => (
            <div
              key={i}
              className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-2 border-purple-500/50 rounded-lg p-3"
            >
              <p className="text-base md:text-lg text-white leading-snug">{punto}</p>
            </div>
          ))}
        </div>

        {/* Dato curioso */}
        {slide.datoCurioso && (
          <div className="bg-yellow-500/20 border-2 border-yellow-500/50 rounded-lg p-3 mb-3">
            <div className="flex items-start gap-2">
              <div className="text-2xl md:text-3xl">💡</div>
              <div>
                <div className="text-yellow-300 font-bold text-sm md:text-base mb-1">
                  ¿Sabías que?
                </div>
                <p className="text-white text-sm md:text-base leading-snug">{slide.datoCurioso}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onCompleted}
          className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-black text-xl transition-all hover:scale-105 shadow-2xl"
        >
          ¡Entendido! →
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// ANALOGIA: Comparacion
// ============================================================================

function AnalogiaSilde({ slide, onCompleted }: { slide: SlideAnalogia; onCompleted?: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-2 py-1 animate-fadeIn overflow-y-auto">
      <div className="max-w-6xl w-full">
        <h2 className="text-xl md:text-2xl font-black text-center mb-2">
          <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            {slide.emoji} {slide.titulo}
          </span>
        </h2>

        {/* Concepto principal */}
        <div className="bg-gradient-to-br from-purple-900/60 to-blue-900/60 border border-purple-500 rounded-lg p-2.5 mb-2">
          <p className="text-base md:text-lg font-black text-white mb-1 text-center">
            {slide.comparacion.concepto}
          </p>
          <p className="text-sm md:text-base text-cyan-300 text-center font-bold">
            {slide.comparacion.esComoParte1}
          </p>
        </div>

        {/* Explicación del porqué */}
        <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/50 rounded-lg p-2.5 mb-2">
          <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide text-center font-bold">
            ¿Por qué?
          </p>
          <p className="text-sm md:text-base text-white leading-tight text-center">
            {slide.comparacion.porque}
          </p>
        </div>

        {/* Ejemplo concreto */}
        <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/50 rounded-lg p-2.5 mb-2">
          <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide text-center font-bold">
            Ejemplo
          </p>
          <p className="text-sm md:text-base text-white leading-tight text-center">
            {slide.comparacion.ejemplo}
          </p>
        </div>

        <button
          onClick={onCompleted}
          className="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-black text-base md:text-lg transition-all hover:scale-105 shadow-xl"
        >
          ¡Ahora lo entiendo! →
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// QUIZ: Pregunta con opciones
// ============================================================================

function QuizSlide({ slide, onCompleted }: { slide: SlideQuiz; onCompleted?: () => void }) {
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);

  // IMPORTANTE: Resetear estado cuando cambia el slide
  useEffect(() => {
    setSeleccionada(null);
    setMostrarFeedback(false);
  }, [slide.id]);

  const seleccionar = (index: number) => {
    setSeleccionada(index);
    setMostrarFeedback(true);

    const opcion = slide.opciones[index];
    if (opcion.correcta) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const continuar = () => {
    if (seleccionada !== null && slide.opciones[seleccionada].correcta) {
      onCompleted?.();
    } else {
      setSeleccionada(null);
      setMostrarFeedback(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-4 py-4 animate-fadeIn">
      <div className="max-w-6xl w-full">
        {/* Pregunta */}
        <h2 className="text-4xl font-black text-center mb-4">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            {slide.emoji} {slide.titulo}
          </span>
        </h2>

        <p className="text-3xl text-white text-center mb-12 font-bold">{slide.pregunta}</p>

        {/* Opciones */}
        <div className="grid gap-6 mb-8">
          {slide.opciones.map((opcion: any, i: number) => {
            const estaSeleccionada = seleccionada === i;
            const esCorrecta = opcion.correcta;

            return (
              <button
                key={i}
                onClick={() => !mostrarFeedback && seleccionar(i)}
                disabled={mostrarFeedback}
                className={`p-8 rounded-3xl border-4 transition-all text-left ${
                  !mostrarFeedback
                    ? 'bg-slate-800/80 border-slate-600 hover:border-cyan-500 hover:scale-105'
                    : estaSeleccionada
                      ? esCorrecta
                        ? 'bg-green-500/30 border-green-500 scale-105'
                        : 'bg-red-500/30 border-red-500'
                      : 'bg-slate-800/40 border-slate-700 opacity-50'
                }`}
              >
                <div className="flex items-center gap-6">
                  <div className="text-6xl">{opcion.emoji}</div>
                  <p className="text-2xl font-bold text-white flex-1">{opcion.texto}</p>
                  {mostrarFeedback && estaSeleccionada && (
                    <div className="text-5xl">{esCorrecta ? '✅' : '❌'}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {mostrarFeedback && seleccionada !== null && (
          <div
            className={`rounded-3xl p-8 mb-6 border-4 ${
              slide.opciones[seleccionada].correcta
                ? 'bg-green-500/20 border-green-500'
                : 'bg-red-500/20 border-red-500'
            }`}
          >
            <p className="text-2xl text-white text-center font-bold">
              {slide.opciones[seleccionada].feedback}
            </p>
          </div>
        )}

        {mostrarFeedback && (
          <button
            onClick={continuar}
            className={`w-full px-8 py-6 rounded-2xl font-black text-2xl transition-all hover:scale-105 shadow-2xl ${
              seleccionada !== null && slide.opciones[seleccionada].correcta
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white'
            }`}
          >
            {seleccionada !== null && slide.opciones[seleccionada].correcta
              ? '¡Siguiente! →'
              : '🔄 Intentar de nuevo'}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// VERDADERO/FALSO
// ============================================================================

function VerdaderoFalsoSlide({
  slide,
  onCompleted,
}: {
  slide: SlideVerdaderoFalso;
  onCompleted?: () => void;
}) {
  const [respuestas, setRespuestas] = useState<(boolean | null)[]>(
    new Array(slide.afirmaciones.length).fill(null),
  );
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const responder = (index: number, respuesta: boolean) => {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[index] = respuesta;
    setRespuestas(nuevasRespuestas);
  };

  const verificar = () => {
    if (respuestas.every((r) => r !== null)) {
      setMostrarResultados(true);

      const todasCorrectas = respuestas.every((resp, i) => resp === slide.afirmaciones[i].correcta);

      if (todasCorrectas) {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const continuar = () => {
    const todasCorrectas = respuestas.every((resp, i) => resp === slide.afirmaciones[i].correcta);

    if (todasCorrectas) {
      onCompleted?.();
    } else {
      setRespuestas(new Array(slide.afirmaciones.length).fill(null));
      setMostrarResultados(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-4 py-4 animate-fadeIn overflow-auto">
      <div className="max-w-7xl w-full">
        <h2 className="text-5xl font-black text-center mb-12">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {slide.emoji} {slide.titulo}
          </span>
        </h2>

        <div className="grid gap-6 mb-8">
          {slide.afirmaciones.map((afirmacion: any, i: number) => {
            const respondida = respuestas[i] !== null;
            const esCorrecta = respondida && respuestas[i] === afirmacion.correcta;

            return (
              <div
                key={i}
                className={`bg-gradient-to-br rounded-3xl p-6 border-4 transition-all ${
                  !mostrarResultados
                    ? 'from-slate-800/80 to-slate-900/80 border-slate-600'
                    : esCorrecta
                      ? 'from-green-500/20 to-green-600/20 border-green-500'
                      : 'from-red-500/20 to-red-600/20 border-red-500'
                }`}
              >
                <p className="text-2xl text-white mb-6 font-bold">{afirmacion.texto}</p>

                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => !mostrarResultados && responder(i, true)}
                    disabled={mostrarResultados}
                    className={`flex-1 px-6 py-4 rounded-2xl font-black text-xl transition-all ${
                      respuestas[i] === true
                        ? 'bg-cyan-500 text-white scale-105'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    ✅ VERDADERO
                  </button>
                  <button
                    onClick={() => !mostrarResultados && responder(i, false)}
                    disabled={mostrarResultados}
                    className={`flex-1 px-6 py-4 rounded-2xl font-black text-xl transition-all ${
                      respuestas[i] === false
                        ? 'bg-red-500 text-white scale-105'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    ❌ FALSO
                  </button>
                </div>

                {mostrarResultados && (
                  <div
                    className={`rounded-xl p-4 ${esCorrecta ? 'bg-green-500/20' : 'bg-red-500/20'}`}
                  >
                    <p className="text-white text-lg">{afirmacion.explicacion}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!mostrarResultados && respuestas.every((r) => r !== null) && (
          <button
            onClick={verificar}
            className="w-full px-8 py-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-2xl font-black text-2xl transition-all hover:scale-105 shadow-2xl"
          >
            ✓ Verificar Respuestas
          </button>
        )}

        {mostrarResultados && (
          <button
            onClick={continuar}
            className={`w-full px-8 py-6 rounded-2xl font-black text-2xl transition-all hover:scale-105 shadow-2xl ${
              respuestas.every((resp, i) => resp === slide.afirmaciones[i].correcta)
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white'
            }`}
          >
            {respuestas.every((resp, i) => resp === slide.afirmaciones[i].correcta)
              ? '¡Siguiente! →'
              : '🔄 Intentar de nuevo'}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PLACEHOLDERS PARA SLIDES MÁS COMPLEJOS
// (Drag & Drop, Matching, Ordenar, Simulación requieren más lógica)
// ============================================================================

function DragDropSlide({ slide, onCompleted }: { slide: SlideDragDrop; onCompleted?: () => void }) {
  return (
    <DragDropGame
      titulo={slide.titulo}
      instrucciones={slide.instrucciones}
      categorias={slide.categorias}
      elementos={slide.items}
      onCompleted={onCompleted}
    />
  );
}

function MatchingSlide({ slide, onCompleted }: { slide: SlideMatching; onCompleted?: () => void }) {
  return (
    <MatchingGame
      titulo={slide.titulo}
      instrucciones={slide.instrucciones}
      pares={slide.pares}
      onCompleted={onCompleted}
    />
  );
}

function OrdenarSlide({ slide, onCompleted }: { slide: SlideOrdenar; onCompleted?: () => void }) {
  return (
    <OrdenarGame
      titulo={slide.titulo}
      instrucciones={slide.instrucciones}
      pasos={slide.pasos}
      onCompleted={onCompleted}
    />
  );
}

function SimulacionSlide({
  slide,
  onCompleted,
}: {
  slide: SlideSimulacion;
  onCompleted?: () => void;
}) {
  return <SimulacionExperimento slide={slide} onComplete={onCompleted || (() => {})} />;
}

// ============================================================================
// CELEBRACIÓN
// ============================================================================

function CelebracionSlide({ slide }: { slide: SlideCelebracion }) {
  useEffect(() => {
    // Lanzar confeti al montar
    const interval = setInterval(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 300);

    setTimeout(() => clearInterval(interval), 3000);
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center px-4 py-4 animate-fadeIn">
      <div className="max-w-7xl w-full text-center">
        <div className="text-9xl mb-8 animate-bounce">{slide.emoji}</div>

        <h1 className="text-7xl font-black mb-8">
          <span className="block bg-gradient-to-r from-yellow-300 via-green-300 to-emerald-300 bg-clip-text text-transparent mb-4">
            {slide.titulo}
          </span>
        </h1>

        <p className="text-3xl text-white mb-12 font-bold">{slide.mensaje}</p>

        <div className="grid md:grid-cols-2 gap-6">
          {slide.logros.map((logro: string, i: number) => (
            <div
              key={i}
              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500 rounded-2xl p-6"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <p className="text-2xl text-white font-bold">{logro}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// INTRO: Bienvenida al tema
// ============================================================================

function IntroSlide({
  slide,
  onCompleted,
}: {
  slide: SlideFisica & { tipo: 'intro' };
  onCompleted?: () => void;
}) {
  return (
    <div className="h-full flex flex-col px-4 py-6 animate-fadeIn overflow-y-auto">
      <div className="max-w-6xl w-full mx-auto text-center">
        {/* Emoji */}
        <div className="text-7xl mb-6 animate-bounce">{slide.emoji}</div>

        {/* Título */}
        <h1 className="text-4xl md:text-5xl font-black mb-6">
          <span className="block bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
            {slide.titulo}
          </span>
        </h1>

        {/* Contenido con Markdown */}
        <div className="bg-gradient-to-br from-emerald-900/30 via-teal-900/30 to-cyan-900/30 backdrop-blur-xl rounded-2xl p-6 md:p-8 border-2 border-emerald-500/20 mb-6">
          <div className="text-lg md:text-xl text-white leading-relaxed prose prose-invert prose-lg max-w-none [&_p]:mb-4 [&_h1]:mb-4 [&_h2]:mb-3 [&_h3]:mb-3 [&_ul]:mb-4 [&_li]:mb-2">
            <ReactMarkdown>{slide.contenido}</ReactMarkdown>
          </div>
        </div>

        {/* Botón */}
        <button
          onClick={onCompleted}
          className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-black text-lg transition-all shadow-xl"
        >
          {slide.cta || 'Comenzar'} →
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// ACTIVIDAD FÍSICA: Invita a levantarse y experimentar
// ============================================================================

function ActividadFisicaSlide({
  slide,
  onCompleted,
}: {
  slide: SlideFisica & { tipo: 'actividad_fisica' };
  onCompleted?: () => void;
}) {
  return (
    <div className="h-full flex flex-col px-4 py-6 animate-fadeIn overflow-y-auto">
      <div className="max-w-6xl w-full mx-auto">
        {/* Emoji */}
        <div className="text-7xl text-center mb-6 animate-bounce">{slide.emoji}</div>

        {/* Título */}
        <h2 className="text-4xl md:text-5xl font-black text-center mb-6">
          <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
            {slide.titulo}
          </span>
        </h2>

        {/* Contenido con Markdown */}
        <div className="bg-gradient-to-br from-orange-900/30 via-yellow-900/30 to-red-900/30 backdrop-blur-xl rounded-2xl p-6 md:p-8 border-2 border-orange-500/30 mb-6">
          <div className="text-lg md:text-xl text-white leading-relaxed prose prose-invert prose-lg max-w-none [&_p]:mb-4 [&_h1]:mb-4 [&_h2]:mb-3 [&_h3]:mb-3 [&_ul]:mb-4 [&_li]:mb-2">
            <ReactMarkdown>{slide.contenido}</ReactMarkdown>
          </div>
        </div>

        {/* Info de la actividad */}
        {slide.actividad && (
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:justify-between text-white text-base">
              <span>⏱️ Duración: {slide.actividad.duracion}</span>
              <span>🎯 {slide.actividad.instrucciones}</span>
            </div>
          </div>
        )}

        {/* Botón */}
        <button
          onClick={onCompleted}
          className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 text-white rounded-xl font-black text-lg transition-all shadow-xl"
        >
          {slide.cta || 'Ya terminé'} →
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// REFLEXIÓN: Pregunta abierta para reflexionar
// ============================================================================

function ReflexionSlide({
  slide,
  onCompleted,
}: {
  slide: SlideFisica & { tipo: 'reflexion' };
  onCompleted?: () => void;
}) {
  const [reflexion, setReflexion] = useState('');

  const handleSubmit = () => {
    if (reflexion.trim().length >= 20) {
      // TODO: Guardar reflexión en Supabase si es necesario
      onCompleted?.();
    } else {
      alert('Por favor, escribí al menos 20 caracteres en tu reflexión. 😊');
    }
  };

  return (
    <div className="h-full flex flex-col px-4 py-6 animate-fadeIn overflow-y-auto">
      <div className="max-w-5xl w-full mx-auto">
        {/* Emoji */}
        <div className="text-6xl text-center mb-5">{slide.emoji}</div>

        {/* Título */}
        <h2 className="text-3xl md:text-4xl font-black text-center mb-5">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {slide.titulo}
          </span>
        </h2>

        {/* Contenido con Markdown */}
        <div className="bg-gradient-to-br from-purple-900/30 via-pink-900/30 to-blue-900/30 backdrop-blur-xl rounded-2xl p-6 mb-6 border-2 border-purple-500/20">
          <div className="text-lg md:text-xl text-white leading-relaxed prose prose-invert prose-lg max-w-none mb-6 [&_p]:mb-4 [&_h1]:mb-4 [&_h2]:mb-3 [&_h3]:mb-3 [&_ul]:mb-4 [&_li]:mb-2">
            <ReactMarkdown>{slide.contenido}</ReactMarkdown>
          </div>

          {/* Área de texto */}
          <textarea
            value={reflexion}
            onChange={(e) => setReflexion(e.target.value)}
            placeholder="Escribí tu reflexión aquí... ✏️"
            className="w-full h-40 px-5 py-4 bg-slate-800 border-2 border-purple-500/30 rounded-xl text-white text-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />

          <p className="text-sm text-slate-400 mt-2">{reflexion.length} caracteres (mínimo 20)</p>
        </div>

        {/* Botón */}
        <button
          onClick={handleSubmit}
          disabled={reflexion.trim().length < 20}
          className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black text-lg transition-all shadow-xl"
        >
          {slide.cta || 'Guardar reflexión'} →
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTES ESPECÍFICOS PARA FÍSICA (formato simple con contenido markdown)
// ============================================================================

// Cuento Física: Texto simple sin escenas
function CuentoFisicaSlide({
  slide,
  onCompleted,
}: {
  slide: SlideFisica & { tipo: 'cuento' };
  onCompleted?: () => void;
}) {
  return (
    <div className="h-full flex flex-col px-4 py-6 animate-fadeIn overflow-y-auto">
      <div className="max-w-6xl w-full mx-auto">
        {/* Emoji */}
        {slide.emoji && (
          <div className="text-7xl text-center mb-6 animate-bounce">{slide.emoji}</div>
        )}

        {/* Título */}
        <h2 className="text-4xl md:text-5xl font-black text-center mb-6">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {slide.titulo}
          </span>
        </h2>

        {/* Contenido con Markdown */}
        <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-2xl p-6 md:p-8 border-2 border-white/20 mb-6">
          <div className="text-lg md:text-xl text-white leading-relaxed prose prose-invert prose-lg max-w-none [&_p]:mb-4 [&_h1]:mb-4 [&_h2]:mb-3 [&_h3]:mb-3 [&_ul]:mb-4 [&_li]:mb-2">
            <ReactMarkdown>{slide.contenido}</ReactMarkdown>
          </div>
        </div>

        {/* Botón */}
        <button
          onClick={onCompleted}
          className="w-full px-8 py-4 bg-white text-purple-900 rounded-xl font-black text-lg hover:scale-105 transition-transform shadow-xl"
        >
          {slide.cta || '¡Siguiente! →'}
        </button>
      </div>
    </div>
  );
}

// Teoría Física: Contenido simple con markdown
function TeoriaFisicaSlide({
  slide,
  onCompleted,
}: {
  slide: SlideFisica & { tipo: 'teoria' };
  onCompleted?: () => void;
}) {
  return (
    <div className="h-full flex flex-col px-4 py-6 animate-fadeIn overflow-y-auto">
      <div className="max-w-6xl w-full mx-auto">
        {/* Título */}
        <h2 className="text-3xl md:text-4xl font-black text-center mb-6">
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {slide.emoji} {slide.titulo}
          </span>
        </h2>

        {/* Contenido principal con Markdown */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 md:p-8 mb-6 border-2 border-cyan-500/30">
          <div className="text-lg md:text-xl text-white leading-relaxed prose prose-invert prose-lg max-w-none [&_p]:mb-4 [&_h1]:mb-4 [&_h2]:mb-3 [&_h3]:mb-3 [&_ul]:mb-4 [&_li]:mb-2">
            <ReactMarkdown>{slide.contenido}</ReactMarkdown>
          </div>
        </div>

        <button
          onClick={onCompleted}
          className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-black text-lg transition-all hover:scale-105 shadow-xl"
        >
          {slide.cta || '¡Entendido! →'}
        </button>
      </div>
    </div>
  );
}

// Quiz Física: Formato simple con opciones string[]
function QuizFisicaSlide({
  slide,
  onCompleted,
}: {
  slide: SlideFisica & { tipo: 'quiz' };
  onCompleted?: () => void;
}) {
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);

  // Hook DEBE estar antes de cualquier return temprano
  useEffect(() => {
    setSeleccionada(null);
    setMostrarFeedback(false);
  }, [slide.id]);

  if (!slide.pregunta || !slide.opciones || slide.respuesta_correcta === undefined) {
    return <div className="text-white text-center">Error: Quiz mal configurado</div>;
  }

  const seleccionar = (index: number) => {
    setSeleccionada(index);
    setMostrarFeedback(true);

    if (index === slide.respuesta_correcta) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const continuar = () => {
    if (seleccionada !== null && seleccionada === slide.respuesta_correcta) {
      onCompleted?.();
    } else {
      setSeleccionada(null);
      setMostrarFeedback(false);
    }
  };

  return (
    <div className="h-full flex flex-col px-4 py-6 animate-fadeIn overflow-y-auto">
      <div className="max-w-6xl w-full mx-auto">
        {/* Pregunta */}
        <h2 className="text-3xl md:text-4xl font-black text-center mb-5">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            {slide.emoji} {slide.titulo}
          </span>
        </h2>

        <p className="text-xl md:text-2xl text-white text-center mb-6 font-bold">
          {slide.pregunta}
        </p>

        {/* Opciones */}
        <div className="grid gap-4 mb-6">
          {slide.opciones.map((opcion: string, i: number) => {
            const estaSeleccionada = seleccionada === i;
            const esCorrecta = i === slide.respuesta_correcta;

            return (
              <button
                key={i}
                onClick={() => !mostrarFeedback && seleccionar(i)}
                disabled={mostrarFeedback}
                className={`p-5 rounded-2xl border-3 transition-all text-left ${
                  !mostrarFeedback
                    ? 'bg-slate-800/80 border-slate-600 hover:border-cyan-500 hover:scale-105'
                    : estaSeleccionada
                      ? esCorrecta
                        ? 'bg-green-500/30 border-green-500 scale-105'
                        : 'bg-red-500/30 border-red-500'
                      : 'bg-slate-800/40 border-slate-700 opacity-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <p className="text-lg md:text-xl font-bold text-white flex-1">{opcion}</p>
                  {mostrarFeedback && estaSeleccionada && (
                    <div className="text-3xl">{esCorrecta ? '✅' : '❌'}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {mostrarFeedback && seleccionada !== null && (
          <div
            className={`rounded-2xl p-6 mb-6 border-3 ${
              seleccionada === slide.respuesta_correcta
                ? 'bg-green-500/20 border-green-500'
                : 'bg-red-500/20 border-red-500'
            }`}
          >
            <p className="text-lg md:text-xl text-white text-center font-bold">
              {seleccionada === slide.respuesta_correcta
                ? slide.feedback_correcto
                : slide.feedback_incorrecto}
            </p>
          </div>
        )}

        {mostrarFeedback && (
          <button
            onClick={continuar}
            className={`w-full px-8 py-4 rounded-xl font-black text-lg transition-all hover:scale-105 shadow-xl ${
              seleccionada !== null && seleccionada === slide.respuesta_correcta
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white'
            }`}
          >
            {seleccionada !== null && seleccionada === slide.respuesta_correcta
              ? '¡Siguiente! →'
              : '🔄 Intentar de nuevo'}
          </button>
        )}
      </div>
    </div>
  );
}

// Verdadero/Falso Simple: Formato con pregunta y dos opciones
function VerdaderoFalsoSimpleSlide({
  slide,
  onCompleted,
}: {
  slide: SlideFisica & { tipo: 'verdadero_falso' };
  onCompleted?: () => void;
}) {
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);

  // Hook DEBE estar antes de cualquier return temprano
  useEffect(() => {
    setSeleccionada(null);
    setMostrarFeedback(false);
  }, [slide.id]);

  if (!slide.pregunta || !slide.opciones || slide.respuesta_correcta === undefined) {
    return <div className="text-white text-center">Error: Slide mal configurado</div>;
  }

  const seleccionar = (index: number) => {
    setSeleccionada(index);
    setMostrarFeedback(true);

    if (index === slide.respuesta_correcta) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const continuar = () => {
    if (seleccionada !== null && seleccionada === slide.respuesta_correcta) {
      onCompleted?.();
    } else {
      setSeleccionada(null);
      setMostrarFeedback(false);
    }
  };

  return (
    <div className="h-full flex flex-col px-4 py-6 animate-fadeIn overflow-y-auto">
      <div className="max-w-6xl w-full mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-5">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {slide.emoji} {slide.titulo}
          </span>
        </h2>

        <p className="text-xl md:text-2xl text-white text-center mb-8 font-bold">
          {slide.pregunta}
        </p>

        <div className="flex gap-4 mb-6">
          {slide.opciones.map((opcion: string, i: number) => {
            const estaSeleccionada = seleccionada === i;
            const esCorrecta = i === slide.respuesta_correcta;

            return (
              <button
                key={i}
                onClick={() => !mostrarFeedback && seleccionar(i)}
                disabled={mostrarFeedback}
                className={`flex-1 px-6 py-8 rounded-2xl font-black text-xl md:text-2xl transition-all border-3 ${
                  !mostrarFeedback
                    ? 'bg-slate-800 border-slate-600 hover:border-cyan-500 hover:scale-105 text-white'
                    : estaSeleccionada
                      ? esCorrecta
                        ? 'bg-green-500/30 border-green-500 scale-105 text-white'
                        : 'bg-red-500/30 border-red-500 text-white'
                      : 'bg-slate-800/40 border-slate-700 opacity-50 text-white'
                }`}
              >
                {opcion}
                {mostrarFeedback && estaSeleccionada && (
                  <div className="text-4xl mt-3">{esCorrecta ? '✅' : '❌'}</div>
                )}
              </button>
            );
          })}
        </div>

        {mostrarFeedback && seleccionada !== null && (
          <div
            className={`rounded-2xl p-6 mb-6 border-3 ${
              seleccionada === slide.respuesta_correcta
                ? 'bg-green-500/20 border-green-500'
                : 'bg-red-500/20 border-red-500'
            }`}
          >
            <p className="text-lg md:text-xl text-white text-center font-bold">
              {seleccionada === slide.respuesta_correcta
                ? slide.feedback_correcto
                : slide.feedback_incorrecto}
            </p>
          </div>
        )}

        {mostrarFeedback && (
          <button
            onClick={continuar}
            className={`w-full px-8 py-4 rounded-xl font-black text-lg transition-all hover:scale-105 shadow-xl ${
              seleccionada !== null && seleccionada === slide.respuesta_correcta
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white'
            }`}
          >
            {seleccionada !== null && seleccionada === slide.respuesta_correcta
              ? '¡Siguiente! →'
              : '🔄 Intentar de nuevo'}
          </button>
        )}
      </div>
    </div>
  );
}

// Analogía Física: Formato simple con contenido
function AnalogiaSlideFisica({
  slide,
  onCompleted,
}: {
  slide: SlideFisica & { tipo: 'analogia' };
  onCompleted?: () => void;
}) {
  return (
    <div className="h-full flex flex-col px-4 py-6 animate-fadeIn overflow-y-auto">
      <div className="max-w-6xl w-full mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-6">
          <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            {slide.emoji} {slide.titulo}
          </span>
        </h2>

        {/* Contenido principal con Markdown */}
        <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-500/50 rounded-2xl p-6 md:p-8 mb-6">
          <div className="text-lg md:text-xl text-white leading-relaxed prose prose-invert prose-lg max-w-none [&_p]:mb-4 [&_h1]:mb-4 [&_h2]:mb-3 [&_h3]:mb-3 [&_ul]:mb-4 [&_li]:mb-2">
            <ReactMarkdown>{slide.contenido}</ReactMarkdown>
          </div>
        </div>

        <button
          onClick={onCompleted}
          className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-black text-lg transition-all hover:scale-105 shadow-xl"
        >
          {slide.cta || '¡Ahora lo entiendo! →'}
        </button>
      </div>
    </div>
  );
}

// Celebración Física: Formato simple con contenido
function CelebracionFisicaSlide({ slide }: { slide: SlideFisica & { tipo: 'celebracion' } }) {
  useEffect(() => {
    const interval = setInterval(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 300);

    setTimeout(() => clearInterval(interval), 3000);
  }, []);

  return (
    <div className="h-full flex flex-col px-4 py-6 animate-fadeIn overflow-y-auto">
      <div className="max-w-6xl w-full mx-auto text-center">
        <div className="text-7xl mb-6 animate-bounce">{slide.emoji}</div>

        <h1 className="text-4xl md:text-5xl font-black mb-6">
          <span className="block bg-gradient-to-r from-yellow-300 via-green-300 to-emerald-300 bg-clip-text text-transparent">
            {slide.titulo}
          </span>
        </h1>

        <div className="text-lg md:text-xl text-white mb-8 font-bold leading-relaxed prose prose-invert prose-lg max-w-none [&_p]:mb-4 [&_h1]:mb-4 [&_h2]:mb-3 [&_h3]:mb-3 [&_ul]:mb-4 [&_li]:mb-2">
          <ReactMarkdown>{slide.contenido}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
