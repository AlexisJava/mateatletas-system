'use client';

import ScrollReveal from '@/components/ScrollReveal';

interface Testimonial {
  name: string;
  role: string;
  testimonial: string;
  rating: number;
}

export default function TestimonialsSection() {
  const testimonialsRow1: Testimonial[] = [
    {
      name: 'María González',
      role: 'Madre de estudiante',
      testimonial: 'Mi hija pasó de odiar las matemáticas a pedirme que reserve más clases. El sistema de gamificación es increíble.',
      rating: 5,
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Estudiante de 14 años',
      testimonial: 'Los avatares 3D son geniales. Ya desbloqueé 45 logros y me encanta personalizar mi personaje.',
      rating: 5,
    },
    {
      name: 'Ana Martínez',
      role: 'Tutora de 3 hijos',
      testimonial: 'El portal de tutor me permite hacer seguimiento de todos mis hijos en un solo lugar. Los descuentos ayudan mucho.',
      rating: 5,
    },
    {
      name: 'Lucas Fernández',
      role: 'Estudiante de 12 años',
      testimonial: 'Las clases en vivo son divertidas. Los profes son muy buenos y siempre nos ayudan.',
      rating: 5,
    },
    {
      name: 'Patricia López',
      role: 'Madre de estudiante',
      testimonial: 'El progreso académico es real. Mi hijo mejoró sus notas en el colegio desde que empezó.',
      rating: 5,
    },
    {
      name: 'Diego Santos',
      role: 'Estudiante de 16 años',
      testimonial: 'Me encanta aprender programación aquí. Los proyectos son super interesantes y útiles.',
      rating: 5,
    },
    {
      name: 'Sofía Ruiz',
      role: 'Estudiante de 10 años',
      testimonial: 'Hacer experimentos virtuales de ciencia es lo mejor. Aprendí mucho más que en el colegio.',
      rating: 5,
    },
  ];

  const testimonialsRow2: Testimonial[] = [
    {
      name: 'Roberto García',
      role: 'Padre de 2 estudiantes',
      testimonial: 'La asistencia digital y el seguimiento en tiempo real me dan tranquilidad. Sé exactamente cómo van mis hijos.',
      rating: 5,
    },
    {
      name: 'Valentina Morales',
      role: 'Estudiante de 15 años',
      testimonial: 'El nivel de las clases es excelente. Los docentes saben mucho y explican re bien.',
      rating: 5,
    },
    {
      name: 'Julio Castillo',
      role: 'Tutor de estudiante',
      testimonial: 'El descuento por familia hace que sea muy accesible. Mis dos hijos están encantados.',
      rating: 5,
    },
    {
      name: 'Camila Torres',
      role: 'Estudiante de 13 años',
      testimonial: 'Gano XP y monedas por estudiar. Es como jugar pero aprendo un montón.',
      rating: 5,
    },
    {
      name: 'Fernando Paz',
      role: 'Padre de estudiante',
      testimonial: 'La plataforma es muy profesional. Todo funciona perfecto y el soporte responde rápido.',
      rating: 5,
    },
    {
      name: 'Martina Silva',
      role: 'Estudiante de 11 años',
      testimonial: 'Hacer cálculo ahora es divertido. Los desafíos están buenos y aprendo sin aburrirme.',
      rating: 5,
    },
    {
      name: 'Andrés Vega',
      role: 'Tutor de 3 estudiantes',
      testimonial: 'Mis tres hijos están en diferentes niveles y todos progresan a su ritmo. Excelente sistema.',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-transparent overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 mb-16">
        <ScrollReveal animation="fade-up">
          <div className="text-center">
            <div className="inline-block px-4 py-2 bg-[#10b981]/10 rounded-full border border-[#10b981]/20 mb-6">
              <span className="text-[#10b981] dark:text-[#34d399] font-semibold text-sm">
                Testimonios reales
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Lo que dicen nuestras familias
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto">
              Estudiantes y tutores comparten su experiencia con Mateatletas
            </p>
          </div>
        </ScrollReveal>
      </div>

      {/* Carousel Row 1 - Scroll Right */}
      <div className="relative mb-8">
        <div className="flex animate-scroll-right gap-6">
          {[...testimonialsRow1, ...testimonialsRow1].map((testimonial, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[400px]"
            >
              <div className="h-full p-8 card-glass rounded-2xl border border-white/10 hover:border-[#10b981]/50 transition-all shadow-lg">
                {/* Rating Stars */}
                <div className="flex items-center space-x-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                    <span key={starIndex} className="text-[#fbbf24] text-xl">★</span>
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 italic">
                  &quot;{testimonial.testimonial}&quot;
                </p>

                {/* Author Info */}
                <div className="flex items-center space-x-4">
                  {/* Avatar Placeholder */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">{testimonial.name[0]}</span>
                  </div>

                  {/* Info */}
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>

                {/* Decorative Quote */}
                <div className="absolute top-4 right-4 text-6xl text-gray-200 dark:text-gray-800 opacity-20 font-serif">
                  &quot;
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carousel Row 2 - Scroll Left */}
      <div className="relative mb-16">
        <div className="flex animate-scroll-left gap-6">
          {[...testimonialsRow2, ...testimonialsRow2].map((testimonial, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[400px]"
            >
              <div className="h-full p-8 card-glass rounded-2xl border border-white/10 hover:border-[#10b981]/50 transition-all shadow-lg">
                {/* Rating Stars */}
                <div className="flex items-center space-x-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                    <span key={starIndex} className="text-[#fbbf24] text-xl">★</span>
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 italic">
                  &quot;{testimonial.testimonial}&quot;
                </p>

                {/* Author Info */}
                <div className="flex items-center space-x-4">
                  {/* Avatar Placeholder */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">{testimonial.name[0]}</span>
                  </div>

                  {/* Info */}
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>

                {/* Decorative Quote */}
                <div className="absolute top-4 right-4 text-6xl text-gray-200 dark:text-gray-800 opacity-20 font-serif">
                  &quot;
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 card-glass rounded-2xl border border-white/10">
            <div className="text-4xl font-black text-[#10b981] mb-2">98%</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Satisfacción de tutores
            </p>
          </div>
          <div className="text-center p-6 card-glass rounded-2xl border border-white/10">
            <div className="text-4xl font-black text-[#0ea5e9] mb-2">95%</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Estudiantes más motivados
            </p>
          </div>
          <div className="text-center p-6 card-glass rounded-2xl border border-white/10">
            <div className="text-4xl font-black text-[#FF6B35] mb-2">92%</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Mejora en notas escolares
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-right {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-400px * 7 - 1.5rem * 7));
          }
        }

        @keyframes scroll-left {
          0% {
            transform: translateX(calc(-400px * 7 - 1.5rem * 7));
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-scroll-right {
          animation: scroll-right 40s linear infinite;
        }

        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }

        .animate-scroll-right:hover,
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
