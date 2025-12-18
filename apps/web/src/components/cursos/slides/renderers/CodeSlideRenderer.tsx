/**
 * components/slides/renderers/CodeSlideRenderer.tsx
 * ==================================================
 * Renderizador para slides con código (Roblox)
 *
 * MIGRACIÓN PROMPT 3: Actualizado para usar tipos nuevos
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { CodeSlide } from '../../../types/registry';
import NavigationButtons from '../shared/NavigationButtons';

interface CodeSlideRendererProps {
  slide: CodeSlide;
  onNext: () => void;
  onPrevious?: () => void;
  showPrevious?: boolean;
  isFirst?: boolean;
  hideNavigation?: boolean;
}

export default function CodeSlideRenderer({
  slide,
  onNext,
  onPrevious,
  showPrevious = true,
  isFirst = false,
  hideNavigation = false,
}: CodeSlideRendererProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(slide.codeConfig.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Renderizar código como HTML
  const codeHtml = `<pre><code class="language-${slide.codeConfig.language}">${slide.codeConfig.code}</code></pre>`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Título */}
      {slide.title && (
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold text-white mb-6"
        >
          {slide.title}
        </motion.h1>
      )}

      {/* Contenedor de código */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative group"
      >
        {/* Botón de copiar */}
        {!slide.codeConfig.readonly && (
          <button
            onClick={handleCopy}
            className="absolute top-4 right-4 z-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
          >
            {copied ? '✅ Copiado!' : '📋 Copiar código'}
          </button>
        )}

        {/* Código HTML */}
        <div
          className="prose prose-invert prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: codeHtml }}
        />
      </motion.div>

      {/* Mensaje de ayuda si tiene interactividad */}
      {!slide.codeConfig.readonly && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4"
        >
          <p className="text-blue-300 text-sm">
            💡 Tip: Pasa el mouse sobre el código y haz clic en "Copiar código" para copiarlo al
            portapapeles
          </p>
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
            nextLabel="Siguiente"
            showPrevious={showPrevious && !isFirst}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
