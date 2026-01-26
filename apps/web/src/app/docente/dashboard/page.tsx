'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import {
  docentesApi,
  notificacionesApi,
  ComisionResumen,
  GrupoResumen,
  EstudianteConFalta,
} from '@/lib/api/docentes.api';
import { toast } from '@/components/ui/Toast';
import { LoadingSpinner } from '@/components/ui';

// Components
import { Sidebar } from '@/components/docente/Sidebar';
import { LiveClassPage } from '@/components/docente/LiveClassPage';
import { NotificationsDropdown } from '@/components/docente/NotificationsDropdown';

// New Glassmorphism Views
import { HoyView } from '@/components/docente/views/HoyView';
import { GruposView } from '@/components/docente/views/GruposView';
import { CalendarioView } from '@/components/docente/views/CalendarioView';

// Types
import { Comision, DashboardStats, Alerta } from '@/types/docente.types';

/**
 * Dashboard Docente - TeacherDash Pro Design
 * Replica exacta del App.tsx original adaptado a Next.js
 */
export default function DocenteDashboard(): React.ReactNode {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState<string>('');
  const [currentView, setCurrentView] = useState<string>('hoy');
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
  const [liveComisionId, setLiveComisionId] = useState<string | null>(null);

  // Data from API
  const [comisiones, setComisiones] = useState<Comision[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

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
    fetchNotificationCount();
  }, []);

  // Polling para badge de notificaciones cada 60 segundos
  useEffect(() => {
    const interval = setInterval(fetchNotificationCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const response = await notificacionesApi.getCountNoLeidas();
      setNotificationCount(response.count);
    } catch (error) {
      console.error('Error al obtener contador de notificaciones:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await docentesApi.getDashboard();

      // Transform misComisiones (cursos, colonias, etc.)
      const transformedComisiones: Comision[] = (response.misComisiones || []).map(
        (c: ComisionResumen) => ({
          id: c.id,
          producto: c.nombre || c.producto?.nombre || 'Sin nombre',
          horario: c.horario || 'Sin horario',
          casa: c.casa?.nombre || 'VERTEX',
          inscripciones: c.estudiantesInscritos || 0,
          cupoMaximo: c.cupoMaximo || 20,
          thumbnail: `https://picsum.photos/seed/${c.id}/800/600`,
          proximaClase: undefined,
        }),
      );

      // Transform misGrupos (ClaseGrupos con día/hora fija)
      const transformedGrupos: Comision[] = (response.misGrupos || []).map((g: GrupoResumen) => ({
        id: g.id,
        producto: g.nombre || g.codigo || 'Sin nombre',
        horario:
          `${g.diaSemana || ''} ${g.horaInicio || ''} - ${g.horaFin || ''}`.trim() || 'Sin horario',
        casa: 'VERTEX', // Default casa for grupos
        inscripciones: g.estudiantesActivos || 0,
        cupoMaximo: g.cupoMaximo || 20,
        thumbnail: `https://picsum.photos/seed/${g.id}/800/600`,
        proximaClase: undefined,
      }));

      // Merge both: grupos primero (tienen horario fijo), luego comisiones
      const allClases = [...transformedGrupos, ...transformedComisiones];

      const transformedStats: DashboardStats = {
        clasesSemana: response.stats?.clasesEstaSemana || 0,
        totalEstudiantes: response.stats?.estudiantesTotal || 0,
        asistenciaPromedio: response.stats?.asistenciaPromedio || 0,
        puntosOtorgados: response.stats?.puntosOtorgados || 0,
      };

      // Transform alerts from students with attendance issues
      const transformedAlertas: Alerta[] = (response.estudiantesConFaltas || [])
        .slice(0, 5)
        .map((e: EstudianteConFalta, i: number) => ({
          id: `alert-${i}`,
          tipo: 'asistencia',
          severidad: e.faltasConsecutivas >= 3 ? 'alta' : ('media' as 'alta' | 'media'),
          mensaje: `Tiene ${e.faltasConsecutivas} faltas consecutivas en ${e.ultimoGrupo}`,
          estudiante: `${e.nombre} ${e.apellido}`,
          comisionId: e.id,
        }));

      setComisiones(allClases);
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
    // Reset selected commission if navigating away from grupos tab
    if (view !== 'grupos') {
      setSelectedComisionId(null);
    }
  };

  const handleSelectComision = (id: string) => {
    setSelectedComisionId(id);
    setCurrentView('grupos');
  };

  const handleStartLiveClass = (comisionId: string) => {
    setLiveComisionId(comisionId);
    setCurrentView('live');
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
      {/* 1. Header Area */}
      <header
        ref={headerRef}
        className="shrink-0 bg-[#020617]/50 border-b border-slate-800/50 px-6 py-2 flex items-center justify-between z-50 relative backdrop-blur-md"
      >
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => handleNavigate('hoy')}
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
            className={`relative p-2.5 rounded-full transition-all duration-300 group ${showNotifications ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'} active:scale-90`}
          >
            <Bell
              size={22}
              className="transition-transform duration-300 group-active:rotate-12 group-hover:scale-110"
            />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full ring-2 ring-[#020617]">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <NotificationsDropdown
              onClose={() => setShowNotifications(false)}
              onNotificationsUpdated={fetchNotificationCount}
            />
          )}

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
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        notificationCount={notificationCount}
      />

      {/* 3. Main Content */}
      <main className="flex-1 min-h-0 p-6 lg:p-8 overflow-hidden w-full relative">
        {currentView === 'hoy' ? (
          <HoyView
            greeting={greeting}
            userName={user?.nombre || 'Docente'}
            currentDateStr={currentDateStr}
            stats={stats}
            comisiones={comisiones}
            alertas={alertas}
            onStartLiveClass={handleStartLiveClass}
            onSelectComision={handleSelectComision}
          />
        ) : currentView === 'grupos' ? (
          <GruposView
            comisiones={comisiones}
            selectedComisionId={selectedComisionId}
            onSelectComision={setSelectedComisionId}
            onStartLiveClass={handleStartLiveClass}
          />
        ) : currentView === 'calendario' ? (
          <CalendarioView />
        ) : currentView === 'live' ? (
          <LiveClassPage comisionId={liveComisionId ?? undefined} />
        ) : (
          <HoyView
            greeting={greeting}
            userName={user?.nombre || 'Docente'}
            currentDateStr={currentDateStr}
            stats={stats}
            comisiones={comisiones}
            alertas={alertas}
            onStartLiveClass={handleStartLiveClass}
            onSelectComision={handleSelectComision}
          />
        )}
      </main>
    </div>
  );
}
