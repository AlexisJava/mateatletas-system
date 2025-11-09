interface Feature {
  name: string;
  mateatletas: boolean | string;
  traditional: boolean | string;
  highlight?: boolean;
}

export default function ComparisonSection() {
  const features: Feature[] = [
    { name: 'Avatares 3D personalizables', mateatletas: 'Ready Player Me', traditional: false, highlight: true },
    { name: 'Sistema de gamificación', mateatletas: '73 logros', traditional: false, highlight: true },
    { name: 'Asesoría Psicopedagógica', mateatletas: 'Personalizada', traditional: false, highlight: true },
    { name: 'XP y niveles', mateatletas: '15+ niveles', traditional: false },
    { name: 'Tienda virtual de items', mateatletas: true, traditional: false },
    { name: 'Clases en vivo', mateatletas: true, traditional: true },
    { name: 'Grupos reducidos', mateatletas: '8-10 estudiantes', traditional: '25+ estudiantes' },
    { name: 'Portal de padres', mateatletas: 'Completo', traditional: 'Inexistente' },
    { name: 'Seguimiento de progreso', mateatletas: 'Tiempo real', traditional: 'Mensual' },
    { name: 'Descuentos por familia', mateatletas: true, traditional: 'Variable' },
    { name: 'Asistencia digital', mateatletas: true, traditional: false },
  ];

  return (
    <section className="py-20 bg-transparent">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#0ea5e9]/10 to-[#10b981]/10 rounded-full border border-[#0ea5e9]/20 mb-6">
            <span className="bg-gradient-to-r from-[#0ea5e9] to-[#10b981] bg-clip-text text-transparent font-semibold text-sm">
              Comparación objetiva
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            ¿Por qué elegir Mateatletas?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto">
            La diferencia entre una clase tradicional y una aventura de aprendizaje
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-4">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Característica</span>
            </div>
            <div className="p-4 bg-gradient-to-br from-[#0ea5e9]/10 to-[#10b981]/10 rounded-xl border-2 border-[#0ea5e9]">
              <span className="text-lg font-black bg-gradient-to-r from-[#0ea5e9] to-[#10b981] bg-clip-text text-transparent">
                Mateatletas
              </span>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600">
              <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                Tradicional
              </span>
            </div>
          </div>

          {/* Feature Rows */}
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`grid grid-cols-3 gap-4 p-4 rounded-xl transition-all ${
                  feature.highlight
                    ? 'bg-gradient-to-r from-[#0ea5e9]/5 to-[#10b981]/5 border-2 border-[#0ea5e9]/30'
                    : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {/* Feature Name */}
                <div className="flex items-center">
                  <span className={`font-medium ${
                    feature.highlight
                      ? 'text-gray-900 dark:text-white font-bold'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {feature.name}
                  </span>
                </div>

                {/* Mateatletas Value */}
                <div className="flex items-center justify-center">
                  {typeof feature.mateatletas === 'boolean' ? (
                    feature.mateatletas ? (
                      <div className="w-8 h-8 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">✓</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">✗</span>
                      </div>
                    )
                  ) : (
                    <span className="text-sm font-bold text-[#0ea5e9] dark:text-[#38bdf8]">
                      {feature.mateatletas}
                    </span>
                  )}
                </div>

                {/* Traditional Value */}
                <div className="flex items-center justify-center">
                  {typeof feature.traditional === 'boolean' ? (
                    feature.traditional ? (
                      <div className="w-8 h-8 bg-gray-400 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">✓</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 font-bold text-lg">✗</span>
                      </div>
                    )
                  ) : (
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {feature.traditional}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center p-8 bg-gradient-to-r from-[#0ea5e9]/10 via-[#10b981]/10 to-[#0ea5e9]/10 rounded-2xl border border-[#0ea5e9]/20">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
              La diferencia está en la experiencia
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No solo enseñamos matemáticas, creamos una aventura de aprendizaje inolvidable
            </p>
            <button className="px-8 py-4 bg-gradient-to-r from-[#0ea5e9] to-[#10b981] text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-[#0ea5e9]/40 transition-all hover:scale-105">
              Comenzar ahora
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
