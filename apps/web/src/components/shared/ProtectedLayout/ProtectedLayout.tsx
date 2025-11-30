/**
 * ProtectedLayout - Componente de autenticación centralizado
 *
 * ARQUITECTURA:
 * Este componente centraliza TODA la lógica de autenticación y autorización
 * que antes estaba duplicada en admin/layout.tsx, docente/layout.tsx, etc.
 *
 * FLUJO DE DECISIÓN:
 * 1. Si hay usuario en store → verificar rol inmediatamente
 * 2. Si no hay usuario → llamar checkAuth() para validar cookie httpOnly
 * 3. Si checkAuth falla → redirigir a login
 * 4. Si rol no coincide → redirigir al dashboard del rol correcto
 * 5. Si todo OK → renderizar children
 *
 * SEGURIDAD:
 * - NO almacena tokens en localStorage (vulnerabilidad XSS)
 * - Usa httpOnly cookies manejadas por el backend
 * - Valida roles en cliente Y servidor (defense in depth)
 *
 * DECISIONES DE DISEÑO:
 * - useRef para evitar múltiples validaciones (StrictMode, re-renders)
 * - Estado separado para status vs redirectTo para mejor control de flujo
 * - Callbacks opcionales para extensibilidad sin acoplar lógica
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, type UserRole } from '@/store/auth.store';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import type {
  ProtectedLayoutProps,
  ProtectedLayoutState,
  UnauthorizedReason,
  AuthenticatedUser,
} from './types';
import { ROLE_MAP, DEFAULT_ROLE_REDIRECTS } from './types';

/**
 * ProtectedLayout - Guard de autenticación para rutas protegidas
 *
 * @example
 * // Uso básico - solo admins
 * <ProtectedLayout allowedRoles={['ADMIN']}>
 *   <AdminContent />
 * </ProtectedLayout>
 *
 * @example
 * // Múltiples roles permitidos
 * <ProtectedLayout allowedRoles={['ADMIN', 'DOCENTE']}>
 *   <SharedContent />
 * </ProtectedLayout>
 *
 * @example
 * // Con callbacks y loading personalizado
 * <ProtectedLayout
 *   allowedRoles={['ESTUDIANTE']}
 *   loadingComponent={<CustomSpinner />}
 *   onAuthenticated={(user) => analytics.identify(user.id)}
 *   onUnauthorized={(reason) => logger.warn('Unauthorized', reason)}
 * >
 *   <StudentDashboard />
 * </ProtectedLayout>
 */
