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
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, type UserRole } from '@/store/auth.store';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import type { ProtectedLayoutProps, UnauthorizedReason, AuthenticatedUser } from './types';
import { ROLE_MAP, DEFAULT_ROLE_REDIRECTS } from './types';

type AuthStatus = 'loading' | 'authenticated' | 'redirecting';

/**
 * ProtectedLayout - Guard de autenticación para rutas protegidas
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

  /**
   * Convierte roles públicos (ADMIN) a internos (admin).
   */
  const normalizedAllowedRoles: UserRole[] = allowedRoles
    .map((role) => ROLE_MAP[role])
    .filter((role): role is UserRole => role !== undefined);

  // Estado para controlar el render
  // Inicializar como 'authenticated' si ya hay usuario Y el rol es correcto
  const [status, setStatus] = useState<AuthStatus>(() => {
    if (!user) return 'loading';
    const activeRole = selectedRole ?? user.role ?? null;
    const isAllowed = activeRole ? normalizedAllowedRoles.includes(activeRole) : false;
    return isAllowed ? 'authenticated' : 'loading';
  });

  // Ref para evitar múltiples validaciones (StrictMode, fast refresh, etc.)
  const hasValidatedRef = useRef(false);

  /**
   * Determina el rol activo del usuario.
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
      if (unauthorizedUrl) return unauthorizedUrl;
      if (!activeRole) return fallbackUrl;
      return DEFAULT_ROLE_REDIRECTS[activeRole] ?? fallbackUrl;
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
          console.error('[ProtectedLayout] Error in onAuthenticated callback:', e);
        }
      }
    },
    [onAuthenticated],
  );

  /**
   * Lógica principal de validación de autenticación.
   */
  useEffect(() => {
    // Evitar múltiples ejecuciones
    if (hasValidatedRef.current) {
      return;
    }
    hasValidatedRef.current = true;

    const validateAuth = async () => {
      // CASO 1: Usuario ya existe en el store
      if (user) {
        const activeRole = getActiveRole(user, selectedRole);

        if (isRoleAllowed(activeRole)) {
          notifyAuthenticated(user, activeRole as UserRole);
          setStatus('authenticated');
          return;
        }

        // Usuario autenticado pero NO autorizado para este rol
        const redirectTo = getUnauthorizedRedirect(activeRole);
        notifyUnauthorized({
          type: 'WRONG_ROLE',
          currentRole: activeRole as UserRole,
          requiredRoles: normalizedAllowedRoles,
        });
        setStatus('redirecting');
        router.replace(redirectTo);
        return;
      }

      // CASO 2: No hay usuario, verificar con backend (cookie httpOnly)
      try {
        await checkAuth();

        // Obtener estado actualizado del store después de checkAuth
        const currentState = useAuthStore.getState();
        const currentUser = currentState.user;
        const currentSelectedRole = currentState.selectedRole;

        if (!currentUser) {
          // No hay sesión válida
          notifyUnauthorized({ type: 'NOT_AUTHENTICATED' });
          setStatus('redirecting');
          router.replace(fallbackUrl);
          return;
        }

        const activeRole = getActiveRole(currentUser, currentSelectedRole);

        if (isRoleAllowed(activeRole)) {
          notifyAuthenticated(currentUser, activeRole as UserRole);
          setStatus('authenticated');
          return;
        }

        // Usuario autenticado pero NO autorizado
        const redirectTo = getUnauthorizedRedirect(activeRole);
        notifyUnauthorized({
          type: 'WRONG_ROLE',
          currentRole: activeRole as UserRole,
          requiredRoles: normalizedAllowedRoles,
        });
        setStatus('redirecting');
        router.replace(redirectTo);
      } catch (error) {
        // Error en checkAuth (red, servidor, etc.)
        notifyUnauthorized({ type: 'AUTH_ERROR', error });
        setStatus('redirecting');
        router.replace(fallbackUrl);
      }
    };

    validateAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  // Si está autenticado, mostrar children
  if (status === 'authenticated') {
    return <>{children}</>;
  }

  // Si allowPartialAccess está habilitado y hay usuario, mostrar children
  if (allowPartialAccess && user !== null) {
    return <>{children}</>;
  }

  // Mostrar loading mientras se valida o redirige
  if (loadingComponent) {
    return <>{loadingComponent}</>;
  }

  return (
    <LoadingScreen
      variant="default"
      message={status === 'redirecting' ? 'Redirigiendo...' : 'Verificando acceso...'}
      subMessage="Un momento por favor"
    />
  );
}

export default ProtectedLayout;
