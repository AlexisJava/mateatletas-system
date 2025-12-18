/**
 * components/slides/renderers/ContentSlideRenderer.tsx
 * =====================================================
 * Renderizador para slides de contenido general
 *
 * MIGRACIÓN PROMPT 3: Actualizado para usar ContentSlide de design-system
 */

'use client';

import type { ContentSlide } from '../../../types/registry';
import { ContentSlide as DesignSystemContentSlide } from '@ciudad-mateatleta/design-system';

interface ContentSlideRendererProps {
  slide: ContentSlide;
  onNext: () => void;
  onPrevious?: () => void;
  showPrevious?: boolean;
  isFirst?: boolean;
  hideNavigation?: boolean;
}

export default function ContentSlideRenderer({
  slide,
  onNext,
  onPrevious,
  showPrevious = true,
  isFirst = false,
  hideNavigation = false,
}: ContentSlideRendererProps) {
  console.log('📄 RENDERING CONTENT SLIDE - FULL DEBUG:', {
    type: slide.type,
    title: slide.title,
    content: slide.content,
    contentType: typeof slide.content,
    contentLength: Array.isArray(slide.content) ? slide.content.length : 'not array',
  });

  if (Array.isArray(slide.content)) {
    console.log('📄 CONTENT BLOCKS:');
    slide.content.forEach((block, i) => {
      console.log(`  [${i}]:`, JSON.stringify(block, null, 2));
    });
  }

  // Usar el componente de design-system directamente
  return (
    <DesignSystemContentSlide
      slide={slide}
      onNext={onNext}
      onPrevious={onPrevious || (() => {})}
      theme="ciencias"
      hideNavigation={hideNavigation}
    />
  );
}
