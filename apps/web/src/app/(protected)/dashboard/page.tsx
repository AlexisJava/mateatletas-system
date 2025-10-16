'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import apiClient from '@/lib/axios';
import OnboardingView from './components/OnboardingView';
import DashboardView from './components/DashboardView';

/**
 * Dashboard del Tutor - Página principal después del login
 * Ruta: /dashboard
 *
 * Tiene 2 estados:
 * 1. OnboardingView: Cuando NO tiene hijos registrados
 * 2. DashboardView: Cuando SÍ tiene hijos (tabs, stats, etc.)
 */

interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: Date;
  grado_escolar?: string;
}

interface Clase {
  id: string;
  fecha_hora_inicio: Date;
  ruta_curricular: {
    nombre: string;
  };
  docente: {
    user: {
      nombre: string;
      apellido: string;
    };
  };
  inscripciones: Array<{
    estudiante: Estudiante;
  }>;
}

interface Membresia {
  id: string;
  estado: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  producto: {
    nombre: string;
    precio: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Estado para datos del backend
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [clases, setClases] = useState<Clase[]>([]);
  const [membresia, setMembresia] = useState<Membresia | null>(null);
  const [loading, setLoading] = useState(true);

  // Protección de ruta: solo tutores autenticados
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      if (user?.role !== 'tutor') {
        router.push('/');
        return;
      }

      // Cargar datos del dashboard
      loadDashboardData();
    }
  }, [isAuthenticated, isLoading, user, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Cargar estudiantes, clases y membresía en paralelo
      const [estudiantesRes, clasesRes, membresiaRes] = await Promise.all([
        apiClient.get('/estudiantes'),
        apiClient.get('/clases'),
        apiClient.get('/pagos/membresia'),
      ]);

      console.log('📊 Datos del backend:', { estudiantesRes, clasesRes, membresiaRes });

      // El endpoint /estudiantes devuelve { data: [...], metadata: {...} }
      // Axios interceptor ya extrajo response.data, entonces estudiantesRes ES {data: [...], metadata: {...}}
      const estudiantesArray = estudiantesRes?.data || [];
      console.log('👥 Estudiantes parseados:', estudiantesArray, 'length:', estudiantesArray.length);

      setEstudiantes(estudiantesArray as unknown as Estudiante[]);
      setClases((clasesRes || []) as unknown as Clase[]);
      setMembresia(((membresiaRes as any)?.membresia || null) as Membresia | null);
    } catch (error: unknown) {
      console.error('❌ Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading mientras se verifica autenticación
  if (isLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  // Determinar si tiene hijos o no
  const hasChildren = estudiantes.length > 0;

  console.log('🔍 Estado del dashboard:', {
    estudiantes,
    estudiantesLength: estudiantes.length,
    hasChildren,
    showingView: hasChildren ? 'DashboardView' : 'OnboardingView'
  });

  // Si NO tiene hijos → Mostrar Onboarding
  if (!hasChildren || !user) {
    return <OnboardingView user={user!} />;
  }

  // Si SÍ tiene hijos → Mostrar Dashboard completo
  return (
    <DashboardView
      user={user!}
      estudiantes={estudiantes as any}
      clases={clases as any}
      membresia={membresia as any}
    />
  );
}
