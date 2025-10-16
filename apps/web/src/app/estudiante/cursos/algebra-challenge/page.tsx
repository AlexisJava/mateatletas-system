'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useGamificacionStore } from '@/store/gamificacion.store';
import {
  Target,
  Clock,
  Star,
  Trophy,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * Juego: Álgebra Challenge
 *
 * Mecánica:
 * - 8 ecuaciones lineales para resolver
 * - 45 segundos total
 * - 20 puntos por respuesta correcta
 * - Ecuaciones tipo: 2x + 5 = 13, 3x - 7 = 11, etc.
 * - Feedback visual y efectos
 */

interface Ecuacion {
  coeficiente: number;
  constante1: number;
  resultado: number;
  operador: '+' | '-';
  solucion: number;
}

export default function AlgebraChallengePage() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Estado del juego
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [ecuaciones, setEcuaciones] = useState<Ecuacion[]>([]);
  const [ecuacionActual, setEcuacionActual] = useState(0);
  const [respuestaUsuario, setRespuestaUsuario] = useState('');
  const [respuestasCorrectas, setRespuestasCorrectas] = useState(0);
  const [respuestasIncorrectas, setRespuestasIncorrectas] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(45);
  const [feedbackActual, setFeedbackActual] = useState<'correct' | 'incorrect' | null>(null);
  const [puntosGanados, setPuntosGanados] = useState(0);
  const [racha, setRacha] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(0);

  // Generar ecuación aleatoria: ax ± b = c
  const generarEcuacion = (): Ecuacion => {
    const coeficiente = Math.floor(Math.random() * 5) + 2; // 2 a 6
    const operador: '+' | '-' = Math.random() > 0.5 ? '+' : '-';
    const solucion = Math.floor(Math.random() * 10) + 1; // 1 a 10

    let constante1: number;
    let resultado: number;

    if (operador === '+') {
      constante1 = Math.floor(Math.random() * 15) + 1; // 1 a 15
      resultado = coeficiente * solucion + constante1;
    } else {
      constante1 = Math.floor(Math.random() * 15) + 1;
      resultado = coeficiente * solucion - constante1;
    }

    return { coeficiente, constante1, resultado, operador, solucion };
  };

  // Iniciar juego
  const iniciarJuego = () => {
    const nuevasEcuaciones = Array.from({ length: 8 }, () => generarEcuacion());
    setEcuaciones(nuevasEcuaciones);
    setEcuacionActual(0);
    setRespuestaUsuario('');
    setRespuestasCorrectas(0);
    setRespuestasIncorrectas(0);
    setTiempoRestante(45);
    setFeedbackActual(null);
    setPuntosGanados(0);
    setRacha(0);
    setMejorRacha(0);
    setGameState('playing');
  };

  // Cronómetro
  useEffect(() => {
    if (gameState === 'playing' && tiempoRestante > 0) {
      const timer = setInterval(() => {
        setTiempoRestante((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            terminarJuego();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, tiempoRestante]);

  // Verificar respuesta
  const verificarRespuesta = () => {
    if (!respuestaUsuario.trim()) return;

    const respuesta = parseInt(respuestaUsuario);
    const esCorrecta = respuesta === ecuaciones[ecuacionActual].solucion;

    if (esCorrecta) {
      setRespuestasCorrectas((prev) => prev + 1);
      setPuntosGanados((prev) => prev + 20);
      setRacha((prev) => {
        const nuevaRacha = prev + 1;
        if (nuevaRacha > mejorRacha) setMejorRacha(nuevaRacha);
        return nuevaRacha;
      });
      setFeedbackActual('correct');

      // Efecto de confetti más espectacular
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#9333ea', '#ec4899', '#f59e0b', '#3b82f6'],
      });
    } else {
      setRespuestasIncorrectas((prev) => prev + 1);
      setRacha(0);
      setFeedbackActual('incorrect');
    }

    // Siguiente pregunta después de 1.2 segundos
    setTimeout(() => {
      setFeedbackActual(null);
      setRespuestaUsuario('');

      if (ecuacionActual < ecuaciones.length - 1) {
        setEcuacionActual((prev) => prev + 1);
      } else {
        terminarJuego();
      }
    }, 1200);
  };

  // Terminar juego
  const terminarJuego = async () => {
    setGameState('finished');

    // Gran confetti de victoria
    if (respuestasCorrectas >= 6) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 100,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 100,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 250);
    }

    // TODO: Registrar puntos en el backend cuando exista la acción en la base de datos
    console.log(`✅ Juego completado: ${puntosGanados} puntos ganados`);
  };

  // Manejar Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && respuestaUsuario.trim()) {
      verificarRespuesta();
    }
  };

  const ecuacionActiva = ecuaciones[ecuacionActual];
  const progreso = ((ecuacionActual + 1) / ecuaciones.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/estudiante/cursos')}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Volver</span>
          </button>

          <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-4 py-2 border border-purple-500/30">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-white font-bold">Álgebra Challenge</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Pantalla de inicio */}
          {gameState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border-2 border-purple-500/50 shadow-2xl"
            >
              <div className="text-center space-y-6">
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-8xl"
                >
                  🎯
                </motion.div>

                <h1 className="text-4xl font-black text-white">Álgebra Challenge</h1>
                <p className="text-xl text-purple-300 font-semibold">¡Despeja la incógnita X!</p>

                <div className="bg-purple-500/20 rounded-2xl p-6 border border-purple-500/30">
                  <h3 className="text-xl font-bold text-purple-300 mb-4">¿Cómo jugar?</h3>
                  <ul className="text-left text-gray-300 space-y-3">
                    <li className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      Resuelve 8 ecuaciones lineales (tipo: 2x + 5 = 13)
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-400" />
                      Tienes 45 segundos en total
                    </li>
                    <li className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-purple-400" />
                      Gana 20 puntos por cada respuesta correcta
                    </li>
                    <li className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-red-400" />
                      ¡Mantén la racha para ser un maestro del álgebra!
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                  <p className="text-sm text-gray-400 mb-2">Ejemplo:</p>
                  <p className="text-lg font-mono text-white">
                    2x + 3 = 11 → <span className="text-purple-400">x = 4</span>
                  </p>
                </div>

                <button
                  onClick={iniciarJuego}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white text-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  ¡Aceptar el Reto! 🎯
                </button>
              </div>
            </motion.div>
          )}

          {/* Pantalla de juego */}
          {gameState === 'playing' && ecuacionActiva && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Stats del juego */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-orange-400" />
                    <span className="text-gray-400 text-sm">Tiempo</span>
                  </div>
                  <p className={`text-3xl font-black ${tiempoRestante <= 15 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {tiempoRestante}s
                  </p>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-red-400" />
                    <span className="text-gray-400 text-sm">Racha</span>
                  </div>
                  <p className="text-3xl font-black text-white">
                    {racha} 🔥
                  </p>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-400 text-sm">Puntos</span>
                  </div>
                  <p className="text-3xl font-black text-white">{puntosGanados}</p>
                </div>
              </div>

              {/* Progreso */}
              <div className="bg-slate-800/50 rounded-xl p-3 border border-purple-500/30">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Ecuación {ecuacionActual + 1} de {ecuaciones.length}</span>
                  <span>{Math.round(progreso)}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progreso}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
                  />
                </div>
              </div>

              {/* Ecuación */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30" />

                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-12 border-2 border-purple-500/50">
                  <motion.div
                    key={ecuacionActual}
                    initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    transition={{ type: 'spring', stiffness: 100 }}
                    className="text-center space-y-8"
                  >
                    {/* Ecuación principal */}
                    <div className="space-y-4">
                      <p className="text-6xl font-black text-white font-mono">
                        {ecuacionActiva.coeficiente}x {ecuacionActiva.operador} {ecuacionActiva.constante1} = {ecuacionActiva.resultado}
                      </p>

                      <p className="text-3xl font-bold text-purple-300">
                        x = ?
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-400 mb-1">Tu respuesta:</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-purple-400">x =</span>
                          <input
                            type="number"
                            value={respuestaUsuario}
                            onChange={(e) => setRespuestaUsuario(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="?"
                            autoFocus
                            className="w-32 px-4 py-3 text-3xl font-bold text-center bg-slate-700 border-2 border-purple-500/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      <button
                        onClick={verificarRespuesta}
                        disabled={!respuestaUsuario.trim()}
                        className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Verificar ✓
                      </button>
                    </div>

                    {/* Feedback */}
                    <AnimatePresence>
                      {feedbackActual === 'correct' && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          className="flex items-center justify-center gap-2 text-green-400 text-2xl font-bold"
                        >
                          <CheckCircle2 className="w-8 h-8" />
                          ¡Perfecto! +20 pts 🎯
                        </motion.div>
                      )}

                      {feedbackActual === 'incorrect' && (
                        <motion.div
                          initial={{ scale: 0, rotate: 180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-center gap-2 text-red-400 text-2xl font-bold">
                            <XCircle className="w-8 h-8" />
                            Incorrecto
                          </div>
                          <p className="text-purple-300 text-lg">
                            La respuesta era: <span className="font-bold text-white">x = {ecuacionActiva.solucion}</span>
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </div>

              {/* Score actual */}
              <div className="flex justify-center gap-4 text-lg font-semibold">
                <span className="text-green-400">✓ {respuestasCorrectas}</span>
                <span className="text-gray-500">|</span>
                <span className="text-red-400">✗ {respuestasIncorrectas}</span>
              </div>
            </motion.div>
          )}

          {/* Pantalla final */}
          {gameState === 'finished' && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border-2 border-purple-500/50 shadow-2xl"
            >
              <div className="text-center space-y-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-8xl"
                >
                  {respuestasCorrectas >= 7 ? '🏆' : respuestasCorrectas >= 6 ? '🌟' : respuestasCorrectas >= 4 ? '👍' : '💪'}
                </motion.div>

                <h2 className="text-4xl font-black text-white">
                  {respuestasCorrectas >= 7 ? '¡Maestro del Álgebra!' : respuestasCorrectas >= 6 ? '¡Excelente Trabajo!' : respuestasCorrectas >= 4 ? '¡Bien Hecho!' : '¡Sigue Practicando!'}
                </h2>

                {respuestasCorrectas >= 6 && (
                  <p className="text-purple-300 text-lg">
                    ¡Has dominado las ecuaciones lineales! 🎯
                  </p>
                )}

                {/* Resultados */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-500/20 rounded-xl p-6 border border-purple-500/30">
                    <p className="text-gray-400 mb-2">Puntos Ganados</p>
                    <p className="text-4xl font-black text-white">{puntosGanados}</p>
                  </div>

                  <div className="bg-green-500/20 rounded-xl p-6 border border-green-500/30">
                    <p className="text-gray-400 mb-2">Correctas</p>
                    <p className="text-4xl font-black text-white">{respuestasCorrectas}/8</p>
                  </div>

                  <div className="bg-red-500/20 rounded-xl p-6 border border-red-500/30">
                    <p className="text-gray-400 mb-2">Mejor Racha</p>
                    <p className="text-4xl font-black text-white">{mejorRacha} 🔥</p>
                  </div>

                  <div className="bg-blue-500/20 rounded-xl p-6 border border-blue-500/30">
                    <p className="text-gray-400 mb-2">Precisión</p>
                    <p className="text-4xl font-black text-white">
                      {Math.round((respuestasCorrectas / ecuaciones.length) * 100)}%
                    </p>
                  </div>
                </div>

                {/* Mensaje motivacional */}
                {respuestasCorrectas >= 6 && (
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                    <p className="text-purple-200 font-semibold">
                      💡 Tip: El álgebra es como un rompecabezas. ¡Sigue practicando y cada vez será más fácil!
                    </p>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-4 justify-center pt-4">
                  <button
                    onClick={iniciarJuego}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white hover:shadow-lg transition-all"
                  >
                    Jugar de Nuevo 🔄
                  </button>

                  <button
                    onClick={() => router.push('/estudiante/cursos')}
                    className="px-6 py-3 bg-slate-700 rounded-xl font-bold text-white hover:bg-slate-600 transition-all"
                  >
                    Volver a Juegos
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
