import type { StudioTheme, ThemeClasses, BorderRadius } from './types';

/**
 * Mapeo de border-radius a clases Tailwind
 */
const radiusClasses: Record<BorderRadius, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
};

/**
 * Genera estilos de texto con efectos 3D (shadow + stroke)
 */
function getTextEffectStyle(theme: StudioTheme): React.CSSProperties {
  const styles: React.CSSProperties = {};

  if (theme.typography.useTextShadow) {
    styles.textShadow = '0 3px 0 rgba(0,0,0,0.4)';
  }

  if (theme.typography.useTextStroke) {
    styles.WebkitTextStroke = '1px black';
    styles.paintOrder = 'stroke fill';
  }

  return styles;
}

/**
 * Genera las clases CSS pre-computadas para un tema
 * Esto permite a los componentes usar clases directamente sin lógica condicional
 */
export function generateThemeClasses(theme: StudioTheme): ThemeClasses {
  const borderWidth = theme.borders.width;
  const borderRadiusClass = radiusClasses[theme.borders.radius];

  return {
    // Superficies (usando estilos inline porque son colores dinámicos)
    surface0: `bg-[${theme.colors.surface[0]}]`,
    surface1: `bg-[${theme.colors.surface[1]}]`,
    surface2: `bg-[${theme.colors.surface[2]}]`,
    surface3: `bg-[${theme.colors.surface[3]}]`,

    // Texto
    textPrimary: `text-[${theme.colors.text.primary}]`,
    textSecondary: `text-[${theme.colors.text.secondary}]`,
    textMuted: `text-[${theme.colors.text.muted}]`,

    // Bordes
    border: `border-[${borderWidth}px] border-[${theme.colors.border}]`,
    borderRadius: borderRadiusClass,

    // Botones
    buttonPrimary: [
      `bg-gradient-to-br ${theme.gradients.primary}`,
      `border-[${borderWidth}px] border-black`,
      borderRadiusClass,
      theme.shadows.md,
      'text-white font-bold',
      'transition-all',
      'hover:brightness-110',
      'active:brightness-90',
    ].join(' '),

    buttonSecondary: [
      `bg-[${theme.colors.surface[2]}]`,
      `border-[${borderWidth}px] border-[${theme.colors.border}]`,
      borderRadiusClass,
      theme.shadows.sm,
      `text-[${theme.colors.text.primary}]`,
      'transition-all',
      'hover:brightness-110',
    ].join(' '),

    buttonSuccess: [
      `bg-gradient-to-br ${theme.gradients.success}`,
      `border-[${borderWidth}px] border-black`,
      borderRadiusClass,
      theme.shadows.md,
      'text-white font-bold',
    ].join(' '),

    buttonError: [
      `bg-gradient-to-br ${theme.gradients.error}`,
      `border-[${borderWidth}px] border-black`,
      borderRadiusClass,
      theme.shadows.md,
      'text-white font-bold',
    ].join(' '),

    // Estados
    stateSuccess: [
      `bg-[${theme.colors.success}]/20`,
      `border-[${borderWidth}px] border-[${theme.colors.success}]`,
      borderRadiusClass,
      `text-[${theme.colors.success}]`,
    ].join(' '),

    stateError: [
      `bg-[${theme.colors.error}]/20`,
      `border-[${borderWidth}px] border-[${theme.colors.error}]`,
      borderRadiusClass,
      `text-[${theme.colors.error}]`,
    ].join(' '),

    stateWarning: [
      `bg-[${theme.colors.warning}]/20`,
      `border-[${borderWidth}px] border-[${theme.colors.warning}]`,
      borderRadiusClass,
      `text-[${theme.colors.warning}]`,
    ].join(' '),

    // Efectos de texto (clase vacía si no aplica, se usa con style)
    textEffect:
      theme.typography.useTextShadow || theme.typography.useTextStroke ? 'studio-text-effect' : '',
  };
}

/**
 * Retorna los estilos inline para efectos de texto 3D
 * Se usa en conjunto con textEffect class
 */
export function getTextEffectStyles(theme: StudioTheme): React.CSSProperties {
  return getTextEffectStyle(theme);
}

/**
 * Helper para generar clase de gradiente de fondo
 */
export function getGradientClass(
  theme: StudioTheme,
  variant: 'primary' | 'success' | 'error' | 'warning',
): string {
  return `bg-gradient-to-br ${theme.gradients[variant]}`;
}
