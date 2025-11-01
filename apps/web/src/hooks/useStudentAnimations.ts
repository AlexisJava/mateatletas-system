'use client';

import { useMemo } from 'react';
import animationsConfig from '../../public/animations-config.json';

export type AnimationCategory = 'dance' | 'expression' | 'idle' | 'locomotion';

export interface StudentAnimation {
  id: string;
  name: string;
  displayName: string;
  category: AnimationCategory;
  gender: 'masculine' | 'feminine';
  filename: string;
  url: string;
  requiredPoints: number;
  description: string;
  unlocked: boolean;
}

interface AnimationConfigEntry extends Omit<StudentAnimation, 'category' | 'gender'> {
  category: string;
  gender: string;
}

interface AnimationsConfigFile {
  animations: AnimationConfigEntry[];
  totalAnimations: number;
  categories: Record<string, number>;
}

const VALID_CATEGORIES: ReadonlySet<AnimationCategory> = new Set([
  'dance',
  'expression',
  'idle',
  'locomotion',
]);

const VALID_GENDERS: ReadonlySet<StudentAnimation['gender']> = new Set(['masculine', 'feminine']);

const animationsConfigTyped = animationsConfig as AnimationsConfigFile;

const normalizeAnimation = (animation: AnimationConfigEntry): StudentAnimation => ({
  ...animation,
  category: VALID_CATEGORIES.has(animation.category as AnimationCategory)
    ? (animation.category as AnimationCategory)
    : 'expression',
  gender: VALID_GENDERS.has(animation.gender as StudentAnimation['gender'])
    ? (animation.gender as StudentAnimation['gender'])
    : 'masculine',
});

const ALL_ANIMATIONS: StudentAnimation[] = animationsConfigTyped.animations.map(normalizeAnimation);

interface UseStudentAnimationsOptions {
  studentPoints?: number;
  unlockedAnimationIds?: string[];
  gender?: StudentAnimation['gender'];
}

export function useStudentAnimations({
  studentPoints = 0,
  unlockedAnimationIds = [],
  gender,
}: UseStudentAnimationsOptions = {}) {
  const filteredAnimations = useMemo(() => {
    return ALL_ANIMATIONS.filter((animation) => {
      if (gender && animation.gender !== gender) {
        return false;
      }

      if (animation.unlocked) {
        return true;
      }

      if (unlockedAnimationIds.includes(animation.id)) {
        return true;
      }

      return studentPoints >= animation.requiredPoints;
    });
  }, [gender, studentPoints, unlockedAnimationIds]);

  const lockedAnimations = useMemo(() => {
    return ALL_ANIMATIONS.filter((animation) => {
      if (gender && animation.gender !== gender) {
        return false;
      }

      if (animation.unlocked || unlockedAnimationIds.includes(animation.id)) {
        return false;
      }

      return studentPoints < animation.requiredPoints;
    });
  }, [gender, studentPoints, unlockedAnimationIds]);

  const animationsByCategory = useMemo(() => {
    const categories: Record<AnimationCategory, StudentAnimation[]> = {
      dance: [],
      expression: [],
      idle: [],
      locomotion: [],
    };

    filteredAnimations.forEach((animation) => {
      categories[animation.category].push(animation);
    });

    return categories;
  }, [filteredAnimations]);

  const getDefaultIdleAnimation = () => {
    const idleAnimations = animationsByCategory.idle;
    if (!idleAnimations.length) return null;

    const genderMatched = gender
      ? idleAnimations.find((animation) => animation.gender === gender)
      : null;

    return genderMatched ?? idleAnimations[0];
  };

  const getRandomAnimation = (category: AnimationCategory) => {
    const animations = animationsByCategory[category];
    if (!animations.length) return null;

    const randomIndex = Math.floor(Math.random() * animations.length);
    return animations[randomIndex];
  };

  const getAnimationById = (animationId: string) =>
    ALL_ANIMATIONS.find((animation) => animation.id === animationId);

  return {
    allAnimations: ALL_ANIMATIONS,
    availableAnimations: filteredAnimations,
    lockedAnimations,
    animationsByCategory,
    getDefaultIdleAnimation,
    getRandomAnimation,
    getAnimationById,
    stats: {
      total: animationsConfigTyped.totalAnimations,
      available: filteredAnimations.length,
      locked: lockedAnimations.length,
      categories: animationsConfigTyped.categories as Record<AnimationCategory, number>,
    },
  };
}
