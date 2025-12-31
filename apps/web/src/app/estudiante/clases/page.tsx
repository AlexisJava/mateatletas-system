'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  GraduationCap,
  Calendar,
  Clock,
  Video,
  User,
  ExternalLink,
  FileText,
  Play,
  Link2,
  CheckCircle2,
  Circle,
  BookOpen,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { estudiantesApi, type ClaseEstudiante } from '@/lib/api/estudiantes.api';

// ============================================================================
// TIPOS
// ============================================================================

interface ClaseHorario {
  hora: string;
  nombre: string;
  docente: string;
  color: string;
}

interface DiaHorario {
  dia: string;
  diaCorto: string;
  clases: ClaseHorario[];
}

interface Tarea {
  id: string;
  titulo: string;
  materia: string;
  fechaLimite: string;
  completada: boolean;
}

interface Material {
  id: string;
  nombre: string;
  tipo: 'PDF' | 'Video' | 'Link';
  url: string;
}

interface ProximaClaseData {
  id: string;
  nombre: string;
  docente: string;
  hora: string;
  fecha: string;
  duracion: string;
  linkMeet: string | null;
  sector: {
    nombre: string;
    color: string;
    icono: string;
  };
}

// ============================================================================
// HELPERS
// ============================================================================

// Colores por defecto para sectores
const SECTOR_COLORS: Record<string, { nombre: string; color: string; icono: string }> = {
  Matemática: { nombre: 'Matemática', color: '#f59e0b', icono: '📐' },
  Programación: { nombre: 'Programación', color: '#22c55e', icono: '💻' },
  Ciencias: { nombre: 'Ciencias', color: '#3b82f6', icono: '🔬' },
  default: { nombre: 'General', color: '#8b5cf6', icono: '📚' },
};

// Obtener día actual
const getDiaActual = (): string => {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return dias[new Date().getDay()] ?? 'Lunes';
};

// Formatear fecha relativa
const formatearFechaRelativa = (fechaStr: string): string => {
  const fecha = new Date(fechaStr);
  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);

  if (fecha.toDateString() === hoy.toDateString()) {
    return 'Hoy';
  } else if (fecha.toDateString() === manana.toDateString()) {
    return 'Mañana';
  } else {
    return fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' });
  }
};

// Transformar ClaseEstudiante del API a ProximaClaseData para UI
const transformarAProximaClase = (clase: ClaseEstudiante): ProximaClaseData => {
  const defaultSector = { nombre: 'General', color: '#8b5cf6', icono: '📚' };

  // Determinar info del sector
  let sectorInfo: { nombre: string; color: string; icono: string };
  if (clase.sector) {
    sectorInfo = {
      nombre: clase.sector.nombre,
      color: clase.sector.color,
      icono: clase.sector.icono,
    };
  } else {
    const firstWord = clase.nombre.split(' ')[0] ?? '';
    const found = SECTOR_COLORS[firstWord];
    sectorInfo = found ?? defaultSector;
  }

  return {
    id: clase.id,
    nombre: clase.nombre,
    docente: `Prof. ${clase.docente.nombre} ${clase.docente.apellido}`,
    hora: clase.hora_inicio,
    fecha: formatearFechaRelativa(clase.fecha_proxima),
    duracion: `${clase.duracion_minutos} min`,
    linkMeet: clase.link_meet,
    sector: sectorInfo,
  };
};

// Transformar ClaseEstudiante[] a DiaHorario[]
const transformarAHorarioSemanal = (clases: ClaseEstudiante[]): DiaHorario[] => {
  const diasSemana: DiaHorario[] = [
    { dia: 'Lunes', diaCorto: 'Lun', clases: [] },
    { dia: 'Martes', diaCorto: 'Mar', clases: [] },
    { dia: 'Miércoles', diaCorto: 'Mié', clases: [] },
    { dia: 'Jueves', diaCorto: 'Jue', clases: [] },
    { dia: 'Viernes', diaCorto: 'Vie', clases: [] },
    { dia: 'Sábado', diaCorto: 'Sáb', clases: [] },
    { dia: 'Domingo', diaCorto: 'Dom', clases: [] },
  ];

  clases.forEach((clase) => {
    const diaIndex = diasSemana.findIndex(
      (d) => d.dia.toLowerCase() === clase.dia_nombre.toLowerCase(),
    );
    if (diaIndex !== -1) {
      const sectorColor =
        clase.sector?.color ||
        SECTOR_COLORS[clase.nombre.split(' ')[0] ?? 'default']?.color ||
        '#8b5cf6';

      diasSemana[diaIndex]?.clases.push({
        hora: clase.hora_inicio,
        nombre: clase.nombre,
        docente: `${clase.docente.nombre} ${clase.docente.apellido}`,
        color: sectorColor,
      });
    }
  });

  return diasSemana;
};

