// ═══════════════════════════════════════════════════════════════════════════════
// LOADING ANALYSIS - EXPERIENCIA ÉPICA DE "PENSANDO"
// Muestra el proceso de análisis paso a paso para crear anticipación
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizResponses } from '@/types/courses';

interface LoadingAnalysisProps {
  respuestas?: QuizResponses;
}

interface AnalysisStep {
  id: string;
  emoji: string;
  text: string;
  duration: number; // milliseconds
}

export default function LoadingAnalysis({ respuestas }: LoadingAnalysisProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Generar pasos dinámicamente basados en las respuestas
  const generateSteps = (): AnalysisStep[] => {
    const steps: AnalysisStep[] = [
      {
        id: 'inicio',
        emoji: '🚀',
        text: 'Iniciando análisis del perfil...',
        duration: 800
      },
      {
        id: 'personalidad',
        emoji: '💪',
        text: `Analizando estilo de aprendizaje (${getPersonalidadText()})`,
        duration: 1200
      }
    ];

    // Si juega videojuegos, analizar eso
    if (respuestas?.actividades_tiempo_libre?.includes('videojuegos')) {
      steps.push({
        id: 'juegos',
        emoji: '🎮',
        text: `Evaluando preferencias de juegos (${respuestas.juegos_favoritos?.length || 0} seleccionados)`,
        duration: 1000
      });
    }

    // Si mira videos educativos
    if (respuestas?.contenido_consume?.some(c => ['ciencia', 'matematica', 'programacion'].includes(c))) {
      steps.push({
        id: 'contenido',
        emoji: '🔬',
        text: 'Detectando intereses en contenido educativo...',
        duration: 1000
      });
    }

    steps.push(
      {
        id: 'habilidades',
        emoji: '🧮',
        text: `Evaluando nivel actual (Programación: ${getNivelProgramacionText()})`,
        duration: 1200
      },
      {
        id: 'objetivos',
        emoji: '🎯',
        text: `Procesando objetivo principal: "${getObjetivoText()}"`,
        duration: 1400
      },
      {
        id: 'matching',
        emoji: '🔍',
        text: 'Buscando la ruta perfecta entre 10 opciones...',
        duration: 1500
      },
      {
        id: 'final',
        emoji: '✨',
        text: '¡Ruta encontrada! Preparando resultados...',
        duration: 1000
      }
    );

    return steps;
  };

  const steps = generateSteps();

  // Helpers para texto personalizado
  function getPersonalidadText() {
    switch (respuestas?.personalidad_problema) {
      case 'insiste_solo': return 'Perseverante';
      case 'pide_ayuda': return 'Colaborativo';
      case 'busca_alternativa': return 'Creativo';
      case 'se_frustra': return 'Necesita apoyo';
      default: return 'En análisis';
    }
  }

  function getNivelProgramacionText() {
    switch (respuestas?.nivel_programacion) {
      case 'nunca': return 'Principiante';
      case 'scratch_basico': return 'Básico';
      case 'scratch_avanzado': return 'Avanzado';
      case 'otro_lenguaje': return 'Experto';
      default: return 'Evaluando';
    }
  }

  function getObjetivoText() {
    const objetivos: Record<string, string> = {
      'crear_su_propio_juego': 'Crear su propio juego',
      'publicar_juego_roblox': 'Publicar en Roblox',
      'ganar_olimpiada': 'Ganar olimpiada',
      'hacer_web_propia': 'Hacer su web',
      'entender_como_funcionan_juegos': 'Entender juegos',
      'mejorar_en_mate': 'Mejorar en mate',
      'aprender_ia': 'Aprender IA',
      'crear_app': 'Crear app',
      'explorar_ciencia': 'Explorar ciencia'
    };
    return objetivos[respuestas?.objetivo_principal || ''] || 'Definiendo...';
  }

  // Auto-avanzar los pasos
  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, steps[currentStep].id]);
        setCurrentStep(prev => prev + 1);
      }, steps[currentStep].duration);

      return () => clearTimeout(timer);
    }
  }, [currentStep, steps]);

  const progress = ((currentStep / steps.length) * 100);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background orbs animados - Estilo Mateatletas */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-[#0ea5e9]/30 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-[#8b5cf6]/30 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#10b981]/20 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl px-6">
        {/* Header con animación */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            className="text-8xl mb-6"
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            🧠
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Analizando el perfil de <span className="title-gradient">{respuestas?.nombre_estudiante}</span>
          </h1>
          <p className="text-xl text-white/70">
            Procesando {steps.length} variables para encontrar la ruta perfecta
          </p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/50">
            <motion.div
              className="h-full bg-gradient-to-r from-[#0ea5e9] via-[#10b981] to-[#fbbf24]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{
                duration: 0.5,
                ease: 'easeOut'
              }}
            />
          </div>
          <div className="text-center mt-2 text-sm text-slate-400">
            {Math.round(progress)}% completado
          </div>
        </motion.div>

        {/* Steps list */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = index === currentStep;
              const isPending = index > currentStep;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`
                    relative px-6 py-4 rounded-2xl border-2 transition-all
                    ${isCompleted
                      ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-400/50'
                      : isCurrent
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-900/40 border-slate-800'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* Emoji/Icon */}
                    <motion.div
                      className="text-4xl flex-shrink-0"
                      animate={isCurrent ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0]
                      } : {}}
                      transition={{
                        duration: 1,
                        repeat: isCurrent ? Infinity : 0,
                        ease: 'easeInOut'
                      }}
                    >
                      {step.emoji}
                    </motion.div>

                    {/* Text */}
                    <div className="flex-1">
                      <p className={`font-semibold text-lg ${
                        isCompleted ? 'text-emerald-400'
                        : isCurrent ? 'text-cyan-400'
                        : 'text-slate-500'
                      }`}>
                        {step.text}
                      </p>
                    </div>

                    {/* Status indicator */}
                    <div className="flex-shrink-0">
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center"
                        >
                          <span className="text-white font-bold text-xl">✓</span>
                        </motion.div>
                      )}
                      {isCurrent && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-8 h-8"
                        >
                          <div className="w-full h-full border-4 border-cyan-500 border-t-transparent rounded-full" />
                        </motion.div>
                      )}
                      {isPending && (
                        <div className="w-8 h-8 border-2 border-slate-700 rounded-full" />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Footer message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <p className="text-slate-500 text-sm">
            💡 Nuestro algoritmo está evaluando más de 50 puntos de datos para personalizar tu recomendación
          </p>
        </motion.div>
      </div>
    </div>
  );
}
