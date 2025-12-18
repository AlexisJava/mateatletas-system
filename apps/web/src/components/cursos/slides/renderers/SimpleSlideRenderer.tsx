/**
 * components/slides/renderers/SimpleSlideRenderer.tsx
 * =====================================================
 * Renderizador para slides simples con contenido HTML directo
 *
 * MIGRACIÓN PROMPT 3: Actualizado para usar tipos nuevos
 */

'use client';

import { motion } from 'framer-motion';
import type { Slide } from '../../../types/registry';
import NavigationButtons from '../shared/NavigationButtons';

interface SimpleSlideRendererProps {
  slide: Slide;
  onNext: () => void;
  onPrevious?: () => void;
  showPrevious?: boolean;
  isFirst?: boolean;
  hideNavigation?: boolean;
}

export default function SimpleSlideRenderer({
  slide,
  onNext,
  onPrevious,
  showPrevious = true,
  isFirst = false,
  hideNavigation = false,
}: SimpleSlideRendererProps) {
  const ctaText = 'Siguiente';

  // Para slides simples, usar description o primer contenido
  const htmlContent = slide.description || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Título si existe */}
      {slide.title && (
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold text-white mb-6"
        >
          {slide.title}
        </motion.h1>
      )}

      {/* Contenido HTML */}
      {htmlContent && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert prose-lg max-w-none"
        >
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </motion.div>
      )}

      {/* Navegación - solo si NO está hideNavigation */}
      {!hideNavigation && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <NavigationButtons
            onNext={onNext}
            onPrevious={onPrevious}
            nextLabel={ctaText}
            showPrevious={showPrevious && !isFirst}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
