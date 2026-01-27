/**
 * Intent Catalog
 *
 * Single source of truth for all intent metadata.
 * Used by the Sandbox IntentLibrary and validation systems.
 */

import type { IntentCategoryMeta, IntentMeta, IntentCategoryId, IntentsByCategory } from './types';

// =============================================================================
// CATEGORIES
// =============================================================================

export const INTENT_CATEGORIES: IntentCategoryMeta[] = [
  {
    id: 'presentation',
    name: 'Presentación',
    icon: 'play-circle',
    color: 'green',
  },
  {
    id: 'interaction',
    name: 'Interacción',
    icon: 'mouse-pointer-click',
    color: 'blue',
  },
  {
    id: 'narrative',
    name: 'Narrativa',
    icon: 'message-circle',
    color: 'orange',
  },
  {
    id: 'gamification',
    name: 'Gamificación',
    icon: 'gamepad-2',
    color: 'violet',
  },
  {
    id: 'layout',
    name: 'Layout',
    icon: 'layout-grid',
    color: 'cyan',
  },
  {
    id: 'closure',
    name: 'Cierre',
    icon: 'flag-checkered',
    color: 'amber',
  },
];

// =============================================================================
// INTENTS CATALOG
// =============================================================================

export const INTENT_CATALOG: IntentMeta[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // PRESENTATION (5)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'presentation:hero',
    shortName: 'hero',
    name: 'Hero',
    category: 'presentation',
    description: 'Pantalla de bienvenida con título destacado y CTA',
    icon: 'sparkles',
    defaultProps: {
      intent: 'presentation:hero',
      title: '¡Bienvenido a la lección!',
      subtitle: 'Aprenderás conceptos increíbles',
      variant: 'gradient',
      ctaText: '¡Empezar!',
    },
  },
  {
    id: 'presentation:define',
    shortName: 'define',
    name: 'Definición',
    category: 'presentation',
    description: 'Presenta un término nuevo con su definición',
    icon: 'book-open',
    defaultProps: {
      intent: 'presentation:define',
      term: 'Nuevo concepto',
      definition: 'Explicación clara del concepto',
      category: 'Definición',
      example: 'Ejemplo de uso en contexto',
    },
  },
  {
    id: 'presentation:explain',
    shortName: 'explain',
    name: 'Explicación',
    category: 'presentation',
    description: 'Explicación paso a paso de un concepto',
    icon: 'lightbulb',
    defaultProps: {
      intent: 'presentation:explain',
      title: '¿Cómo funciona?',
      subtitle: 'Sigue estos pasos',
      category: 'Explicación',
      steps: [
        { title: 'Paso 1', content: 'Primera acción a realizar' },
        { title: 'Paso 2', content: 'Segunda acción a realizar' },
        { title: 'Paso 3', content: 'Tercera acción a realizar' },
      ],
    },
  },
  {
    id: 'presentation:showcase',
    shortName: 'showcase',
    name: 'Galería',
    category: 'presentation',
    description: 'Galería de ejemplos visuales',
    icon: 'images',
    defaultProps: {
      intent: 'presentation:showcase',
      title: 'Ejemplos',
      variant: 'carousel',
      items: [
        { id: '1', title: 'Ejemplo 1', description: 'Descripción del ejemplo' },
        { id: '2', title: 'Ejemplo 2', description: 'Descripción del ejemplo' },
      ],
    },
  },
  {
    id: 'presentation:highlight',
    shortName: 'highlight',
    name: 'Destacado',
    category: 'presentation',
    description: 'Destaca información importante (tip, fórmula, etc.)',
    icon: 'alert-circle',
    defaultProps: {
      intent: 'presentation:highlight',
      type: 'tip',
      title: 'Tip importante',
      content: 'Contenido destacado que el estudiante debe recordar',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // INTERACTION (6)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'interaction:quiz-mc',
    shortName: 'quiz-mc',
    name: 'Quiz Múltiple',
    category: 'interaction',
    description: 'Pregunta de opción múltiple con feedback',
    icon: 'circle-check',
    defaultProps: {
      intent: 'interaction:quiz-mc',
      question: '¿Cuál es la respuesta correcta?',
      options: [
        { id: 'a', text: 'Opción A' },
        { id: 'b', text: 'Opción B' },
        { id: 'c', text: 'Opción C' },
        { id: 'd', text: 'Opción D' },
      ],
      correctId: 'a',
      xpReward: 10,
      showMascot: true,
    },
  },
  {
    id: 'interaction:quiz-tf',
    shortName: 'quiz-tf',
    name: 'Verdadero/Falso',
    category: 'interaction',
    description: 'Pregunta de verdadero o falso',
    icon: 'toggle-left',
    defaultProps: {
      intent: 'interaction:quiz-tf',
      statement: 'Afirmación a evaluar como verdadera o falsa',
      correctAnswer: true,
      correctFeedback: '¡Correcto!',
      incorrectFeedback: 'No es correcto, intenta de nuevo',
      xpReward: 10,
    },
  },
  {
    id: 'interaction:drag-drop',
    shortName: 'drag-drop',
    name: 'Arrastrar y Soltar',
    category: 'interaction',
    description: 'Reordenar elementos arrastrando',
    icon: 'grip-vertical',
    defaultProps: {
      intent: 'interaction:drag-drop',
      instruction: 'Ordena los elementos correctamente',
      items: [
        { id: '1', content: 'Elemento 1' },
        { id: '2', content: 'Elemento 2' },
        { id: '3', content: 'Elemento 3' },
      ],
      correctOrder: ['1', '2', '3'],
      xpReward: 15,
      showMascot: true,
    },
  },
  {
    id: 'interaction:matching',
    shortName: 'matching',
    name: 'Emparejar',
    category: 'interaction',
    description: 'Conectar pares relacionados',
    icon: 'link',
    defaultProps: {
      intent: 'interaction:matching',
      title: 'Conecta los pares',
      pairs: [
        { id: '1', left: 'Izquierda 1', right: 'Derecha 1' },
        { id: '2', left: 'Izquierda 2', right: 'Derecha 2' },
        { id: '3', left: 'Izquierda 3', right: 'Derecha 3' },
      ],
      xpReward: 20,
    },
  },
  {
    id: 'interaction:fill-blank',
    shortName: 'fill-blank',
    name: 'Completar',
    category: 'interaction',
    description: 'Completar espacios en blanco',
    icon: 'text-cursor-input',
    defaultProps: {
      intent: 'interaction:fill-blank',
      text: 'El resultado de 2 + 2 es {{blank:número}}.',
      answers: ['4'],
      xpReward: 10,
    },
  },
  {
    id: 'interaction:sorting',
    shortName: 'sorting',
    name: 'Ordenar',
    category: 'interaction',
    description: 'Ordenar elementos por criterio',
    icon: 'arrow-up-down',
    defaultProps: {
      intent: 'interaction:sorting',
      instruction: 'Ordena de menor a mayor',
      items: [
        { id: '1', label: '10', value: 10 },
        { id: '2', label: '5', value: 5 },
        { id: '3', label: '15', value: 15 },
      ],
      direction: 'asc',
      criterion: 'numeric',
      xpReward: 15,
      showMascot: true,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // NARRATIVE (3)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'narrative:story',
    shortName: 'story',
    name: 'Historia',
    category: 'narrative',
    description: 'Narrativa con segmentos de texto',
    icon: 'book',
    defaultProps: {
      intent: 'narrative:story',
      title: 'Una historia',
      segments: [
        { text: 'Primer segmento de la historia...', mood: 'happy' },
        { text: 'Segundo segmento de la historia...', mood: 'thinking' },
      ],
      showDots: true,
    },
  },
  {
    id: 'narrative:dialogue',
    shortName: 'dialogue',
    name: 'Diálogo',
    category: 'narrative',
    description: 'Conversación interactiva con opciones',
    icon: 'message-square',
    defaultProps: {
      intent: 'narrative:dialogue',
      title: 'Conversación',
      turns: [
        { speaker: 'bit', message: '¡Hola! ¿Cómo estás?', mood: 'happy' },
        {
          speaker: 'user',
          message: '',
          choices: [
            { text: '¡Muy bien!', nextTurn: 1 },
            { text: 'Regular...', nextTurn: 2 },
          ],
        },
      ],
    },
  },
  {
    id: 'narrative:mascot-speech',
    shortName: 'mascot-speech',
    name: 'Bit Habla',
    category: 'narrative',
    description: 'Mensaje motivacional de la mascota',
    icon: 'bot',
    defaultProps: {
      intent: 'narrative:mascot-speech',
      message: '¡Lo estás haciendo genial! Sigue así.',
      type: 'motivation',
      mood: 'happy',
      ctaText: 'Continuar',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // GAMIFICATION (4)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'gamification:reward',
    shortName: 'reward',
    name: 'Recompensa',
    category: 'gamification',
    description: 'Pantalla de celebración con recompensas',
    icon: 'gift',
    defaultProps: {
      intent: 'gamification:reward',
      title: '¡Felicitaciones!',
      subtitle: 'Completaste esta sección',
      rewards: [{ type: 'xp', value: 50, label: 'Puntos de experiencia' }],
      showConfetti: true,
      showMascot: true,
    },
  },
  {
    id: 'gamification:achievement',
    shortName: 'achievement',
    name: 'Logro',
    category: 'gamification',
    description: 'Logro desbloqueado',
    icon: 'trophy',
    defaultProps: {
      intent: 'gamification:achievement',
      title: 'Primer Paso',
      description: 'Completaste tu primera lección',
      icon: '🏆',
      tier: 'common',
      xpReward: 100,
      isNewUnlock: true,
    },
  },
  {
    id: 'gamification:challenge',
    shortName: 'challenge',
    name: 'Desafío',
    category: 'gamification',
    description: 'Quiz cronometrado con bonus',
    icon: 'timer',
    defaultProps: {
      intent: 'gamification:challenge',
      title: 'Desafío Rápido',
      timeLimit: 30,
      questions: [
        {
          id: '1',
          question: '¿Cuánto es 2 + 2?',
          options: ['3', '4', '5', '6'],
          correctIndex: 1,
        },
      ],
      xpPerQuestion: 10,
      completionBonus: 50,
    },
  },
  {
    id: 'gamification:leaderboard',
    shortName: 'leaderboard',
    name: 'Ranking',
    category: 'gamification',
    description: 'Tabla de posiciones',
    icon: 'medal',
    defaultProps: {
      intent: 'gamification:leaderboard',
      title: 'Ranking Semanal',
      subtitle: 'Top estudiantes',
      entries: [
        { id: '1', name: 'Estudiante 1', score: 1500, change: 2 },
        { id: '2', name: 'Estudiante 2', score: 1400, change: -1 },
        { id: '3', name: 'Tú', score: 1300, isCurrentUser: true },
      ],
      scoreLabel: 'XP',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LAYOUT (4)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'layout:split',
    shortName: 'split',
    name: 'Dividido',
    category: 'layout',
    description: 'Contenido en dos columnas',
    icon: 'columns',
    defaultProps: {
      intent: 'layout:split',
      left: { title: 'Columna izquierda', content: 'Contenido de la izquierda' },
      right: { title: 'Columna derecha', content: 'Contenido de la derecha' },
      ratio: '50-50',
      stackOnMobile: true,
      showContinue: true,
    },
  },
  {
    id: 'layout:bento',
    shortName: 'bento',
    name: 'Bento',
    category: 'layout',
    description: 'Grid estilo Apple con celdas variables',
    icon: 'layout-dashboard',
    defaultProps: {
      intent: 'layout:bento',
      title: 'Información',
      columns: 3,
      cells: [
        { id: '1', content: 'Celda 1', colSpan: 2 },
        { id: '2', content: 'Celda 2', colSpan: 1 },
        { id: '3', content: 'Celda 3', colSpan: 1 },
        { id: '4', content: 'Celda 4', colSpan: 2 },
      ],
      showContinue: true,
    },
  },
  {
    id: 'layout:tabs',
    shortName: 'tabs',
    name: 'Pestañas',
    category: 'layout',
    description: 'Contenido organizado en pestañas',
    icon: 'folder',
    defaultProps: {
      intent: 'layout:tabs',
      title: 'Explorar',
      variant: 'pills',
      tabs: [
        { id: 'tab1', label: 'Primera', content: 'Contenido de la primera pestaña' },
        { id: 'tab2', label: 'Segunda', content: 'Contenido de la segunda pestaña' },
      ],
      showContinue: true,
    },
  },
  {
    id: 'layout:carousel',
    shortName: 'carousel',
    name: 'Carrusel',
    category: 'layout',
    description: 'Slides horizontales navegables',
    icon: 'gallery-horizontal',
    defaultProps: {
      intent: 'layout:carousel',
      title: 'Recorrido',
      showCounter: true,
      showDots: true,
      slides: [
        { id: '1', content: 'Slide 1', title: 'Primer slide' },
        { id: '2', content: 'Slide 2', title: 'Segundo slide' },
        { id: '3', content: 'Slide 3', title: 'Tercer slide' },
      ],
      showContinue: true,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CLOSURE (3)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'closure:summary',
    shortName: 'summary',
    name: 'Resumen',
    category: 'closure',
    description: 'Resumen de puntos clave aprendidos',
    icon: 'list-checks',
    defaultProps: {
      intent: 'closure:summary',
      title: 'Lo que aprendiste',
      subtitle: 'Puntos clave de esta lección',
      points: [
        { id: '1', text: 'Primer punto aprendido' },
        { id: '2', text: 'Segundo punto aprendido' },
        { id: '3', text: 'Tercer punto aprendido' },
      ],
      closingMessage: '¡Excelente trabajo!',
      showMascot: true,
    },
  },
  {
    id: 'closure:next-steps',
    shortName: 'next-steps',
    name: 'Próximos Pasos',
    category: 'closure',
    description: 'Sugerencias de qué hacer después',
    icon: 'arrow-right',
    defaultProps: {
      intent: 'closure:next-steps',
      title: '¿Qué sigue?',
      subtitle: 'Elige tu próximo paso',
      steps: [
        {
          id: '1',
          title: 'Siguiente lección',
          description: 'Continúa aprendiendo',
          recommended: true,
        },
        { id: '2', title: 'Practicar', description: 'Refuerza lo aprendido' },
        { id: '3', title: 'Revisar', description: 'Repasa los conceptos' },
      ],
      showMascot: true,
    },
  },
  {
    id: 'closure:certificate',
    shortName: 'certificate',
    name: 'Certificado',
    category: 'closure',
    description: 'Certificado de finalización',
    icon: 'award',
    defaultProps: {
      intent: 'closure:certificate',
      studentName: 'Estudiante',
      courseTitle: 'Nombre de la lección',
      xpEarned: 100,
      showDownload: true,
      showShare: true,
      ctaText: 'Continuar',
    },
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all intents grouped by category
 */
export function getIntentsByCategory(): IntentsByCategory[] {
  return INTENT_CATEGORIES.map((category) => ({
    category,
    intents: INTENT_CATALOG.filter((intent) => intent.category === category.id),
  }));
}

/**
 * Get a single intent by its ID
 */
export function getIntentById(id: string): IntentMeta | undefined {
  return INTENT_CATALOG.find((intent) => intent.id === id);
}

/**
 * Get a single intent by its short name
 */
export function getIntentByShortName(shortName: string): IntentMeta | undefined {
  return INTENT_CATALOG.find((intent) => intent.shortName === shortName);
}

/**
 * Get category metadata by ID
 */
export function getCategoryById(id: IntentCategoryId): IntentCategoryMeta | undefined {
  return INTENT_CATEGORIES.find((cat) => cat.id === id);
}

/**
 * Get all intents for a specific category
 */
export function getIntentsForCategory(categoryId: IntentCategoryId): IntentMeta[] {
  return INTENT_CATALOG.filter((intent) => intent.category === categoryId);
}
