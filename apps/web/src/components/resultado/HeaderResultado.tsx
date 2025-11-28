// ═══════════════════════════════════════════════════════════════════════════════
// HEADER DE CONFIRMACIÓN - ULTRA PERSUASIVO
// Hace que el padre sienta que esta es LA decisión correcta para su hijo
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import { motion } from 'framer-motion';
import { QuizResponses } from '@/types/courses';
import { Sparkles, Target, TrendingUp, Award } from 'lucide-react';

interface HeaderResultadoProps {
  nombreEstudiante: string;
  edad: number;
  respuestas: QuizResponses;
  mensaje: string;
}

export default function HeaderResultado({
  nombreEstudiante,
  edad,
  respuestas,
  mensaje,
}: HeaderResultadoProps) {
  // ═══════════════════════════════════════════════════════════════════════════
  // MAPEAR CAMPOS A TEXTOS ULTRA PERSUASIVOS
  // ═══════════════════════════════════════════════════════════════════════════

  // Objetivo principal - ESTO ES LO MÁS IMPORTANTE
  const objetivoMap: Record<string, { texto: string; impacto: string; emoji: string }> = {
    crear_su_propio_juego: {
      texto: 'crear su propio videojuego',
      impacto:
        'De jugador a creador: Transformará su pasión por los juegos en una habilidad del futuro',
      emoji: '🎮',
    },
    publicar_juego_roblox: {
      texto: 'publicar un juego en Roblox',
      impacto:
        'Millones de jugadores podrían jugar su creación. Algunos niños ganan $1000+ USD/mes con sus juegos',
      emoji: '🎨',
    },
    ganar_olimpiada: {
      texto: 'destacarse en olimpiadas',
      impacto:
        'Las olimpiadas abren puertas a becas universitarias y oportunidades internacionales',
      emoji: '🏆',
    },
    hacer_web_propia: {
      texto: 'crear su propia página web',
      impacto:
        'A los 15 años podría estar ganando dinero como freelancer. El desarrollo web es la skill más demandada',
      emoji: '🌐',
    },
    entender_como_funcionan_juegos: {
      texto: 'entender cómo funcionan los juegos',
      impacto:
        'La industria de videojuegos mueve más de $180 mil millones al año - más que cine y música juntos',
      emoji: '🔍',
    },
    mejorar_en_mate: {
      texto: 'mejorar en matemáticas',
      impacto: 'La matemática abre TODAS las puertas: ingeniería, medicina, economía, tecnología',
      emoji: '📈',
    },
    aprender_ia: {
      texto: 'aprender sobre Inteligencia Artificial',
      impacto:
        'La IA está transformando el mundo. Los expertos en IA son los profesionales más buscados del 2025',
      emoji: '🤖',
    },
    crear_app: {
      texto: 'crear su propia app',
      impacto:
        'Mark Zuckerberg creó Facebook a los 19. Muchas apps exitosas fueron creadas por adolescentes',
      emoji: '📱',
    },
    explorar_ciencia: {
      texto: 'explorar experimentos científicos',
      impacto:
        'La curiosidad científica es el primer paso hacia descubrimientos que cambien el mundo',
      emoji: '🔬',
    },
  };

  const objetivo = objetivoMap[respuestas.objetivo_principal] || {
    texto: 'desarrollar nuevas habilidades',
    impacto: 'Las habilidades tecnológicas son el pasaporte al futuro',
    emoji: '🚀',
  };

  // Nivel de motivación - usado para el tono del mensaje
  const estaMotivado = ['muy_motivado', 'curioso'].includes(respuestas.nivel_motivacion);

  // Personalidad - para mostrar el approach correcto
  const personalidadInsights: Record<string, string> = {
    insiste_solo:
      'Su perseverancia es oro puro. Los estudiantes que insisten solos logran resultados extraordinarios.',
    pide_ayuda:
      'Saber pedir ayuda es señal de inteligencia emocional. Los mejores profesionales colaboran.',
    busca_alternativa: 'Los creativos que buscan alternativas son los innovadores del futuro.',
    se_frustra:
      'Con el apoyo adecuado, la frustración se transforma en motivación. Lo hemos visto mil veces.',
  };

  return (
    <div className="mb-20">
      {/* ═══════════════════════════════════════════════════════════════════════════
          PARTE 1: EXPLOSIÓN DE CONFETI + TÍTULO ÉPICO
          ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8, bounce: 0.6 }}
          className="text-8xl mb-8"
        >
          🎯
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-block mb-6"
        >
          <div className="flex items-center gap-3 bg-emerald-500/20 border-2 border-emerald-400/50 rounded-full px-6 py-3">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-bold uppercase tracking-wider text-sm">
              Encontramos el camino perfecto
            </span>
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight"
        >
          Esta ruta llevará a{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {nombreEstudiante}
          </span>
          <br />
          de donde está hoy...
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', bounce: 0.4 }}
          className="inline-block"
        >
          <div className="text-6xl md:text-7xl mb-4">↓</div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-3xl md:text-5xl font-black text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text mb-8"
        >
          ...a {objetivo.texto} {objetivo.emoji}
        </motion.h2>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          PARTE 2: EL IMPACTO - POR QUÉ ESTO IMPORTA
          ═══════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="max-w-4xl mx-auto mb-16"
      >
        <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 border-2 border-purple-400/30 rounded-3xl p-8 md:p-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-white mb-3">
                Esto es lo que va a lograr:
              </h3>
              <p className="text-slate-200 text-lg md:text-xl leading-relaxed">
                {objetivo.impacto}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          PARTE 3: POR QUÉ ESTA RUTA ES PERFECTA
          ═══════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="max-w-5xl mx-auto mb-16"
      >
        <div className="text-center mb-10">
          <h3 className="text-3xl md:text-4xl font-black text-white mb-3">
            ¿Por qué esta ruta es <span className="text-cyan-400">perfecta</span> para{' '}
            {nombreEstudiante}?
          </h3>
          <p className="text-slate-400 text-lg">
            Nuestro algoritmo analizó {edad} años, personalidad, intereses y objetivos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Factor 1: Objetivo alineado */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6"
          >
            <div className="w-14 h-14 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
              <Target className="w-7 h-7 text-cyan-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Objetivo claro</h4>
            <p className="text-slate-300 leading-relaxed">
              Quiere <strong className="text-cyan-400">{objetivo.texto}</strong> y esta ruta está
              diseñada específicamente para lograrlo.
            </p>
          </motion.div>

          {/* Factor 2: Nivel apropiado */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6"
          >
            <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-7 h-7 text-purple-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Nivel perfecto</h4>
            <p className="text-slate-300 leading-relaxed">
              {respuestas.nivel_programacion === 'nunca' &&
                'Arranca desde cero con bases sólidas. No necesita experiencia previa.'}
              {respuestas.nivel_programacion === 'scratch_basico' &&
                'Construye sobre lo que ya sabe, sin aburrirse con lo básico.'}
              {respuestas.nivel_programacion === 'scratch_avanzado' &&
                'Desafíos a su altura que lo llevarán al siguiente nivel.'}
              {respuestas.nivel_programacion === 'otro_lenguaje' &&
                'Aprovecha su experiencia previa para avanzar rápido.'}
            </p>
          </motion.div>

          {/* Factor 3: Personalidad compatible */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6"
          >
            <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-emerald-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Se adapta a su forma de aprender</h4>
            <p className="text-slate-300 leading-relaxed">
              {personalidadInsights[respuestas.personalidad_problema] ||
                'El formato asincrónico le permite avanzar a su propio ritmo.'}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          PARTE 4: MENSAJE PERSONALIZADO DEL ALGORITMO
          ═══════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-xl border-2 border-slate-700 rounded-3xl p-8 md:p-10 relative overflow-hidden">
          {/* Decorative corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">🧠</div>
              <div>
                <h4 className="text-sm uppercase tracking-wider text-cyan-400 font-bold">
                  Análisis personalizado
                </h4>
                <p className="text-xs text-slate-500">
                  Basado en 50+ puntos de datos únicos de {nombreEstudiante}
                </p>
              </div>
            </div>

            <p className="text-xl md:text-2xl text-white leading-relaxed font-medium">{mensaje}</p>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          PARTE 5: URGENCIA SUAVE - EL MOMENTO ES AHORA
          ═══════════════════════════════════════════════════════════════════════════ */}
      {estaMotivado && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="max-w-3xl mx-auto mt-16"
        >
          <div className="bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-orange-500/10 border border-orange-400/30 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h4 className="text-2xl font-black text-white mb-3">
              {nombreEstudiante} está motivado/a - aprovechá ese momento
            </h4>
            <p className="text-slate-300 text-lg leading-relaxed">
              La motivación en niños es como una ventana: cuando está abierta, hay que aprovecharla.
              Los padres que actúan cuando sus hijos muestran interés ven los mejores resultados.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
