'use client';

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
    name: 'BASE',
    description: 'Acceso completo a la plataforma',
    price: 30000,
    period: '/mes',
    tags: ['Online 24/7'],
    isPopular: false,
    features: [
      'Cursos asincrónicos ilimitados',
      '73 Logros desbloqueables',
      'Sistema XP & Niveles',
      'Avatar 3D personalizado',
      'Tienda virtual de ítems',
      'Portal de padres'
    ]
  },
  {
    id: 'plus',
    name: 'PLUS',
    description: 'BASE + Clases con profesor',
    price: 50000,
    period: '/mes',
    tags: ['🔥 Más Popular', 'Online + Vivo'],
    isPopular: true,
    features: [
      'Todo de BASE incluido',
      '1 Grupo sincrónico',
      '8-10 estudiantes máximo',
      'Docentes certificados',
      'Asesoría psicopedagógica',
      'Tracking en tiempo real'
    ]
  },
  {
    id: 'ultra',
    name: 'ULTRA',
    description: 'Doble experiencia de aprendizaje',
    price: 88000,
    period: '/mes',
    tags: ['-12% Descuento', 'x2 Mundos'],
    isPopular: false,
    features: [
      'Todo de PLUS incluido',
      '2 Grupos sincrónicos',
      'Combina mundos libremente',
      'Mate + Progra + Ciencias',
      '12% descuento aplicado',
      '$44k por actividad'
    ]
  }
];

export default function PricingCards() {
  const handleSubscribe = (planId: string) => {
    console.log(`Usuario seleccionó plan: ${planId}`);
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
          margin-bottom: 32px;
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
        }
      `}</style>
    </>
  );
}
