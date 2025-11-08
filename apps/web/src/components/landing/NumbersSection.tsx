interface Stat {
  value: string;
  label: string;
  description: string;
  color: string;
}

export default function NumbersSection() {
  const stats: Stat[] = [
    {
      value: '73',
      label: 'Logros',
      description: 'Sistema completo de gamificación',
      color: 'from-[#0ea5e9] to-[#0284c7]',
    },
    {
      value: '4',
      label: 'Casas',
      description: 'Fénix, Dragón, Tigre, Águila',
      color: 'from-[#FF6B35] to-[#e65929]',
    },
    {
      value: '10-15',
      label: 'Estudiantes',
      description: 'Por grupo en clases en vivo',
      color: 'from-[#fbbf24] to-[#f59e0b]',
    },
    {
      value: '15+',
      label: 'Niveles',
      description: 'Sistema de progresión XP',
      color: 'from-[#10b981] to-[#059669]',
    },
    {
      value: '24%',
      label: 'Descuento',
      description: 'Hasta 24% con 5 niveles',
      color: 'from-[#8b5cf6] to-[#7c3aed]',
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Mateatletas en números
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-light max-w-2xl mx-auto">
            Un ecosistema completo diseñado para transformar el aprendizaje de matemáticas
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Card */}
              <div className="relative p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-transparent dark:hover:border-transparent transition-all duration-300 hover:shadow-2xl hover:scale-105">
                {/* Gradient Border on Hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl`} />

                {/* Content */}
                <div className="text-center space-y-3">
                  <div className={`text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {stat.label}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-normal leading-relaxed">
                    {stat.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
