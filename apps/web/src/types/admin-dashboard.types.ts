/**
 * Admin Dashboard Types - Tipos locales para el dashboard administrativo
 *
 * Este archivo contiene tipos específicos del frontend admin que no necesitan
 * estar en @mateatletas/contracts porque:
 * 1. Son conceptos de UI (navegación, tareas locales)
 * 2. Son agregaciones de múltiples entidades del backend
 * 3. No se comparten con el backend
 *
 * Para tipos compartidos, usar imports desde @mateatletas/contracts
 */

import type {
  Estudiante,
  Equipo,
  Producto,
  Clase,
  DashboardStats,
  InscripcionMensualConRelaciones,
} from '@mateatletas/contracts';

// =============================================================================
// ENUMS Y CONSTANTES
// =============================================================================

/**
 * Tiers STEAM 2026 - Sistema de suscripción
 * Debe coincidir con ConfiguracionPrecios en contracts
 */
export const TierSTEAM = {
  LIBROS: 'STEAM Libros',
  ASINCRONICO: 'STEAM Asincrónico',
  SINCRONICO: 'STEAM Sincrónico',
} as const;

export type TierSTEAM = (typeof TierSTEAM)[keyof typeof TierSTEAM];

/**
 * Vistas disponibles en el admin dashboard
 * Mapea a las rutas de Next.js App Router
 */
export const AdminView = {
  DASHBOARD: 'dashboard',
  FINANZAS: 'finanzas',
  ANALYTICS: 'analytics',
  PERSONAS: 'personas',
  // ASIGNACIONES eliminado en FASE 2 - integrado en PERSONAS con tabs
  // GRUPOS eliminado en FASE 3 - ClaseGrupos integrado en ProductoDetailPage (Club)
  PRODUCTOS: 'productos',
  SUSCRIPCIONES: 'suscripciones',
  CONTENIDOS: 'contenidos',
  SANDBOX: 'sandbox',
} as const;

export type AdminView = (typeof AdminView)[keyof typeof AdminView];

/**
 * Roles de usuario en el sistema
 */
export const UserRole = {
  ESTUDIANTE: 'estudiante',
  DOCENTE: 'docente',
  TUTOR: 'tutor',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// =============================================================================
// TIPOS DE PERSONA UNIFICADA
// =============================================================================

/**
 * Persona unificada para la vista admin
 * Abstrae las diferencias entre Estudiante, Docente, Tutor y Admin
 * para mostrarlos en una tabla/lista unificada
 */
export interface AdminPerson {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  createdAt: string;

  // Campos específicos según rol (opcionales)
  /** Solo estudiantes: Casa asignada */
  casa?: Equipo['nombre'];
  /** Solo estudiantes: Tier de suscripción */
  tier?: TierSTEAM;
  /** Solo estudiantes: Puntos acumulados */
  puntos?: number;
  /** Solo estudiantes: Edad */
  edad?: number;
  /** Solo estudiantes: Nivel escolar */
  nivelEscolar?: string;
  /** Solo estudiantes: Nombre del plan asignado directamente */
  planNombre?: string;
  /** Solo estudiantes: Estado de acceso (ACTIVO, BECA, SUSPENDIDO, VENCIDO) */
  estadoAcceso?: string;
  /** Solo estudiantes: Username para login */
  username?: string;
  /** Solo docentes: Cantidad de clases asignadas */
  clasesAsignadas?: number;
  /** Solo docentes: Título profesional */
  titulo?: string;
  /** Solo docentes: Teléfono */
  telefono?: string;
  /** Solo docentes: Casas asignadas (QUANTUM, VERTEX, PULSAR) */
  casasAsignadas?: Array<'QUANTUM' | 'VERTEX' | 'PULSAR'>;
  /** Solo docentes: Mundos asignados (MATEMATICA, PROGRAMACION, CIENCIAS) */
  mundosAsignados?: Array<'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS'>;
  /** Solo docentes: Tipo de asignación */
  tipoAsignacion?: 'CLASE_GRUPOS' | 'COMISIONES' | 'AMBOS';
  /** Solo tutores: Cantidad de estudiantes a cargo */
  estudiantesACargo?: number;
}

/**
 * Crea un AdminPerson desde un Estudiante
 */
export function fromEstudiante(estudiante: Estudiante, extra?: { tier?: TierSTEAM }): AdminPerson {
  return {
    id: estudiante.id,
    nombre: estudiante.nombre,
    apellido: estudiante.apellido,
    email: estudiante.email ?? '',
    role: UserRole.ESTUDIANTE,
    status: 'active',
    createdAt: estudiante.createdAt,
    casa: estudiante.equipo?.nombre,
    tier: extra?.tier,
    puntos: estudiante.puntos_totales,
  };
}

// =============================================================================
// TIPOS DE TAREAS (Solo frontend)
// =============================================================================

/**
 * Prioridad de tarea administrativa
 */
export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];

/**
 * Estado de tarea administrativa
 */
export const TaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

/**
 * Tarea administrativa del backoffice
 * Este concepto NO existe en el backend, es solo para UI
 */
export interface AdminTask {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assignee?: string;
  createdAt: string;
}

// =============================================================================
// TIPOS DE NAVEGACIÓN
// =============================================================================

/**
 * Item de navegación en el tab bar
 */
export interface AdminNavItem {
  view: AdminView;
  label: string;
  href: string;
  icon: string; // Nombre del icono de Lucide
  badge?: number;
}

/**
 * Configuración de navegación del admin
 */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    view: AdminView.DASHBOARD,
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: 'LayoutDashboard',
  },
  { view: AdminView.FINANZAS, label: 'Finanzas', href: '/admin/finanzas', icon: 'CreditCard' },
  { view: AdminView.ANALYTICS, label: 'Analytics', href: '/admin/analytics', icon: 'BarChart3' },
  { view: AdminView.PERSONAS, label: 'Personas', href: '/admin/personas', icon: 'Users' },
  // ASIGNACIONES eliminado - integrado en PERSONAS con tab "Asignaciones Docentes"
  // GRUPOS eliminado - ClaseGrupos integrado en ProductoDetailPage para tipo Club
  { view: AdminView.PRODUCTOS, label: 'Productos', href: '/admin/productos', icon: 'Package' },
  {
    view: AdminView.SUSCRIPCIONES,
    label: 'Suscripciones',
    href: '/admin/suscripciones',
    icon: 'Repeat',
  },
  { view: AdminView.CONTENIDOS, label: 'Contenidos', href: '/admin/contenidos', icon: 'BookOpen' },
  { view: AdminView.SANDBOX, label: 'Sandbox', href: '/admin/sandbox', icon: 'Code2' },
];

// =============================================================================
// RE-EXPORTS DE CONTRACTS (Para conveniencia)
// =============================================================================

export type {
  Estudiante,
  Equipo,
  Producto,
  Clase,
  DashboardStats,
  InscripcionMensualConRelaciones,
};
