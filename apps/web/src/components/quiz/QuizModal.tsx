// ═══════════════════════════════════════════════════════════════════════════════
// MODAL DEL QUIZ - Fullscreen overlay con el quiz
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import QuizAsincronico from './QuizAsincronico';
import { useRouter } from 'next/navigation';
import { QuizResponses } from '@/types/courses';
import { recomendarRuta } from '@/lib/algorithms/recomendarRuta';
import { enviarQuizAlBackend } from '@/lib/api/quizApi';
import { RUTAS } from '@/data/rutasAprendizaje';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuizModal({ isOpen, onClose }: QuizModalProps) {
  const router = useRouter();

  // ═══════════════════════════════════════════════════════════════════════════
  // KEYBOARD HANDLING
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // ═══════════════════════════════════════════════════════════════════════════
  // PREVENT BODY SCROLL WHEN MODAL IS OPEN
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ═══════════════════════════════════════════════════════════════════════════
  // QUIZ COMPLETION HANDLER
  // ═══════════════════════════════════════════════════════════════════════════
  const handleQuizComplete = async (respuestas: QuizResponses) => {
    try {
      // 1. Generar recomendación con el algoritmo
      const recomendacion = recomendarRuta(respuestas, RUTAS);

      // 2. Enviar al backend de forma asíncrona (no bloquea la UX)
      if (respuestas.parent_email) {
        enviarQuizAlBackend(respuestas, recomendacion).catch((error) => {
          console.error('Error enviando al backend:', error);
          // No mostramos error al usuario, no es crítico
        });
      }

      // 3. Guardar en sessionStorage para la página de resultados
      sessionStorage.setItem('quiz_resultado', JSON.stringify({
        respuestas,
        recomendacion,
        timestamp: new Date().toISOString()
      }));

      // 4. Cerrar modal
      onClose();

      // 5. Redirigir a página de resultados
      router.push('/cursos-online/asincronicos/resultado');

    } catch (error) {
      console.error('Error al completar quiz:', error);
      alert('Hubo un error al procesar el quiz. Por favor intentá de nuevo.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quiz-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-3xl shadow-2xl border border-slate-800"
            >
              {/* Header con botón cerrar */}
              <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 p-4 flex items-center justify-between">
                <div>
                  <h2
                    id="quiz-modal-title"
                    className="text-xl font-bold text-white"
                  >
                    Descubrí la Ruta Perfecta
                  </h2>
                  <p className="text-sm text-slate-400">
                    Solo 5 preguntas • 2 minutos
                  </p>
                </div>

                {/* Botón Cerrar */}
                <button
                  onClick={onClose}
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 group"
                  aria-label="Cerrar quiz"
                >
                  <X className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors" />
                </button>
              </div>

              {/* Quiz Component */}
              <div className="p-0">
                <QuizAsincronico onComplete={handleQuizComplete} />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
