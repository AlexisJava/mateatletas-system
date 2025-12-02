'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect from /docente-login to /login
 *
 * Esta página fue unificada con /login.
 * Ahora todos los usuarios (tutores, docentes, admins) usan /login
 * y se redirigen automáticamente según su rol.
 */
export default function DocenteLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60">Redirigiendo...</p>
      </div>
    </div>
  );
}