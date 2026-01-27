'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import {
  LogOut,
  GraduationCap,
  Users,
  Calendar,
  Bell,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Star,
  BarChart3,
  CreditCard,
  Plus,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { DashboardSkeleton } from './skeletons/DashboardSkeleton';
import {
  tutoresApi,
  DashboardResumenResponse,
  ProximasClasesResponse,
  ClaseProxima,
  HijoInfo,
} from '@/lib/api/tutores.api';
import { HijoDetalleModal } from './modals/HijoDetalleModal';
import { ClaseDetalleModal } from './modals/ClaseDetalleModal';
import { PagosHistorialModal } from './modals/PagosHistorialModal';
import { NovedadesModal } from './modals/NovedadesModal';

/**
 * TutorDashboard - Diseño limpio con grid responsive
 * Layout: Header fijo + Contenido principal en 2 columnas
 */
export function TutorDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [dashboardData, setDashboardData] = useState<DashboardResumenResponse | null>(null);
  const [proximasClases, setProximasClases] = useState<ProximasClasesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedHijo, setSelectedHijo] = useState<HijoInfo | null>(null);
  const [selectedClase, setSelectedClase] = useState<ClaseProxima | null>(null);
  const [showPagosModal, setShowPagosModal] = useState(false);
  const [showNovedadesModal, setShowNovedadesModal] = useState(false);

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);
      const [dashboard, clases] = await Promise.all([
        tutoresApi.getDashboardResumen(),
        tutoresApi.getProximasClases(6),
      ]);
      setDashboardData(dashboard);
      setProximasClases(clases);
    } catch {
      setError('No pudimos cargar los datos. Intentá de nuevo.');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a12]">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-6 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-semibold transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const totalPendiente = dashboardData?.pagosPendientes?.reduce((sum, p) => sum + p.monto, 0) ?? 0;
  const hayAlertas = (dashboardData?.alertas?.length ?? 0) > 0;

  return (
    <div className="h-full flex flex-col bg-[#0a0a12] overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="h-16 shrink-0 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Mateatletas</h1>
            <p className="text-xs text-slate-500">Portal Tutores</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm hidden sm:inline">
            Hola, <span className="font-semibold text-white">{user?.nombre}</span>
          </span>
          <button
            onClick={() => router.push('/tutor/suscripcion')}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-all text-sm"
          >
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Mi Suscripción</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Row 1: Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Pendiente */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Clock className="w-4 h-4 text-red-400" />
                </div>
                <span className="text-sm text-slate-400">Pendiente</span>
              </div>
              <p
                className={`text-2xl font-bold ${totalPendiente > 0 ? 'text-red-400' : 'text-emerald-400'}`}
              >
                {formatMoney(totalPendiente)}
              </p>
              {totalPendiente === 0 && (
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Al día
                </p>
              )}
            </div>

            {/* Pagado este año */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-sm text-slate-400">Pagado {new Date().getFullYear()}</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">
                {formatMoney(dashboardData?.metricas?.totalPagadoAnio ?? 0)}
              </p>
            </div>

            {/* Asistencia */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-sm text-slate-400">Asistencia</span>
              </div>
              <p className="text-2xl font-bold text-cyan-400">
                {dashboardData?.metricas?.asistenciaPromedio ?? 0}%
              </p>
            </div>

            {/* Alertas */}
            <div
              className={`backdrop-blur-xl border rounded-2xl p-5 ${
                hayAlertas
                  ? 'bg-amber-500/10 border-amber-500/20'
                  : 'bg-slate-900/60 border-white/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`p-2 rounded-lg ${hayAlertas ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}
                >
                  {hayAlertas ? (
                    <Bell className="w-4 h-4 text-amber-400" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <span className="text-sm text-slate-400">Alertas</span>
              </div>
              <p
                className={`text-2xl font-bold ${hayAlertas ? 'text-amber-400' : 'text-emerald-400'}`}
              >
                {hayAlertas ? dashboardData?.alertas?.length : 'OK'}
              </p>
              {hayAlertas && (
                <p className="text-xs text-amber-300/80 mt-1 truncate">
                  {dashboardData?.alertas?.[0]?.titulo}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Hijos + Clases */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Mis Hijos */}
            <div className="lg:col-span-3 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Mis Hijos</h2>
                <span className="px-3 py-1 bg-violet-500/20 text-violet-300 text-sm font-semibold rounded-full">
                  {dashboardData?.hijos?.length ?? 0}
                </span>
                <button
                  onClick={() => router.push('/tutor/suscripcion/nueva')}
                  className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white rounded-xl font-semibold text-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Inscribir hijo
                </button>
              </div>

              {(dashboardData?.hijos?.length ?? 0) === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 mb-4">No hay hijos registrados</p>
                  <button
                    onClick={() => router.push('/tutor/suscripcion/nueva')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white rounded-xl font-semibold transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Inscribir a tu primer hijo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dashboardData?.hijos?.map((hijo) => (
                    <button
                      key={hijo.id}
                      onClick={() => setSelectedHijo(hijo)}
                      className="flex items-center gap-4 p-4 bg-white/5 hover:bg-violet-500/10 border border-white/5 hover:border-violet-500/30 rounded-xl transition-all group text-left"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {hijo.nombre[0]}
                        {hijo.apellido[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white group-hover:text-violet-300 transition-colors truncate">
                          {hijo.nombre} {hijo.apellido}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1 text-sm text-amber-400">
                            <Star className="w-3.5 h-3.5" />
                            {hijo.puntosTotales}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-cyan-400">
                            <BarChart3 className="w-3.5 h-3.5" />
                            {hijo.asistenciaPromedio}%
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-violet-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Próximas Clases */}
            <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Próximas Clases</h2>
              </div>

              {(proximasClases?.clases?.length ?? 0) === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500">Sin clases programadas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {proximasClases?.clases?.slice(0, 5).map((clase) => (
                    <button
                      key={clase.id}
                      onClick={() => setSelectedClase(clase)}
                      className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 rounded-xl transition-all group text-left"
                    >
                      <div className="px-3 py-2 bg-cyan-500/20 rounded-lg shrink-0">
                        <p className="text-xs font-bold text-cyan-400 whitespace-nowrap">
                          {clase.labelFecha}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {clase.estudiante.nombre}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{clase.nombre}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Pagos */}
          <div className="bg-gradient-to-r from-slate-900/80 to-emerald-900/20 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shrink-0">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Historial de Pagos</h3>
                  <p className="text-sm text-slate-400">
                    {(dashboardData?.pagosPendientes?.length ?? 0) > 0
                      ? `Tenés ${dashboardData?.pagosPendientes?.length} pago${(dashboardData?.pagosPendientes?.length ?? 0) > 1 ? 's' : ''} pendiente${(dashboardData?.pagosPendientes?.length ?? 0) > 1 ? 's' : ''}`
                      : 'Todos tus pagos están al día'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPagosModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20"
              >
                Ver historial
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Row 5: Novedades */}
          <div className="bg-gradient-to-r from-slate-900/80 to-violet-900/20 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-6 relative overflow-hidden">
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-pink-500/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-1/2 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-xl" />

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 relative z-10">
              <div className="flex items-center gap-4 flex-1">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-pink-600 rounded-xl shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Novedades y Cursos</h3>
                  <p className="text-sm text-slate-400">
                    Nuevos talleres de verano 2026 disponibles - Robótica, Programación y más
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNovedadesModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-violet-500/20"
              >
                Ver cursos
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modales */}
      {selectedHijo && (
        <HijoDetalleModal
          hijo={selectedHijo}
          onClose={() => setSelectedHijo(null)}
          onUpdate={() => fetchData(false)}
        />
      )}

      {selectedClase && (
        <ClaseDetalleModal clase={selectedClase} onClose={() => setSelectedClase(null)} />
      )}

      {showPagosModal && (
        <PagosHistorialModal
          pagosPendientes={dashboardData?.pagosPendientes ?? []}
          onClose={() => setShowPagosModal(false)}
        />
      )}

      {showNovedadesModal && <NovedadesModal onClose={() => setShowNovedadesModal(false)} />}
    </div>
  );
}
