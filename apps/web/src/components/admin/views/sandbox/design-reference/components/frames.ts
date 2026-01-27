/**
 * Estructura completa de frames extraída de sandbox_refactorizado.pen
 * Cada frame representa una pantalla o estado del Sandbox Editor
 *
 * Fuente: /home/alexis/Documentos/diseños-pencil/sandbox_refactorizado.pen
 * Extraído: Enero 2026
 */

// =============================================================================
// TIPOS BASE
// =============================================================================

export interface PenNode {
  id: string;
  name: string;
  type: 'frame' | 'text' | 'rectangle' | 'ellipse' | 'icon_font' | 'path' | 'group';
  children?: PenNode[];
  // Layout
  layout?: 'none' | 'horizontal' | 'vertical';
  alignItems?: 'start' | 'center' | 'end';
  justifyContent?: 'start' | 'center' | 'end' | 'space_between' | 'space_around';
  gap?: number;
  padding?: number | number[];
  // Sizing
  width?: number | string;
  height?: number | string;
  x?: number;
  y?: number;
  // Appearance
  fill?: string | GradientFill;
  stroke?: StrokeStyle;
  cornerRadius?: number | number[];
  effect?: Effect | Effect[];
  clip?: boolean;
  // Text specific
  content?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  // Icon specific
  iconFontFamily?: string;
  iconFontName?: string;
}

export interface GradientFill {
  type: 'gradient';
  gradientType: 'linear' | 'radial';
  colors: Array<{ color: string; position: number }>;
  rotation?: number;
}

export interface StrokeStyle {
  fill: string;
  thickness: number | { top?: number; right?: number; bottom?: number; left?: number };
  align?: 'inside' | 'outside' | 'center';
}

export interface Effect {
  type: 'shadow' | 'background_blur';
  blur?: number;
  radius?: number;
  color?: string;
  offset?: { x: number; y: number };
  shadowType?: 'outer' | 'inner';
}

// =============================================================================
// FRAME 1: SELECTOR DE TIPO
// =============================================================================

export const frame1SelectorDeTipo = {
  id: 'xJinG',
  name: '1. Selector de Tipo',
  description: 'Pantalla inicial para elegir entre Micro-lección o Planificación',
  size: { width: 1440, height: 900 },
  components: {
    bgGlowViolet: {
      id: 'Duo4V',
      type: 'ellipse',
      size: { width: 800, height: 800 },
      position: { x: -200, y: -200 },
      fill: 'radial-gradient(#8b5cf615, transparent)',
    },
    bgGlowCyan: {
      id: 'OgBDl',
      type: 'ellipse',
      size: { width: 600, height: 600 },
      position: { x: 900, y: 400 },
      fill: 'radial-gradient(#06b6d412, transparent)',
    },
    content: {
      id: 'vK9nB',
      layout: 'vertical',
      alignItems: 'center',
      gap: 48,
      padding: [80, 120],
      children: {
        header: {
          id: 'HrzMG',
          layout: 'vertical',
          alignItems: 'center',
          gap: 16,
          children: {
            logo: {
              id: 'oygL6',
              size: { width: 56, height: 56 },
              cornerRadius: 16,
              fill: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              shadow: '0 4px 24px #8b5cf640',
              content: 'S',
              fontFamily: 'Inter',
              fontSize: 24,
              fontWeight: '700',
            },
            title: {
              id: 'H9gHL',
              content: '¿Qué quieres crear hoy?',
              fill: '$--text-primary',
              fontFamily: 'Inter',
              fontSize: 32,
              fontWeight: '700',
            },
            subtitle: {
              id: '5u3XP',
              content: 'Elige el tipo de contenido educativo que vas a diseñar',
              fill: '$--text-secondary',
              fontFamily: 'Inter',
              fontSize: 16,
            },
          },
        },
        cardsContainer: {
          id: 'm2EuL',
          layout: 'horizontal',
          gap: 32,
          children: {
            cardMicroLeccion: {
              id: 'JVwrJ',
              width: 400,
              cornerRadius: 24,
              fill: '#1a1a2480',
              backdropBlur: 20,
              border: '1px solid #ffffff08',
              shadow: '0 8px 40px #00000030',
              padding: 32,
              gap: 24,
              layout: 'vertical',
              accentColor: '#06b6d4',
              children: {
                iconContainer: {
                  id: 'B88SP',
                  size: { width: 64, height: 64 },
                  cornerRadius: 16,
                  fill: '#06b6d415',
                  icon: 'zap',
                  iconColor: '#06b6d4',
                },
                content: {
                  title: 'Micro-lección',
                  description:
                    'Contenido educativo breve y enfocado. Ideal para conceptos puntuales que se pueden aprender en pocos minutos.',
                },
                features: [
                  { icon: 'play', text: 'Pantalla de Inicio' },
                  { icon: 'flag', text: 'Pantalla de Cierre' },
                  { icon: 'timer', text: '2-5 minutos de contenido' },
                ],
                ctaButton: {
                  id: 'ZHeYZ',
                  text: 'Crear Micro-lección',
                  fill: '#06b6d4',
                  shadow: '0 4px 16px #06b6d440',
                },
              },
            },
            cardPlanificacion: {
              id: 'OZ2Mw',
              width: 400,
              cornerRadius: 24,
              fill: '#1a1a2480',
              backdropBlur: 20,
              border: '1px solid #ffffff08',
              shadow: '0 8px 40px #00000030',
              padding: 32,
              gap: 24,
              layout: 'vertical',
              accentColor: '#8b5cf6',
              children: {
                iconContainer: {
                  id: 'AXXjQ',
                  size: { width: 64, height: 64 },
                  cornerRadius: 16,
                  fill: '#8b5cf615',
                  icon: 'calendar',
                  iconColor: '#8b5cf6',
                },
                content: {
                  title: 'Planificación',
                  description:
                    'Diseña un curso completo con múltiples clases estructuradas. Perfecto para programas de formación extensos.',
                },
                features: [
                  { icon: 'layers', text: '4, 6, 8 o hasta 20 clases' },
                  { icon: 'git-branch', text: 'Estructura modular' },
                  { icon: 'target', text: 'Objetivos por clase' },
                ],
                ctaButton: {
                  id: 'F2Biz',
                  text: 'Crear Planificación',
                  fill: '#8b5cf6',
                  shadow: '0 4px 16px #8b5cf640',
                },
              },
            },
          },
        },
        recentProjects: {
          id: 'bhUlv',
          layout: 'vertical',
          gap: 16,
          width: 'fill_container',
          children: {
            header: {
              title: 'Proyectos recientes',
              viewAll: 'Ver todos →',
            },
            items: [
              {
                id: 'O1f2P',
                icon: 'zap',
                iconBg: '#06b6d410',
                iconColor: '#06b6d4',
                title: 'Intro to Variables',
                meta: 'Micro-lección • Editado hace 2h',
              },
              {
                id: 'UP7un',
                icon: 'calendar',
                iconBg: '#8b5cf610',
                iconColor: '#8b5cf6',
                title: 'Curso de Python',
                meta: 'Planificación • 8 clases',
              },
              {
                id: 'IIaEA',
                icon: 'calendar',
                iconBg: '#8b5cf610',
                iconColor: '#8b5cf6',
                title: 'UX Fundamentals',
                meta: 'Planificación • 12 clases',
              },
            ],
          },
        },
      },
    },
  },
};

