import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface LessonMetadata {
  id: string;
  title: string;
  area: 'math' | 'code' | 'science';
  house: 'quantum' | 'vertex' | 'pulsar';
  duration: number;
  xpTotal: number;
}

export interface LessonState {
  metadata: LessonMetadata;
  currentSlideIndex: number;
  totalSlides: number;
  xpEarned: number;
  answers: Record<string, unknown>;
}

export interface LessonContextValue {
  state: LessonState;
  nextSlide: () => void;
  prevSlide: () => void;
  goToSlide: (index: number) => void;
  addXp: (amount: number) => void;
  recordAnswer: (slideId: string, answer: unknown) => void;
}

const LessonContext = createContext<LessonContextValue | null>(null);

export function useLessonContext(): LessonContextValue {
  const context = useContext(LessonContext);
  if (!context) {
    throw new Error('useLessonContext must be used within LessonProvider');
  }
  return context;
}

export interface LessonProviderProps {
  children: ReactNode;
  metadata: LessonMetadata;
  totalSlides: number;
}

export function LessonProvider({
  children,
  metadata,
  totalSlides,
}: LessonProviderProps): ReactNode {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});

  const state: LessonState = {
    metadata,
    currentSlideIndex,
    totalSlides,
    xpEarned,
    answers,
  };

  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.min(prev + 1, totalSlides - 1));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentSlideIndex(Math.max(0, Math.min(index, totalSlides - 1)));
    },
    [totalSlides],
  );

  const addXp = useCallback((amount: number) => {
    setXpEarned((prev) => prev + amount);
  }, []);

  const recordAnswer = useCallback((slideId: string, answer: unknown) => {
    setAnswers((prev) => ({ ...prev, [slideId]: answer }));
  }, []);

  const value: LessonContextValue = {
    state,
    nextSlide,
    prevSlide,
    goToSlide,
    addXp,
    recordAnswer,
  };

  return <LessonContext.Provider value={value}>{children}</LessonContext.Provider>;
}

export { LessonContext };
