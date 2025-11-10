'use client';

import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

/**
 * Página de Cursos Online - Programación
 * - Color palette: #8b5cf6 to #7c3aed (purple)
 * - Self-paced learning focus
 * - $30,000/mes per course pricing
 * - Argentine Spanish colloquialisms
 * - Asymmetric grids with visual symmetry
 */
export default function CursosOnlineProgramacionPage() {
  const courses = [
    {
      id: 'python-desde-cero',
      title: 'Python desde Cero',
      level: 'Principiante',
      duration: '10 semanas',
      icon: '🐍',
      topics: ['Variables y tipos', 'Funciones', 'POO', 'Proyectos prácticos'],
    },
    {
      id: 'desarrollo-web-fullstack',
      title: 'Desarrollo Web Full Stack',
      level: 'Intermedio',
      duration: '14 semanas',
      icon: '🌐',
      topics: ['HTML/CSS/JS', 'React', 'Node.js', 'Bases de datos'],
    },
    {
      id: 'juegos-roblox-unity',
      title: 'Creación de Juegos',
      level: 'Principiante - Intermedio',
      duration: '12 semanas',
      icon: '🎮',
      topics: ['Roblox Studio', 'Unity básico', 'Game design', 'Monetización'],
    },
    {
      id: 'ia-machine-learning',
      title: 'Inteligencia Artificial',
      level: 'Avanzado',
      duration: '16 semanas',
      icon: '🤖',
      topics: ['Machine Learning', 'Redes neuronales', 'Python + TensorFlow', 'Proyectos AI'],
    },
  ];

  const benefits = [
    {
      icon: '💻',
      title: 'Proyectos reales incluidos',
      desc: 'Construís tu portfolio mientras aprendés',
      color: 'from-[#8b5cf6] to-[#7c3aed]',
    },
    {
      icon: '🎥',
      title: 'Code-along videos',
      desc: 'Programás junto al instructor, paso a paso',
      color: 'from-[#7c3aed] to-[#6d28d9]',
    },
    {
      icon: '🐛',
      title: 'Debugging en tiempo real',
      desc: 'Aprendés a resolver errores como un pro',
      color: 'from-[#8b5cf6] to-[#a78bfa]',
    },
    {
      icon: '👨‍💻',
      title: 'Comunidad de devs',
      desc: 'Discord activo con code reviews y ayuda',
      color: 'from-[#7c3aed] to-[#8b5cf6]',
    },
  ];

  const testimonials = [
    {
      name: 'Lucas D.',
      age: 14,
      quote: 'Terminé el curso de Python y ya estoy haciendo bots para Discord. Mi primer proyecto freelance.',
      progress: 'Portfolio con 5 proyectos',
    },
    {
      name: 'Sofía M.',
      age: 16,
      quote: 'El curso de Web Full Stack me cambió la vida. Ahora soy dev junior en una startup.',
      progress: 'Primer trabajo conseguido',
    },
    {
      name: 'Bautista G.',
      age: 13,
      quote: 'Mi juego de Roblox tiene 3.000 jugadores y estoy ganando Robux. Todo gracias al curso.',
      progress: 'Juego monetizado',
    },
  ];

  const projectsShowcase = [
    {
      title: 'E-commerce completo',
      tech: 'React + Node.js + Stripe',
      icon: '🛒',
      description: 'Tienda online funcional con carrito y pagos reales',
    },
    {
      title: 'Juego 2D tipo Flappy Bird',
      tech: 'Python + Pygame',
      icon: '🎮',
      description: 'Tu primer juego con físicas y puntuación',
    },
    {
      title: 'App de tareas con IA',
      tech: 'Python + OpenAI API',
      icon: '🤖',
      description: 'To-do list que prioriza tareas con AI',
    },
    {
      title: 'Red social minimalista',
      tech: 'Next.js + Firebase',
      icon: '💬',
      description: 'Posts, likes, comentarios y autenticación',
    },
  ];

  const faqs = [
    {
      question: '¿Necesito saber programar antes de empezar?',
      answer:
        'Depende del curso. "Python desde Cero" y "Creación de Juegos" no requieren experiencia previa. Los cursos intermedios/avanzados sí necesitan base de programación.',
    },
    {
      question: '¿Qué software/herramientas necesito?',
      answer:
        'Todo gratis: VS Code (editor), Python o Node.js (según curso), y una cuenta de GitHub. Te damos una guía de instalación paso a paso en el primer módulo.',
    },
    {
      question: '¿Voy a poder crear mis propios proyectos?',
      answer:
        'Absolutamente. Cada curso incluye 3-5 proyectos guiados + un proyecto final donde creás algo original. Todo queda en tu portfolio de GitHub.',
    },
    {
      question: '¿Puedo conseguir trabajo con esto?',
      answer:
        'Varios de nuestros estudiantes consiguieron su primer trabajo o hacen freelance. Te enseñamos a armar portfolio, LinkedIn, y te preparamos para entrevistas técnicas.',
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
                  <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded-3xl flex items-center justify-center text-5xl shadow-2xl">
                    <span role="img" aria-label="Computadora - Programación">
                      💻
                    </span>
                  </div>
                  <div>
                    <h1 className="text-5xl md:text-6xl font-black leading-tight">
                      <span className="text-white">Cursos Online de</span>
                      <br />
                      <span className="bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] bg-clip-text text-transparent">
                        Programación
                      </span>
                    </h1>
                  </div>
                </div>

                <p className="text-xl text-white/80 leading-relaxed">
                  De cero a tu primer juego, app web, o sistema de IA. Programá a tu ritmo, construí tu portfolio, y
                  convertite en el dev que querés ser.
                  <br />
                  <strong className="text-white">
                    Código real, proyectos reales, resultados reales.
                  </strong>
                </p>

                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-2xl" role="img" aria-label="Check">
                      ✅
                    </span>
                    <span className="font-bold">Code-along videos</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-2xl" role="img" aria-label="Check">
                      ✅
                    </span>
                    <span className="font-bold">Portfolio garantizado</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-2xl" role="img" aria-label="Check">
                      ✅
                    </span>
                    <span className="font-bold">Soporte por Discord</span>
                  </div>
                </div>
              </div>

              {/* Right - Pricing Card (1 col) */}
              <div className="card-glass p-8 rounded-3xl border-2 border-[#8b5cf6]/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] text-white text-xs font-black px-4 py-2 rounded-bl-2xl">
                  EXPLORADOR
                </div>
                <div className="mt-6">
                  <div className="text-5xl font-black text-white mb-2">$30.000</div>
                  <p className="text-gray-400 mb-6">por mes, por curso</p>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <span className="text-[#8b5cf6] mt-1" role="img" aria-label="Check">
                        ✓
                      </span>
                      <span className="text-white/80">Un curso de Programación a elección</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#8b5cf6] mt-1" role="img" aria-label="Check">
                        ✓
                      </span>
                      <span className="text-white/80">3-5 proyectos para tu portfolio</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#8b5cf6] mt-1" role="img" aria-label="Check">
                        ✓
                      </span>
                      <span className="text-white/80">Sistema de logros de programación</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#8b5cf6] mt-1" role="img" aria-label="Check">
                        ✓
                      </span>
                      <span className="text-white/80">Avatar 3D developer</span>
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
                Cursos de Programación disponibles
              </h2>
              <p className="text-xl text-white/70">
                Desde Python hasta IA. Elegí tu camino.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="card-glass p-8 rounded-3xl border-2 border-[#8b5cf6]/20 hover:border-[#8b5cf6]/50 transition-all"
                >
                  <div className="flex items-start gap-6 mb-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded-2xl flex items-center justify-center text-3xl shadow-xl">
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
                    <h4 className="text-sm font-bold text-white/60 mb-3">LO QUE VAS A DOMINAR:</h4>
                    <div className="flex flex-wrap gap-2">
                      {course.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#8b5cf6] px-3 py-1 rounded-full text-sm"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    href="/cursos-online"
                    className="inline-flex items-center gap-2 text-[#8b5cf6] hover:text-[#7c3aed] font-bold transition-colors"
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

        {/* Projects Showcase Section */}
        <section className="section-landing">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Proyectos que vas a construir
              </h2>
              <p className="text-xl text-white/70">
                Portfolio profesional desde el día 1.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {projectsShowcase.map((project, index) => (
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
                      <p className="text-sm text-[#8b5cf6] mb-3 font-mono">{project.tech}</p>
                      <p className="text-gray-400">{project.description}</p>
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
                ¿Por qué cursos online de código?
              </h2>
              <p className="text-xl text-white/70">
                Porque programar no se aprende mirando. Se aprende haciendo.
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
                Devs que empezaron como vos
              </h2>
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
                    <span className="text-xl" role="img" aria-label="Logro">
                      🏆
                    </span>
                    <span className="text-sm font-bold text-[#8b5cf6]">{testimonial.progress}</span>
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
            <div className="card-glass p-12 rounded-3xl border-2 border-[#8b5cf6]/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 to-[#7c3aed]/10 pointer-events-none" />

              <div className="relative z-10">
                <div className="text-6xl mb-6" role="img" aria-label="Cohete">
                  🚀
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                  Escribí tu primera línea de código hoy
                </h2>
                <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  $30.000/mes por curso. Portfolio incluido. Empezás cuando quieras, avanzás a tu ritmo.
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