// =============================================================================
// FRAME 2A: CONFIG MICRO-LECCION
// =============================================================================

export const frame2aConfigMicroLeccion = {
  id: 'sfnml',
  name: '2a. Config - Micro-leccion',
  description: 'Configurar estructura de micro-lección (Intro → Contenido → Cierre)',
  size: { width: 1440, height: 900 },
  accentColor: '#06b6d4',
  components: {
    backButton: {
      id: 'V697x',
      icon: 'arrow-left',
      text: 'Volver',
      fill: 'transparent',
    },
    header: {
      id: 'VuuPK',
      iconContainer: {
        size: { width: 64, height: 64 },
        cornerRadius: 16,
        fill: '#06b6d415',
        shadow: '0 0 20px #06b6d430',
        icon: 'zap',
        iconColor: '#06b6d4',
      },
      title: 'Crear Micro-lección',
      subtitle: 'Una experiencia de aprendizaje breve y enfocada',
    },
    structurePreview: {
      id: '1ZoEJ',
      cornerRadius: 24,
      fill: '#1a1a2440',
      backdropBlur: 16,
      border: '1px solid #ffffff06',
      padding: 32,
      gap: 24,
      label: 'Estructura de tu micro-lección',
      flow: [
        {
          id: 'Cw5Tj',
          icon: 'play',
          label: 'Inicio',
          desc: 'Presentación',
          color: '#06b6d4',
          fill: '#06b6d415',
          border: '#06b6d450',
        },
        {
          id: 'BxEvT',
          icon: 'layers',
          label: 'Contenido',
          desc: 'Tus intents',
          color: '#8b5cf6',
          fill: '#8b5cf610',
          border: '#8b5cf630',
        },
        {
          id: 'CrPiD',
          icon: 'flag',
          label: 'Cierre',
          desc: 'Resumen',
          color: '#06b6d4',
          fill: '#06b6d415',
          border: '#06b6d450',
        },
      ],
    },
    lessonNameInput: {
      id: '3frOq',
      label: 'Nombre de la micro-lección',
      placeholder: 'Introducción a Variables',
      cornerRadius: 12,
      fill: '#1a1a2460',
      backdropBlur: 12,
      border: '1px solid #ffffff10',
      padding: [14, 16],
    },
    tip: {
      id: 'bxuCs',
      icon: 'lightbulb',
      iconColor: '#06b6d4',
      text: 'Las micro-lecciones son ideales para conceptos que se aprenden en 2-5 minutos',
      cornerRadius: 10,
      fill: '#06b6d408',
      border: '1px solid #06b6d420',
    },
    actions: {
      cancelBtn: {
        id: '5hXPt',
        text: 'Cancelar',
        fill: 'transparent',
        border: '1px solid #ffffff15',
      },
      continueBtn: {
        id: 'Xx0iV',
        text: 'Crear Micro-lección',
        icon: 'arrow-right',
        fill: '#06b6d4',
        shadow: '0 4px 20px #06b6d450',
      },
    },
  },
};

