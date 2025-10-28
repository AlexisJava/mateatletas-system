'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Brain,
  Clock,
  Star,
  Trophy,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * Juego: Cálculo Mental Rápido
 *
 * Mecánica:
 * - 10 preguntas de operaciones básicas (+, -, ×, ÷)
 * - 30 segundos total
 * - 10 puntos por respuesta correcta
 * - Feedback inmediato
 * - Animaciones y efectos de victoria
 */

interface Pregunta {
  operando1: number;
  operando2: number;
  operador: '+' | '-' | '×' | '÷';
  respuestaCorrecta: number;
}

export default function CalculoMentalPage() {
  const router = useRouter();

  // Estado del juego
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestaUsuario, setRespuestaUsuario] = useState('');
  const [respuestasCorrectas, setRespuestasCorrectas] = useState(0);
  const [respuestasIncorrectas, setRespuestasIncorrectas] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(30);
  const [feedbackActual, setFeedbackActual] = useState<'correct' | 'incorrect' | null>(null);
  const [puntosGanados, setPuntosGanados] = useState(0);
  const [racha, setRacha] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(0);

  // Generar pregunta aleatoria
  const generarPregunta = (): Pregunta => {
    const operadores: Array<'+' | '-' | '×' | '÷'> = ['+', '-', '×', '÷'];
    const operador = operadores[Math.floor(Math.random() * operadores.length)];

    let operando1: number, operando2: number, respuestaCorrecta: number;

    switch (operador) {
      case '+':
        operando1 = Math.floor(Math.random() * 50) + 1;
        operando2 = Math.floor(Math.random() * 50) + 1;
        respuestaCorrecta = operando1 + operando2;
        break;
      case '-':
        operando1 = Math.floor(Math.random() * 50) + 20;
        operando2 = Math.floor(Math.random() * operando1);
        respuestaCorrecta = operando1 - operando2;
        break;
      case '×':
        operando1 = Math.floor(Math.random() * 12) + 1;
        operando2 = Math.floor(Math.random() * 12) + 1;
        respuestaCorrecta = operando1 * operando2;
        break;
      case '÷':
        operando2 = Math.floor(Math.random() * 10) + 2;
        respuestaCorrecta = Math.floor(Math.random() * 10) + 1;
        operando1 = operando2 * respuestaCorrecta;
        break;
    }

    return { operando1, operando2, operador, respuestaCorrecta };
  };

  // Iniciar juego
  const iniciarJuego = () => {
    const nuevasPreguntas = Array.from({ length: 10 }, () => generarPregunta());
    setPreguntas(nuevasPreguntas);
    setPreguntaActual(0);
    setRespuestaUsuario('');
    setRespuestasCorrectas(0);
    setRespuestasIncorrectas(0);
    setTiempoRestante(30);
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
    const esCorrecta = respuesta === preguntas[preguntaActual].respuestaCorrecta;

    if (esCorrecta) {
      setRespuestasCorrectas((prev) => prev + 1);
      setPuntosGanados((prev) => prev + 10);
      setRacha((prev) => {
        const nuevaRacha = prev + 1;
        if (nuevaRacha > mejorRacha) setMejorRacha(nuevaRacha);
        return nuevaRacha;
      });
      setFeedbackActual('correct');

      // Efecto de confetti
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#9333ea', '#ec4899', '#f59e0b'],
      });
    } else {
      setRespuestasIncorrectas((prev) => prev + 1);
      setRacha(0);
      setFeedbackActual('incorrect');
    }

    // Siguiente pregunta después de 1 segundo
    setTimeout(() => {
      setFeedbackActual(null);
      setRespuestaUsuario('');

      if (preguntaActual < preguntas.length - 1) {
        setPreguntaActual((prev) => prev + 1);
      } else {
        terminarJuego();
      }
    }, 1000);
  };

  // Terminar juego
  const terminarJuego = async () => {
    setGameState('finished');

    // Gran confetti de victoria
    if (respuestasCorrectas >= 7) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    // TODO: Registrar puntos en el backend cuando exista la acción en la base de datos
  };

  // Manejar Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && respuestaUsuario.trim()) {
      verificarRespuesta();
    }
  };

  const preguntaActiva = preguntas[preguntaActual];
  const progreso = ((preguntaActual + 1) / preguntas.length) * 100;

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
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="text-white font-bold">Cálculo Mental Rápido</span>
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
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-8xl"
                >
                  🧮
                </motion.div>

                <h1 className="text-4xl font-black text-white">Cálculo Mental Rápido</h1>

                <div className="bg-purple-500/20 rounded-2xl p-6 border border-purple-500/30">
                  <h3 className="text-xl font-bold text-purple-300 mb-3">¿Cómo jugar?</h3>
                  <ul className="text-left text-gray-300 space-y-2">
                    <li className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      Resuelve 10 operaciones matemáticas
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-400" />
                      Tienes 30 segundos en total
                    </li>
                    <li className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-purple-400" />
                      Gana 10 puntos por cada respuesta correcta
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-pink-400" />
                      ¡Mantén una racha para multiplicar puntos!
                    </li>
                  </ul>
                </div>

                <button
                  onClick={iniciarJuego}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white text-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  ¡Comenzar Juego! 🎮
                </button>
              </div>
            </motion.div>
          )}

          {/* Pantalla de juego */}
          {gameState === 'playing' && preguntaActiva && (
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
                  <p className={`text-3xl font-black ${tiempoRestante <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {tiempoRestante}s
                  </p>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-pink-400" />
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
                  <span>Pregunta {preguntaActual + 1} de {preguntas.length}</span>
                  <span>{Math.round(progreso)}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progreso}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                </div>
              </div>

              {/* Pregunta */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-xl opacity-30" />

                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-12 border-2 border-blue-500/50">
                  <motion.div
                    key={preguntaActual}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center space-y-8"
                  >
                    <p className="text-7xl font-black text-white">
                      {preguntaActiva.operando1} {preguntaActiva.operador} {preguntaActiva.operando2} = ?
                    </p>

                    <div className="flex items-center justify-center gap-4">
                      <input
                        type="number"
                        value={respuestaUsuario}
                        onChange={(e) => setRespuestaUsuario(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Tu respuesta"
                        autoFocus
                        className="w-64 px-6 py-4 text-3xl font-bold text-center bg-slate-700 border-2 border-purple-500/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />

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
                          ¡Correcto! +10 pts
                        </motion.div>
                      )}

                      {feedbackActual === 'incorrect' && (
                        <motion.div
                          initial={{ scale: 0, rotate: 180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          className="flex items-center justify-center gap-2 text-red-400 text-2xl font-bold"
                        >
                          <XCircle className="w-8 h-8" />
                          Incorrecto. Era {preguntaActiva.respuestaCorrecta}
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
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="text-8xl"
                >
                  {respuestasCorrectas >= 9 ? '🏆' : respuestasCorrectas >= 7 ? '🌟' : respuestasCorrectas >= 5 ? '👍' : '💪'}
                </motion.div>

                <h2 className="text-4xl font-black text-white">
                  {respuestasCorrectas >= 9 ? '¡Perfecto!' : respuestasCorrectas >= 7 ? '¡Excelente!' : respuestasCorrectas >= 5 ? '¡Bien hecho!' : '¡Sigue practicando!'}
                </h2>

                {/* Resultados */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-500/20 rounded-xl p-6 border border-purple-500/30">
                    <p className="text-gray-400 mb-2">Puntos Ganados</p>
                    <p className="text-4xl font-black text-white">{puntosGanados}</p>
                  </div>

                  <div className="bg-green-500/20 rounded-xl p-6 border border-green-500/30">
                    <p className="text-gray-400 mb-2">Correctas</p>
                    <p className="text-4xl font-black text-white">{respuestasCorrectas}/10</p>
                  </div>

                  <div className="bg-orange-500/20 rounded-xl p-6 border border-orange-500/30">
                    <p className="text-gray-400 mb-2">Mejor Racha</p>
                    <p className="text-4xl font-black text-white">{mejorRacha} 🔥</p>
                  </div>

                  <div className="bg-blue-500/20 rounded-xl p-6 border border-blue-500/30">
                    <p className="text-gray-400 mb-2">Precisión</p>
                    <p className="text-4xl font-black text-white">
                      {Math.round((respuestasCorrectas / preguntas.length) * 100)}%
                    </p>
                  </div>
                </div>

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
