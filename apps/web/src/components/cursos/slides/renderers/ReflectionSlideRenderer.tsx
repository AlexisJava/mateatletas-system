/**
 * components/slides/renderers/ReflectionSlideRenderer.tsx
 * =========================================================
 * Renderizador para slides de reflexión con input de usuario
 *
 * MIGRACIÓN PROMPT 3: Actualizado para usar tipos nuevos
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ReflectionSlide } from '../../../types/registry';
import LambdaMessage from '../../LambdaMessage';
import NavigationButtons from '../shared/NavigationButtons';

interface ReflectionSlideRendererProps {
  slide: ReflectionSlide;
  onNext: () => void;
  onPrevious?: () => void;
  showPrevious?: boolean;
  isFirst?: boolean;
  onReflectionSave?: (reflection: string) => void;
  hideNavigation?: boolean;
}

export default function ReflectionSlideRenderer({
  slide,
  onNext,
  onPrevious,
  showPrevious = true,
  isFirst = false,
  onReflectionSave,
  hideNavigation = false,
}: ReflectionSlideRendererProps) {
  const [reflection, setReflection] = useState('');
  const [saved, setSaved] = useState(false);

  // Extraer del tipo nuevo
  const lambdaMessage = slide.description || slide.question || '';
  const ctaText = 'Continuar';
  const maxChars = 500;
  const isRequired = slide.requiresResponse ?? false;
  const placeholderText = slide.placeholder || 'Escribe tu reflexión aquí...';

  const handleNext = () => {
    if (isRequired && reflection.trim().length === 0) {
      return;
    }

    if (onReflectionSave && reflection.trim()) {
      onReflectionSave(reflection);
      setSaved(true);
    }

    onNext();
  };

  const isValid = !isRequired || reflection.trim().length > 0;
  const charsRemaining = maxChars - reflection.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Título */}
      {slide.title && (
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold text-slate-100 mb-4"
        >
          {slide.title}
        </motion.h1>
      )}

      {/* Mensaje de Lambda */}
      {lambdaMessage && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <LambdaMessage message={lambdaMessage} />
        </motion.div>
      )}

      {/* Input de reflexión */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800 rounded-xl p-6 md:p-8 space-y-4"
      >
        <div className="space-y-2">
          <label htmlFor="reflection" className="block text-lg font-semibold text-slate-200">
            Tu reflexión
            {isRequired && <span className="text-red-400 ml-1">*</span>}
          </label>

          <textarea
            id="reflection"
            value={reflection}
            onChange={(e) => {
              if (e.target.value.length <= maxChars) {
                setReflection(e.target.value);
              }
            }}
            placeholder={placeholderText}
            className="w-full min-h-[150px] p-4 rounded-lg bg-slate-700 text-slate-100 border-2 border-slate-600 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
          />

          <div className="flex justify-between items-center text-sm">
            <span className={`${charsRemaining < 50 ? 'text-orange-400' : 'text-slate-400'}`}>
              {charsRemaining} caracteres restantes
            </span>

            {isRequired && reflection.trim().length === 0 && (
              <span className="text-red-400">Campo requerido</span>
            )}
          </div>
        </div>

        {saved && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-green-900/30 border border-green-500/50 rounded-lg p-3 flex items-center gap-2"
          >
            <span className="text-2xl">✅</span>
            <span className="text-green-300">Reflexión guardada</span>
          </motion.div>
        )}
      </motion.div>

      {/* Navegación - solo si NO está hideNavigation */}
      {!hideNavigation && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <NavigationButtons
            onPrevious={onPrevious}
            onNext={handleNext}
            nextLabel={ctaText}
            nextDisabled={!isValid}
            showPrevious={showPrevious && !isFirst}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
