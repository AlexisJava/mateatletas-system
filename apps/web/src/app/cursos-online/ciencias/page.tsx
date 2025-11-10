'use client';

import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

/**
 * Página de Cursos Online - Ciencias
 * - Color palette: #10b981 to #059669 (green)
 * - Self-paced learning focus
 * - $30,000/mes per course pricing
 * - Argentine Spanish colloquialisms
 * - Asymmetric grids with visual symmetry
 */
export default function CursosOnlineCienciasPage() {
  const courses = [
    {
      id: 'quimica-experimental',
      title: 'Química Experimental',
      level: 'Principiante - Intermedio',
      duration: '10 semanas',
      icon: '🧪',
      topics: ['Tabla periódica', 'Reacciones químicas', 'Estequiometría', 'Experimentos caseros'],
    },
    {
      id: 'fisica-aplicada',
      title: 'Física del Mundo Real',
      level: 'Intermedio',
      duration: '12 semanas',
      icon: '⚡',
      topics: ['Mecánica', 'Termodinámica', 'Electricidad', 'Física moderna'],
    },
    {
      id: 'biologia-genetica',
      title: 'Biología y Genética',
      level: 'Intermedio',
      duration: '11 semanas',
      icon: '🧬',
      topics: ['ADN y genética', 'Evolución', 'Microbiología', 'Biotecnología'],
    },
    {
      id: 'astronomia-cosmos',
      title: 'Astronomía y Cosmos',
      level: 'Principiante - Intermedio',
      duration: '10 semanas',
      icon: '🔭',
      topics: ['Sistema solar', 'Estrellas y galaxias', 'Astrofísica básica', 'Observación del cielo'],
    },
  ];

  const benefits = [
    {
      icon: '🔬',
      title: 'Experimentos grabados en HD',
      desc: 'Mirás reacciones y fenómenos en cámara lenta',
      color: 'from-[#10b981] to-[#059669]',
    },
    {
      icon: '📊',
      title: 'Simulaciones interactivas',
      desc: 'Manipulás variables y ves qué pasa en tiempo real',
      color: 'from-[#059669] to-[#047857]',
    },
    {
      icon: '🎓',
      title: 'Preparación para olimpíadas',
      desc: 'Material extra para competencias científicas',
      color: 'from-[#10b981] to-[#34d399]',
    },
    {
      icon: '🧑‍🔬',
      title: 'Método científico aplicado',
      desc: 'Aprendés a pensar como científico real',
      color: 'from-[#059669] to-[#10b981]',
    },
  ];

  const testimonials = [
    {
      name: 'Camila T.',
      age: 14,
      quote: 'El curso de Química me hizo entender la tabla periódica de verdad. Ya no la memorizo, la entiendo.',
      progress: '92% completado',
    },
    {
      name: 'Nicolás W.',
      age: 16,
      quote: 'Astronomía cambió mi vida. Ahora tengo mi propio telescopio y comparto fotos del espacio.',
      progress: 'Certificado obtenido',
    },
    {
      name: 'Valentina H.',
      age: 13,
      quote: 'Hice un proyecto de genética para la feria de ciencias y gané el primer lugar. Gracias al curso.',
      progress: 'Proyecto premiado',
    },
  ];

  const experimentsVideos = [
    {
      title: 'Reacciones Exotérmicas Explosivas',
      category: 'Química',
      duration: '15 min',
      icon: '💥',
    },
    {
      title: 'Construcción de Circuitos Eléctricos',
      category: 'Física',
      duration: '22 min',
      icon: '⚡',
    },
    {
      title: 'Extracción y Visualización de ADN',
      category: 'Biología',
      duration: '18 min',
      icon: '🧬',
    },
    {
      title: 'Observación de la Luna y Saturno',
      category: 'Astronomía',
      duration: '25 min',
      icon: '🔭',
    },
  ];

  const faqs = [
    {
      question: '¿Puedo hacer los experimentos en mi casa?',
      answer:
        'Algunos sí, otros no. Los experimentos peligrosos o complejos los hacemos nosotros y los filmamos en detalle. Los experimentos seguros y con materiales comunes tienen guías para que los hagas en casa (opcional).',
    },
    {
      question: '¿Los cursos preparan para olimpíadas científicas?',
      answer:
        'Sí, cada curso incluye material extra para olimpíadas (OAF, OAQ, OAB). También hay módulos específicos con problemas de competencias anteriores y estrategias de resolución.',
    },
    {
      question: '¿Necesito laboratorio o materiales especiales?',
      answer:
        'No. Todo el contenido principal está en videos de experimentos profesionales. Si querés hacer experimentos en casa, usamos materiales que conseguís en cualquier super o farmacia.',
    },
    {
      question: '¿Hay soporte para dudas científicas?',
      answer:
        'Sí, Discord activo con profes de Química, Física, y Biología que responden dudas. También foros de discusión en cada módulo del curso.',
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
                  <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-3xl flex items-center justify-center text-5xl shadow-2xl">
                    <span role="img" aria-label="Microscopio - Ciencias">
                      🔬
                    </span>
                  </div>
                  <div>
                    <h1 className="text-5xl md:text-6xl font-black leading-tight">
                      <span className="text-white">Cursos Online de</span>
                      <br />
                      <span className="bg-gradient-to-r from-[#10b981] to-[#059669] bg-clip-text text-transparent">
                        Ciencias
                      </span>
                    </h1>
                  </div>
                </div>

                <p className="text-xl text-white/80 leading-relaxed">
                  De química explosiva a explorar el cosmos. Experimentos en HD, simulaciones interactivas, y
                  comprensión real de cómo funciona el universo.
                  <br />
                  <strong className="text-white">
                    Ciencia que podés ver, tocar, y entender.
                  </strong>
                </p>

                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-2xl" role="img" aria-label="Check">
                      ✅
                    </span>
                    <span className="font-bold">Experimentos en video HD</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-2xl" role="img" aria-label="Check">
                      ✅
                    </span>
                    <span className="font-bold">Simulaciones interactivas</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-2xl" role="img" aria-label="Check">
                      ✅
                    </span>
                    <span className="font-bold">Preparación olimpíadas</span>
                  </div>
                </div>
              </div>

              {/* Right - Pricing Card (1 col) */}
              <div className="card-glass p-8 rounded-3xl border-2 border-[#10b981]/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-br from-[#10b981] to-[#059669] text-white text-xs font-black px-4 py-2 rounded-bl-2xl">
                  EXPLORADOR
                </div>
                <div className="mt-6">
                  <div className="text-5xl font-black text-white mb-2">$30.000</div>
                  <p className="text-gray-400 mb-6">por mes, por curso</p>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <span className="text-[#10b981] mt-1" role="img" aria-label="Check">
                        ✓
                      </span>
                      <span className="text-white/80">Un curso de Ciencias a elección</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#10b981] mt-1" role="img" aria-label="Check">
                        ✓
                      </span>
                      <span className="text-white/80">Experimentos en video profesional</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#10b981] mt-1" role="img" aria-label="Check">
                        ✓
                      </span>
                      <span className="text-white/80">Sistema de logros científicos</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#10b981] mt-1" role="img" aria-label="Check">
                        ✓
                      </span>
                      <span className="text-white/80">Avatar 3D científico</span>
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
                Cursos de Ciencias disponibles
              </h2>
              <p className="text-xl text-white/70">
                Desde química hasta astronomía. Ciencia real a tu ritmo.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="card-glass p-8 rounded-3xl border-2 border-[#10b981]/20 hover:border-[#10b981]/50 transition-all"
                >
                  <div className="flex items-start gap-6 mb-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-2xl flex items-center justify-center text-3xl shadow-xl">
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
                    <h4 className="text-sm font-bold text-white/60 mb-3">LO QUE VAS A DESCUBRIR:</h4>
                    <div className="flex flex-wrap gap-2">
                      {course.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] px-3 py-1 rounded-full text-sm"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    href="/cursos-online"
                    className="inline-flex items-center gap-2 text-[#10b981] hover:text-[#059669] font-bold transition-colors"
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

        {/* Experiments Videos Section */}
        <section className="section-landing">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Experimentos que vas a ver
              </h2>
              <p className="text-xl text-white/70">
                Videos profesionales filmados en laboratorio real.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {experimentsVideos.map((experiment, index) => (
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
                          <span role="img" aria-label="Duración">
                            ⏱️
                          </span>
                          {experiment.duration}
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
        <section className="section-landing bg-gradient-to-b from-black/20 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                ¿Por qué cursos online de ciencias?
              </h2>
              <p className="text-xl text-white/70">
                Porque la ciencia no se memoriza. Se experimenta y se comprende.
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
                Científicos que aprenden a su ritmo
              </h2>
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
                    <span className="text-xl" role="img" aria-label="Logro">
                      🏆
                    </span>
                    <span className="text-sm font-bold text-[#10b981]">{testimonial.progress}</span>
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
            <div className="card-glass p-12 rounded-3xl border-2 border-[#10b981]/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/10 to-[#059669]/10 pointer-events-none" />

              <div className="relative z-10">
                <div className="text-6xl mb-6" role="img" aria-label="Cohete">
                  🚀
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                  Empezá a experimentar hoy
                </h2>
                <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  $30.000/mes por curso. Videos de experimentos profesionales, simulaciones interactivas, y comprensión
                  real de la ciencia.
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
