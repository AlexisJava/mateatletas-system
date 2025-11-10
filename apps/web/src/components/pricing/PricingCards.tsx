'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PricingPlan {
  id: 'base' | 'plus' | 'ultra';
  name: string;
  description: string;
  price: number;
  period: string;
  tags: string[];
  isPopular: boolean;
  features: string[];
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'base',
    name: 'EXPLORADOR',
    description: 'Para que aprendan a su ritmo, cuando quieran',
    price: 30000,
    period: '/mes',
    tags: ['Disponible 24/7'],
    isPopular: false,
    features: [
      'Lecciones en video siempre disponibles',
      'Sistema de logros y recompensas',
      'Progreso visible por niveles',
      'Personaje digital para personalizar',
      'Accesorios virtuales motivadores',
      'Panel de control para padres'
    ]
  },
  {
    id: 'plus',
    name: 'ACOMPAÑADO',
    description: 'Con profesor en vivo + todo lo del plan Explorador',
    price: 60000,
    period: '/mes',
    tags: ['🔥 El favorito de las familias', 'Clases en vivo'],
    isPopular: true,
    features: [
      'Todo del plan Explorador incluido',
      '1 clase grupal en vivo por semana',
      'Grupos chicos: 8-10 chicos máximo',
      'Profesores que inspiran y motivan',
      'Acompañamiento pedagógico personalizado',
      'Seguimiento en vivo del progreso'
    ]
  },
  {
    id: 'ultra',
    name: 'COMPLETO',
    description: 'Máximo desarrollo: dos mundos cada semana',
    price: 105600,
    period: '/mes',
    tags: ['Ahorrás 12%', 'Doble impacto'],
    isPopular: false,
    features: [
      'Todo del plan Acompañado incluido',
      '2 clases en vivo por semana',
      'Elegí libremente: Mate, Progra o Ciencias',
      'Desarrollo integral STEAM',
      'Ya incluye el 12% de descuento',
      'Sale $52.800 por mundo'
    ]
  }
];

