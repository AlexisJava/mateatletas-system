/**
 * Admin Components - Exports centralizados
 *
 * Componentes del dashboard administrativo de Mateatletas.
 */

export { Header } from './Header';
export { AdminSidebar } from './AdminSidebar';

// Views - importar directamente desde carpetas específicas
// Ejemplo: import { DashboardView } from '@/components/admin/views/dashboard'

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
