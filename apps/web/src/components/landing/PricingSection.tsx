interface Plan {
  name: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  gradient: string;
}

export default function PricingSection() {
  const plans: Plan[] = [
    {
      name: 'Individual',
      price: '$55.000',
      description: 'Clases personalizadas 1 a 1',
      features: [
        'Clases individuales en vivo',
        'Horario flexible',
        'Atención personalizada',
        'Acceso a gamificación',
        'Avatar 3D personalizable',
        'Portal de tutor',
      ],
      gradient: 'from-[#0ea5e9] to-[#0284c7]',
    },
    {
      name: 'Grupal',
      price: '$38.000',
      originalPrice: '$50.000',
      discount: '24% OFF',
      description: 'Grupos reducidos de 10-15 estudiantes',
      features: [
        'Clases grupales en vivo',
        'Máximo 15 estudiantes',
        'Sistema de casas',
        '73 logros desbloqueables',
        'Avatar 3D personalizable',
        'Ranking y competencias',
        'Tienda virtual',
        'Portal de tutor completo',
      ],
      highlighted: true,
      gradient: 'from-[#10b981] to-[#059669]',
    },
    {
      name: 'Familia',
      price: '$42.000',
      description: 'Por estudiante (2 o más hijos)',
      features: [
        'Descuentos por familia',
        'Hasta 24% de descuento',
        '5 niveles de descuento',
        'Gestión centralizada',
        'Portal multi-estudiante',
        'Todas las funciones grupales',
      ],
      gradient: 'from-[#8b5cf6] to-[#7c3aed]',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-800 dark:via-blue-950/20 dark:to-purple-950/20">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#10b981]/10 to-[#0ea5e9]/10 rounded-full border border-[#10b981]/20 mb-6">
            <span className="bg-gradient-to-r from-[#10b981] to-[#0ea5e9] bg-clip-text text-transparent font-semibold text-sm">
              Planes accesibles
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Elige tu plan
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto">
            Precios transparentes con sistema de descuentos por familia. Desde $38.000/mes.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative ${plan.highlighted ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {/* Highlighted Badge */}
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="px-4 py-2 bg-gradient-to-r from-[#10b981] to-[#059669] rounded-full shadow-lg">
                    <span className="text-white font-bold text-sm">Más popular</span>
                  </div>
                </div>
              )}

              {/* Card */}
              <div className={`relative h-full p-8 bg-white dark:bg-gray-900 rounded-3xl border-2 ${
                plan.highlighted
                  ? 'border-[#10b981] shadow-2xl shadow-[#10b981]/20'
                  : 'border-gray-200 dark:border-gray-700'
              } transition-all hover:scale-105 hover:shadow-2xl`}>
                {/* Discount Badge */}
                {plan.discount && (
                  <div className="absolute top-4 right-4">
                    <div className="px-3 py-1 bg-gradient-to-r from-[#FF6B35] to-[#f59e0b] rounded-full">
                      <span className="text-white font-bold text-xs">{plan.discount}</span>
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${plan.gradient} rounded-2xl mb-4 shadow-lg`}>
                    <span className="text-3xl font-black text-white">{index + 1}</span>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="text-center mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  {plan.originalPrice && (
                    <div className="text-lg text-gray-400 line-through mb-1">
                      {plan.originalPrice}
                    </div>
                  )}
                  <div className={`text-5xl font-black bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                    {plan.price}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    por mes
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-start space-x-3"
                    >
                      <div className={`flex-shrink-0 w-5 h-5 bg-gradient-to-br ${plan.gradient} rounded-full flex items-center justify-center mt-0.5`}>
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button className={`w-full py-4 bg-gradient-to-r ${plan.gradient} text-white rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105`}>
                  Comenzar ahora
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Discount Info */}
        <div className="max-w-4xl mx-auto">
          <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 text-center">
              Sistema de descuentos por familia
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="text-2xl font-black text-[#10b981] mb-1">2 hijos</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">5% OFF</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="text-2xl font-black text-[#10b981] mb-1">3 hijos</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">10% OFF</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="text-2xl font-black text-[#10b981] mb-1">4 hijos</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">16% OFF</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="text-2xl font-black text-[#10b981] mb-1">5 hijos</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">20% OFF</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-[#10b981]/20 to-[#059669]/20 rounded-xl border-2 border-[#10b981]">
                <div className="text-2xl font-black text-[#10b981] mb-1">6+ hijos</div>
                <div className="text-sm font-bold text-[#10b981]">24% OFF</div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
              Los descuentos se calculan automáticamente según la cantidad de estudiantes activos
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
