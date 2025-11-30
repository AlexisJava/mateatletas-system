/**
 * types.ts - Tipos para LoadingScreen unificado
 *
 * Define las variantes visuales y props del componente de carga.
 */

/**
 * Variantes visuales disponibles.
 * Cada una tiene su propio estilo según el contexto de uso.
 */
export type LoadingVariant = 'admin' | 'docente' | 'tutor' | 'estudiante' | 'default';

/**
 * Props del componente LoadingScreen.
 */
export interface LoadingScreenProps {
  /**
   * Variante visual del loading.
   * - admin: Glassmorphism oscuro con violeta/azul
   * - docente: Elegante con soporte light/dark mode
   * - tutor: Minimalista con gradientes cálidos
   * - estudiante: Futurista espacial con estrellas y agujero negro
   * - default: Neutro para uso general
   * @default 'default'
   */
  variant?: LoadingVariant;

  /**
   * Mensaje principal a mostrar.
   * @default Varía según la variante
   */
  message?: string;

  /**
   * Mensaje secundario (subtítulo).
   * @default undefined
   */
  subMessage?: string;

  /**
   * Si true, ocupa toda la pantalla (min-h-screen).
   * @default true
   */
  fullScreen?: boolean;

  /**
   * Si true, muestra animaciones adicionales de fondo.
   * La variante 'estudiante' siempre las tiene.
   * @default true
   */
  showBackgroundEffects?: boolean;
}

/**
 * Configuración de colores por variante.
 */
export interface VariantConfig {
  /** Clases del contenedor principal */
  container: string;
  /** Clases del spinner/indicador */
  spinner: string;
  /** Clases del texto principal */
  text: string;
  /** Clases del texto secundario */
  subText: string;
  /** Clases del card/contenedor del contenido */
  card: string;
  /** Mensaje por defecto */
  defaultMessage: string;
}

/**
 * Configuración de cada variante.
 */
export const VARIANT_CONFIGS: Record<LoadingVariant, VariantConfig> = {
  admin: {
    container: 'bg-gradient-to-br from-slate-950 via-slate-900 to-black',
    spinner:
      'w-20 h-20 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin',
    text: 'text-lg font-bold text-white',
    subText: 'text-sm text-white/50 mt-2',
    card: 'backdrop-blur-xl bg-white/5 p-12 rounded-3xl shadow-2xl border border-white/10',
    defaultMessage: 'Cargando Mateatletas OS...',
  },
  docente: {
    container:
      'bg-gradient-to-br from-indigo-50 via-purple-50/60 to-pink-50/50 dark:from-[#0f0a1f] dark:via-indigo-950 dark:to-indigo-900',
    spinner:
      'w-16 h-16 border-4 border-purple-100 dark:border-purple-900/50 border-t-purple-600 rounded-full animate-spin',
    text: 'text-sm font-semibold text-indigo-900 dark:text-purple-100',
    subText: 'text-xs text-purple-600 dark:text-purple-300 mt-2',
    card: 'backdrop-blur-xl bg-white/65 dark:bg-indigo-950/60 p-12 rounded-3xl shadow-2xl shadow-purple-200/20 dark:shadow-purple-900/30 border border-purple-200/30 dark:border-purple-700/30',
    defaultMessage: 'Cargando Portal Docente...',
  },
  tutor: {
    container: 'bg-gradient-to-br from-[#ff6b35] via-[#f7b801] to-[#00d9ff]',
    spinner: 'h-16 w-16 border-b-4 border-white rounded-full animate-spin',
    text: 'text-lg font-semibold text-white',
    subText: 'text-sm text-white/80 mt-2',
    card: '',
    defaultMessage: 'Verificando autenticación...',
  },
  estudiante: {
    container: 'bg-black',
    spinner: '', // El estudiante tiene su propia animación especial
    text: 'text-cyan-300 text-xl md:text-2xl font-mono tracking-wider',
    subText: '',
    card: '',
    defaultMessage: '[ INICIANDO SISTEMA CUÁNTICO ]',
  },
  default: {
    container: 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800',
    spinner:
      'w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin',
    text: 'text-base font-medium text-gray-800 dark:text-gray-200',
    subText: 'text-sm text-gray-500 dark:text-gray-400 mt-2',
    card: 'bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl',
    defaultMessage: 'Cargando...',
  },
};
