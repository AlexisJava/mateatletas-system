'use client';

import Link from 'next/link';
import { useState } from 'react';

interface Curso {
  id: string;
  title: string;
  icon: string;
  gradient: string;
  description: string;
  duration: string;
  level: string;
  topics: string[];
  price: number;
}

export default function CursosOnlinePage() {
  const [selectedWorld, setSelectedWorld] = useState<string>('all');

  const cursos: Curso[] = [
    // Matemática
    {
      id: 'mat-1',
      title: 'Matemática: De Cero a Héroe',
      icon: '🔢',
      gradient: 'from-[#0ea5e9] to-[#0284c7]',
      description: 'Desde las tablas de multiplicar hasta ecuaciones. Van a su ritmo, sin presión.',
      duration: '3 meses',
      level: 'Principiante',
      topics: ['Aritmética', 'Álgebra básica', 'Geometría', 'Problemas reales'],
      price: 30000,
    },
    {
      id: 'mat-2',
      title: 'Matemática Avanzada',
      icon: '📐',
      gradient: 'from-[#0ea5e9] to-[#0284c7]',
      description: 'Ecuaciones complejas, funciones y preparación para olimpíadas.',
      duration: '4 meses',
      level: 'Avanzado',
      topics: ['Funciones', 'Trigonometría', 'Cálculo', 'Olimpíadas'],
      price: 30000,
    },
    // Programación
    {
      id: 'prog-1',
      title: 'Programación: Tus Primeros Juegos',
      icon: '🎮',
      gradient: 'from-[#8b5cf6] to-[#7c3aed]',
      description: 'Creá tus propios juegos desde cero. Ven resultados desde la primera clase.',
      duration: '3 meses',
      level: 'Principiante',
      topics: ['Scratch', 'Lógica de programación', 'Juegos 2D', 'Creatividad'],
      price: 30000,
    },
    {
      id: 'prog-2',
      title: 'Desarrollo Web Real',
      icon: '💻',
      gradient: 'from-[#8b5cf6] to-[#7c3aed]',
      description: 'Construí páginas web y aplicaciones que funcionan de verdad.',
      duration: '4 meses',
      level: 'Intermedio',
      topics: ['HTML & CSS', 'JavaScript', 'React', 'Proyectos reales'],
      price: 30000,
    },
    {
      id: 'prog-3',
      title: 'Roblox Game Development',
      icon: '🏗️',
      gradient: 'from-[#8b5cf6] to-[#7c3aed]',
      description: 'Diseñá y creá tus propios mundos en Roblox con Lua.',
      duration: '3 meses',
      level: 'Intermedio',
      topics: ['Roblox Studio', 'Lua', 'Game Design', 'Monetización'],
      price: 30000,
    },
    // Ciencias
    {
      id: 'sci-1',
      title: 'Ciencias: Experimentos Fascinantes',
      icon: '🔬',
      gradient: 'from-[#10b981] to-[#059669]',
      description: 'Experimentos seguros que pueden hacer en casa. Entienden haciendo.',
      duration: '3 meses',
      level: 'Principiante',
      topics: ['Química básica', 'Física divertida', 'Biología', 'Experimentos'],
      price: 30000,
    },
    {
      id: 'sci-2',
      title: 'El Universo y Más Allá',
      icon: '🌌',
      gradient: 'from-[#10b981] to-[#059669]',
      description: 'Explorá el cosmos, los planetas y los misterios del universo.',
      duration: '2 meses',
      level: 'Todos los niveles',
      topics: ['Astronomía', 'Sistema solar', 'Astrofísica', 'Exploración'],
      price: 30000,
    },
  ];

  const worlds = [
    { id: 'all', name: 'Todos', icon: '✨' },
    { id: 'math', name: 'Matemática', icon: '🔢' },
    { id: 'prog', name: 'Programación', icon: '💻' },
    { id: 'science', name: 'Ciencias', icon: '🔬' },
  ];

  const filteredCursos =
    selectedWorld === 'all'
      ? cursos
      : cursos.filter((curso) => curso.id.startsWith(selectedWorld === 'math' ? 'mat' : selectedWorld === 'prog' ? 'prog' : 'sci'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Navbar Simple */}
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
        <div className="max-w-[1400px] mx-auto text-center">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#FF6B35]/10 to-[#fbbf24]/10 rounded-full border border-[#FF6B35]/20 mb-6">
            <span className="bg-gradient-to-r from-[#FF6B35] to-[#fbbf24] bg-clip-text text-transparent font-semibold text-sm">
              Explorá a tu ritmo
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Cursos Online
            <br />
            <span className="bg-gradient-to-r from-[#FF6B35] via-[#fbbf24] to-[#10b981] bg-clip-text text-transparent">
              sin límites
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 font-light max-w-4xl mx-auto mb-8">
            Accedé cuando quieras, aprendé lo que te apasiona, avanzá a tu velocidad.
            <br />
            <strong className="text-white">Sin clases en vivo. Sin horarios fijos.</strong> Todo el contenido disponible 24/7.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="card-glass p-6 rounded-2xl border border-white/10">
              <div className="text-4xl font-black bg-gradient-to-r from-[#FF6B35] to-[#fbbf24] bg-clip-text text-transparent mb-2">
                $30.000
              </div>
              <p className="text-gray-300 text-sm font-medium">Por mes, por curso</p>
            </div>
            <div className="card-glass p-6 rounded-2xl border border-white/10">
              <div className="text-4xl font-black bg-gradient-to-r from-[#0ea5e9] to-[#10b981] bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <p className="text-gray-300 text-sm font-medium">Acceso ilimitado</p>
            </div>
            <div className="card-glass p-6 rounded-2xl border border-white/10">
              <div className="text-4xl font-black bg-gradient-to-r from-[#8b5cf6] to-[#FF6B35] bg-clip-text text-transparent mb-2">
                Tu ritmo
              </div>
              <p className="text-gray-300 text-sm font-medium">Sin presión ni horarios</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {worlds.map((world) => (
              <button
                key={world.id}
                onClick={() => setSelectedWorld(world.id)}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  selectedWorld === world.id
                    ? 'bg-gradient-to-r from-[#FF6B35] to-[#fbbf24] text-white shadow-lg scale-105'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-white/10'
                }`}
              >
                <span className="mr-2" role="img" aria-label={world.name}>
                  {world.icon}
                </span>
                {world.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Cursos Grid */}
      <section className="pb-20 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCursos.map((curso) => (
              <div
                key={curso.id}
                className="card-glass p-8 rounded-3xl border-2 border-white/10 hover:border-white/30 transition-all group"
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${curso.gradient} rounded-2xl shadow-lg mb-6`}>
                  <span className="text-4xl" role="img" aria-label={curso.title}>
                    {curso.icon}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-black text-white mb-3">{curso.title}</h3>

                {/* Description */}
                <p className="text-gray-400 mb-6 leading-relaxed">{curso.description}</p>

                {/* Metadata */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-xs font-bold text-gray-300">{curso.duration}</span>
                  </div>
                  <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-xs font-bold text-gray-300">{curso.level}</span>
                  </div>
                </div>

                {/* Topics */}
                <ul className="space-y-2 mb-6">
                  {curso.topics.map((topic, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className={`flex-shrink-0 w-4 h-4 bg-gradient-to-br ${curso.gradient} rounded-full flex items-center justify-center`}>
                        <span className="text-white text-[10px] font-bold">✓</span>
                      </div>
                      <span className="text-sm text-gray-300 font-medium">{topic}</span>
                    </li>
                  ))}
                </ul>

                {/* Price & CTA */}
                <div className="pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-3xl font-black text-white">${curso.price.toLocaleString('es-AR')}</div>
                      <div className="text-xs text-gray-400">por mes</div>
                    </div>
                  </div>
                  <Link
                    href="/register"
                    className={`block w-full text-center px-6 py-3 bg-gradient-to-r ${curso.gradient} text-white rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all`}
                  >
                    Empezar ahora
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              ¿Por qué elegir cursos online?
            </h2>
            <p className="text-xl text-gray-400 font-light max-w-3xl mx-auto">
              Perfectos para chicos que prefieren ir a su ritmo y familias con horarios complicados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-glass p-6 rounded-2xl border border-white/10 text-center">
              <div className="text-5xl mb-4" role="img" aria-label="Reloj">
                ⏰
              </div>
              <h3 className="text-xl font-black text-white mb-2">Tu horario</h3>
              <p className="text-gray-400 text-sm">Estudiá cuando te convenga, sin horarios fijos</p>
            </div>

            <div className="card-glass p-6 rounded-2xl border border-white/10 text-center">
              <div className="text-5xl mb-4" role="img" aria-label="Cohete">
                🚀
              </div>
              <h3 className="text-xl font-black text-white mb-2">Tu ritmo</h3>
              <p className="text-gray-400 text-sm">Avanzá rápido o despacio, como mejor te funcione</p>
            </div>

            <div className="card-glass p-6 rounded-2xl border border-white/10 text-center">
              <div className="text-5xl mb-4" role="img" aria-label="Repetir">
                🔄
              </div>
              <h3 className="text-xl font-black text-white mb-2">Repetí lo que quieras</h3>
              <p className="text-gray-400 text-sm">Volvé a ver las lecciones cuantas veces necesites</p>
            </div>

            <div className="card-glass p-6 rounded-2xl border border-white/10 text-center">
              <div className="text-5xl mb-4" role="img" aria-label="Precio">
                💰
              </div>
              <h3 className="text-xl font-black text-white mb-2">Más accesible</h3>
              <p className="text-gray-400 text-sm">$30.000/mes por curso, mucho menos que clases en vivo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="card-glass p-10 md:p-12 rounded-3xl border-2 border-white/20 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              ¿Preferís clases en vivo con profes?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Mirá nuestros planes con clases grupales, seguimiento personalizado y apoyo psicopedagógico
            </p>
            <Link
              href="/#pricing"
              className="inline-block px-8 py-4 bg-gradient-to-r from-[#0ea5e9] to-[#10b981] text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
            >
              Ver planes con clases en vivo
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-12">
            Preguntas frecuentes
          </h2>

          <div className="space-y-4">
            <details className="card-glass p-6 rounded-2xl border border-white/10 group">
              <summary className="font-bold text-white text-lg cursor-pointer list-none flex items-center justify-between">
                ¿Cómo funcionan los cursos online?
                <span className="text-2xl group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="text-gray-400 mt-4 leading-relaxed">
                Accedés a la plataforma cuando quieras y ves las clases grabadas. Cada curso tiene videos, ejercicios prácticos y proyectos. Avanzás a tu ritmo, sin horarios fijos.
              </p>
            </details>

            <details className="card-glass p-6 rounded-2xl border border-white/10 group">
              <summary className="font-bold text-white text-lg cursor-pointer list-none flex items-center justify-between">
                ¿Hay apoyo si me trabo?
                <span className="text-2xl group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="text-gray-400 mt-4 leading-relaxed">
                Sí. Podés hacer preguntas por chat y te respondemos en menos de 24 horas. También hay foros donde otros estudiantes pueden ayudarte.
              </p>
            </details>

            <details className="card-glass p-6 rounded-2xl border border-white/10 group">
              <summary className="font-bold text-white text-lg cursor-pointer list-none flex items-center justify-between">
                ¿Puedo hacer varios cursos a la vez?
                <span className="text-2xl group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="text-gray-400 mt-4 leading-relaxed">
                ¡Sí! Cada curso se paga por separado, así que podés inscribirte en los que quieras y organizarte como mejor te funcione.
              </p>
            </details>

            <details className="card-glass p-6 rounded-2xl border border-white/10 group">
              <summary className="font-bold text-white text-lg cursor-pointer list-none flex items-center justify-between">
                ¿Hay certificado al terminar?
                <span className="text-2xl group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="text-gray-400 mt-4 leading-relaxed">
                Sí. Al completar un curso y aprobar el proyecto final, recibís un certificado digital que podés compartir.
              </p>
            </details>

            <details className="card-glass p-6 rounded-2xl border border-white/10 group">
              <summary className="font-bold text-white text-lg cursor-pointer list-none flex items-center justify-between">
                ¿Cuánto tiempo tengo para terminar un curso?
                <span className="text-2xl group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="text-gray-400 mt-4 leading-relaxed">
                Mientras sigas pagando tu suscripción mensual, tenés acceso ilimitado. Podés tomarte el tiempo que necesites.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Empezá hoy mismo
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Creá tu cuenta gratis y explorá el contenido antes de inscribirte
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-5 bg-gradient-to-r from-[#FF6B35] via-[#fbbf24] to-[#10b981] text-white rounded-xl font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </section>

      {/* Footer Simple */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto text-center">
          <p className="text-gray-400">
            © 2025 Mateatletas. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
