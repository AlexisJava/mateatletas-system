interface Testimonial {
  name: string;
  role: string;
  casa: string;
  testimonial: string;
  rating: number;
}

export default function TestimonialsSection() {
  const testimonials: Testimonial[] = [
    {
      name: 'María González',
      role: 'Madre de estudiante',
      casa: 'Casa Fénix',
      testimonial: 'Mi hija pasó de odiar las matemáticas a pedirme que reserve más clases. El sistema de gamificación es increíble.',
      rating: 5,
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Estudiante nivel 12',
      casa: 'Casa Dragón',
      testimonial: 'Los avatares 3D son geniales. Ya desbloqueé 45 logros y estoy en el top 10 de mi casa.',
      rating: 5,
    },
    {
      name: 'Ana Martínez',
      role: 'Tutora de 3 hijos',
      casa: 'Múltiples casas',
      testimonial: 'El portal de tutor me permite hacer seguimiento de todos mis hijos en un solo lugar. Los descuentos ayudan mucho.',
      rating: 5,
    },
    {
      name: 'Lucas Fernández',
      role: 'Estudiante nivel 8',
      casa: 'Casa Tigre',
      testimonial: 'Las clases en vivo son divertidas. Los profes son muy buenos y siempre nos ayudan.',
      rating: 5,
    },
    {
      name: 'Patricia López',
      role: 'Madre de estudiante',
      casa: 'Casa Águila',
      testimonial: 'El progreso académico es real. Mi hijo mejoró sus notas en el colegio desde que empezó.',
      rating: 5,
    },
    {
      name: 'Diego Santos',
      role: 'Estudiante nivel 15',
      casa: 'Casa Fénix',
      testimonial: 'Me encanta competir con mi casa. Tengo 68 logros y casi todos los items de la tienda.',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/20 dark:from-gray-800 dark:via-purple-950/10 dark:to-blue-950/10">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-16">
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

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div className="h-full p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-[#10b981] dark:hover:border-[#34d399] transition-all shadow-lg hover:shadow-2xl hover:scale-105">
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
                    <div className="text-xs text-[#10b981] dark:text-[#34d399] font-semibold">
                      {testimonial.casa}
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

        {/* Bottom Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-4xl font-black text-[#10b981] mb-2">98%</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Satisfacción de tutores
            </p>
          </div>
          <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-4xl font-black text-[#0ea5e9] mb-2">95%</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Estudiantes más motivados
            </p>
          </div>
          <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-4xl font-black text-[#FF6B35] mb-2">92%</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Mejora en notas escolares
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
