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
      role: 'Mamá de Valentina, 10 años',
      testimonial: 'Mi hija pasó de odiar las matemáticas a pedirme que reserve más clases. No lo podía creer cuando me preguntó si podía tener clase el sábado también.',
      rating: 5,
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Estudiante de 14 años',
      testimonial: 'Me encanta mi personaje 3D. Ya tengo 45 logros y me compré un montón de ropa virtual. Es como jugar pero estoy aprendiendo posta.',
      rating: 5,
    },
    {
      name: 'Ana Martínez',
      role: 'Mamá de 3 chicos',
      testimonial: 'Desde mi celu veo cómo van los tres. El descuento por hermanos es un golazo, y verlos motivados no tiene precio.',
      rating: 5,
    },
    {
      name: 'Lucas Fernández',
      role: 'Estudiante de 12 años',
      testimonial: 'Las clases son re divertidas. Los profes explican re bien y si no entendés algo te ayudan al toque. Ya no me da miedo preguntar.',
      rating: 5,
    },
    {
      name: 'Patricia López',
      role: 'Mamá de Tomás, 13 años',
      testimonial: 'Las notas del colegio mejoraron banda. Pero lo mejor es que ahora estudia sin que le diga. Eso para mí no tiene precio.',
      rating: 5,
    },
    {
      name: 'Diego Santos',
      role: 'Estudiante de 16 años',
      testimonial: 'Estoy creando mi propia app. Los profes te enseñan cosas que de verdad se usan, no boludeces. Ahora quiero estudiar programación en serio.',
      rating: 5,
    },
    {
      name: 'Sofía Ruiz',
      role: 'Estudiante de 10 años',
      testimonial: 'Los experimentos de ciencia son lo más. Aprendí más acá en 3 meses que en todo el año en la escuela. Y me divierto un montón.',
      rating: 5,
    },
  ];

  const testimonialsRow2: Testimonial[] = [
    {
      name: 'Roberto García',
      role: 'Papá de 2 chicos',
      testimonial: 'Entro al panel cuando quiero y veo exactamente cómo van. Eso me da una tranquilidad que antes no tenía. Sé que están aprendiendo.',
      rating: 5,
    },
    {
      name: 'Valentina Morales',
      role: 'Estudiante de 15 años',
      testimonial: 'Los profes son unos genios. Explican re bien y hacen que todo sea interesante. Ya no me parece aburrida la matemática.',
      rating: 5,
    },
    {
      name: 'Julio Castillo',
      role: 'Papá de Lautaro y Emma',
      testimonial: 'Con el descuento por hermanos sale re bien. Y verlos a los dos re enganchados con las clases no tiene precio.',
      rating: 5,
    },
    {
      name: 'Camila Torres',
      role: 'Estudiante de 13 años',
      testimonial: 'Subo de nivel y gano monedas virtuales. Me compré un montón de cosas para mi personaje. Es adictivo pero aprendo banda.',
      rating: 5,
    },
    {
      name: 'Fernando Paz',
      role: 'Papá de Agustín, 12 años',
      testimonial: 'Todo funciona perfecto. Si tengo alguna duda, me responden al toque. Es súper profesional pero sin perder el lado humano.',
      rating: 5,
    },
    {
      name: 'Martina Silva',
      role: 'Estudiante de 11 años',
      testimonial: 'Ahora las ecuaciones me parecen re fáciles. Los desafíos son divertidos y voy aprendiendo sin darme cuenta.',
      rating: 5,
    },
    {
      name: 'Andrés Vega',
      role: 'Papá de 3 chicos',
      testimonial: 'Cada uno va a su ritmo, sin presión. El grande está avanzado, la del medio va tranquila, y el chiquito arrancó de cero. Todos felices.',
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
                Historias reales
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Lo que cuentan los padres y los chicos
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto">
              Más de 500 familias argentinas ya están viviendo el cambio
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
                <div className="flex items-center space-x-1 mb-4" role="img" aria-label={`Calificación: ${testimonial.rating} de 5 estrellas`}>
                  {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                    <span key={starIndex} className="text-[#fbbf24] text-xl" aria-hidden="true">★</span>
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
                <div className="flex items-center space-x-1 mb-4" role="img" aria-label={`Calificación: ${testimonial.rating} de 5 estrellas`}>
                  {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                    <span key={starIndex} className="text-[#fbbf24] text-xl" aria-hidden="true">★</span>
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
              Padres recomiendan Mateatletas
            </p>
          </div>
          <div className="text-center p-6 card-glass rounded-2xl border border-white/10">
            <div className="text-4xl font-black text-[#0ea5e9] mb-2">95%</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Chicos más motivados que antes
            </p>
          </div>
          <div className="text-center p-6 card-glass rounded-2xl border border-white/10">
            <div className="text-4xl font-black text-[#FF6B35] mb-2">92%</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Mejoraron sus notas en el colegio
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
