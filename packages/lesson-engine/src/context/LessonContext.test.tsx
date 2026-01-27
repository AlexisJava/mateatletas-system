/**
 * LessonContext - Integration Tests
 *
 * Tests for FASE 9.2: Progress tracking
 * Validates progress state management works correctly
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  LessonProvider,
  useLessonContext,
  type LessonMetadata,
  type LessonProviderProps,
} from './LessonContext';

// ─────────────────────────────────────────────────────────────────────────────
// TEST FIXTURES
// ─────────────────────────────────────────────────────────────────────────────

const mockMetadata: LessonMetadata = {
  id: 'lesson-001',
  title: 'Test Lesson',
  area: 'math',
  house: 'quantum',
  duration: 30,
  xpTotal: 100,
};

function createWrapper(props?: Partial<LessonProviderProps>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <LessonProvider metadata={mockMetadata} totalSlides={5} {...props}>
        {children}
      </LessonProvider>
    );
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SETUP / TEARDOWN
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('LessonContext - Initial State', () => {
  it('should provide initial state correctly', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper(),
    });

    expect(result.current.state.metadata).toEqual(mockMetadata);
    expect(result.current.state.currentSlideIndex).toBe(0);
    expect(result.current.state.totalSlides).toBe(5);
    expect(result.current.state.xpEarned).toBe(0);
  });

  it('should initialize with first slide visited', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper(),
    });

    expect(result.current.state.slidesVisited.has(0)).toBe(true);
    expect(result.current.state.slidesVisited.size).toBe(1);
  });

  it('should calculate initial progress percent', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper({ totalSlides: 5 }),
    });

    // 1 slide visited out of 5 = 20%
    expect(result.current.state.progressPercent).toBe(20);
  });

  it('should start with zero time spent', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper(),
    });

    expect(result.current.state.timeSpentSeconds).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESUME FUNCTIONALITY TESTS (FASE 9.2 - Core feature)
// ─────────────────────────────────────────────────────────────────────────────

describe('LessonContext - Resume Progress', () => {
  it('should resume from initial slide index', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper({ initialSlideIndex: 3 }),
    });

    expect(result.current.state.currentSlideIndex).toBe(3);
  });

  it('should resume with initial slides visited', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper({
        initialSlideIndex: 2,
        initialSlidesVisited: [0, 1],
      }),
    });

    // Should have slides 0, 1, and current (2) visited
    expect(result.current.state.slidesVisited.has(0)).toBe(true);
    expect(result.current.state.slidesVisited.has(1)).toBe(true);
    expect(result.current.state.slidesVisited.has(2)).toBe(true);
    expect(result.current.state.slidesVisited.size).toBe(3);
  });

  it('should resume with initial time spent', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper({ initialTimeSpent: 120 }),
    });

    expect(result.current.state.timeSpentSeconds).toBe(120);
  });

  it('should calculate correct progress when resuming', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper({
        totalSlides: 10,
        initialSlideIndex: 4,
        initialSlidesVisited: [0, 1, 2, 3],
      }),
    });

    // 5 slides visited (0-4) out of 10 = 50%
    expect(result.current.state.progressPercent).toBe(50);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('LessonContext - Navigation', () => {
  it('should go to next slide', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.nextSlide();
    });

    expect(result.current.state.currentSlideIndex).toBe(1);
  });

  it('should auto-mark slide as visited on nextSlide', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.nextSlide();
    });

    expect(result.current.state.slidesVisited.has(1)).toBe(true);
  });

  it('should go to previous slide', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper({ initialSlideIndex: 2 }),
    });

    act(() => {
      result.current.prevSlide();
    });

    expect(result.current.state.currentSlideIndex).toBe(1);
  });

  it('should not go below 0', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.prevSlide();
    });

    expect(result.current.state.currentSlideIndex).toBe(0);
  });

  it('should not go above totalSlides - 1', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper({ totalSlides: 3, initialSlideIndex: 2 }),
    });

    act(() => {
      result.current.nextSlide();
    });

    expect(result.current.state.currentSlideIndex).toBe(2);
  });

  it('should go to specific slide', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.goToSlide(3);
    });

    expect(result.current.state.currentSlideIndex).toBe(3);
  });

  it('should auto-mark slide as visited on goToSlide', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.goToSlide(3);
    });

    expect(result.current.state.slidesVisited.has(3)).toBe(true);
  });

  it('should clamp goToSlide to valid range', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper({ totalSlides: 5 }),
    });

    act(() => {
      result.current.goToSlide(10);
    });

    expect(result.current.state.currentSlideIndex).toBe(4);

    act(() => {
      result.current.goToSlide(-5);
    });

    expect(result.current.state.currentSlideIndex).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS TRACKING TESTS (FASE 9.2 - Core feature)
// ─────────────────────────────────────────────────────────────────────────────

describe('LessonContext - Progress Tracking', () => {
  it('should update progress percent when visiting new slides', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper({ totalSlides: 5 }),
    });

    // Initial: 1/5 = 20%
    expect(result.current.state.progressPercent).toBe(20);

    act(() => {
      result.current.nextSlide();
    });

    // After: 2/5 = 40%
    expect(result.current.state.progressPercent).toBe(40);
  });

  it('should not increase progress when revisiting slides', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper({ totalSlides: 5 }),
    });

    act(() => {
      result.current.nextSlide(); // Visit slide 1
      result.current.prevSlide(); // Back to slide 0
      result.current.nextSlide(); // Revisit slide 1
    });

    // Should still be 2 slides visited
    expect(result.current.state.slidesVisited.size).toBe(2);
    expect(result.current.state.progressPercent).toBe(40);
  });

  it('should mark slide as visited manually', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.markSlideVisited(4);
    });

    expect(result.current.state.slidesVisited.has(4)).toBe(true);
  });

  it('should reach 100% when all slides visited', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper({ totalSlides: 3 }),
    });

    act(() => {
      result.current.nextSlide();
      result.current.nextSlide();
    });

    expect(result.current.state.progressPercent).toBe(100);
  });

  it('should handle edge case of 0 total slides', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper({ totalSlides: 0 }),
    });

    expect(result.current.state.progressPercent).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TIME TRACKING TESTS (FASE 9.2 - Core feature)
// ─────────────────────────────────────────────────────────────────────────────

describe('LessonContext - Time Tracking', () => {
  it('should increment time every second', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper(),
    });

    expect(result.current.state.timeSpentSeconds).toBe(0);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.state.timeSpentSeconds).toBe(1);
  });

  it('should continue counting time', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper(),
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.state.timeSpentSeconds).toBe(5);
  });

  it('should start from initial time when resuming', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper({ initialTimeSpent: 60 }),
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.state.timeSpentSeconds).toBe(65);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// XP TRACKING TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('LessonContext - XP Tracking', () => {
  it('should add XP', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addXp(25);
    });

    expect(result.current.state.xpEarned).toBe(25);
  });

  it('should accumulate XP', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addXp(10);
      result.current.addXp(15);
      result.current.addXp(5);
    });

    expect(result.current.state.xpEarned).toBe(30);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ANSWER RECORDING TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('LessonContext - Answer Recording', () => {
  it('should record answer for slide', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.recordAnswer('slide-1', { optionId: 'a', correct: true });
    });

    expect(result.current.state.answers['slide-1']).toEqual({
      optionId: 'a',
      correct: true,
    });
  });

  it('should record multiple answers', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.recordAnswer('slide-1', 'answer-1');
      result.current.recordAnswer('slide-2', 'answer-2');
    });

    expect(result.current.state.answers).toEqual({
      'slide-1': 'answer-1',
      'slide-2': 'answer-2',
    });
  });

  it('should overwrite answer for same slide', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.recordAnswer('slide-1', 'first-answer');
      result.current.recordAnswer('slide-1', 'updated-answer');
    });

    expect(result.current.state.answers['slide-1']).toBe('updated-answer');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESET PROGRESS TESTS (FASE 9.2 - Retry functionality)
// ─────────────────────────────────────────────────────────────────────────────

describe('LessonContext - Reset Progress', () => {
  it('should reset slide index to 0', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper({ initialSlideIndex: 3 }),
    });

    act(() => {
      result.current.resetProgress();
    });

    expect(result.current.state.currentSlideIndex).toBe(0);
  });

  it('should reset slides visited to only first slide', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper({
        initialSlideIndex: 4,
        initialSlidesVisited: [0, 1, 2, 3],
      }),
    });

    act(() => {
      result.current.resetProgress();
    });

    expect(result.current.state.slidesVisited.size).toBe(1);
    expect(result.current.state.slidesVisited.has(0)).toBe(true);
  });

  it('should reset XP to 0', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addXp(50);
      result.current.resetProgress();
    });

    expect(result.current.state.xpEarned).toBe(0);
  });

  it('should reset answers', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.recordAnswer('slide-1', 'answer');
      result.current.resetProgress();
    });

    expect(result.current.state.answers).toEqual({});
  });

  it('should reset time spent', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper({ initialTimeSpent: 120 }),
    });

    act(() => {
      vi.advanceTimersByTime(30000);
      result.current.resetProgress();
    });

    expect(result.current.state.timeSpentSeconds).toBe(0);
  });

  it('should reset progress percent to initial value', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper({ totalSlides: 5 }),
    });

    // Navigate to build up progress
    act(() => {
      result.current.nextSlide();
    });
    act(() => {
      result.current.nextSlide();
    });
    act(() => {
      result.current.nextSlide();
    });

    // Verify progress before reset
    expect(result.current.state.progressPercent).toBe(80); // 4/5

    // Reset
    act(() => {
      result.current.resetProgress();
    });

    // After reset: 1/5 = 20%
    expect(result.current.state.progressPercent).toBe(20);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRATION SCENARIOS
// ─────────────────────────────────────────────────────────────────────────────

describe('LessonContext - Integration Scenarios', () => {
  it('should handle complete lesson flow', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper({ totalSlides: 3 }),
    });

    // Navigate through lesson
    act(() => {
      result.current.nextSlide();
      result.current.recordAnswer('slide-1', 'correct');
      result.current.addXp(25);
    });

    act(() => {
      result.current.nextSlide();
      result.current.recordAnswer('slide-2', 'correct');
      result.current.addXp(25);
    });

    // Verify state
    expect(result.current.state.currentSlideIndex).toBe(2);
    expect(result.current.state.progressPercent).toBe(100);
    expect(result.current.state.xpEarned).toBe(50);
    expect(Object.keys(result.current.state.answers)).toHaveLength(2);
  });

  it('should handle retry flow', () => {
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper({ totalSlides: 5 }),
    });

    // Complete some progress
    act(() => {
      result.current.nextSlide();
      result.current.nextSlide();
      result.current.addXp(30);
      vi.advanceTimersByTime(60000);
    });

    // Retry
    act(() => {
      result.current.resetProgress();
    });

    // Verify clean slate
    expect(result.current.state.currentSlideIndex).toBe(0);
    expect(result.current.state.progressPercent).toBe(20);
    expect(result.current.state.xpEarned).toBe(0);
    expect(result.current.state.timeSpentSeconds).toBe(0);
  });

  it('should handle resume flow', () => {
    // Simulate resuming from saved progress
    const { result } = renderHook(() => useLessonContext(), {
      wrapper: createWrapper({
        totalSlides: 10,
        initialSlideIndex: 5,
        initialSlidesVisited: [0, 1, 2, 3, 4],
        initialTimeSpent: 300,
      }),
    });

    // Continue from where left off
    act(() => {
      result.current.nextSlide();
      vi.advanceTimersByTime(30000);
    });

    expect(result.current.state.currentSlideIndex).toBe(6);
    expect(result.current.state.slidesVisited.size).toBe(7);
    expect(result.current.state.progressPercent).toBe(70);
    expect(result.current.state.timeSpentSeconds).toBe(330);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ERROR HANDLING
// ─────────────────────────────────────────────────────────────────────────────

describe('LessonContext - Error Handling', () => {
  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useLessonContext());
    }).toThrow('useLessonContext must be used within LessonProvider');
  });
});
