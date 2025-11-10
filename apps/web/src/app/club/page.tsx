'use client';

import Link from 'next/link';

interface Benefit {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted?: boolean;
  gradient: string;
}

export default function ClubPage() {
  const benefits: Benefit[] = [
    {
      icon: '🎮',
      title: 'Tu personaje 3D',
      description: 'Creá y personalizá tu avatar 3D. Ganás ropa y accesorios a medida que avanzás.',
      gradient: 'from-[#8b5cf6] to-[#7c3aed]',
    },
    {
      icon: '🏆',
      title: '73 logros diferentes',
      description: 'No solo premiamos las notas. Valoramos el esfuerzo, la constancia y la creatividad.',
      gradient: 'from-[#fbbf24] to-[#f59e0b]',
    },
    {
      icon: '👨‍🏫',
      title: 'Profes que inspiran',
      description: 'Grupos de 8-10 chicos. Tu profe te conoce, sabe cómo aprendés y te ayuda cuando lo necesitás.',
      gradient: 'from-[#0ea5e9] to-[#0284c7]',
    },
    {
      icon: '🧠',
      title: 'Apoyo psicopedagógico',
      description: 'Un equipo entero mirando que cada chico avance a su ritmo, sin presión.',
      gradient: 'from-[#10b981] to-[#059669]',
    },
    {
      icon: '📱',
      title: 'Panel para padres',
      description: 'Mirás desde tu celu cómo va, qué hace, qué logró. Tranquilidad en tiempo real.',
      gradient: 'from-[#FF6B35] to-[#f59e0b]',
    },
    {
      icon: '💰',
      title: 'Descuentos automáticos',
      description: 'Si tenés más de un hijo, el descuento por hermanos se aplica solo. Hasta 24% off.',
      gradient: 'from-[#0ea5e9] to-[#10b981]',
    },
  ];

  const plans: Plan[] = [
    {
      id: 'acompanado',
      name: 'ACOMPAÑADO',
      price: 60000,
      description: 'Elegís un mundo STEAM. Clases en vivo + todo el sistema gamificado.',
      features: [
        'Un mundo STEAM (Matemática, Programación o Ciencias)',
        'Clases grupales en vivo 2 veces por semana',
        'Tu personaje 3D + sistema de recompensas',
        'Apoyo psicopedagógico personalizado',
        'Panel para padres en tiempo real',
        'Grupos de 8-10 chicos',
        'Acceso ilimitado a plataforma',
      ],
      gradient: 'from-[#0ea5e9] to-[#10b981]',
    },
    {
      id: 'completo',
      name: 'COMPLETO',
      price: 105600,
      description: 'Acceso total a los 3 mundos STEAM. La experiencia completa.',
      features: [
        'Los 3 mundos STEAM incluidos',
        'Matemática + Programación + Ciencias',
        'Sale $52.800 por mundo (vs $60.000)',
        'Clases en vivo en los 3 mundos',
        'Tu personaje 3D + 73 logros',
        'Apoyo psicopedagógico completo',
        'Panel para padres premium',
        'Grupos reducidos 8-10 chicos',
      ],
      highlighted: true,
      gradient: 'from-[#8b5cf6] via-[#FF6B35] to-[#10b981]',
    },
  ];

  const faqs = [
    {
      question: '¿Cuándo empiezan las clases del Club 2026?',
      answer: 'Las inscripciones están abiertas ahora y las clases arrancan en marzo 2026. Cuanto antes te inscribas, más chances tenés de elegir horarios que te convengan.',
    },
    {
      question: '¿Cómo funcionan los grupos?',
      answer: 'Los grupos son de 8-10 chicos máximo, organizados por edad y nivel. Tenés clases en vivo 2 veces por semana con tu profe, que te conoce y sabe cómo ayudarte.',
    },
    {
      question: '¿Qué pasa si mi hijo tiene más de un hermano?',
      answer: 'El descuento por hermanos se aplica automáticamente. Con 2 hermanos te ahorrás 12%, con 3 o más te ahorrás 24%. No tenés que hacer nada, el sistema lo calcula solo.',
    },
    {
      question: '¿Puedo cambiar de mundo si no le gusta?',
      answer: 'Sí, podés cambiar dentro del primer mes sin ningún costo extra. Queremos que encuentren lo que realmente les apasiona.',
    },
    {
      question: '¿Cómo es el seguimiento psicopedagógico?',
      answer: 'Nuestro equipo psicopedagógico revisa el progreso de cada chico semanalmente. Si detectan algo (que le cuesta, que se aburre, que necesita más desafío), intervienen y ajustamos la experiencia.',
    },
    {
      question: '¿Puedo ver cómo va mi hijo?',
      answer: 'Sí. Desde el panel de padres ves en tiempo real: clases a las que fue, logros que ganó, temas que está viendo, proyectos que hizo. Todo desde tu celu.',
    },
  ];

  const testimonials = [
    {
      name: 'María González',
      role: 'Mamá de Valentina, 10 años',
      quote: 'Mi hija pasó de odiar las matemáticas a pedirme que reserve más clases. Cuando me preguntó si podía tener clase el sábado también, no lo podía creer.',
      avatar: 'M',
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Estudiante de 14 años',
      quote: 'Me encanta mi personaje 3D. Ya tengo 45 logros y me compré un montón de ropa virtual. Es como jugar pero estoy aprendiendo posta.',
      avatar: 'C',
    },
    {
      name: 'Ana Martínez',
      role: 'Mamá de 3 chicos',
      quote: 'Desde mi celu veo cómo van los tres. El descuento por hermanos es un golazo, y verlos motivados no tiene precio.',
      avatar: 'A',
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
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#0ea5e9]/10 to-[#10b981]/10 rounded-full border border-[#0ea5e9]/20 mb-6">
              <span className="bg-gradient-to-r from-[#0ea5e9] to-[#10b981] bg-clip-text text-transparent font-semibold text-sm">
                Inscripciones Abiertas 2026
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Club STEAM 2026
              <br />
              <span className="bg-gradient-to-r from-[#0ea5e9] via-[#10b981] to-[#8b5cf6] bg-clip-text text-transparent">
                Donde aprender es la nueva pasión
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 font-light max-w-4xl mx-auto mb-8">
              Clases en vivo + Sistema de recompensas + Tu propio personaje 3D
              <br />
              <strong className="text-white">Más de 500 familias confían en nosotros</strong> para transformar la relación de sus hijos con el aprendizaje.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-12">
              <div className="card-glass p-4 rounded-xl border border-white/10">
                <div className="text-3xl font-black bg-gradient-to-r from-[#0ea5e9] to-[#10b981] bg-clip-text text-transparent mb-1">
                  8-10
                </div>
                <p className="text-gray-400 text-xs font-medium">chicos por grupo</p>
              </div>
              <div className="card-glass p-4 rounded-xl border border-white/10">
                <div className="text-3xl font-black bg-gradient-to-r from-[#8b5cf6] to-[#FF6B35] bg-clip-text text-transparent mb-1">
                  73
                </div>
                <p className="text-gray-400 text-xs font-medium">logros diferentes</p>
              </div>
              <div className="card-glass p-4 rounded-xl border border-white/10">
                <div className="text-3xl font-black bg-gradient-to-r from-[#10b981] to-[#059669] bg-clip-text text-transparent mb-1">
                  24%
                </div>
                <p className="text-gray-400 text-xs font-medium">descuento hermanos</p>
              </div>
              <div className="card-glass p-4 rounded-xl border border-white/10">
                <div className="text-3xl font-black bg-gradient-to-r from-[#FF6B35] to-[#fbbf24] bg-clip-text text-transparent mb-1">
                  24/7
                </div>
                <p className="text-gray-400 text-xs font-medium">panel para padres</p>
              </div>
            </div>
          </div>

          {/* Hero Image Placeholder */}
          <div className="relative max-w-5xl mx-auto">
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src="https://media.readyplayer.me/nexus/images/Posed-GroupShot.webp"
                alt="Personajes 3D del Club STEAM"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end">
                <div className="p-8 w-full">
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
                    Tu propio personaje 3D desde el día 1
                  </h3>
                  <p className="text-white/90 font-medium">
                    Cada chico crea su avatar y lo personaliza ganando recompensas por venir a clase, no rendirse, ayudar a otros y pensar diferente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Esto hace diferente al Club STEAM
            </h2>
            <p className="text-xl text-gray-400 font-light max-w-3xl mx-auto">
              No es solo otra clase. Es una experiencia que los chicos van a amar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="card-glass p-8 rounded-3xl border-2 border-white/10 hover:border-white/30 transition-all"
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

      {/* Pricing Section */}
      <section className="py-20 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Elegí tu plan
            </h2>
            <p className="text-xl text-gray-400 font-light max-w-3xl mx-auto">
              Un mundo o los tres. Vos decidís cuánto quieren aprender.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`card-glass p-10 rounded-3xl border-2 transition-all ${
                  plan.highlighted
                    ? 'border-[#8b5cf6] shadow-2xl shadow-[#8b5cf6]/20 scale-105'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                {plan.highlighted && (
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#8b5cf6]/20 to-[#FF6B35]/20 rounded-full border border-[#8b5cf6]/30 mb-6">
                    <span className="text-[#8b5cf6] font-bold text-sm">MÁS ELEGIDO</span>
                  </div>
                )}

                <h3 className="text-3xl font-black text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-6">{plan.description}</p>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-black text-white">
                      ${plan.price.toLocaleString('es-AR')}
                    </span>
                    <span className="text-gray-400 text-lg">/mes</span>
                  </div>
                  {plan.highlighted && (
                    <p className="text-sm text-[#10b981] font-bold">Ahorrás $19.200 por mes</p>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-6 h-6 bg-gradient-to-br ${plan.gradient} rounded-full flex items-center justify-center mt-0.5`}>
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                      <span className="text-gray-300 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`block w-full text-center px-8 py-4 bg-gradient-to-r ${plan.gradient} text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all`}
                >
                  Inscribirme ahora
                </Link>
              </div>
            ))}
          </div>

          {/* Sibling Discount Info */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="card-glass p-8 rounded-2xl border border-white/10 text-center">
              <div className="text-4xl mb-4" role="img" aria-label="Familia">
                👨‍👩‍👧‍👦
              </div>
              <h3 className="text-2xl font-black text-white mb-3">
                Descuento por hermanos automático
              </h3>
              <p className="text-gray-400 mb-4">
                2 hermanos: <strong className="text-[#10b981]">12% off</strong> •{' '}
                3+ hermanos: <strong className="text-[#10b981]">24% off</strong>
              </p>
              <p className="text-sm text-gray-500">
                Se aplica solo al inscribirlos. No hace falta que hagas nada.
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
              Más de 500 familias ya están viviendo el cambio
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
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#0ea5e9] to-[#10b981] rounded-full flex items-center justify-center shadow-lg">
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

      {/* FAQ Section */}
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
              Inscribite ahora para 2026
            </h2>
            <p className="text-xl text-gray-300 mb-4">
              Los cupos son limitados y los horarios se asignan por orden de inscripción
            </p>
            <p className="text-gray-400 mb-8">
              Cuanto antes te anotes, más opciones de horarios tenés
            </p>
            <Link
              href="/register"
              className="inline-block px-10 py-5 bg-gradient-to-r from-[#0ea5e9] via-[#10b981] to-[#8b5cf6] text-white rounded-xl font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Reservar mi lugar
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