// =============================================================================
// FRAME 2B: CONFIG PLANIFICACION
// =============================================================================

export const frame2bConfigPlanificacion = {
  id: 'v0Q2w',
  name: '2b. Config - Planificacion',
  description: 'Seleccionar cantidad de clases para el curso',
  size: { width: 1440, height: 900 },
  accentColor: '#8b5cf6',
  components: {
    backButton: {
      id: 'UAk2R',
      icon: 'arrow-left',
      text: 'Volver',
    },
    header: {
      id: '7rrYD',
      iconContainer: {
        size: { width: 64, height: 64 },
        cornerRadius: 16,
        fill: '#8b5cf615',
        shadow: '0 0 20px #8b5cf630',
        icon: 'calendar',
        iconColor: '#8b5cf6',
      },
      title: 'Configurar Planificación',
      subtitle: '¿Cuántas clases tendrá tu curso?',
    },
    optionsGrid: {
      id: 'bd2yU',
      width: 800,
      gap: 16,
      options: [
        { id: 'rfRsr', value: 4 },
        { id: 'ntbH3', value: 6 },
        { id: 'c6jIU', value: 8, selected: true },
        { id: 'y09fP', value: 12 },
        { id: 'MVRii', value: 16 },
        { id: 'cg9zy', value: 20 },
      ],
      optionStyle: {
        size: { width: 120, height: 120 },
        cornerRadius: 20,
        fill: '#1a1a2480',
        backdropBlur: 16,
        border: '1px solid #ffffff08',
        layout: 'vertical',
        gap: 8,
      },
      selectedStyle: {
        fill: '#8b5cf620',
        border: '2px solid #8b5cf6',
        shadow: '0 0 20px #8b5cf640',
        textColor: '#8b5cf6',
        hasCheckmark: true,
      },
    },
    customOption: {
      id: 'xjjoF',
      label: 'O ingresa un número personalizado:',
      inputWidth: 80,
      suffix: 'clases',
    },
    courseNameInput: {
      id: 'CkN8x',
      label: 'Nombre del curso',
      placeholder: 'Mi nuevo curso',
      width: 500,
    },
    actions: {
      cancelBtn: { id: 'uwKZG', text: 'Cancelar' },
      continueBtn: {
        id: 'SpBSv',
        text: 'Crear Planificación',
        icon: 'arrow-right',
        fill: '#8b5cf6',
        shadow: '0 4px 20px #8b5cf650',
      },
    },
  },
};

// =============================================================================
// FRAME 3: EDITOR PRINCIPAL
// =============================================================================

