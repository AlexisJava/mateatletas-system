'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

/**
 * Protected Layout - Envuelve todas las rutas que requieren autenticación
 *
 * Rutas protegidas:
 * - /dashboard
 * - /profile
 * - /atletas
 * - etc.
 *
 * Validaciones:
 * 1. Verifica token en localStorage
 * 2. Valida token con el servidor (checkAuth)
 * 3. Redirige a /login si no está autenticado
 * 4. Muestra loading mientras valida
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { checkAuth, token, isAuthenticated } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);
  const hasValidatedRef = useRef(false);

  /**
   * Valida autenticación al montar el componente
   */
  useEffect(() => {
    // Solo validar una vez usando ref (no causa re-renders)
    if (hasValidatedRef.current) return;

    const validateAuth = async () => {
      hasValidatedRef.current = true;

      // Verificar si hay token en el store de Zustand (persisted)
      if (!token) {
        // No hay token, redirigir a login
        router.push('/login');
        return;
      }

      try {
        // Intentar validar el token con el servidor
        await checkAuth();
        // Token válido, continuar
        setIsValidating(false);
      } catch (error: unknown) {
        // Token inválido o error de red, redirigir a login
        router.push('/login');
      }
    };

    validateAuth();
  }, [checkAuth, router, token]);

  /**
   * Maneja el logout del usuario
   */

  /**
   * Muestra spinner mientras valida autenticación
   */
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ff6b35] via-[#f7b801] to-[#00d9ff]">
        <div className="text-center">
          {/* Spinner */}
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4"></div>
          <p className="text-white text-lg font-semibold">
            Verificando autenticación...
          </p>
        </div>
      </div>
    );
  }

  /**
   * Si llegamos aquí, el usuario está autenticado
   * Los componentes hijos (como DashboardView) manejan su propio layout
   */
  return <>{children}</>;
}
