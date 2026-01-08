'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  GraduationCap,
  ListTodo,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import {
  getMiAula,
  type MiAulaResponse,
  type SectorConPlanificaciones,
  type PlanificacionConProgreso,
} from '@/lib/api/estudiante-aula.api';
import FloatingLines from '@/components/ui/FloatingLines';

export default function AulaEstudiantePage() {
  const [data, setData] = useState<MiAulaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getMiAula();
        setData(response);
      } catch (err) {
        console.error('Error fetching aula:', err);
        setError('No pudimos cargar tu aula. Intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

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
          <p className="text-white/70 text-lg font-bold">Cargando tu aula...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
          <h2 className="text-xl font-bold text-white mb-2">Ups!</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const hasContent = data && data.sectores.some((s) => s.planificaciones.length > 0);

  return (
    <div className="min-h-screen bg-[#030014] relative overflow-hidden">
      <FloatingLines />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
                boxShadow: '0 4px 20px rgba(59,130,246,0.4)',
              }}
            >
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Mi Aula Virtual</h1>
              <p className="text-white/50 text-sm">Tu contenido activado por los docentes</p>
            </div>
          </div>
        </div>

        {/* Resumen de progreso global */}
        {data && hasContent && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <StatCard
              icon={<BookOpen className="w-5 h-5" />}
              label="Planificaciones"
              value={data.resumen.total_planificaciones}
              colors={['#06b6d4', '#0891b2']}
            />
            <StatCard
              icon={<Target className="w-5 h-5" />}
              label="Clases Activas"
              value={data.resumen.total_clases_activas}
              colors={['#a855f7', '#7c3aed']}
            />
            <StatCard
              icon={<CheckCircle2 className="w-5 h-5" />}
              label="Completadas"
              value={data.resumen.total_clases_completadas}
              colors={['#10b981', '#059669']}
            />
            <StatCard
              icon={<ListTodo className="w-5 h-5" />}
              label="Tareas"
              value={`${data.resumen.total_tareas_completadas}/${data.resumen.total_tareas}`}
              colors={['#f59e0b', '#d97706']}
            />
          </div>
        )}

        {/* Sin contenido */}
        {!hasContent && (
          <div className="text-center py-16">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <BookOpen className="w-12 h-12 text-white/30" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Aún no hay contenido</h2>
            <p className="text-white/50 max-w-md mx-auto">
              Tu docente aún no ha activado ninguna lección para ti. Cuando lo haga, verás aquí todo
              el material disponible.
            </p>
            <Link
              href="/estudiante"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
              }}
            >
              Volver al inicio
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Sectores con planificaciones */}
        {data && data.sectores.map((sector) => <SectorSection key={sector.id} sector={sector} />)}

        {/* Link a tareas */}
        {hasContent && (
          <div className="mt-8">
            <Link
              href="/estudiante/aula/tareas"
              className="flex items-center justify-between p-5 rounded-2xl transition-all hover:scale-[1.02]"
              style={{
                background:
                  'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(217,119,6,0.1) 100%)',
                border: '1px solid rgba(245,158,11,0.3)',
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    boxShadow: '0 4px 16px rgba(245,158,11,0.4)',
                  }}
                >
                  <ListTodo className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Mis Tareas</h3>
                  <p className="text-white/50 text-sm">Ver todas las tareas asignadas</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-amber-400" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  colors: [string, string];
}

function StatCard({ icon, label, value, colors }: StatCardProps) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{
        background: `linear-gradient(135deg, ${colors[0]}15 0%, ${colors[1]}10 100%)`,
        border: `1px solid ${colors[0]}30`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div style={{ color: colors[0] }}>{icon}</div>
        <span className="text-white/50 text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}

interface SectorSectionProps {
  sector: SectorConPlanificaciones;
}

function SectorSection({ sector }: SectorSectionProps) {
  if (sector.planificaciones.length === 0) return null;

  return (
    <div className="mb-8">
      {/* Header del sector */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{
            background: `linear-gradient(135deg, ${sector.color}40 0%, ${sector.color}20 100%)`,
            border: `1px solid ${sector.color}50`,
          }}
        >
          {sector.icono}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{sector.nombre}</h2>
          <p className="text-white/40 text-sm">
            {sector.planificaciones.length} planificación
            {sector.planificaciones.length !== 1 ? 'es' : ''} activa
            {sector.planificaciones.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Grid de planificaciones */}
      <div className="grid gap-4 sm:grid-cols-2">
        {sector.planificaciones.map((plan) => (
          <PlanificacionCard key={plan.asignacion_id} plan={plan} sectorColor={sector.color} />
        ))}
      </div>
    </div>
  );
}

interface PlanificacionCardProps {
  plan: PlanificacionConProgreso;
  sectorColor: string;
}

function PlanificacionCard({ plan, sectorColor }: PlanificacionCardProps) {
  const porcentaje = plan.progreso.porcentaje;

  return (
    <Link
      href={`/estudiante/aula/${plan.asignacion_id}`}
      className="block p-5 rounded-2xl transition-all hover:scale-[1.02] group"
      style={{
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
            {plan.planificacion.titulo}
          </h3>
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <Users className="w-4 h-4" />
            <span>{plan.grupo.nombre}</span>
            <span className="text-white/30">|</span>
            <span>
              Prof. {plan.docente.nombre} {plan.docente.apellido}
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/50 text-xs font-medium">Progreso</span>
          <span className="text-white/70 text-xs font-bold">{porcentaje}%</span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${porcentaje}%`,
              background: `linear-gradient(90deg, ${sectorColor} 0%, ${sectorColor}cc 100%)`,
              boxShadow: `0 0 8px ${sectorColor}60`,
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span className="text-white/70">
            {plan.progreso.clases_completadas}/{plan.progreso.clases_activas} clases
          </span>
        </div>
        {plan.progreso.tareas_total > 0 && (
          <div className="flex items-center gap-1.5">
            <ListTodo className="w-4 h-4 text-amber-400" />
            <span className="text-white/70">
              {plan.progreso.tareas_completadas}/{plan.progreso.tareas_total} tareas
            </span>
          </div>
        )}
      </div>

      {/* Completion badge */}
      {porcentaje === 100 && (
        <div className="mt-4 flex items-center gap-2 text-emerald-400">
          <Trophy className="w-4 h-4" />
          <span className="text-sm font-bold">Completado</span>
        </div>
      )}
    </Link>
  );
}
