'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Radio, LogOut, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { docentesApi, ComisionResumen, EstudianteConFalta } from '@/lib/api/docentes.api';
import { toast } from '@/components/ui/Toast';
import { LoadingSpinner } from '@/components/effects';

// New Components
import { Sidebar } from '@/components/docente/Sidebar';
import { LiveClassPage } from '@/components/docente/LiveClassPage';
import { StudentList } from '@/components/docente/StudentList';
import { CalendarPage } from '@/components/docente/CalendarPage';
import { PlanificacionesPage } from '@/components/docente/PlanificacionesPage';
import { AlertsPage } from '@/components/docente/AlertsPage';
import { NotificationsDropdown } from '@/components/docente/NotificationsDropdown';
import { DarkVeil } from '@/components/docente/DarkVeil';
import { DashboardModal } from '@/components/docente/DashboardModals';
import { ProximaClaseCard } from '@/components/docente/ProximaClaseCard';
import { StatsDocente } from '@/components/docente/StatsDocente';
import { ComisionesGrid } from '@/components/docente/ComisionesGrid';

// Types
import { Comision, DashboardStats, Alerta } from '@/types/docente.types';

/**
 * Dashboard Docente - TeacherDash Pro Design
 * Replica exacta del App.tsx original adaptado a Next.js
 */
