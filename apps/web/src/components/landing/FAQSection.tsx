'use client';

import { useState } from 'react';
import ScrollReveal from '@/components/ScrollReveal';

interface FAQ {
  question: string;
  answer: string;
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      question: '¿Cómo hacen para que los chicos se mantengan motivados?',
      answer: 'Usamos un sistema de recompensas que los chicos aman: ganan puntos y monedas virtuales completando clases y desafíos. Hay 73 logros para alcanzar (desde básicos hasta maestros) que dan premios. Los puntos les permiten subir de nivel (más de 15 niveles) y las monedas las usan para comprar ropa y accesorios para su personaje digital. Es como un videojuego, pero aprenden de verdad.',
    },
    {
      question: '¿Cuántos chicos hay por clase? ¿Mi hijo va a recibir atención?',
      answer: 'Las clases tienen máximo 8-10 estudiantes, nunca más. Esto nos permite que cada chico reciba atención personalizada y pueda hacer preguntas sin vergüenza. También ofrecemos clases individuales 1 a 1 si preferís que tu hijo tenga atención exclusiva de un profesor.',
    },
    {
      question: '¿Tienen descuentos si tengo más de un hijo?',
      answer: 'Sí! Y son automáticos. Si tenés 2 hijos, 5% de descuento. Con 3, 10%. Con 4, 16%. Con 5, 20%. Y si tenés 6 o más, te hacemos un 24% de descuento. El sistema lo calcula solo, vos no tenés que hacer nada. Queremos que sea accesible para toda la familia.',
    },
    {
      question: '¿Puedo ver cómo va mi hijo desde mi celular?',
      answer: 'Totalmente. Desde tu panel de control podés ver el progreso de todos tus hijos en un solo lugar: qué clases hicieron, qué nota sacaron, cuántos puntos ganaron, qué logros desbloquearon. También podés hacer los pagos, consultar el historial completo y descargar informes detallados. Todo desde tu celu, tablet o compu.',
    },
    {
      question: '¿Para qué edades es?',
      answer: 'Desde primaria hasta secundaria. Los grupos se arman por nivel de conocimiento, no por edad. Así tu hijo está con otros chicos que saben lo mismo que él, nadie se aburre ni se siente perdido. El contenido se adapta para que siempre sea desafiante pero alcanzable.',
    },
  ];

  const toggleFAQ = (index: number): void => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-transparent">
      <div className="max-w-[1400px] mx-auto px-6">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-[#8b5cf6]/10 rounded-full border border-[#8b5cf6]/20 mb-6">
              <span className="text-[#8b5cf6] dark:text-[#a78bfa] font-semibold text-sm">
                Preguntas frecuentes
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Las preguntas que nos hacen los padres
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto">
              Entendemos tus dudas. Acá respondemos las más comunes con total transparencia.
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <ScrollReveal key={index} animation="fade-left" delay={index * 100}>
              <div className="card-glass rounded-2xl border border-white/10 overflow-hidden transition-all hover:border-[#8b5cf6]/50"
              >
              {/* Question Button */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
                aria-label={`${faq.question} - ${openIndex === index ? 'Cerrar' : 'Abrir'} respuesta`}
              >
                <span className="text-lg font-bold text-gray-900 dark:text-white pr-8">
                  {faq.question}
                </span>
                <div className={`flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded-full flex items-center justify-center transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}>
                  <span className="text-white font-bold text-xl" aria-hidden="true">
                    {openIndex === index ? '−' : '+'}
                  </span>
                </div>
              </button>

              {/* Answer */}
              {openIndex === index && (
                <div
                  className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-200"
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                >
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Bottom Contact */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            ¿Tenés otra pregunta? Estamos para ayudarte
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-[#8b5cf6]/40 transition-all hover:scale-105">
            Hablá con nosotros
          </button>
        </div>
      </div>
    </section>
  );
}
