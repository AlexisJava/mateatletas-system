interface Stat {
  value: string;
  label: string;
  description: string;
  color: string;
}

export default function NumbersSection() {
  const stats: Stat[] = [
    {
      value: '120+',
      label: 'Estudiantes activos',
      description: 'Familias confiando en nosotros',
      color: 'from-[#0ea5e9] to-[#0284c7]',
    },
    {
      value: '10-15',
      label: 'Alumnos por grupo',
      description: 'Atención personalizada garantizada',
      color: 'from-[#10b981] to-[#059669]',
    },
    {
      value: '3',
      label: 'Mundos STEAM',
      description: 'Matemática, Programación y Ciencias',
      color: 'from-[#fbbf24] to-[#f59e0b]',
    },
    {
      value: '100%',
      label: 'Clases en vivo',
      description: 'Interacción real con docentes',
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Card */}
              <div className="card-glass relative p-8 rounded-2xl border-2 border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl">
                {/* Gradient Glow on Hover - sin blur para mantener legibilidad */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`} />

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
