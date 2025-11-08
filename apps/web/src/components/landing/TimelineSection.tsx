interface TimelineEvent {
  month: string;
  title: string;
  description: string;
  isSpecial?: boolean;
}

export default function TimelineSection() {
  const timeline: TimelineEvent[] = [
    {
      month: 'Enero',
      title: 'Inicio de ciclo',
      description: 'Nuevos estudiantes, nuevas casas, selección de avatares',
    },
    {
      month: 'Febrero',
      title: 'Primer torneo',
      description: 'Competencia entre casas - Desafíos matemáticos',
    },
    {
      month: 'Marzo',
      title: 'Actualización de logros',
      description: 'Nuevos logros de temporada disponibles',
    },
    {
      month: 'Abril',
      title: 'Evaluaciones intermedias',
      description: 'Seguimiento de progreso académico',
    },
    {
      month: 'Mayo',
      title: 'Festival de avatares',
      description: 'Nuevos items en tienda virtual',
    },
    {
      month: 'Junio',
      title: 'Cierre semestre 1',
      description: 'Entrega de certificados y reconocimientos',
    },
    {
      month: 'Julio',
      title: 'Colonia de verano',
      description: 'Programa intensivo de vacaciones',
      isSpecial: true,
    },
    {
      month: 'Agosto',
      title: 'Inicio semestre 2',
      description: 'Nuevos objetivos y desafíos',
    },
    {
      month: 'Septiembre',
      title: 'Torneo otoño',
      description: 'Gran competencia inter-casas',
    },
    {
      month: 'Octubre',
      title: 'Semana de la ciencia',
      description: 'Actividades STEAM especiales',
    },
    {
      month: 'Noviembre',
      title: 'Evaluaciones finales',
      description: 'Preparación para cierre de año',
    },
    {
      month: 'Diciembre',
      title: 'Cierre anual',
      description: 'Ceremonia de premiación y celebración',
      isSpecial: true,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-800 dark:via-blue-950/20 dark:to-purple-950/20">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-[#0ea5e9]/10 rounded-full border border-[#0ea5e9]/20 mb-6">
            <span className="text-[#0ea5e9] dark:text-[#38bdf8] font-semibold text-sm">
              Calendario de actividades
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Un año lleno de aventuras
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto">
            Torneos, actualizaciones de logros, evaluaciones y eventos especiales durante todo el año
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="relative">
          {/* Vertical Line (Desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#0ea5e9] via-[#8b5cf6] to-[#10b981]" />

          {/* Timeline Items */}
          <div className="space-y-8">
            {timeline.map((event, index) => {
              const isLeft = index % 2 === 0;

              return (
                <div
                  key={index}
                  className={`relative lg:grid lg:grid-cols-2 lg:gap-12 ${
                    !isLeft ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Left Column */}
                  <div className={`${isLeft ? '' : 'lg:text-right'} ${!isLeft && 'lg:col-start-1 lg:row-start-1'}`}>
                    {isLeft && (
                      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-[#0ea5e9] dark:hover:border-[#38bdf8] transition-all shadow-lg hover:shadow-xl">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`px-3 py-1 ${
                            event.isSpecial
                              ? 'bg-gradient-to-r from-[#fbbf24] to-[#f59e0b]'
                              : 'bg-gradient-to-r from-[#0ea5e9] to-[#0284c7]'
                          } rounded-full`}>
                            <span className="text-white font-bold text-sm">{event.month}</span>
                          </div>
                          {event.isSpecial && (
                            <span className="text-xl">⭐</span>
                          )}
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                          {event.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Center Dot */}
                  <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className={`w-4 h-4 ${
                      event.isSpecial
                        ? 'bg-gradient-to-br from-[#fbbf24] to-[#f59e0b]'
                        : 'bg-gradient-to-br from-[#0ea5e9] to-[#0284c7]'
                    } rounded-full ring-4 ring-white dark:ring-gray-800`} />
                  </div>

                  {/* Right Column */}
                  <div className={`${!isLeft ? '' : 'lg:text-left'} ${isLeft && 'lg:col-start-2 lg:row-start-1'}`}>
                    {!isLeft && (
                      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-[#0ea5e9] dark:hover:border-[#38bdf8] transition-all shadow-lg hover:shadow-xl">
                        <div className={`flex items-center space-x-3 mb-3 ${!isLeft ? 'lg:justify-start' : ''}`}>
                          <div className={`px-3 py-1 ${
                            event.isSpecial
                              ? 'bg-gradient-to-r from-[#fbbf24] to-[#f59e0b]'
                              : 'bg-gradient-to-r from-[#0ea5e9] to-[#0284c7]'
                          } rounded-full`}>
                            <span className="text-white font-bold text-sm">{event.month}</span>
                          </div>
                          {event.isSpecial && (
                            <span className="text-xl">⭐</span>
                          )}
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                          {event.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Mobile View */}
                  <div className="lg:hidden bg-white dark:bg-gray-900 p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-[#0ea5e9] dark:hover:border-[#38bdf8] transition-all shadow-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`px-3 py-1 ${
                        event.isSpecial
                          ? 'bg-gradient-to-r from-[#fbbf24] to-[#f59e0b]'
                          : 'bg-gradient-to-r from-[#0ea5e9] to-[#0284c7]'
                      } rounded-full`}>
                        <span className="text-white font-bold text-sm">{event.month}</span>
                      </div>
                      {event.isSpecial && (
                        <span className="text-xl">⭐</span>
                      )}
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
