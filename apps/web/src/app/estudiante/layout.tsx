'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

/**
 * Portal Estudiante - Layout con Auth Guard
 *
 * Solo permite acceso a usuarios con rol "estudiante"
 * Redirige automáticamente según el rol del usuario
 */
export default function EstudianteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, checkAuth } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);
  const hasValidatedRef = useRef(false);

  useEffect(() => {
    // Evitar múltiples validaciones
    if (hasValidatedRef.current) return;

    const validateAuth = async () => {
      hasValidatedRef.current = true;

      // Usuario estudiante válido
      if (user && user.role === 'estudiante') {
        // Verificar si tiene avatar
        try {
          const response = await fetch('/api/estudiante/mi-avatar', {
            credentials: 'include', // Importante: incluir cookies
          });

          if (response.ok) {
            const data = await response.json();

            // Si NO tiene avatar Y NO está en /crear-avatar → Redirigir
            if (!data.tiene_avatar && pathname !== '/estudiante/crear-avatar') {
              router.replace('/estudiante/crear-avatar');
              return;
            }

            // Si tiene avatar Y está en /crear-avatar → Redirigir al gimnasio
            if (data.tiene_avatar && pathname === '/estudiante/crear-avatar') {
              router.replace('/estudiante/gimnasio');
              return;
            }
          } else if (response.status === 401) {
            // Token inválido o expirado, forzar re-login
            console.warn('Token inválido o expirado, redirigiendo a login');
            router.replace('/login');
            return;
          }
        } catch (error) {
          console.error('Error al verificar avatar:', error);
          // En caso de error, continuar sin verificar avatar
        }

        setIsValidating(false);
        return;
      }

      // Usuario con otro rol → redirigir
      if (user && user.role !== 'estudiante') {
        const redirectPath =
          user.role === 'admin' ? '/admin/dashboard' :
          user.role === 'docente' ? '/docente/dashboard' :
          '/dashboard';
        router.replace(redirectPath);
        return;
      }

      // Sin usuario → verificar auth
      if (!user) {
        try {
          await checkAuth();
          const currentUser = useAuthStore.getState().user;

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

          setIsValidating(false);
        } catch (error: unknown) {
          router.replace('/login');
        }
      }
    };

    validateAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {isValidating ? <LoadingScreen /> : children}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg font-bold">Cargando...</p>
      </div>
    </div>
  );
}
