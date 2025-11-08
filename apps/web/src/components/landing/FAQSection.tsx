'use client';

import { useState } from 'react';

interface FAQ {
  question: string;
  answer: string;
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      question: '¿Cómo funciona el sistema de gamificación?',
      answer: 'Los estudiantes ganan XP y monedas completando clases, desafíos y objetivos. Existen 73 logros divididos en 4 raridades (Común, Raro, Épico, Legendario) que otorgan recompensas. El XP permite subir de nivel (15+ niveles) y las monedas se usan en la tienda virtual para comprar items para el avatar 3D.',
    },
    {
      question: '¿Qué son las 4 casas?',
      answer: 'Cada estudiante es asignado a una de las 4 casas (Fénix, Dragón, Tigre, Águila) que representan diferentes fortalezas y estilos de aprendizaje. Las casas compiten en rankings y torneos, acumulando puntos colectivos mientras celebran logros individuales.',
    },
    {
      question: '¿Cómo funcionan los avatares 3D?',
      answer: 'Utilizamos Ready Player Me, una plataforma líder en avatares 3D. Los estudiantes pueden personalizar completamente su avatar (peinado, ropa, accesorios, colores) y desbloquear items exclusivos comprándolos con monedas virtuales ganadas en el sistema de gamificación.',
    },
    {
      question: '¿Cuántos estudiantes hay por grupo?',
      answer: 'Los grupos tienen un máximo de 10-15 estudiantes para garantizar atención personalizada. También ofrecemos clases individuales 1 a 1 para quienes prefieren atención exclusiva.',
    },
    {
      question: '¿Cómo funcionan los descuentos por familia?',
      answer: 'Tenemos 5 niveles de descuento automático: 2 hijos (5%), 3 hijos (10%), 4 hijos (16%), 5 hijos (20%), 6 o más hijos (24%). Los descuentos se calculan automáticamente según la cantidad de estudiantes activos de la misma familia.',
    },
    {
      question: '¿Qué incluye el portal de tutor?',
      answer: 'El portal permite gestionar múltiples hijos en un solo lugar, realizar pagos, visualizar descuentos aplicados, ver progreso académico en tiempo real, consultar historial de clases, y acceder a informes detallados de cada estudiante.',
    },
    {
      question: '¿Las clases son en vivo o grabadas?',
      answer: 'Todas las clases son en vivo con docentes expertos. No ofrecemos clases grabadas porque creemos en la interacción directa y el aprendizaje colaborativo en tiempo real.',
    },
    {
      question: '¿Puedo cambiar de plan más adelante?',
      answer: 'Sí, puedes cambiar entre plan Individual, Grupal o Familiar en cualquier momento. Los cambios se aplican desde el siguiente período de facturación y los descuentos se recalculan automáticamente.',
    },
    {
      question: '¿Cómo se registra la asistencia?',
      answer: 'Utilizamos un sistema de asistencia digital donde los docentes registran la presencia de cada estudiante en tiempo real. Los tutores pueden ver el historial completo de asistencia desde el portal.',
    },
    {
      question: '¿Qué edades pueden participar?',
      answer: 'Mateatletas está diseñado para estudiantes de primaria y secundaria. Los grupos se organizan por nivel académico para garantizar que el contenido sea apropiado y desafiante para cada edad.',
    },
  ];

  const toggleFAQ = (index: number): void => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-[#8b5cf6]/10 rounded-full border border-[#8b5cf6]/20 mb-6">
            <span className="text-[#8b5cf6] dark:text-[#a78bfa] font-semibold text-sm">
              Preguntas frecuentes
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            ¿Tienes dudas?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto">
            Encuentra respuestas a las preguntas más comunes sobre Mateatletas
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:border-[#8b5cf6] dark:hover:border-[#a78bfa]"
            >
              {/* Question Button */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <span className="text-lg font-bold text-gray-900 dark:text-white pr-8">
                  {faq.question}
                </span>
                <div className={`flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded-full flex items-center justify-center transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}>
                  <span className="text-white font-bold text-xl">
                    {openIndex === index ? '−' : '+'}
                  </span>
                </div>
              </button>

              {/* Answer */}
              {openIndex === index && (
                <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Contact */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            ¿No encontraste la respuesta que buscabas?
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-[#8b5cf6]/40 transition-all hover:scale-105">
            Contactar soporte
          </button>
        </div>
      </div>
    </section>
  );
}
