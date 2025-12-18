/**
 * CHEMISTRY EDITOR - El Corazón de la Clase de Química
 * =====================================================
 *
 * Inspirado en LuauEditor.tsx de Roblox, pero adaptado para química.
 *
 * Estructura de 3 columnas:
 * 1. TEORÍA (izquierda) - Explicación + TTS
 * 2. PRÁCTICA (centro) - Descripción del desafío + Pistas + Solución
 * 3. SIMULADOR (derecha) - Área interactiva + Tests
 *
 * Features:
 * - 10 ejercicios progresivos
 * - Tests con feedback visual
 * - Confeti cuando completa todo
 * - TTS para teoría
 * - Navegación entre ejercicios
 */

'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { EJERCICIOS_PRACTICOS, type EjercicioPractico } from '@/data/quimica/clase-combustion';

interface ChemistryEditorProps {
  ejercicioInicial?: number;
  onProgreso?: (completados: number[]) => void;
}

export default function ChemistryEditor({
  ejercicioInicial = 1,
  onProgreso,
}: ChemistryEditorProps) {
  const [ejercicioActual, setEjercicioActual] = useState(ejercicioInicial);
  const [codigoUsuario, setCodigoUsuario] = useState('');
  const [mostrarPistas, setMostrarPistas] = useState(false);
  const [mostrarSolucion, setMostrarSolucion] = useState(false);
  const [testsResultados, setTestsResultados] = useState<boolean[]>([]);
  const [ejerciciosCompletados, setEjerciciosCompletados] = useState<number[]>([]);
  const [ejecutando, setEjecutando] = useState(false);
  const [leyendoAudio, setLeyendoAudio] = useState(false);

  const ejercicio = EJERCICIOS_PRACTICOS[ejercicioActual - 1];

  // Cargar código inicial cuando cambia el ejercicio
  useEffect(() => {
    setCodigoUsuario(ejercicio.codigo_inicial);
    setMostrarPistas(false);
    setMostrarSolucion(false);
    setTestsResultados([]);
  }, [ejercicioActual, ejercicio.codigo_inicial]);

  // Notificar progreso al padre
  useEffect(() => {
    if (onProgreso) {
      onProgreso(ejerciciosCompletados);
    }
  }, [ejerciciosCompletados, onProgreso]);

  // ============================================================================
  // EJECUTAR CÓDIGO
  // ============================================================================
  const ejecutarCodigo = () => {
    setEjecutando(true);

    // Ejecutar tests
    const resultados = ejercicio.tests.map((test) => test.validar(codigoUsuario));
    setTestsResultados(resultados);

    // Si todos los tests pasan y no estaba completado antes
    const todosPasaron = resultados.every((r) => r);
    if (todosPasaron && !ejerciciosCompletados.includes(ejercicioActual)) {
      setEjerciciosCompletados([...ejerciciosCompletados, ejercicioActual]);
      lanzarConfeti();
    }

    setTimeout(() => setEjecutando(false), 500);
  };

  // ============================================================================
  // CONFETI
  // ============================================================================
  const lanzarConfeti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  // ============================================================================
  // TEXT-TO-SPEECH
  // ============================================================================
  const leerTeoria = () => {
    if ('speechSynthesis' in window) {
      setLeyendoAudio(true);
      const utterance = new SpeechSynthesisUtterance(ejercicio.teoria);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      utterance.onend = () => setLeyendoAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const detenerAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setLeyendoAudio(false);
    }
  };

  // ============================================================================
  // NAVEGACIÓN
  // ============================================================================
  const irASiguiente = () => {
    if (ejercicioActual < EJERCICIOS_PRACTICOS.length) {
      setEjercicioActual(ejercicioActual + 1);
    }
  };

  const irAAnterior = () => {
    if (ejercicioActual > 1) {
      setEjercicioActual(ejercicioActual - 1);
    }
  };

  const irAEjercicio = (num: number) => {
    setEjercicioActual(num);
  };

  // ============================================================================
  // INDICADOR DE DIFICULTAD
  // ============================================================================
  const colorDificultad = {
    facil: 'from-green-500 to-emerald-600',
    medio: 'from-yellow-500 to-amber-600',
    dificil: 'from-red-500 to-rose-600',
  };

  const iconoDificultad = {
    facil: '⭐',
    medio: '⭐⭐',
    dificil: '⭐⭐⭐',
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">{ejercicio.titulo}</h1>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${colorDificultad[ejercicio.dificultad]}`}
              >
                {iconoDificultad[ejercicio.dificultad]} {ejercicio.dificultad.toUpperCase()}
              </span>
              <span className="text-slate-400 text-sm">
                Ejercicio {ejercicioActual} de {EJERCICIOS_PRACTICOS.length}
              </span>
            </div>
          </div>

          {/* Progreso */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-black text-cyan-400">
                {ejerciciosCompletados.length}/{EJERCICIOS_PRACTICOS.length}
              </div>
              <div className="text-xs text-slate-400">Completados</div>
            </div>
            <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{
                  width: `${(ejerciciosCompletados.length / EJERCICIOS_PRACTICOS.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal - 3 Columnas */}
      <div className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden">
        {/* COLUMNA 1: TEORÍA */}
        <div className="bg-gradient-to-br from-indigo-950 to-purple-950 rounded-2xl border border-indigo-800 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">📚 Teoría</h2>
            <button
              onClick={leyendoAudio ? detenerAudio : leerTeoria}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                leyendoAudio
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-cyan-500 hover:bg-cyan-600 text-white'
              }`}
            >
              {leyendoAudio ? '⏸️ Detener' : '🔊 Escuchar'}
            </button>
          </div>

          <div className="prose prose-invert prose-sm max-w-none">
            <div
              className="text-slate-200 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: ejercicio.teoria.replace(/\n/g, '<br/>') }}
            />
          </div>
        </div>

        {/* COLUMNA 2: PRÁCTICA */}
        <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 overflow-auto flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              📝 Desafío
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">{ejercicio.descripcion}</p>
          </div>

          {/* Botones de ayuda */}
          <div className="flex gap-2">
            <button
              onClick={() => setMostrarPistas(!mostrarPistas)}
              className="flex-1 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-300 rounded-lg font-bold transition-all"
            >
              💡 {mostrarPistas ? 'Ocultar' : 'Mostrar'} Pistas
            </button>
            <button
              onClick={() => setMostrarSolucion(!mostrarSolucion)}
              className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-300 rounded-lg font-bold transition-all"
            >
              👀 {mostrarSolucion ? 'Ocultar' : 'Ver'} Solución
            </button>
          </div>

          {/* Pistas */}
          {mostrarPistas && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <h3 className="text-yellow-300 font-bold mb-2 flex items-center gap-2">💡 Pistas</h3>
              <ul className="space-y-2">
                {ejercicio.pistas.map((pista, i) => (
                  <li key={i} className="text-yellow-200 text-sm flex items-start gap-2">
                    <span className="text-yellow-400">{i + 1}.</span>
                    <span>{pista}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Solución */}
          {mostrarSolucion && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <h3 className="text-green-300 font-bold mb-2 flex items-center gap-2">👀 Solución</h3>
              <pre className="bg-slate-950 text-green-300 p-3 rounded-lg text-xs overflow-x-auto font-mono">
                {ejercicio.solucion}
              </pre>
            </div>
          )}

          {/* Tests */}
          {testsResultados.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-4">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                🧪 Resultados de Tests
              </h3>
              <div className="space-y-2">
                {ejercicio.tests.map((test, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      testsResultados[i]
                        ? 'bg-green-500/20 border border-green-500/50'
                        : 'bg-red-500/20 border border-red-500/50'
                    }`}
                  >
                    <span className="text-xl">{testsResultados[i] ? '✅' : '❌'}</span>
                    <span
                      className={`text-sm ${testsResultados[i] ? 'text-green-300' : 'text-red-300'}`}
                    >
                      {test.descripcion}
                    </span>
                  </div>
                ))}
              </div>

              {testsResultados.every((r) => r) && (
                <div className="mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center py-3 rounded-lg font-black animate-pulse">
                  🎉 ¡EXCELENTE! Todos los tests pasaron 🎉
                </div>
              )}
            </div>
          )}
        </div>

        {/* COLUMNA 3: SIMULADOR */}
        <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">💻 Tu Código</h2>

          {/* Editor de código */}
          <textarea
            value={codigoUsuario}
            onChange={(e) => setCodigoUsuario(e.target.value)}
            className="flex-1 bg-slate-950 text-green-300 p-4 rounded-lg font-mono text-sm border border-slate-700 focus:outline-none focus:border-cyan-500 resize-none"
            spellCheck={false}
            placeholder="Escribí tu código aquí..."
          />

          {/* Botón Ejecutar */}
          <button
            onClick={ejecutarCodigo}
            disabled={ejecutando}
            className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-xl font-black text-lg transition-all hover:scale-105 disabled:hover:scale-100 shadow-lg shadow-cyan-500/30"
          >
            {ejecutando ? '⏳ Ejecutando...' : '▶️ Ejecutar Código'}
          </button>
        </div>
      </div>

      {/* Footer - Navegación */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-t border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Botón Anterior */}
          <button
            onClick={irAAnterior}
            disabled={ejercicioActual === 1}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg font-bold transition-all disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>

          {/* Números de ejercicios */}
          <div className="flex gap-2">
            {EJERCICIOS_PRACTICOS.map((_, i) => {
              const num = i + 1;
              const estaCompletado = ejerciciosCompletados.includes(num);
              const esActual = num === ejercicioActual;

              return (
                <button
                  key={num}
                  onClick={() => irAEjercicio(num)}
                  className={`w-10 h-10 rounded-lg font-bold transition-all ${
                    esActual
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white scale-110 shadow-lg shadow-cyan-500/50'
                      : estaCompletado
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {estaCompletado && !esActual ? '✓' : num}
                </button>
              );
            })}
          </div>

          {/* Botón Siguiente */}
          <button
            onClick={irASiguiente}
            disabled={ejercicioActual === EJERCICIOS_PRACTICOS.length}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-lg font-bold transition-all disabled:cursor-not-allowed"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}
