'use client';

import React, { ReactElement, useState, useCallback, useEffect, useRef } from 'react';
import {
  Timer,
  Zap,
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Play,
  Star,
  Flame,
} from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

interface Ejercicio {
  id: string;
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: string;
  puntos: number;
}

interface ChallengeModeExampleData {
  instruccion: string;
  titulo: string;
  ejercicios: Ejercicio[];
  tiempoPorPregunta: number;
  multiplicadorRacha?: number;
  mostrarPuntuacion?: boolean;
}

type EstadoJuego = 'inicio' | 'jugando' | 'finalizado';

/**
 * Preview interactivo del componente ChallengeMode
 */
function ChallengeModePreviewComponent({ exampleData }: PreviewComponentProps): ReactElement {
  const data = exampleData as ChallengeModeExampleData;

  const [estadoJuego, setEstadoJuego] = useState<EstadoJuego>('inicio');
  const [ejercicioActual, setEjercicioActual] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(data.tiempoPorPregunta);
  const [puntuacion, setPuntuacion] = useState(0);
  const [racha, setRacha] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(0);
  const [respuestas, setRespuestas] = useState<
    { correcto: boolean; tiempo: number; puntos: number }[]
  >([]);
  const [mostrandoResultado, setMostrandoResultado] = useState(false);
  const [ultimaRespuestaCorrecta, setUltimaRespuestaCorrecta] = useState<boolean | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const ejercicio = data.ejercicios[ejercicioActual];

  // Timer
  useEffect(() => {
    if (estadoJuego === 'jugando' && !mostrandoResultado && tiempoRestante > 0) {
      timerRef.current = setInterval(() => {
        setTiempoRestante((prev) => {
          if (prev <= 1) {
            // Tiempo agotado
            handleRespuesta(null);
            return data.tiempoPorPregunta;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [estadoJuego, mostrandoResultado, tiempoRestante, data.tiempoPorPregunta]);

  const iniciarJuego = useCallback(() => {
    setEstadoJuego('jugando');
    setEjercicioActual(0);
    setTiempoRestante(data.tiempoPorPregunta);
    setPuntuacion(0);
    setRacha(0);
    setMejorRacha(0);
    setRespuestas([]);
    setMostrandoResultado(false);
    setUltimaRespuestaCorrecta(null);
  }, [data.tiempoPorPregunta]);

  const handleRespuesta = useCallback(
    (respuesta: string | null) => {
      if (!ejercicio || mostrandoResultado) return;

      if (timerRef.current) clearInterval(timerRef.current);

      const esCorrecta = respuesta === ejercicio.respuestaCorrecta;
      const tiempoUsado = data.tiempoPorPregunta - tiempoRestante;
      const multiplicador = data.multiplicadorRacha ?? 1.5;

      let puntosGanados = 0;
      if (esCorrecta) {
        // Bonus por tiempo + multiplicador por racha
        const bonusTiempo = Math.max(0, (tiempoRestante / data.tiempoPorPregunta) * 50);
        const multiplicadorRacha = 1 + racha * (multiplicador - 1) * 0.1;
        puntosGanados = Math.round((ejercicio.puntos + bonusTiempo) * multiplicadorRacha);
      }

      setUltimaRespuestaCorrecta(esCorrecta);
      setMostrandoResultado(true);

      setRespuestas((prev) => [
        ...prev,
        { correcto: esCorrecta, tiempo: tiempoUsado, puntos: puntosGanados },
      ]);

      if (esCorrecta) {
        setPuntuacion((prev) => prev + puntosGanados);
        setRacha((prev) => {
          const nuevaRacha = prev + 1;
          setMejorRacha((mejor) => Math.max(mejor, nuevaRacha));
          return nuevaRacha;
        });
      } else {
        setRacha(0);
      }

      // Siguiente pregunta o finalizar
      setTimeout(() => {
        setMostrandoResultado(false);
        setUltimaRespuestaCorrecta(null);

        if (ejercicioActual < data.ejercicios.length - 1) {
          setEjercicioActual((prev) => prev + 1);
          setTiempoRestante(data.tiempoPorPregunta);
        } else {
          setEstadoJuego('finalizado');
        }
      }, 1500);
    },
    [ejercicio, mostrandoResultado, tiempoRestante, racha, ejercicioActual, data],
  );

  const reiniciar = useCallback(() => {
    setEstadoJuego('inicio');
  }, []);

  // Calcular estadisticas finales
  const correctas = respuestas.filter((r) => r.correcto).length;
  const precision = respuestas.length > 0 ? Math.round((correctas / respuestas.length) * 100) : 0;

  // Pantalla de inicio
  if (estadoJuego === 'inicio') {
    return (
      <div className="relative">
        <div className="rounded-xl border border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Zap className="w-10 h-10 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{data.titulo}</h2>
            <p className="text-slate-300 mb-6">{data.instruccion}</p>

            <div className="flex items-center justify-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Timer className="w-4 h-4" />
                <span>{data.tiempoPorPregunta}s por pregunta</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Star className="w-4 h-4" />
                <span>{data.ejercicios.length} preguntas</span>
              </div>
            </div>

            <button
              type="button"
              onClick={iniciarJuego}
              className="flex items-center gap-2 mx-auto px-6 py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold text-lg transition-colors"
            >
              <Play className="w-5 h-5" />
              Iniciar Desafio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de juego
  if (estadoJuego === 'jugando' && ejercicio) {
    const porcentajeTiempo = (tiempoRestante / data.tiempoPorPregunta) * 100;
    const tiempoCritico = tiempoRestante <= 5;

    return (
      <div className="relative">
        {/* Header con stats */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-xl font-bold text-white">{puntuacion}</span>
            </div>
            {racha > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 rounded-lg">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-bold text-orange-400">x{racha}</span>
              </div>
            )}
          </div>
          <div className="text-sm text-slate-400">
            {ejercicioActual + 1} / {data.ejercicios.length}
          </div>
        </div>

        {/* Timer bar */}
        <div className="mb-4">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${tiempoCritico ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${porcentajeTiempo}%` }}
            />
          </div>
          <div className="flex items-center justify-center mt-1">
            <Timer
              className={`w-4 h-4 mr-1 ${tiempoCritico ? 'text-red-400' : 'text-slate-400'}`}
            />
            <span
              className={`text-lg font-mono ${tiempoCritico ? 'text-red-400' : 'text-slate-300'}`}
            >
              {tiempoRestante}s
            </span>
          </div>
        </div>

        {/* Pregunta */}
        <div className="rounded-xl border border-slate-700 overflow-hidden">
          <div className="bg-slate-900 p-4">
            <p className="text-lg font-medium text-white text-center">{ejercicio.pregunta}</p>
          </div>

          <div className="bg-slate-800/50 p-4 grid grid-cols-2 gap-3">
            {ejercicio.opciones.map((opcion, idx) => (
              <button
                key={opcion}
                type="button"
                onClick={() => handleRespuesta(opcion)}
                disabled={mostrandoResultado}
                className={`
                  p-4 rounded-lg font-medium transition-all text-left
                  ${mostrandoResultado && opcion === ejercicio.respuestaCorrecta ? 'bg-green-600 text-white' : ''}
                  ${mostrandoResultado && opcion !== ejercicio.respuestaCorrecta ? 'bg-slate-700/50 text-slate-500' : ''}
                  ${!mostrandoResultado ? 'bg-slate-700 text-white hover:bg-slate-600 hover:scale-[1.02]' : ''}
                `}
              >
                <span className="text-slate-400 mr-2">{String.fromCharCode(65 + idx)}.</span>
                {opcion}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback animado */}
        {mostrandoResultado && (
          <div
            className={`
              fixed inset-0 flex items-center justify-center pointer-events-none z-50
              animate-pulse
            `}
          >
            <div
              className={`
                p-6 rounded-full
                ${ultimaRespuestaCorrecta ? 'bg-green-500' : 'bg-red-500'}
              `}
            >
              {ultimaRespuestaCorrecta ? (
                <CheckCircle2 className="w-16 h-16 text-white" />
              ) : (
                <XCircle className="w-16 h-16 text-white" />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Pantalla de resultados
  return (
    <div className="relative">
      <div className="rounded-xl border border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Desafio Completado</h2>

          <div className="text-5xl font-bold text-yellow-400 mb-4">{puntuacion}</div>
          <p className="text-slate-400 mb-6">puntos totales</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{correctas}</div>
              <div className="text-xs text-slate-400">Correctas</div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{precision}%</div>
              <div className="text-xs text-slate-400">Precision</div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">{mejorRacha}</div>
              <div className="text-xs text-slate-400">Mejor racha</div>
            </div>
          </div>

          <button
            type="button"
            onClick={reiniciar}
            className="flex items-center gap-2 mx-auto px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Jugar de nuevo
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Documentacion de props
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instruccion para el estudiante',
    required: true,
  },
  {
    name: 'titulo',
    type: 'string',
    description: 'Titulo del modo desafio',
    required: true,
  },
  {
    name: 'ejercicios',
    type: 'array',
    description: 'Lista de ejercicios con pregunta, opciones, respuesta y puntos',
    required: true,
  },
  {
    name: 'tiempoPorPregunta',
    type: 'number',
    description: 'Tiempo en segundos para responder cada pregunta',
    required: true,
  },
  {
    name: 'multiplicadorRacha',
    type: 'number',
    description: 'Multiplicador de puntos por racha de respuestas correctas',
    required: false,
    defaultValue: '1.5',
  },
  {
    name: 'mostrarPuntuacion',
    type: 'boolean',
    description: 'Si se muestra la puntuacion durante el juego',
    required: false,
    defaultValue: 'true',
  },
];

/**
 * Datos de ejemplo
 */
const exampleData: ChallengeModeExampleData = {
  instruccion: 'Responde lo mas rapido posible para ganar mas puntos',
  titulo: 'Desafio de Ciencias',
  tiempoPorPregunta: 15,
  multiplicadorRacha: 1.5,
  mostrarPuntuacion: true,
  ejercicios: [
    {
      id: 'c1',
      pregunta: 'Cual es el planeta mas grande del sistema solar?',
      opciones: ['Marte', 'Jupiter', 'Saturno', 'Neptuno'],
      respuestaCorrecta: 'Jupiter',
      puntos: 100,
    },
    {
      id: 'c2',
      pregunta: 'Que gas es esencial para la respiracion?',
      opciones: ['Nitrogeno', 'Dioxido de carbono', 'Oxigeno', 'Hidrogeno'],
      respuestaCorrecta: 'Oxigeno',
      puntos: 100,
    },
    {
      id: 'c3',
      pregunta: 'Cual es la formula del agua?',
      opciones: ['CO2', 'H2O', 'NaCl', 'O2'],
      respuestaCorrecta: 'H2O',
      puntos: 100,
    },
    {
      id: 'c4',
      pregunta: 'Cuantos huesos tiene el cuerpo humano adulto?',
      opciones: ['156', '206', '256', '306'],
      respuestaCorrecta: '206',
      puntos: 150,
    },
    {
      id: 'c5',
      pregunta: 'Cual es el metal mas abundante en la corteza terrestre?',
      opciones: ['Hierro', 'Aluminio', 'Cobre', 'Oro'],
      respuestaCorrecta: 'Aluminio',
      puntos: 150,
    },
  ],
};

/**
 * Definicion del preview para el registry
 */
export const ChallengeModePreview: PreviewDefinition = {
  component: ChallengeModePreviewComponent,
  exampleData,
  propsDocumentation,
};
