'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  GraduationCap,
  ListTodo,
  Lock,
  Play,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import {
  getPlanificacionDetalle,
  type PlanificacionDetalleResponse,
  type ClaseDetalle,
} from '@/lib/api/estudiante-aula.api';
import FloatingLines from '@/components/ui/FloatingLines';

interface PageProps {
  params: Promise<{ asignacionId: string }>;
}

export default function PlanificacionDetallePage({ params }: PageProps) {
  const { asignacionId } = use(params);
  const [data, setData] = useState<PlanificacionDetalleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getPlanificacionDetalle(asignacionId);
        setData(response);
      } catch (err) {
        console.error('Error fetching planificacion:', err);
        setError('No pudimos cargar esta planificación.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [asignacionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
              boxShadow: '0 8px 32px rgba(59,130,246,0.5)',
            }}
          >
            <BookOpen className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-white/70 text-lg font-bold">Cargando planificación...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
              boxShadow: '0 8px 32px rgba(244,63,94,0.5)',
            }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Planificación no encontrada</h2>
          <p className="text-white/60 mb-6">{error || 'No tienes acceso a esta planificación.'}</p>
          <Link
            href="/estudiante/aula"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al aula
          </Link>
        </div>
      </div>
    );
  }

  // Calcular progreso total
  const clasesCompletadas = data.clases.filter(
    (c) => c.teoria?.completada && c.practica?.completada,
  ).length;
  const porcentajeTotal =
    data.clases.length > 0 ? Math.round((clasesCompletadas / data.clases.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#030014] relative overflow-hidden">
      <FloatingLines />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          href="/estudiante/aula"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Volver al aula</span>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
                boxShadow: '0 4px 20px rgba(59,130,246,0.4)',
              }}
            >
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
                {data.planificacion.titulo}
              </h1>
              {data.planificacion.descripcion && (
                <p className="text-white/50 text-sm mb-2">{data.planificacion.descripcion}</p>
              )}
              <div className="flex items-center gap-3 text-white/50 text-sm">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{data.grupo.nombre}</span>
                </div>
                <span className="text-white/20">|</span>
                <span>
                  Prof. {data.docente.nombre} {data.docente.apellido}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar global */}
          <div
            className="p-4 rounded-xl"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-sm font-medium">Progreso del curso</span>
              <span className="text-white font-bold">{porcentajeTotal}%</span>
            </div>
            <div
              className="h-3 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${porcentajeTotal}%`,
                  background: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
                  boxShadow: '0 0 12px rgba(59,130,246,0.5)',
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-white/50">
              <span>
                {clasesCompletadas} de {data.clases.length} clases completadas
              </span>
              {porcentajeTotal === 100 && (
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Trophy className="w-3 h-3" />
                  Completado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Lista de clases */}
        {data.clases.length === 0 ? (
          <div className="text-center py-12">
            <Lock className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Sin contenido activado</h3>
            <p className="text-white/50">Tu docente aún no ha activado ninguna clase.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              Clases disponibles
            </h2>
            {data.clases.map((clase) => (
              <ClaseCard key={clase.id} clase={clase} asignacionId={asignacionId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE CLASE CARD
// ============================================================================

interface ClaseCardProps {
  clase: ClaseDetalle;
  asignacionId: string;
}

function ClaseCard({ clase, asignacionId }: ClaseCardProps) {
  const teoriaCompletada = clase.teoria?.completada ?? false;
  const practicaCompletada = clase.practica?.completada ?? false;
  const claseCompletada = teoriaCompletada && practicaCompletada;

  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all ${
        claseCompletada ? 'opacity-90' : ''
      }`}
      style={{
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        border: claseCompletada
          ? '1px solid rgba(16,185,129,0.3)'
          : '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Header de la clase */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white"
              style={{
                background: claseCompletada
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                boxShadow: claseCompletada
                  ? '0 4px 12px rgba(16,185,129,0.3)'
                  : '0 4px 12px rgba(99,102,241,0.3)',
              }}
            >
              {claseCompletada ? <CheckCircle2 className="w-5 h-5" /> : clase.numero}
            </div>
            <div>
              <h3 className="font-bold text-white">{clase.titulo}</h3>
              {clase.descripcion && (
                <p className="text-white/50 text-sm line-clamp-1">{clase.descripcion}</p>
              )}
            </div>
          </div>
          {claseCompletada && (
            <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              Completada
            </span>
          )}
        </div>
      </div>

      {/* Contenido de la clase */}
      <div className="p-4 grid sm:grid-cols-2 gap-3">
        {/* Teoría */}
        {clase.teoria ? (
          <Link
            href={`/estudiante/aula/${asignacionId}/clase/${clase.id}/teoria`}
            className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02] group"
            style={{
              background: teoriaCompletada
                ? 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.1) 100%)'
                : 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(59,130,246,0.1) 100%)',
              border: teoriaCompletada
                ? '1px solid rgba(16,185,129,0.3)'
                : '1px solid rgba(6,182,212,0.3)',
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: teoriaCompletada
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              }}
            >
              {teoriaCompletada ? (
                <CheckCircle2 className="w-5 h-5 text-white" />
              ) : (
                <FileText className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">
                Teoría
              </h4>
              <p className="text-white/50 text-xs truncate">{clase.teoria.titulo}</p>
            </div>
            {teoriaCompletada ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Play className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            )}
          </Link>
        ) : (
          <div
            className="flex items-center gap-3 p-3 rounded-xl opacity-50"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <Lock className="w-10 h-10 p-2 text-white/30" />
            <div>
              <h4 className="font-bold text-white/50 text-sm">Teoría</h4>
              <p className="text-white/30 text-xs">No disponible</p>
            </div>
          </div>
        )}

        {/* Práctica */}
        {clase.practica ? (
          <Link
            href={`/estudiante/aula/${asignacionId}/clase/${clase.id}/practica`}
            className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02] group"
            style={{
              background: practicaCompletada
                ? 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.1) 100%)'
                : 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(124,58,237,0.1) 100%)',
              border: practicaCompletada
                ? '1px solid rgba(16,185,129,0.3)'
                : '1px solid rgba(168,85,247,0.3)',
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: practicaCompletada
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
              }}
            >
              {practicaCompletada ? (
                <CheckCircle2 className="w-5 h-5 text-white" />
              ) : (
                <Zap className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-white text-sm group-hover:text-purple-400 transition-colors">
                Práctica
              </h4>
              <p className="text-white/50 text-xs truncate">{clase.practica.titulo}</p>
            </div>
            {practicaCompletada ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Play className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
            )}
          </Link>
        ) : (
          <div
            className="flex items-center gap-3 p-3 rounded-xl opacity-50"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <Lock className="w-10 h-10 p-2 text-white/30" />
            <div>
              <h4 className="font-bold text-white/50 text-sm">Práctica</h4>
              <p className="text-white/30 text-xs">No disponible</p>
            </div>
          </div>
        )}
      </div>

      {/* Tareas de la clase */}
      {clase.tareas.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <ListTodo className="w-4 h-4 text-amber-400" />
            <span className="text-white/70 text-sm font-medium">Tareas de esta clase</span>
          </div>
          <div className="space-y-2">
            {clase.tareas.map((tarea) => {
              const completada = tarea.progreso?.estado === 'COMPLETADA';
              return (
                <Link
                  key={tarea.id}
                  href={`/estudiante/aula/tareas/${tarea.tarea_asignada_id}`}
                  className="flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-white/5"
                >
                  {completada ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-amber-400/50" />
                  )}
                  <span
                    className={`text-sm flex-1 ${completada ? 'text-white/50 line-through' : 'text-white/70'}`}
                  >
                    {tarea.contenido.titulo}
                  </span>
                  {tarea.obligatoria && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                      Obligatoria
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-white/30" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
