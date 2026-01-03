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
 * FIX NAVEGACIÓN:
 * - Usa sessionStorage para persistir validación durante la sesión
 * - Evita re-validaciones innecesarias al navegar entre pestañas
 * - Solo re-valida si el usuario cambia o se cierra el navegador
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, type UserRole } from '@/store/auth.store';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import type { ProtectedLayoutProps, UnauthorizedReason, AuthenticatedUser } from './types';
import { ROLE_MAP, DEFAULT_ROLE_REDIRECTS } from './types';

type AuthStatus = 'loading' | 'authenticated' | 'redirecting';

// Key para sessionStorage - persiste validación durante la sesión del navegador
const SESSION_AUTH_KEY = 'mateatletas_auth_validated';

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

  /**
   * Función para verificar si el usuario actual está autenticado y autorizado.
   * Se ejecuta síncronamente para evitar flickers durante navegación.
   */
  const checkCurrentUserAuth = useCallback((): 'authenticated' | 'wrong_role' | 'no_user' => {
    // Obtener estado ACTUAL del store (no del closure del componente)
    const currentState = useAuthStore.getState();
    const currentUser = currentState.user;
    const currentSelectedRole = currentState.selectedRole;

    if (!currentUser) return 'no_user';

    const activeRole = currentSelectedRole ?? currentUser.role ?? null;
    if (!activeRole) return 'no_user';

    const isAllowed = normalizedAllowedRoles.includes(activeRole);
    return isAllowed ? 'authenticated' : 'wrong_role';
  }, [normalizedAllowedRoles]);

  // Estado para controlar el render
  // IMPORTANTE: Siempre empezar con 'loading' para evitar hydration mismatch
  // El servidor no tiene acceso al store de Zustand, así que debemos calcular
  // el estado real solo en el cliente durante el useEffect
  const [status, setStatus] = useState<AuthStatus>('loading');

  // Ref para evitar múltiples validaciones en el mismo mount (StrictMode, fast refresh)
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
   * Marca la sesión como validada en sessionStorage.
   * Esto persiste durante la sesión del navegador (hasta cerrar pestaña).
   */
  const markSessionValidated = useCallback((userId: string) => {
    try {
      sessionStorage.setItem(
        SESSION_AUTH_KEY,
        JSON.stringify({ userId, validated: true, timestamp: Date.now() }),
      );
    } catch {
      // sessionStorage puede fallar en modo incógnito en algunos navegadores
    }
  }, []);

  /**
   * Verifica si ya hay una validación en sessionStorage para este usuario.
   */
  const isSessionValidated = useCallback((userId: string): boolean => {
    try {
      const data = sessionStorage.getItem(SESSION_AUTH_KEY);
      if (!data) return false;
      const parsed = JSON.parse(data);
      // Validar que sea el mismo usuario y que no haya expirado (1 hora)
      const isValid =
        parsed.userId === userId &&
        parsed.validated === true &&
        Date.now() - parsed.timestamp < 3600000; // 1 hora
      return isValid;
    } catch {
      return false;
    }
  }, []);

  /**
   * Lógica principal de validación de autenticación.
   */
  useEffect(() => {
    // Evitar múltiples ejecuciones en el mismo mount
    if (hasValidatedRef.current) {
      return;
    }
    hasValidatedRef.current = true;

    const validateAuth = async () => {
      // VERIFICACIÓN SÍNCRONA PRIMERO: Leer directamente del store
      const syncCheck = checkCurrentUserAuth();

      // CASO 1: Usuario ya autenticado y autorizado en el store
      if (syncCheck === 'authenticated') {
        const currentState = useAuthStore.getState();
        const currentUser = currentState.user!;
        const activeRole = currentState.selectedRole ?? currentUser.role;

        // Marcar sesión como validada
        markSessionValidated(currentUser.id);
        notifyAuthenticated(currentUser, activeRole as UserRole);
        setStatus('authenticated');
        return;
      }

      // CASO 2: Usuario en store pero rol incorrecto
      if (syncCheck === 'wrong_role') {
        const currentState = useAuthStore.getState();
        const currentUser = currentState.user!;
        const activeRole = currentState.selectedRole ?? currentUser.role;
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

      // CASO 3: No hay usuario en store - verificar si hay sesión validada recientemente
      // Esto evita llamadas al backend en cada navegación
      const storeState = useAuthStore.getState();
      if (storeState.user && isSessionValidated(storeState.user.id)) {
        // Hay usuario en store y sesión validada - confiar en el estado
        const activeRole = storeState.selectedRole ?? storeState.user.role;
        if (normalizedAllowedRoles.includes(activeRole)) {
          notifyAuthenticated(storeState.user, activeRole as UserRole);
          setStatus('authenticated');
          return;
        }
      }

      // CASO 4: No hay usuario, verificar con backend (cookie httpOnly)
      try {
        await checkAuth();

        // Obtener estado actualizado del store después de checkAuth
        const currentState = useAuthStore.getState();
        const currentUser = currentState.user;
        const currentSelectedRole = currentState.selectedRole;

        if (!currentUser) {
          // No hay sesión válida - limpiar sessionStorage
          sessionStorage.removeItem(SESSION_AUTH_KEY);
          notifyUnauthorized({ type: 'NOT_AUTHENTICATED' });
          setStatus('redirecting');
          router.replace(fallbackUrl);
          return;
        }

        const activeRole = getActiveRole(currentUser, currentSelectedRole);

        if (isRoleAllowed(activeRole)) {
          // Marcar sesión como validada
          markSessionValidated(currentUser.id);
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
        // Error en checkAuth - NO redirigir si hay usuario en store con sesión validada
        const currentState = useAuthStore.getState();
        if (currentState.user && isSessionValidated(currentState.user.id)) {
          // Ignorar error de red, confiar en sesión local
          const activeRole = currentState.selectedRole ?? currentState.user.role;
          if (normalizedAllowedRoles.includes(activeRole)) {
            setStatus('authenticated');
            return;
          }
        }

        // No hay forma de validar - redirigir a login
        sessionStorage.removeItem(SESSION_AUTH_KEY);
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
