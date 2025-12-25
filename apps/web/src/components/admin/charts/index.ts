/**
 * Admin Charts - Componentes de graficos reutilizables
 *
 * Todos usan Recharts con CSS variables para theming.
 */

// Chart Components
export { AdminBarChart } from './AdminBarChart';
export { AdminPieChart } from './AdminPieChart';
export { AdminLineChart } from './AdminLineChart';
export { AdminAreaChart } from './AdminAreaChart';
export { ChartContainer } from './ChartContainer';
export {
  CustomTooltip,
  TOOLTIP_STYLE,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_ITEM_STYLE,
} from './ChartTooltip';

// Colors & Utils
export {
  CHART_COLORS,
  CHART_COLOR_PALETTE,
  CHART_GRID_COLOR,
  CHART_TEXT_COLOR,
} from './chart-colors';
export type { ChartColorKey } from './chart-colors';
