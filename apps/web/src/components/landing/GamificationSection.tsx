interface LogroExample {
  name: string;
  description: string;
  icon: string;
  color: string;
}

export default function GamificationSection() {
  const logrosExamples: LogroExample[] = [
    {
      name: 'Venir a clase',
      description: 'Premiamos que no falten y sean constantes',
      icon: '📅',
      color: 'from-[#10b981] to-[#059669]',
    },
    {
      name: 'No rendirse',
      description: 'Los alentamos cuando algo les cuesta',
      icon: '💪',
      color: 'from-[#0ea5e9] to-[#0284c7]',
    },
    {
      name: 'Ayudar a otros',
      description: 'Valoramos cuando colaboran con compañeros',
      icon: '🤝',
      color: 'from-[#8b5cf6] to-[#7c3aed]',
    },
    {
      name: 'Pensar diferente',
      description: 'Los inspiramos a buscar soluciones creativas',
      icon: '🧠',
      color: 'from-[#fbbf24] to-[#f59e0b]',
    },
    {
      name: 'Y 68 habilidades más',
      description: 'Cada logro desarrolla su potencial',
      icon: '✨',
      color: 'from-[#FF6B35] to-[#f59e0b]',
    },
  ];

  const stats = [
    { value: '73', label: 'Habilidades que premiamos', subtext: 'Crecen como personas, no solo en notas' },
    { value: '15+', label: 'Niveles de progreso', subtext: 'Ven cómo avanzan clase a clase' },
    { value: '∞', label: 'Posibilidades', subtext: 'Nunca paran de crecer y aprender' },
  ];

  return (
    <section className="py-20 bg-transparent">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#8b5cf6]/10 to-[#0ea5e9]/10 rounded-full border border-[#8b5cf6]/20 mb-6">
            <span className="bg-gradient-to-r from-[#8b5cf6] to-[#0ea5e9] bg-clip-text text-transparent font-semibold text-sm">
              Motivación que funciona
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Premiamos lo que realmente importa para{' '}
            <span className="bg-gradient-to-r from-[#0ea5e9] via-[#8b5cf6] to-[#10b981] bg-clip-text text-transparent">
              su futuro
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto">
            No solo premiamos las notas. Valoramos que vengan, que no se rindan, que ayuden a otros y que piensen por sí mismos. Cada chico tiene su personaje 3D desde el primer día.
          </p>
        </div>

        {/* Image Showcase */}
        <div className="relative max-w-5xl mx-auto mb-16">
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            {/* Ready Player Me Group Shot */}
            <img
              src="https://media.readyplayer.me/nexus/images/Posed-GroupShot.webp"
              alt="Avatares 3D personalizables de Ready Player Me"
              className="w-full h-full object-cover"
            />

            {/* Overlay con información */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end">
              <div className="p-8 w-full">
                <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
                  Su personaje, su identidad
                </h3>
                <p className="text-white/90 font-medium">
                  Cada chico crea su propio personaje 3D y lo personaliza ganando recompensas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="card-glass text-center p-6 rounded-2xl border-2 border-white/10"
            >
              <div className="text-4xl font-black bg-gradient-to-r from-[#8b5cf6] to-[#0ea5e9] bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.subtext}
              </div>
            </div>
          ))}
        </div>

        {/* Logros Examples */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {logrosExamples.map((logro, index) => (
            <div
              key={index}
              className="relative"
            >
              {/* Card */}
              <div className="card-glass relative h-full p-6 rounded-2xl border-2 border-white/10 hover:border-white/30 transition-all duration-300">
                {/* Icon */}
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${logro.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <span className="text-3xl">{logro.icon}</span>
                </div>

                {/* Content */}
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    {logro.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                    {logro.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Info */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Por cada habilidad ganan puntos y monedas virtuales para comprar ropa y accesorios para su personaje
          </p>
        </div>
      </div>
    </section>
  );
}
