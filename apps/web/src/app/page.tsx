'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  GraduationCap,
  Users,
  Shield,
  BookOpen,
  Zap,
  LayoutDashboard,
  CreditCard,
  FileText,
  Settings,
  Calendar,
  ClipboardList,
  User,
  Home,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Lock,
  Trophy,
  UsersRound,
  BookMarked,
  Code,
  Eye,
} from 'lucide-react';

interface RouteItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  requiresAuth?: boolean;
  isDynamic?: boolean;
  examplePath?: string;
}

interface RouteSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  gradient: string;
  routes: RouteItem[];
}

const routeSections: RouteSection[] = [
  {
    id: 'auth',
    title: 'Autenticación',
    icon: <Lock className="w-5 h-5" />,
    gradient: 'from-slate-500 to-zinc-600',
    routes: [
      {
        path: '/login',
        label: 'Login Tutor',
        icon: <Users className="w-4 h-4" />,
        description: 'Acceso para padres/tutores',
      },
      {
        path: '/estudiante-login',
        label: 'Login Estudiante',
        icon: <GraduationCap className="w-4 h-4" />,
        description: 'Acceso para estudiantes',
      },
      {
        path: '/docente-login',
        label: 'Login Docente',
        icon: <BookOpen className="w-4 h-4" />,
        description: 'Acceso para profesores',
      },
    ],
  },
  {
    id: 'admin',
    title: 'Portal Admin',
    icon: <Shield className="w-5 h-5" />,
    gradient: 'from-amber-500 to-orange-500',
    routes: [
      {
        path: '/admin',
        label: 'Home Admin',
        icon: <Home className="w-4 h-4" />,
        description: 'Página principal admin',
      },
      {
        path: '/admin/dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard className="w-4 h-4" />,
        description: 'Métricas y estadísticas',
      },
      {
        path: '/admin/estudiantes',
        label: 'Estudiantes',
        icon: <GraduationCap className="w-4 h-4" />,
        description: 'Gestión de estudiantes',
      },
      {
        path: '/admin/usuarios',
        label: 'Usuarios',
        icon: <Users className="w-4 h-4" />,
        description: 'Gestión de usuarios',
      },
      {
        path: '/admin/pagos',
        label: 'Pagos',
        icon: <CreditCard className="w-4 h-4" />,
        description: 'Historial y gestión de pagos',
      },
      {
        path: '/admin/reportes',
        label: 'Reportes',
        icon: <FileText className="w-4 h-4" />,
        description: 'Reportes y analytics',
      },
      {
        path: '/admin/credenciales',
        label: 'Credenciales',
        icon: <Settings className="w-4 h-4" />,
        description: 'Gestión de credenciales',
      },
      {
        path: '/admin/inscripciones-2026',
        label: 'Inscripciones 2026',
        icon: <ClipboardList className="w-4 h-4" />,
        description: 'Inscripciones Colonia/Ciclo',
      },
    ],
  },
  {
    id: 'docente',
    title: 'Portal Docente',
    icon: <BookOpen className="w-5 h-5" />,
    gradient: 'from-violet-500 to-purple-500',
    routes: [
      {
        path: '/docente/dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard className="w-4 h-4" />,
        description: 'Panel principal docente',
      },
      {
        path: '/docente/calendario',
        label: 'Calendario',
        icon: <Calendar className="w-4 h-4" />,
        description: 'Agenda de clases',
      },
      {
        path: '/docente/observaciones',
        label: 'Observaciones',
        icon: <ClipboardList className="w-4 h-4" />,
        description: 'Notas de estudiantes',
      },
      {
        path: '/docente/perfil',
        label: 'Perfil',
        icon: <User className="w-4 h-4" />,
        description: 'Configuración personal',
      },
      {
        path: '/docente/clase/[id]/sala',
        label: 'Sala de Clase',
        icon: <Eye className="w-4 h-4" />,
        description: 'Clase en vivo',
        isDynamic: true,
      },
      {
        path: '/docente/clases/[id]/asistencia',
        label: 'Asistencia',
        icon: <ClipboardList className="w-4 h-4" />,
        description: 'Tomar asistencia',
        isDynamic: true,
      },
      {
        path: '/docente/grupos/[id]',
        label: 'Grupo',
        icon: <Users className="w-4 h-4" />,
        description: 'Ver grupo',
        isDynamic: true,
      },
    ],
  },
  {
    id: 'tutor',
    title: 'Portal Tutor (Protected)',
    icon: <Users className="w-5 h-5" />,
    gradient: 'from-blue-500 to-cyan-500',
    routes: [
      {
        path: '/dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard className="w-4 h-4" />,
        description: 'Panel principal tutor',
        requiresAuth: true,
      },
      {
        path: '/estudiantes',
        label: 'Mis Hijos',
        icon: <GraduationCap className="w-4 h-4" />,
        description: 'Lista de estudiantes',
        requiresAuth: true,
      },
      {
        path: '/estudiantes/[id]',
        label: 'Perfil Hijo',
        icon: <User className="w-4 h-4" />,
        description: 'Detalle de estudiante',
        isDynamic: true,
        requiresAuth: true,
      },
      {
        path: '/clases',
        label: 'Clases',
        icon: <Calendar className="w-4 h-4" />,
        description: 'Calendario de clases',
        requiresAuth: true,
      },
      {
        path: '/mis-clases',
        label: 'Mis Clases',
        icon: <BookMarked className="w-4 h-4" />,
        description: 'Clases inscritas',
        requiresAuth: true,
      },
      {
        path: '/catalogo',
        label: 'Catálogo',
        icon: <ShoppingCart className="w-4 h-4" />,
        description: 'Cursos disponibles',
        requiresAuth: true,
      },
      {
        path: '/casas',
        label: 'Casas',
        icon: <Trophy className="w-4 h-4" />,
        description: 'Sistema de casas',
        requiresAuth: true,
      },
      {
        path: '/equipos',
        label: 'Equipos',
        icon: <UsersRound className="w-4 h-4" />,
        description: 'Equipos de estudiantes',
        requiresAuth: true,
      },
    ],
  },
  {
    id: 'membresia',
    title: 'Membresía (Protected)',
    icon: <CreditCard className="w-5 h-5" />,
    gradient: 'from-emerald-500 to-teal-500',
    routes: [
      {
        path: '/membresia/planes',
        label: 'Planes',
        icon: <CreditCard className="w-4 h-4" />,
        description: 'Ver planes de suscripción',
        requiresAuth: true,
      },
      {
        path: '/membresia/confirmacion',
        label: 'Confirmación',
        icon: <FileText className="w-4 h-4" />,
        description: 'Resultado del pago',
        requiresAuth: true,
      },
    ],
  },
  {
    id: 'estudiante',
    title: 'Portal Estudiante',
    icon: <GraduationCap className="w-5 h-5" />,
    gradient: 'from-emerald-500 to-teal-500',
    routes: [
      {
        path: '/estudiante',
        label: 'Home Estudiante',
        icon: <Home className="w-4 h-4" />,
        description: 'Portal del estudiante (placeholder)',
        requiresAuth: true,
      },
    ],
  },
  {
    id: 'clases',
    title: 'Clases en Vivo',
    icon: <Eye className="w-5 h-5" />,
    gradient: 'from-rose-500 to-red-500',
    routes: [
      {
        path: '/clase/[id]/sala',
        label: 'Sala de Clase',
        icon: <Eye className="w-4 h-4" />,
        description: 'Clase en vivo (estudiante)',
        isDynamic: true,
      },
    ],
  },
  {
    id: 'dev',
    title: 'Desarrollo',
    icon: <Code className="w-5 h-5" />,
    gradient: 'from-gray-500 to-slate-600',
    routes: [
      {
        path: '/dev/preview-dragdrop',
        label: 'Preview DragDrop',
        icon: <Eye className="w-4 h-4" />,
        description: 'Test de componente DragDrop',
      },
    ],
  },
];

