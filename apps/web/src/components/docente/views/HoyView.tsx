'use client';

import { motion } from 'framer-motion';
import { Clock, Users, AlertTriangle, Play, Calendar, TrendingUp } from 'lucide-react';
import { GlassCard } from '../GlassCard';
import type { Comision, DashboardStats, Alerta } from '@/types/docente.types';

interface HoyViewProps {
  greeting: string;
  userName: string;
  currentDateStr: string;
  stats: DashboardStats | null;
  comisiones: Comision[];
  alertas: Alerta[];
  onStartLiveClass: (comisionId: string) => void;
  onSelectComision: (comisionId: string) => void;
}

export function HoyView({
  greeting,
  userName,
  currentDateStr,
  stats,
  comisiones,
  alertas,
  onStartLiveClass,
  onSelectComision,
}: HoyViewProps) {
  // Get today's classes (for now, show all commissions as "today's")
  const clasesHoy = comisiones.slice(0, 3);
  const proximaClase = clasesHoy[0];

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      {/* Background ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #8b5cf640 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #06b6d430 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="shrink-0"
      >
        <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
          {greeting}, {userName}
        </h2>
        <p className="text-base text-slate-400 capitalize mt-1">{currentDateStr}</p>
      </motion.div>

      {/* Main Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {/* Left Column - Classes Today (8/12) */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0 overflow-hidden">
          {/* Quick Stats Row */}
          {stats && (
            <div className="shrink-0 grid grid-cols-2 md:grid-cols-4 gap-3">
              <GlassCard glowColor="#8b5cf630" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.clasesSemana}</p>
                    <p className="text-xs text-slate-400">Clases/semana</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard glowColor="#06b6d430" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalEstudiantes}</p>
                    <p className="text-xs text-slate-400">Estudiantes</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard glowColor="#10b98130" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.asistenciaPromedio}%</p>
                    <p className="text-xs text-slate-400">Asistencia</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard glowColor="#f59e0b30" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <span className="text-amber-400 font-bold">XP</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.puntosOtorgados}</p>
                    <p className="text-xs text-slate-400">XP otorgados</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {/* Next Class Card */}
          {proximaClase ? (
            <GlassCard glowColor="#8b5cf640" className="flex-1 p-6 min-h-0">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium text-emerald-400">Proxima clase</span>
                  </div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">
                    {proximaClase.casa}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{proximaClase.producto}</h3>

                <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>{proximaClase.horario}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={14} />
                    <span>
                      {proximaClase.inscripciones}/{proximaClase.cupoMaximo} estudiantes
                    </span>
                  </div>
                </div>

                <div className="mt-auto flex gap-3">
                  <button
                    onClick={() => onStartLiveClass(proximaClase.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25"
                  >
                    <Play size={18} />
                    Iniciar Clase
                  </button>
                  <button
                    onClick={() => onSelectComision(proximaClase.id)}
                    className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-medium hover:bg-white/10 transition-all"
                  >
                    Ver Grupo
                  </button>
                </div>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="flex-1 p-6 flex items-center justify-center">
              <div className="text-center">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No hay clases programadas para hoy</p>
              </div>
            </GlassCard>
          )}

          {/* Other classes today */}
          {clasesHoy.length > 1 && (
            <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 gap-3">
              {clasesHoy.slice(1).map((clase) => (
                <GlassCard
                  key={clase.id}
                  className="p-4 cursor-pointer hover:bg-white/[0.05] transition-all"
                  animate={false}
                >
                  <div
                    className="flex items-center justify-between"
                    onClick={() => onSelectComision(clase.id)}
                  >
                    <div>
                      <p className="font-medium text-white">{clase.producto}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {clase.horario}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {clase.inscripciones}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartLiveClass(clase.id);
                      }}
                      className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
                    >
                      <Play size={16} />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Alerts (4/12) */}
        <div className="lg:col-span-4 min-h-0 overflow-hidden">
          <GlassCard className="h-full p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Alertas
              </h3>
              {alertas.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                  {alertas.length}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
              {alertas.length > 0 ? (
                alertas.map((alerta) => (
                  <motion.div
                    key={alerta.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-xl border ${
                      alerta.severidad === 'alta'
                        ? 'bg-red-500/10 border-red-500/20'
                        : 'bg-amber-500/10 border-amber-500/20'
                    }`}
                  >
                    <p
                      className={`text-sm font-medium ${alerta.severidad === 'alta' ? 'text-red-300' : 'text-amber-300'}`}
                    >
                      {alerta.estudiante}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{alerta.mensaje}</p>
                  </motion.div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-center py-8">
                  <div>
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">✓</span>
                    </div>
                    <p className="text-slate-400 text-sm">Sin alertas pendientes</p>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
