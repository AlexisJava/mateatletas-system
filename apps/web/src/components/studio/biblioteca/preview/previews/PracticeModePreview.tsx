'use client';

import React, { ReactElement, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Lightbulb, ArrowRight, Target } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

interface Ejercicio {
  id: string;
  pregunta: string;
  tipo: 'opcionMultiple' | 'verdaderoFalso' | 'completar';
  opciones?: string[];
  respuestaCorrecta: string;
  pista?: string;
  explicacion?: string;
}

interface PracticeModeExampleData {
  instruccion: string;
  titulo: string;
  ejercicios: Ejercicio[];
  mostrarPistas?: boolean;
  mostrarExplicacion?: boolean;
  permitirReintentos?: boolean;
}

interface EstadoEjercicio {
  respondido: boolean;
  correcto: boolean | null;
  respuestaUsuario: string | null;
  mostrandoPista: boolean;
}

/**
 * Preview interactivo del componente PracticeMode
 */
function PracticeModePreviewComponent({ exampleData }: PreviewComponentProps): ReactElement {
  const data = exampleData as PracticeModeExampleData;

  const [ejercicioActual, setEjercicioActual] = useState(0);
  const [estados, setEstados] = useState<Record<string, EstadoEjercicio>>(() =>
    Object.fromEntries(
      data.ejercicios.map((e) => [
        e.id,
        { respondido: false, correcto: null, respuestaUsuario: null, mostrandoPista: false },
      ]),
    ),
  );
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<string | null>(null);

  const ejercicio = data.ejercicios[ejercicioActual];
  const estado = ejercicio ? estados[ejercicio.id] : null;

  const verificarRespuesta = useCallback(() => {
    if (!ejercicio || !respuestaSeleccionada) return;

    const esCorrecta = respuestaSeleccionada === ejercicio.respuestaCorrecta;
    setEstados((prev) => ({
      ...prev,
      [ejercicio.id]: {
        ...prev[ejercicio.id]!,
        respondido: true,
        correcto: esCorrecta,
        respuestaUsuario: respuestaSeleccionada,
      },
    }));
  }, [ejercicio, respuestaSeleccionada]);

  const siguienteEjercicio = useCallback(() => {
    if (ejercicioActual < data.ejercicios.length - 1) {
      setEjercicioActual((prev) => prev + 1);
      setRespuestaSeleccionada(null);
    }
  }, [ejercicioActual, data.ejercicios.length]);

  const reintentar = useCallback(() => {
    if (!ejercicio) return;
    setEstados((prev) => ({
      ...prev,
      [ejercicio.id]: {
        respondido: false,
        correcto: null,
        respuestaUsuario: null,
        mostrandoPista: false,
      },
    }));
    setRespuestaSeleccionada(null);
  }, [ejercicio]);

  const togglePista = useCallback(() => {
    if (!ejercicio) return;
    setEstados((prev) => ({
      ...prev,
      [ejercicio.id]: {
        ...prev[ejercicio.id]!,
        mostrandoPista: !prev[ejercicio.id]?.mostrandoPista,
      },
    }));
  }, [ejercicio]);

  const reiniciarTodo = useCallback(() => {
    setEjercicioActual(0);
    setRespuestaSeleccionada(null);
    setEstados(
      Object.fromEntries(
        data.ejercicios.map((e) => [
          e.id,
          { respondido: false, correcto: null, respuestaUsuario: null, mostrandoPista: false },
        ]),
      ),
    );
  }, [data.ejercicios]);

  // Calcular progreso
  const completados = Object.values(estados).filter((e) => e.respondido && e.correcto).length;
  const progreso = (completados / data.ejercicios.length) * 100;

  if (!ejercicio || !estado) {
    return <div className="text-slate-400">Cargando ejercicios...</div>;
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{data.titulo}</h2>
          <p className="text-sm text-slate-400 mt-1">{data.instruccion}</p>
        </div>
        <button
          type="button"
          onClick={reiniciarTodo}
          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
          title="Reiniciar todo"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Barra de progreso */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Progreso</span>
          <span>
            {completados}/{data.ejercicios.length} correctos
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {/* Indicadores de ejercicios */}
      <div className="flex items-center gap-2 mb-4">
        {data.ejercicios.map((ej, idx) => {
          const est = estados[ej.id];
          return (
            <button
              key={ej.id}
              type="button"
              onClick={() => {
                setEjercicioActual(idx);
                setRespuestaSeleccionada(null);
              }}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                ${idx === ejercicioActual ? 'ring-2 ring-blue-500' : ''}
                ${est?.correcto === true ? 'bg-green-500 text-white' : ''}
                ${est?.correcto === false ? 'bg-red-500 text-white' : ''}
                ${est?.correcto === null ? 'bg-slate-700 text-slate-300' : ''}
              `}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Ejercicio actual */}
      <div className="rounded-xl border border-slate-700 overflow-hidden">
        <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-medium text-slate-300">
            Ejercicio {ejercicioActual + 1} de {data.ejercicios.length}
          </span>
        </div>

        <div className="bg-slate-800/50 p-6">
          {/* Pregunta */}
          <p className="text-white font-medium mb-4">{ejercicio.pregunta}</p>

          {/* Opciones */}
          <div className="space-y-2">
            {ejercicio.tipo === 'verdaderoFalso'
              ? ['Verdadero', 'Falso'].map((opcion) => (
                  <button
                    key={opcion}
                    type="button"
                    onClick={() => !estado.respondido && setRespuestaSeleccionada(opcion)}
                    disabled={estado.respondido}
                    className={`
                    w-full p-3 rounded-lg text-left transition-all flex items-center justify-between
                    ${respuestaSeleccionada === opcion && !estado.respondido ? 'bg-blue-600 text-white' : ''}
                    ${!estado.respondido && respuestaSeleccionada !== opcion ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : ''}
                    ${estado.respondido && opcion === ejercicio.respuestaCorrecta ? 'bg-green-600 text-white' : ''}
                    ${estado.respondido && estado.respuestaUsuario === opcion && opcion !== ejercicio.respuestaCorrecta ? 'bg-red-600 text-white' : ''}
                    ${estado.respondido && opcion !== ejercicio.respuestaCorrecta && estado.respuestaUsuario !== opcion ? 'bg-slate-700/50 text-slate-500' : ''}
                  `}
                  >
                    <span>{opcion}</span>
                    {estado.respondido && opcion === ejercicio.respuestaCorrecta && (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                    {estado.respondido &&
                      estado.respuestaUsuario === opcion &&
                      opcion !== ejercicio.respuestaCorrecta && <XCircle className="w-5 h-5" />}
                  </button>
                ))
              : ejercicio.opciones?.map((opcion) => (
                  <button
                    key={opcion}
                    type="button"
                    onClick={() => !estado.respondido && setRespuestaSeleccionada(opcion)}
                    disabled={estado.respondido}
                    className={`
                    w-full p-3 rounded-lg text-left transition-all flex items-center justify-between
                    ${respuestaSeleccionada === opcion && !estado.respondido ? 'bg-blue-600 text-white' : ''}
                    ${!estado.respondido && respuestaSeleccionada !== opcion ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : ''}
                    ${estado.respondido && opcion === ejercicio.respuestaCorrecta ? 'bg-green-600 text-white' : ''}
                    ${estado.respondido && estado.respuestaUsuario === opcion && opcion !== ejercicio.respuestaCorrecta ? 'bg-red-600 text-white' : ''}
                    ${estado.respondido && opcion !== ejercicio.respuestaCorrecta && estado.respuestaUsuario !== opcion ? 'bg-slate-700/50 text-slate-500' : ''}
                  `}
                  >
                    <span>{opcion}</span>
                    {estado.respondido && opcion === ejercicio.respuestaCorrecta && (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                    {estado.respondido &&
                      estado.respuestaUsuario === opcion &&
                      opcion !== ejercicio.respuestaCorrecta && <XCircle className="w-5 h-5" />}
                  </button>
                ))}
          </div>

          {/* Pista */}
          {data.mostrarPistas !== false && ejercicio.pista && !estado.respondido && (
            <div className="mt-4">
              <button
                type="button"
                onClick={togglePista}
                className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300"
              >
                <Lightbulb className="w-4 h-4" />
                {estado.mostrandoPista ? 'Ocultar pista' : 'Ver pista'}
              </button>
              {estado.mostrandoPista && (
                <p className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-300">
                  {ejercicio.pista}
                </p>
              )}
            </div>
          )}

          {/* Explicacion despues de responder */}
          {data.mostrarExplicacion !== false && estado.respondido && ejercicio.explicacion && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-300">{ejercicio.explicacion}</p>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="bg-slate-900 px-4 py-3 border-t border-slate-700 flex items-center justify-between">
          {!estado.respondido ? (
            <button
              type="button"
              onClick={verificarRespuesta}
              disabled={!respuestaSeleccionada}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verificar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {data.permitirReintentos !== false && !estado.correcto && (
                <button
                  type="button"
                  onClick={reintentar}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300"
                >
                  Reintentar
                </button>
              )}
              {ejercicioActual < data.ejercicios.length - 1 && (
                <button
                  type="button"
                  onClick={siguienteEjercicio}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {estado.respondido && (
            <div
              className={`flex items-center gap-2 ${estado.correcto ? 'text-green-400' : 'text-red-400'}`}
            >
              {estado.correcto ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Correcto</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">Incorrecto</span>
                </>
              )}
            </div>
          )}
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
    description: 'Titulo del modo practica',
    required: true,
  },
  {
    name: 'ejercicios',
    type: 'array',
    description: 'Lista de ejercicios con pregunta, opciones y respuesta correcta',
    required: true,
  },
  {
    name: 'mostrarPistas',
    type: 'boolean',
    description: 'Si se muestran pistas para los ejercicios',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'mostrarExplicacion',
    type: 'boolean',
    description: 'Si se muestra explicacion despues de responder',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'permitirReintentos',
    type: 'boolean',
    description: 'Si se permite reintentar ejercicios incorrectos',
    required: false,
    defaultValue: 'true',
  },
];

/**
 * Datos de ejemplo
 */
const exampleData: PracticeModeExampleData = {
  instruccion: 'Practica sin presion. Toma tu tiempo para aprender.',
  titulo: 'Practica de Matematicas',
  ejercicios: [
    {
      id: 'ej1',
      pregunta: 'Cual es el resultado de 7 x 8?',
      tipo: 'opcionMultiple',
      opciones: ['54', '56', '58', '64'],
      respuestaCorrecta: '56',
      pista: 'Piensa en 7 grupos de 8 elementos',
      explicacion:
        '7 x 8 = 56. Una forma de recordarlo es que 7 x 8 = 56 (5, 6, 7, 8 en secuencia).',
    },
    {
      id: 'ej2',
      pregunta: 'El numero 17 es primo',
      tipo: 'verdaderoFalso',
      respuestaCorrecta: 'Verdadero',
      pista: 'Un numero primo solo es divisible por 1 y por si mismo',
      explicacion: '17 es primo porque solo es divisible por 1 y 17.',
    },
    {
      id: 'ej3',
      pregunta: 'Cual es la raiz cuadrada de 144?',
      tipo: 'opcionMultiple',
      opciones: ['10', '11', '12', '14'],
      respuestaCorrecta: '12',
      pista: 'Que numero multiplicado por si mismo da 144?',
      explicacion: '12 x 12 = 144, por lo tanto la raiz cuadrada de 144 es 12.',
    },
  ],
  mostrarPistas: true,
  mostrarExplicacion: true,
  permitirReintentos: true,
};

/**
 * Definicion del preview para el registry
 */
export const PracticeModePreview: PreviewDefinition = {
  component: PracticeModePreviewComponent,
  exampleData,
  propsDocumentation,
};
