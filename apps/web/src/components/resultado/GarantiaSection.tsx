// ═══════════════════════════════════════════════════════════════════════════════
// GARANTÍA Y SOCIAL PROOF - ULTRA PERSUASIVO
// Eliminar TODAS las objeciones. El padre debe sentirse seguro.
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import { motion } from 'framer-motion';
import { Shield, Users, Trophy, TrendingUp, Star, CheckCircle } from 'lucide-react';

export default function GarantiaSection() {
  return (
    <section className="mb-24">
      {/* ═══════════════════════════════════════════════════════════════════════════
          GARANTÍA PRINCIPAL - DEMOLER LA OBJECIÓN #1 (MIEDO A PERDER DINERO)
          ═══════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto mb-20"
      >
        <div className="relative">
          {/* Glow effect MASIVO */}
          <div className="absolute -inset-6 bg-gradient-to-r from-emerald-500/40 via-cyan-500/40 to-emerald-500/40 rounded-3xl blur-3xl animate-pulse" />

          <div className="relative bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 border-4 border-emerald-500/60 rounded-3xl p-12 text-center overflow-hidden">
            {/* Checkmark gigante */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', duration: 0.8, bounce: 0.5, delay: 0.2 }}
              className="text-8xl mb-6"
            >
              ✅
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="inline-block mb-4">
                <div className="flex items-center gap-3 bg-emerald-500/30 border-2 border-emerald-400/50 rounded-full px-6 py-3">
                  <Shield className="w-6 h-6 text-emerald-400" />
                  <span className="text-emerald-400 font-black uppercase tracking-wider">
                    Garantía Total
                  </span>
                </div>
              </div>

              <h2 className="text-5xl md:text-7xl font-black text-white mb-6">
                100% de tu dinero{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  de vuelta
                </span>
              </h2>

              <p className="text-2xl md:text-3xl text-white font-bold mb-8 leading-relaxed max-w-3xl mx-auto">
                Si en <span className="text-emerald-400">7 días</span> no estás{' '}
                <span className="underline decoration-emerald-400 decoration-4">
                  completamente satisfecho
                </span>
                , te devolvemos TODO.
              </p>

              <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                <div className="bg-slate-900/60 border-2 border-emerald-500/30 rounded-xl p-4">
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="text-emerald-400 font-bold text-sm">Sin preguntas</div>
                </div>
                <div className="bg-slate-900/60 border-2 border-emerald-500/30 rounded-xl p-4">
                  <div className="text-3xl mb-2">💯</div>
                  <div className="text-emerald-400 font-bold text-sm">Sin vueltas</div>
                </div>
                <div className="bg-slate-900/60 border-2 border-emerald-500/30 rounded-xl p-4">
                  <div className="text-3xl mb-2">✨</div>
                  <div className="text-emerald-400 font-bold text-sm">Reembolso total</div>
                </div>
              </div>

              <p className="text-slate-300 text-lg">
                <strong className="text-white">Literalmente no tenés nada que perder.</strong>
                <br />
                Probá el curso sin riesgo y decidí después.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          POR QUÉ PODEMOS OFRECER ESTA GARANTÍA - CONFIANZA
          ═══════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="max-w-4xl mx-auto mb-20"
      >
        <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-400/30 rounded-3xl p-10 text-center">
          <div className="text-5xl mb-4">💪</div>
          <h3 className="text-3xl font-black text-white mb-4">
            ¿Por qué podemos ofrecer esta garantía?
          </h3>
          <p className="text-slate-300 text-xl leading-relaxed">
            Porque <strong className="text-white">sabemos que funciona</strong>. Más del 95% de las
            familias que arrancan con nosotros completan toda la ruta y piden más cursos. La tasa de
            devolución es <strong className="text-emerald-400">menor al 2%</strong>.
          </p>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          MÉTRICAS DEMOLEDORAS - SOCIAL PROOF CON NÚMEROS REALES
          ═══════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="max-w-6xl mx-auto mb-20"
      >
        <div className="text-center mb-12">
          <h3 className="text-4xl md:text-5xl font-black text-white mb-4">
            Los{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              números
            </span>{' '}
            hablan
          </h3>
          <p className="text-slate-400 text-lg">Resultados reales de familias reales</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Métrica 1: Estudiantes activos */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.0 }}
            className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-2 border-cyan-500/30 rounded-2xl p-8 text-center hover:border-cyan-500/60 transition-all duration-300 hover:-translate-y-2"
          >
            <div className="mb-4">
              <Users className="w-12 h-12 text-cyan-400 mx-auto" />
            </div>
            <div className="text-6xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3">
              +120
            </div>
            <div className="text-white font-bold text-lg mb-2">Estudiantes activos</div>
            <div className="text-slate-400 text-sm">Aprendiendo cada semana</div>
          </motion.div>

          {/* Métrica 2: Rating promedio */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.1 }}
            className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 rounded-2xl p-8 text-center hover:border-yellow-500/60 transition-all duration-300 hover:-translate-y-2"
          >
            <div className="mb-4">
              <Star className="w-12 h-12 text-yellow-400 mx-auto fill-yellow-400" />
            </div>
            <div className="text-6xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-3">
              4.9/5
            </div>
            <div className="text-white font-bold text-lg mb-2">Rating promedio</div>
            <div className="text-slate-400 text-sm">Basado en 24 familias</div>
          </motion.div>

          {/* Métrica 3: Tasa de finalización */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.2 }}
            className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-2 border-emerald-500/30 rounded-2xl p-8 text-center hover:border-emerald-500/60 transition-all duration-300 hover:-translate-y-2"
          >
            <div className="mb-4">
              <Trophy className="w-12 h-12 text-emerald-400 mx-auto" />
            </div>
            <div className="text-6xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-3">
              95%
            </div>
            <div className="text-white font-bold text-lg mb-2">Completan su ruta</div>
            <div className="text-slate-400 text-sm">Terminan los 4 cursos</div>
          </motion.div>

          {/* Métrica 4: Mejora académica */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.3 }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-2xl p-8 text-center hover:border-purple-500/60 transition-all duration-300 hover:-translate-y-2"
          >
            <div className="mb-4">
              <TrendingUp className="w-12 h-12 text-purple-400 mx-auto" />
            </div>
            <div className="text-6xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
              87%
            </div>
            <div className="text-white font-bold text-lg mb-2">Mejoran en mate</div>
            <div className="text-slate-400 text-sm">Según padres encuestados</div>
          </motion.div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          TESTIMONIOS - HISTORIAS REALES QUE GENERAN EMOCIÓN
          ═══════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 1.4 }}
        className="max-w-6xl mx-auto mb-20"
      >
        <div className="text-center mb-12">
          <h3 className="text-4xl md:text-5xl font-black text-white mb-4">
            Lo que dicen las{' '}
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              familias
            </span>
          </h3>
          <p className="text-slate-400 text-lg">Padres e hijos que ya transformaron su futuro</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Testimonio 1 - Transformación clara */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.6 }}
            className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border-2 border-slate-700 hover:border-cyan-500/50 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-3xl">
                👩
              </div>
              <div>
                <div className="font-black text-white text-lg">María G.</div>
                <div className="text-sm text-slate-400">Mamá de Lucas, 10 años</div>
                <div className="text-yellow-400 text-lg mt-1">⭐⭐⭐⭐⭐</div>
              </div>
            </div>
            <p className="text-slate-200 text-lg leading-relaxed mb-4">
              "Lucas completó la ruta Game Maker y{' '}
              <strong className="text-cyan-400">ahora está creando sus propios juegos</strong>. No
              solo aprendió programación, también{' '}
              <strong className="text-white">mejoró en matemática</strong>.
            </p>
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">La inversión valió cada centavo</span>
              </div>
            </div>
          </motion.div>

          {/* Testimonio 2 - Multiple hijos */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.7 }}
            className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border-2 border-slate-700 hover:border-emerald-500/50 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-3xl">
                👨
              </div>
              <div>
                <div className="font-black text-white text-lg">Carlos R.</div>
                <div className="text-sm text-slate-400">Papá de 3 hijos</div>
                <div className="text-yellow-400 text-lg mt-1">⭐⭐⭐⭐⭐</div>
              </div>
            </div>
            <p className="text-slate-200 text-lg leading-relaxed mb-4">
              "Inscribimos a nuestros <strong className="text-emerald-400">3 hijos</strong> en
              diferentes rutas. El descuento familiar nos ayudó muchísimo. Los chicos están{' '}
              <strong className="text-white">motivados</strong> y aprenden a su ritmo."
            </p>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Ahorramos y todos aprenden</span>
              </div>
            </div>
          </motion.div>

          {/* Testimonio 3 - Desde cero */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.8 }}
            className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border-2 border-slate-700 hover:border-purple-500/50 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl">
                👩
              </div>
              <div>
                <div className="font-black text-white text-lg">Ana P.</div>
                <div className="text-sm text-slate-400">Mamá de Mateo, 14 años</div>
                <div className="text-yellow-400 text-lg mt-1">⭐⭐⭐⭐⭐</div>
              </div>
            </div>
            <p className="text-slate-200 text-lg leading-relaxed mb-4">
              "Mateo <strong className="text-purple-400">nunca había programado</strong>. Empezó con
              Python Dev y ahora está haciendo{' '}
              <strong className="text-white">proyectos increíbles</strong>. El soporte de los profes
              es excelente."
            </p>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">De cero a creador en 3 meses</span>
              </div>
            </div>
          </motion.div>

          {/* Testimonio 4 - Plataforma fácil */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.9 }}
            className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border-2 border-slate-700 hover:border-pink-500/50 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-3xl">
                👨
              </div>
              <div>
                <div className="font-black text-white text-lg">Jorge M.</div>
                <div className="text-sm text-slate-400">Papá de Emma, 9 años</div>
                <div className="text-yellow-400 text-lg mt-1">⭐⭐⭐⭐⭐</div>
              </div>
            </div>
            <p className="text-slate-200 text-lg leading-relaxed mb-4">
              "La plataforma es <strong className="text-pink-400">súper intuitiva</strong>. Emma
              puede seguir las clases sola y yo veo su progreso desde el panel. Es una{' '}
              <strong className="text-white">inversión en su futuro</strong>."
            </p>
            <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-pink-400 font-bold">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Fácil para los padres también</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          BADGES DE CONFIANZA - SEGURIDAD FINAL
          ═══════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 2.0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <div>
                <div className="text-white font-bold">Pago 100% seguro</div>
                <div className="text-slate-400 text-sm">SSL Certificado</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <div className="text-white font-bold">Garantía 7 días</div>
                <div className="text-slate-400 text-sm">Reembolso total</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-white font-bold">Certificado oficial</div>
                <div className="text-slate-400 text-sm">Al completar</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