export function ProtectedLayout({
  allowedRoles,
  children,
  fallbackUrl = '/login',
  unauthorizedUrl,
  loadingComponent,
  onUnauthorized,
  onAuthenticated,
  allowPartialAccess = false,
}: ProtectedLayoutProps) {
  const router = useRouter();
  const { user, checkAuth, selectedRole } = useAuthStore();

  // Ref para evitar múltiples validaciones (StrictMode, fast refresh, etc.)
  const hasValidatedRef = useRef(false);

  // Ref para el estado actual (evita stale closures en callbacks)
  const stateRef = useRef<ProtectedLayoutState>({
    status: 'loading',
    redirectTo: null,
  });

  /**
   * Convierte roles públicos (ADMIN) a internos (admin).
   * Filtra roles inválidos para robustez.
   */
  const normalizedAllowedRoles: UserRole[] = allowedRoles
    .map((role) => ROLE_MAP[role])
    .filter((role): role is UserRole => role !== undefined);

  /**
   * Determina el rol activo del usuario.
   * Prioridad: selectedRole (multi-rol) > user.role (rol principal)
   */
  const getActiveRole = useCallback(
    (currentUser: typeof user, currentSelectedRole: UserRole | null): UserRole | null => {
      return currentSelectedRole ?? currentUser?.role ?? null;
    },
    [],
  );

  /**
   * Verifica si un rol está permitido.
   */
  const isRoleAllowed = useCallback(
    (role: UserRole | null): boolean => {
      if (!role) return false;
      return normalizedAllowedRoles.includes(role);
    },
    [normalizedAllowedRoles],
  );

  /**
   * Determina la URL de redirección para un usuario no autorizado.
   */
  const getUnauthorizedRedirect = useCallback(
    (activeRole: UserRole | null): string => {
      // Si se especificó una URL de unauthorized, usarla
      if (unauthorizedUrl) return unauthorizedUrl;

      // Si no hay rol activo, ir a login
      if (!activeRole) return fallbackUrl;

      // Redirigir al dashboard del rol del usuario
      return DEFAULT_ROLE_REDIRECTS[activeRole] ?? '/dashboard';
    },
    [unauthorizedUrl, fallbackUrl],
  );

  /**
   * Notifica que el usuario no está autorizado.
   */
  const notifyUnauthorized = useCallback(
    (reason: UnauthorizedReason) => {
      if (onUnauthorized) {
        try {
          onUnauthorized(reason);
        } catch (e) {
          // No propagar errores de callbacks de usuario
          console.error('[ProtectedLayout] Error in onUnauthorized callback:', e);
        }
      }
    },
    [onUnauthorized],
  );

  /**
   * Notifica que el usuario está autenticado.
   */
  const notifyAuthenticated = useCallback(
    (currentUser: NonNullable<typeof user>, activeRole: UserRole) => {
      if (onAuthenticated) {
        try {
          const authUser: AuthenticatedUser = {
            id: currentUser.id,
            email: currentUser.email,
            nombre: currentUser.nombre,
            apellido: currentUser.apellido,
            role: currentUser.role,
            activeRole,
          };
          onAuthenticated(authUser);
        } catch (e) {
          // No propagar errores de callbacks de usuario
          console.error('[ProtectedLayout] Error in onAuthenticated callback:', e);
        }
      }
    },
    [onAuthenticated],
  );

  /**
   * Lógica principal de validación de autenticación.
   * Se ejecuta UNA sola vez gracias a hasValidatedRef.
   */
  useEffect(() => {
    // Evitar múltiples ejecuciones
    if (hasValidatedRef.current) {
      return;
    }

    const validateAuth = async () => {
      hasValidatedRef.current = true;

      // ═══════════════════════════════════════════════════════════════════════
      // CASO 1: Usuario ya existe en el store
      // ═══════════════════════════════════════════════════════════════════════
      if (user) {
        const activeRole = getActiveRole(user, selectedRole);

        if (isRoleAllowed(activeRole)) {
          // Usuario autenticado y autorizado
          stateRef.current = { status: 'authenticated', redirectTo: null };
          notifyAuthenticated(user, activeRole as UserRole);
          return;
        }

        // Usuario autenticado pero NO autorizado para este rol
        const redirectTo = getUnauthorizedRedirect(activeRole);
        stateRef.current = { status: 'unauthorized', redirectTo };
        notifyUnauthorized({
          type: 'WRONG_ROLE',
          currentRole: activeRole as UserRole,
          requiredRoles: normalizedAllowedRoles,
        });
        router.replace(redirectTo);
        return;
      }

      // ═══════════════════════════════════════════════════════════════════════
      // CASO 2: No hay usuario, verificar con backend (cookie httpOnly)
      // ═══════════════════════════════════════════════════════════════════════
      try {
        await checkAuth();

        // Obtener estado actualizado del store después de checkAuth
        const currentState = useAuthStore.getState();
        const currentUser = currentState.user;
        const currentSelectedRole = currentState.selectedRole;

        if (!currentUser) {
          // No hay sesión válida
          stateRef.current = { status: 'unauthenticated', redirectTo: fallbackUrl };
          notifyUnauthorized({ type: 'NOT_AUTHENTICATED' });
          router.replace(fallbackUrl);
          return;
        }

        const activeRole = getActiveRole(currentUser, currentSelectedRole);

        if (isRoleAllowed(activeRole)) {
          // Usuario autenticado y autorizado
          stateRef.current = { status: 'authenticated', redirectTo: null };
          notifyAuthenticated(currentUser, activeRole as UserRole);
          return;
        }

        // Usuario autenticado pero NO autorizado
        const redirectTo = getUnauthorizedRedirect(activeRole);
        stateRef.current = { status: 'unauthorized', redirectTo };
        notifyUnauthorized({
          type: 'WRONG_ROLE',
          currentRole: activeRole as UserRole,
          requiredRoles: normalizedAllowedRoles,
        });
        router.replace(redirectTo);
      } catch (error) {
        // Error en checkAuth (red, servidor, etc.)
        stateRef.current = { status: 'unauthenticated', redirectTo: fallbackUrl };
        notifyUnauthorized({ type: 'AUTH_ERROR', error });
        router.replace(fallbackUrl);
      }
    };

    validateAuth();
    // Dependencias estables - los callbacks usan useCallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  // Durante la validación, mostrar loading o nada
  // NOTA: No usamos useState para status porque causaría re-renders innecesarios
  // En cambio, confiamos en que el useEffect redirigirá si es necesario

  // Determinar si debemos mostrar contenido
  const activeRole = getActiveRole(user, selectedRole);
  const isAuthorized = user !== null && isRoleAllowed(activeRole);

  // Si está autorizado, mostrar children
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Si allowPartialAccess está habilitado, mostrar children durante loading
  if (allowPartialAccess && user !== null) {
    return <>{children}</>;
  }

  // Mostrar loading mientras se valida
  if (loadingComponent) {
    return <>{loadingComponent}</>;
  }

  // Loading por defecto - usa el componente unificado
  return (
    <LoadingScreen
      variant="default"
      message="Verificando acceso..."
      subMessage="Un momento por favor"
    />
  );
}

export default ProtectedLayout;
