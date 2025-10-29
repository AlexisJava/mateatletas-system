'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { ThemeProvider } from '@/lib/theme/ThemeContext';

/**
 * Portal Estudiante - Layout Fullscreen
 *
 * Sin sidebar - Diseñado para experiencia de juego
 */

export default function EstudianteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);
  const hasValidatedRef = useRef(false);

  useEffect(() => {
    // Evitar múltiples validaciones usando ref
    if (hasValidatedRef.current) {
      return;
    }

    const validateAuth = async () => {
      hasValidatedRef.current = true;

      // Si ya tenemos un usuario estudiante, validar y terminar
      if (user && user.role === 'estudiante') {
        setIsValidating(false);
        return;
      }

      // Si el usuario tiene otro rol, redirigir al dashboard apropiado
      if (user && user.role !== 'estudiante') {
        const redirectPath =
          user.role === 'admin' ? '/admin/dashboard' :
          user.role === 'docente' ? '/docente/dashboard' :
          '/dashboard';
        router.replace(redirectPath);
        return;
      }

      // Si no hay usuario, intentar verificar autenticación con el backend
      if (!user) {
        try {
          await checkAuth();
          const currentUser = useAuthStore.getState().user;

          // Después de checkAuth, validar el rol
          if (!currentUser) {
            router.replace('/login');
            return;
          }

          if (currentUser.role !== 'estudiante') {
            const redirectPath =
              currentUser.role === 'admin' ? '/admin/dashboard' :
              currentUser.role === 'docente' ? '/docente/dashboard' :
              '/dashboard';
            router.replace(redirectPath);
            return;
          }

          // Usuario es estudiante, validación exitosa
          setIsValidating(false);
        } catch (error: unknown) {
          // Error al verificar auth, redirigir a login
          router.replace('/login');
        }
      }
    };

    validateAuth();
    // Solo ejecutar una vez al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeProvider>
      {isValidating ? (
        <LoadingScreen />
      ) : (
        children
      )}
    </ThemeProvider>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-400 via-blue-300 to-cyan-300">
      <div className="text-center bg-white p-12 rounded-3xl shadow-2xl border-4 border-orange-500">
        <div className="w-16 h-16 border-4 border-yellow-400 border-t-orange-500 rounded-full animate-spin mx-auto mb-6" />
        <p className="text-sm font-black text-orange-600">Cargando Portal Estudiante...</p>
      </div>
    </div>
  );
}
