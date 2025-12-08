'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

/**
 * Portal Estudiante - Layout con Auth Guard
 *
 * Solo permite acceso a usuarios con rol "estudiante"
 * Redirige automáticamente según el rol del usuario
 */
export default function EstudianteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateAuth = async () => {
      // Usuario estudiante válido
      if (user && user.role === 'estudiante') {
        setIsValidating(false);
        return;
      }

      // Usuario con otro rol → redirigir
      if (user && user.role !== 'estudiante') {
        const redirectPath =
          user.role === 'admin'
            ? '/admin/dashboard'
            : user.role === 'docente'
              ? '/docente/dashboard'
              : '/dashboard';
        router.replace(redirectPath);
        return;
      }

      // Sin usuario → verificar auth
      if (!user) {
        try {
          await checkAuth();
          const currentUser = useAuthStore.getState().user;

          if (!currentUser) {
            router.replace('/estudiante-login');
            return;
          }

          if (currentUser.role !== 'estudiante') {
            const redirectPath =
              currentUser.role === 'admin'
                ? '/admin/dashboard'
                : currentUser.role === 'docente'
                  ? '/docente/dashboard'
                  : '/dashboard';
            router.replace(redirectPath);
            return;
          }

          setIsValidating(false);
        } catch {
          router.replace('/estudiante-login');
        }
      }
    };

    validateAuth();
  }, [user, checkAuth, router]);

  if (isValidating) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen bg-slate-950">{children}</div>;
}
