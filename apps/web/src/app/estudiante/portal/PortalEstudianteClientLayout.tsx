'use client';

import { ProtectedLayout } from '@/components/shared/ProtectedLayout/ProtectedLayout';
import { EstudianteProvider } from '@/contexts/EstudianteContext';
import { LoadingScreen } from '@/components/shared/LoadingScreen';

/**
 * Client Layout para el Portal Estudiante
 *
 * Características:
 * - Protección de rutas: Solo estudiantes autenticados
 * - Contexto: Datos del estudiante disponibles en todas las páginas
 * - Loading: Pantalla de carga mientras se verifica autenticación
 */
export function PortalEstudianteClientLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <ProtectedLayout
      allowedRoles={['ESTUDIANTE']}
      fallbackUrl="/estudiante-login"
      loadingComponent={
        <LoadingScreen
          variant="cosmic"
          message="Cargando tu portal..."
          subMessage="Preparando tu aventura de aprendizaje"
        />
      }
    >
      <EstudianteProvider>{children}</EstudianteProvider>
    </ProtectedLayout>
  );
}
