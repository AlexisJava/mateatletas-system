'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import apiClient from '@/lib/axios';
import { getDashboardResumen } from '@/lib/api/tutor.api';
import DashboardView from './components/DashboardView';
import type { Estudiante } from '@/types/estudiante';
import type { Clase } from '@/types/clases.types';
import type { DashboardResumenResponse } from '@/types/tutor-dashboard.types';

/**
 * Dashboard del Tutor - Página principal después del login
 * Ruta: /dashboard
 *
 * Tiene 2 estados:
 * 1. OnboardingView: Cuando NO tiene hijos registrados
 * 2. DashboardView: Cuando SÍ tiene hijos (tabs, stats, etc.)
 */

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Estado para datos del backend
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [clases, setClases] = useState<Clase[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardResumenResponse | null>(null);
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

      console.log('🔍 Cargando datos del dashboard...');

      // Cargar estudiantes, clases y dashboard resumen en paralelo
      const [estudiantesRes, clasesRes, dashboardRes] = await Promise.all([
        apiClient.get<{ data: Estudiante[]; metadata?: unknown }>('/estudiantes'),
        apiClient.get<{ data: Clase[]; metadata?: unknown }>('/clases'),
        getDashboardResumen(),
      ]);

      console.log('✅ Estudiantes:', estudiantesRes);
      console.log('✅ Clases:', clasesRes);
      console.log('✅ Dashboard Resumen:', dashboardRes);
      console.log('📊 Métricas:', dashboardRes?.metricas);
      console.log('🔔 Alertas:', dashboardRes?.alertas);
      console.log('💰 Pagos Pendientes:', dashboardRes?.pagosPendientes);
      console.log('📅 Clases Hoy:', dashboardRes?.clasesHoy);

      // El endpoint /estudiantes devuelve { data: [...], metadata: {...} }
      // Axios interceptor ya extrajo response.data, entonces estudiantesRes ES {data: [...], metadata: {...}}
      setEstudiantes(estudiantesRes.data || []);
      setClases(clasesRes.data || []);
      setDashboardData(dashboardRes);

      console.log('💾 Estado seteado - dashboardData:', dashboardRes);
    } catch (error: unknown) {
      // Error loading dashboard data
      console.error('❌ Error loading dashboard:', error);
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

  // Siempre mostrar el Dashboard completo (sin onboarding)
  return (
    <DashboardView
      user={user!}
      estudiantes={estudiantes}
      clases={clases}
      dashboardData={dashboardData}
    />
  );
}
