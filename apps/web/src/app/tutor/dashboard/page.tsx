'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { useAuthStore } from '@/store/auth.store';
import apiClient from '@/lib/axios';

type TabType = 'resumen' | 'hijos' | 'calendario' | 'pagos' | 'ayuda';

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

export default function TutorDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('resumen');

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

      setEstudiantes(estudiantesRes.data || []);
      setClases(clasesRes || []);
      setMembresia(membresiaRes.membresia || null);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading mientras se verifica autenticación
  if (isLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const tutorName = user?.nombre || "Tutor";

  // Calcular estadísticas a partir de datos reales
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

  // Filtrar clases de hoy
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  const clasesHoyData = clases.filter((clase) => {
    const fechaClase = new Date(clase.fecha_hora_inicio);
    return fechaClase >= hoy && fechaClase < manana;
  });

  // Filtrar clases de esta semana
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - hoy.getDay());
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 7);

  const clasesEstaSemana = clases.filter((clase) => {
    const fechaClase = new Date(clase.fecha_hora_inicio);
    return fechaClase >= inicioSemana && fechaClase < finSemana;
  });

  const stats = {
    hijosRegistrados: estudiantes.length,
    clasesEstaSemana: clasesEstaSemana.length,
    asistencia: 92, // TODO: calcular desde backend
    logrosTotales: 0, // TODO: calcular desde gamificación
  };

  // Transformar estudiantes a formato de la UI
  const hijos = estudiantes.map((est) => {
    const edad = calcularEdad(est.fecha_nacimiento);
    const initials = `${est.nombre.charAt(0)}${est.apellido.charAt(0)}`.toUpperCase();

    // Encontrar próxima clase para este estudiante
    const proximasClases = clases
      .filter((clase) => {
        return clase.inscripciones.some((insc) => insc.estudiante.id === est.id);
      })
      .filter((clase) => new Date(clase.fecha_hora_inicio) > new Date())
      .sort((a, b) => new Date(a.fecha_hora_inicio).getTime() - new Date(b.fecha_hora_inicio).getTime());

    const proximaClase = proximasClases[0];

    return {
      id: est.id,
      name: `${est.nombre} ${est.apellido}`,
      age: edad,
      grade: est.grado_escolar || 'Sin especificar',
      initials,
      xp: 0, // TODO: calcular desde gamificación
      streak: 0, // TODO: calcular desde gamificación
      achievements: 0, // TODO: calcular desde gamificación
      nextClass: proximaClase
        ? {
            subject: proximaClase.ruta_curricular.nombre,
            time: new Date(proximaClase.fecha_hora_inicio).toLocaleString('es-AR', {
              weekday: 'short',
              hour: '2-digit',
              minute: '2-digit',
            }),
            teacher: `${proximaClase.docente.user.nombre} ${proximaClase.docente.user.apellido}`,
          }
        : null,
      subjects: [], // TODO: calcular progreso desde cursos
    };
  });

  // Transformar clases de hoy a formato de la UI
  const clasesHoy = clasesHoyData.map((clase) => {
    const estudianteInscrito = clase.inscripciones[0]?.estudiante;
    return {
      id: clase.id,
      time: new Date(clase.fecha_hora_inicio).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      subject: clase.ruta_curricular.nombre,
      teacher: `${clase.docente.user.nombre} ${clase.docente.user.apellido}`,
      child: estudianteInscrito ? estudianteInscrito.nombre : 'Sin asignar',
      status: 'upcoming',
    };
  });

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
          <TabCalendario clases={clases} estudiantes={estudiantes} />
        )}
        {activeTab === 'pagos' && (
          <TabPagos membresia={membresia} />
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
            {clasesHoy.length > 0 ? (
              clasesHoy.map((clase: any) => (
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
              ))
            ) : (
              <div className="bg-white rounded-lg p-8 text-center border border-slate-200">
                <p className="text-slate-500">No hay clases programadas para hoy</p>
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha - Resumen de Hijos */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-sm overflow-y-auto">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            👨‍👩‍👧‍👦 Mis Hijos
          </h3>
          <div className="space-y-3">
            {hijos.length > 0 ? (
              hijos.map((hijo: any) => (
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
                    {hijo.streak > 0 && (
                      <div className="text-right">
                        <p className="text-sm text-slate-600">Racha</p>
                        <p className="text-lg font-bold text-amber-600">🔥 {hijo.streak} días</p>
                      </div>
                    )}
                  </div>
                  {hijo.nextClass && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Próxima clase:</span>
                        <span className="font-medium text-slate-900">{hijo.nextClass.time}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg p-8 text-center border border-slate-200">
                <p className="text-slate-500 mb-4">Aún no has registrado estudiantes</p>
                <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:shadow-md transition-all">
                  Agregar Hijo/a
                </button>
              </div>
            )}
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
  if (hijos.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center bg-white rounded-lg p-12 border border-slate-200 shadow-sm max-w-md">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No hay estudiantes registrados</h3>
          <p className="text-slate-600 mb-6">Comienza agregando a tu primer hijo/a para acceder a las clases y contenido educativo.</p>
          <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-md transition-all">
            Agregar Hijo/a
          </button>
        </div>
      </div>
    );
  }

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
            {hijo.nextClass ? (
              <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-500">
                <p className="text-xs text-slate-600 mb-1">Próxima Clase</p>
                <p className="font-semibold text-slate-900">{hijo.nextClass.subject}</p>
                <p className="text-sm text-slate-600">{hijo.nextClass.time}</p>
              </div>
            ) : (
              <div className="bg-slate-100 rounded-lg p-4 border-l-4 border-slate-300">
                <p className="text-xs text-slate-600 mb-1">Próxima Clase</p>
                <p className="text-sm text-slate-500">No hay clases programadas</p>
              </div>
            )}

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

function TabCalendario({ clases, estudiantes }: { clases: Clase[]; estudiantes: Estudiante[] }) {
  // Agrupar clases por día de la semana
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Obtener inicio de la semana (domingo)
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - hoy.getDay());

  // Generar próximos 7 días
  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const fecha = new Date(inicioSemana);
    fecha.setDate(inicioSemana.getDate() + i);
    return fecha;
  });

  // Agrupar clases por día
  const weekDays = diasSemana.map((fecha) => {
    const inicioDia = new Date(fecha);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(fecha);
    finDia.setHours(23, 59, 59, 999);

    const clasesDelDia = clases
      .filter((clase) => {
        const fechaClase = new Date(clase.fecha_hora_inicio);
        return fechaClase >= inicioDia && fechaClase <= finDia;
      })
      .map((clase) => {
        const estudianteInscrito = clase.inscripciones[0]?.estudiante;
        return {
          id: clase.id,
          time: new Date(clase.fecha_hora_inicio).toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          subject: clase.ruta_curricular.nombre,
          teacher: `${clase.docente.user.nombre} ${clase.docente.user.apellido}`,
          child: estudianteInscrito ? estudianteInscrito.nombre : 'Sin asignar',
        };
      });

    return {
      name: fecha.toLocaleDateString('es-AR', { weekday: 'long' }),
      date: fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }),
      classCount: clasesDelDia.length,
      classes: clasesDelDia,
    };
  }).filter((dia) => dia.classCount > 0); // Solo mostrar días con clases

  if (weekDays.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center bg-white rounded-lg p-12 border border-slate-200 shadow-sm max-w-md">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No hay clases programadas</h3>
          <p className="text-slate-600 mb-6">Aún no tienes clases reservadas para esta semana.</p>
          <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-md transition-all">
            Ver Clases Disponibles
          </button>
        </div>
      </div>
    );
  }

  const inicioSemanaStr = inicioSemana.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  const finSemanaDate = new Date(inicioSemana);
  finSemanaDate.setDate(inicioSemana.getDate() + 6);
  const finSemanaStr = finSemanaDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });

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
            {inicioSemanaStr} - {finSemanaStr}
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

