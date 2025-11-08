interface LogroExample {
  name: string;
  rarity: 'Común' | 'Raro' | 'Épico' | 'Legendario';
  reward: string;
  color: string;
}

export default function GamificationSection() {
  const logrosExamples: LogroExample[] = [
    {
      name: 'Primera Victoria',
      rarity: 'Común',
      reward: '10 XP + 5 monedas',
      color: 'from-gray-400 to-gray-500',
    },
    {
      name: 'Racha de Fuego',
      rarity: 'Raro',
      reward: '50 XP + 25 monedas',
      color: 'from-[#38bdf8] to-[#0ea5e9]',
    },
    {
      name: 'Maestro del Cálculo',
      rarity: 'Épico',
      reward: '200 XP + 100 monedas',
      color: 'from-[#a78bfa] to-[#8b5cf6]',
    },
    {
      name: 'Leyenda Matemática',
      rarity: 'Legendario',
      reward: '1000 XP + 500 monedas',
      color: 'from-[#fbbf24] to-[#f59e0b]',
    },
  ];

  const stats = [
    { value: '73', label: 'Logros totales', subtext: '16 común, 23 raro, 19 épico, 15 legendario' },
    { value: '15+', label: 'Niveles de XP', subtext: 'Sistema de progresión infinito' },
    { value: '10', label: 'Categorías', subtext: 'Racha, Asistencia, Desempeño y más' },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 dark:from-gray-800 dark:via-purple-950/20 dark:to-blue-950/20">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#8b5cf6]/10 to-[#0ea5e9]/10 rounded-full border border-[#8b5cf6]/20 mb-6">
            <span className="bg-gradient-to-r from-[#8b5cf6] to-[#0ea5e9] bg-clip-text text-transparent font-semibold text-sm">
              Sistema completo de recompensas
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Gamificación real
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto">
            73 logros implementados con 4 niveles de rareza, XP, monedas virtuales y un sistema de progresión que mantiene a los estudiantes motivados
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {logrosExamples.map((logro, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Card */}
              <div className="relative h-full p-6 bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-transparent transition-all duration-300 hover:shadow-2xl hover:scale-105">
                {/* Gradient Border Glow */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${logro.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl`} />

                {/* Rarity Badge */}
                <div className={`inline-block px-3 py-1 bg-gradient-to-r ${logro.color} rounded-full mb-4`}>
                  <span className="text-white font-bold text-xs uppercase tracking-wide">
                    {logro.rarity}
                  </span>
                </div>

                {/* Icon Placeholder */}
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${logro.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <span className="text-3xl font-black text-white">★</span>
                </div>

                {/* Content */}
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    {logro.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {logro.reward}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Cada logro desbloquea recompensas reales: XP para subir de nivel y monedas para la tienda virtual
          </p>
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#8b5cf6] to-[#0ea5e9] rounded-xl text-white font-bold shadow-lg">
            <span>Ver todos los logros</span>
            <span className="text-lg">→</span>
          </div>
        </div>
      </div>
    </section>
  );
}