export default function PricingCards() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSubscribe = (planId: string) => {
    // Plan EXPLORADOR va directo a cursos online, no necesita inscripción
    if (planId === 'base') {
      router.push('/cursos-online');
      return;
    }

    // Otros planes muestran el modal de selección
    setSelectedPlan(planId);
    setShowModal(true);
  };

  const handleModalChoice = (choice: 'club' | 'colonia') => {
    setShowModal(false);
    if (choice === 'club') {
      router.push('/club');
    } else {
      router.push('/colonia');
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-[1200px] mx-auto">
        {PRICING_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`pricing-card relative ${plan.isPopular ? 'popular-card' : ''}`}
          >
            {/* Top Bar - Animated para PLUS */}
            <div className={`top-bar ${plan.isPopular ? 'top-bar-animated' : ''}`} />

            {/* Particles - Solo para PLUS */}
            {plan.isPopular && (
              <>
                <div className="particle particle-1" style={{ left: '10%', animationDelay: '0s' }} />
                <div className="particle particle-2" style={{ left: '30%', animationDelay: '0.5s' }} />
                <div className="particle particle-3" style={{ left: '50%', animationDelay: '1s' }} />
                <div className="particle particle-4" style={{ left: '70%', animationDelay: '1.5s' }} />
                <div className="particle particle-5" style={{ left: '90%', animationDelay: '2s' }} />
              </>
            )}

            {/* Card Content */}
            <div className="relative z-10">
              {/* Tags */}
              {plan.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {plan.tags.map((tag, index) => (
                    <div
                      key={index}
                      className={`tag ${
                        plan.isPopular && index === 0 ? 'tag-popular' : 'tag-default'
                      }`}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              )}

              {/* Plan Name */}
              <h3 className="plan-name">{plan.name}</h3>

              {/* Description */}
              <p className="plan-description">{plan.description}</p>

              {/* Price */}
              <div className={`price-container ${plan.isPopular ? 'price-glow' : ''}`}>
                <span className={`price-main ${plan.isPopular ? 'price-gradient' : ''}`}>
                  ${plan.price.toLocaleString('es-AR')}
                </span>
                <span className="price-period">{plan.period}</span>
              </div>

              {/* Inscription Fee */}
              {plan.id === 'base' ? (
                <div className="inscription-fee inscription-free">
                  <span className="inscription-icon">
                    <span role="img" aria-label="Brillos - Sin inscripción">✨</span>
                  </span>
                  <div className="inscription-text">
                    <span className="inscription-label">Inscripción</span>
                    <span className="inscription-amount inscription-free-text">Sin Inscripción</span>
                  </div>
                </div>
              ) : (
                <div className="inscription-fee">
                  <span className="inscription-icon">
                    <span role="img" aria-label="Diamante - Inscripción única">💎</span>
                  </span>
                  <div className="inscription-text">
                    <span className="inscription-label">Inscripción (única vez)</span>
                    <span className="inscription-amount">$20.000</span>
                  </div>
                </div>
              )}

              {/* Features */}
              <ul className="features-list">
                {plan.features.map((feature, index) => (
                  <li key={index} className="feature-item">
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleSubscribe(plan.id)}
                className={`cta-button ${plan.isPopular ? 'cta-gradient' : 'cta-default'}`}
                aria-label={`Inscribirme al plan ${plan.name}`}
              >
                Inscribirme
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de selección */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-gradient-to-br from-gray-900/95 via-gray-900/98 to-black/95 rounded-3xl border border-white/10 p-8 md:p-12 max-w-2xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#0ea5e9]/10 via-[#8b5cf6]/10 to-[#10b981]/10 rounded-full border border-[#0ea5e9]/20 mb-4">
                <span className="bg-gradient-to-r from-[#0ea5e9] via-[#8b5cf6] to-[#10b981] bg-clip-text text-transparent font-semibold text-sm">
                  Inscripciones Abiertas 2026
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
                ¿A qué querés inscribirte?
              </h2>
              <p className="text-gray-400 text-lg">
                Elegí la opción que más te interese
              </p>
            </div>

            {/* Opciones */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {/* Opción Club */}
              <button
                onClick={() => handleModalChoice('club')}
                className="group relative p-6 rounded-2xl border-2 border-white/10 hover:border-[#0ea5e9] transition-all duration-300 hover:scale-105 bg-gradient-to-br from-white/5 to-transparent"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#0ea5e9]/0 to-[#0ea5e9]/0 group-hover:from-[#0ea5e9]/10 group-hover:to-[#0284c7]/10 transition-all duration-300" />
                <div className="relative">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                    <span role="img" aria-label="Club STEAM">🎓</span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">
                    Club STEAM 2026
                  </h3>
                  <p className="text-sm text-gray-400">
                    Clases todo el año con profesores en vivo
                  </p>
                </div>
              </button>

              {/* Opción Colonia */}
              <button
                onClick={() => handleModalChoice('colonia')}
                className="group relative p-6 rounded-2xl border-2 border-white/10 hover:border-[#10b981] transition-all duration-300 hover:scale-105 bg-gradient-to-br from-white/5 to-transparent"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#10b981]/0 to-[#10b981]/0 group-hover:from-[#10b981]/10 group-hover:to-[#059669]/10 transition-all duration-300" />
                <div className="relative">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                    <span role="img" aria-label="Colonia de Verano">☀️</span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">
                    Colonia de Verano
                  </h3>
                  <p className="text-sm text-gray-400">
                    Diversión y aprendizaje en vacaciones
                  </p>
                </div>
              </button>
            </div>

            {/* Botón cerrar */}
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 text-gray-400 hover:text-white transition-colors font-semibold"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Base Card Styles */
        .pricing-card {
          background: linear-gradient(145deg, #1e293b, #0f172a);
          border-radius: 24px;
          padding: 40px 32px;
          border: 2px solid rgba(100, 116, 139, 0.2);
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform, border-color;
        }

        .pricing-card:hover {
          transform: translateY(-8px);
          border-color: rgba(14, 165, 233, 0.5);
          box-shadow: 0 20px 60px rgba(14, 165, 233, 0.2);
        }

        /* Popular Card Floating Animation */
        .popular-card {
          animation: floatCard 4s ease-in-out infinite;
        }

        @keyframes floatCard {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        .popular-card:hover {
          animation: none;
          transform: translateY(-8px);
        }

        /* Top Bar */
        .top-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 8px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .pricing-card:hover .top-bar {
          opacity: 1;
        }

        .top-bar-animated {
          height: 6px;
          opacity: 1 !important;
          background: linear-gradient(90deg, #FF6B35, #fbbf24, #0ea5e9);
          background-size: 200% 100%;
          animation: barShift 2s linear infinite;
        }

        @keyframes barShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        /* Particles */
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          animation: particleFloat 3s linear infinite;
          opacity: 0.6;
          z-index: 1;
        }

        .particle-1 { background: #0ea5e9; }
        .particle-2 { background: #FF6B35; }
        .particle-3 { background: #fbbf24; }
        .particle-4 { background: #0ea5e9; }
        .particle-5 { background: #FF6B35; }

        @keyframes particleFloat {
          0% { transform: translateY(100%) translateX(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100%) translateX(20px); opacity: 0; }
        }

        /* Tags */
        .tag {
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-family: 'Nunito', sans-serif;
        }

        .tag-default {
          background: rgba(14, 165, 233, 0.15);
          color: #38bdf8;
          border: 1px solid rgba(14, 165, 233, 0.3);
        }

        .tag-popular {
          background: linear-gradient(135deg, #FF6B35, #fbbf24);
          color: #fff;
          border: none;
          animation: tagWiggle 1s ease-in-out infinite;
        }

        @keyframes tagWiggle {
          0%, 100% { transform: rotate(-3deg) scale(1); }
          50% { transform: rotate(3deg) scale(1.1); }
        }

        /* Plan Name */
        .plan-name {
          font-family: 'Rajdhani', sans-serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        /* Plan Description */
        .plan-description {
          font-family: 'Nunito', sans-serif;
          font-size: 0.95rem;
          color: #94a3b8;
          margin-bottom: 24px;
        }

        /* Price */
        .price-container {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 16px;
        }

        .price-main {
          font-family: 'Nunito', sans-serif;
          font-size: 3.8rem;
          font-weight: 900;
          color: #0ea5e9;
          line-height: 1;
        }

        .price-gradient {
          background: linear-gradient(135deg, #FF6B35, #fbbf24);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .price-glow {
          animation: priceGlow 2s ease-in-out infinite;
        }

        @keyframes priceGlow {
          0%, 100% {
            filter: brightness(1) drop-shadow(0 0 0px rgba(255, 107, 53, 0));
          }
          50% {
            filter: brightness(1.4) drop-shadow(0 0 20px rgba(255, 107, 53, 0.6));
          }
        }

        .price-period {
          font-family: 'Nunito', sans-serif;
          font-size: 0.9rem;
          color: #64748b;
        }

        /* Inscription Fee */
        .inscription-fee {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(251, 191, 36, 0.08);
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 24px;
        }

        .inscription-icon {
          font-size: 1.5rem;
          filter: drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3));
        }

        .inscription-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }

        .inscription-label {
          font-family: 'Nunito', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .inscription-amount {
          font-family: 'Nunito', sans-serif;
          font-size: 1.2rem;
          font-weight: 800;
          color: #fbbf24;
        }

        /* Inscription Free (BASE plan) */
        .inscription-free {
          background: rgba(16, 185, 129, 0.08);
          border-color: rgba(16, 185, 129, 0.2);
        }

        .inscription-free .inscription-icon {
          filter: drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3));
        }

        .inscription-free-text {
          color: #10b981 !important;
        }

        /* Features List */
        .features-list {
          list-style: none;
          padding: 0;
          margin: 0 0 32px 0;
        }

        .feature-item {
          font-family: 'Nunito', sans-serif;
          font-size: 0.95rem;
          color: #cbd5e1;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          position: relative;
          padding-left: 32px;
        }

        .feature-item:last-child {
          border-bottom: none;
        }

        .feature-item::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #10b981;
          font-weight: 900;
          font-size: 1.2rem;
        }

        /* CTA Button */
        .cta-button {
          width: 100%;
          padding: 18px;
          border: none;
          border-radius: 12px;
          font-family: 'Nunito', sans-serif;
          font-size: 1.1rem;
          font-weight: 800;
          color: #fff;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          will-change: transform, background;
        }

        .cta-default {
          background: #0ea5e9;
        }

        .cta-default:hover {
          background: #38bdf8;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(14, 165, 233, 0.4);
        }

        .cta-gradient {
          background: linear-gradient(135deg, #FF6B35, #fbbf24);
        }

        .cta-gradient:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255, 107, 53, 0.5);
        }

        .cta-gradient::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: ctaSweep 3s linear infinite;
        }

        @keyframes ctaSweep {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        .cta-button:active {
          transform: translateY(0);
        }

        .cta-button:focus-visible {
          outline: 2px solid #38bdf8;
          outline-offset: 2px;
        }

        /* Responsive Adjustments */
        @media (max-width: 1024px) {
          .pricing-card {
            padding: 32px 24px;
          }

          .plan-name {
            font-size: 2rem;
          }

          .price-main {
            font-size: 3rem;
          }

          .inscription-fee {
            padding: 10px 14px;
          }

          .inscription-amount {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </>
  );
}
