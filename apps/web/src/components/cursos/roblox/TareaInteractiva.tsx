'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Editor from '@monaco-editor/react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { executeLuau } from '@/lib/luau-interpreter';
import type { TareaInteractiva, EstadoBloque, SimuladorConfig } from '@/data/roblox/types';

// Importar simulador 2D
import SimuladorRoblox2D from './SimuladorRoblox2D';

interface TareaInteractivaProps {
  tarea: TareaInteractiva;
  theme: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
  };
  onComplete?: () => void;
}

export default function TareaInteractivaComponent({
  tarea,
  theme,
  onComplete,
}: TareaInteractivaProps) {
  const { width, height } = useWindowSize();
  const [code, setCode] = useState(tarea.starter_code);
  const [output, setOutput] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [testResults, setTestResults] = useState<boolean[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Estado del simulador 3D
  const [estadoBloque, setEstadoBloque] = useState<EstadoBloque>({
    color: 'Medium stone grey',
    transparency: 0,
    material: 'Plastic',
    canCollide: true,
    size: { x: 4, y: 4, z: 4 },
  });

  const [configSimulador] = useState<SimuladorConfig>({
    mostrarJugador: false,
    mostrarEfectos: true,
    velocidadAnimacion: 1,
  });

  // Guardar progreso en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = `roblox-semana2-tarea${tarea.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setCode(saved);
      }
    }
  }, [tarea.id]);

  useEffect(() => {
    if (typeof window !== 'undefined' && code !== tarea.starter_code) {
      const key = `roblox-semana2-tarea${tarea.id}`;
      localStorage.setItem(key, code);
    }
  }, [code, tarea.id, tarea.starter_code]);

  const handleRunCode = () => {
    // 1. Ejecutar el código Luau
    const result = executeLuau(code);

    let newOutput: string[] = [];

    if (!result.success) {
      newOutput = [
        '❌ Error al ejecutar el código:',
        result.error || 'Error desconocido',
        '',
        'Revisá la sintaxis y asegurate de que el código sea válido.',
      ];
      setOutput(newOutput);
      return;
    }

    // 2. Ejecutar tests
    setTimeout(() => {
      const results = tarea.test_cases.map((test) => test.check(code));
      setTestResults(results);

      const allPassed = results.every((r) => r);

      if (allPassed) {
        // ✅ TODO PASÓ
        setOutput([
          '✅ ¡EXCELENTE! Todos los tests pasaron.',
          '🎉 ¡Tarea completada correctamente!',
          '',
          ...result.output,
        ]);

        // Actualizar simulador según el código
        actualizarSimulador(code);

        // Celebración
        setShowConfetti(true);
        setCompleted(true);
        setTimeout(() => setShowConfetti(false), 5000);

        // Notificar al padre
        if (onComplete) {
          onComplete();
        }

        // Guardar como completada
        if (typeof window !== 'undefined') {
          const key = `roblox-semana2-completed`;
          const completedTasks = JSON.parse(localStorage.getItem(key) || '[]');
          if (!completedTasks.includes(tarea.id)) {
            completedTasks.push(tarea.id);
            localStorage.setItem(key, JSON.stringify(completedTasks));
          }
        }
      } else {
        // ⚠️ Algunos tests fallaron
        setOutput([
          '⚠️ Algunos tests no pasaron. Revisá los detalles abajo.',
          'Usá las pistas si necesitás ayuda.',
          '',
          ...result.output,
        ]);
      }
    }, 300);
  };

  const actualizarSimulador = (codigo: string) => {
    // Detectar cambios en el código y actualizar el estado del bloque
    const nuevoEstado = { ...estadoBloque };

    // Detectar color
    const colorMatch = codigo.match(/BrickColor\.new\("([^"]+)"\)/);
    if (colorMatch) {
      nuevoEstado.color = colorMatch[1];
    }

    // Detectar transparency
    const transparencyMatch = codigo.match(/Transparency\s*=\s*([\d.]+)/);
    if (transparencyMatch) {
      nuevoEstado.transparency = parseFloat(transparencyMatch[1]);
    }

    // Detectar material
    const materialMatch = codigo.match(/Material\s*=\s*Enum\.Material\.(\w+)/);
    if (materialMatch) {
      nuevoEstado.material = materialMatch[1] as EstadoBloque['material'];
    }

    // Detectar canCollide
    const canCollideMatch = codigo.match(/CanCollide\s*=\s*(true|false)/);
    if (canCollideMatch) {
      nuevoEstado.canCollide = canCollideMatch[1] === 'true';
    }

    setEstadoBloque(nuevoEstado);
  };

  const getDifficultyColor = () => {
    switch (tarea.dificultad) {
      case 'Fácil':
        return theme.secondary;
      case 'Medio':
        return theme.accent;
      case 'Avanzado':
        return '#EF4444';
      default:
        return theme.primary;
    }
  };

  return (
    <div
      className="min-h-screen py-8 px-4 relative overflow-hidden"
      style={{ backgroundColor: theme.background }}
    >
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header de la tarea */}
        <div className="mb-6 space-y-4">
          {/* Título de la tarea */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-sm font-bold opacity-80 mb-1">TAREA {tarea.id}</div>
                <h2 className="text-3xl font-black mb-2">{tarea.titulo}</h2>
                <p className="text-lg opacity-90">{tarea.descripcion}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-4 py-2 rounded-full text-sm font-bold bg-white/20">
                  {tarea.dificultad}
                </span>
                {completed && <div className="text-4xl">✅</div>}
              </div>
            </div>
          </div>

          {/* Instrucciones claras */}
          <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl">📝</span>
              <div>
                <h3 className="text-white font-bold mb-2">¿Qué tenés que hacer?</h3>
                <ol className="text-slate-300 space-y-2 text-sm list-decimal list-inside">
                  <li>Leé el código que está abajo en el editor</li>
                  <li>Completá las partes que faltan (mirá los comentarios)</li>
                  <li>
                    Hacé click en <strong className="text-green-400">▶ Ejecutar</strong>
                  </li>
                  <li>Mirá el simulador - ¡tu código debería cambiar el bloque!</li>
                  <li>Si pasan todos los tests → ¡CONFETI! 🎉</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Tiempo sugerido */}
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span>⏱️</span>
            <span>Tiempo sugerido: {tarea.tiempo_sugerido} minutos</span>
          </div>
        </div>

        {/* Layout: Simulador + Editor + Tests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* IZQUIERDA: Simulador 3D */}
          <div className="space-y-4">
            <div className="bg-slate-900/80 backdrop-blur-md border-2 border-purple-500/40 rounded-2xl overflow-hidden">
              <div className="p-4 border-b-2 border-purple-500/30">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span className="text-2xl">🎮</span>
                  Simulador Interactivo
                </h3>
              </div>
              <div className="relative">
                <SimuladorRoblox2D
                  estado={estadoBloque}
                  mostrarJugador={configSimulador.mostrarJugador}
                  onInteraccion={() => {
                    // Simular toque del bloque
                    if (code.includes('Touched:Connect')) {
                      handleRunCode();
                    }
                  }}
                />
              </div>
            </div>

            {/* Tests */}
            <div className="bg-slate-900/80 backdrop-blur-md border-2 border-indigo-500/40 rounded-2xl p-6">
              <h3 className="text-lg font-black text-white mb-4">✓ Tests de Verificación</h3>
              <div className="space-y-2">
                {tarea.test_cases.map((test, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg transition-all duration-300"
                    style={{
                      backgroundColor:
                        testResults.length > 0
                          ? testResults[idx]
                            ? theme.secondary + '20'
                            : '#EF444420'
                          : theme.background,
                    }}
                  >
                    <span className="text-xl">
                      {testResults.length > 0 ? (testResults[idx] ? '✅' : '❌') : '⚪'}
                    </span>
                    <span className="text-slate-300 text-sm">{test.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DERECHA: Editor + Controles */}
          <div className="space-y-4">
            {/* Editor de código */}
            <div className="bg-slate-900/80 backdrop-blur-md border-2 border-green-500/40 rounded-2xl overflow-hidden flex flex-col h-[500px]">
              <div className="p-4 border-b-2 border-green-500/30 flex items-center justify-between">
                <h3 className="text-lg font-black text-white">📝 Tu Código</h3>
                <button
                  onClick={handleRunCode}
                  className="px-6 py-2 rounded-lg font-bold text-sm transition-all duration-300 hover:scale-110 active:scale-95 text-white shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  }}
                >
                  ▶ Ejecutar
                </button>
              </div>

              <Editor
                height="100%"
                defaultLanguage="lua"
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                }}
              />
            </div>

            {/* Output Console */}
            <div className="bg-slate-950/90 backdrop-blur-md border-2 border-slate-700 rounded-2xl overflow-hidden">
              <div className="p-3 border-b-2 border-slate-700">
                <h3 className="text-base font-black text-white">📺 Consola</h3>
              </div>
              <div className="p-4 h-32 overflow-y-auto">
                <div className="bg-slate-900 rounded-lg p-3 font-mono text-sm h-full">
                  {output.length === 0 ? (
                    <p className="text-slate-500 italic">
                      Ejecutá tu código para ver el resultado...
                    </p>
                  ) : (
                    output.map((line, idx) => (
                      <div key={idx} className="text-green-300 mb-1">
                        {line}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pistas y Solución */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowHints(!showHints)}
            className="px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 border-2"
            style={{
              backgroundColor: theme.accent + '20',
              borderColor: theme.accent + '60',
              color: theme.accent,
            }}
          >
            {showHints ? '🙈' : '💡'} Pistas
          </button>

          <button
            onClick={() => setShowSolution(!showSolution)}
            className="px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 border-2"
            style={{
              backgroundColor: '#EF444420',
              borderColor: '#EF444460',
              color: '#EF4444',
            }}
          >
            {showSolution ? '🙈' : '👀'} Solución
          </button>
        </div>

        {/* Hints Panel */}
        {showHints && (
          <div
            className="mb-6 p-6 rounded-xl border-2"
            style={{ backgroundColor: theme.accent + '10', borderColor: theme.accent + '40' }}
          >
            <h4 className="font-bold text-white mb-4">💡 Pistas:</h4>
            <ul className="space-y-2">
              {tarea.hints.map((hint, idx) => (
                <li key={idx} className="text-slate-300 flex gap-2">
                  <span style={{ color: theme.accent }}>•</span>
                  <span>{hint}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Solution Panel */}
        {showSolution && (
          <div className="mb-6 p-6 rounded-xl border-2 bg-slate-950/60 border-red-500/40">
            <h4 className="font-bold text-white mb-4">👀 Solución:</h4>
            <pre className="text-green-300 text-sm overflow-x-auto font-mono">
              <code>{tarea.solucion_esperada}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
