// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA DE TESTING DEL QUIZ
// Para probar todo el flujo completo: quiz → algoritmo → backend
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import { useState } from 'react';
import QuizAsincronico from '@/components/quiz/QuizAsincronico';
import { recomendarRuta, explicarScore } from '@/lib/algorithms/recomendarRuta';
import { enviarQuizAlBackend } from '@/lib/api/quizApi';
import { RUTAS } from '@/data/rutasAprendizaje';
import { QuizResponses, ResultadoRecomendacion } from '@/types/courses';
import { motion } from 'framer-motion';

export default function QuizTestPage() {
  const [resultado, setResultado] = useState<{
    respuestas: QuizResponses;
    recomendacion: ResultadoRecomendacion;
    backendResponse?: { success: boolean; message?: string };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuizComplete = async (respuestas: QuizResponses) => {
    setIsLoading(true);

    try {
      console.log('📝 Respuestas del quiz:', respuestas);

      // 1. Generar recomendación (frontend)
      const recomendacion = recomendarRuta(respuestas, RUTAS);
      console.log('🎯 Recomendación generada:', recomendacion);

      // 2. Explicar score (debug)
      const scoreExplicado = explicarScore(recomendacion.ruta_principal, respuestas);
      console.log('📊 Score explicado:', scoreExplicado);

      // 3. Enviar al backend (solo si dejó email)
      let backendResponse;
      if (respuestas.parent_email) {
        console.log('📤 Enviando al backend...');
        backendResponse = await enviarQuizAlBackend(respuestas, recomendacion);
        console.log('✅ Respuesta del backend:', backendResponse);
      }

      // 4. Mostrar resultado
      setResultado({
        respuestas,
        recomendacion,
        backendResponse
      });

    } catch (error) {
      console.error('❌ Error en el quiz:', error);
      alert('Hubo un error al procesar el quiz. Ver consola para más detalles.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResultado(null);
    localStorage.removeItem('mateatletas-quiz-progress');
    window.location.reload();
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            🎯
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Analizando respuestas...
          </h2>
          <p className="text-slate-400">
            Generando la ruta perfecta
          </p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUIZ VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (!resultado) {
    return <QuizAsincronico onComplete={handleQuizComplete} />;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RESULTS VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            className="text-5xl md:text-6xl font-black text-white mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            🎉 Resultados del Quiz
          </motion.h1>
          <p className="text-slate-400 text-lg">
            Página de testing - Vista de desarrollador
          </p>
        </div>

        {/* Grid de resultados */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Ruta Recomendada */}
          <motion.div
            className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl">{resultado.recomendacion.ruta_principal.emoji}</span>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {resultado.recomendacion.ruta_principal.nombre}
                </h2>
                <p className="text-cyan-400 text-sm font-semibold">
                  Score: {resultado.recomendacion.score_match}/100
                </p>
              </div>
            </div>

            <p className="text-slate-300 mb-4">
              {resultado.recomendacion.ruta_principal.descripcion}
            </p>

            <div className="space-y-2 text-sm text-slate-400">
              <p><strong className="text-white">Área:</strong> {resultado.recomendacion.ruta_principal.area_principal}</p>
              <p><strong className="text-white">Edad:</strong> {resultado.recomendacion.ruta_principal.edad_minima}-{resultado.recomendacion.ruta_principal.edad_maxima} años</p>
              <p><strong className="text-white">Duración:</strong> {resultado.recomendacion.ruta_principal.duracion_total_meses} meses</p>
              <p><strong className="text-white">Total clases:</strong> {resultado.recomendacion.ruta_principal.total_clases}</p>
            </div>

            <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <p className="text-emerald-400 text-sm">
                <strong>Mensaje personalizado:</strong>
              </p>
              <p className="text-slate-300 text-sm mt-2">
                {resultado.recomendacion.mensaje_personalizado}
              </p>
            </div>
          </motion.div>

          {/* Respuestas del Quiz */}
          <motion.div
            className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              📝 Respuestas del Usuario
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-400">Nombre:</p>
                <p className="text-white font-semibold">{resultado.respuestas.nombre_estudiante}</p>
              </div>

              <div>
                <p className="text-slate-400">Edad:</p>
                <p className="text-white font-semibold">{resultado.respuestas.edad} años</p>
              </div>

              <div>
                <p className="text-slate-400">Intereses:</p>
                <p className="text-white font-semibold">{resultado.respuestas.interes_principal.join(', ')}</p>
              </div>

              <div>
                <p className="text-slate-400">Nivel actual:</p>
                <p className="text-white font-semibold">{resultado.respuestas.nivel_actual}</p>
              </div>

              <div>
                <p className="text-slate-400">Objetivos:</p>
                <p className="text-white font-semibold">{resultado.respuestas.objetivo.join(', ')}</p>
              </div>

              <div>
                <p className="text-slate-400">Tiempo disponible:</p>
                <p className="text-white font-semibold">{resultado.respuestas.tiempo_disponible}</p>
              </div>

              {resultado.respuestas.parent_email && (
                <div className="pt-3 border-t border-slate-700">
                  <p className="text-slate-400">Email de contacto:</p>
                  <p className="text-white font-semibold">{resultado.respuestas.parent_email}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Alternativas */}
        {resultado.recomendacion.alternativas.length > 0 && (
          <motion.div
            className="mt-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              🔄 Rutas Alternativas
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {resultado.recomendacion.alternativas.map((ruta) => (
                <div
                  key={ruta.id}
                  className="bg-slate-800/50 rounded-xl p-4 border border-slate-700"
                >
                  <div className="text-3xl mb-2">{ruta.emoji}</div>
                  <h3 className="font-bold text-white mb-1">{ruta.nombre}</h3>
                  <p className="text-slate-400 text-sm">{ruta.descripcion}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Backend Response */}
        {resultado.backendResponse && (
          <motion.div
            className={`mt-6 rounded-2xl p-6 border ${
              resultado.backendResponse.success
                ? 'bg-emerald-900/20 border-emerald-500/30'
                : 'bg-red-900/20 border-red-500/30'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-white mb-2">
              {resultado.backendResponse.success ? '✅' : '❌'} Respuesta del Backend
            </h2>
            <p className={resultado.backendResponse.success ? 'text-emerald-400' : 'text-red-400'}>
              {resultado.backendResponse.message || 'Sin mensaje'}
            </p>
          </motion.div>
        )}

        {/* Debug JSON */}
        <motion.div
          className="mt-6 bg-slate-950 rounded-2xl p-6 border border-slate-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">
            🐛 Debug - JSON Completo
          </h2>
          <pre className="bg-slate-900 p-4 rounded-lg text-xs text-slate-300 overflow-auto max-h-96 border border-slate-800">
            {JSON.stringify(resultado, null, 2)}
          </pre>
        </motion.div>

        {/* Botón de reset */}
        <div className="mt-8 text-center">
          <button
            onClick={handleReset}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-xl transition-all shadow-lg"
          >
            🔄 Hacer otro Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
