'use client';

/**
 * Mateatletas Design System - useAnimation Hook
 * Hook para gestionar animaciones del sistema
 */

import { useState, useCallback, useEffect } from 'react';
import { animationClasses, durations, easings } from '../tokens/animations';

type EasingKey = keyof typeof easings | 'default';

interface UseAnimationOptions {
  autoPlay?: boolean;
  duration?: keyof typeof durations;
  easing?: EasingKey;
  delay?: number;
  onComplete?: () => void;
}

interface AnimationState {
  isAnimating: boolean;
  isPaused: boolean;
  iteration: number;
}

export function useAnimation(
  animationName: keyof typeof animationClasses,
  options: UseAnimationOptions = {},
) {
  const {
    autoPlay = false,
    duration = 'normal',
    easing = 'default',
    delay = 0,
    onComplete,
  } = options;

  const [state, setState] = useState<AnimationState>({
    isAnimating: autoPlay,
    isPaused: false,
    iteration: 0,
  });

  const animationClass = animationClasses[animationName];
  const animationDuration = durations[duration];
  const animationEasing =
    easing === 'default' ? easings.easeInOut : easings[easing as keyof typeof easings];

  const start = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isAnimating: true,
      isPaused: false,
      iteration: prev.iteration + 1,
    }));
  }, []);

  const stop = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isAnimating: false,
      isPaused: false,
    }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPaused: true,
    }));
  }, []);

  const resume = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPaused: false,
    }));
  }, []);

  const toggle = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isAnimating: !prev.isAnimating,
      isPaused: false,
      iteration: !prev.isAnimating ? prev.iteration + 1 : prev.iteration,
    }));
  }, []);

  const getAnimationStyle = useCallback(() => {
    if (!state.isAnimating) {
      return {};
    }

    return {
      animationDuration: animationDuration,
      animationTimingFunction: animationEasing,
      animationDelay: `${delay}ms`,
      animationPlayState: state.isPaused ? 'paused' : 'running',
    };
  }, [state.isAnimating, state.isPaused, animationDuration, animationEasing, delay]);

  const getAnimationClassName = useCallback(() => {
    if (!state.isAnimating) {
      return '';
    }
    return animationClass;
  }, [state.isAnimating, animationClass]);

  useEffect(() => {
    if (state.isAnimating && !state.isPaused && onComplete) {
      const durationMs = parseInt(animationDuration) || 300;
      const timer = setTimeout(() => {
        onComplete();
      }, durationMs + delay);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state.isAnimating, state.isPaused, state.iteration, animationDuration, delay, onComplete]);

  return {
    ...state,
    start,
    stop,
    pause,
    resume,
    toggle,
    getAnimationStyle,
    getAnimationClassName,
    className: getAnimationClassName(),
    style: getAnimationStyle(),
  };
}

export function useSequentialAnimations(
  animations: Array<{
    name: keyof typeof animationClasses;
    duration?: keyof typeof durations;
    delay?: number;
  }>,
) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const start = useCallback(() => {
    setCurrentIndex(0);
    setIsPlaying(true);
  }, []);

  const stop = useCallback(() => {
    setCurrentIndex(-1);
    setIsPlaying(false);
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev >= animations.length - 1) {
        setIsPlaying(false);
        return -1;
      }
      return prev + 1;
    });
  }, [animations.length]);

  const getCurrentAnimation = useCallback(() => {
    if (currentIndex < 0 || currentIndex >= animations.length) {
      return null;
    }
    return animations[currentIndex];
  }, [currentIndex, animations]);

  return {
    currentIndex,
    isPlaying,
    start,
    stop,
    next,
    getCurrentAnimation,
  };
}

export default useAnimation;
