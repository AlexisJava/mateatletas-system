/**
 * Admin Components - Exports centralizados
 *
 * Componentes del dashboard administrativo de Mateatletas.
 */

export { Header } from './Header';
export { TabNavigation } from './TabNavigation';

// Views
export { DashboardView, FinanceView, AnalyticsView, PersonasView, ProductosView } from './views';

// Charts
export {
  AdminBarChart,
  AdminPieChart,
  AdminLineChart,
  AdminAreaChart,
  ChartContainer,
  CustomTooltip,
  CHART_COLORS,
  CHART_COLOR_PALETTE,
} from './charts';
