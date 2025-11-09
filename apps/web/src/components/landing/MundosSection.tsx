import ScrollReveal from '@/components/ScrollReveal';

interface Mundo {
  title: string;
  icon: string;
  description: string;
  features: string[];
  gradient: string;
  letter: string;
}

export default function MundosSection() {
  const mundos: Mundo[] = [
    {
      title: 'Matemática',
      icon: '🔢',
      description: 'Desde aritmética hasta cálculo avanzado, desarrollamos el pensamiento lógico y la resolución de problemas',
      features: [
        'Álgebra y geometría',
        'Trigonometría y cálculo',
        'Estadística y probabilidad',
        'Problemas del mundo real',
      ],
      gradient: 'from-[#0ea5e9] to-[#0284c7]',
      letter: 'M',
    },
    {
      title: 'Ciencia',
      icon: '🔬',
      description: 'Física, química y biología aplicada con experimentos virtuales y proyectos científicos',
      features: [
        'Método científico',
        'Experimentos interactivos',
        'Proyectos de investigación',
        'Ciencia aplicada',
      ],
      gradient: 'from-[#10b981] to-[#059669]',
      letter: 'S',
    },
    {
      title: 'Programación',
      icon: '💻',
      description: 'Codificación desde cero hasta desarrollo de proyectos reales con tecnologías modernas',
      features: [
        'Python y JavaScript',
        'Algoritmos y lógica',
        'Desarrollo web y apps',
        'Proyectos personales',
      ],
      gradient: 'from-[#8b5cf6] to-[#7c3aed]',
      letter: 'T',
    },
  ];

  return (
    <section className="py-20 bg-transparent">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Single Big Card */}
        <div className="card-glass p-10 md:p-12 rounded-3xl border-2 border-white/20">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#0ea5e9]/10 via-[#10b981]/10 to-[#8b5cf6]/10 rounded-full border border-[#0ea5e9]/20 mb-6">
              <span className="bg-gradient-to-r from-[#0ea5e9] via-[#10b981] to-[#8b5cf6] bg-clip-text text-transparent font-semibold text-sm">
                Tres áreas de desarrollo
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Elegí tu propio mundo
            </h2>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-medium mb-6">
              O combinalos, las posibilidades son infinitas
            </p>

            <div className="flex justify-center mb-6">
              <div className="px-5 py-2.5 bg-gradient-to-r from-[#0ea5e9]/20 to-[#10b981]/20 rounded-full border border-[#0ea5e9]/30">
                <span className="text-base font-bold text-gray-900 dark:text-white">
                  👦 👧 Niños de 6 a 18 años
                </span>
              </div>
            </div>

            <p className="text-lg text-gray-600 dark:text-gray-400 font-light max-w-2xl mx-auto">
              Matemática, Ciencia y Programación integradas en una experiencia de aprendizaje única
            </p>
          </div>

          {/* Mundos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mundos.map((mundo, index) => (
            <ScrollReveal key={index} animation="zoom-in" delay={index * 150}>
              <div className="relative group"
            >
              {/* Card Container */}
              <div className="card-glass relative h-full p-8 rounded-3xl border-2 border-white/10 hover:border-white/30 transition-all duration-300">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${mundo.gradient} rounded-2xl shadow-lg mb-6`}>
                  <span className="text-4xl">{mundo.icon}</span>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                    {mundo.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {mundo.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-3 pt-4">
                    {mundo.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start space-x-3"
                      >
                        <div className={`flex-shrink-0 w-5 h-5 bg-gradient-to-br ${mundo.gradient} rounded-full flex items-center justify-center mt-0.5`}>
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              </div>
            </ScrollReveal>
          ))}
          </div>
        </div>

        {/* STEAM Banner */}
        <div className="mt-20 text-center">
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-8">
            <span className="text-7xl md:text-9xl font-black bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] bg-clip-text text-transparent" style={{ fontFamily: 'Orbitron, monospace', filter: 'drop-shadow(0 0 20px rgba(14, 165, 233, 0.6))' }}>
              S
            </span>
            <span className="text-7xl md:text-9xl font-black bg-gradient-to-r from-[#10b981] to-[#059669] bg-clip-text text-transparent" style={{ fontFamily: 'Orbitron, monospace', filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.6))' }}>
              T
            </span>
            <span className="text-7xl md:text-9xl font-black bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] bg-clip-text text-transparent" style={{ fontFamily: 'Orbitron, monospace', filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.6))' }}>
              E
            </span>
            <span className="text-7xl md:text-9xl font-black bg-gradient-to-r from-[#FF6B35] to-[#f59e0b] bg-clip-text text-transparent" style={{ fontFamily: 'Orbitron, monospace', filter: 'drop-shadow(0 0 20px rgba(255, 107, 53, 0.6))' }}>
              A
            </span>
            <span className="text-7xl md:text-9xl font-black bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] bg-clip-text text-transparent" style={{ fontFamily: 'Orbitron, monospace', filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.6))' }}>
              M
            </span>
          </div>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-light max-w-4xl mx-auto">
            Science · Technology · Engineering · Arts · Mathematics
          </p>
        </div>
      </div>
    </section>
  );
}
