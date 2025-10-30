'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import Script from 'next/script';

/**
 * Portal Estudiante - Layout con Auth Guard
 *
 * Solo permite acceso a usuarios con rol "estudiante"
 * Redirige automáticamente según el rol del usuario
 */
export default function EstudianteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, checkAuth, logout } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);
  const hasValidatedRef = useRef(false);

  useEffect(() => {
    console.log('🔍 [EstudianteLayout] Init - pathname:', pathname);
    console.log('👤 [EstudianteLayout] User:', user);

    // Evitar múltiples validaciones
    if (hasValidatedRef.current) {
      console.log('⏭️ [EstudianteLayout] Ya validado, skipping...');
      return;
    }

    const validateAuth = async () => {
      console.log('🚀 [EstudianteLayout] Iniciando validateAuth...');
      hasValidatedRef.current = true;

      // Usuario estudiante válido
      if (user && user.role === 'estudiante') {
        console.log('✅ [EstudianteLayout] Usuario estudiante válido:', user.id);

        // Verificar si tiene avatar
        try {
          console.log('📡 [EstudianteLayout] Fetching /api/estudiante/mi-avatar...');
          const response = await fetch('/api/estudiante/mi-avatar', {
            credentials: 'include', // Importante: incluir cookies
          });

          console.log('📥 [EstudianteLayout] Response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('📦 [EstudianteLayout] Avatar data:', data);

            // Si NO tiene avatar Y NO está en /crear-avatar → Redirigir
            if (!data.tiene_avatar && pathname !== '/estudiante/crear-avatar') {
              console.log('🔀 [EstudianteLayout] Sin avatar, redirigiendo a /crear-avatar');
              router.replace('/estudiante/crear-avatar');
              return;
            }

            // Si tiene avatar Y está en /crear-avatar → Redirigir al gimnasio
            if (data.tiene_avatar && pathname === '/estudiante/crear-avatar') {
              console.log('🔀 [EstudianteLayout] Con avatar, redirigiendo a /gimnasio');
              router.replace('/estudiante/gimnasio');
              return;
            }

            console.log('✅ [EstudianteLayout] Todo OK, mostrando contenido');
          } else if (response.status === 401) {
            // Token inválido o expirado, forzar re-login
            console.warn('⚠️ [EstudianteLayout] 401 - Token inválido, redirigiendo a login');
            router.replace('/login');
            return;
          } else {
            console.error('❌ [EstudianteLayout] Error response:', response.status);
          }
        } catch (error) {
          console.error('❌ [EstudianteLayout] Error al verificar avatar:', error);
          // En caso de error, continuar sin verificar avatar
        }

        console.log('🎬 [EstudianteLayout] Terminando validación, setIsValidating(false)');
        setIsValidating(false);
        return;
      }

      // Usuario con otro rol → redirigir
      if (user && user.role !== 'estudiante') {
        console.log('🔀 [EstudianteLayout] Usuario no es estudiante, role:', user.role);
        const redirectPath =
          user.role === 'admin' ? '/admin/dashboard' :
          user.role === 'docente' ? '/docente/dashboard' :
          '/dashboard';
        router.replace(redirectPath);
        return;
      }

      // Sin usuario → verificar auth
      if (!user) {
        console.log('🔍 [EstudianteLayout] Sin usuario, verificando auth...');
        try {
          await checkAuth();
          const currentUser = useAuthStore.getState().user;
          console.log('📥 [EstudianteLayout] checkAuth result:', currentUser);

          if (!currentUser) {
            console.log('⚠️ [EstudianteLayout] No hay usuario, redirigiendo a login');
            router.replace('/login');
            return;
          }

          if (currentUser.role !== 'estudiante') {
            console.log('🔀 [EstudianteLayout] Usuario no estudiante después de checkAuth');
            const redirectPath =
              currentUser.role === 'admin' ? '/admin/dashboard' :
              currentUser.role === 'docente' ? '/docente/dashboard' :
              '/dashboard';
            router.replace(redirectPath);
            return;
          }

          console.log('✅ [EstudianteLayout] Estudiante validado después de checkAuth');
          setIsValidating(false);
        } catch (error: unknown) {
          console.error('❌ [EstudianteLayout] Error en checkAuth:', error);
          router.replace('/login');
        }
      }
    };

    validateAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Script de model-viewer para avatares 3D */}
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"
        strategy="beforeInteractive"
      />

      <div className="min-h-screen bg-black relative">
        {isValidating ? <LoadingScreen /> : children}
      </div>
    </>
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
