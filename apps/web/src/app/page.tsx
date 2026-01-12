'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Homepage - Redirige automáticamente a /login
 */
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--estudiante-bg)] flex items-center justify-center">
      <div className="text-white text-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60">Redirigiendo...</p>
      </div>
    </div>
  );
}
