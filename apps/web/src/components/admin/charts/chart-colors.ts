/**
 * Chart Colors - Colores consistentes para graficos admin
 *
 * Usa CSS variables para theming.
 */

export const CHART_COLORS = {
  primary: 'var(--admin-accent)',
  secondary: 'var(--admin-accent-secondary)',
  info: 'var(--status-info)',
  warning: 'var(--status-warning)',
  danger: 'var(--status-danger)',
  success: 'var(--status-success)',
  muted: 'var(--admin-text-muted)',
} as const;

export const CHART_COLOR_PALETTE = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.info,
  CHART_COLORS.warning,
  CHART_COLORS.success,
  CHART_COLORS.danger,
];

export const CHART_GRID_COLOR = 'var(--admin-border)';
export const CHART_TEXT_COLOR = 'var(--admin-text-muted)';

export type ChartColorKey = keyof typeof CHART_COLORS;
