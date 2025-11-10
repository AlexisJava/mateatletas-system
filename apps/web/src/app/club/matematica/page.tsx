'use client';

import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

/**
 * Página del Mundo Matemática para Club STEAM 2026
 * - Color palette: #0ea5e9 to #0284c7 (cyan/blue)
 * - Argentine Spanish colloquialisms
 * - Asymmetric grids with visual symmetry
 * - TypeScript strict mode
 */
export default function ClubMatematicaPage() {
  const topicsBasic = [
    { icon: '🎯', title: 'Olimpíadas Matemáticas', desc: 'Entrenamos para competencias reales' },
    { icon: '💰', title: 'Finanzas Personales', desc: 'Aprendés a manejar tu plata de verdad' },
    { icon: '📊', title: 'Estadística Práctica', desc: 'Analizás datos del mundo real' },
    { icon: '🎲', title: 'Probabilidad y Juegos', desc: 'Descubrís los secretos del azar' },
  ];

  const topicsAdvanced = [
    { icon: '📐', title: 'Geometría Desafiante', desc: 'De Pitágoras a fractales' },
    { icon: '∫', title: 'Cálculo Aplicado', desc: 'Para los que buscan el siguiente nivel' },
    { icon: '🧮', title: 'Álgebra Abstracta', desc: 'Ecuaciones que resuelven problemas reales' },
    { icon: '🔢', title: 'Teoría de Números', desc: 'Los misterios de primos y divisibilidad' },
  ];

  const benefits = [
    {
      icon: '👥',
      title: 'Clases en vivo 2 veces por semana',
      desc: 'Con profes que aman la matemática y te contagian',
      color: 'from-[#0ea5e9] to-[#0284c7]',
    },
    {
      icon: '🏆',
      title: 'Preparación para competencias',
      desc: 'Olimpíadas OMA, ÑAndú, y competencias internacionales',
      color: 'from-[#0284c7] to-[#0369a1]',
    },
    {
      icon: '🎮',
      title: 'Sistema de logros gamificado',
      desc: '73 logros desbloqueables + avatar 3D personalizado',
      color: 'from-[#0ea5e9] to-[#06b6d4]',
    },
    {
      icon: '📱',
      title: 'Problemas del mundo real',
      desc: 'No memorizás fórmulas: las entendés aplicándolas',
      color: 'from-[#0284c7] to-[#0ea5e9]',
    },
  ];

  const testimonials = [
    {
      name: 'Lucía M.',
      age: 14,
      quote: 'Llegué a la final de OMA gracias a las clases. Los profes te explican trucos que no ves en el colegio.',
      achievement: 'Finalista OMA 2025',
    },
    {
      name: 'Mateo R.',
      age: 12,
      quote: 'Antes odiaba matemática. Ahora es mi materia favorita y entiendo para qué sirve cada cosa.',
      achievement: '67 logros desbloqueados',
    },
    {
      name: 'Valentina S.',
      age: 16,
      quote: 'Estoy haciendo cálculo y lo entiendo mejor que muchos de universidad. El nivel es increíble.',
      achievement: 'Nivel avanzado completado',
    },
  ];

  const faqs = [
    {
      question: '¿Qué nivel de matemática necesito para empezar?',
      answer:
        'Tenemos grupos para todos los niveles. Hacemos una evaluación inicial para ubicarte en el grupo perfecto. Desde aritmética básica hasta cálculo universitario.',
    },
    {
      question: '¿Las clases son grabadas por si me pierdo alguna?',
      answer:
        'Sí, todas las clases quedan grabadas y disponibles 24/7. Podés repasarlas cuando quieras o adelantarte si te quedás manija.',
    },
    {
      question: '¿Preparan para olimpíadas específicas?',
      answer:
        'Sí, tenemos track específico para OMA, ÑAndú, y olimpíadas internacionales. Trabajamos con problemas de competencias anteriores y estrategias de resolución.',
    },
    {
      question: '¿Puedo combinar Matemática con otros mundos?',
      answer:
        'Totalmente. Con el plan COMPLETO ($105.600/mes) accedés a los 3 mundos. Muchos chicos combinan Matemática + Programación para potenciar lógica y algoritmos.',
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
                  <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-3xl flex items-center justify-center text-5xl shadow-2xl">
                    <span role="img" aria-label="Números - Matemática">
                      🔢
                    </span>
                  </div>
                  <h1 className="text-5xl md:text-6xl font-black leading-tight">
                    <span className="text-white">Mundo</span>
                    <br />
                    <span className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] bg-clip-text text-transparent">
                      Matemática
                    </span>
                  </h1>
                </div>

                <p className="text-xl text-white/80 leading-relaxed">
                  De olimpíadas internacionales a finanzas personales. De ecuaciones que parecían imposibles a problemas del mundo
                  real que sabés resolver.
                  <br />
                  <strong className="text-white">
                    Matemática que te hace sentir inteligente, no frustrado.
                  </strong>
                </p>
              </div>

              {/* Right - Quick Info Card (1 col) */}
              <div className="card-glass p-8 rounded-3xl border-2 border-[#0ea5e9]/30 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl" role="img" aria-label="Reloj">
                    ⏰
                  </span>
                  <div>
                    <div className="text-2xl font-black text-white">2 clases/semana</div>
                    <p className="text-gray-400 text-sm">90 minutos cada una</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl" role="img" aria-label="Personas">
                    👥
                  </span>
                  <div>
                    <div className="text-2xl font-black text-white">Grupos reducidos</div>
                    <p className="text-gray-400 text-sm">Máximo 12 chicos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl" role="img" aria-label="Edad">
                    🎯
                  </span>
                  <div>
                    <div className="text-2xl font-black text-white">6 a 18 años</div>
                    <p className="text-gray-400 text-sm">Niveles por edad/habilidad</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-5 justify-center">
              <Link href="/register" className="btn-pulse">
                Quiero unirme al Club de Matemática
              </Link>
              <Link href="/club" className="btn-arrow">
                Ver precios del Club STEAM
              </Link>
            </div>
          </div>
        </section>

        {/* Topics Section - Basic Level */}
        <section className="section-landing">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                ¿Qué vas a aprender?
              </h2>
              <p className="text-xl text-white/70">
                Desde olimpíadas hasta finanzas. Matemática que sirve de verdad.
              </p>
            </div>

            {/* Basic Topics Grid - Asymmetric */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {topicsBasic.map((topic, index) => (
                <div
                  key={index}
                  className={`card-glass p-6 rounded-3xl border-2 border-[#0ea5e9]/20 hover:border-[#0ea5e9]/50 transition-all ${
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
                  className={`card-glass p-6 rounded-3xl border-2 border-[#0284c7]/20 hover:border-[#0284c7]/50 transition-all ${
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

        {/* Benefits Section */}
        <section className="section-landing bg-gradient-to-b from-black/20 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                ¿Por qué el Club de Matemática?
              </h2>
              <p className="text-xl text-white/70">
                No es solo resolver problemas. Es entender cómo funciona el mundo.
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
        <section className="section-landing">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Lo que dicen nuestros matemáticos
              </h2>
              <p className="text-xl text-white/70">
                Chicos reales, resultados reales, pasión real por la matemática.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="card-glass p-8 rounded-3xl border-2 border-[#0ea5e9]/20 hover:border-[#0ea5e9]/40 transition-all"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] flex items-center justify-center text-2xl font-black text-white">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xl font-black text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">{testimonial.age} años</div>
                    </div>
                  </div>
                  <p className="text-white/80 text-lg mb-4 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="inline-flex items-center gap-2 bg-[#0ea5e9]/20 px-4 py-2 rounded-full border border-[#0ea5e9]/30">
                    <span className="text-xl" role="img" aria-label="Trofeo">
                      🏆
                    </span>
                    <span className="text-sm font-bold text-[#0ea5e9]">{testimonial.achievement}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="section-landing bg-gradient-to-b from-black/20 to-transparent">
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
            <div className="card-glass p-12 rounded-3xl border-2 border-[#0ea5e9]/30 relative overflow-hidden">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/10 to-[#0284c7]/10 pointer-events-none" />

              <div className="relative z-10">
                <div className="text-6xl mb-6" role="img" aria-label="Cohete">
                  🚀
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                  ¿Listo para enamorarte de la matemática?
                </h2>
                <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  Unite al Club STEAM 2026 y descubrí que la matemática puede ser tu superpoder. Clases en vivo,
                  profes apasionados, y una comunidad que te empuja a ser mejor.
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
