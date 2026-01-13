'use client';

import { usePathname } from 'next/navigation';
import { ProtectedLayout } from '@/components/shared/ProtectedLayout';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { Header } from '@/components/admin/Header';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

/**
 * Admin Layout v4.1 - Sidebar Design
 *
 * Estructura:
 * - Sidebar vertical colapsable (toggle para ocultar/mostrar)
 * - Header con saludo, reloj y acciones de usuario (oculto en Sandbox)
 * - Contenido principal
 *
 * Autenticación manejada por ProtectedLayout.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout allowedRoles={['ADMIN']} loadingComponent={<LoadingScreen variant="admin" />}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ProtectedLayout>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSandbox = pathname === '/admin/sandbox';
  const isLessonPlayerDemo = pathname === '/admin/lesson-player-demo';

  // Fullscreen mode for lesson player demo - no sidebar, no header
  if (isLessonPlayerDemo) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen bg-[var(--admin-bg)] flex overflow-hidden" data-admin="true">
      {/* Sidebar - Navegación vertical colapsable */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - Oculto en Sandbox (tiene su propio header compacto) */}
        {!isSandbox && (
          <div className="shrink-0 p-4 lg:p-6 pb-0 lg:pb-0">
            <Header />
          </div>
        )}

        {/* Content - Sin padding en Sandbox para que los paneles ocupen todo el espacio */}
        <main
          className={`flex-1 overflow-hidden flex flex-col ${isSandbox ? 'p-0' : 'p-4 lg:p-6'}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
