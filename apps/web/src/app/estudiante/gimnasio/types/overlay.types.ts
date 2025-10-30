/**
 * Sistema de tipos para Overlay Stack Navigation
 * Arquitectura de navegación apilada tipo iOS/Android
 */

/**
 * Temas disponibles para planificaciones del Mes de la Ciencia
 */
export type PlanificacionTema =
  | 'astronomia'
  | 'fisica'
  | 'quimica'
  | 'informatica'
  | 'nivel-1'
  | 'nivel-2'
  | 'nivel-3';

/**
 * Configuración de overlay con datos específicos según tipo
 * Union type discriminado por 'type' para type safety completo
 */
export type OverlayConfig =
  | { type: 'mi-grupo' }
  | { type: 'mis-logros' }
  | { type: 'entrenamientos' }
  | { type: 'planificacion'; codigo: string; tema: PlanificacionTema }
  | { type: 'actividad'; semanaId: string } // Grid 2×2 de las 4 actividades de una semana
  | { type: 'laboratorio-ecosistema'; semanaId: string } // Ecosistema LearnDash para Laboratorio Mágico
  | { type: 'ejecutar-actividad'; actividadId: string; semanaId: string } // Ejecución individual
  | { type: 'mis-cursos' }
  | { type: 'mi-progreso' }
  | { type: 'tienda' }
  | { type: 'notificaciones' }
  | { type: 'ajustes' };

/**
 * Tipo de renderizado del overlay
 */
export type OverlayRenderType = 'modal' | 'sidebar' | 'fullscreen';

/**
 * Metadatos de configuración visual para cada tipo de overlay
 */
export interface OverlayMetadata {
  gradient: string;
  renderType: OverlayRenderType;
}

/**
 * Props que reciben los componentes de overlay
 */
export interface OverlayComponentProps {
  estudiante: {
    nombre: string;
    apellido?: string;
    nivel_actual?: number;
    puntos_totales?: number;
    avatar_url?: string | null;
    id?: string;
  };
  config?: OverlayConfig;
}

/**
 * Transformaciones visuales según profundidad en el stack
 */
export interface DepthTransform {
  scale: number;
  blur: number; // px
  brightness: number; // 0-1
  zIndex: number;
  opacity: number;
}

/**
 * Context del Overlay Stack
 */
export interface OverlayStackContextType {
  /** Stack actual de overlays (el último es el que está arriba) */
  stack: OverlayConfig[];

  /** Agregar overlay al stack (push navigation) */
  push: (config: OverlayConfig) => void;

  /** Remover overlay del top del stack (back navigation) */
  pop: () => void;

  /** Reemplazar overlay top sin animación de back */
  replace: (config: OverlayConfig) => void;

  /** Limpiar todo el stack (volver a HubView) */
  clear: () => void;

  /** Si hay overlays en el stack para hacer pop */
  canGoBack: boolean;

  /** Overlay actual en el top (null si stack vacío) */
  currentOverlay: OverlayConfig | null;

  /** Profundidad actual del stack */
  depth: number;
}

/**
 * Props para OverlayRenderer
 */
export interface OverlayRendererProps {
  config: OverlayConfig;
  depth: number;
  isTop: boolean;
  onBackdropClick: () => void;
}

/**
 * Animación variants para Framer Motion
 */
export interface OverlayAnimationVariants {
  initial: {
    x: string;
    opacity: number;
  };
  animate: {
    x: number;
    opacity: number;
    scale?: number;
    filter?: string;
  };
  exit: {
    x: string;
    opacity: number;
  };
}

/**
 * Configuración de animación según dirección
 */
export type AnimationDirection = 'push' | 'pop' | 'replace';

/**
 * Helper type: Extraer tipo específico de OverlayConfig
 */
export type ExtractOverlayType<T extends OverlayConfig['type']> = Extract<
  OverlayConfig,
  { type: T }
>;

/**
 * Helper type: Verificar si overlay requiere datos adicionales
 */
export type OverlayRequiresData<T extends OverlayConfig['type']> = ExtractOverlayType<T> extends {
  type: T;
}
  ? keyof Omit<ExtractOverlayType<T>, 'type'> extends never
    ? false
    : true
  : false;
