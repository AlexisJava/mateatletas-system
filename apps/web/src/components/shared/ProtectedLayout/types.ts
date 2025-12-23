/**
 * types.ts - Tipos para ProtectedLayout
 *
 * Centraliza los tipos de autenticación y autorización para el sistema de layouts protegidos.
 */

import type { ReactNode } from 'react';
import type { UserRole } from '@/store/auth.store';

/**
 * Roles del sistema expresados en mayúsculas para consistencia con la API.
 * Internamente el store usa minúsculas, este tipo es para la interfaz pública.
 */
export type AllowedRole = 'ADMIN' | 'DOCENTE' | 'TUTOR' | 'ESTUDIANTE';

/**
 * Mapeo entre roles públicos (mayúsculas) y roles internos (minúsculas).
 * Esto permite que la API del componente sea más expresiva mientras
 * mantiene compatibilidad con el authStore existente.
 */
export const ROLE_MAP: Record<AllowedRole, UserRole> = {
  ADMIN: 'admin',
  DOCENTE: 'docente',
  TUTOR: 'tutor',
  ESTUDIANTE: 'estudiante',
} as const;

/**
 * Rutas de redirección por defecto según el rol del usuario.
 * Cuando un usuario autenticado intenta acceder a una ruta no autorizada,
 * se le redirige a su dashboard correspondiente.
 */
export const DEFAULT_ROLE_REDIRECTS: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  docente: '/docente/dashboard',
  tutor: '/dashboard',
  estudiante: '/estudiante',
} as const;

/**
 * Props del componente ProtectedLayout.
 */
export interface ProtectedLayoutProps {
  /**
   * Roles permitidos para acceder a esta ruta.
   * El usuario debe tener AL MENOS UNO de estos roles.
   * Se usa selectedRole si existe, sino user.role.
   *
   * @example allowedRoles={['ADMIN']}
   * @example allowedRoles={['ADMIN', 'DOCENTE']}
   */
  allowedRoles: AllowedRole[];

  /**
   * Contenido a renderizar si el usuario está autorizado.
   */
  children: ReactNode;

  /**
   * URL a la que redirigir si el usuario NO está autenticado.
   * @default '/login'
   */
  fallbackUrl?: string;

  /**
   * URL a la que redirigir si el usuario está autenticado pero NO autorizado.
   * Si no se especifica, se usa DEFAULT_ROLE_REDIRECTS según el rol del usuario.
   * @default undefined (usa redirect automático por rol)
   */
  unauthorizedUrl?: string;

  /**
   * Componente personalizado a mostrar durante la validación de auth.
   * Si no se especifica, se usa el LoadingScreen por defecto.
   * @default undefined (usa LoadingScreen interno)
   */
  loadingComponent?: ReactNode;

  /**
   * Callback opcional que se ejecuta cuando el usuario NO está autorizado.
   * Útil para logging, analytics, o lógica adicional antes de redirigir.
   */
  onUnauthorized?: (reason: UnauthorizedReason) => void;

  /**
   * Callback opcional que se ejecuta cuando la autenticación es exitosa.
   * Útil para tracking o inicialización de datos específicos del rol.
   */
  onAuthenticated?: (user: AuthenticatedUser) => void;

  /**
   * Si true, permite acceso incluso durante la validación inicial.
   * CUIDADO: Solo usar en casos donde mostrar contenido parcial es aceptable.
   * @default false
   */
  allowPartialAccess?: boolean;
}

/**
 * Razón por la cual el usuario no está autorizado.
 * Útil para el callback onUnauthorized.
 */
export type UnauthorizedReason =
  | { type: 'NOT_AUTHENTICATED' }
  | { type: 'WRONG_ROLE'; currentRole: UserRole; requiredRoles: UserRole[] }
  | { type: 'AUTH_ERROR'; error: unknown };

/**
 * Información del usuario autenticado para el callback onAuthenticated.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: UserRole;
  activeRole: UserRole; // Rol efectivo (selectedRole o role)
}

/**
 * Estado interno del componente ProtectedLayout.
 */
export interface ProtectedLayoutState {
  status: 'loading' | 'authenticated' | 'unauthorized' | 'unauthenticated';
  redirectTo: string | null;
}