export default function DocenteDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState<string>('');
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    return '--:--';
  });
  const [showNotifications, setShowNotifications] = useState(false);

  // Navigation State
  const [selectedComisionId, setSelectedComisionId] = useState<string | null>(null);

  // Dashboard Interaction State
  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  // Data from API
  const [comisiones, setComisiones] = useState<Comision[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alertas, setAlertas] = useState<Alerta[]>([]);

  // Close dropdown when clicking outside
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const date = new Date();
    const hour = date.getHours();
    if (hour < 12) setGreeting('Buenos dias');
    else if (hour < 19) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const formattedDate = date.toLocaleDateString('es-ES', options);
    setCurrentDateStr(formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1));

    // Actualizar hora inicial
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await docentesApi.getDashboard();

      // Transform API data to component format
      const transformedComisiones: Comision[] = (response.misComisiones || []).map(
        (c: ComisionResumen) => ({
          id: c.id,
          producto: c.nombre || c.producto?.nombre || 'Sin nombre',
          horario: c.horario || 'Sin horario',
          casa: c.casa?.nombre || 'VERTEX',
          inscripciones: c.estudiantesInscritos || 0,
          cupo_maximo: c.cupo_maximo || 20,
          thumbnail: `https://picsum.photos/seed/${c.id}/800/600`,
          proximaClase: undefined,
        }),
      );

      const transformedStats: DashboardStats = {
        clasesSemana: response.stats?.clasesEstaSemana || 0,
        totalEstudiantes: response.stats?.estudiantesTotal || 0,
        asistenciaPromedio: response.stats?.asistenciaPromedio || 0,
        puntosOtorgados: 0,
      };

      // Transform alerts from students with attendance issues
      const transformedAlertas: Alerta[] = (response.estudiantesConFaltas || [])
        .slice(0, 5)
        .map((e: EstudianteConFalta, i: number) => ({
          id: `alert-${i}`,
          tipo: 'asistencia',
          severidad: e.faltas_consecutivas >= 3 ? 'alta' : ('media' as 'alta' | 'media'),
          mensaje: `Tiene ${e.faltas_consecutivas} faltas consecutivas en ${e.ultimo_grupo}`,
          estudiante: `${e.nombre} ${e.apellido}`,
          comision_id: e.id,
        }));

      setComisiones(transformedComisiones);
      setStats(transformedStats);
      setAlertas(transformedAlertas);
    } catch (error) {
      console.error('Error al cargar el dashboard:', error);
      toast.error('Error al cargar el dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for navigation
  const handleNavigate = (view: string) => {
    setCurrentView(view);
    // Reset selected commission if navigating away from commissions tab
    if (view !== 'comisiones') {
      setSelectedComisionId(null);
    }
  };

  const handleSelectComision = (id: string) => {
    setSelectedComisionId(id);
    setCurrentView('comisiones');
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando dashboard..." />
      </div>
    );
  }

  return (
    <div className="h-full w-full text-slate-200 font-sans overflow-hidden flex flex-col relative z-0">
      {/* Background Effect */}
      <div className="absolute inset-0 -z-10 opacity-60">
        <DarkVeil
          hueShift={25}
          noiseIntensity={0}
          scanlineIntensity={0.1}
          speed={0.8}
          scanlineFrequency={42}
          warpAmount={0.6}
          resolutionScale={1.5}
        />
      </div>

      {/* 1. Header Area */}
      <header
        ref={headerRef}
        className="shrink-0 bg-[#020617]/50 border-b border-slate-800/50 px-6 py-2 flex items-center justify-between z-50 relative backdrop-blur-md"
      >
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => handleNavigate('dashboard')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="font-bold text-white text-xl">M</span>
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-none">
              Mateatletas
            </h1>
            <span className="text-xs text-slate-500 font-medium">Panel Docente</span>
          </div>
        </div>

        {/* Reloj Digital */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-900/60 border border-slate-700/50 rounded-xl backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"></div>
          <span className="text-lg font-mono font-bold text-white tracking-wider tabular-nums">
            {currentTime}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2.5 rounded-full transition-colors group ${showNotifications ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <Bell size={22} />
            {alertas.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-[#020617] animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <NotificationsDropdown
              alertas={alertas}
              onClose={() => setShowNotifications(false)}
              onViewAll={() => handleNavigate('alerts')}
            />
          )}

          <div className="h-10 w-[1px] bg-slate-800 mx-1"></div>

          <div
            className={`flex items-center gap-3 bg-indigo-950/30 border pl-1.5 pr-5 py-1.5 rounded-full cursor-pointer transition-all group ${
              currentView === 'live'
                ? 'border-indigo-500 bg-indigo-900/50'
                : 'border-indigo-500/20 hover:bg-indigo-900/40'
            }`}
            onClick={() => handleNavigate('live')}
          >
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-inner ${currentView === 'live' ? 'bg-red-600' : 'bg-indigo-600'}`}
              >
                <Radio size={18} className="text-white animate-pulse" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#020617] rounded-full"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-none mb-0.5 group-hover:text-indigo-300 transition-colors">
                Clases en Vivo
              </span>
              <span className="text-xs text-indigo-300/70 font-medium">Transmitiendo ahora</span>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-slate-800 mx-1"></div>

          {/* Botón Cerrar Sesión */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
            <span className="hidden lg:inline text-sm font-medium">Salir</span>
          </button>
        </div>
      </header>

      {/* 2. Navbar (Horizontal Sidebar) */}
      <Sidebar currentView={currentView} onNavigate={handleNavigate} />

      {/* 3. Main Content */}
      <main className="flex-1 min-h-0 p-6 lg:p-8 overflow-hidden w-full flex flex-col gap-6 relative">
        {currentView === 'dashboard' ? (
          <>
            {/* Top Section: Greeting & Quick Stats */}
            <div className="shrink-0 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                    {greeting}, {user?.nombre || 'Docente'}
                  </h2>
                  <p className="text-base text-slate-400 capitalize mt-1">{currentDateStr}</p>
                </div>
              </div>
              {stats && <StatsDocente stats={stats} onStatClick={setSelectedStat} />}
            </div>

            {/* Dashboard Grid - usa grid-rows para altura fija */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 grid-rows-1 gap-8">
              {/* Left Column (Next Class) - 8/12 */}
              <div className="lg:col-span-8 h-full min-h-0 overflow-hidden">
                {comisiones.length > 0 ? (
                  <ProximaClaseCard comision={comisiones[0] ?? null} />
                ) : (
                  <div className="h-full flex items-center justify-center bg-slate-900/40 border border-slate-800 rounded-2xl">
                    <p className="text-slate-500">No hay comisiones asignadas</p>
                  </div>
                )}
              </div>

              {/* Right Column (My Commissions Grid) - 4/12 */}
              <div className="lg:col-span-4 h-full min-h-0 overflow-hidden">
                <ComisionesGrid comisiones={comisiones} onSelect={handleSelectComision} />
              </div>
            </div>

            {/* Interactive Modals Layer */}
            <DashboardModal type={selectedStat} onClose={() => setSelectedStat(null)} />
          </>
        ) : currentView === 'live' ? (
          <LiveClassPage />
        ) : currentView === 'alerts' ? (
          <AlertsPage />
        ) : currentView === 'comisiones' ? (
          selectedComisionId ? (
            <StudentList
              comisionId={selectedComisionId}
              onBack={() => setSelectedComisionId(null)}
            />
          ) : (
            <div className="flex flex-col h-full gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Selecciona una Comision</h2>
                <div className="text-sm text-slate-400">
                  Mostrando {comisiones.length} cursos activos
                </div>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {comisiones.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectComision(c.id)}
                      className="cursor-pointer h-full"
                    >
                      <ComisionesGrid comisiones={[c]} onSelect={handleSelectComision} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        ) : currentView === 'calendar' ? (
          <CalendarPage />
        ) : currentView === 'plannings' ? (
          <PlanificacionesPage />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <p>Seccion en construccion</p>
            <button
              onClick={() => handleNavigate('dashboard')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
            >
              Volver
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
