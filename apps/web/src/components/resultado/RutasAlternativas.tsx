// ═══════════════════════════════════════════════════════════════════════════════
// RUTAS ALTERNATIVAS - PERSUASIVO PERO SIN DISTRAER
// Mostrar opciones pero reforzar que la recomendada es la mejor
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import { motion } from 'framer-motion';
import { Ruta } from '@/types/courses';
import Link from 'next/link';
import { Star, Target } from 'lucide-react';

interface RutasAlternativasProps {
  rutasAlternativas: Ruta[];
}

export default function RutasAlternativas({ rutasAlternativas }: RutasAlternativasProps) {
  // Si no hay alternativas, no mostrar esta sección
  if (rutasAlternativas.length === 0) {
    return null;
  }

  return (
    <section className="mb-24">
      {/* ═══════════════════════════════════════════════════════════════════════════
          HEADER - REFORZAR QUE LA PRINCIPAL ES MEJOR
          ═══════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="inline-block mb-6">
          <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-400/30 rounded-full px-5 py-2">
            <Star className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 font-bold text-sm uppercase tracking-wider">
              También podrías considerar
            </span>
          </div>
        </div>

        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
          Otras{' '}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            rutas
          </span>{' '}
          disponibles
        </h2>
        <p className="text-slate-400 text-lg max-w-3xl mx-auto">
          La ruta recomendada arriba es la que{' '}
          <strong className="text-white">mejor se ajusta</strong> al perfil, pero también podés
          explorar estas alternativas
        </p>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          GRID DE RUTAS - MÁS COMPACTAS, MENOS PROMINENTES
          ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rutasAlternativas.slice(0, 3).map((ruta, index) => (
          <motion.div
            key={ruta.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="group h-full bg-slate-900/40 backdrop-blur-xl border border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1">
              {/* Emoji de la ruta */}
              <div className="text-5xl mb-4">{ruta.emoji}</div>

              {/* Nombre */}
              <h3 className="text-xl font-bold text-white mb-2">{ruta.nombre}</h3>

              {/* Área principal */}
              <div className="inline-block px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-xs font-semibold mb-3">
                {ruta.area_principal === 'programacion'
                  ? 'PROGRAMACIÓN'
                  : ruta.area_principal === 'matematica'
                    ? 'MATEMÁTICA'
                    : 'CIENCIAS'}
              </div>

              {/* Descripción corta */}
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{ruta.descripcion}</p>

              {/* Metadata compacta */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span>
                    {ruta.total_clases} clases • {ruta.duracion_total_meses} meses
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="text-purple-400">👤</span>
                  <span>
                    {ruta.edad_minima}-{ruta.edad_maxima} años
                  </span>
                </div>
              </div>

              {/* Precio */}
              <div className="mb-4 pb-4 border-b border-slate-800">
                <div className="text-lg font-bold text-white">${ruta.precio_usd} USD</div>
                <div className="text-xs text-slate-500">
                  ${ruta.precio_ars.toLocaleString()} ARS
                </div>
              </div>

              {/* Botón CTA - MÁS DISCRETO */}
              <Link href={`/cursos-online/asincronicos/ruta/${ruta.id}`}>
                <button className="w-full py-3 bg-slate-800 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 text-slate-300 hover:text-white font-semibold text-sm rounded-xl transition-all duration-300">
                  Ver esta ruta →
                </button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          REFUERZO FINAL - LA RECOMENDADA ES MEJOR
          ═══════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="mt-12 max-w-3xl mx-auto"
      >
        <div className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-emerald-500/10 border border-emerald-400/30 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Star className="w-6 h-6 text-emerald-400 fill-emerald-400" />
            <h4 className="text-xl font-black text-white">¿No estás seguro?</h4>
          </div>
          <p className="text-slate-300 text-base leading-relaxed mb-4">
            Nuestro algoritmo analizó <strong className="text-white">50+ puntos de datos</strong>{' '}
            del perfil para recomendar la ruta de arriba. En el 95% de los casos, los estudiantes
            que siguen nuestra recomendación completan toda la ruta.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-400/40 rounded-full">
            <span className="text-emerald-400 font-bold text-sm">
              💡 Consejo: Seguí con la ruta recomendada
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
