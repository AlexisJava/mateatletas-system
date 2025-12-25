/**
 * Sandbox Constants - Mateatletas Content Editor
 *
 * Configuración de casas, componentes del design system,
 * y valores iniciales para el editor.
 */

import type {
  House,
  HouseConfig,
  DesignSystemComponent,
  ContentBlock,
  BackgroundPreset,
} from '../types/sandbox.types';

// Re-export House enum for convenience
export { House } from '../types/sandbox.types';

// ─────────────────────────────────────────────────────────────────────────────
// HOUSE CONFIGURATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const HOUSES: Record<House, HouseConfig> = {
  QUANTUM: {
    name: 'Quantum',
    ageRange: '6-9 años',
    primaryColor: '#ec4899',
    secondaryColor: '#db2777',
    accentColor: '#f472b6',
    bgColor: '#831843',
  },
  VERTEX: {
    name: 'Vertex',
    ageRange: '10-13 años',
    primaryColor: '#0ea5e9',
    secondaryColor: '#0284c7',
    accentColor: '#38bdf8',
    bgColor: '#0c4a6e',
  },
  PULSAR: {
    name: 'Pulsar',
    ageRange: '14-18 años',
    primaryColor: '#eab308',
    secondaryColor: '#ca8a04',
    accentColor: '#facc15',
    bgColor: '#713f12',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL JSON CONTENT
// ─────────────────────────────────────────────────────────────────────────────

export const INITIAL_JSON: ContentBlock = {
  type: 'Stage',
  props: { pattern: 'dots' },
  children: [
    {
      type: 'ContentZone',
      props: { variant: 'center' },
      children: [
        {
          type: 'LessonHeader',
          props: {
            title: 'Bienvenido a Mateatletas',
            subtitle: 'Introducción',
            icon: '🚀',
          },
        },
        {
          type: 'InfoAlert',
          props: { type: 'tip', title: 'Comienza aquí' },
          children: 'Edita el JSON a la izquierda para ver los cambios en tiempo real.',
        },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN SYSTEM COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

export const DESIGN_SYSTEM_COMPONENTS: DesignSystemComponent[] = [
  // ─── Layout Components ───
  {
    name: 'Stage',
    description: 'Contenedor principal con fondo y patrón',
    category: 'layout',
    defaultStructure: {
      type: 'Stage',
      props: { pattern: 'dots' },
      children: [],
    },
  },
  {
    name: 'ContentZone',
    description: 'Zona de contenido centrada o alineada',
    category: 'layout',
    defaultStructure: {
      type: 'ContentZone',
      props: { variant: 'center' },
      children: [],
    },
  },
  {
    name: 'Columns',
    description: 'Diseño de dos columnas',
    category: 'layout',
    defaultStructure: {
      type: 'Columns',
      props: { gap: 6 },
      children: [
        { type: 'div', children: 'Columna 1' },
        { type: 'div', children: 'Columna 2' },
      ],
    },
  },

  // ─── Content Components ───
  {
    name: 'LessonHeader',
    description: 'Encabezado con título, subtítulo e icono',
    category: 'content',
    defaultStructure: {
      type: 'LessonHeader',
      props: {
        title: 'Título de la Lección',
        subtitle: 'Módulo 1',
        icon: '📐',
      },
    },
  },
  {
    name: 'ActionCard',
    description: 'Tarjeta interactiva para acciones',
    category: 'content',
    defaultStructure: {
      type: 'ActionCard',
      props: {
        title: 'Concepto Clave',
        description: 'Descripción breve del concepto.',
        icon: '💡',
        active: false,
      },
    },
  },
  {
    name: 'STEAMChallenge',
    description: 'Pregunta de opción múltiple',
    category: 'content',
    defaultStructure: {
      type: 'STEAMChallenge',
      props: {
        question: '¿Cuál es el resultado de 2 + 2?',
        options: ['3', '4', '5', '22'],
        correctIndex: 1,
      },
    },
  },
  {
    name: 'MathHero',
    description: 'Cita inspiradora de un matemático',
    category: 'content',
    defaultStructure: {
      type: 'MathHero',
      props: {
        character: 'Ada Lovelace',
        quote: 'Esa mente tuya es capaz de cualquier cosa.',
      },
    },
  },
  {
    name: 'InfoAlert',
    description: 'Caja de alerta informativa',
    category: 'content',
    defaultStructure: {
      type: 'InfoAlert',
      props: {
        type: 'info',
        title: 'Sabías que...',
      },
      children: 'El texto de la información va aquí.',
    },
  },
  {
    name: 'StatCard',
    description: 'Tarjeta estadística simple',
    category: 'content',
    defaultStructure: {
      type: 'StatCard',
      props: {
        value: '98%',
        label: 'Precisión',
      },
    },
  },
  {
    name: 'Formula',
    description: 'Visualización de fórmula matemática',
    category: 'content',
    defaultStructure: {
      type: 'Formula',
      props: {
        tex: 'E = mc^2',
        label: 'Relatividad',
      },
    },
  },
  {
    name: 'Timeline',
    description: 'Línea de tiempo vertical',
    category: 'content',
    defaultStructure: {
      type: 'Timeline',
      props: {
        steps: [
          { title: 'Paso 1', desc: 'Descripción del paso 1' },
          { title: 'Paso 2', desc: 'Descripción del paso 2' },
        ],
      },
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// BACKGROUND PRESETS
// ─────────────────────────────────────────────────────────────────────────────

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'dots',
    name: 'Standard Dots',
    css: 'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)',
  },
  {
    id: 'cyber-grid',
    name: 'Cyber Grid',
    css: 'linear-gradient(rgba(59,246,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,246,255,0.5) 1px, transparent 1px)',
  },
  {
    id: 'stars',
    name: 'Deep Space',
    css: 'radial-gradient(white 1px, transparent 1px)',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    css: 'conic-gradient(from 180deg at 50% 50%, #02040a 0deg, #131b2e 120deg, #0b101b 240deg)',
  },
  {
    id: 'matrix',
    name: 'Matrix Rain',
    css: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 163, .2) 25%, transparent 26%)',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SUBJECTS CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const SUBJECTS = [
  { id: 'MATH' as const, label: 'Matemáticas' },
  { id: 'CODE' as const, label: 'Programación' },
  { id: 'SCIENCE' as const, label: 'Ciencias' },
];
