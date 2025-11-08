interface Mundo {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  gradient: string;
  bgGradient: string;
}

export default function MundosSection() {
  const mundos: Mundo[] = [
    {
      title: 'Clases Sincrónicas',
      subtitle: 'Aprendizaje en vivo',
      description: 'Clases en tiempo real con docentes expertos en grupos reducidos de 10-15 estudiantes',
      features: [
        'Individual o grupal',
        'Reserva de clases',
        'Asistencia digital',
        'Seguimiento personalizado',
      ],
      gradient: 'from-[#0ea5e9] to-[#0284c7]',
      bgGradient: 'from-[#0ea5e9]/10 to-[#0284c7]/5',
    },
    {
      title: 'Portal Estudiante',
      subtitle: 'El Gimnasio',
      description: 'Dashboard gamificado donde los estudiantes entrenan, compiten y evolucionan',
      features: [
        'Progreso y ranking',
        'Avatares 3D personalizables',
        'Calendario de clases',
        'Tienda virtual',
      ],
      gradient: 'from-[#FF6B35] to-[#fbbf24]',
      bgGradient: 'from-[#FF6B35]/10 to-[#fbbf24]/5',
    },
    {
      title: 'Portal Tutor',
      subtitle: 'Seguimiento integral',
      description: 'Gestiona múltiples hijos, realiza pagos y visualiza el progreso de cada estudiante',
      features: [
        'Gestión de familia',
        'Pagos y descuentos',
        'Informes de progreso',
        'Historial académico',
      ],
      gradient: 'from-[#10b981] to-[#059669]',
      bgGradient: 'from-[#10b981]/10 to-[#059669]/5',
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-[#0ea5e9]/10 rounded-full border border-[#0ea5e9]/20 mb-6">
            <span className="text-[#0ea5e9] dark:text-[#38bdf8] font-semibold text-sm">
              Tres pilares fundamentales
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Los 3 mundos de Mateatletas
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto">
            Un ecosistema integrado que conecta clases en vivo, gamificación y seguimiento familiar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mundos.map((mundo, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Card Container */}
              <div className={`relative h-full p-8 bg-gradient-to-br ${mundo.bgGradient} rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-transparent transition-all duration-300 hover:shadow-2xl hover:scale-105`}>
                {/* Gradient Glow on Hover */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${mundo.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10 blur-2xl`} />

                {/* Icon Placeholder */}
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${mundo.gradient} rounded-2xl shadow-lg mb-6`}>
                  <span className="text-3xl font-black text-white">{index + 1}</span>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div>
                    <div className={`text-sm font-bold bg-gradient-to-r ${mundo.gradient} bg-clip-text text-transparent mb-2`}>
                      {mundo.subtitle}
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                      {mundo.title}
                    </h3>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {mundo.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2 pt-4">
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
          ))}
        </div>
      </div>
    </section>
  );
}
