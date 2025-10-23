'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { AuthUser } from '@/lib/api/auth.api';
import { Estudiante } from '@/types/estudiante';
import { Clase } from '@/types/clases.types';
import { Membresia } from '@/types/pago.types';
import { DashboardResumenResponse } from '@/types/tutor-dashboard.types';
import {
  Users,
  Calendar,
  Clock,
  ChevronRight,
  Home,
  DollarSign,
  UserCheck,
  LogOut,
  ChevronDown,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import MisHijosTab from './MisHijosTab';
import CalendarioTab from './CalendarioTab';
import PagosTab from './PagosTab';
import AyudaTab from './AyudaTab';

interface DashboardViewProps {
  user: AuthUser;
  estudiantes: Estudiante[];
  clases: Clase[];
  membresia: Membresia | null;
  dashboardData: DashboardResumenResponse | null;
}

type TabType = 'dashboard' | 'hijos' | 'calendario' | 'pagos' | 'ayuda';

export default function DashboardView({
  user,
  estudiantes,
  clases,
  membresia,
  dashboardData,
}: DashboardViewProps) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const tabs = [
    { id: 'dashboard', label: 'Resumen', icon: Home },
    { id: 'hijos', label: 'Mis Hijos', icon: Users },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
    { id: 'pagos', label: 'Pagos', icon: DollarSign },
    { id: 'ayuda', label: 'Ayuda', icon: UserCheck },
  ];

  // Calcular estadísticas
  const calcularEdad = (fechaNacimiento: Date) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  // Transformar estudiantes a formato UI
  const hijosData = estudiantes.map((est) => {
    const edad = calcularEdad(new Date(est.fecha_nacimiento));
    const initials = `${est.nombre.charAt(0)}${est.apellido.charAt(0)}`.toUpperCase();

    const proximasClases = clases
      .filter((clase) => clase.inscripciones?.some((insc) => insc.estudiante?.id === est.id))
      .filter((clase) => new Date(clase.fecha_hora_inicio) > new Date())
      .sort((a, b) => new Date(a.fecha_hora_inicio).getTime() - new Date(b.fecha_hora_inicio).getTime());

    const proximaClase = proximasClases[0];

    return {
      id: est.id,
      name: `${est.nombre} ${est.apellido}`,
      age: edad,
      initial: initials,
      xp: 0, // TODO: gamificación
      streak: 0, // TODO: gamificación
      nextClass: proximaClase
        ? new Date(proximaClase.fecha_hora_inicio).toLocaleString('es-AR', {
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })
        : null,
    };
  });

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-300 shadow-md flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
                }}
              >
                🎓
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mateatletas</h1>
                <p className="text-xs text-gray-500">Panel de Padres</p>
              </div>
            </div>
            <div className="flex items-center gap-3 relative">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.nombre} {user?.apellido}</p>
                <p className="text-xs text-gray-500">
                  {membresia?.producto?.nombre || 'Sin membresía'}
                </p>
              </div>

              {/* User Menu Button */}
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
                  }}
                >
                  {user?.nombre?.[0]?.toUpperCase() || 'T'}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  {/* Backdrop para cerrar el menú */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />

                  {/* Menu */}
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-20 overflow-hidden">
                    {/* User Info */}
                    <div className="p-4 border-b-2 border-gray-200 bg-gradient-to-br from-indigo-50 to-blue-50">
                      <p className="text-sm font-bold text-gray-900">
                        {user?.nombre} {user?.apellido}
                      </p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                      <p className="text-xs text-indigo-600 font-semibold mt-1">
                        {membresia?.producto?.nombre || 'Sin membresía'}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-semibold">Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-1 -mb-px overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'dashboard' && (
            <div className="h-full grid grid-rows-[auto_auto_1fr] gap-4">
              {/* Greeting */}
              <div
                className="rounded-xl p-4 shadow-lg border-2 border-indigo-200"
                style={{
                  background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
                }}
              >
                <h2 className="text-2xl font-bold text-white">¡Hola, {user?.nombre}! 👋</h2>
                <p className="text-indigo-100">Bienvenido de vuelta. Aquí está el resumen de hoy.</p>
              </div>

              {/* Stats Cards */}
              <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-300">
                <h2 className="text-base font-bold text-gray-900 mb-3">Métricas Principales</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Total Hijos */}
                  <div className="bg-white rounded-xl p-5 shadow-md border-2 border-gray-200 border-l-4 border-l-indigo-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Hijos</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {dashboardData?.metricas.totalHijos || 0}
                        </p>
                      </div>
                      <Users className="w-10 h-10 text-gray-300" />
                    </div>
                  </div>

                  {/* Clases del Mes */}
                  <div
                    className="rounded-xl p-5 shadow-md border-2 border-indigo-200"
                    style={{
                      background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
                    }}
                  >
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <p className="text-sm font-medium opacity-90">Clases del Mes</p>
                        <p className="text-3xl font-bold">
                          {dashboardData?.metricas.clasesDelMes || 0}
                        </p>
                      </div>
                      <Calendar className="w-10 h-10 opacity-80" />
                    </div>
                  </div>

                  {/* Total Pagado Este Año */}
                  <div
                    className="rounded-xl p-5 shadow-md border-2 border-green-200"
                    style={{
                      background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
                    }}
                  >
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <p className="text-sm font-medium opacity-90">Pagado en {new Date().getFullYear()}</p>
                        <p className="text-2xl font-bold">
                          ${dashboardData?.metricas.totalPagadoAnio.toLocaleString('es-AR') || 0}
                        </p>
                      </div>
                      <DollarSign className="w-10 h-10 opacity-80" />
                    </div>
                  </div>

                  {/* Asistencia Promedio */}
                  <div
                    className="rounded-xl p-5 shadow-md border-2 border-amber-200"
                    style={{
                      background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                    }}
                  >
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <p className="text-sm font-medium opacity-90">Asistencia</p>
                        <p className="text-3xl font-bold">
                          {dashboardData?.metricas.asistenciaPromedio || 0}%
                        </p>
                      </div>
                      <TrendingUp className="w-10 h-10 opacity-80" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Alertas */}
              {dashboardData && dashboardData.alertas.length > 0 && (
                <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-red-200">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h2 className="text-base font-bold text-gray-900">
                      Alertas Importantes ({dashboardData.alertas.length})
                    </h2>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {dashboardData.alertas.slice(0, 5).map((alerta) => (
                      <div
                        key={alerta.id}
                        className={`p-3 rounded-lg border-l-4 ${
                          alerta.prioridad === 'alta'
                            ? 'bg-red-50 border-red-500'
                            : alerta.prioridad === 'media'
                            ? 'bg-amber-50 border-amber-500'
                            : 'bg-blue-50 border-blue-500'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-900">{alerta.titulo}</p>
                            <p className="text-sm text-gray-600">{alerta.mensaje}</p>
                          </div>
                          {alerta.accion && (
                            <button
                              onClick={() => {
                                // Manejar navegación con router si es necesario
                                if (alerta.accion.url.startsWith('/dashboard?tab=')) {
                                  const tab = alerta.accion.url.split('tab=')[1].split('&')[0];
                                  setActiveTab(tab as TabType);
                                }
                              }}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
                            >
                              {alerta.accion.label}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2 Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
                {/* Mis Hijos */}
                <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-300 overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-gray-900">Mis Hijos</h2>
                    <button
                      onClick={() => setActiveTab('hijos')}
                      className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-1"
                    >
                      Ver detalles
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {hijosData.map((hijo) => (
                      <div
                        key={hijo.id}
                        className="bg-gray-50 rounded-xl p-5 shadow-md hover:shadow-xl transition-all border-2 border-gray-200"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md"
                            style={{
                              background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
                            }}
                          >
                            {hijo.initial}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{hijo.name}</h3>
                            <p className="text-sm text-gray-500">{hijo.age} años</p>
                          </div>
                        </div>
                        {hijo.nextClass && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">📅 {hijo.nextClass}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clases de Hoy */}
                <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-300 overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-gray-900">
                      Clases de Hoy ({dashboardData?.clasesHoy.length || 0})
                    </h2>
                    <button
                      onClick={() => setActiveTab('calendario')}
                      className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-1"
                    >
                      Ver calendario
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  {dashboardData && dashboardData.clasesHoy.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.clasesHoy.map((clase) => (
                        <div
                          key={clase.id}
                          className="bg-gray-50 rounded-xl p-5 shadow-md hover:shadow-xl transition-all border-2 border-gray-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div
                                className="w-16 h-16 rounded-lg flex flex-col items-center justify-center text-white shadow-md"
                                style={{
                                  background: clase.colorRuta
                                    ? `linear-gradient(135deg, ${clase.colorRuta} 0%, ${clase.colorRuta}dd 100%)`
                                    : 'linear-gradient(135deg, #6366F1 0%, #6366F1dd 100%)',
                                }}
                              >
                                <Clock className="w-5 h-5 mb-1" />
                                <span className="font-bold text-sm">{clase.hora}</span>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-gray-900">{clase.nombreRuta}</h3>
                                <p className="text-sm text-gray-600">
                                  {clase.estudianteNombre} • Prof. {clase.docenteNombre}
                                </p>
                              </div>
                            </div>
                            <button
                              disabled={!clase.puedeUnirse}
                              className={`font-semibold py-2 px-4 rounded-lg shadow-md transition-all text-sm text-white ${
                                clase.puedeUnirse
                                  ? 'hover:shadow-lg'
                                  : 'opacity-50 cursor-not-allowed'
                              }`}
                              style={{
                                background: clase.puedeUnirse
                                  ? 'linear-gradient(135deg, #34D399 0%, #10B981 100%)'
                                  : 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
                              }}
                            >
                              {clase.puedeUnirse ? 'Unirse' : 'Próximamente'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No hay clases programadas para hoy</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mis Hijos Tab */}
          {activeTab === 'hijos' && <MisHijosTab estudiantes={estudiantes} />}

          {/* Calendario Tab */}
          {activeTab === 'calendario' && <CalendarioTab />}

          {/* Pagos Tab */}
          {activeTab === 'pagos' && <PagosTab />}

          {/* Ayuda Tab */}
          {activeTab === 'ayuda' && <AyudaTab />}
        </div>
      </main>
    </div>
  );
}
