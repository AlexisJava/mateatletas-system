'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * Redirect to progreso page - contenidos is now merged into progreso
 */
export default function TutorHijoContenidosPage(): React.ReactNode {
  const params = useParams();
  const router = useRouter();
  const estudianteId = params.id as string;

  useEffect(() => {
    router.replace(`/tutor/hijo/${estudianteId}/progreso`);
  }, [estudianteId, router]);

  return null;
}
