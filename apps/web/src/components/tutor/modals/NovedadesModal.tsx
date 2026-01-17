'use client';

import { X, Sparkles, Rocket, BookOpen, Gamepad2, Brain, Calendar, ArrowRight } from 'lucide-react';

interface NovedadesModalProps {
  onClose: () => void;
}

interface Novedad {
  id: string;
  tipo: 'curso' | 'taller' | 'evento' | 'promo';
  titulo: string;
  descripcion: string;
  fecha?: string;
  destacado?: boolean;
  color: 'cyan' | 'violet' | 'pink' | 'amber' | 'emerald';
  icono: 'rocket' | 'book' | 'game' | 'brain';
}

const novedadesData: Novedad[] = [
  {
    id: '1',
    tipo: 'curso',
    titulo: 'Robótica para Principiantes',
    descripcion: 'Aprende a construir y programar tu primer robot. Incluye kit de materiales.',
    fecha: 'Inicio: Febrero 2026',
    destacado: true,
    color: 'cyan',
    icono: 'rocket',
  },
  {
    id: '2',
    tipo: 'taller',
    titulo: 'Programación con Scratch',
    descripcion: 'Crea tus propios videojuegos y animaciones de forma divertida.',
    fecha: 'Todos los sábados',
    color: 'violet',
    icono: 'game',
  },
  {
    id: '3',
    tipo: 'curso',
    titulo: 'Matemática Olímpica',
    descripcion: 'Preparación intensiva para competencias nacionales e internacionales.',
    fecha: 'Inicio: Marzo 2026',
    color: 'pink',
    icono: 'brain',
  },
  {
    id: '4',
    tipo: 'evento',
    titulo: 'Campamento de Verano',
    descripcion: 'Una semana de ciencia, tecnología y diversión. Cupos limitados.',
    fecha: '15-22 Enero 2026',
    destacado: true,
    color: 'amber',
    icono: 'rocket',
  },
  {
    id: '5',
    tipo: 'promo',
    titulo: '20% OFF en segundo hijo',
    descripcion: 'Inscribí a tu segundo hijo y obtené descuento automático.',
    color: 'emerald',
    icono: 'book',
  },
];

const iconMap = {
  rocket: Rocket,
  book: BookOpen,
  game: Gamepad2,
  brain: Brain,
};

const colorMap = {
  cyan: {
    bg: 'from-cyan-500 to-blue-600',
    border: 'border-cyan-500/30',
    glow: 'shadow-cyan-500/30',
    text: 'text-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-300',
  },
  violet: {
    bg: 'from-violet-500 to-purple-600',
    border: 'border-violet-500/30',
    glow: 'shadow-violet-500/30',
    text: 'text-violet-400',
    badge: 'bg-violet-500/20 text-violet-300',
  },
  pink: {
    bg: 'from-pink-500 to-rose-600',
    border: 'border-pink-500/30',
    glow: 'shadow-pink-500/30',
    text: 'text-pink-400',
    badge: 'bg-pink-500/20 text-pink-300',
  },
  amber: {
    bg: 'from-amber-500 to-orange-600',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/30',
    text: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300',
  },
  emerald: {
    bg: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/30',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300',
  },
};

const tipoLabels = {
  curso: 'Nuevo Curso',
  taller: 'Taller',
  evento: 'Evento',
  promo: 'Promoción',
};

/**
 * Modal de Novedades - Diseño cautivador con glassmorphism
 */
export function NovedadesModal({ onClose }: NovedadesModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl"
      onClick={onClose}
    >
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/20 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-600/15 rounded-full blur-[80px] animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div
        className="relative w-full max-w-4xl max-h-[85vh] bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con efecto brillante */}
        <div className="relative p-6 pb-4 border-b border-white/5 overflow-hidden">
          {/* Glow del header */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-pink-600/10 to-cyan-600/10" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl blur-lg opacity-50" />
              <div className="relative p-3 bg-gradient-to-br from-violet-500 to-pink-600 rounded-2xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Novedades y Cursos</h2>
              <p className="text-slate-400">Descubrí las últimas oportunidades para tus hijos</p>
            </div>
          </div>
        </div>

        {/* Content con scroll */}
        <div className="p-6 overflow-auto max-h-[calc(85vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {novedadesData.map((novedad) => {
              const Icon = iconMap[novedad.icono];
              const colors = colorMap[novedad.color];

              return (
                <div
                  key={novedad.id}
                  className={`group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer
                    ${
                      novedad.destacado
                        ? `bg-gradient-to-br ${colors.bg}/10 ${colors.border} hover:${colors.border.replace('/30', '/50')}`
                        : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                    }
                  `}
                >
                  {/* Glow en hover */}
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  />

                  {/* Badge destacado */}
                  {novedad.destacado && (
                    <div className="absolute -top-2 -right-2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg shadow-amber-500/30 animate-pulse">
                      Destacado
                    </div>
                  )}

                  <div className="relative">
                    {/* Header de la card */}
                    <div className="flex items-start gap-4 mb-3">
                      <div
                        className={`p-2.5 rounded-xl bg-gradient-to-br ${colors.bg} shadow-lg ${colors.glow}`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full mb-1 ${colors.badge}`}
                        >
                          {tipoLabels[novedad.tipo]}
                        </span>
                        <h3 className="text-lg font-bold text-white group-hover:text-white/90 truncate">
                          {novedad.titulo}
                        </h3>
                      </div>
                    </div>

                    {/* Descripción */}
                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                      {novedad.descripcion}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      {novedad.fecha && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {novedad.fecha}
                        </div>
                      )}
                      <button
                        className={`flex items-center gap-1 text-sm font-medium ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity ml-auto`}
                      >
                        Ver más
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Final */}
          <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-violet-600/20 via-pink-600/20 to-cyan-600/20 border border-white/10 text-center">
            <h3 className="text-xl font-bold text-white mb-2">¿Querés más información?</h3>
            <p className="text-slate-400 mb-4">
              Contactanos y te asesoramos sobre el mejor programa para tu hijo
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://wa.me/5491112345678"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/25"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
              <a
                href="mailto:info@mateatletas.com"
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl font-semibold transition-all"
              >
                Enviar email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