export const frame3EditorPrincipal = {
  id: 'ualHD',
  name: '3. Editor Principal',
  description: 'Layout completo del editor con sidebar, JSON editor y preview',
  size: { width: 1440, height: 900 },
  components: {
    header: {
      id: 'ZDBcf',
      height: 56,
      fill: '#0c0c1280',
      backdropBlur: 20,
      borderBottom: '1px solid #ffffff08',
      padding: [0, 20],
      layout: 'horizontal',
      justifyContent: 'space_between',
      alignItems: 'center',
      children: {
        left: {
          logo: {
            id: 'AQUeT',
            size: { width: 36, height: 36 },
            cornerRadius: 12,
            fill: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            shadow: '0 2px 12px $--glow-violet',
            content: 'S',
          },
          titleGroup: {
            id: 'WDWjf',
            fileName: 'intro-to-variables',
            editIcon: 'pencil',
          },
        },
        right: {
          saveStatus: {
            id: 'W97z7',
            icon: 'check',
            text: 'Saved',
            color: '$--success',
            fill: '#22c55e15',
          },
        },
      },
    },
    mainBody: {
      id: 'pSMsi',
      layout: 'horizontal',
      children: {
        sidebar: {
          id: 'ietSQ',
          width: 280,
          fill: '#0c0c1260',
          backdropBlur: 20,
          borderRight: '1px solid #ffffff06',
          layout: 'vertical',
          children: {
            sidebarHeader: {
              id: 'KF0vC',
              height: 48,
              title: 'Intents',
              searchBtn: true,
            },
            sidebarContent: {
              id: 'Gp3gp',
              layout: 'vertical',
              gap: 6,
              padding: 12,
              categories: [
                {
                  id: 'fKcn7',
                  emoji: '🎯',
                  name: 'Presentación',
                  expanded: true,
                  intents: ['hero', 'concept-intro', 'key-point', 'summary'],
                  activeIntent: 'hero',
                },
                { id: 'lo27D', emoji: '🎮', name: 'Interacción', count: 6 },
                { id: 'Yc85F', emoji: '📖', name: 'Narrativa', count: 3 },
                { id: 'vsWKA', emoji: '🏆', name: 'Gamificación', count: 4 },
                { id: 'YCcL9', emoji: '📐', name: 'Layout', count: 4 },
                { id: 'WMABA', emoji: '✅', name: 'Cierre', count: 3 },
              ],
            },
            sidebarFooter: {
              id: 'Mpl4n',
              title: 'STRUCTURE',
              tree: [
                { id: '2Owvy', icon: 'chevron-down', name: 'Teoría', level: 0 },
                {
                  id: 'zQKhQ',
                  icon: 'file-text',
                  name: 'hero',
                  level: 1,
                  active: true,
                },
                {
                  id: '29WQv',
                  icon: 'file-text',
                  name: 'concept-intro',
                  level: 1,
                },
                {
                  id: 'dsZEs',
                  icon: 'chevron-right',
                  name: 'Práctica',
                  level: 0,
                },
                {
                  id: 'TAhgx',
                  icon: 'chevron-right',
                  name: 'Evaluación',
                  level: 0,
                },
              ],
            },
          },
        },
        editorPanel: {
          id: 'XsVL8',
          fill: '$--bg-canvas',
          layout: 'vertical',
          children: {
            editorHeader: {
              id: 'paiVZ',
              height: 44,
              tab: {
                id: 'bfgjK',
                icon: 'file-code',
                iconColor: '$--accent-cyan',
                name: 'hero.json',
                active: true,
              },
              formatBtn: { icon: 'sparkles' },
            },
            editorBody: {
              id: 'UaPkf',
              fill: '$--bg-surface',
              lineNumbers: { id: '0i80b', width: 48, fill: '#0a0a0f' },
              codeArea: {
                id: 'yENcH',
                fontFamily: 'JetBrains Mono',
                fontSize: 12,
                lineHeight: 1.7,
                syntaxColors: {
                  property: '#06b6d4',
                  string: '#a5d6ff',
                  default: '$--text-primary',
                },
              },
            },
          },
        },
        previewPanel: {
          id: 'P7mzg',
          width: 480,
          fill: '#0a0a10',
          borderLeft: '1px solid #ffffff06',
          layout: 'vertical',
          children: {
            previewHeader: {
              id: 'csLXd',
              height: 44,
              title: 'Preview',
              icon: 'eye',
              actions: ['refresh-cw', 'maximize-2'],
            },
            previewBody: {
              id: '3fiBH',
              padding: 24,
              previewCard: {
                id: 'T1UIy',
                cornerRadius: 24,
                fill: '$--bg-surface',
                border: '1px solid #ffffff08',
                shadow: '0 8px 40px #00000030',
                padding: 32,
                gap: 24,
                layout: 'vertical',
                alignItems: 'center',
                children: {
                  heroImage: {
                    id: 'NOWmX',
                    size: { width: 200, height: 140 },
                    cornerRadius: 20,
                    fill: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                    shadow: '0 4px 20px $--glow-violet',
                    codeBox: {
                      content: 'let x = 5',
                      fontFamily: 'JetBrains Mono',
                    },
                  },
                  heroText: {
                    title: 'Introduction to Variables',
                    subtitle: 'Learn how to store and use data in your programs',
                  },
                  progress: {
                    id: 'SKOM5',
                    width: 160,
                    height: 4,
                    fill: '$--bg-elevated',
                    progressFill: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
                    value: 50,
                  },
                  startButton: {
                    id: 'W3bMl',
                    text: 'Start Learning',
                    icon: 'arrow-right',
                    fill: '$--accent-violet',
                    shadow: '0 4px 16px $--glow-violet',
                    cornerRadius: 22,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

// =============================================================================
// FRAME 4: HOVER + TOOLTIP
// =============================================================================

export const frame4HoverTooltip = {
  id: '6FgJp',
  name: '4. Estado - Hover + Tooltip',
  description: 'Estado del editor con un intent en hover mostrando tooltip',
  size: { width: 1440, height: 900 },
  tooltip: {
    id: '0HsO5',
    width: 220,
    position: { x: 50, y: 220 },
    cornerRadius: 12,
    fill: '#1c1c28f0',
    backdropBlur: 16,
    border: '1px solid #ffffff12',
    shadow: '0 8px 20px #00000050',
    padding: 12,
    gap: 8,
    layout: 'vertical',
    children: {
      header: {
        id: 'Ca6nq',
        icon: { name: 'sparkles', color: '$--accent-violet' },
        title: {
          content: 'concept-intro',
          fontFamily: 'JetBrains Mono',
          fontSize: 12,
          fontWeight: '600',
        },
      },
      description: {
        id: 'UeCNw',
        content: 'Introduce un nuevo concepto con contexto visual y explicación clara.',
        fontFamily: 'Inter',
        fontSize: 11,
        lineHeight: 1.5,
        fill: '$--text-secondary',
      },
      divider: {
        id: 'LIJ0r',
        height: 1,
        fill: '#ffffff08',
      },
      meta: {
        id: 'wKkkE',
        gap: 12,
        items: [
          { icon: 'layers', text: 'Básico' },
          { icon: 'timer', text: '~2 min' },
        ],
      },
      shortcut: {
        id: '5Rov3',
        label: 'Insertar',
        key: '⏎ Enter',
        keyStyle: {
          fill: '#ffffff10',
          cornerRadius: 4,
          padding: [2, 6],
          fontFamily: 'JetBrains Mono',
          fontSize: 9,
        },
      },
    },
  },
};

// =============================================================================
// FRAME 6: KEYBOARD SHORTCUTS
// =============================================================================

export const frame6KeyboardShortcuts = {
  id: 'SG17P',
  name: '6. Estado - Keyboard Shortcuts',
  description: 'Modal con atajos de teclado',
  size: { width: 1440, height: 900 },
  overlay: {
    id: 'tww5i',
    fill: '#00000080',
  },
  modal: {
    id: 'qEC6O',
    width: 560,
    position: { x: 440, y: 120 },
    cornerRadius: 20,
    fill: '#1a1a24f5',
    backdropBlur: 24,
    border: '1px solid #ffffff10',
    shadow: '0 16px 60px #00000060',
    layout: 'vertical',
    children: {
      header: {
        id: 'H1Q4F',
        padding: [20, 24],
        borderBottom: '1px solid #ffffff08',
        icon: 'keyboard',
        title: 'Keyboard Shortcuts',
        closeBtn: true,
      },
      body: {
        id: '2onFB',
        padding: 24,
        gap: 32,
        columns: 2,
        sections: [
          {
            title: 'GENERAL',
            shortcuts: [
              { label: 'Guardar', keys: ['⌘', 'S'] },
              { label: 'Deshacer', keys: ['⌘', 'Z'] },
              { label: 'Rehacer', keys: ['⌘', '⇧', 'Z'] },
            ],
          },
          {
            title: 'EDITOR',
            shortcuts: [
              { label: 'Formatear JSON', keys: ['⌘', '⇧', 'F'] },
              { label: 'Quick Fix', keys: ['⌘', '.'] },
              { label: 'Ir a línea', keys: ['⌘', 'G'] },
            ],
          },
          {
            title: 'INTENTS',
            shortcuts: [
              {
                label: 'Insertar intent',
                keys: ['⏎'],
                keyStyle: 'accent',
              },
              { label: 'Buscar intent', keys: ['⌘', 'K'] },
              { label: 'Navegar categorías', keys: ['↑ ↓'] },
            ],
          },
          {
            title: 'PREVIEW',
            shortcuts: [{ label: 'Refrescar preview', keys: ['⌘', 'R'] }],
          },
        ],
      },
      footer: {
        id: 'NXdSE',
        padding: [16, 24],
        borderTop: '1px solid #ffffff08',
        text: 'Presiona ? para ver esta ayuda en cualquier momento',
      },
    },
  },
};

// =============================================================================
// FRAME 10: VISTA ESTUDIANTE
// =============================================================================

export const frame10VistaEstudiante = {
  id: 'W2jz5',
  name: '10. Vista Estudiante - Fullscreen',
  description: 'Preview fullscreen para estudiantes',
  size: { width: 1440, height: 900 },
  fill: '#0a0a10',
  components: {
    topBar: {
      id: 'uuj3N',
      fill: '#00000040',
      backdropBlur: 12,
      padding: [16, 32],
      justifyContent: 'space_between',
      children: {
        left: {
          lessonBadge: {
            icon: 'zap',
            iconColor: '#8b5cf6',
            text: 'Micro-lección',
            fill: '#8b5cf620',
          },
          lessonTitle: 'Introducción a Variables',
        },
        right: {
          progressText: '1 / 3',
          closeBtn: { icon: 'x', fill: '#ffffff08' },
        },
      },
    },
    mainContent: {
      id: 'HI4vc',
      padding: [40, 120],
      alignItems: 'center',
      justifyContent: 'center',
      hero: {
        visual: {
          id: '824zG',
          size: { width: 320, height: 200 },
          cornerRadius: 24,
          fill: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
          shadow: '0 12px 40px #8b5cf650',
          content: 'let x = 5',
          fontFamily: 'JetBrains Mono',
          fontSize: 28,
        },
        title: {
          content: 'Introduction to Variables',
          fontSize: 42,
          fontWeight: '700',
          textAlign: 'center',
        },
        subtitle: {
          content: 'Learn how to store and manipulate data in your programs',
          fontSize: 18,
          width: 600,
          textAlign: 'center',
        },
      },
    },
    bottomBar: {
      id: 'TibcV',
      fill: '#00000020',
      backdropBlur: 12,
      padding: [24, 120],
      gap: 24,
      layout: 'vertical',
      alignItems: 'center',
      children: {
        progressBar: {
          id: 'gywfH',
          width: 600,
          height: 6,
          cornerRadius: 3,
          fill: '#ffffff10',
          progressFill: 'linear-gradient(0deg, #8b5cf6, #06b6d4)',
        },
        navigation: {
          prevBtn: {
            icon: 'arrow-left',
            text: 'Anterior',
            fill: '#ffffff08',
            border: '1px solid #ffffff10',
          },
          nextBtn: {
            text: 'Continuar',
            icon: 'arrow-right',
            fill: '#8b5cf6',
            shadow: '0 4px 20px #8b5cf650',
          },
        },
      },
    },
  },
};

// =============================================================================
// FRAME 11: EDITOR INTENT SELECCIONADO
// =============================================================================

export const frame11EditorIntentSeleccionado = {
  id: 'lg1nw',
  name: '11. Editor - Intent Seleccionado',
  description: 'Editor con un intent activo y la library visible',
  size: { width: 1440, height: 900 },
  components: {
    sidebar: {
      width: 240,
      structure: [
        { name: 'Inicio', icon: 'folder', active: true },
        { name: 'intro-variables', icon: 'box', level: 1 },
        { name: 'Agregar intent...', icon: 'plus', level: 1, empty: true },
        { name: 'Cierre', icon: 'folder' },
      ],
    },
    editor: {
      injectedBadge: {
        icon: 'sparkles',
        text: 'JSON inyectado desde "Variables" intent',
        color: '#22c55e',
      },
      code: {
        syntaxHighlighting: {
          purple: '#c4b5fd', // intent property
          green: '#86efac', // title, subtitle
          cyan: '#67e8f9', // theme values
          yellow: '#fde68a', // cta
        },
      },
    },
    intentLibrary: {
      width: 420,
      search: 'Buscar intents...',
      categories: [
        {
          name: 'Introducción',
          icon: 'circle-play',
          color: '#22c55e',
          intents: [
            { name: 'Variables', selected: true, gradient: true },
            { name: 'Concepto', icon: 'book-open', color: '#f97316' },
          ],
        },
        {
          name: 'Práctica',
          icon: 'dumbbell',
          color: '#3b82f6',
          intents: [
            { name: 'Quiz', icon: 'list-checks', color: '#3b82f6' },
            { name: 'Code Block', icon: 'code', color: '#22c55e' },
          ],
        },
        {
          name: 'Feedback',
          icon: 'message-circle',
          color: '#f59e0b',
          intents: [
            { name: 'Success', icon: 'trophy', color: '#f59e0b' },
            { name: 'Retry', icon: 'rotate-ccw', color: '#ef4444' },
          ],
        },
      ],
      preview: {
        title: 'Introduction to Variables',
        subtitle: 'Learn how to store data in your programs',
        cta: 'Start Learning →',
        useBtn: 'Usar intent',
      },
    },
  },
};

// =============================================================================
// FRAME 5: JSON ERROR
// =============================================================================

export const frame5JsonError = {
  id: 'Nbceq',
  name: '5. Estado - JSON Error',
  description: 'Estado del editor mostrando error de sintaxis JSON',
  size: { width: 1440, height: 900 },
  components: {
    header: {
      saveStatus: {
        icon: 'triangle-alert',
        text: 'Error',
        color: '#ef4444',
        fill: '#ef444420',
      },
    },
    editorPanel: {
      lineNumbers: {
        errorLine: 6,
        errorColor: '#ef4444',
      },
      codeArea: {
        errorLineHighlight: {
          fill: '#ef444415',
        },
      },
      errorPanel: {
        id: 'fD06a',
        height: 80,
        fill: '#ef444510',
        border: '1px solid #ef444430',
        padding: 12,
        gap: 8,
        children: {
          header: {
            icon: 'circle-x',
            iconColor: '#ef4444',
            title: 'Syntax Error',
            subtitle: 'Line 6',
          },
          description:
            "Unterminated string literal. Expected closing quote '\"' after 'illustration'.",
          actions: {
            fixBtn: {
              text: 'Quick Fix',
              icon: 'wand',
              fill: '#ef444420',
            },
            shortcut: {
              label: '⌘ + .',
            },
          },
        },
      },
    },
  },
};

// =============================================================================
// FRAME 7: ONBOARDING
// =============================================================================

export const frame7Onboarding = {
  id: 'Kpws4',
  name: '7. Estado - Onboarding',
  description: 'Tutorial inicial con spotlights y tooltips guiados',
  size: { width: 1440, height: 900 },
  components: {
    overlay: {
      id: 'PgDQG',
      fill: '#00000060',
      children: {
        spotlight: {
          id: 'NvK2Y',
          type: 'ellipse',
          size: { width: 320, height: 400 },
          position: { x: -20, y: 80 },
          fill: 'radial-gradient(transparent 60%, #000000 100%)',
        },
        tooltip: {
          id: 'X7iMs',
          width: 280,
          position: { x: 300, y: 160 },
          cornerRadius: 16,
          fill: '#1c1c28f8',
          backdropBlur: 20,
          border: '1px solid #8b5cf640',
          shadow: '0 8px 24px #8b5cf630',
          padding: 16,
          gap: 12,
          children: {
            header: {
              stepBadge: {
                content: '1',
                fill: '$--accent-violet',
                size: 24,
              },
              title: 'Explora los Intents',
            },
            description:
              'Aquí encontrarás todos los bloques de contenido disponibles, organizados por categoría. Haz clic en uno para insertarlo en tu lección.',
            actions: {
              progress: {
                dots: 4,
                activeDot: 0,
                dotSize: { active: 8, inactive: 6 },
              },
              skipBtn: 'Saltar',
              nextBtn: {
                text: 'Siguiente',
                icon: 'arrow-right',
                fill: '$--accent-violet',
                shadow: '0 2px 12px $--glow-violet',
              },
            },
          },
        },
        arrow: {
          id: 'b39uk',
          position: { x: 290, y: 180 },
          fill: '#1c1c28f8',
          border: '1px solid #8b5cf640',
        },
        welcomeBadge: {
          id: '3dzWp',
          position: { x: 600, y: 30 },
          cornerRadius: 30,
          fill: '#1c1c28e0',
          backdropBlur: 16,
          border: '1px solid #8b5cf630',
          padding: [10, 16],
          children: {
            icon: 'sparkles',
            iconColor: '$--accent-violet',
            text: '¡Bienvenido! Te guiaremos por tu primer micro-lección',
          },
        },
      },
    },
  },
};

// =============================================================================
// FRAME 8: EDITOR FOCUS
// =============================================================================

export const frame8EditorFocus = {
  id: 'T9ttZ',
  name: '8. Estado - Editor Focus',
  description: 'Modo focus del editor con features visuales avanzados',
  size: { width: 1440, height: 900 },
  components: {
    editorBody: {
      id: '6cEus',
      layout: 'none',
      fill: '$--bg-surface',
      features: {
        activeLine: {
          id: '5KMZF',
          height: 20,
          fill: '#8b5cf608',
          gutterFill: '#8b5cf610',
        },
        cursor: {
          id: 'D2thE',
          width: 2,
          height: 16,
          cornerRadius: 1,
          fill: '$--accent-violet',
          glow: '0 0 8px $--glow-violet',
        },
        selection: {
          id: 'JyClP',
          height: 16,
          cornerRadius: 2,
          fill: '#8b5cf630',
        },
        bracketMatch: {
          fill: '#06b6d420',
          border: '1px solid #06b6d450',
          cornerRadius: 2,
        },
        minimap: {
          id: '6tbS5',
          width: 60,
          fill: '#0a0a0f80',
          padding: 8,
          gap: 2,
          lines: [
            { width: 20, fill: '#ffffff15' },
            { width: 35, fill: '#06b6d430' },
            { width: 40, fill: '#a5d6ff20' },
            { width: 30, fill: '#a5d6ff20' },
            { width: 25, fill: '#06b6d430' },
            { width: 38, fill: '#a5d6ff20' },
          ],
          viewport: {
            width: 44,
            height: 30,
            fill: '#8b5cf615',
            border: '1px solid #8b5cf640',
          },
        },
      },
    },
  },
};

// =============================================================================
// FRAME 9: LOADING
// =============================================================================

export const frame9Loading = {
  id: '7WLAy',
  name: '9. Estado - Loading',
  description: 'Estado de carga con spinner y toast de sincronización',
  size: { width: 1440, height: 900 },
  components: {
    header: {
      saveStatus: {
        icon: 'loader',
        text: 'Guardando...',
        color: '$--accent-violet',
        fill: '#8b5cf620',
      },
    },
    previewPanel: {
      loadingOverlay: {
        id: 'YUiCH',
        cornerRadius: 24,
        fill: '#14141cf0',
        layout: 'none',
        children: {
          spinner: {
            id: 'V6lb5',
            position: { x: 140, y: 180 },
            ring: {
              size: 48,
              stroke: '#8b5cf630',
              thickness: 4,
            },
            arc: {
              stroke: '$--accent-violet',
              thickness: 4,
              cap: 'round',
              glow: '0 0 8px $--glow-violet',
            },
            text: 'Generando preview...',
            progressBar: {
              width: 120,
              height: 4,
              fill: '#ffffff10',
              cornerRadius: 2,
            },
          },
        },
      },
    },
    toast: {
      id: 'hiiwK',
      position: { x: 540, y: 820 },
      cornerRadius: 12,
      fill: '#1c1c28f0',
      backdropBlur: 16,
      border: '1px solid #8b5cf630',
      shadow: '0 8px 20px #00000040',
      padding: [12, 16],
      gap: 10,
      children: {
        icon: {
          id: '2qZod',
          size: 32,
          cornerRadius: 8,
          fill: '#8b5cf620',
          iconName: 'cloud',
          iconColor: '$--accent-violet',
        },
        content: {
          title: 'Sincronizando cambios',
          description: 'Tus cambios se guardarán automáticamente',
        },
      },
    },
  },
};

// =============================================================================
// FRAME 12: SELECCIONAR INTENT
// =============================================================================

export const frame12SeleccionarIntent = {
  id: '2QtA6',
  name: '12. Editor - Seleccionar Intent',
  description: 'Estado con library abierta y empty state en editor',
  size: { width: 1440, height: 900 },
  components: {
    sidebar: {
      id: 'Tk0RT',
      width: 240,
      structure: [
        {
          id: 'ZfgkE',
          icon: 'folder',
          iconColor: '#8b5cf6',
          name: 'Inicio',
          fill: '#8b5cf615',
        },
        {
          id: '3efvp',
          icon: 'plus',
          iconColor: '$--text-muted',
          name: 'Agregar intent...',
          fill: '#8b5cf615',
          border: '2px solid #8b5cf650',
          indent: true,
        },
        {
          id: 'MedOk',
          icon: 'folder',
          iconColor: '$--text-muted',
          name: 'Cierre',
        },
      ],
    },
    editorPanel: {
      id: 'kQdKR',
      header: {
        tab: {
          icon: 'braces',
          iconColor: '#8b5cf6',
          name: 'intro_1.json',
        },
        actions: {
          formatBtn: {
            icon: 'type',
            text: 'Format',
            fill: '#ffffff08',
          },
          newTab: {
            icon: 'file-plus',
            text: 'Nuevo archivo',
          },
        },
      },
      emptyState: {
        id: 'DH53p',
        icon: {
          name: 'braces',
          size: 36,
          containerSize: 80,
          containerFill: '#ffffff08',
          cornerRadius: 20,
        },
        title: 'Ningún intent seleccionado',
        description: ['Elegí un intent de la biblioteca para', 'inyectar el JSON automáticamente'],
        arrow: {
          text: 'Seleccioná de la biblioteca',
          icon: 'arrow-right',
          color: '#8b5cf6',
        },
      },
    },
    intentLibrary: {
      id: 'iQXNh',
      width: 420,
      fill: '#0a0a10',
      header: {
        icon: 'layout-grid',
        iconColor: '#8b5cf6',
        title: 'Intent Library',
        closeBtn: true,
      },
      search: {
        id: 'yb6TF',
        placeholder: 'Buscar intents...',
        icon: 'search',
        fill: '#ffffff08',
        cornerRadius: 8,
      },
      categories: [
        {
          name: 'Introducción',
          icon: 'circle-play',
          iconColor: '#22c55e',
          intents: [
            {
              id: 'tNd0b',
              name: 'Variables',
              selected: true,
              gradient: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            },
            {
              id: 'AzN4P',
              name: 'Concepto',
              icon: 'book-open',
              iconBg: '#f9731620',
            },
          ],
        },
        {
          name: 'Práctica',
          icon: 'dumbbell',
          iconColor: '#3b82f6',
          intents: [
            { id: 'k89bG', name: 'Quiz', icon: 'list-checks', iconBg: '#3b82f620' },
            { id: 'UOCMi', name: 'Code Block', icon: 'code', iconBg: '#22c55e20' },
          ],
        },
        {
          name: 'Feedback',
          icon: 'message-circle',
          iconColor: '#f59e0b',
          intents: [
            { id: 'x510w', name: 'Success', icon: 'trophy', iconBg: '#f59e0b20' },
            { id: 'RsKQF', name: 'Retry', icon: 'rotate-ccw', iconBg: '#ef444420' },
          ],
        },
      ],
      preview: {
        id: 'qgDMy',
        title: 'Vista previa',
        card: {
          id: 'JnIfo',
          cornerRadius: 16,
          fill: 'linear-gradient(135deg, #1a1a2e, #0f0f1a)',
          border: '1px solid #ffffff10',
          height: 160,
          padding: 20,
          children: {
            icon: {
              name: 'variable',
              size: 28,
              containerSize: 56,
              containerFill: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            },
            title: 'Introduction to Variables',
            subtitle: 'Learn how to store data in your programs',
            cta: {
              text: 'Start Learning →',
              fill: '#8b5cf6',
              cornerRadius: 8,
            },
          },
        },
        useBtn: {
          id: 'XQamk',
          icon: 'plus',
          text: 'Usar intent',
          fill: '#8b5cf6',
          cornerRadius: 8,
        },
      },
    },
  },
};

// =============================================================================
// EXPORT ALL FRAMES
// =============================================================================

export const allFrames = {
  frame1SelectorDeTipo,
  frame2aConfigMicroLeccion,
  frame2bConfigPlanificacion,
  frame3EditorPrincipal,
  frame4HoverTooltip,
  frame5JsonError,
  frame6KeyboardShortcuts,
  frame7Onboarding,
  frame8EditorFocus,
  frame9Loading,
  frame10VistaEstudiante,
  frame11EditorIntentSeleccionado,
  frame12SeleccionarIntent,
};

// Frame IDs for quick reference
export const frameIds = {
  selectorDeTipo: 'xJinG',
  configMicroLeccion: 'sfnml',
  configPlanificacion: 'v0Q2w',
  editorPrincipal: 'ualHD',
  hoverTooltip: '6FgJp',
  jsonError: 'Nbceq',
  keyboardShortcuts: 'SG17P',
  onboarding: 'Kpws4',
  editorFocus: 'T9ttZ',
  loading: '7WLAy',
  vistaEstudiante: 'W2jz5',
  intentSeleccionado: 'lg1nw',
  seleccionarIntent: '2QtA6',
} as const;
