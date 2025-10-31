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
  const { user, checkAuth } = useAuthStore();
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
        } catch (error) {
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
  // Generate stars only on client-side to prevent hydration mismatch
  const [stars, setStars] = useState<Array<{
    size: number
    left: number
    top: number
    duration: number
    delay: number
    opacity: number
  }>>([])

  useEffect(() => {
    // Generate stars after mount (client-side only)
    const generatedStars = [...Array(200)].map(() => ({
      size: Math.random() * 3,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
      opacity: Math.random() * 0.8 + 0.2,
    }))
    setStars(generatedStars)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-black">
      {/* CAMPO DE ESTRELLAS */}
      <div className="absolute inset-0">
        {stars.map((star, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              left: `${star.left}%`,
              top: `${star.top}%`,
              animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      {/* NEBULOSAS */}
      <div className="absolute inset-0">
        <div className="absolute w-[800px] h-[800px] rounded-full bg-purple-600/10 blur-[120px] -top-40 -left-40 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[100px] -bottom-20 -right-20 animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute w-[700px] h-[700px] rounded-full bg-cyan-600/10 blur-[110px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      {/* AGUJERO NEGRO */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[400px] h-[400px]">
          {[...Array(8)].map((_, i) => (
            <div
              key={`ring-${i}`}
              className="absolute inset-0 rounded-full border-2"
              style={{
                borderColor: `rgba(100, 200, 255, ${0.3 - i * 0.03})`,
                transform: `scale(${1 - i * 0.12})`,
                animation: `blackHoleRing ${3 + i * 0.5}s linear infinite`,
                animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-black border-4 border-blue-500/50 shadow-[0_0_80px_rgba(59,130,246,0.8)]" />
          </div>
        </div>
      </div>

      {/* TEXTO PRINCIPAL */}
      <div className="relative z-20 text-center px-8">
        <div className="mb-12 relative py-8">
          <h1 className="relative text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 whitespace-nowrap" style={{
            textShadow: '0 0 40px rgba(56, 189, 248, 0.8), 0 0 80px rgba(56, 189, 248, 0.4)',
            animation: 'holographicGlow 3s ease-in-out infinite'
          }}>
            MATEATLETAS
          </h1>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="w-full h-1 bg-cyan-400/30 absolute" style={{ animation: 'scanLine 3s linear infinite' }} />
          </div>
        </div>

        <div className="mb-8">
          <p className="text-cyan-300 text-xl md:text-2xl font-mono tracking-wider" style={{
            textShadow: '0 0 10px rgba(103, 232, 249, 0.8)'
          }}>
            [ INICIANDO SISTEMA CUÁNTICO ]
          </p>
        </div>

        <div className="w-[90%] max-w-[500px] mx-auto">
          <div className="relative h-2 bg-gray-800/50 rounded-full overflow-hidden border border-cyan-500/30">
            <div className="h-full relative">
              <div
                className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"
                style={{ animation: 'warpProgress 2s ease-in-out infinite' }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" style={{ animation: 'shine 2s ease-in-out infinite' }} />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes blackHoleRing {
          0% { transform: scale(1) rotate(0deg); opacity: 0.4; }
          50% { transform: scale(0.8) rotate(180deg); opacity: 0.2; }
          100% { transform: scale(1) rotate(360deg); opacity: 0.4; }
        }
        @keyframes holographicGlow {
          0%, 100% { filter: brightness(1) contrast(1); }
          50% { filter: brightness(1.3) contrast(1.2); }
        }
        @keyframes scanLine {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        @keyframes warpProgress {
          0% { width: 0%; transform: scaleX(1); }
          50% { width: 60%; transform: scaleX(1.1); }
          100% { width: 95%; transform: scaleX(1); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
