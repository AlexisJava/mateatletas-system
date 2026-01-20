'use client';

import { motion } from 'framer-motion';
import { Users, Clock, Play, ChevronRight, BookOpen } from 'lucide-react';
import { GlassCard } from '../GlassCard';
import { StudentList } from '../StudentList';
import type { Comision } from '@/types/docente.types';

interface GruposViewProps {
  comisiones: Comision[];
  selectedComisionId: string | null;
  onSelectComision: (id: string | null) => void;
  onStartLiveClass: (comisionId: string) => void;
}

// Casa colors for visual distinction
const CASA_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
  QUANTUM: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', glow: '#00d4ff40' },
  VERTEX: { bg: 'bg-purple-500/20', text: 'text-purple-400', glow: '#8b5cf640' },
  PULSAR: { bg: 'bg-amber-500/20', text: 'text-amber-400', glow: '#f59e0b40' },
};

function getCasaStyle(casa: string): { bg: string; text: string; glow: string } {
  const key = casa?.toUpperCase() || 'VERTEX';
  return CASA_COLORS[key] || CASA_COLORS.VERTEX;
}

export function GruposView({
  comisiones,
  selectedComisionId,
  onSelectComision,
  onStartLiveClass,
}: GruposViewProps) {
  // If a comision is selected, show StudentList
  if (selectedComisionId) {
    return (
      <StudentList
        comisionId={selectedComisionId}
        onBack={() => onSelectComision(null)}
        onStartLiveClass={onStartLiveClass}
      />
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      {/* Background ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #06b6d440 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #8b5cf630 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="shrink-0 flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Mis Grupos</h2>
          <p className="text-sm text-slate-400 mt-1">
            {comisiones.length} {comisiones.length === 1 ? 'grupo activo' : 'grupos activos'}
          </p>
        </div>
      </motion.div>

      {/* Groups Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
        {comisiones.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {comisiones.map((comision, index) => {
              const casaStyle = getCasaStyle(comision.casa);

              return (
                <motion.div
                  key={comision.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard
                    glowColor={casaStyle.glow}
                    className="p-5 cursor-pointer hover:bg-white/[0.05] transition-all group"
                    animate={false}
                  >
                    <div onClick={() => onSelectComision(comision.id)}>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`px-2.5 py-1 rounded-lg ${casaStyle.bg} ${casaStyle.text} text-xs font-semibold uppercase tracking-wider`}
                        >
                          {comision.casa}
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">
                        {comision.producto}
                      </h3>

                      {/* Info */}
                      <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-slate-500" />
                          <span>{comision.horario}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users size={14} className="text-slate-500" />
                          <span>
                            {comision.inscripciones}/{comision.cupo_maximo}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar for capacity */}
                      <div className="mb-4">
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min((comision.inscripciones / comision.cupo_maximo) * 100, 100)}%`,
                              background: `linear-gradient(90deg, ${casaStyle.glow.replace('40', '')} 0%, ${casaStyle.glow.replace('40', '')}80 100%)`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartLiveClass(comision.id);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20"
                        >
                          <Play size={16} />
                          Iniciar Clase
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectComision(comision.id);
                          }}
                          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                          title="Ver planificaciones"
                        >
                          <BookOpen size={16} />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <GlassCard className="p-12 flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Sin grupos asignados</h3>
              <p className="text-slate-400 max-w-sm">
                No tienes grupos de clase asignados actualmente. Contacta al administrador si crees
                que esto es un error.
              </p>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
