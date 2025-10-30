'use client'

import { useMemo } from 'react'
import animationsConfig from '../../public/animations-config.json'

interface Animation {
  id: string
  name: string
  displayName: string
  category: 'dance' | 'expression' | 'idle' | 'locomotion'
  gender: 'masculine' | 'feminine'
  filename: string
  url: string
  requiredPoints: number
  description: string
  unlocked: boolean
}

interface UseStudentAnimationsOptions {
  studentPoints?: number
  unlockedAnimationIds?: string[]
  gender?: 'masculine' | 'feminine'
}

export function useStudentAnimations({
  studentPoints = 0,
  unlockedAnimationIds = [],
  gender
}: UseStudentAnimationsOptions = {}) {

  // Filtrar animaciones disponibles
  const availableAnimations = useMemo(() => {
    return animationsConfig.animations.filter((animation: Animation) => {
      // Filtrar por género si se especifica
      if (gender && animation.gender !== gender) {
        return false
      }

      // Desbloqueada por defecto (idle)
      if (animation.unlocked) {
        return true
      }

      // Desbloqueada manualmente por el estudiante
      if (unlockedAnimationIds.includes(animation.id)) {
        return true
      }

      // Tiene suficientes puntos para desbloquear
      if (studentPoints >= animation.requiredPoints) {
        return true
      }

      return false
    }) as Animation[]
  }, [studentPoints, unlockedAnimationIds, gender])

  // Obtener animaciones bloqueadas
  const lockedAnimations = useMemo(() => {
    return animationsConfig.animations.filter((animation: Animation) => {
      if (gender && animation.gender !== gender) {
        return false
      }

      if (animation.unlocked || unlockedAnimationIds.includes(animation.id)) {
        return false
      }

      return studentPoints < animation.requiredPoints
    }) as Animation[]
  }, [studentPoints, unlockedAnimationIds, gender])

  // Animaciones por categoría
  const animationsByCategory = useMemo(() => {
    const categories: Record<string, Animation[]> = {
      dance: [],
      expression: [],
      idle: [],
      locomotion: []
    }

    availableAnimations.forEach(animation => {
      categories[animation.category].push(animation)
    })

    return categories
  }, [availableAnimations])

  // Obtener animación idle por defecto
  const getDefaultIdleAnimation = () => {
    const idleAnimations = animationsByCategory.idle
    if (idleAnimations.length === 0) return null

    // Preferir la primera idle que coincida con el género
    const genderMatched = idleAnimations.find(a => a.gender === gender)
    return genderMatched || idleAnimations[0]
  }

  // Obtener animación aleatoria de una categoría
  const getRandomAnimation = (category: 'dance' | 'expression' | 'idle' | 'locomotion') => {
    const animations = animationsByCategory[category]
    if (!animations || animations.length === 0) return null

    const randomIndex = Math.floor(Math.random() * animations.length)
    return animations[randomIndex]
  }

  // Buscar animación por ID
  const getAnimationById = (animationId: string) => {
    return animationsConfig.animations.find(
      (a: Animation) => a.id === animationId
    ) as Animation | undefined
  }

  return {
    // Listas de animaciones
    allAnimations: animationsConfig.animations as Animation[],
    availableAnimations,
    lockedAnimations,
    animationsByCategory,

    // Funciones útiles
    getDefaultIdleAnimation,
    getRandomAnimation,
    getAnimationById,

    // Estadísticas
    stats: {
      total: animationsConfig.totalAnimations,
      available: availableAnimations.length,
      locked: lockedAnimations.length,
      categories: animationsConfig.categories,
    }
  }
}
