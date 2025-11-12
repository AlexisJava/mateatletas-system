// ═══════════════════════════════════════════════════════════════════════════════
// DESCUENTO MÚLTIPLE HIJO - ULTRA PERSUASIVO
// Transformar objeción de precio en oportunidad de ahorro masivo
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { TrendingDown, Users, Sparkles } from 'lucide-react';

interface DescuentoMultipleHijoProps {
  precioBase: number;
  moneda: 'USD' | 'ARS';
  nombreEstudiante: string;
}

export default function DescuentoMultipleHijo({ precioBase, moneda, nombreEstudiante }: DescuentoMultipleHijoProps) {
  const [cantidadHijos, setCantidadHijos] = useState(1);

  // Calcular precio total con descuentos
  const calcularPrecioTotal = () => {
    if (cantidadHijos === 1) {
      return precioBase;
    }

    let total = precioBase; // Primer hijo: precio completo

    for (let i = 2; i <= cantidadHijos; i++) {
      if (i === 2) {
        // Segundo hijo: 30% descuento
        total += precioBase * 0.7;
      } else {
        // Tercer hijo en adelante: 50% descuento
        total += precioBase * 0.5;
      }
    }

    return Math.round(total);
  };

  const precioTotal = calcularPrecioTotal();
  const precioSinDescuento = precioBase * cantidadHijos;
  const ahorroTotal = precioSinDescuento - precioTotal;
  const porcentajeAhorro = cantidadHijos > 1
    ? Math.round((ahorroTotal / precioSinDescuento) * 100)
    : 0;

  // Precio por hijo promedio
  const precioPorHijo = cantidadHijos > 1 ? Math.round(precioTotal / cantidadHijos) : precioBase;

  return (
    <section className="mb-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto"
      >
        {/* ═══════════════════════════════════════════════════════════════════════════
            HEADER ÉPICO - APUNTA A LA AMBICIÓN FAMILIAR
            ═══════════════════════════════════════════════════════════════════════════ */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', duration: 0.8, bounce: 0.5 }}
            className="text-7xl mb-6"
          >
            👨‍👩‍👧‍👦
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-black text-white mb-4"
          >
            ¿Tenés más de un hijo?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-2xl text-slate-300 mb-6"
          >
            <span className="text-yellow-400 font-bold">Ahorrá hasta 50%</span> inscribiendo a tus hijos juntos
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-orange-500/10 border-2 border-orange-400/30 rounded-2xl p-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Users className="w-8 h-8 text-orange-400" />
                <h3 className="text-xl font-black text-white">
                  Descuento Familiar Automático
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-3 text-left">
                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">2️⃣</span>
                    <span className="text-sm text-slate-400">Segundo hijo</span>
                  </div>
                  <div className="text-2xl font-black text-cyan-400">30% OFF</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">3️⃣</span>
                    <span className="text-sm text-slate-400">Tercer hijo+</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-400">50% OFF</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════════
            CALCULADORA INTERACTIVA - ULTRA VISUAL
            ═══════════════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="relative"
        >
          {/* Glow effect */}
          {cantidadHijos > 1 && (
            <div className="absolute -inset-3 bg-gradient-to-r from-emerald-500/30 via-cyan-500/30 to-purple-500/30 rounded-3xl blur-2xl animate-pulse" />
          )}

          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700 rounded-3xl p-8 md:p-10">
            {/* Selector de cantidad - MÁS GRANDE */}
            <div className="mb-10">
              <label className="block text-slate-300 font-bold text-xl mb-6 text-center">
                ¿Cuántos hijos querés inscribir?
              </label>

              <div className="flex items-center justify-center gap-6">
                {/* Botón menos */}
                <motion.button
                  onClick={() => setCantidadHijos(Math.max(1, cantidadHijos - 1))}
                  disabled={cantidadHijos <= 1}
                  whileHover={cantidadHijos > 1 ? { scale: 1.1 } : {}}
                  whileTap={cantidadHijos > 1 ? { scale: 0.9 } : {}}
                  className={`w-16 h-16 rounded-2xl font-bold text-3xl transition-all shadow-xl ${
                    cantidadHijos <= 1
                      ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white shadow-cyan-500/50'
                  }`}
                >
                  −
                </motion.button>

                {/* Display número - GIGANTE */}
                <div className="w-40 text-center">
                  <motion.div
                    key={cantidadHijos}
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-8xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                  >
                    {cantidadHijos}
                  </motion.div>
                  <div className="text-slate-400 text-lg mt-2 font-semibold">
                    {cantidadHijos === 1 ? 'hijo' : 'hijos'}
                  </div>
                </div>

                {/* Botón más */}
                <motion.button
                  onClick={() => setCantidadHijos(Math.min(5, cantidadHijos + 1))}
                  disabled={cantidadHijos >= 5}
                  whileHover={cantidadHijos < 5 ? { scale: 1.1 } : {}}
                  whileTap={cantidadHijos < 5 ? { scale: 0.9 } : {}}
                  className={`w-16 h-16 rounded-2xl font-bold text-3xl transition-all shadow-xl ${
                    cantidadHijos >= 5
                      ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white shadow-purple-500/50'
                  }`}
                >
                  +
                </motion.button>
              </div>
            </div>

            {/* Desglose visual - SIMPLIFICADO */}
            <motion.div
              key={cantidadHijos}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <div className="grid gap-3">
                {Array.from({ length: cantidadHijos }, (_, i) => i + 1).map((numeroHijo) => {
                  let precioHijo = precioBase;
                  let descuento = 0;
                  let emoji = '👤';
                  let borderColor = 'border-slate-700';
                  let bgColor = 'bg-slate-800/30';

                  if (numeroHijo === 2) {
                    descuento = 30;
                    precioHijo = precioBase * 0.7;
                    emoji = '👥';
                    borderColor = 'border-cyan-500/40';
                    bgColor = 'bg-cyan-500/10';
                  } else if (numeroHijo >= 3) {
                    descuento = 50;
                    precioHijo = precioBase * 0.5;
                    emoji = '👨‍👩‍👧';
                    borderColor = 'border-emerald-500/40';
                    bgColor = 'bg-emerald-500/10';
                  }

                  return (
                    <motion.div
                      key={numeroHijo}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: numeroHijo * 0.05 }}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 ${borderColor} ${bgColor}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{emoji}</span>
                        <div>
                          <div className="font-bold text-white text-lg">
                            {numeroHijo === 1 ? nombreEstudiante : `Hijo ${numeroHijo}`}
                          </div>
                          {descuento > 0 && (
                            <div className="flex items-center gap-2">
                              <TrendingDown className="w-4 h-4 text-emerald-400" />
                              <span className="text-sm text-emerald-400 font-bold">
                                {descuento}% de descuento aplicado
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {descuento > 0 && (
                          <div className="text-slate-500 text-sm line-through">
                            ${precioBase.toLocaleString()}
                          </div>
                        )}
                        <div className={`font-black text-2xl ${numeroHijo === 1 ? 'text-white' : 'text-emerald-400'}`}>
                          ${Math.round(precioHijo).toLocaleString()}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Divider */}
            <div className="border-t-2 border-dashed border-slate-700 my-8" />

            {/* TOTAL - MEGA DESTACADO */}
            <div className="bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-purple-500/20 border-2 border-emerald-500/50 rounded-2xl p-8">
              <div className="grid md:grid-cols-2 gap-6 items-center mb-6">
                {/* IZQUIERDA: Total a pagar */}
                <div>
                  <div className="text-slate-400 text-sm mb-2">Total a pagar</div>
                  <div className="text-6xl font-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    ${precioTotal.toLocaleString()}
                  </div>
                  <div className="text-slate-400 text-sm mt-1">{moneda}</div>
                </div>

                {/* DERECHA: Ahorro */}
                {cantidadHijos > 1 && (
                  <div className="text-right">
                    <div className="text-slate-400 text-sm mb-2">Sin descuento serían</div>
                    <div className="text-3xl text-slate-500 line-through mb-3">
                      ${precioSinDescuento.toLocaleString()}
                    </div>
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-3 inline-block">
                      <div className="text-slate-900 font-black text-xl">
                        ¡Ahorrás ${ahorroTotal.toLocaleString()}!
                      </div>
                      <div className="text-slate-900 text-sm font-bold">
                        ({porcentajeAhorro}% de descuento total)
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Precio por hijo promedio - ARGUMENTO DEMOLEDOR */}
              {cantidadHijos > 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-purple-500/20 border border-purple-400/30 rounded-xl p-5 text-center"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    <div>
                      <div className="text-purple-400 text-sm font-semibold mb-1">
                        Precio promedio por hijo
                      </div>
                      <div className="text-4xl font-black text-white">
                        ${precioPorHijo.toLocaleString()}
                      </div>
                      <div className="text-slate-400 text-sm mt-1">
                        vs. ${precioBase.toLocaleString()} pagando por separado
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* CTA GIGANTE */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-8 py-6 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 hover:from-emerald-400 hover:via-cyan-400 hover:to-purple-400 text-white font-black text-2xl rounded-2xl shadow-2xl shadow-emerald-500/50 transition-all"
            >
              {cantidadHijos === 1
                ? `Inscribir a ${nombreEstudiante} 🚀`
                : `Inscribir a mis ${cantidadHijos} hijos y ahorrar $${ahorroTotal.toLocaleString()} 🎉`}
            </motion.button>

            <div className="text-center text-sm text-slate-500 mt-4">
              🔒 Descuento aplicado automáticamente en el checkout
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════════════
            MENSAJE MOTIVACIONAL - INVERSIÓN EN LA FAMILIA
            ═══════════════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="mt-12 max-w-3xl mx-auto"
        >
          <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-400/30 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-2xl font-black text-white mb-3">
              Familias que aprenden juntas, crecen juntas
            </h3>
            <p className="text-slate-300 text-lg leading-relaxed">
              Cuando hermanos hacen cursos juntos, se apoyan mutuamente, compiten sanamente
              y <strong className="text-white">aprenden más rápido</strong>. Es una inversión
              en el futuro de toda tu familia.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
