'use client';

import { useState } from 'react';
import {
  Home,
  Users,
  Calendar,
  CreditCard,
  HelpCircle,
  BookOpen,
  Clock,
  TrendingUp,
  Award,
  ChevronRight,
  CheckCircle,
  Zap,
  Mail,
  MessageCircle,
  ChevronLeft,
  FileText,
  Video,
  Book
} from 'lucide-react';

type TabType = 'resumen' | 'hijos' | 'calendario' | 'pagos' | 'ayuda';

export default function TutorDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('resumen');

  // Datos de ejemplo (luego vienen del backend)
  const tutorName = "Carlos";

  const stats = {
    hijosRegistrados: 2,
    clasesEstaSemana: 5,
    asistencia: 92,
    logrosTotales: 19
  };

  const hijos = [
    {
      id: '1',
      name: 'María Rodríguez',
      age: 12,
      grade: '7mo grado',
      initials: 'MR',
      xp: 6200,
      streak: 15,
      achievements: 12,
      nextClass: {
        subject: 'Álgebra Avanzada',
        time: 'Hoy 16:00',
        teacher: 'Ana García'
      },
      subjects: [
        { name: 'Matemáticas', progress: 85 },
        { name: 'Física', progress: 72 },
        { name: 'Programación', progress: 90 }
      ]
    },
    {
      id: '2',
      name: 'Juan Rodríguez',
      age: 9,
      grade: '4to grado',
      initials: 'JR',
      xp: 3800,
      streak: 8,
      achievements: 7,
      nextClass: {
        subject: 'Geometría Básica',
        time: 'Mañana 15:00',
        teacher: 'Carlos López'
      },
      subjects: [
        { name: 'Matemáticas', progress: 78 },
        { name: 'Ciencias', progress: 82 },
        { name: 'Robótica', progress: 65 }
      ]
    }
  ];

  const clasesHoy = [
    {
      id: '1',
      time: '14:00',
      subject: 'Álgebra Avanzada',
      teacher: 'Ana García',
      child: 'María',
      status: 'upcoming'
    },
    {
      id: '2',
      time: '16:00',
      subject: 'Programación Python',
      teacher: 'Carlos López',
      child: 'María',
      status: 'upcoming'
    },
    {
      id: '3',
      time: '17:00',
      subject: 'Robótica Inicial',
      teacher: 'Laura Martínez',
      child: 'Juan',
      status: 'upcoming'
    }
  ];

  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: Home },
    { id: 'hijos', label: 'Mis Hijos', icon: Users },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
    { id: 'pagos', label: 'Pagos', icon: CreditCard },
    { id: 'ayuda', label: 'Ayuda', icon: HelpCircle }
  ];

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      {/* Header con saludo */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-8 py-6">
        <h1 className="text-3xl font-bold">¡Hola, {tutorName}! 👋</h1>
        <p className="text-indigo-100 mt-1">
          Aquí está el resumen de hoy
        </p>
      </div>

      {/* Tabs de navegación */}
      <div className="bg-white border-b border-slate-200">
        <div className="flex space-x-1 px-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido de tab activo */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'resumen' && (
          <TabResumen stats={stats} clasesHoy={clasesHoy} hijos={hijos} />
        )}
        {activeTab === 'hijos' && (
          <TabMisHijos hijos={hijos} />
        )}
        {activeTab === 'calendario' && (
          <TabCalendario />
        )}
        {activeTab === 'pagos' && (
          <TabPagos />
        )}
        {activeTab === 'ayuda' && (
          <TabAyuda />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// TAB RESUMEN
// ============================================================================

function TabResumen({ stats, clasesHoy, hijos }: any) {
  return (
    <div className="h-full overflow-hidden flex flex-col">
      {/* Grid de Estadísticas (4 columnas simétricas) */}
      <div className="grid grid-cols-4 gap-4 p-6">
        <StatCard
          label="Hijos Registrados"
          value={stats.hijosRegistrados}
          subtitle="Perfiles activos"
          icon={Users}
        />
        <StatCard
          label="Clases esta Semana"
          value={stats.clasesEstaSemana}
          subtitle="Programadas"
          icon={Calendar}
        />
        <StatCard
          label="Asistencia"
          value={`${stats.asistencia}%`}
          subtitle="Promedio general"
          icon={TrendingUp}
        />
        <StatCard
          label="Logros Totales"
          value={stats.logrosTotales}
          subtitle="Desbloqueados"
          icon={Award}
        />
      </div>

      {/* Grid de Contenido Principal (2 columnas simétricas) */}
      <div className="grid grid-cols-2 gap-6 px-6 pb-6 flex-1 overflow-hidden">
        {/* Columna Izquierda - Clases de Hoy */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-sm overflow-y-auto">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            📅 Clases de Hoy
          </h3>
          <div className="space-y-3">
            {clasesHoy.map((clase: any) => (
              <div key={clase.id} className="bg-white rounded-lg p-4 border-l-4 border-indigo-500 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                        {clase.time}
                      </span>
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                        {clase.child}
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-900">{clase.subject}</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      👨‍🏫 Prof. {clase.teacher}
                    </p>
                  </div>
                  <button className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm rounded-lg hover:shadow-md transition-all">
                    Unirse
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Columna Derecha - Resumen de Hijos */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-sm overflow-y-auto">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            👨‍👩‍👧‍👦 Mis Hijos
          </h3>
          <div className="space-y-3">
            {hijos.map((hijo: any) => (
              <div key={hijo.id} className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {hijo.initials}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{hijo.name}</h4>
                      <p className="text-sm text-slate-600">{hijo.age} años • {hijo.grade}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Racha</p>
                    <p className="text-lg font-bold text-amber-600">🔥 {hijo.streak} días</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Próxima clase:</span>
                    <span className="font-medium text-slate-900">{hijo.nextClass.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subtitle, icon: Icon }: any) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB MIS HIJOS
// ============================================================================

function TabMisHijos({ hijos }: any) {
  return (
    <div className="h-full overflow-hidden flex flex-col">
      {/* Grid de Hijos (2 columnas simétricas) */}
      <div className="grid grid-cols-2 gap-6 p-6 overflow-y-auto">
        {hijos.map((hijo: any) => (
          <div key={hijo.id} className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-sm">
            {/* Header con avatar y nombre */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
                {hijo.initials}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{hijo.name}</h3>
                <p className="text-slate-600">{hijo.age} años • {hijo.grade}</p>
              </div>
            </div>

            {/* Grid de métricas (3 columnas) */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                <p className="text-2xl font-bold text-indigo-600">{hijo.xp}</p>
                <p className="text-xs text-slate-600 mt-1">XP Total</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                <p className="text-2xl font-bold text-amber-600">🔥 {hijo.streak}</p>
                <p className="text-xs text-slate-600 mt-1">Racha</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                <p className="text-2xl font-bold text-emerald-600">{hijo.achievements}</p>
                <p className="text-xs text-slate-600 mt-1">Logros</p>
              </div>
            </div>

            {/* Progreso por materia */}
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-semibold text-slate-700">Progreso por Materia</h4>
              {hijo.subjects.map((subject: any) => (
                <div key={subject.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700">{subject.name}</span>
                    <span className="font-medium text-slate-900">{subject.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Próxima clase */}
            <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-500">
              <p className="text-xs text-slate-600 mb-1">Próxima Clase</p>
              <p className="font-semibold text-slate-900">{hijo.nextClass.subject}</p>
              <p className="text-sm text-slate-600">{hijo.nextClass.time}</p>
            </div>

            {/* Botón de acción */}
            <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:shadow-md transition-all">
              Ver Perfil Completo
            </button>
          </div>
        ))}
      </div>

      {/* Tarjeta Lambda AI Tutor (Compacta) */}
      <div className="mx-6 mb-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-5 text-white shadow-lg">
        <div className="flex items-start gap-4">
          {/* Ícono */}
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>

          {/* Contenido */}
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2">Lambda - Tu Tutor de IA</h3>
            <p className="text-sm text-purple-100 mb-3">
              He detectado algunas áreas donde tus hijos podrían necesitar refuerzo
            </p>

            {/* Insights por hijo */}
            <div className="space-y-2 mb-4">
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <p className="font-semibold text-sm mb-1">María</p>
                <p className="text-xs text-purple-100">
                  • Dificultad con ecuaciones cuadráticas (3 errores recientes)
                </p>
                <p className="text-xs text-purple-100">
                  • Recomendación: 2 ejercicios de práctica adicionales
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <p className="font-semibold text-sm mb-1">Juan</p>
                <p className="text-xs text-purple-100">
                  • Necesita refuerzo en fracciones mixtas
                </p>
                <p className="text-xs text-purple-100">
                  • Recomendación: Sesión de práctica con tutor IA
                </p>
              </div>
            </div>

            {/* CTA */}
            <button className="w-full px-4 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors">
              Agregar Tareas de Refuerzo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB CALENDARIO
// ============================================================================

function TabCalendario() {
  const weekDays = [
    {
      name: 'Lunes',
      date: '14 Octubre 2024',
      classCount: 2,
      classes: [
        { id: '1', time: '14:00', subject: 'Álgebra', teacher: 'Ana García', child: 'María' },
        { id: '2', time: '16:00', subject: 'Programación', teacher: 'Carlos López', child: 'María' }
      ]
    },
    {
      name: 'Martes',
      date: '15 Octubre 2024',
      classCount: 1,
      classes: [
        { id: '3', time: '15:00', subject: 'Geometría', teacher: 'Laura Martínez', child: 'Juan' }
      ]
    },
    {
      name: 'Miércoles',
      date: '16 Octubre 2024',
      classCount: 2,
      classes: [
        { id: '4', time: '14:00', subject: 'Física', teacher: 'Ana García', child: 'María' },
        { id: '5', time: '17:00', subject: 'Robótica', teacher: 'Carlos López', child: 'Juan' }
      ]
    }
  ];

  return (
    <div className="p-6 space-y-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Actividades de la Semana
        </h2>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 text-slate-600 hover:text-slate-900">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-slate-700">
            14 - 20 Octubre 2024
          </span>
          <button className="px-3 py-2 text-slate-600 hover:text-slate-900">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Lista de días */}
      {weekDays.map(day => (
        <div key={day.date} className="bg-slate-50 rounded-lg p-5 border border-slate-200 shadow-sm">
          {/* Header del día */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{day.name}</h3>
              <p className="text-sm text-slate-600">{day.date}</p>
            </div>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
              {day.classCount} clases
            </span>
          </div>

          {/* Lista de clases del día */}
          <div className="space-y-3">
            {day.classes.map(clase => (
              <div key={clase.id} className="bg-white rounded-lg p-4 border-l-4 border-indigo-500 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                        {clase.time}
                      </span>
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                        {clase.child}
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-900">{clase.subject}</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      👨‍🏫 Prof. {clase.teacher}
                    </p>
                  </div>
                  <button className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm rounded-lg hover:shadow-md transition-all">
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// TAB PAGOS
// ============================================================================

function TabPagos() {
  const payments = [
    { id: '1', date: '1 Oct 2024', concept: 'Membresía Mensual - Octubre', amount: 200, status: 'Pagado' },
    { id: '2', date: '1 Sep 2024', concept: 'Membresía Mensual - Septiembre', amount: 200, status: 'Pagado' },
    { id: '3', date: '1 Ago 2024', concept: 'Membresía Mensual - Agosto', amount: 200, status: 'Pagado' }
  ];

  return (
    <div className="grid grid-cols-[40%_60%] gap-6 p-6 h-full overflow-hidden">
      {/* Columna Izquierda - Resumen de Pagos */}
      <div className="space-y-4 overflow-y-auto">
        {/* Estado de cuenta */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Estado de Cuenta</span>
          </div>
          <p className="text-3xl font-bold mb-1">Al Día ✓</p>
          <p className="text-sm text-emerald-100">
            Tu membresía está activa y al corriente
          </p>
        </div>

        {/* Total abonado */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-600 mb-4">
            Información de Pago
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">Total Abonado (2024)</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">$2,400</p>
            </div>
            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">Último Pago</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">$200</p>
              <p className="text-xs text-slate-500 mt-1">1 de Octubre, 2024</p>
            </div>
            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">Próximo Pago</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">$200</p>
              <p className="text-xs text-slate-500 mt-1">1 de Noviembre, 2024</p>
            </div>
          </div>
        </div>

        {/* Método de pago */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-600 mb-4">
            Método de Pago
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-slate-900">•••• 4242</p>
              <p className="text-xs text-slate-600">Vence 12/25</p>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
            Cambiar Método de Pago
          </button>
        </div>
      </div>

      {/* Columna Derecha - Historial de Pagos */}
      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-sm overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">
            Historial de Pagos
          </h3>
          <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white">
            <option>Últimos 3 meses</option>
            <option>Últimos 6 meses</option>
            <option>Este año</option>
            <option>Todo el historial</option>
          </select>
        </div>

        {/* Tabla de pagos */}
        <div className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left text-xs font-semibold text-slate-600 pb-3">
                  Fecha
                </th>
                <th className="text-left text-xs font-semibold text-slate-600 pb-3">
                  Concepto
                </th>
                <th className="text-right text-xs font-semibold text-slate-600 pb-3">
                  Monto
                </th>
                <th className="text-right text-xs font-semibold text-slate-600 pb-3">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id} className="border-b border-slate-100">
                  <td className="py-3 text-sm text-slate-900">
                    {payment.date}
                  </td>
                  <td className="py-3 text-sm text-slate-700">
                    {payment.concept}
                  </td>
                  <td className="py-3 text-sm font-semibold text-slate-900 text-right">
                    ${payment.amount}
                  </td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB AYUDA
// ============================================================================

function TabAyuda() {
  const resources = [
    { id: '1', title: 'Guía de Inicio', description: 'Cómo empezar con Mateatletas', icon: BookOpen, url: '#' },
    { id: '2', title: 'Preguntas Frecuentes', description: 'Respuestas a dudas comunes', icon: HelpCircle, url: '#' },
    { id: '3', title: 'Tutoriales en Video', description: 'Aprende a usar la plataforma', icon: Video, url: '#' },
    { id: '4', title: 'Centro de Ayuda', description: 'Documentación completa', icon: Book, url: '#' }
  ];

  const topics = [
    { id: '1', title: '¿Cómo reservo una clase?', description: 'Guía paso a paso' },
    { id: '2', title: '¿Cómo funciona el tutor IA?', description: 'Explicación de Lambda' },
    { id: '3', title: '¿Cómo agrego otro hijo?', description: 'Gestión de perfiles' },
    { id: '4', title: '¿Cómo cambio mi plan?', description: 'Actualizar membresía' }
  ];

  return (
    <div className="h-full overflow-y-auto">
      {/* Grid Superior (2 columnas) */}
      <div className="grid grid-cols-2 gap-6 p-6">
        {/* Columna Izquierda - Contacto de Soporte */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            📞 Contacto de Soporte
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            Nuestro equipo está disponible para ayudarte
          </p>

          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Email</p>
                <p className="text-sm text-slate-600">soporte@mateatletas.com</p>
                <p className="text-xs text-slate-500 mt-1">
                  Respuesta en 24 horas
                </p>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">WhatsApp</p>
                <p className="text-sm text-slate-600">+54 11 1234-5678</p>
                <p className="text-xs text-slate-500 mt-1">
                  Lun-Vie 9:00-18:00
                </p>
              </div>
            </div>

            {/* Horarios */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Horario de Atención</p>
                <p className="text-sm text-slate-600">Lunes a Viernes</p>
                <p className="text-xs text-slate-500 mt-1">
                  9:00 AM - 6:00 PM (GMT-3)
                </p>
              </div>
            </div>
          </div>

          <button className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-md transition-all">
            Enviar Mensaje
          </button>
        </div>

        {/* Columna Derecha - Recursos Útiles */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            📚 Recursos Útiles
          </h3>
          <div className="space-y-3">
            {resources.map(resource => {
              const Icon = resource.icon;
              return (
                <a
                  key={resource.id}
                  href={resource.url}
                  className="block bg-white rounded-lg p-4 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{resource.title}</p>
                        <p className="text-xs text-slate-600">{resource.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sección Inferior - Temas Frecuentes */}
      <div className="mx-6 mb-6 bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          💡 Temas Frecuentes
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {topics.map(topic => (
            <button
              key={topic.id}
              className="text-left bg-white rounded-lg p-4 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <p className="font-medium text-slate-900 mb-1">{topic.title}</p>
              <p className="text-sm text-slate-600">{topic.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
