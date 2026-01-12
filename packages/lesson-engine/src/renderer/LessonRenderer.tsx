import type { ReactNode } from 'react';
import { IntentRegistry, type IntentProps } from './IntentRegistry';
import { SlideContainer } from './SlideContainer';
import { useLessonContext } from '../context/LessonContext';

export interface SlideData {
  intent: string;
  props: Record<string, unknown>;
}

export interface LessonRendererProps {
  slides: SlideData[];
  onSlideComplete?: (slideIndex: number, result?: unknown) => void;
}

/**
 * LessonRenderer - Renderiza la lección actual basada en el contexto
 */
export function LessonRenderer({ slides, onSlideComplete }: LessonRendererProps): ReactNode {
  const { state, addXp, nextSlide } = useLessonContext();
  const currentSlide = slides[state.currentSlideIndex];

  if (!currentSlide) {
    return null;
  }

  const IntentComponent = IntentRegistry.get(currentSlide.intent);

  if (!IntentComponent) {
    console.warn(`Intent "${currentSlide.intent}" not found in registry`);
    return (
      <SlideContainer>
        <div className="flex items-center justify-center h-full">
          <p className="text-red-400">Intent "{currentSlide.intent}" not registered</p>
        </div>
      </SlideContainer>
    );
  }

  const handleComplete = (result?: unknown) => {
    onSlideComplete?.(state.currentSlideIndex, result);

    // Si el resultado incluye XP, agregarlo
    if (result && typeof result === 'object' && 'xp' in result) {
      addXp((result as { xp: number }).xp);
    }

    nextSlide();
  };

  const intentProps: IntentProps = {
    props: currentSlide.props,
    onComplete: handleComplete,
  };

  return (
    <SlideContainer>
      <IntentComponent {...intentProps} />
    </SlideContainer>
  );
}
