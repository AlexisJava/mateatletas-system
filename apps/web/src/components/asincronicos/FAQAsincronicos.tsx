'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    pregunta: '¿Mi hijo realmente aprende solo viendo videos?',
    respuesta:
      'No son solo videos. Cada clase incluye ejercicios prácticos, proyectos hands-on, y desafíos que debe completar para avanzar. Además, tiene acceso a un foro donde puede hacer preguntas y ver las dudas de otros estudiantes. Es aprendizaje activo, no pasivo.',
  },
  {
    pregunta: '¿Cómo sé si mi hijo está avanzando?',
    respuesta:
      'Tenés acceso a un panel de padre/tutor donde ves en tiempo real: qué clases completó, qué proyectos entregó, cuánto tiempo está dedicando, y su progreso general. Recibís reportes semanales automáticos por email.',
  },
  {
    pregunta: '¿Cuánto tiempo por semana necesita dedicar?',
    respuesta:
      'Depende del curso, pero en promedio 2-4 horas semanales. Lo bueno es que puede dividirlo como quiera: 30 minutos por día, o 2 horas el sábado. Total flexibilidad.',
  },
  {
    pregunta: '¿Hasta cuándo tiene acceso al curso?',
    respuesta:
      'Acceso DE POR VIDA. No hay vencimientos. Si necesita pausar 3 meses porque tiene exámenes en la escuela, puede volver cuando quiera. El contenido siempre estará ahí.',
  },
  {
    pregunta: '¿Tiene soporte si se traba?',
    respuesta:
      'Sí. Aunque no tiene un profe en vivo, puede hacer preguntas en el foro del curso y un docente le responde en menos de 24hs. También tenemos tutoriales extra y material de apoyo.',
  },
  {
    pregunta: '¿Es más barato que los cursos en vivo?',
    respuesta:
      'Sí. Los cursos asincrónicos cuestan aproximadamente 40% menos que los sincrónicos, porque no hay costo de coordinación de horarios ni salas virtuales. Mismo contenido, menor precio.',
  },
  {
    pregunta: '¿Recibe un certificado al finalizar?',
    respuesta:
      'Sí. Al completar el 100% del curso (todas las clases + proyectos), recibe un certificado digital verificable que puede compartir o agregar a su portfolio.',
  },
  {
    pregunta: '¿Puede hacer el curso con un amigo/hermano?',
    respuesta:
      'Cada estudiante necesita su propia cuenta para que trackeemos su progreso individual. Pero sí pueden avanzar juntos, comparar proyectos, y ayudarse mutuamente.',
  },
  {
    pregunta: '¿Qué pasa si no le gusta el curso?',
    respuesta:
      'Tenés 7 días desde la compra para pedir reembolso completo si no te convence. Sin preguntas, sin vueltas. Queremos que estés 100% seguro de tu inversión.',
  },
  {
    pregunta: '¿Son los mismos profes que los cursos en vivo?',
    respuesta:
      'Sí! Los videos están grabados por los mismos docentes que dan las clases sincrónicas. Mismo nivel de enseñanza, misma calidad, solo que pregrabado para que puedas verlo cuando quieras.',
  },
];

export default function FAQAsincronicos() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative py-32 bg-black">
      {/* Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-[#8b5cf6]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-[#0ea5e9]/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6">
            Preguntas <span className="title-gradient">frecuentes</span>
          </h2>
          <p className="text-2xl text-white/70">
            Resolvemos todas tus dudas sobre los cursos asincrónicos
          </p>
        </motion.div>

        {/* FAQs */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              {/* Glow sutil */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />

              {/* Card */}
              <div
                className={`relative bg-black/60 backdrop-blur-xl border-2 rounded-2xl overflow-hidden transition-all ${
                  openIndex === index
                    ? 'border-[#0ea5e9]/50'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Pregunta - Clickeable */}
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left group"
                >
                  <span className="text-lg md:text-xl font-bold text-white pr-4 group-hover:text-[#0ea5e9] transition-colors">
                    {faq.pregunta}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-6 h-6 text-white/60 group-hover:text-[#0ea5e9] transition-colors" />
                  </motion.div>
                </button>

                {/* Respuesta - Expandible */}
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 border-t border-white/10">
                        <p className="text-white/70 leading-relaxed pt-4">{faq.respuesta}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contacto adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-white/60 text-lg mb-4">¿Tenés otra pregunta?</p>
          <a
            href="https://wa.me/5491234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#10b981]/20 border border-[#10b981]/30 rounded-xl text-[#10b981] font-bold hover:bg-[#10b981]/30 transition-all"
          >
            💬 Escribinos por WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}