function TabPagos({ membresia }: { membresia: Membresia | null }) {
  const tieneMembresia = membresia && membresia.estado === 'Activa';

  // Mock payments for now (TODO: fetch from backend)
  const payments = tieneMembresia
    ? [
        {
          id: '1',
          date: new Date(membresia.fecha_inicio).toLocaleDateString('es-AR'),
          concept: `${membresia.producto.nombre}`,
          amount: membresia.producto.precio,
          status: 'Pagado',
        },
      ]
    : [];

  return (
    <div className="grid grid-cols-[40%_60%] gap-6 p-6 h-full overflow-hidden">
      {/* Columna Izquierda - Resumen de Pagos */}
      <div className="space-y-4 overflow-y-auto">
        {/* Estado de cuenta */}
        {tieneMembresia ? (
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
        ) : (
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">Estado de Cuenta</span>
            </div>
            <p className="text-3xl font-bold mb-1">Sin Membresía</p>
            <p className="text-sm text-amber-100">
              Adquiere una membresía para acceder a todas las clases
            </p>
          </div>
        )}

        {/* Total abonado */}
        {tieneMembresia && (
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-600 mb-4">
              Información de Pago
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600">Membresía Activa</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{membresia.producto.nombre}</p>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">Último Pago</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">${membresia.producto.precio}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(membresia.fecha_inicio).toLocaleDateString('es-AR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">Vencimiento</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">
                  {new Date(membresia.fecha_fin).toLocaleDateString('es-AR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {!tieneMembresia && (
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-600 mb-4">
              Adquiere una Membresía
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Accede a todas las clases, contenido educativo y beneficios exclusivos.
            </p>
            <button className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-md transition-all">
              Ver Planes
            </button>
          </div>
        )}

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
          {payments.length > 0 && (
            <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white">
              <option>Últimos 3 meses</option>
              <option>Últimos 6 meses</option>
              <option>Este año</option>
              <option>Todo el historial</option>
            </select>
          )}
        </div>

        {/* Tabla de pagos */}
        {payments.length > 0 ? (
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
        ) : (
          <div className="bg-white rounded-lg p-8 text-center border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500">No hay pagos registrados</p>
          </div>
        )}
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
