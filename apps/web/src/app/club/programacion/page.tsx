'use client';

import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

/**
 * Página del Mundo Programación para Club STEAM 2026
 * - Color palette: #8b5cf6 to #7c3aed (purple)
 * - Argentine Spanish colloquialisms
 * - Asymmetric grids with visual symmetry
 * - TypeScript strict mode
 */
export default function ClubProgramacionPage() {
  const topicsBasic = [
    { icon: '🎮', title: 'Desarrollo de Juegos', desc: 'Roblox, Unity, y juegos 2D desde cero' },
    { icon: '🌐', title: 'Desarrollo Web', desc: 'Páginas web y apps que funcionan de verdad' },
    { icon: '🤖', title: 'Python desde Cero', desc: 'El lenguaje más usado en el mundo real' },
    { icon: '📱', title: 'Apps Móviles', desc: 'Creá apps para Android e iOS' },
  ];

  const topicsAdvanced = [
    { icon: '🧠', title: 'Inteligencia Artificial', desc: 'Machine learning y redes neuronales' },
    { icon: '⚡', title: 'Backend & APIs', desc: 'Servidores, bases de datos, y arquitectura' },
    { icon: '🎨', title: 'UI/UX Design', desc: 'Interfaces que enamoran a los usuarios' },
    { icon: '🔒', title: 'Ciberseguridad', desc: 'Hackeo ético y protección de sistemas' },
  ];

  const benefits = [
    {
      icon: '💻',
      title: 'Proyectos reales desde día 1',
      desc: 'No copiás código: construís tus propias creaciones',
      color: 'from-[#8b5cf6] to-[#7c3aed]',
    },
    {
      icon: '👨‍💻',
      title: 'Profes que programan de verdad',
      desc: 'Devs activos que te enseñan cómo es el mundo real',
      color: 'from-[#7c3aed] to-[#6d28d9]',
    },
    {
      icon: '🚀',
      title: 'Portfolio profesional',
      desc: 'Terminás con proyectos en GitHub que impresionan',
      color: 'from-[#8b5cf6] to-[#a78bfa]',
    },
    {
      icon: '🏆',
      title: 'Hackathons y competencias',
      desc: 'Participá en desafíos con premios reales',
      color: 'from-[#7c3aed] to-[#8b5cf6]',
    },
  ];

  const testimonials = [
    {
      name: 'Santiago L.',
      age: 15,
      quote: 'Creé mi primer juego en Roblox y ya tiene 2.000 jugadores. Los profes me ayudaron a monetizarlo.',
      achievement: 'Juego con 2K+ jugadores',
    },
    {
      name: 'Catalina F.',
      age: 13,
      quote: 'Estoy haciendo una app para organizar las tareas del colegio. Mis amigos ya la están probando.',
      achievement: 'Primera app publicada',
    },
    {
      name: 'Tomás G.',
      age: 17,
      quote: 'Conseguí mi primer trabajo freelance gracias al portfolio que armé en el club. Cobrando en dólares a los 17.',
      achievement: 'Primer trabajo freelance',
    },
  ];

  const projects = [
    {
      title: 'Juego de Plataformas 2D',
      tech: 'Python + Pygame',
      duration: '4 semanas',
      icon: '🎮',
    },
    {
      title: 'Red Social Minimalista',
      tech: 'React + Node.js',
      duration: '6 semanas',
      icon: '💬',
    },
    {
      title: 'Bot de Discord',
      tech: 'Python + Discord API',
      duration: '3 semanas',
      icon: '🤖',
    },
    {
      title: 'E-commerce Completo',
      tech: 'Next.js + Stripe',
      duration: '8 semanas',
      icon: '🛒',
    },
  ];

  const faqs = [
    {
      question: '¿Necesito saber programar antes de empezar?',
      answer:
        'Para nada. Tenemos grupos desde cero absoluto hasta avanzado. Evaluamos tu nivel y te ubicamos en el grupo perfecto. Si nunca tocaste código, empezamos desde "Hola Mundo".',
    },
    {
      question: '¿Qué lenguajes de programación enseñan?',
      answer:
        'Empezamos con Python (el más fácil y usado). Después sumás JavaScript, HTML/CSS para web, y lenguajes específicos según tus proyectos (C#, Java, etc.). Siempre priorizando entender conceptos sobre memorizar sintaxis.',
    },
    {
      question: '¿Voy a poder crear mis propios juegos?',
      answer:
        'Absolutamente. Muchos chicos arrancan con Roblox Studio (Lua) y después pasan a Unity (C#) o motores 2D. En 3-4 meses ya tenés tu primer juego jugable y publicado.',
    },
    {
      question: '¿Puedo usar esto para conseguir trabajo después?',
      answer:
        'Sí, posta. Varios de nuestros estudiantes ya hacen freelance o tienen sus primeros laburos part-time. Te ayudamos a armar portfolio en GitHub, LinkedIn, y te preparamos para entrevistas técnicas.',
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
                  <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded-3xl flex items-center justify-center text-5xl shadow-2xl">
                    <span role="img" aria-label="Computadora - Programación">
                      💻
                    </span>
                  </div>
                  <h1 className="text-5xl md:text-6xl font-black leading-tight">
                    <span className="text-white">Mundo</span>
                    <br />
                    <span className="bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] bg-clip-text text-transparent">
                      Programación
                    </span>
                  </h1>
                </div>

                <p className="text-xl text-white/80 leading-relaxed">
                  De crear tu primer juego en Roblox a apps reales que usan miles de personas. De "Hola Mundo" a tu primer
                  trabajo freelance.
                  <br />
                  <strong className="text-white">
                    Programación que te convierte en creador, no en consumidor.
                  </strong>
                </p>
              </div>

              {/* Right - Quick Info Card (1 col) */}
              <div className="card-glass p-8 rounded-3xl border-2 border-[#8b5cf6]/30 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl" role="img" aria-label="Reloj">
                    ⏰
                  </span>
                  <div>
                    <div className="text-2xl font-black text-white">2 clases/semana</div>
                    <p className="text-gray-400 text-sm">90 minutos de puro código</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl" role="img" aria-label="Personas">
                    👥
                  </span>
                  <div>
                    <div className="text-2xl font-black text-white">Grupos reducidos</div>
                    <p className="text-gray-400 text-sm">Máximo 12 devs junior</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl" role="img" aria-label="Edad">
                    🎯
                  </span>
                  <div>
                    <div className="text-2xl font-black text-white">6 a 18 años</div>
                    <p className="text-gray-400 text-sm">Desde Scratch hasta AI</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-5 justify-center">
              <Link href="/register" className="btn-pulse">
                Quiero aprender a programar
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
                ¿Qué vas a crear?
              </h2>
              <p className="text-xl text-white/70">
                Desde juegos virales hasta apps que resuelven problemas reales.
              </p>
            </div>

            {/* Basic Topics Grid - Asymmetric */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {topicsBasic.map((topic, index) => (
                <div
                  key={index}
                  className={`card-glass p-6 rounded-3xl border-2 border-[#8b5cf6]/20 hover:border-[#8b5cf6]/50 transition-all ${
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
                  className={`card-glass p-6 rounded-3xl border-2 border-[#7c3aed]/20 hover:border-[#7c3aed]/50 transition-all ${
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

        {/* Projects Section */}
        <section className="section-landing bg-gradient-to-b from-black/20 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Proyectos que vas a construir
              </h2>
              <p className="text-xl text-white/70">
                No teóricos. No tutoriales. Proyectos reales que agregás a tu portfolio.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="card-glass p-8 rounded-3xl border-2 border-white/10 hover:border-[#8b5cf6]/30 transition-all"
                >
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded-2xl flex items-center justify-center text-3xl shadow-xl">
                      <span role="img" aria-label={project.title}>
                        {project.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-white mb-2">{project.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <span role="img" aria-label="Tecnología">
                            ⚙️
                          </span>
                          {project.tech}
                        </span>
                        <span className="flex items-center gap-1">
                          <span role="img" aria-label="Duración">
                            ⏱️
                          </span>
                          {project.duration}
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
                ¿Por qué el Club de Programación?
              </h2>
              <p className="text-xl text-white/70">
                No es solo escribir código. Es construir el futuro que imaginás.
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
                Lo que dicen nuestros developers
              </h2>
              <p className="text-xl text-white/70">
                Chicos reales, proyectos reales, código que funciona.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="card-glass p-8 rounded-3xl border-2 border-[#8b5cf6]/20 hover:border-[#8b5cf6]/40 transition-all"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center text-2xl font-black text-white">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xl font-black text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">{testimonial.age} años</div>
                    </div>
                  </div>
                  <p className="text-white/80 text-lg mb-4 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="inline-flex items-center gap-2 bg-[#8b5cf6]/20 px-4 py-2 rounded-full border border-[#8b5cf6]/30">
                    <span className="text-xl" role="img" aria-label="Trofeo">
                      🏆
                    </span>
                    <span className="text-sm font-bold text-[#8b5cf6]">{testimonial.achievement}</span>
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
            <div className="card-glass p-12 rounded-3xl border-2 border-[#8b5cf6]/30 relative overflow-hidden">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 to-[#7c3aed]/10 pointer-events-none" />

              <div className="relative z-10">
                <div className="text-6xl mb-6" role="img" aria-label="Cohete">
                  🚀
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                  ¿Listo para crear lo que imaginás?
                </h2>
                <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  Unite al Club STEAM 2026 y transformate en el programador que querés ser. Proyectos reales, profes que
                  programan, y una comunidad que te impulsa.
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
