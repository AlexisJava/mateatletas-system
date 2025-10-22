'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Ruta pública para lecciones de cursos
 * Maneja URLs como /cursos/astro/3
 * Redirige a la ruta del estudiante si está autenticado, o muestra la lección directamente
 */
export default function PublicLeccionPage() {
  const router = useRouter();
  const params = useParams();
  const cursoId = params?.cursoId as string;
  const leccionNumero = params?.leccionNumero as string;

  useEffect(() => {
    if (cursoId && leccionNumero) {
      // Redirigir a la ruta del estudiante con el formato completo
      router.replace(`/estudiante/cursos/${cursoId}/lecciones/${leccionNumero}`);
    }
  }, [cursoId, leccionNumero, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-8 border-purple-500 border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
        <p className="text-gray-600 text-lg font-semibold">Redirigiendo a la lección...</p>
      </div>
    </div>
  );
}
