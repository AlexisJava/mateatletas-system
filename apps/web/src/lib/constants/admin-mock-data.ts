/**
 * Admin Dashboard Mock Data
 *
 * Datos de ejemplo para desarrollo y testing.
 * En producción, estos datos vendrán del backend.
 *
 * Basado en constants.ts del mockup AI Studio.
 */

import type {
  AdminTask,
  AdminPerson,
  TaskPriority,
  TaskStatus,
  UserRole,
} from '@/types/admin-dashboard.types';

// =============================================================================
// MOCK TASKS
// =============================================================================

export interface MockTask extends AdminTask {
  priority: TaskPriority;
  status: TaskStatus;
}

export const MOCK_TASKS: MockTask[] = [
  {
    id: '1',
    title: 'Revisar inscripciones pendientes',
    description: 'Hay 12 inscripciones sin confirmar pago',
    priority: 'high',
    status: 'pending',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Actualizar precios STEAM 2026',
    description: 'Revisar configuración de tiers',
    priority: 'medium',
    status: 'in_progress',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: 'Admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Generar reporte mensual',
    description: 'Exportar métricas de diciembre',
    priority: 'low',
    status: 'completed',
    dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Enviar recordatorios de pago',
    description: 'Notificar a estudiantes con pagos vencidos',
    priority: 'high',
    status: 'pending',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
];

// =============================================================================
// MOCK PEOPLE
// =============================================================================

export interface MockPerson extends AdminPerson {
  role: UserRole;
}

export const MOCK_PEOPLE: MockPerson[] = [
  {
    id: '1',
    nombre: 'María',
    apellido: 'González',
    email: 'maria.gonzalez@ejemplo.com',
    role: 'estudiante',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    casa: 'Quantum',
    tier: 'STEAM Sincrónico',
    puntos: 2450,
  },
  {
    id: '2',
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@ejemplo.com',
    role: 'estudiante',
    status: 'active',
    createdAt: '2024-02-20T14:30:00Z',
    casa: 'Vertex',
    tier: 'STEAM Asincrónico',
    puntos: 1820,
  },
  {
    id: '3',
    nombre: 'Ana',
    apellido: 'Rodríguez',
    email: 'ana.rodriguez@ejemplo.com',
    role: 'docente',
    status: 'active',
    createdAt: '2023-08-10T09:00:00Z',
    clasesAsignadas: 5,
  },
  {
    id: '4',
    nombre: 'Carlos',
    apellido: 'López',
    email: 'carlos.lopez@ejemplo.com',
    role: 'estudiante',
    status: 'inactive',
    createdAt: '2024-03-05T16:45:00Z',
    casa: 'Pulsar',
    tier: 'STEAM Libros',
    puntos: 980,
  },
  {
    id: '5',
    nombre: 'Laura',
    apellido: 'Martínez',
    email: 'laura.martinez@ejemplo.com',
    role: 'tutor',
    status: 'active',
    createdAt: '2024-01-10T11:20:00Z',
    estudiantesACargo: 3,
  },
  {
    id: '6',
    nombre: 'Diego',
    apellido: 'Fernández',
    email: 'diego.fernandez@ejemplo.com',
    role: 'estudiante',
    status: 'active',
    createdAt: '2024-04-12T08:15:00Z',
    casa: 'Quantum',
    tier: 'STEAM Sincrónico',
    puntos: 3100,
  },
  {
    id: '7',
    nombre: 'Sofía',
    apellido: 'García',
    email: 'sofia.garcia@ejemplo.com',
    role: 'docente',
    status: 'active',
    createdAt: '2023-06-20T13:00:00Z',
    clasesAsignadas: 8,
  },
  {
    id: '8',
    nombre: 'Pablo',
    apellido: 'Sánchez',
    email: 'pablo.sanchez@ejemplo.com',
    role: 'estudiante',
    status: 'active',
    createdAt: '2024-05-01T10:30:00Z',
    casa: 'Vertex',
    tier: 'STEAM Asincrónico',
    puntos: 1560,
  },
];

// =============================================================================
// MOCK TRANSACTIONS
// =============================================================================

export interface MockTransaction {
  id: string;
  studentName: string;
  tier: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  paymentMethod: 'mercadopago' | 'transfer' | 'cash';
}

export const MOCK_TRANSACTIONS: MockTransaction[] = [
  {
    id: 'TRX-001',
    studentName: 'María González',
    tier: 'STEAM Sincrónico',
    amount: 95000,
    status: 'completed',
    date: '2024-12-23T14:30:00Z',
    paymentMethod: 'mercadopago',
  },
  {
    id: 'TRX-002',
    studentName: 'Juan Pérez',
    tier: 'STEAM Asincrónico',
    amount: 65000,
    status: 'pending',
    date: '2024-12-22T10:15:00Z',
    paymentMethod: 'transfer',
  },
  {
    id: 'TRX-003',
    studentName: 'Carlos López',
    tier: 'STEAM Libros',
    amount: 40000,
    status: 'failed',
    date: '2024-12-21T16:45:00Z',
    paymentMethod: 'mercadopago',
  },
  {
    id: 'TRX-004',
    studentName: 'Diego Fernández',
    tier: 'STEAM Sincrónico',
    amount: 95000,
    status: 'completed',
    date: '2024-12-20T09:00:00Z',
    paymentMethod: 'cash',
  },
  {
    id: 'TRX-005',
    studentName: 'Pablo Sánchez',
    tier: 'STEAM Asincrónico',
    amount: 58500,
    status: 'completed',
    date: '2024-12-19T11:30:00Z',
    paymentMethod: 'mercadopago',
  },
];

// =============================================================================
// MOCK CHART DATA
// =============================================================================

export const MOCK_REVENUE_DATA = [
  { month: 'Jul', ingresos: 2400000, pendientes: 180000 },
  { month: 'Ago', ingresos: 2800000, pendientes: 220000 },
  { month: 'Sep', ingresos: 3200000, pendientes: 150000 },
  { month: 'Oct', ingresos: 2900000, pendientes: 280000 },
  { month: 'Nov', ingresos: 3500000, pendientes: 190000 },
  { month: 'Dic', ingresos: 4200000, pendientes: 320000 },
];

export const MOCK_TIER_DISTRIBUTION = [
  { name: 'STEAM Libros', value: 45, color: '#06b6d4' },
  { name: 'STEAM Asincrónico', value: 35, color: '#8b5cf6' },
  { name: 'STEAM Sincrónico', value: 20, color: '#f59e0b' },
];

export const MOCK_CASA_DISTRIBUTION = [
  { name: 'Quantum', value: 42, color: '#6366f1' },
  { name: 'Vertex', value: 38, color: '#22c55e' },
  { name: 'Pulsar', value: 35, color: '#ec4899' },
];

export const MOCK_RETENTION_DATA = [
  { month: 'Jul', nuevos: 45, activos: 180, bajas: 12 },
  { month: 'Ago', nuevos: 52, activos: 218, bajas: 8 },
  { month: 'Sep', nuevos: 38, activos: 248, bajas: 15 },
  { month: 'Oct', nuevos: 61, activos: 294, bajas: 10 },
  { month: 'Nov', nuevos: 48, activos: 332, bajas: 6 },
  { month: 'Dic', nuevos: 55, activos: 381, bajas: 9 },
];

// =============================================================================
// MOCK PRODUCTS
// =============================================================================

export interface MockProduct {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tier: 'STEAM Libros' | 'STEAM Asincrónico' | 'STEAM Sincrónico';
  activo: boolean;
  inscritos: number;
  createdAt: string;
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'prod-1',
    nombre: 'Colonia de Verano 2026 - Enero',
    descripcion: 'Programa STEAM completo para vacaciones de verano',
    precio: 95000,
    tier: 'STEAM Sincrónico',
    activo: true,
    inscritos: 45,
    createdAt: '2024-10-01T00:00:00Z',
  },
  {
    id: 'prod-2',
    nombre: 'Colonia de Verano 2026 - Febrero',
    descripcion: 'Programa STEAM completo para vacaciones de verano',
    precio: 95000,
    tier: 'STEAM Sincrónico',
    activo: true,
    inscritos: 32,
    createdAt: '2024-10-01T00:00:00Z',
  },
  {
    id: 'prod-3',
    nombre: 'Club de Matemáticas - Mensual',
    descripcion: 'Acceso a plataforma y ejercicios interactivos',
    precio: 40000,
    tier: 'STEAM Libros',
    activo: true,
    inscritos: 128,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'prod-4',
    nombre: 'Programación Junior - Asincrónico',
    descripcion: 'Curso de introducción a la programación con videos grabados',
    precio: 65000,
    tier: 'STEAM Asincrónico',
    activo: true,
    inscritos: 67,
    createdAt: '2024-03-01T00:00:00Z',
  },
  {
    id: 'prod-5',
    nombre: 'Ciencias Experimentales',
    descripcion: 'Experimentos y proyectos científicos en vivo',
    precio: 95000,
    tier: 'STEAM Sincrónico',
    activo: false,
    inscritos: 0,
    createdAt: '2024-06-01T00:00:00Z',
  },
];

