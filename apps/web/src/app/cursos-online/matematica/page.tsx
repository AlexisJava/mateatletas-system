'use client';

import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

/**
 * Página de Cursos Online - Matemática
 * - Color palette: #0ea5e9 to #0284c7 (cyan/blue)
 * - Self-paced learning focus
 * - $30,000/mes per course pricing
 * - Argentine Spanish colloquialisms
 * - Asymmetric grids with visual symmetry
 */
export default function CursosOnlineMatematicaPage() {
  const courses = [
    {
      id: 'olimpiadas-mate',
      title: 'Entrenamiento para Olimpíadas',
      level: 'Intermedio - Avanzado',
      duration: '12 semanas',
      icon: '🏆',
      topics: ['Problemas OMA', 'Estrategias de resolución', 'Teoría de números', 'Combinatoria'],
    },
    {
      id: 'finanzas-personales',
      title: 'Matemática Financiera',
      level: 'Básico - Intermedio',
      duration: '8 semanas',
      icon: '💰',
      topics: ['Interés simple y compuesto', 'Inversiones', 'Presupuesto personal', 'Análisis de datos'],
    },
    {
      id: 'calculo-aplicado',
      title: 'Cálculo para Secundaria Avanzada',
      level: 'Avanzado',
      duration: '16 semanas',
      icon: '∫',
      topics: ['Límites y derivadas', 'Integrales', 'Aplicaciones reales', 'Problemas de optimización'],
    },
    {
      id: 'geometria-creativa',
      title: 'Geometría y Diseño',
      level: 'Básico - Intermedio',
      duration: '10 semanas',
      icon: '📐',
      topics: ['Geometría plana', 'Transformaciones', 'Fractales', 'Diseño con GeoGebra'],
    },
  ];

  const benefits = [
    {
      icon: '⏰',
      title: 'Aprendés a tu ritmo',
      desc: 'Sin horarios fijos. Avanzás cuando querés, repetís lo que necesitás',
      color: 'from-[#0ea5e9] to-[#0284c7]',
    },
    {
      icon: '🎥',
      title: 'Videos explicativos HD',
      desc: 'Cada concepto explicado paso a paso, con ejemplos reales',
      color: 'from-[#0284c7] to-[#0369a1]',
    },
    {
      icon: '📝',
      title: 'Ejercicios auto-corregibles',
      desc: 'Feedback instantáneo en cada problema que resolvés',
      color: 'from-[#0ea5e9] to-[#06b6d4]',
    },
    {
      icon: '💬',
      title: 'Soporte por Discord',
      desc: 'Comunidad activa + profes que responden tus dudas',
      color: 'from-[#0284c7] to-[#0ea5e9]',
    },
  ];

  const testimonials = [
    {
      name: 'Agustín V.',
      age: 15,
      quote: 'Hice el curso de Olimpíadas a mi ritmo, repitiendo los temas difíciles. Llegué a la final de OMA.',
      progress: '100% completado',
    },
    {
      name: 'Martina R.',
      age: 13,
      quote: 'Empecé desde álgebra básica y ahora estoy haciendo cálculo. Los videos son re claros.',
      progress: '3 cursos completados',
    },
    {
      name: 'Joaquín S.',
      age: 16,
      quote: 'Perfecto para complementar el colegio. Puedo estudiar a las 11 de la noche si quiero.',
      progress: '87% completado',
    },
  ];

  const faqs = [
    {
      question: '¿Cuánto dura el acceso a cada curso?',
      answer:
        'El acceso es mientras mantengas la suscripción activa. Por $30.000/mes tenés acceso ilimitado al curso de Matemática que elijas, con todo el contenido disponible 24/7.',
    },
    {
      question: '¿Puedo hacer varios cursos de Matemática al mismo tiempo?',
      answer:
        'Cada curso cuesta $30.000/mes. Si querés hacer 2 cursos simultáneos, serían $60.000/mes. Pero te recomendamos enfocarte en uno a la vez para aprovechar mejor el contenido.',
    },
    {
      question: '¿Los cursos tienen fechas de inicio?',
      answer:
        'No, empezás cuando quieras. Todo el contenido está disponible desde el día 1. Vos decidís tu propio calendario de estudio.',
    },
    {
      question: '¿Hay alguien que me responda dudas?',
      answer:
        'Sí, tenés acceso a la comunidad en Discord donde profes y otros estudiantes responden dudas. También hay foros de discusión en cada módulo del curso.',
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
              {/* Left - Content (2 cols) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-3xl flex items-center justify-center text-5xl shadow-2xl">
                    <span role="img" aria-label="Números - Matemática">
                      🔢
                    </span>
                  </div>
                  <div>
                    <h1 className="text-5xl md:text-6xl font-black leading-tight">
                      <span className="text-white">Cursos Online de</span>
                      <br />
                      <span className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] bg-clip-text text-transparent">
                        Matemática
                      </span>
                    </h1>
                  </div>
                </div>

                <p className="text-xl text-white/80 leading-relaxed">
                  Desde olimpíadas hasta finanzas personales. Aprendé a tu ritmo, repetí lo que necesites, y avanzá sin
                  presión.
                  <br />
                  <strong className="text-white">
                    Matemática que se adapta a tu vida, no al revés.
                  </strong>
                </p>

                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-2xl" role="img" aria-label="Check">
                      ✅
                    </span>
                    <span className="font-bold">Acceso 24/7</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-2xl" role="img" aria-label="Check">
                      ✅
                    </span>
                    <span className="font-bold">Videos HD</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-2xl" role="img" aria-label="Check">
                      ✅
                    </span>
                    <span className="font-bold">Ejercicios interactivos</span>
                  </div>
                </div>
              </div>

              {/* Right - Pricing Card (1 col) */}
              <div className="card-glass p-8 rounded-3xl border-2 border-[#0ea5e9]/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] text-white text-xs font-black px-4 py-2 rounded-bl-2xl">
                  EXPLORADOR
                </div>
                <div className="mt-6">
                  <div className="text-5xl font-black text-white mb-2">$30.000</div>
                  <p className="text-gray-400 mb-6">por mes, por curso</p>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <span className="text-[#0ea5e9] mt-1" role="img" aria-label="Check">
                        ✓
                      </span>
                      <span className="text-white/80">Un curso de Matemática a elección</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#0ea5e9] mt-1" role="img" aria-label="Check">
                        ✓
                      </span>
                      <span className="text-white/80">Todo el contenido desbloqueado</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#0ea5e9] mt-1" role="img" aria-label="Check">
                        ✓
                      </span>
                      <span className="text-white/80">Sistema de logros gamificado</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#0ea5e9] mt-1" role="img" aria-label="Check">
                        ✓
                      </span>
                      <span className="text-white/80">Avatar 3D personalizado</span>
                    </li>
                  </ul>

                  <Link href="/cursos-online" className="btn-pulse w-full text-center block">
                    Ver todos los cursos
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section className="section-landing bg-gradient-to-b from-black/20 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Cursos de Matemática disponibles
              </h2>
              <p className="text-xl text-white/70">
                Elegí el que necesitás, empezá cuando quieras.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="card-glass p-8 rounded-3xl border-2 border-[#0ea5e9]/20 hover:border-[#0ea5e9]/50 transition-all"
                >
                  <div className="flex items-start gap-6 mb-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-2xl flex items-center justify-center text-3xl shadow-xl">
                      <span role="img" aria-label={course.title}>
                        {course.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-white mb-2">{course.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <span role="img" aria-label="Nivel">
                            📊
                          </span>
                          {course.level}
                        </span>
                        <span className="flex items-center gap-1">
                          <span role="img" aria-label="Duración">
                            ⏱️
                          </span>
                          {course.duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-white/60 mb-3">LO QUE VAS A APRENDER:</h4>
                    <div className="flex flex-wrap gap-2">
                      {course.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 text-[#0ea5e9] px-3 py-1 rounded-full text-sm"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    href="/cursos-online"
                    className="inline-flex items-center gap-2 text-[#0ea5e9] hover:text-[#0284c7] font-bold transition-colors"
                  >
                    <span>Ver más detalles</span>
                    <span role="img" aria-label="Flecha">
                      →
                    </span>
                  </Link>
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
                ¿Por qué cursos online?
              </h2>
              <p className="text-xl text-white/70">
                Tu vida, tu ritmo, tu aprendizaje.
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
                Estudiantes que aprenden a su ritmo
              </h2>
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
                    <span className="text-xl" role="img" aria-label="Progreso">
                      📈
                    </span>
                    <span className="text-sm font-bold text-[#0ea5e9]">{testimonial.progress}</span>
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
            <div className="card-glass p-12 rounded-3xl border-2 border-[#0ea5e9]/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/10 to-[#0284c7]/10 pointer-events-none" />

              <div className="relative z-10">
                <div className="text-6xl mb-6" role="img" aria-label="Cohete">
                  🚀
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                  Empezá a aprender hoy
                </h2>
                <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  $30.000/mes por curso. Cancelás cuando quieras. Empezás cuando quieras. Sin horarios fijos, sin presión.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 justify-center">
                  <Link href="/cursos-online" className="btn-pulse">
                    Ver todos los cursos
                  </Link>
                  <Link href="/club" className="btn-arrow">
                    ¿Preferís clases en vivo?
                  </Link>
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
