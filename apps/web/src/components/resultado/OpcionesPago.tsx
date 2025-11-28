// ═══════════════════════════════════════════════════════════════════════════════
// OPCIONES DE PAGO - ULTRA PERSUASIVO
// Esta sección DEBE convertir. Aquí se decide todo.
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import { motion } from 'framer-motion';
import { Ruta } from '@/types/courses';
import { useState } from 'react';
import { Zap, Shield, Clock, TrendingUp, DollarSign, Sparkles } from 'lucide-react';

interface OpcionesPagoProps {
  ruta: Ruta;
  nombreEstudiante: string;
}

export default function OpcionesPago({ ruta, nombreEstudiante }: OpcionesPagoProps) {
  const [moneda, setMoneda] = useState<'USD' | 'ARS'>('USD');

  // Calcular precios con lógica real
  const precioRutaCompleta = moneda === 'USD' ? ruta.precio_usd : ruta.precio_ars;
  const precioCursosIndividuales = moneda === 'USD' ? ruta.precio_usd * 4 : ruta.precio_ars * 4;
  const ahorro = precioCursosIndividuales - precioRutaCompleta;
  const porcentajeAhorro = Math.round((ahorro / precioCursosIndividuales) * 100);

  // Precio por día (argumento DEMOLEDOR)
  const diasTotales = ruta.duracion_total_meses * 30;
  const precioPorDia = Math.round(precioRutaCompleta / diasTotales);

  return (
    <section id="opciones-pago" className="mb-24">
      {/* ═══════════════════════════════════════════════════════════════════════════
          HEADER ÉPICO
          ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
          className="inline-block mb-6"
        >
          <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-400/50 rounded-full px-6 py-3">
            <span className="text-emerald-400 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Inversión en el Futuro
            </span>
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-black text-white mb-6"
        >
          Menos de{' '}
          <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            ${precioPorDia}/día
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-slate-300 text-2xl max-w-3xl mx-auto mb-8"
        >
          Lo que gastás en un café = el futuro profesional de {nombreEstudiante}
        </motion.p>

        {/* Comparaciones que duelen */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-4">
            <div className="text-3xl mb-2">☕</div>
            <div className="text-slate-400 text-sm">Un café por día sale más caro</div>
          </div>
          <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-4">
            <div className="text-3xl mb-2">🎮</div>
            <div className="text-slate-400 text-sm">Menos que 2 juegos de PlayStation</div>
          </div>
          <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-4">
            <div className="text-3xl mb-2">📱</div>
            <div className="text-slate-400 text-sm">Menos que un celular de gama media</div>
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          LA OFERTA PRINCIPAL - UNA SOLA OPCIÓN DESTACADA
          ═══════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="max-w-4xl mx-auto relative"
      >
        {/* Glow effect masivo */}
        <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 via-cyan-500/30 to-purple-500/30 rounded-3xl blur-3xl animate-pulse" />

        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-4 border-emerald-500/50 rounded-3xl p-12 shadow-2xl">
          {/* Badge explosivo */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 px-8 py-3 rounded-full shadow-2xl">
              <span className="text-white font-black uppercase tracking-wider text-lg flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Ruta Completa - Mejor Precio
                <Sparkles className="w-6 h-6" />
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mt-8">
            {/* IZQUIERDA: Precio y ahorro */}
            <div>
              <h3 className="text-3xl font-black text-white mb-6">Los 4 Cursos Completos</h3>

              {/* Precio tachado */}
              <div className="mb-4">
                <div className="text-slate-500 text-2xl line-through mb-2">
                  ${precioCursosIndividuales.toLocaleString()} {moneda}
                </div>
                <div className="text-7xl font-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                  ${precioRutaCompleta.toLocaleString()}
                </div>
                <div className="text-slate-400 text-lg mb-6">{moneda} • Pago único</div>
              </div>

              {/* Ahorro destacado */}
              <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-400 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-8 h-8 text-emerald-400" />
                  <div>
                    <div className="text-3xl font-black text-emerald-400">
                      ${ahorro.toLocaleString()}
                    </div>
                    <div className="text-slate-300 font-semibold">
                      de ahorro ({porcentajeAhorro}% OFF)
                    </div>
                  </div>
                </div>
                <div className="text-slate-400 text-sm">vs. comprar los cursos por separado</div>
              </div>

              {/* Botón gigante */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-6 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 hover:from-emerald-400 hover:via-cyan-400 hover:to-purple-400 text-white font-black text-2xl rounded-2xl shadow-2xl shadow-emerald-500/50 transition-all mb-4"
              >
                Inscribir a {nombreEstudiante} Ahora 🚀
              </motion.button>

              <div className="text-center text-sm text-slate-500">
                🔒 Pago 100% seguro • Garantía 7 días
              </div>
            </div>

            {/* DERECHA: Beneficios explosivos */}
            <div className="space-y-4">
              <h4 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-cyan-400" />
                Todo lo que incluye:
              </h4>

              <div className="space-y-4">
                <div className="flex items-start gap-4 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-400 font-bold text-xl">✓</span>
                  </div>
                  <div>
                    <div className="text-white font-bold mb-1">4 Cursos Completos</div>
                    <div className="text-slate-400 text-sm">
                      {ruta.duracion_total_meses} meses de contenido progresivo y estructurado
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-white font-bold mb-1">Acceso de por vida</div>
                    <div className="text-slate-400 text-sm">Sin vencimientos. Para siempre.</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-white font-bold mb-1">Soporte Prioritario</div>
                    <div className="text-slate-400 text-sm">
                      Respuestas por WhatsApp en menos de 24hs
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div>
                    <div className="text-white font-bold mb-1">Certificado Oficial</div>
                    <div className="text-slate-400 text-sm">Al completar la ruta completa</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-400/50 rounded-xl p-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/30 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-white font-bold mb-1">Garantía 100% - 7 días</div>
                    <div className="text-slate-300 text-sm font-medium">
                      Si no te convence, devolvemos TODO tu dinero. Sin preguntas.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          ARGUMENTOS FINALES DEMOLEDORES
          ═══════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.7 }}
        className="max-w-4xl mx-auto mt-16 grid md:grid-cols-3 gap-6"
      >
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-2xl p-6 text-center">
          <div className="text-5xl mb-4">💰</div>
          <div className="text-2xl font-black text-white mb-2">${precioPorDia}</div>
          <div className="text-purple-400 font-semibold mb-1">por día</div>
          <div className="text-slate-400 text-sm">durante {diasTotales} días</div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-2xl p-6 text-center">
          <div className="text-5xl mb-4">📚</div>
          <div className="text-2xl font-black text-white mb-2">{ruta.cursos.length * 12}+</div>
          <div className="text-cyan-400 font-semibold mb-1">clases en total</div>
          <div className="text-slate-400 text-sm">contenido de calidad premium</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-400/30 rounded-2xl p-6 text-center">
          <div className="text-5xl mb-4">♾️</div>
          <div className="text-2xl font-black text-white mb-2">Para siempre</div>
          <div className="text-emerald-400 font-semibold mb-1">sin vencimiento</div>
          <div className="text-slate-400 text-sm">acceso de por vida</div>
        </div>
      </motion.div>

      {/* Última llamada a la acción */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.9 }}
        className="max-w-3xl mx-auto mt-16 text-center"
      >
        <div className="bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-orange-500/10 border-2 border-orange-400/40 rounded-3xl p-10">
          <div className="text-5xl mb-4">⏰</div>
          <h4 className="text-3xl font-black text-white mb-4">
            La motivación de {nombreEstudiante} es HOY
          </h4>
          <p className="text-slate-300 text-lg leading-relaxed mb-6">
            Los padres que toman acción cuando sus hijos muestran interés ven los{' '}
            <strong className="text-white">mejores resultados</strong>. La ventana de oportunidad es
            ahora.
          </p>
          <p className="text-slate-400 text-sm">
            Más de 5,000 familias ya confiaron en Mateatletas
          </p>
        </div>
      </motion.div>
    </section>
  );
}
