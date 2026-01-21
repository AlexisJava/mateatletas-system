'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  ListTodo,
  Play,
  Sparkles,
  Trophy,
  AlertTriangle,
} from 'lucide-react';
import {
  getMisTareas,
  type MisTareasResponse,
  type TareaAsignada,
  type EstadoTarea,
} from '@/lib/api/estudiante-aula.api';
import FloatingLines from '@/components/ui/FloatingLines';

type Filtro = 'todas' | 'pendientes' | 'completadas';

export default function MisTareasPage() {
  const [data, setData] = useState<MisTareasResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroActivo, setFiltroActivo] = useState<Filtro>('todas');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getMisTareas(filtroActivo);
        setData(response);
      } catch (err) {
        console.error('Error fetching tareas:', err);
        setError('No pudimos cargar tus tareas.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [filtroActivo]);

  const handleFiltroChange = (nuevoFiltro: Filtro) => {
    setFiltroActivo(nuevoFiltro);
    setIsLoading(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--estudiante-bg)] flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              boxShadow: '0 8px 32px rgba(245,158,11,0.5)',
            }}
          >
            <ListTodo className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-white/70 text-lg font-bold">Cargando tareas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--estudiante-bg)] flex items-center justify-center p-4">
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

  return (
    <div className="min-h-screen bg-[var(--estudiante-bg)] relative overflow-hidden">
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
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                boxShadow: '0 4px 20px rgba(245,158,11,0.4)',
              }}
            >
              <ListTodo className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Mis Tareas</h1>
              <p className="text-white/50 text-sm">Tareas asignadas por tus docentes</p>
            </div>
          </div>
        </div>

        {/* Resumen de stats */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatPill
              label="Total"
              value={data.resumen.total}
              color="#6366f1"
              active={filtroActivo === 'todas'}
              onClick={() => handleFiltroChange('todas')}
            />
            <StatPill
              label="Pendientes"
              value={data.resumen.pendientes + data.resumen.enProgreso}
              color="#f59e0b"
              active={filtroActivo === 'pendientes'}
              onClick={() => handleFiltroChange('pendientes')}
            />
            <StatPill
              label="Completadas"
              value={data.resumen.completadas}
              color="#10b981"
              active={filtroActivo === 'completadas'}
              onClick={() => handleFiltroChange('completadas')}
            />
            <StatPill
              label="Vencidas"
              value={data.resumen.vencidas}
              color="var(--color-incorrect)"
              active={false}
              onClick={() => {}}
            />
          </div>
        )}

        {/* Lista de tareas */}
        {data && data.tareas.length === 0 ? (
          <div className="text-center py-16">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {filtroActivo === 'completadas' ? (
                <Trophy className="w-12 h-12 text-emerald-400/50" />
              ) : (
                <ListTodo className="w-12 h-12 text-white/30" />
              )}
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {filtroActivo === 'completadas'
                ? 'No hay tareas completadas'
                : filtroActivo === 'pendientes'
                  ? 'No hay tareas pendientes'
                  : 'No tienes tareas asignadas'}
            </h2>
            <p className="text-white/50 max-w-md mx-auto">
              {filtroActivo === 'completadas'
                ? 'Cuando completes tareas, aparecerán aquí.'
                : filtroActivo === 'pendientes'
                  ? 'Excelente! Estás al día con tus tareas.'
                  : 'Cuando tu docente te asigne tareas, aparecerán aquí.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.tareas.map((tarea) => (
              <TareaCard key={tarea.tareaAsignadaId} tarea={tarea} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface StatPillProps {
  label: string;
  value: number;
  color: string;
  active: boolean;
  onClick: () => void;
}

function StatPill({ label, value, color, active, onClick }: StatPillProps) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-xl text-left transition-all ${active ? 'scale-105' : 'hover:scale-[1.02]'}`}
      style={{
        background: active
          ? `linear-gradient(135deg, ${color}30 0%, ${color}15 100%)`
          : 'rgba(255,255,255,0.03)',
        border: active ? `2px solid ${color}50` : '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <p className="text-white/50 text-xs font-medium mb-1">{label}</p>
      <p className="text-xl font-black text-white">{value}</p>
    </button>
  );
}

interface TareaCardProps {
  tarea: TareaAsignada;
}

function TareaCard({ tarea }: TareaCardProps) {
  const completada = tarea.progreso.estado === 'COMPLETADA';
  const enProgreso = tarea.progreso.estado === 'EN_PROGRESO';

  // Formatear fecha límite
  const formatFechaLimite = (fecha: string | null) => {
    if (!fecha) return null;
    const date = new Date(fecha);
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    if (date.toDateString() === hoy.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === manana.toDateString()) {
      return 'Mañana';
    } else {
      return date.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const fechaLimiteText = formatFechaLimite(tarea.fechaLimite);

  return (
    <Link
      href={`/estudiante/aula/tareas/${tarea.tareaAsignadaId}`}
      className={`block p-5 rounded-2xl transition-all hover:scale-[1.02] ${completada ? 'opacity-70' : ''}`}
      style={{
        background: completada
          ? 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.05) 100%)'
          : tarea.vencida
            ? 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.05) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        border: completada
          ? '1px solid rgba(16,185,129,0.3)'
          : tarea.vencida
            ? '1px solid rgba(239,68,68,0.3)'
            : '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: completada
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : tarea.vencida
                ? 'linear-gradient(135deg, var(--color-incorrect) 0%, #dc2626 100%)'
                : enProgreso
                  ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
                  : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          }}
        >
          {completada ? (
            <CheckCircle2 className="w-6 h-6 text-white" />
          ) : tarea.vencida ? (
            <AlertTriangle className="w-6 h-6 text-white" />
          ) : enProgreso ? (
            <Play className="w-6 h-6 text-white" />
          ) : (
            <ListTodo className="w-6 h-6 text-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`font-bold ${completada ? 'text-white/70 line-through' : 'text-white'}`}>
              {tarea.contenido.titulo}
            </h3>
            {tarea.obligatoria && !completada && (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded flex-shrink-0">
                Obligatoria
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
            <span>{tarea.clase.planificacion.titulo}</span>
            <span className="text-white/20">|</span>
            <span>Clase {tarea.clase.numero}</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {/* Grupo y docente */}
            <span className="text-white/40">
              {tarea.grupo.nombre} - Prof. {tarea.docente.nombre}
            </span>

            {/* Fecha límite */}
            {fechaLimiteText && !completada && (
              <span
                className={`flex items-center gap-1 ${tarea.vencida ? 'text-red-400' : 'text-white/50'}`}
              >
                <Calendar className="w-3 h-3" />
                {tarea.vencida ? 'Vencida' : fechaLimiteText}
              </span>
            )}

            {/* Estado */}
            {completada && (
              <span className="flex items-center gap-1 text-emerald-400">
                <Trophy className="w-3 h-3" />
                Completada
              </span>
            )}
            {enProgreso && (
              <span className="flex items-center gap-1 text-cyan-400">
                <Clock className="w-3 h-3" />
                En progreso
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
