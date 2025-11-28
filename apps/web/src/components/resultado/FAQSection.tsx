// ═══════════════════════════════════════════════════════════════════════════════
// FAQ SECTION - ULTRA PERSUASIVO
// Convertir cada objeción en una razón MÁS para comprar
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { MessageCircle, CheckCircle2 } from 'lucide-react';

interface FAQ {
  pregunta: string;
  respuesta: string;
  emoji: string;
  highlight?: string; // Frase clave a destacar
}

const faqs: FAQ[] = [
  {
    emoji: '⏱️',
    pregunta: '¿Cuánto tiempo tiene mi hijo para completar los cursos?',
    respuesta:
      'Tenés acceso DE POR VIDA a todos los cursos. Tu hijo puede avanzar a su propio ritmo sin presiones ni fechas límite. La mayoría completa cada curso en 6-8 semanas dedicando 2-3 horas semanales, pero puede ir más rápido o más lento según su ritmo.',
    highlight: 'ACCESO DE POR VIDA - Pagás una vez, aprendés para siempre',
  },
  {
    emoji: '💻',
    pregunta: '¿Qué necesita mi hijo para empezar?',
    respuesta:
      'Solo una computadora con acceso a internet. No se necesitan programas especiales ni conocimientos previos. Todo el material, las herramientas y el software están INCLUIDOS en la plataforma. Puede empezar hoy mismo.',
    highlight: 'TODO INCLUIDO - Cero inversión adicional',
  },
  {
    emoji: '👨‍🏫',
    pregunta: '¿Mi hijo va a tener apoyo si se traba?',
    respuesta:
      'SÍ! Aunque los cursos son asincrónicos para que aprenda a su ritmo, incluyen SOPORTE PRIORITARIO por WhatsApp. Nuestro equipo docente responde en menos de 24hs. Además, la comunidad de estudiantes se apoya entre sí.',
    highlight: 'SOPORTE ILIMITADO - Nunca está solo',
  },
  {
    emoji: '🎯',
    pregunta: '¿Qué pasa si mi hijo no tiene experiencia previa?',
    respuesta:
      'MEJOR AÚN! Cada ruta está diseñada específicamente para arrancar desde CERO en el primer curso. Los mejores resultados los vemos justamente con chicos que nunca programaron antes, porque aprenden las bases correctas desde el principio.',
    highlight: 'PERFECTO PARA PRINCIPIANTES - Empezar bien es clave',
  },
  {
    emoji: '💰',
    pregunta: '¿Puedo pagar en cuotas?',
    respuesta:
      'SÍ! Aceptamos pagos en cuotas con tarjeta de crédito (3, 6 y 12 cuotas sin interés). También podés pagar en un solo pago con transferencia bancaria, débito o MercadoPago. Facilitamos todas las opciones para que puedas arrancar HOY.',
    highlight: 'HASTA 12 CUOTAS SIN INTERÉS - Empezá con menos de $XX por mes',
  },
  {
    emoji: '🎓',
    pregunta: '¿Mi hijo recibe un certificado al finalizar?',
    respuesta:
      'SÍ! Al completar cada curso recibe un certificado digital verificable. Al finalizar los 4 cursos de la ruta completa obtiene un CERTIFICADO OFICIAL de Mateatletas que puede incluir en su portfolio, CV o solicitudes universitarias.',
    highlight: 'CERTIFICACIÓN OFICIAL - Acredita su conocimiento',
  },
  {
    emoji: '🔄',
    pregunta: '¿Qué pasa si no le gusta o no es para él?',
    respuesta:
      'CERO RIESGO. En los primeros 7 días, si tu hijo no está satisfecho, te devolvemos el 100% de tu inversión. Sin preguntas, sin complicaciones, sin letra chica. Probalo sin ningún riesgo y después decidís.',
    highlight: 'GARANTÍA 100% - No tenés nada que perder',
  },
  {
    emoji: '👨‍👩‍👧‍👦',
    pregunta: '¿Cómo funcionan los descuentos por múltiples hijos?',
    respuesta:
      'SÚPER SIMPLE: Primer hijo precio completo. Segundo hijo 30% OFF. Tercero en adelante 50% OFF. Si tenés 3 hijos, el promedio es casi MITAD DE PRECIO por hijo. Los descuentos se aplican AUTOMÁTICAMENTE al checkout.',
    highlight: 'HASTA 50% OFF POR HIJO - Familia numerosa = más ahorro',
  },
  {
    emoji: '📱',
    pregunta: '¿Puedo hacer seguimiento del progreso de mi hijo?',
    respuesta:
      'ABSOLUTAMENTE! Tenés acceso a un panel donde ves en TIEMPO REAL: qué clases completó, qué proyectos hizo, qué skills está desarrollando y cuánto tiempo dedica. Transparencia total para que estés tranquilo.',
    highlight: 'PANEL DE SEGUIMIENTO - Ves todo su progreso',
  },
  {
    emoji: '🚀',
    pregunta: '¿Cuándo puede empezar mi hijo?',
    respuesta:
      'HOY MISMO! Apenas completes la inscripción, tu hijo recibe acceso instantáneo a todo el material. Puede empezar la primera clase en los próximos 5 minutos. No hay fechas de inicio ni esperas.',
    highlight: 'ACCESO INMEDIATO - Empieza en 5 minutos',
  },
];

