// ═══════════════════════════════════════════════════════════════════════════════
// PREGUNTA 1: Datos básicos (nombre y edad)
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import { QuizResponses, OPCIONES_QUIZ } from '@/types/courses';

interface Pregunta1Props {
  respuestas: Partial<QuizResponses>;
  setRespuestas: (respuestas: Partial<QuizResponses>) => void;
}

export default function Pregunta1({ respuestas, setRespuestas }: Pregunta1Props) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-3xl font-bold text-white mb-2">¡Empecemos!</h2>
        <p className="text-slate-400">Necesitamos algunos datos básicos</p>
      </div>

      {/* Nombre del estudiante */}
      <div>
        <label htmlFor="nombre_estudiante" className="block text-lg font-semibold text-white mb-3">
          ¿Cómo se llama tu hijo/a?
        </label>
        <input
          id="nombre_estudiante"
          type="text"
          value={respuestas.nombre_estudiante || ''}
          onChange={(e) =>
            setRespuestas({
              ...respuestas,
              nombre_estudiante: e.target.value,
            })
          }
          placeholder="Ej: Mateo"
          className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          autoFocus
        />
      </div>

      {/* Edad */}
      <div>
        <label className="block text-lg font-semibold text-white mb-4">¿Cuántos años tiene?</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {OPCIONES_QUIZ.edades.map((opcion) => {
            const isSelected =
              respuestas.edad && respuestas.edad >= opcion.min && respuestas.edad <= opcion.max;

            return (
              <button
                key={opcion.value}
                onClick={() =>
                  setRespuestas({
                    ...respuestas,
                    edad: opcion.value,
                  })
                }
                className={`
                  px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200
                  ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700'
                  }
                `}
              >
                {opcion.label} años
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
