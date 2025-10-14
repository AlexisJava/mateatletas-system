'use client';

import { useState } from 'react';
import {
  Users,
  Calendar,
  Trophy,
  BookOpen,
  Plus,
  Star,
  Clock,
  CreditCard,
  CheckCircle,
  ChevronRight,
  Home,
  DollarSign,
  UserCheck,
  Zap,
  Download,
} from 'lucide-react';

interface DashboardViewProps {
  user: any;
  estudiantes: any[];
  clases: any[];
  membresia: any | null;
}

type TabType = 'dashboard' | 'hijos' | 'calendario' | 'pagos' | 'ayuda';

export default function DashboardView({
  user,
  estudiantes,
  clases,
  membresia,
}: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

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

  // Clases de hoy
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  const clasesHoy = clases.filter((clase) => {
    const fechaClase = new Date(clase.fecha_hora_inicio);
    return fechaClase >= hoy && fechaClase < manana;
  });

  // Transformar estudiantes a formato UI
  const hijosData = estudiantes.map((est) => {
    const edad = calcularEdad(est.fecha_nacimiento);
    const initials = `${est.nombre.charAt(0)}${est.apellido.charAt(0)}`.toUpperCase();

    const proximasClases = clases
      .filter((clase) => clase.inscripciones.some((insc: any) => insc.estudiante.id === est.id))
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
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.nombre} {user?.apellido}</p>
                <p className="text-xs text-gray-500">
                  {membresia?.producto?.nombre || 'Sin membresía'}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
                }}
              >
                {user?.nombre?.[0]?.toUpperCase() || 'T'}
              </div>
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
                <h2 className="text-base font-bold text-gray-900 mb-3">Resumen de Hoy</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div
                    className="rounded-xl p-5 shadow-md border-2 border-indigo-200"
                    style={{
                      background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
                    }}
                  >
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <p className="text-sm font-medium opacity-90">Clases Hoy</p>
                        <p className="text-3xl font-bold">{clasesHoy.length}</p>
                      </div>
                      <Calendar className="w-10 h-10 opacity-80" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-md border-2 border-gray-200 border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Estado Pago</p>
                        <p className="text-lg font-bold text-green-600 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          {membresia?.estado === 'Activa' ? 'Al día' : 'Inactiva'}
                        </p>
                      </div>
                      <CreditCard className="w-10 h-10 text-gray-300" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-md border-2 border-gray-200 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Hijos</p>
                        <p className="text-3xl font-bold text-gray-900">{estudiantes.length}</p>
                      </div>
                      <Users className="w-10 h-10 text-gray-300" />
                    </div>
                  </div>

                  <div
                    className="rounded-xl p-5 shadow-md border-2 border-amber-200"
                    style={{
                      background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                    }}
                  >
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <p className="text-sm font-medium opacity-90">Clases Totales</p>
                        <p className="text-3xl font-bold">{clases.length}</p>
                      </div>
                      <Star className="w-10 h-10 opacity-80" />
                    </div>
                  </div>
                </div>
              </div>

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
                    <h2 className="text-lg font-bold text-gray-900">Clases de Hoy</h2>
                    <button
                      onClick={() => setActiveTab('calendario')}
                      className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-1"
                    >
                      Ver calendario
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  {clasesHoy.length > 0 ? (
                    <div className="space-y-3">
                      {clasesHoy.map((clase) => {
                        const estudianteInscrito = clase.inscripciones[0]?.estudiante;
                        return (
                          <div
                            key={clase.id}
                            className="bg-gray-50 rounded-xl p-5 shadow-md hover:shadow-xl transition-all border-2 border-gray-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div
                                  className="w-16 h-16 rounded-lg flex flex-col items-center justify-center text-white shadow-md"
                                  style={{
                                    background: 'linear-gradient(135deg, #6366F1 0%, #6366F1dd 100%)',
                                  }}
                                >
                                  <Clock className="w-5 h-5 mb-1" />
                                  <span className="font-bold text-sm">
                                    {new Date(clase.fecha_hora_inicio).toLocaleTimeString('es-AR', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-bold text-gray-900">{clase.ruta_curricular.nombre}</h3>
                                  <p className="text-sm text-gray-600">
                                    {estudianteInscrito?.nombre} • Prof. {clase.docente.user.nombre}
                                  </p>
                                </div>
                              </div>
                              <button
                                className="font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all text-sm text-white"
                                style={{
                                  background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                                }}
                              >
                                Unirse
                              </button>
                            </div>
                          </div>
                        );
                      })}
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

          {/* Otros tabs placeholder */}
          {activeTab !== 'dashboard' && (
            <div className="h-full flex items-center justify-center bg-white rounded-xl shadow-lg border-2 border-gray-300">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 mb-2">Próximamente</p>
                <p className="text-gray-600">La pestaña "{tabs.find(t => t.id === activeTab)?.label}" está en desarrollo</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
