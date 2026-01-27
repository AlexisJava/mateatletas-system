import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';

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
  /** Set of slide indices that have been visited */
  slidesVisited: Set<number>;
  /** Progress percentage (0-100) based on visited slides */
  progressPercent: number;
  /** Time spent in seconds */
  timeSpentSeconds: number;
}

export interface LessonContextValue {
  state: LessonState;
  nextSlide: () => void;
  prevSlide: () => void;
  goToSlide: (index: number) => void;
  addXp: (amount: number) => void;
  recordAnswer: (slideId: string, answer: unknown) => void;
  /** Mark a slide as visited (called automatically on navigation) */
  markSlideVisited: (index: number) => void;
  /** Reset progress (for retry functionality) */
  resetProgress: () => void;
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
  /** Initial slide index (for resuming progress) */
  initialSlideIndex?: number;
  /** Initial visited slides (for resuming progress) */
  initialSlidesVisited?: number[];
  /** Initial time spent in seconds (for resuming progress) */
  initialTimeSpent?: number;
}

export function LessonProvider({
  children,
  metadata,
  totalSlides,
  initialSlideIndex = 0,
  initialSlidesVisited = [],
  initialTimeSpent = 0,
}: LessonProviderProps): ReactNode {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlideIndex);
  const [xpEarned, setXpEarned] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [slidesVisited, setSlidesVisited] = useState<Set<number>>(
    () => new Set([initialSlideIndex, ...initialSlidesVisited]),
  );
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(initialTimeSpent);

  // Timer ref for tracking time spent
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start timer on mount
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Calculate progress percentage
  const progressPercent = useMemo(() => {
    if (totalSlides === 0) return 0;
    return Math.round((slidesVisited.size / totalSlides) * 100);
  }, [slidesVisited.size, totalSlides]);

  const state: LessonState = useMemo(
    () => ({
      metadata,
      currentSlideIndex,
      totalSlides,
      xpEarned,
      answers,
      slidesVisited,
      progressPercent,
      timeSpentSeconds,
    }),
    [
      metadata,
      currentSlideIndex,
      totalSlides,
      xpEarned,
      answers,
      slidesVisited,
      progressPercent,
      timeSpentSeconds,
    ],
  );

  const markSlideVisited = useCallback((index: number) => {
    setSlidesVisited((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => {
      const next = Math.min(prev + 1, totalSlides - 1);
      // Auto-mark as visited
      setSlidesVisited((visited) => {
        if (visited.has(next)) return visited;
        const newSet = new Set(visited);
        newSet.add(next);
        return newSet;
      });
      return next;
    });
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(0, Math.min(index, totalSlides - 1));
      setCurrentSlideIndex(clampedIndex);
      // Auto-mark as visited
      setSlidesVisited((visited) => {
        if (visited.has(clampedIndex)) return visited;
        const newSet = new Set(visited);
        newSet.add(clampedIndex);
        return newSet;
      });
    },
    [totalSlides],
  );

  const addXp = useCallback((amount: number) => {
    setXpEarned((prev) => prev + amount);
  }, []);

  const recordAnswer = useCallback((slideId: string, answer: unknown) => {
    setAnswers((prev) => ({ ...prev, [slideId]: answer }));
  }, []);

  const resetProgress = useCallback(() => {
    setCurrentSlideIndex(0);
    setSlidesVisited(new Set([0]));
    setXpEarned(0);
    setAnswers({});
    setTimeSpentSeconds(0);
  }, []);

  const value: LessonContextValue = useMemo(
    () => ({
      state,
      nextSlide,
      prevSlide,
      goToSlide,
      addXp,
      recordAnswer,
      markSlideVisited,
      resetProgress,
    }),
    [state, nextSlide, prevSlide, goToSlide, addXp, recordAnswer, markSlideVisited, resetProgress],
  );

  return <LessonContext.Provider value={value}>{children}</LessonContext.Provider>;
}

export { LessonContext };