// =============================================================================
// MOCK DASHBOARD STATS
// =============================================================================

export const MOCK_DASHBOARD_STATS = {
  totalEstudiantes: 381,
  estudiantesActivos: 352,
  inscripcionesActivas: 298,
  ingresosMes: 4200000,
  ingresosPendientes: 320000,
  tasaCobro: 92.9,
  crecimientoMensual: 12.5,
  distribucionCasas: {
    Quantum: 42,
    Vertex: 38,
    Pulsar: 35,
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return formatCurrency(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  return formatDate(dateString);
}

export function getTaskPriorityColor(priority: TaskPriority): string {
  const colors: Record<TaskPriority, string> = {
    high: 'text-[var(--status-danger)] bg-[var(--status-danger-muted)]',
    medium: 'text-[var(--status-warning)] bg-[var(--status-warning-muted)]',
    low: 'text-[var(--status-info)] bg-[var(--status-info-muted)]',
  };
  return colors[priority];
}

export function getTaskStatusColor(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    pending: 'text-[var(--admin-text-muted)] bg-[var(--admin-surface-2)]',
    in_progress: 'text-[var(--status-info)] bg-[var(--status-info-muted)]',
    completed: 'text-[var(--status-success)] bg-[var(--status-success-muted)]',
  };
  return colors[status];
}

export function getTransactionStatusColor(status: MockTransaction['status']): string {
  const colors: Record<MockTransaction['status'], string> = {
    completed: 'text-[var(--status-success)] bg-[var(--status-success-muted)]',
    pending: 'text-[var(--status-warning)] bg-[var(--status-warning-muted)]',
    failed: 'text-[var(--status-danger)] bg-[var(--status-danger-muted)]',
  };
  return colors[status];
}

export function getTierColor(tier: string): string {
  const colors: Record<string, string> = {
    'STEAM Libros': '#06b6d4',
    'STEAM Asincrónico': '#8b5cf6',
    'STEAM Sincrónico': '#f59e0b',
  };
  return colors[tier] || '#64748b';
}
