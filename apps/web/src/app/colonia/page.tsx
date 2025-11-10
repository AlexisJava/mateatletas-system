'use client';

import Link from 'next/link';

interface Benefit {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}

export default function ColoniaPage() {
  const benefits: Benefit[] = [
    {
      icon: '🎮',
      title: 'Tu personaje 3D',
      description: 'Creá y personalizá tu avatar 3D. Ganás ropa y accesorios a medida que completás cursos.',
      gradient: 'from-[#8b5cf6] to-[#7c3aed]',
    },
    {
      icon: '📚',
      title: 'Múltiples cursos',
      description: 'Acceso a varios cursos de programación, matemática y ciencias durante enero y febrero.',
      gradient: 'from-[#10b981] to-[#059669]',
    },
    {
      icon: '⏰',
      title: 'Horarios flexibles',
      description: 'Elegí el turno que te convenga: mañana (10:30-12:00) o tarde (14:30-16:00).',
      gradient: 'from-[#fbbf24] to-[#f59e0b]',
    },
    {
      icon: '🎯',
      title: 'Sincrónico o asincrónico',
      description: 'Participá en vivo o hacé los cursos a tu ritmo. Vos decidís cómo aprender.',
      gradient: 'from-[#0ea5e9] to-[#0284c7]',
    },
    {
      icon: '🏆',
      title: 'Sistema de logros',
      description: 'Los 73 logros de la plataforma completa disponibles durante todo el verano.',
      gradient: 'from-[#FF6B35] to-[#f59e0b]',
    },
    {
      icon: '💻',
      title: 'Plataforma completa',
      description: 'Acceso total a la plataforma Mateatletas con todos los recursos y materiales.',
      gradient: 'from-[#8b5cf6] to-[#0ea5e9]',
    },
  ];

  const modalidades = [
    {
      title: 'Virtual Sincrónico',
      icon: '📹',
      description: 'Clases en vivo por Zoom con profes reales',
      features: [
        'Interacción directa con el profesor',
        'Consultás dudas en el momento',
        'Trabajás en grupo con otros chicos',
        'Horarios fijos: mañana o tarde',
      ],
      color: 'from-[#0ea5e9] to-[#10b981]',
    },
    {
      title: 'Virtual Asincrónico',
      icon: '🎬',
      description: 'Cursos grabados que hacés cuando quieras',
      features: [
        'Aprendés a tu propio ritmo',
        'Repetís las lecciones que necesites',
        'Horarios 100% flexibles',
        'Acceso 24/7 durante enero y febrero',
      ],
      color: 'from-[#8b5cf6] to-[#FF6B35]',
    },
  ];

  const faqs = [
    {
      question: '¿Cuándo es la colonia de verano?',
      answer: 'La colonia funciona durante todo enero y febrero 2026. Son 2 meses completos de cursos y talleres disponibles.',
    },
    {
      question: '¿Qué edades pueden participar?',
      answer: 'Recibimos chicos de 6 a 18 años. Los cursos están adaptados por edad y nivel para que todos puedan aprender.',
    },
    {
      question: '¿Cuáles son los horarios?',
      answer: 'Tenés dos turnos para las clases sincrónicas: Mañana de 10:30 a 12:00hs, o Tarde de 14:30 a 16:00hs. Si elegís modalidad asincrónica, accedés cuando quieras.',
    },
    {
      question: '¿Qué necesitan para participar?',
      answer: 'Una computadora con internet estable. Para las clases sincrónicas necesitás cámara y micrófono. Para asincrónico solo necesitás conexión.',
    },
    {
      question: '¿Qué cursos van a ofrecer?',
      answer: 'Vamos a tener varios cursos de programación, matemática y ciencias. Los iremos anunciando próximamente, pero podés inscribirte ahora para asegurar tu lugar.',
    },
    {
      question: '¿Puedo combinar sincrónico y asincrónico?',
      answer: 'Sí! Podés tomar algunos cursos en vivo y otros a tu ritmo. Vos armás tu propia experiencia de verano.',
    },
    {
      question: '¿Hay descuento por hermanos?',
      answer: 'Sí. Si inscribís 2 hermanos te ahorrás 12%, con 3 o más te ahorrás 24%. Se aplica automáticamente.',
    },
    {
      question: '¿Tienen acceso a la plataforma completa?',
      answer: 'Sí! Durante enero y febrero tenés acceso total a la plataforma Mateatletas: tu avatar 3D, los 73 logros, sistema de recompensas y todos los recursos.',
    },
  ];

  const testimonials = [
    {
      name: 'Roberto García',
      role: 'Papá de Mateo, 11 años',
      quote: 'Mateo hizo 3 cursos en el verano pasado. Programó un juego, aprendió ecuaciones y hasta hizo experimentos. Volvió re motivado.',
      avatar: 'R',
    },
    {
      name: 'Lucía Torres',
      role: 'Mamá de Sofía, 14 años',
      quote: 'La modalidad asincrónica fue perfecta porque viajamos en enero. Sofía hacía las clases desde donde estábamos y no perdió nada.',
      avatar: 'L',
    },
    {
      name: 'Diego Fernández',
      role: 'Estudiante de 13 años',
      quote: 'Hice los cursos de mañana en enero y de tarde en febrero. Conocí un montón de chicos y aprendí banda. Quiero volver este año.',
      avatar: 'D',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-white">
            Mateatletas
          </Link>
          <Link
            href="/"
            className="px-6 py-2 bg-gradient-to-r from-[#0ea5e9] to-[#10b981] text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
          >
            Volver al inicio
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#10b981]/10 to-[#fbbf24]/10 rounded-full border border-[#10b981]/20 mb-6">
              <span className="bg-gradient-to-r from-[#10b981] to-[#fbbf24] bg-clip-text text-transparent font-semibold text-sm">
                Inscripciones Abiertas - Enero y Febrero 2026
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Colonia de Verano
              <br />
              <span className="bg-gradient-to-r from-[#10b981] via-[#fbbf24] to-[#FF6B35] bg-clip-text text-transparent">
                2 meses de puro aprendizaje
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 font-light max-w-4xl mx-auto mb-8">
              Cursos de programación, matemática y ciencias. En vivo o grabados. Vos elegís.
              <br />
              <strong className="text-white">Enero y Febrero completos.</strong> Con tu avatar 3D y toda la plataforma.
            </p>

            {/* Quick Info Grid - Asimétrico */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto mb-12">
              <div className="card-glass p-6 rounded-2xl border border-white/10 col-span-2 md:col-span-1">
                <div className="text-4xl mb-3" role="img" aria-label="Calendario">
                  📅
                </div>
                <div className="text-2xl font-black text-white mb-1">2 meses</div>
                <p className="text-gray-400 text-sm">Enero y Febrero</p>
              </div>
              <div className="card-glass p-6 rounded-2xl border border-white/10">
                <div className="text-4xl mb-3" role="img" aria-label="Edad">
                  👦👧
                </div>
                <div className="text-2xl font-black text-white mb-1">6-18 años</div>
                <p className="text-gray-400 text-sm">Todos los niveles</p>
              </div>
              <div className="card-glass p-6 rounded-2xl border border-white/10 col-span-2 md:col-span-1">
                <div className="text-4xl mb-3" role="img" aria-label="Reloj">
                  ⏰
                </div>
                <div className="text-2xl font-black text-white mb-1">2 turnos</div>
                <p className="text-gray-400 text-sm">Mañana o tarde</p>
              </div>
              <div className="card-glass p-6 rounded-2xl border border-white/10">
                <div className="text-4xl mb-3" role="img" aria-label="Online">
                  💻
                </div>
                <div className="text-2xl font-black text-white mb-1">Virtual</div>
                <p className="text-gray-400 text-sm">Desde tu casa</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modalidades Section - Grid Asimétrico */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Elegí cómo aprender
            </h2>
            <p className="text-xl text-gray-400 font-light max-w-3xl mx-auto">
              Sincrónico con clases en vivo, o asincrónico a tu ritmo. O combiná las dos.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {modalidades.map((modalidad, index) => (
              <div
                key={index}
                className="card-glass p-10 rounded-3xl border-2 border-white/10 hover:border-white/30 transition-all"
              >
                <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${modalidad.color} rounded-2xl shadow-lg mb-6`}>
                  <span className="text-4xl" role="img" aria-label={modalidad.title}>
                    {modalidad.icon}
                  </span>
                </div>
                <h3 className="text-3xl font-black text-white mb-3">{modalidad.title}</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">{modalidad.description}</p>
                <ul className="space-y-3">
                  {modalidad.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-6 h-6 bg-gradient-to-br ${modalidad.color} rounded-full flex items-center justify-center mt-0.5`}>
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-gray-300 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid - Asimétrico 3-3 */}
      <section className="py-20 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Todo incluido en tu colonia
            </h2>
            <p className="text-xl text-gray-400 font-light max-w-3xl mx-auto">
              No es solo cursos. Es toda la experiencia Mateatletas durante el verano.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`card-glass p-8 rounded-3xl border-2 border-white/10 hover:border-white/30 transition-all ${
                  index === 0 ? 'md:col-span-2 lg:col-span-1' : ''
                } ${index === benefits.length - 1 ? 'md:col-span-2 lg:col-span-1' : ''}`}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${benefit.gradient} rounded-2xl shadow-lg mb-6`}>
                  <span className="text-3xl" role="img" aria-label={benefit.title}>
                    {benefit.icon}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white mb-3">{benefit.title}</h3>
                <p className="text-gray-400 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Horarios Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Horarios disponibles
            </h2>
            <p className="text-xl text-gray-400 font-light">
              Para las clases sincrónicas, elegí el turno que mejor te funcione
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card-glass p-8 rounded-2xl border-2 border-[#10b981]/30 hover:border-[#10b981]/50 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl" role="img" aria-label="Mañana">
                    🌅
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Turno Mañana</h3>
                  <p className="text-gray-400 text-sm">Lunes a viernes</p>
                </div>
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] bg-clip-text text-transparent mb-2">
                10:30 - 12:00
              </div>
              <p className="text-gray-400">
                Clases en vivo por Zoom. Perfecto para los que arrancan el día con energía.
              </p>
            </div>

            <div className="card-glass p-8 rounded-2xl border-2 border-[#0ea5e9]/30 hover:border-[#0ea5e9]/50 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#f59e0b] rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl" role="img" aria-label="Tarde">
                    🌆
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Turno Tarde</h3>
                  <p className="text-gray-400 text-sm">Lunes a viernes</p>
                </div>
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-[#FF6B35] to-[#f59e0b] bg-clip-text text-transparent mb-2">
                14:30 - 16:00
              </div>
              <p className="text-gray-400">
                Clases en vivo por Zoom. Ideal para los que prefieren la tarde.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="card-glass p-6 rounded-2xl border border-white/10">
              <p className="text-gray-300">
                <strong className="text-white">Modalidad Asincrónica:</strong> Accedé cuando quieras, sin horarios fijos. 24/7 durante enero y febrero.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Inversión
            </h2>
            <p className="text-xl text-gray-400 font-light">
              Un pago de inscripción + 2 cuotas mensuales. Acceso completo.
            </p>
          </div>

          <div className="card-glass p-12 rounded-3xl border-2 border-white/20 text-center max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <div className="text-5xl mb-4" role="img" aria-label="Inscripción">
                  📝
                </div>
                <h3 className="text-2xl font-black text-white mb-3">Inscripción</h3>
                <div className="text-5xl font-black text-white mb-2">$25.000</div>
                <p className="text-gray-400 text-sm">Pago único al inscribirte</p>
              </div>

              <div>
                <div className="text-5xl mb-4" role="img" aria-label="Cuota">
                  💳
                </div>
                <h3 className="text-2xl font-black text-white mb-3">Cuota Mensual</h3>
                <div className="text-5xl font-black text-white mb-2">$55.000</div>
                <p className="text-gray-400 text-sm">Enero + Febrero (2 cuotas)</p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8 mb-8">
              <h4 className="text-xl font-bold text-white mb-4">Incluye:</h4>
              <ul className="space-y-3 text-left max-w-md mx-auto">
                <li className="flex items-center space-x-3">
                  <span className="text-[#10b981] text-xl">✓</span>
                  <span className="text-gray-300">Acceso a múltiples cursos</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-[#10b981] text-xl">✓</span>
                  <span className="text-gray-300">Tu avatar 3D personalizable</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-[#10b981] text-xl">✓</span>
                  <span className="text-gray-300">Sistema de 73 logros</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-[#10b981] text-xl">✓</span>
                  <span className="text-gray-300">Plataforma completa enero y febrero</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-[#10b981] text-xl">✓</span>
                  <span className="text-gray-300">Sincrónico y/o asincrónico</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="inline-block px-10 py-5 bg-gradient-to-r from-[#10b981] via-[#fbbf24] to-[#FF6B35] text-white rounded-xl font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Inscribirme ahora
            </Link>
          </div>

          {/* Sibling Discount */}
          <div className="mt-12">
            <div className="card-glass p-8 rounded-2xl border border-white/10 text-center">
              <div className="text-4xl mb-4" role="img" aria-label="Hermanos">
                👨‍👩‍👧‍👦
              </div>
              <h3 className="text-2xl font-black text-white mb-3">
                Descuento por hermanos
              </h3>
              <p className="text-gray-400 mb-4">
                2 hermanos: <strong className="text-[#10b981]">12% off</strong> •{' '}
                3+ hermanos: <strong className="text-[#10b981]">24% off</strong>
              </p>
              <p className="text-sm text-gray-500">
                Se aplica automáticamente en inscripción y cuotas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Lo que cuentan las familias
            </h2>
            <p className="text-xl text-gray-400 font-light">
              Colonos del verano pasado que ya quieren volver
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="card-glass p-8 rounded-2xl border border-white/10 hover:border-[#10b981]/50 transition-all"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-[#fbbf24] text-xl">
                      ★
                    </span>
                  ))}
                </div>

                <p className="text-gray-300 leading-relaxed mb-6 italic">
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#10b981] to-[#fbbf24] rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <div className="font-bold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-12">
            Preguntas frecuentes
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="card-glass p-6 rounded-2xl border border-white/10 group">
                <summary className="font-bold text-white text-lg cursor-pointer list-none flex items-center justify-between">
                  {faq.question}
                  <span className="text-2xl group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="text-gray-400 mt-4 leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card-glass p-12 rounded-3xl border-2 border-white/20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Asegurá tu lugar ahora
            </h2>
            <p className="text-xl text-gray-300 mb-4">
              Los cupos son limitados y se completan rápido
            </p>
            <p className="text-gray-400 mb-8">
              Inscripción $25.000 + 2 cuotas de $55.000 (enero y febrero)
            </p>
            <Link
              href="/register"
              className="inline-block px-10 py-5 bg-gradient-to-r from-[#10b981] via-[#fbbf24] to-[#FF6B35] text-white rounded-xl font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Inscribirme ahora
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto text-center">
          <p className="text-gray-400">© 2025 Mateatletas. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
