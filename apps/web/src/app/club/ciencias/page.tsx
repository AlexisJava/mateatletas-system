'use client';

import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

/**
 * Página del Mundo Ciencias para Club STEAM 2026
 * - Color palette: #10b981 to #059669 (green)
 * - Argentine Spanish colloquialisms
 * - Asymmetric grids with visual symmetry
 * - TypeScript strict mode
 */
export default function ClubCienciasPage() {
  const topicsBasic = [
    { icon: '🔬', title: 'Experimentos Químicos', desc: 'Reacciones que parecen magia pero son ciencia' },
    { icon: '⚡', title: 'Física Experimental', desc: 'De la gravedad a la electricidad' },
    { icon: '🌱', title: 'Biología Práctica', desc: 'Cómo funcionan los seres vivos' },
    { icon: '🌍', title: 'Ciencias de la Tierra', desc: 'Volcanes, terremotos, y clima' },
  ];

  const topicsAdvanced = [
    { icon: '🔭', title: 'Astronomía & Astrofísica', desc: 'Del sistema solar a agujeros negros' },
    { icon: '🧬', title: 'Genética & Biotecnología', desc: 'ADN, CRISPR, y el futuro de la vida' },
    { icon: '⚛️', title: 'Física Cuántica', desc: 'El mundo microscópico que desafía la intuición' },
    { icon: '🌡️', title: 'Termodinámica Aplicada', desc: 'Energía, calor, y máquinas térmicas' },
  ];

  const benefits = [
    {
      icon: '🧪',
      title: 'Experimentos en vivo',
      desc: 'Mirás los experimentos en tiempo real por Zoom',
      color: 'from-[#10b981] to-[#059669]',
    },
    {
      icon: '🔍',
      title: 'Método científico aplicado',
      desc: 'Aprendés a pensar como científico, no a memorizar',
      color: 'from-[#059669] to-[#047857]',
    },
    {
      icon: '📚',
      title: 'Preparación para olimpíadas',
      desc: 'Olimpíadas Argentinas de Física, Química, Biología',
      color: 'from-[#10b981] to-[#34d399]',
    },
    {
      icon: '🌟',
      title: 'Ciencia aplicada al mundo real',
      desc: 'Entendés cómo funciona TODO lo que te rodea',
      color: 'from-[#059669] to-[#10b981]',
    },
  ];

  const testimonials = [
    {
      name: 'Abril C.',
      age: 14,
      quote: 'Hicimos un volcán casero que explotó de verdad. Ahora entiendo reacciones exotérmicas sin estudiar.',
      achievement: 'Medallista olimpíada de Química',
    },
    {
      name: 'Franco M.',
      age: 16,
      quote: 'Antes veía videos de ciencia en YouTube. Ahora los hago yo y los explico. Tengo 15K seguidores.',
      achievement: 'Divulgador científico',
    },
    {
      name: 'Milagros P.',
      age: 12,
      quote: 'Cultivé bacterias en una placa de Petri y las observé en el microscopio. Fue fascinante.',
      achievement: 'Proyecto de microbiología',
    },
  ];

  const experiments = [
    {
      title: 'Reacciones Químicas Espectaculares',
      category: 'Química',
      difficulty: 'Básico',
      icon: '💥',
    },
    {
      title: 'Circuitos Eléctricos Caseros',
      category: 'Física',
      difficulty: 'Intermedio',
      icon: '⚡',
    },
    {
      title: 'Extracción de ADN',
      category: 'Biología',
      difficulty: 'Intermedio',
      icon: '🧬',
    },
    {
      title: 'Construcción de Telescopio',
      category: 'Astronomía',
      difficulty: 'Avanzado',
      icon: '🔭',
    },
  ];

  const faqs = [
    {
      question: '¿Necesito materiales especiales para los experimentos?',
      answer:
        'La mayoría de los experimentos los hacemos nosotros en vivo y vos los mirás. Para algunos opcionales que querés hacer en tu casa, usamos materiales que conseguís en cualquier super o farmacia. Nada peligroso ni caro.',
    },
    {
      question: '¿Las clases son solo teoría o también práctica?',
      answer:
        'Principalmente práctica. Hacemos experimentos en vivo, analizamos resultados, formulamos hipótesis, y después entendemos la teoría detrás. El método científico en acción, no en un libro.',
    },
    {
      question: '¿Preparan para olimpíadas de ciencias?',
      answer:
        'Sí, tenemos track específico para Olimpíadas Argentinas de Física, Química, y Biología. También participamos en ferias de ciencias escolares. Te ayudamos a armar tu proyecto científico.',
    },
    {
      question: '¿Puedo combinar Ciencias con Matemática?',
      answer:
        'Totalmente recomendado. Muchos experimentos requieren cálculos y la matemática te ayuda a entender mejor la física y química. Con el plan COMPLETO ($105.600/mes) tenés los 3 mundos.',
    },
  ];

  return (
    <div>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section - Asymmetric */}
        <section className="section-landing" style={{ paddingTop: '160px', paddingBottom: '80px' }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8 items-center mb-16">
              {/* Left - Icon + Title (2 cols) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-3xl flex items-center justify-center text-5xl shadow-2xl">
                    <span role="img" aria-label="Microscopio - Ciencias">
                      🔬
                    </span>
                  </div>
                  <h1 className="text-5xl md:text-6xl font-black leading-tight">
                    <span className="text-white">Mundo</span>
                    <br />
                    <span className="bg-gradient-to-r from-[#10b981] to-[#059669] bg-clip-text text-transparent">
                      Ciencias
                    </span>
                  </h1>
                </div>

                <p className="text-xl text-white/80 leading-relaxed">
                  De experimentos que explotan a entender cómo funciona el universo. De observar bacterias en el
                  microscopio a construir tu propio telescopio.
                  <br />
                  <strong className="text-white">
                    Ciencia que te hace ver el mundo con otros ojos.
                  </strong>
                </p>
              </div>

              {/* Right - Quick Info Card (1 col) */}
              <div className="card-glass p-8 rounded-3xl border-2 border-[#10b981]/30 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl" role="img" aria-label="Reloj">
                    ⏰
                  </span>
                  <div>
                    <div className="text-2xl font-black text-white">2 clases/semana</div>
                    <p className="text-gray-400 text-sm">90 minutos de pura ciencia</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl" role="img" aria-label="Personas">
                    👥
                  </span>
                  <div>
                    <div className="text-2xl font-black text-white">Grupos reducidos</div>
                    <p className="text-gray-400 text-sm">Máximo 12 científicos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl" role="img" aria-label="Edad">
                    🎯
                  </span>
                  <div>
                    <div className="text-2xl font-black text-white">6 a 18 años</div>
                    <p className="text-gray-400 text-sm">De básico a universitario</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-5 justify-center">
              <Link href="/register" className="btn-pulse">
                Quiero experimentar con ciencia
              </Link>
              <Link href="/club" className="btn-arrow">
                Ver precios del Club STEAM
              </Link>
            </div>
          </div>
        </section>

        {/* Topics Section */}
        <section className="section-landing">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                ¿Qué vas a descubrir?
              </h2>
              <p className="text-xl text-white/70">
                Desde química explosiva hasta física cuántica. Ciencia real, no de libro.
              </p>
            </div>

            {/* Basic Topics Grid - Asymmetric */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {topicsBasic.map((topic, index) => (
                <div
                  key={index}
                  className={`card-glass p-6 rounded-3xl border-2 border-[#10b981]/20 hover:border-[#10b981]/50 transition-all ${
                    index === 0 ? 'md:col-span-2 lg:col-span-1' : ''
                  }`}
                >
                  <div className="text-4xl mb-4" role="img" aria-label={topic.title}>
                    {topic.icon}
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">{topic.title}</h3>
                  <p className="text-gray-400">{topic.desc}</p>
                </div>
              ))}
            </div>

            {/* Advanced Topics Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topicsAdvanced.map((topic, index) => (
                <div
                  key={index}
                  className={`card-glass p-6 rounded-3xl border-2 border-[#059669]/20 hover:border-[#059669]/50 transition-all ${
                    index === topicsAdvanced.length - 1 ? 'md:col-span-2 lg:col-span-1' : ''
                  }`}
                >
                  <div className="text-4xl mb-4" role="img" aria-label={topic.title}>
                    {topic.icon}
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">{topic.title}</h3>
                  <p className="text-gray-400">{topic.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Experiments Section */}
        <section className="section-landing bg-gradient-to-b from-black/20 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Experimentos que vas a hacer
              </h2>
              <p className="text-xl text-white/70">
                No mirás videos. Hacemos ciencia en vivo y vos participás.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {experiments.map((experiment, index) => (
                <div
                  key={index}
                  className="card-glass p-8 rounded-3xl border-2 border-white/10 hover:border-[#10b981]/30 transition-all"
                >
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-2xl flex items-center justify-center text-3xl shadow-xl">
                      <span role="img" aria-label={experiment.title}>
                        {experiment.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-white mb-2">{experiment.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <span role="img" aria-label="Categoría">
                            🏷️
                          </span>
                          {experiment.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <span role="img" aria-label="Dificultad">
                            📊
                          </span>
                          {experiment.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="section-landing">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                ¿Por qué el Club de Ciencias?
              </h2>
              <p className="text-xl text-white/70">
                No es memorizar la tabla periódica. Es entender cómo funciona el mundo.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="card-glass p-8 rounded-3xl border-2 border-white/10 hover:border-white/30 transition-all"
                >
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.color} mb-6 text-3xl shadow-xl`}
                  >
                    <span role="img" aria-label={benefit.title}>
                      {benefit.icon}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">{benefit.title}</h3>
                  <p className="text-gray-400 text-lg">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="section-landing bg-gradient-to-b from-black/20 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Lo que dicen nuestros científicos
              </h2>
              <p className="text-xl text-white/70">
                Chicos reales, experimentos reales, pasión real por la ciencia.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="card-glass p-8 rounded-3xl border-2 border-[#10b981]/20 hover:border-[#10b981]/40 transition-all"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-2xl font-black text-white">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xl font-black text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">{testimonial.age} años</div>
                    </div>
                  </div>
                  <p className="text-white/80 text-lg mb-4 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="inline-flex items-center gap-2 bg-[#10b981]/20 px-4 py-2 rounded-full border border-[#10b981]/30">
                    <span className="text-xl" role="img" aria-label="Trofeo">
                      🏆
                    </span>
                    <span className="text-sm font-bold text-[#10b981]">{testimonial.achievement}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="section-landing">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Preguntas frecuentes</h2>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="card-glass p-8 rounded-3xl border-2 border-white/10">
                  <h3 className="text-xl font-black text-white mb-3">{faq.question}</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final Section */}
        <section className="section-landing">
          <div className="max-w-4xl mx-auto text-center">
            <div className="card-glass p-12 rounded-3xl border-2 border-[#10b981]/30 relative overflow-hidden">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/10 to-[#059669]/10 pointer-events-none" />

              <div className="relative z-10">
                <div className="text-6xl mb-6" role="img" aria-label="Cohete">
                  🚀
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                  ¿Listo para experimentar con ciencia?
                </h2>
                <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  Unite al Club STEAM 2026 y descubrí que la ciencia no es aburrida cuando la vivís en primera persona.
                  Experimentos reales, profes apasionados, y descubrimientos que te vuelan la cabeza.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 justify-center">
                  <Link href="/register" className="btn-pulse">
                    Inscribirme ahora
                  </Link>
                  <Link href="/club" className="btn-arrow">
                    Ver todos los mundos
                  </Link>
                </div>

                <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <span role="img" aria-label="Check">
                      ✅
                    </span>
                    <span>Plan ACOMPAÑADO: $60.000/mes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span role="img" aria-label="Check">
                      ✅
                    </span>
                    <span>Plan COMPLETO: $105.600/mes (3 mundos)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
