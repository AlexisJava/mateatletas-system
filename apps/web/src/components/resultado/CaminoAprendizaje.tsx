// ═══════════════════════════════════════════════════════════════════════════════
// CAMINO DE APRENDIZAJE - REDISEÑO ÉPICO Y PERSUASIVO
// Muestra la TRANSFORMACIÓN real del estudiante, no solo una lista de cursos
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import { motion } from 'framer-motion';
import { Curso } from '@/types/courses';
import { Zap, Rocket, Trophy, Star, ChevronRight, CheckCircle2 } from 'lucide-react';

interface CaminoAprendizajeProps {
  cursos: Curso[];
}

export default function CaminoAprendizaje({ cursos }: CaminoAprendizajeProps) {

  // Calcular métricas totales
  const totalSemanas = cursos.reduce((sum, c) => sum + c.duracion_semanas, 0);
  const totalClases = cursos.reduce((sum, c) => sum + c.total_clases, 0);
  const allSkills = cursos.flatMap(c => c.skills_principales);

  return (
    <section className="mb-24">
      {/* ═══════════════════════════════════════════════════════════════════════════
          HEADER - LA TRANSFORMACIÓN
          ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
          className="inline-block mb-6"
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400/50 rounded-full px-6 py-3">
            <span className="text-purple-400 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              La Ruta Completa
            </span>
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-black text-white mb-6"
        >
          De <span className="text-slate-500">principiante</span> a{' '}
          <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            creador
          </span>{' '}
          en {totalSemanas} semanas
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-slate-400 text-xl max-w-3xl mx-auto mb-10"
        >
          Esta no es una lista de cursos. Es la ruta exacta que transformará a tu hijo
          de consumidor de tecnología a <strong className="text-white">creador de tecnología</strong>.
        </motion.p>

        {/* Stats rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-8 mb-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-black text-white">{totalClases}</div>
              <div className="text-xs text-slate-500 uppercase">Clases</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-black text-white">{cursos.length}</div>
              <div className="text-xs text-slate-500 uppercase">Cursos</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-black text-white">{allSkills.length}+</div>
              <div className="text-xs text-slate-500 uppercase">Skills</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          ROADMAP VISUAL - CARDS HORIZONTALES CON MEGA IMPACTO
          ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto space-y-8">
        {cursos.map((curso, index) => {
          const gradients = [
            'from-cyan-500/10 to-blue-500/10 border-cyan-500/30',
            'from-purple-500/10 to-pink-500/10 border-purple-500/30',
            'from-orange-500/10 to-red-500/10 border-orange-500/30',
            'from-emerald-500/10 to-teal-500/10 border-emerald-500/30'
          ];

          const iconColors = [
            'text-cyan-400 bg-cyan-500/20',
            'text-purple-400 bg-purple-500/20',
            'text-orange-400 bg-orange-500/20',
            'text-emerald-400 bg-emerald-500/20'
          ];

          return (
            <motion.div
              key={curso.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className={`bg-gradient-to-br ${gradients[index % 4]} border-2 rounded-3xl p-8 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}>
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl -z-10" />

                <div className="relative z-10">
                  {/* Header con número */}
                  <div className="flex items-start gap-6 mb-6">
                    <div className={`flex-shrink-0 w-16 h-16 ${iconColors[index % 4]} rounded-2xl flex items-center justify-center font-black text-3xl`}>
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-5xl">{curso.emoji}</span>
                        <div>
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                            curso.nivel === 'Principiante' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            curso.nivel === 'Intermedio' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {curso.nivel}
                          </div>
                          <h3 className="text-3xl font-black text-white">
                            {curso.nombre}
                          </h3>
                        </div>
                      </div>

                      <p className="text-slate-300 text-lg mb-4">
                        {curso.descripcion}
                      </p>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-2 text-slate-400">
                          <span className="text-lg">⏱️</span>
                          <strong className="text-white">{curso.duracion_semanas} semanas</strong>
                        </span>
                        <span className="flex items-center gap-2 text-slate-400">
                          <span className="text-lg">📚</span>
                          <strong className="text-white">{curso.total_clases} clases</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* LO QUE VA A LOGRAR - EL RESULTADO REAL */}
                  <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-4">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2">
                          Al terminar este curso:
                        </h4>
                        <p className="text-slate-200 text-lg leading-relaxed font-medium">
                          {curso.resultado_esperado}
                        </p>
                      </div>
                    </div>

                    {/* Proyecto final - LA PRUEBA REAL */}
                    {curso.proyecto_final && (
                      <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <span className="text-2xl">🎨</span>
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                              Proyecto Final
                            </h5>
                            <p className="text-white font-semibold">
                              {curso.proyecto_final}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Skills con badges modernos */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Skills que dominará:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {curso.skills_principales.map((skill: string, i: number) => (
                        <span
                          key={i}
                          className="px-4 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-white text-sm font-medium hover:bg-slate-700/80 transition-colors"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Arrow to next course */}
                {index < cursos.length - 1 && (
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20">
                    <div className="w-12 h-12 bg-slate-900 border-4 border-slate-950 rounded-full flex items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-slate-400 rotate-90" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          FINAL - EL RESULTADO ÉPICO
          ═══════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="max-w-4xl mx-auto mt-16"
      >
        <div className="bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20 border-4 border-yellow-500/50 rounded-3xl p-10 text-center relative overflow-hidden">
          {/* Animated glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 blur-2xl animate-pulse" />

          <div className="relative z-10">
            <div className="text-7xl mb-6">🎓</div>
            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
              Al completar esta ruta, tu hijo será capaz de:
            </h3>

            <div className="max-w-2xl mx-auto space-y-4 mb-8">
              <p className="text-xl text-white font-semibold bg-slate-900/40 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
                ✅ Crear proyectos reales que puede mostrar a amigos y familia
              </p>
              <p className="text-xl text-white font-semibold bg-slate-900/40 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
                ✅ Entender tecnología a nivel que el 99% de sus compañeros NO tiene
              </p>
              <p className="text-xl text-white font-semibold bg-slate-900/40 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
                ✅ Tener una ventaja ENORME para su futuro académico y profesional
              </p>
            </div>

            <div className="inline-block bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-400/50 rounded-2xl px-6 py-4">
              <p className="text-lg text-slate-200">
                <span className="font-black text-emerald-400">Certificado oficial</span> al completar la ruta completa
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
