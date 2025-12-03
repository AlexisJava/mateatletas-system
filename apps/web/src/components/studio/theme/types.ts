/**
 * Sistema de Theming para Studio
 *
 * Permite que los 95 componentes educativos sean agnósticos de estética,
 * adaptándose a diferentes Casas (QUANTUM, VERTEX, PULSAR) y contextos.
 */

/** Casas del sistema educativo por rango de edad */
export type CasaType = 'QUANTUM' | 'VERTEX' | 'PULSAR';

/** Modo de renderizado del bloque */
export type BloqueModo = 'preview' | 'estudiante' | 'editor';

/** Intensidad de animaciones */
export type AnimationIntensity = 'subtle' | 'normal' | 'playful';

/** Tamaños de border-radius */
export type BorderRadius = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Paleta de colores del tema
 */
export interface ThemeColors {
  /** Color de acento primario (acciones principales) */
  primary: string;
  /** Color secundario (acciones secundarias) */
  secondary: string;
  /** Color de éxito (respuestas correctas) */
  success: string;
  /** Color de error (respuestas incorrectas) */
  error: string;
  /** Color de advertencia */
  warning: string;
  /** Superficies con niveles de profundidad */
  surface: {
    0: string;
    1: string;
    2: string;
    3: string;
  };
  /** Colores de texto */
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  /** Color de bordes */
  border: string;
}

/**
 * Gradientes del tema (clases Tailwind)
 */
export interface ThemeGradients {
  /** Gradiente primario para fondos y botones */
  primary: string;
  /** Gradiente de éxito */
  success: string;
  /** Gradiente de error */
  error: string;
  /** Gradiente de warning */
  warning: string;
}

/**
 * Configuración de tipografía
 */
export interface ThemeTypography {
  /** Clase de font-family para títulos/display */
  displayFont: string;
  /** Clase de font-family para cuerpo de texto */
  bodyFont: string;
  /** Si usa text-shadow para efecto 3D */
  useTextShadow: boolean;
  /** Si usa -webkit-text-stroke para bordes de texto */
  useTextStroke: boolean;
}

/**
 * Configuración de bordes
 */
export interface ThemeBorders {
  /** Tamaño del border-radius */
  radius: BorderRadius;
  /** Ancho de borde en pixels */
  width: number;
}

/**
 * Configuración de sombras
 */
export interface ThemeShadows {
  /** Si usa estilo Brawl Stars (sombras 3D exageradas) */
  useBrawlStyle: boolean;
  /** Sombra pequeña */
  sm: string;
  /** Sombra mediana */
  md: string;
  /** Sombra grande */
  lg: string;
}

/**
 * Configuración de animaciones
 */
export interface ThemeAnimations {
  /** Si usa framer-motion para animaciones */
  useFramerMotion: boolean;
  /** Intensidad de las animaciones */
  intensity: AnimationIntensity;
}

/**
 * Definición completa de un tema de Studio
 */
export interface StudioTheme {
  /** Nombre único del tema */
  name: string;
  /** Casa asociada (opcional, para temas específicos de edad) */
  casa?: CasaType;
  /** Descripción del tema */
  description: string;
  /** Paleta de colores */
  colors: ThemeColors;
  /** Gradientes (clases Tailwind) */
  gradients: ThemeGradients;
  /** Configuración de tipografía */
  typography: ThemeTypography;
  /** Configuración de bordes */
  borders: ThemeBorders;
  /** Configuración de sombras */
  shadows: ThemeShadows;
  /** Configuración de animaciones */
  animations: ThemeAnimations;
}

/**
 * Clases Tailwind pre-computadas para un tema
 * Facilita el uso en componentes sin lógica condicional
 */
export interface ThemeClasses {
  // Superficies
  surface0: string;
  surface1: string;
  surface2: string;
  surface3: string;

  // Texto
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Bordes
  border: string;
  borderRadius: string;

  // Botones
  buttonPrimary: string;
  buttonSecondary: string;
  buttonSuccess: string;
  buttonError: string;

  // Estados
  stateSuccess: string;
  stateError: string;
  stateWarning: string;

  // Efectos de texto (si el tema los usa)
  textEffect: string;
}

/**
 * Valor del contexto de tema
 */
export interface StudioThemeContextValue {
  /** Tema actual */
  theme: StudioTheme;
  /** Modo de renderizado actual */
  modo: BloqueModo;
  /** Clases pre-computadas para el tema */
  classes: ThemeClasses;
  /** Cambiar a un tema específico */
  setTheme: (theme: StudioTheme) => void;
  /** Cambiar tema por nombre */
  setThemeByName: (name: string) => void;
  /** Cambiar modo de renderizado */
  setModo: (modo: BloqueModo) => void;
}

/**
 * Props del StudioThemeProvider
 */
export interface StudioThemeProviderProps {
  /** Tema inicial */
  initialTheme?: StudioTheme;
  /** Modo inicial */
  initialModo?: BloqueModo;
  /** Nombre del tema inicial (alternativa a initialTheme) */
  themeName?: string;
  /** Contenido */
  children: React.ReactNode;
}