function RouteCard({ route }: { route: RouteItem }) {
  const href = route.isDynamic ? '#' : route.path;

  return (
    <Link
      href={href}
      className={`
        group flex items-center gap-3 p-3 rounded-lg
        bg-zinc-800/50 border border-zinc-700/50
        hover:bg-zinc-700/50 hover:border-zinc-600
        transition-all duration-200
        ${route.isDynamic ? 'opacity-60 cursor-not-allowed' : ''}
      `}
      onClick={(e) => route.isDynamic && e.preventDefault()}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-zinc-700 flex items-center justify-center text-zinc-300 group-hover:text-white transition-colors">
        {route.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
            {route.label}
          </span>
          {route.requiresAuth && <Lock className="w-3 h-3 text-amber-500" />}
          {route.isDynamic && <span className="text-xs text-zinc-500">[dinámico]</span>}
        </div>
        <p className="text-xs text-zinc-500 truncate">{route.path}</p>
      </div>
      {!route.isDynamic && (
        <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      )}
    </Link>
  );
}

function SectionCard({ section }: { section: RouteSection }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center gap-3 p-4
          bg-gradient-to-r ${section.gradient} bg-opacity-10
          hover:bg-opacity-20 transition-all duration-200
        `}
      >
        <div
          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${section.gradient} flex items-center justify-center text-white shadow-lg`}
        >
          {section.icon}
        </div>
        <div className="flex-1 text-left">
          <h2 className="text-lg font-semibold text-white">{section.title}</h2>
          <p className="text-xs text-zinc-400">{section.routes.length} rutas</p>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-zinc-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-zinc-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {section.routes.map((route) => (
            <RouteCard key={route.path} route={route} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const totalRoutes = routeSections.reduce((acc, s) => acc + s.routes.length, 0);
  const staticRoutes = routeSections.reduce(
    (acc, s) => acc + s.routes.filter((r) => !r.isDynamic).length,
    0,
  );

  return (
    <div className="min-h-screen bg-[#09090b] relative">
      {/* Background effects */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[120px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-4 shadow-lg shadow-emerald-500/25">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Mateatletas</h1>
          <p className="text-zinc-400 mb-4">Mapa de Navegación del Sitio</p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300">
              {totalRoutes} rutas totales
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
              {staticRoutes} navegables
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Requiere auth
            </span>
          </div>
        </div>

        {/* Quick Access - Portales principales */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            Acceso Rápido
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                href: '/login',
                label: 'Portal Tutor',
                icon: <Users className="w-6 h-6" />,
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                href: '/estudiante-login',
                label: 'Portal Estudiante',
                icon: <GraduationCap className="w-6 h-6" />,
                gradient: 'from-emerald-500 to-teal-500',
              },
              {
                href: '/docente-login',
                label: 'Portal Docente',
                icon: <BookOpen className="w-6 h-6" />,
                gradient: 'from-violet-500 to-purple-500',
              },
              {
                href: '/admin',
                label: 'Administración',
                icon: <Shield className="w-6 h-6" />,
                gradient: 'from-amber-500 to-orange-500',
              },
            ].map((portal) => (
              <Link
                key={portal.href}
                href={portal.href}
                className="group p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${portal.gradient} flex items-center justify-center text-white mb-3 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  {portal.icon}
                </div>
                <p className="font-medium text-zinc-200 group-hover:text-white transition-colors">
                  {portal.label}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Colonia 2026 Banner */}
        <div className="mb-12">
          <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">Colonia de Verano 2026</h3>
                    <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 rounded-full">
                      INSCRIPCIONES ABIERTAS
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400">
                    Enero y Febrero - Matemática, Robótica, Programación
                  </p>
                </div>
              </div>
              <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
                Ruta pendiente: /colonia-2026
              </span>
            </div>
          </div>
        </div>

        {/* All Sections */}
        <div className="space-y-6">
          {routeSections.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <p className="text-sm text-zinc-600">
            &copy; {new Date().getFullYear()} Mateatletas Club. Mapa de desarrollo.
          </p>
        </footer>
      </div>
    </div>
  );
}
