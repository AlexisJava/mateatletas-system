'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { AuthUser } from '@/lib/api/auth.api';
import { Estudiante } from '@/types/estudiante';
import { Clase } from '@/types/clases.types';
import { DashboardResumenResponse } from '@/types/tutor-dashboard.types';
import {
  Users,
  Calendar,
  Home,
  DollarSign,
  HelpCircle,
  LogOut,
  ChevronDown,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  Bell,
  ChevronRight,
} from 'lucide-react';
import MisHijosTab from './MisHijosTab';
import CalendarioTab from './CalendarioTab';
import PagosTab from './PagosTab';
import AyudaTab from './AyudaTab';

interface DashboardViewProps {
  user: AuthUser;
  estudiantes: Estudiante[];
  clases: Clase[];
  dashboardData: DashboardResumenResponse | null;
}

type TabType = 'dashboard' | 'hijos' | 'calendario' | 'pagos' | 'ayuda';

/**
 * DashboardView - Vista principal del dashboard del tutor
 *
 * Muestra 5 tabs:
 * 1. Dashboard (resumen)
 * 2. Mis Hijos
 * 3. Calendario
 * 4. Pagos
 * 5. Ayuda
 */
export default function DashboardView({
  user,
  estudiantes,
  clases,
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
    { id: 'ayuda', label: 'Ayuda', icon: HelpCircle },
  ];

  /**
   * Formatea un número como moneda argentina
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
                <p className="text-sm font-semibold text-gray-900">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="text-xs text-gray-500">Tutor</p>
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
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />

                  {/* Menu */}
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-20 overflow-hidden">
                    {/* User Info */}
                    <div className="p-4 border-b-2 border-gray-200 bg-gradient-to-br from-indigo-50 to-blue-50">
                      <p className="text-sm font-bold text-gray-900">
                        {user?.nombre} {user?.apellido}
                      </p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                      <p className="text-xs text-indigo-600 font-semibold mt-1">Tutor</p>
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
          {/* TAB: Dashboard (Resumen) */}
          {activeTab === 'dashboard' && (
            <div className="h-full flex flex-col gap-4 overflow-hidden">
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

              {/* Métricas Principales */}
              {dashboardData && (
                <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-300">
                  <h2 className="text-base font-bold text-gray-900 mb-3">Métricas del Mes</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Total Hijos */}
                    <div
                      className="rounded-xl p-5 shadow-md border-2 border-indigo-200"
                      style={{
                        background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
                      }}
                    >
                      <div className="flex items-center justify-between text-white">
                        <div>
                          <p className="text-sm font-medium opacity-90">Mis Hijos</p>
                          <p className="text-3xl font-bold">{dashboardData.metricas.totalHijos}</p>
                        </div>
                        <Users className="w-10 h-10 opacity-80" />
                      </div>
                    </div>

                    {/* Clases del Mes */}
                    <div className="bg-white rounded-xl p-5 shadow-md border-2 border-gray-200 border-l-4 border-l-green-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Clases del Mes</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {dashboardData.metricas.clasesDelMes}
                          </p>
                        </div>
                        <Calendar className="w-10 h-10 text-gray-300" />
                      </div>
                    </div>

                    {/* Total Pagado Año */}
                    <div className="bg-white rounded-xl p-5 shadow-md border-2 border-gray-200 border-l-4 border-l-amber-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Pagado (año)</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(dashboardData.metricas.totalPagadoAnio)}
                          </p>
                        </div>
                        <DollarSign className="w-10 h-10 text-gray-300" />
                      </div>
                    </div>

                    {/* Asistencia Promedio */}
                    <div
                      className="rounded-xl p-5 shadow-md border-2 border-green-200"
                      style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      }}
                    >
                      <div className="flex items-center justify-between text-white">
                        <div>
                          <p className="text-sm font-medium opacity-90">Asistencia</p>
                          <p className="text-3xl font-bold">
                            {dashboardData.metricas.asistenciaPromedio}%
                          </p>
                        </div>
                        <TrendingUp className="w-10 h-10 opacity-80" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Alertas */}
              {dashboardData && dashboardData.alertas.length > 0 && (
                <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-300">
                  <div className="flex items-center gap-2 mb-3">
                    <Bell className="w-5 h-5 text-amber-600" />
                    <h2 className="text-lg font-bold text-gray-900">Alertas</h2>
                  </div>
                  <div className="space-y-2">
                    {dashboardData.alertas.slice(0, 3).map((alerta) => {
                      const prioridadStyles = {
                        alta: 'bg-red-50 border-red-300 text-red-900',
                        media: 'bg-yellow-50 border-yellow-300 text-yellow-900',
                        baja: 'bg-blue-50 border-blue-300 text-blue-900',
                      };

                      const iconConfig = {
                        alta: AlertTriangle,
                        media: Clock,
                        baja: Bell,
                      };

                      const Icon = iconConfig[alerta.prioridad];

                      return (
                        <div
                          key={alerta.id}
                          className={`p-3 rounded-lg border-2 ${prioridadStyles[alerta.prioridad]}`}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-semibold">{alerta.titulo}</p>
                              <p className="text-sm opacity-90">{alerta.mensaje}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Layout de 2 columnas - Clases de Hoy y Pagos Pendientes */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
                {/* Clases de Hoy */}
                <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-300 overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-gray-900">Clases de Hoy</h2>
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
                          className="bg-gray-50 rounded-xl p-4 shadow-md hover:shadow-lg transition-all border-2 border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-14 h-14 rounded-lg flex flex-col items-center justify-center text-white shadow-md flex-shrink-0"
                              style={{
                                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                              }}
                            >
                              <Clock className="w-4 h-4 mb-1" />
                              <span className="font-bold text-sm">{clase.hora}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900">{clase.nombreRuta}</h3>
                              <p className="text-sm text-gray-600">
                                {clase.estudianteNombre} • {clase.docenteNombre}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mb-2 text-gray-300" />
                      <p>No hay clases programadas para hoy</p>
                    </div>
                  )}
                </div>

                {/* Pagos Pendientes */}
                <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-300 overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-gray-900">Pagos Pendientes</h2>
                    <button
                      onClick={() => setActiveTab('pagos')}
                      className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-1"
                    >
                      Ver todos
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {dashboardData && dashboardData.pagosPendientes.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.pagosPendientes.slice(0, 5).map((pago) => (
                        <div
                          key={pago.id}
                          className={`bg-gray-50 rounded-xl p-4 shadow-md border-2 ${
                            pago.estaVencido
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-200'
                          } hover:shadow-lg transition-all`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900">{pago.concepto}</h3>
                              <p className="text-sm text-indigo-600">{pago.estudianteNombre}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {pago.estaVencido
                                  ? `Vencido hace ${Math.abs(pago.diasParaVencer)} ${Math.abs(pago.diasParaVencer) === 1 ? 'día' : 'días'}`
                                  : `Vence en ${pago.diasParaVencer} ${pago.diasParaVencer === 1 ? 'día' : 'días'}`}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                {formatCurrency(pago.monto)}
                              </p>
                              {pago.estaVencido && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                                  Vencido
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <CheckCircle2 className="w-12 h-12 mb-2 text-green-400" />
                      <p className="font-semibold text-green-600">¡Todo al día!</p>
                      <p className="text-sm">No hay pagos pendientes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Mis Hijos */}
          {activeTab === 'hijos' && <MisHijosTab estudiantes={estudiantes} />}

          {/* TAB: Calendario */}
          {activeTab === 'calendario' && <CalendarioTab />}

          {/* TAB: Pagos */}
          {activeTab === 'pagos' && <PagosTab />}

          {/* TAB: Ayuda */}
          {activeTab === 'ayuda' && <AyudaTab />}
        </div>
      </main>
    </div>
  );
}