export default function FAQSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className="mb-24">
      {/* ═══════════════════════════════════════════════════════════════════════════
          HEADER - NO SON DUDAS, SON OPORTUNIDADES
          ═══════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <div className="text-6xl mb-6">❓</div>
        <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
          Últimas dudas antes de{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            decidir
          </span>
        </h2>
        <p className="text-slate-300 text-xl max-w-3xl mx-auto">
          Cada pregunta tiene una respuesta que te va a dejar{' '}
          <strong className="text-white">más tranquilo</strong>
        </p>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          FAQ ACCORDION - CADA RESPUESTA ES UNA VICTORIA
          ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
          >
            <div
              className={`bg-slate-900/60 backdrop-blur-xl border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
                expandedIndex === index
                  ? 'border-cyan-500/50 shadow-2xl shadow-cyan-500/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Pregunta - Button */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-6 md:p-8 text-left hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <span className="text-4xl flex-shrink-0">{faq.emoji}</span>
                    <span className="text-lg md:text-xl font-bold text-white">{faq.pregunta}</span>
                  </div>

                  {/* Icono expandir/colapsar */}
                  <motion.div
                    animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-cyan-400 text-3xl flex-shrink-0"
                  >
                    ↓
                  </motion.div>
                </div>
              </button>

              {/* Respuesta - Expandible */}
              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 md:px-8 pb-8 border-t border-slate-800">
                      <div className="pt-6 pl-0 md:pl-16">
                        <p className="text-slate-200 text-lg leading-relaxed mb-4">
                          {faq.respuesta}
                        </p>

                        {/* Highlight box - LA CLAVE */}
                        {faq.highlight && (
                          <div className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-purple-500/10 border-2 border-emerald-500/30 rounded-xl p-5">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                              <span className="text-emerald-400 font-black text-base md:text-lg">
                                {faq.highlight}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          CTA CONTACTO WHATSAPP - ÚLTIMA SALIDA ANTES DE LA CONVERSIÓN
          ═══════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="mt-16 max-w-3xl mx-auto"
      >
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute -inset-3 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-3xl blur-2xl" />

          <div className="relative bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 border-2 border-green-500/40 rounded-3xl p-10 text-center">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-3xl font-black text-white mb-3">¿Todavía tenés dudas?</h3>
            <p className="text-slate-300 text-lg mb-6">
              Hablá directamente con nosotros. Te respondemos{' '}
              <strong className="text-white">en minutos</strong>.
            </p>

            <a
              href="https://wa.me/5491234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-black text-xl rounded-2xl transition-all shadow-2xl shadow-green-500/30 hover:scale-105"
            >
              <MessageCircle className="w-7 h-7" />
              Escribinos por WhatsApp
            </a>

            <p className="text-slate-500 text-sm mt-6">Respondemos todos los días de 9 AM a 9 PM</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
