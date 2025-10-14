'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { motion } from 'framer-motion';
import { FloatingParticles, LoadingSpinner, PageTransition } from '@/components/effects';

export default function EstudianteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, checkAuth } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    console.log('🔵 [LAYOUT] useEffect ejecutado - pathname:', pathname);

    const validateAuth = async () => {
      console.log('🔵 [LAYOUT] Iniciando validación de auth...');

      // Verificar autenticación del usuario
      await checkAuth();

      // Obtener el usuario actualizado del store después de checkAuth
      const currentUser = useAuthStore.getState().user;
      console.log('🔵 [LAYOUT] Usuario después de checkAuth:', currentUser?.email, currentUser?.role);

      // Validar que el usuario esté autenticado
      if (!currentUser) {
        console.log('🔴 [LAYOUT] Acceso denegado: usuario no autenticado - Redirigiendo a /login');
        router.push('/login');
        return;
      }

      // Validar que el usuario sea estudiante
      if (currentUser.role !== 'estudiante') {
        console.log('🔴 [LAYOUT] Acceso denegado: usuario no es estudiante (role:', currentUser.role, ') - Redirigiendo a /login');
        router.push('/login');
        return;
      }

      console.log('✅ [LAYOUT] Validación exitosa - Mostrando contenido');
      setIsValidating(false);
    };

    validateAuth();
    // Solo ejecutar una vez al montar el componente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isActive = (route: string) => pathname === route || pathname?.startsWith(route);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
        <LoadingSpinner size="xl" text="Cargando tu portal..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      {/* Particles Background Effect - Reducido para mejor performance */}
      <FloatingParticles count={15} minDuration={15} maxDuration={25} />

      {/* Header Único con Todo */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative bg-gradient-to-r from-cyan-600/90 to-blue-600/90 backdrop-blur-lg border-b-4 border-black sticky top-0 z-50"
        style={{
          boxShadow: '0 8px 0 0 rgba(0, 0, 0, 1)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex justify-between items-center gap-8">
            {/* Logo Izquierda */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 flex-shrink-0"
            >
              <div className="relative">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg p-2 border-4 border-black"
                  style={{ boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 1)' }}
                >
                  <span className="text-2xl">🚀</span>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white"
                  style={{ textShadow: '2px 2px 0 #000' }}
                >
                  Portal Estudiante
                </h1>
                <p className="text-xs text-cyan-100 font-semibold">¡Tu aventura matemática!</p>
              </div>
            </motion.div>

            {/* Navegación AL MEDIO */}
            <nav className="hidden md:flex gap-3 flex-1 justify-center">
              {[
                { href: '/estudiante/dashboard', label: 'Inicio', icon: '🏠' },
                { href: '/estudiante/cursos', label: 'Mis Cursos', icon: '📚' },
                { href: '/estudiante/logros', label: 'Logros', icon: '🏆' },
                { href: '/estudiante/ranking', label: 'Ranking', icon: '📊' },
              ].map((item) => (
                <motion.button
                  key={item.href}
                  onClick={() => {
                    console.log('🔵 [LAYOUT] Click en navegación:', item.href);
                    router.push(item.href);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-6 py-2 rounded-lg font-bold whitespace-nowrap transition-all border-4 border-black ${
                    isActive(item.href)
                      ? 'bg-white text-cyan-600'
                      : 'bg-cyan-500 text-white hover:bg-cyan-400'
                  }`}
                  style={{
                    boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 1)',
                    textShadow: isActive(item.href) ? 'none' : '1px 1px 0 #000'
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </span>
                </motion.button>
              ))}
            </nav>

            {/* User Info + Salir Derecha */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden lg:block text-right">
                <p className="text-xs text-cyan-100 font-semibold">Estudiante:</p>
                <p className="text-base font-bold text-white"
                  style={{ textShadow: '2px 2px 0 #000' }}
                >
                  {user?.nombre || 'Alex'} {user?.apellido || 'Matemático'}
                </p>
              </div>

              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg border-4 border-black"
                style={{ boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 1)' }}
              >
                {user?.nombre?.charAt(0).toUpperCase() || 'A'}
              </motion.div>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 border-4 border-black text-white rounded-lg font-bold transition-all"
                style={{
                  boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 1)',
                  textShadow: '1px 1px 0 #000'
                }}
              >
                Salir
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content con scroll */}
      <main className="relative min-h-[calc(100vh-80px)] overflow-y-auto">
        <PageTransition>{children}</PageTransition>
      </main>

      {/* Footer con gradiente */}
      <footer className="relative bg-gradient-to-t from-black to-transparent border-t border-cyan-400/20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-cyan-300">
              © 2025 Mateatletas. Portal Estudiante.
            </p>
            <div className="flex gap-6 text-sm text-cyan-400">
              <a href="/ayuda" className="hover:text-cyan-200 transition-colors">
                Ayuda
              </a>
              <a href="/soporte" className="hover:text-cyan-200 transition-colors">
                Soporte
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
