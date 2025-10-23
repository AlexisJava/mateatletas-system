'use client';

import { Mail, Phone, MessageCircle, HelpCircle, FileText, Video, Users, BookOpen } from 'lucide-react';

export default function AyudaTab() {
  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
      {/* Contacto */}
      <div className="bg-gray-900 rounded-xl shadow-2xl border-2 border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-indigo-600 rounded-lg p-2">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Contacto</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700">
            <div className="flex items-start gap-3">
              <div className="bg-green-600 rounded-lg p-2">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1">WhatsApp</h3>
                <p className="text-sm text-gray-300 mb-2">Comunícate con nosotros directamente por WhatsApp</p>
                <a
                  href="https://wa.me/5491234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Abrir WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1">Email</h3>
                <p className="text-sm text-gray-300 mb-2">Envíanos un correo electrónico</p>
                <a
                  href="mailto:contacto@mateatletas.com"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  contacto@mateatletas.com
                </a>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700">
            <div className="flex items-start gap-3">
              <div className="bg-indigo-600 rounded-lg p-2">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1">Teléfono</h3>
                <p className="text-sm text-gray-300 mb-2">Llamanos de lunes a viernes de 9:00 a 18:00</p>
                <a
                  href="tel:+5491234567890"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +54 9 11 2345-6789
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preguntas Frecuentes */}
      <div className="bg-gray-900 rounded-xl shadow-2xl border-2 border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-amber-600 rounded-lg p-2">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Preguntas Frecuentes</h2>
        </div>

        <div className="space-y-3">
          <details className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700 group">
            <summary className="font-bold text-white cursor-pointer flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              ¿Cómo funcionan las clases virtuales?
            </summary>
            <p className="text-sm text-gray-300 mt-3 pl-6">
              Las clases son 100% en vivo a través de nuestra plataforma. Recibirás un enlace antes de cada clase para
              conectarte. Las clases duran 60 minutos y son interactivas con tu hijo/a y el profesor.
            </p>
          </details>

          <details className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700 group">
            <summary className="font-bold text-white cursor-pointer flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              ¿Puedo cambiar el horario de las clases?
            </summary>
            <p className="text-sm text-gray-300 mt-3 pl-6">
              Sí, puedes cambiar el horario contactándonos por WhatsApp o email con al menos 24 horas de anticipación.
              Te ayudaremos a encontrar un horario que se ajuste mejor a tu agenda.
            </p>
          </details>

          <details className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700 group">
            <summary className="font-bold text-white cursor-pointer flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              ¿Qué pasa si mi hijo/a falta a una clase?
            </summary>
            <p className="text-sm text-gray-300 mt-3 pl-6">
              Si avisas con anticipación, puedes recuperar la clase en otro horario disponible. El profesor también
              puede enviarte material de la clase para que tu hijo/a no se atrase.
            </p>
          </details>

          <details className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700 group">
            <summary className="font-bold text-white cursor-pointer flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              ¿Cómo funciona la membresía CLUB?
            </summary>
            <p className="text-sm text-gray-300 mt-3 pl-6">
              La membresía CLUB te da acceso ilimitado a todas nuestras clases virtuales durante todo el año escolar
              (marzo a diciembre). Pagas una cuota mensual fija y tu hijo/a puede asistir a todas las clases que desee.
            </p>
          </details>

          <details className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700 group">
            <summary className="font-bold text-white cursor-pointer flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              ¿Qué diferencia hay entre CLUB y Cursos?
            </summary>
            <p className="text-sm text-gray-300 mt-3 pl-6">
              El CLUB es una membresía anual con acceso a todas las clases. Los Cursos son programas específicos de 2-3
              meses con temáticas puntuales (ej: Exploradores Matemáticos, Desafío Álgebra, etc.) que se pagan por
              única vez.
            </p>
          </details>
        </div>
      </div>

      {/* Recursos */}
      <div className="bg-gray-900 rounded-xl shadow-2xl border-2 border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-100 rounded-lg p-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-white">Recursos</h2>
        </div>

        <div className="space-y-3">
          <button className="w-full bg-gray-800 rounded-xl p-4 border-2 border-gray-700 hover:border-indigo-500 transition-all text-left">
            <div className="flex items-start gap-3">
              <div className="bg-red-100 rounded-lg p-2">
                <Video className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1">Videos Tutoriales</h3>
                <p className="text-sm text-gray-300">Aprende a usar la plataforma</p>
              </div>
            </div>
          </button>

          <button className="w-full bg-gray-800 rounded-xl p-4 border-2 border-gray-700 hover:border-indigo-500 transition-all text-left">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1">Guía para Padres</h3>
                <p className="text-sm text-gray-300">Manual completo de uso</p>
              </div>
            </div>
          </button>

          <button className="w-full bg-gray-800 rounded-xl p-4 border-2 border-gray-700 hover:border-indigo-500 transition-all text-left">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-lg p-2">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1">Comunidad de Padres</h3>
                <p className="text-sm text-gray-300">Únete a nuestro grupo de WhatsApp</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Horarios de Atención */}
      <div className="bg-gray-900 rounded-xl shadow-2xl border-2 border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-teal-100 rounded-lg p-2">
            <Phone className="w-6 h-6 text-teal-600" />
          </div>
          <h2 className="text-xl font-bold text-white">Horarios de Atención</h2>
        </div>

        <div className="space-y-3">
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border-2 border-teal-200">
            <h3 className="font-bold text-teal-900 mb-2">Soporte Administrativo</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p>Lunes a Viernes: 9:00 - 18:00</p>
              <p>Sábados: 10:00 - 14:00</p>
              <p className="text-red-600 font-semibold">Domingos: Cerrado</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border-2 border-indigo-200">
            <h3 className="font-bold text-indigo-900 mb-2">Clases Virtuales</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p>Lunes a Viernes: 14:00 - 20:00</p>
              <p>Sábados: 9:00 - 13:00</p>
              <p className="text-gray-600">Horario Argentina (GMT-3)</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200">
            <h3 className="font-bold text-amber-900 mb-2">WhatsApp</h3>
            <div className="text-sm text-gray-700">
              <p>Disponible 24/7</p>
              <p className="text-gray-600">Respuesta en menos de 2 horas en horario laboral</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
