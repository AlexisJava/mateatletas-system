/**
 * 🎨 SISTEMA DE BREAKPOINTS LANDSCAPE-ONLY
 *
 * Definición de tamaños de pantalla optimizados para orientación horizontal
 * El portal estudiante SOLO funciona en landscape
 */

export const BREAKPOINTS = {
  // Mobile landscape (teléfonos horizontales)
  xs: {
    min: 480,
    max: 667,
    name: 'Mobile Landscape',
    description: 'iPhone SE, iPhone 13 Mini horizontal',
  },

  // Tablet landscape (tablets horizontales)
  md: {
    min: 768,
    max: 1024,
    name: 'Tablet Landscape',
    description: 'iPad, iPad Pro 11" horizontal',
  },

  // Desktop y laptops
  lg: {
    min: 1280,
    max: 1920,
    name: 'Desktop',
    description: 'Laptops, monitores 1080p/1440p',
  },

  // Pantallas ultra-wide
  xl: {
    min: 1920,
    max: Infinity,
    name: 'Ultra-Wide',
    description: 'Monitores 4K, ultra-wide',
  },
} as const;

/**
 * Ratios de aspecto objetivo por tipo de dispositivo
 */
export const ASPECT_RATIOS = {
  mobile: '16:9', // iPhone landscape, Android landscape
  tablet: '4:3', // iPad landscape
  desktop: '16:10', // Laptops estándar
  ultrawide: '21:9', // Monitores ultra-wide
} as const;

/**
 * Alturas de viewport para cada sección del layout
 */
export const LAYOUT_HEIGHTS = {
  mobile: {
    header: '8vh',
    main: '84vh',
    bottomNav: '8vh',
  },
  tablet: {
    header: '10vh',
    main: '80vh',
    bottomNav: '10vh',
  },
  desktop: {
    header: '10vh',
    main: '90vh',
    bottomNav: '0vh', // Sin bottom nav en desktop
  },
} as const;

/**
 * Máximos anchos por tipo de contenido
 */
export const MAX_WIDTHS = {
  avatarSection: '500px',
  infoSection: '600px',
  dashboardCard: '350px',
  modalContent: '800px',
  fullContent: '1400px',
} as const;

/**
 * Sistema de espaciado fluido por breakpoint
 */
export const SPACING = {
  mobile: {
    px: '3', // padding horizontal
    py: '2', // padding vertical
    gap: '2', // gap entre elementos
  },
  tablet: {
    px: '6',
    py: '4',
    gap: '4',
  },
  desktop: {
    px: '8',
    py: '6',
    gap: '6',
  },
} as const;

/**
 * Helper para generar clases de Tailwind responsivas
 */
export function responsiveClasses(config: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}): string {
  const classes: string[] = [];

  if (config.mobile) classes.push(`mobile-l:${config.mobile}`);
  if (config.tablet) classes.push(`tablet-l:${config.tablet}`);
  if (config.desktop) classes.push(`lg:${config.desktop}`);

  return classes.join(' ');
}

/**
 * Tipos de TypeScript para breakpoints
 */
export type BreakpointKey = keyof typeof BREAKPOINTS;
export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'ultrawide';
