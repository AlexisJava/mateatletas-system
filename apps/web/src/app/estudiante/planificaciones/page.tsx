'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Lock, Star, Zap, Trophy, ChevronRight } from 'lucide-react';
import { misPlanificaciones } from '@/lib/api/planificaciones-simples.api';

interface PlanificacionEstudiante {
  codigo: string;
  titulo: string;
  grupo_codigo: string;
  mes: number | null;
  anio: number;
  semanas_total: number;
  progreso: {
    semana_actual: number;
    puntos_totales: number;
    tiempo_total_minutos: number;
    ultima_actividad: string;
  };
}

export default function EstudiantePlanificacionesPage() {
  const router = useRouter();
  const [planificaciones, setPlanificaciones] = useState<PlanificacionEstudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    cargarPlanificaciones();
  }, []);

  const cargarPlanificaciones = async () => {
    try {
      setLoading(true);
      const data = await misPlanificaciones();
      setPlanificaciones(data);
      if (data.length > 0) {
        setSelectedPlan(data[0].codigo);
      }
    } catch (err) {
      console.error('Error al cargar planificaciones:', err);
      setError('No se pudieron cargar las planificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleJugar = (codigo: string) => {
    router.push(`/estudiante/planificaciones/${codigo}`);
  };

  // Calcular stats globales
  const statsGlobales = {
    estrellas: planificaciones.reduce((acc, p) => acc + Math.floor(p.progreso.puntos_totales / 100), 0),
    racha: 0, // TODO: implementar cálculo de racha
    nivel: 1 + Math.floor(planificaciones.reduce((acc, p) => acc + p.progreso.puntos_totales, 0) / 1000),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-white font-bold">Cargando planificaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={cargarPlanificaciones}
            className="px-6 py-3 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-700 transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (planificaciones.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-white mb-4">No hay planificaciones disponibles</h2>
          <p className="text-slate-400 mb-6">
            Contacta a tu docente para que te asigne una planificación
          </p>
        </div>
      </div>
    );
  }

  // Planificación seleccionada (la primera o la que el usuario seleccionó)
  const planActual = planificaciones.find(p => p.codigo === selectedPlan) || planificaciones[0];
  const progresoPercent = planActual.semanas_total > 0
    ? Math.min(100, Math.round((planActual.progreso.semana_actual / planActual.semanas_total) * 100))
    : 0;

  return (
    <div className="space-y-6">

      {/* Header con Stats - Con fondo grid */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700/50 bg-slate-900/50">
        {/* Grid Pattern Background */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `
            linear-gradient(rgba(100, 116, 139, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100, 116, 139, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }} />

        <div className="relative flex items-start justify-between p-6">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">MIS PLANIFICACIONES</h1>
            <p className="text-sm text-slate-400 font-medium mt-1">
              Nivel {statsGlobales.nivel} · {planificaciones.length} {planificaciones.length === 1 ? 'planificación' : 'planificaciones'}
            </p>
          </div>

          <div className="flex gap-3">
            <div className="px-4 py-2 rounded-xl bg-yellow-500/10 border-2 border-yellow-500/30">
              <div className="flex items-center gap-2 mb-0.5">
                <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
                <span className="text-2xl font-black text-yellow-400">{statsGlobales.estrellas}</span>
              </div>
              <p className="text-[10px] font-bold text-yellow-400/60 uppercase text-center">Estrellas</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-orange-500/10 border-2 border-orange-500/30">
              <div className="flex items-center gap-2 mb-0.5">
                <Zap className="w-5 h-5 text-orange-400" fill="currentColor" />
                <span className="text-2xl font-black text-orange-400">{statsGlobales.racha}</span>
              </div>
              <p className="text-[10px] font-bold text-orange-400/60 uppercase text-center">Racha</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-purple-500/10 border-2 border-purple-500/30">
              <div className="flex items-center gap-2 mb-0.5">
                <Trophy className="w-5 h-5 text-purple-400" fill="currentColor" />
                <span className="text-2xl font-black text-purple-400">{statsGlobales.nivel}</span>
              </div>
              <p className="text-[10px] font-bold text-purple-400/60 uppercase text-center">Nivel</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero - Planificación Actual */}
      <div className="relative rounded-3xl overflow-hidden border-4 border-slate-700/50 shadow-2xl">
        {/* Background con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600/20 via-green-600/20 to-emerald-600/20" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />

        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-400/40 backdrop-blur-sm mb-4">
                <span className="text-xs font-black text-green-300 uppercase tracking-wide">
                  Semana {planActual.progreso.semana_actual} de {planActual.semanas_total}
                </span>
              </div>

              {/* Título */}
              <h2 className="text-5xl font-black text-white uppercase mb-3 drop-shadow-lg">
                {planActual.titulo}
              </h2>

              {/* Descripción */}
              <p className="text-lg text-white/90 mb-6 max-w-2xl font-medium leading-relaxed">
                {planActual.progreso.puntos_totales} puntos acumulados • {planActual.progreso.tiempo_total_minutos} minutos jugados
              </p>

              {/* Barra de progreso */}
              <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-4 border border-white/10 max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-white uppercase tracking-wide">PROGRESO</span>
                  <span className="text-sm font-black text-white">{progresoPercent}%</span>
                </div>
                <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 via-emerald-500 to-green-400 rounded-full transition-all duration-500"
                    style={{ width: `${progresoPercent}%` }}
                  />
                  {/* Brillo animado */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
              </div>

              {/* Botón JUGAR */}
              <button
                onClick={() => handleJugar(planActual.codigo)}
                className="mt-6 px-8 py-4 rounded-xl bg-white hover:bg-white/90 text-slate-900 font-black uppercase text-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-2xl group"
              >
                <Play className="w-6 h-6" fill="currentColor" />
                CONTINUAR
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Emoji gigante */}
            <div className="text-9xl drop-shadow-2xl ml-8">
              🎯
            </div>
          </div>
        </div>
      </div>

      {/* Lista de todas las planificaciones */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-white uppercase tracking-wide flex items-center gap-2">
            <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
            TODAS MIS PLANIFICACIONES
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {planificaciones.map((plan) => {
            const semanasTotales = plan.semanas_total || 0;
            const progresoPorcentaje = semanasTotales > 0
              ? Math.round((plan.progreso.semana_actual / semanasTotales) * 100)
              : 0;
            const barraPorcentaje = Math.max(0, Math.min(100, progresoPorcentaje));

            return (
              <button
                key={plan.codigo}
                onClick={() => setSelectedPlan(plan.codigo)}
                className={`group relative text-left transition-all ${
                  selectedPlan === plan.codigo
                    ? 'scale-[1.02]'
                    : 'hover:scale-[1.02] opacity-90 hover:opacity-100'
                }`}
              >
                {/* Card */}
                <div className={`relative rounded-2xl overflow-hidden border-4 transition-all ${
                  selectedPlan === plan.codigo
                    ? 'border-cyan-500 shadow-2xl shadow-cyan-500/20'
                    : 'border-slate-700/50 shadow-xl'
                }`}>

                  {/* Header */}
                  <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-black text-white uppercase leading-tight flex-1">
                        {plan.titulo}
                      </h4>
                      <div className="text-right ml-3">
                        <div className="text-2xl font-black text-white leading-none">{plan.progreso.puntos_totales}</div>
                        <div className="text-[10px] font-bold text-white/80 uppercase tracking-wide">PUNTOS</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-white/90 text-xs font-bold">
                      <span>{plan.mes ? `Mes ${plan.mes}` : 'Curso anual'}</span>
                      <span>•</span>
                      <span>{plan.semanas_total} semanas</span>
                    </div>
                  </div>

                  {/* Body con grid pattern */}
                  <div className="relative bg-slate-800 p-4">
                    {/* Grid Pattern Sutil */}
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `
                          linear-gradient(rgba(100, 116, 139, 0.15) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(100, 116, 139, 0.15) 1px, transparent 1px)
                        `,
                        backgroundSize: '24px 24px',
                      }}
                    />

                    {/* Info progreso */}
                    <div className="relative flex items-center justify-between mb-3">
                      <span className="text-sm text-slate-300">
                        Semana {plan.progreso.semana_actual} de {plan.semanas_total}
                      </span>
                      <span className="text-sm font-bold text-cyan-400">
                        {barraPorcentaje}%
                      </span>
                    </div>

                    {/* Barra progreso */}
                    <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        style={{ width: `${barraPorcentaje}%` }}
                      />
                    </div>

                    {/* Botón */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJugar(plan.codigo);
                      }}
                      className="relative flex items-center justify-center gap-2 py-2 rounded-xl bg-white hover:bg-white/90 text-slate-900 font-black uppercase text-sm transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4" fill="currentColor" />
                      {plan.progreso.semana_actual === 1 && plan.progreso.puntos_totales === 0 ? 'COMENZAR' : 'CONTINUAR'}
                    </div>
                  </div>
                </div>

                {/* Indicador de selección */}
                {selectedPlan === plan.codigo && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-cyan-500 text-white text-xs font-black uppercase shadow-lg shadow-cyan-500/30">
                    SELECCIONADA
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
