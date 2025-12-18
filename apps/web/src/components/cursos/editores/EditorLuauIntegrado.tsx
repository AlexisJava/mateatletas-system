'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import type { EjercicioLuau } from '@/data/roblox/semana2-estilo-astro';
import PreviewBloque from './PreviewBloque';

interface EditorLuauIntegradoProps {
  ejercicio: EjercicioLuau;
  onComplete?: () => void;
}

export default function EditorLuauIntegrado({ ejercicio, onComplete }: EditorLuauIntegradoProps) {
  const { width, height } = useWindowSize();
  const [codigo, setCodigo] = useState(ejercicio.codigo_inicial);
  const [resultado, setResultado] = useState<'inicial' | 'error' | 'exito'>('inicial');
  const [mensajeError, setMensajeError] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mostrarSolucion, setMostrarSolucion] = useState(false);

  const ejecutarCodigo = () => {
    // Ejecutar todos los tests
    const resultados = ejercicio.tests.map((test) => ({
      desc: test.descripcion,
      paso: test.validar(codigo),
    }));

    const todoPaso = resultados.every((r) => r.paso);

    if (todoPaso) {
      // ✅ ÉXITO
      setResultado('exito');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      // NO avanzar automáticamente - el usuario debe hacer clic en "Continuar"
    } else {
      // ❌ ERROR
      setResultado('error');
      const errores = resultados.filter((r) => !r.paso).map((r) => r.desc);
      setMensajeError(errores);
    }
  };

  return (
    <div className="my-4">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      {/* Header del ejercicio */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-xl p-4"
      >
        <h3 className="text-xl font-black text-white mb-1">{ejercicio.titulo}</h3>
        <p className="text-green-100 text-sm">{ejercicio.descripcion}</p>
      </motion.div>

      {/* Editor de código y Preview */}
      <div className="bg-slate-900 border-2 border-green-500/40 border-t-0 rounded-b-xl overflow-hidden">
        <div className="p-3 bg-slate-950/50 border-b-2 border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-3 text-slate-400 font-mono text-sm">script.lua</span>
          </div>

          <button
            onClick={ejecutarCodigo}
            className="px-4 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg text-sm"
          >
            ▶️ Ejecutar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {/* Editor */}
          <div className="bg-slate-950 rounded-lg overflow-hidden">
            <Editor
              height="200px"
              defaultLanguage="lua"
              value={codigo}
              onChange={(v) => setCodigo(v || '')}
              theme="vs-dark"
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* Preview */}
          <PreviewBloque codigo={codigo} />
        </div>

        {/* Resultados */}
        <AnimatePresence mode="wait">
          {resultado !== 'inicial' && (
            <motion.div
              key={resultado}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 border-t-2 ${
                resultado === 'exito'
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              {resultado === 'exito' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="text-3xl">🎉</div>
                    <div>
                      <h4 className="text-xl font-black text-green-400">¡PERFECTO!</h4>
                      <p className="text-green-300 text-sm">Tu código está correcto</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-green-500">
                    <h5 className="text-base font-bold text-white mb-2">📚 Explicación:</h5>
                    <div className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                      {ejercicio.explicacion}
                    </div>
                  </div>

                  {/* Botón Continuar */}
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={onComplete}
                      className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg text-base"
                    >
                      ✓ Continuar →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="text-3xl">🤔</div>
                    <div>
                      <h4 className="text-xl font-black text-red-400">Hay algunos errores</h4>
                      <p className="text-red-300 text-sm">Revisá estos puntos:</p>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {mensajeError.map((error, idx) => (
                      <li
                        key={idx}
                        className="bg-slate-900/50 rounded-lg p-3 border-l-4 border-red-500 text-red-300"
                      >
                        ❌ {error}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setMostrarSolucion(!mostrarSolucion)}
                    className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                  >
                    {mostrarSolucion ? '🙈 Ocultar' : '💡 Ver pista'}
                  </button>

                  {mostrarSolucion && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4"
                    >
                      <p className="text-amber-300 font-mono text-sm">{ejercicio.solucion}</p>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tests visuales */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {ejercicio.tests.map((test, idx) => {
          const paso = test.validar(codigo);
          return (
            <div
              key={idx}
              className={`p-3 rounded-lg border-2 transition-all ${
                paso ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{paso ? '✅' : '⚪'}</span>
                <span className={paso ? 'text-green-300' : 'text-slate-400'}>
                  {test.descripcion}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
