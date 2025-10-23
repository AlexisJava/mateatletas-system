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
  Home,
  DollarSign,
  HelpCircle,
  LogOut,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  CreditCard,
  TrendingUp,
  Bell,
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
    { id: 'dashboard', label: 'Inicio', icon: Home },
    { id: 'hijos', label: 'Mis Hijos', icon: Users },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
    { id: 'pagos', label: 'Pagos', icon: DollarSign },
    { id: 'ayuda', label: 'Ayuda', icon: HelpCircle },
  ];

  // Calcular edad para cada hijo
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

  // Obtener fecha formateada
  const fechaHoy = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Alertas críticas (solo alta prioridad)
  const alertasCriticas = dashboardData?.alertas.filter(a => a.prioridad === 'alta') || [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      {/* Header oscuro premium */}
      <header className="bg-gray-900 border-b border-gray-800 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between py-5">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
                🎓
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Mateatletas</h1>
                <p className="text-xs text-gray-400">Portal de Padres</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4 relative">
              {/* Notificaciones */}
              {alertasCriticas.length > 0 && (
                <div className="relative">
                  <Bell className="w-6 h-6 text-gray-400" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {alertasCriticas.length}
                  </span>
                </div>
              )}

              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 bg-gray-800 hover:bg-gray-750 rounded-xl px-4 py-2 transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-white">{user?.nombre} {user?.apellido}</p>
                  <p className="text-xs text-gray-400">Padre/Madre</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                  {user?.nombre?.[0]?.toUpperCase() || 'T'}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute top-full right-0 mt-2 w-64 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 z-20 overflow-hidden">
                    <div className="p-4 border-b border-gray-700 bg-gray-850">
                      <p className="text-sm font-bold text-white">
                        {user?.nombre} {user?.apellido}
                      </p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:bg-gray-750 rounded-lg transition-colors"
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
          <nav className="flex gap-2 -mb-px overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-white bg-gray-850'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-850'
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
        <div className="h-full max-w-7xl mx-auto px-6 lg:px-8 py-4">
          {activeTab === 'dashboard' && (
            <div className="h-full grid grid-rows-[auto_1fr] gap-3">
              {/* Greeting */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-5 shadow-xl">
                <h2 className="text-2xl font-bold text-white">
                  ¡Hola, {user?.nombre}! 👋
                </h2>
                <p className="text-indigo-100 capitalize">{fechaHoy}</p>
              </div>

              {/* Grid principal: 2 columnas */}
              <div className="grid grid-cols-3 gap-3 h-full">
                {/* Columna izquierda: 2/3 del ancho */}
                <div className="col-span-2 grid grid-rows-[auto_1fr] gap-3">
                  {/* Alertas CRÍTICAS O Clases HOY */}
                  {alertasCriticas.length > 0 ? (
                    <div className="bg-red-900/20 border-2 border-red-500/50 rounded-xl p-4 shadow-xl">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-7 h-7 text-red-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-red-300 mb-2">
                            ⚠️ Atención Urgente
                          </h3>
                          <div className="space-y-2">
                            {alertasCriticas.slice(0, 2).map((alerta) => (
                              <div
                                key={alerta.id}
                                className="bg-gray-900/50 rounded-lg p-3 border border-red-500/30 flex items-center justify-between gap-3"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-white mb-0.5">{alerta.titulo}</p>
                                  <p className="text-gray-300 text-sm">{alerta.mensaje}</p>
                                </div>
                                {alerta.accion && (
                                  <button
                                    onClick={() => {
                                      if (alerta.accion?.url.startsWith('/dashboard?tab=')) {
                                        const tab = alerta.accion.url.split('tab=')[1].split('&')[0];
                                        setActiveTab(tab as TabType);
                                      }
                                    }}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded-lg transition-colors whitespace-nowrap shadow-lg text-sm"
                                  >
                                    {alerta.accion.label}
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : dashboardData && dashboardData.clasesHoy.length > 0 ? (
                    <div className="bg-gray-900 rounded-xl p-4 shadow-xl border border-gray-800">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-lg font-bold text-white">
                          📅 Clases de Hoy
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {dashboardData.clasesHoy.slice(0, 2).map((clase) => (
                          <div
                            key={clase.id}
                            className="bg-gray-850 rounded-lg p-3 border border-gray-700 flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-3 flex flex-col items-center justify-center min-w-[60px] shadow-lg">
                                <Clock className="w-4 h-4 text-white mb-0.5" />
                                <span className="font-bold text-white text-sm">{clase.hora}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-white mb-0.5 truncate">{clase.nombreRuta}</h4>
                                <p className="text-gray-400 text-sm truncate">
                                  👤 {clase.estudianteNombre}
                                </p>
                              </div>
                            </div>
                            <button
                              disabled={!clase.puedeUnirse}
                              className={`flex items-center gap-2 font-bold py-2 px-5 rounded-lg shadow-lg transition-all ${
                                clase.puedeUnirse
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              <PlayCircle className="w-5 h-5" />
                              {clase.puedeUnirse ? 'UNIRSE' : 'Pronto'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-800 flex items-center justify-center">
                      <div className="text-center">
                        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-2" />
                        <h3 className="text-xl font-bold text-white mb-1">✅ Todo al día</h3>
                        <p className="text-gray-400">Sin acciones pendientes</p>
                      </div>
                    </div>
                  )}

                  {/* Pagos Pendientes O Hijos */}
                  {dashboardData && dashboardData.pagosPendientes.length > 0 ? (
                    <div className="bg-gray-900 rounded-xl p-4 shadow-xl border border-gray-800 overflow-hidden">
                      <div className="flex items-center gap-2 mb-3">
                        <CreditCard className="w-5 h-5 text-amber-400" />
                        <h3 className="text-lg font-bold text-white">
                          💰 Pagos Pendientes
                        </h3>
                      </div>
                      <div className="space-y-2 max-h-[calc(100%-2.5rem)] overflow-y-auto">
                        {dashboardData.pagosPendientes.slice(0, 3).map((pago) => (
                          <div
                            key={pago.id}
                            className={`rounded-lg p-3 border-2 flex items-center justify-between gap-4 ${
                              pago.estaVencido
                                ? 'bg-red-900/20 border-red-500/50'
                                : 'bg-gray-850 border-gray-700'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {pago.estaVencido ? (
                                  <AlertTriangle className="w-5 h-5 text-red-400" />
                                ) : (
                                  <Clock className="w-5 h-5 text-amber-400" />
                                )}
                                <h4 className="font-bold text-white text-lg">
                                  ${pago.monto.toLocaleString('es-AR')}
                                </h4>
                              </div>
                              <p className="text-gray-400 text-sm mb-0.5 truncate">{pago.concepto}</p>
                              <p className={`text-xs font-semibold ${
                                pago.estaVencido ? 'text-red-400' : 'text-amber-400'
                              }`}>
                                {pago.estaVencido
                                  ? `Vencido hace ${Math.abs(pago.diasParaVencer)}d`
                                  : `Vence en ${pago.diasParaVencer}d`
                                }
                              </p>
                            </div>
                            <button
                              onClick={() => setActiveTab('pagos')}
                              className={`font-bold py-2 px-5 rounded-lg shadow-lg transition-colors whitespace-nowrap ${
                                pago.estaVencido
                                  ? 'bg-red-600 hover:bg-red-700 text-white'
                                  : 'bg-amber-600 hover:bg-amber-700 text-white'
                              }`}
                            >
                              PAGAR
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-900 rounded-xl p-4 shadow-xl border border-gray-800 overflow-hidden">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-bold text-white">
                          👨‍👩‍👧 Mis Hijos ({estudiantes.length})
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-[calc(100%-2.5rem)] overflow-y-auto">
                        {estudiantes.map((hijo) => {
                          const edad = calcularEdad(new Date(hijo.fecha_nacimiento));
                          const initials = `${hijo.nombre.charAt(0)}${hijo.apellido.charAt(0)}`.toUpperCase();
                          return (
                            <div
                              key={hijo.id}
                              className="bg-gray-850 rounded-lg p-3 border border-gray-700 hover:border-purple-500/50 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                                  {initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-white text-sm truncate">
                                    {hijo.nombre}
                                  </h4>
                                  <p className="text-gray-400 text-xs">{edad} años</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Columna derecha: Estadísticas */}
                <div className="grid grid-rows-3 gap-3">
                  <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-4 shadow-xl flex flex-col justify-between">
                    <div>
                      <p className="text-blue-100 text-xs font-medium mb-1">Clases este mes</p>
                      <p className="text-white text-3xl font-bold">
                        {dashboardData?.metricas.clasesDelMes || 0}
                      </p>
                    </div>
                    <Calendar className="w-10 h-10 text-white/80 self-end" />
                  </div>

                  <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-4 shadow-xl flex flex-col justify-between">
                    <div>
                      <p className="text-green-100 text-xs font-medium mb-1">Pagado {new Date().getFullYear()}</p>
                      <p className="text-white text-2xl font-bold">
                        ${(dashboardData?.metricas.totalPagadoAnio || 0).toLocaleString('es-AR', {notation: 'compact'})}
                      </p>
                    </div>
                    <DollarSign className="w-10 h-10 text-white/80 self-end" />
                  </div>

                  <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl p-4 shadow-xl flex flex-col justify-between">
                    <div>
                      <p className="text-amber-100 text-xs font-medium mb-1">Asistencia</p>
                      <div className="flex items-end gap-1">
                        <p className="text-white text-3xl font-bold">
                          {dashboardData?.metricas.asistenciaPromedio || 0}%
                        </p>
                        {(dashboardData?.metricas.asistenciaPromedio || 0) >= 80 && (
                          <CheckCircle2 className="w-6 h-6 text-white mb-1" />
                        )}
                      </div>
                    </div>
                    <TrendingUp className="w-10 h-10 text-white/80 self-end" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Otros Tabs */}
          {activeTab === 'hijos' && <MisHijosTab estudiantes={estudiantes} />}
          {activeTab === 'calendario' && <CalendarioTab />}
          {activeTab === 'pagos' && <PagosTab />}
          {activeTab === 'ayuda' && <AyudaTab />}
        </div>
      </main>
    </div>
  );
}
