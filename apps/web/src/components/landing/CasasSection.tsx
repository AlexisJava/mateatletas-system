interface Casa {
  name: string;
  description: string;
  traits: string[];
  gradient: string;
  bgColor: string;
}

export default function CasasSection() {
  const casas: Casa[] = [
    {
      name: 'Fénix',
      description: 'Renacen de sus errores con creatividad y resiliencia',
      traits: ['Creatividad', 'Resiliencia', 'Adaptabilidad'],
      gradient: 'from-[#FF6B35] to-[#f59e0b]',
      bgColor: 'bg-gradient-to-br from-orange-500/10 to-amber-500/10',
    },
    {
      name: 'Dragón',
      description: 'Liderazgo natural y determinación inquebrantable',
      traits: ['Liderazgo', 'Determinación', 'Valentía'],
      gradient: 'from-[#ef4444] to-[#dc2626]',
      bgColor: 'bg-gradient-to-br from-red-500/10 to-red-600/10',
    },
    {
      name: 'Tigre',
      description: 'Velocidad mental y precisión en cada movimiento',
      traits: ['Agilidad', 'Precisión', 'Competitividad'],
      gradient: 'from-[#fbbf24] to-[#f59e0b]',
      bgColor: 'bg-gradient-to-br from-yellow-400/10 to-amber-500/10',
    },
    {
      name: 'Águila',
      description: 'Visión estratégica y sabiduría superior',
      traits: ['Estrategia', 'Sabiduría', 'Perspectiva'],
      gradient: 'from-[#0ea5e9] to-[#0284c7]',
      bgColor: 'bg-gradient-to-br from-sky-500/10 to-blue-600/10',
    },
  ];

  return (
    <section className="py-20 bg-transparent">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#FF6B35]/10 to-[#0ea5e9]/10 rounded-full border border-[#FF6B35]/20 mb-6">
            <span className="bg-gradient-to-r from-[#FF6B35] to-[#0ea5e9] bg-clip-text text-transparent font-semibold text-sm">
              Identidad y pertenencia
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Las 4 Casas de Mateatletas
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto">
            Cada estudiante pertenece a una casa que representa sus fortalezas y estilo de aprendizaje
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {casas.map((casa, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Card */}
              <div className="card-glass relative h-full p-8 rounded-3xl border-2 border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:scale-105">
                {/* Gradient Glow on Hover */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${casa.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10 blur-2xl`} />

                {/* House Icon/Badge */}
                <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${casa.gradient} rounded-2xl flex items-center justify-center shadow-xl rotate-3 group-hover:rotate-0 transition-transform`}>
                  <span className="text-4xl font-black text-white">{casa.name[0]}</span>
                </div>

                {/* Content */}
                <div className="text-center space-y-4">
                  <h3 className={`text-2xl font-black bg-gradient-to-r ${casa.gradient} bg-clip-text text-transparent`}>
                    {casa.name}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                    {casa.description}
                  </p>

                  {/* Traits */}
                  <div className="pt-4 space-y-2">
                    {casa.traits.map((trait, traitIndex) => (
                      <div
                        key={traitIndex}
                        className="flex items-center justify-center space-x-2"
                      >
                        <div className={`w-2 h-2 bg-gradient-to-r ${casa.gradient} rounded-full`} />
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-semibold">
                          {trait}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Badge */}
                <div className={`mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center`}>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                    Casa {index + 1}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-12 max-w-2xl mx-auto">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Los estudiantes compiten representando a su casa en rankings, desafíos y torneos.
            Cada casa acumula puntos colectivos mientras celebra los logros individuales.
          </p>
        </div>
      </div>
    </section>
  );
}