// ============================================================================
// DATOS MOCK (solo para tareas y materiales por ahora)
// ============================================================================

const tareasPendientesData: Tarea[] = [
  {
    id: '1',
    titulo: 'Resolver ejercicios cap. 5',
    materia: 'Matemática',
    fechaLimite: '2 Ene',
    completada: false,
  },
  {
    id: '2',
    titulo: 'Leer artículo sobre algoritmos',
    materia: 'Programación',
    fechaLimite: '3 Ene',
    completada: false,
  },
  {
    id: '3',
    titulo: 'Ver video de física',
    materia: 'Ciencias',
    fechaLimite: '5 Ene',
    completada: true,
  },
];

const materialesData: Material[] = [
  { id: '1', nombre: 'Clase Grabada', tipo: 'Video', url: '#' },
  { id: '2', nombre: 'Guía de ejercicios', tipo: 'PDF', url: '#' },
  { id: '3', nombre: 'Presentación', tipo: 'PDF', url: '#' },
  { id: '4', nombre: 'Recursos extra', tipo: 'Link', url: '#' },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ClasesPage() {
  const [clases, setClases] = useState<ClaseEstudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tareas, setTareas] = useState<Tarea[]>(tareasPendientesData);
  const diaActual = getDiaActual();

  // Cargar clases del estudiante
  useEffect(() => {
    const fetchClases = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await estudiantesApi.getMisClases();
        setClases(data);
      } catch (err) {
        console.error('Error al cargar clases:', err);
        setError('No pudimos cargar tus clases. Por favor intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchClases();
  }, []);

  const toggleTarea = (id: string) => {
    setTareas((prev) => prev.map((t) => (t.id === id ? { ...t, completada: !t.completada } : t)));
  };

  const tareasIncompletas = tareas.filter((t) => !t.completada).length;

  // Derivar datos de la UI desde las clases reales
  const proximaClase = clases.length > 0 ? transformarAProximaClase(clases[0]!) : null;
  const horarioSemanal = transformarAHorarioSemanal(clases);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white relative overflow-hidden">
      {/* Starfield background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="stars-layer stars-small" />
        <div className="stars-layer stars-medium" />
        <div className="stars-layer stars-large" />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/10 via-transparent to-orange-950/10" />
      </div>

      <style jsx>{`
        .stars-layer {
          position: absolute;
          inset: 0;
          background-repeat: repeat;
          animation: twinkle 8s ease-in-out infinite;
        }
        .stars-small {
          background-image:
            radial-gradient(1px 1px at 20px 30px, white, transparent),
            radial-gradient(1px 1px at 40px 70px, rgba(255, 255, 255, 0.8), transparent),
            radial-gradient(1px 1px at 50px 160px, rgba(255, 255, 255, 0.6), transparent),
            radial-gradient(1px 1px at 90px 40px, white, transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(255, 255, 255, 0.7), transparent),
            radial-gradient(1px 1px at 160px 120px, white, transparent);
          background-size: 320px 200px;
          opacity: 0.4;
        }
        .stars-medium {
          background-image:
            radial-gradient(1.5px 1.5px at 100px 50px, white, transparent),
            radial-gradient(1.5px 1.5px at 200px 150px, rgba(255, 255, 255, 0.9), transparent),
            radial-gradient(1.5px 1.5px at 300px 100px, white, transparent);
          background-size: 400px 220px;
          opacity: 0.3;
          animation-delay: 2s;
          animation-duration: 10s;
        }
        .stars-large {
          background-image:
            radial-gradient(2px 2px at 150px 80px, rgba(251, 191, 36, 0.8), transparent),
            radial-gradient(2px 2px at 350px 200px, rgba(249, 115, 22, 0.7), transparent);
          background-size: 500px 280px;
          opacity: 0.5;
          animation-delay: 4s;
          animation-duration: 12s;
        }
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
        /* Ocultar scrollbar pero mantener funcionalidad */
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="relative z-10 p-4 md:p-6 lg:p-8 hide-scrollbar overflow-auto h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/estudiante"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
          </div>

          {/* Title Section */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black">Mis Clases</h1>
              <p className="text-slate-400 text-sm">Tu aula virtual y horarios</p>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
              <p className="text-slate-400">Cargando tus clases...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-slate-300 text-center mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && clases.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
                <Calendar className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No tienes clases asignadas</h3>
              <p className="text-slate-400 text-center max-w-md">
                Aún no estás inscrito en ninguna clase. Contacta a tu tutor o docente para que te
                asignen a un grupo.
              </p>
            </div>
          )}

          {/* Main Content - Solo si hay clases */}
          {!loading && !error && clases.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna izquierda (2/3) */}
              <div className="lg:col-span-2 space-y-6">
                {/* PRÓXIMA CLASE - Card destacada */}
                <ProximaClaseCard clase={proximaClase} />

                {/* HORARIO SEMANAL */}
                <HorarioSemanal horario={horarioSemanal} diaActual={diaActual} />
              </div>

              {/* Columna derecha (1/3) */}
              <div className="space-y-6">
                {/* TAREAS PENDIENTES */}
                <TareasPendientesCard
                  tareas={tareas}
                  onToggle={toggleTarea}
                  pendientes={tareasIncompletas}
                />

                {/* MATERIAL DE CLASE */}
                <MaterialClaseCard materiales={materialesData} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTES
// ============================================================================

function ProximaClaseCard({ clase }: { clase: ProximaClaseData | null }) {
  if (!clase) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700/50 p-8">
        <div className="flex flex-col items-center justify-center text-center py-4">
          <Calendar className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-lg font-semibold text-slate-400">
            No hay clases programadas para hoy
          </h3>
          <p className="text-sm text-slate-500 mt-1">Revisa tu horario semanal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/60 via-green-900/50 to-teal-900/60 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-green-500/10 rounded-full blur-3xl" />

      {/* Badge */}
      <div className="absolute top-4 left-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-emerald-500/30 text-emerald-200 rounded-full border border-emerald-400/30">
          <Sparkles className="w-3 h-3" />
          PRÓXIMA CLASE
        </span>
      </div>

      <div className="relative p-6 pt-14">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Info de la clase */}
          <div className="flex-1">
            {/* Sector tag */}
            <span
              className="inline-block px-2.5 py-1 text-xs font-semibold rounded-lg mb-3"
              style={{
                backgroundColor: `${clase.sector.color}25`,
                color: clase.sector.color,
              }}
            >
              {clase.sector.icono} {clase.sector.nombre}
            </span>

            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">{clase.nombre}</h2>

            <div className="flex flex-wrap items-center gap-4 text-emerald-100/80">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{clase.docente}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-semibold text-white">
                  {clase.fecha} a las {clase.hora}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{clase.duracion}</span>
              </div>
            </div>
          </div>

          {/* Botón Unirse */}
          <div className="flex-shrink-0">
            {clase.linkMeet ? (
              <a
                href={clase.linkMeet}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <Video className="w-6 h-6" />
                UNIRSE A CLASE
                <ExternalLink className="w-5 h-5" />
              </a>
            ) : (
              <div className="inline-flex items-center gap-3 px-8 py-4 bg-slate-700/50 text-slate-400 font-bold text-lg rounded-2xl cursor-not-allowed">
                <Video className="w-6 h-6" />
                Sin link de clase
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HorarioSemanal({ horario, diaActual }: { horario: DiaHorario[]; diaActual: string }) {
  return (
    <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">Horario Semanal</h3>
            <p className="text-xs text-slate-400">Tu agenda de clases</p>
          </div>
        </div>
      </div>

      {/* Days Grid */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {horario.map((dia) => {
            const esHoy = dia.dia === diaActual;
            const tieneClases = dia.clases.length > 0;

            return (
              <div
                key={dia.dia}
                className={`
                  relative rounded-xl p-3 transition-all
                  ${esHoy ? 'bg-violet-500/20 border border-violet-500/40 ring-2 ring-violet-500/20' : 'bg-slate-700/30'}
                `}
              >
                {/* Día header */}
                <div className="text-center mb-2">
                  <p
                    className={`text-xs font-bold ${esHoy ? 'text-violet-300' : 'text-slate-400'}`}
                  >
                    {dia.diaCorto}
                  </p>
                  {esHoy && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-400 mt-1" />
                  )}
                </div>

                {/* Clases del día */}
                <div className="space-y-1.5 min-h-[60px]">
                  {tieneClases ? (
                    dia.clases.map((clase, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg p-2 text-center"
                        style={{ backgroundColor: `${clase.color}20` }}
                      >
                        <p className="text-[10px] font-bold" style={{ color: clase.color }}>
                          {clase.hora}
                        </p>
                        <p className="text-[10px] text-white/70 truncate">
                          {clase.nombre.split(' ')[0]}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-[10px] text-slate-500">-</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista detallada de clases */}
      <div className="px-4 pb-4">
        <div className="space-y-2">
          {horario
            .filter((d) => d.clases.length > 0)
            .map((dia) =>
              dia.clases.map((clase, idx) => (
                <div
                  key={`${dia.dia}-${idx}`}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl
                    ${dia.dia === diaActual ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-slate-700/20'}
                  `}
                >
                  <div className="w-1 h-10 rounded-full" style={{ backgroundColor: clase.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{clase.nombre}</p>
                    <p className="text-xs text-slate-400">{clase.docente}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{dia.dia}</p>
                    <p className="text-xs text-slate-400">{clase.hora}</p>
                  </div>
                </div>
              )),
            )}
        </div>
      </div>
    </div>
  );
}

function TareasPendientesCard({
  tareas,
  onToggle,
  pendientes,
}: {
  tareas: Tarea[];
  onToggle: (id: string) => void;
  pendientes: number;
}) {
  return (
    <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Tareas Pendientes</h3>
              <p className="text-xs text-slate-400">
                {pendientes > 0 ? `${pendientes} por completar` : 'Todo al día'}
              </p>
            </div>
          </div>
          {pendientes > 0 && (
            <span className="px-2.5 py-1 text-xs font-bold bg-amber-500/20 text-amber-300 rounded-full">
              {pendientes}
            </span>
          )}
        </div>
      </div>

      {/* Lista de tareas */}
      <div className="p-4">
        {tareas.length === 0 ? (
          <div className="text-center py-6">
            <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-2" />
            <p className="text-slate-400">¡No tienes tareas pendientes!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tareas.map((tarea) => (
              <button
                key={tarea.id}
                onClick={() => onToggle(tarea.id)}
                className={`
                  w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all
                  ${tarea.completada ? 'bg-slate-700/20 opacity-60' : 'bg-slate-700/40 hover:bg-slate-700/60'}
                `}
              >
                {tarea.completada ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${tarea.completada ? 'line-through text-slate-500' : 'text-white'}`}
                  >
                    {tarea.titulo}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">{tarea.materia}</span>
                    <span className="text-slate-600">•</span>
                    <span
                      className={`text-xs ${tarea.completada ? 'text-slate-500' : 'text-amber-400'}`}
                    >
                      {tarea.fechaLimite}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MaterialClaseCard({ materiales }: { materiales: Material[] }) {
  const getIconForType = (tipo: string) => {
    switch (tipo) {
      case 'PDF':
        return <FileText className="w-5 h-5" />;
      case 'Video':
        return <Play className="w-5 h-5" />;
      case 'Link':
        return <Link2 className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getColorForType = (tipo: string) => {
    switch (tipo) {
      case 'PDF':
        return { bg: 'bg-red-500/20', text: 'text-red-400' };
      case 'Video':
        return { bg: 'bg-purple-500/20', text: 'text-purple-400' };
      case 'Link':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400' };
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-400' };
    }
  };

  return (
    <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">Material de Clase</h3>
            <p className="text-xs text-slate-400">{materiales.length} recursos</p>
          </div>
        </div>
      </div>

      {/* Grid de materiales */}
      <div className="p-4">
        {materiales.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">El docente aún no ha compartido material</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {materiales.map((material) => {
              const colors = getColorForType(material.tipo);
              return (
                <a
                  key={material.id}
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-all hover:scale-105 active:scale-95"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center ${colors.text}`}
                  >
                    {getIconForType(material.tipo)}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-white truncate w-full">
                      {material.nombre}
                    </p>
                    <p className={`text-[10px] ${colors.text}`}>{material.tipo}</p>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
