'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui';

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
  const { user, logout, checkAuth } = useAuthStore();
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

      // Verificar si hay token en localStorage
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth-token');

        if (!token) {
          // No hay token, redirigir a login
          router.push('/login');
          return;
        }
      }

      try {
        // Intentar validar el token con el servidor
        await checkAuth();
        // Token válido, continuar
        setIsValidating(false);
      } catch (error) {
        console.error('Error validando autenticación:', error);
        // Token inválido o error de red, redirigir a login
        router.push('/login');
      }
    };

    validateAuth();
  }, [checkAuth, router]);

  /**
   * Maneja el logout del usuario
   */
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

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
   */
  return (
    <div className="min-h-screen bg-[#fff9e6]">
      {/* Header fijo en la parte superior */}
      <header className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-[#ff6b35]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo y título */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-[#ff6b35] to-[#f7b801] rounded-lg p-2">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#ff6b35]">
                  Mateatletas
                </h1>
                <p className="text-xs text-gray-500">
                  Plataforma de entrenamiento
                </p>
              </div>
            </div>

            {/* Usuario y acciones */}
            <div className="flex items-center gap-4">
              {/* Información del usuario */}
              <div className="hidden sm:block text-right">
                <p className="text-sm text-gray-600">Bienvenido,</p>
                <p className="text-base font-bold text-[#2a1a5e]">
                  {user?.nombre} {user?.apellido}
                </p>
              </div>

              {/* Avatar (círculo con inicial) */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#f7b801] flex items-center justify-center text-white font-bold text-lg">
                {user?.nombre?.charAt(0).toUpperCase() || 'U'}
              </div>

              {/* Botón de logout */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:flex"
              >
                Cerrar sesión
              </Button>

              {/* Botón de logout móvil */}
              <button
                onClick={handleLogout}
                className="sm:hidden p-2 text-[#ff6b35] hover:bg-[#ff6b35]/10 rounded-lg transition-colors"
                aria-label="Cerrar sesión"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación secundaria (breadcrumbs o tabs) - Opcional */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 py-3">
            <a
              href="/dashboard"
              className="text-sm font-medium text-[#ff6b35] border-b-2 border-[#ff6b35] pb-2"
            >
              Dashboard
            </a>
            <a
              href="/atletas"
              className="text-sm font-medium text-gray-600 hover:text-[#ff6b35] pb-2 transition-colors"
            >
              Atletas
            </a>
            <a
              href="/ejercicios"
              className="text-sm font-medium text-gray-600 hover:text-[#ff6b35] pb-2 transition-colors"
            >
              Ejercicios
            </a>
            <a
              href="/profile"
              className="text-sm font-medium text-gray-600 hover:text-[#ff6b35] pb-2 transition-colors"
            >
              Mi Perfil
            </a>
          </div>
        </div>
      </nav>

      {/* Área principal de contenido */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © 2025 Mateatletas. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="/ayuda" className="hover:text-[#ff6b35] transition-colors">
                Ayuda
              </a>
              <a href="/privacidad" className="hover:text-[#ff6b35] transition-colors">
                Privacidad
              </a>
              <a href="/terminos" className="hover:text-[#ff6b35] transition-colors">
                Términos
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
