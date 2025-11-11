'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlobalInscriptionModal from '@/components/inscripciones-2026/GlobalInscriptionModal';
import { TipoInscripcion2026 } from '@/types/inscripciones-2026';

interface PricingPlan {
  id: 'colonia' | 'ciclo2026' | 'pack-completo';
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
    id: 'colonia',
    name: '🏖️ COLONIA DE VERANO',
    description: 'Enero 2026 - 3 semanas intensivas',
    price: 55000,
    period: '/mes',
    tags: ['Empieza en Enero'],
    isPopular: false,
    features: [
      'Curso intensivo de 3 semanas',
      '2 clases de 1.5 horas por semana',
      'Acceso completo a plataforma gamificada',
      'Grupos reducidos (máx. 10 estudiantes)',
      'Progreso guardado para continuar en 2026',
      'Inscripción: $25.000 (única vez)'
    ]
  },
  {
    id: 'ciclo2026',
    name: '🚀 CICLO 2026',
    description: 'Desde Marzo - Año completo de clases',
    price: 60000,
    period: '/mes',
    tags: ['Empieza en Marzo', 'Clases en vivo'],
    isPopular: false,
    features: [
      'Un mundo STEAM (Matemáticas, Programación o Ciencias)',
      '2 clases en vivo por semana (1.5 horas cada una)',
      'Total: 3 horas semanales de clase',
      'Grupos reducidos (máx. 10 estudiantes)',
      'Tu personaje 3D + sistema de recompensas',
      'Matrícula EARLY BIRD: $50.000 (Nov-Dic)',
      '📅 Horarios confirmados antes del 20 feb'
    ]
  },
  {
    id: 'pack-completo',
    name: '⭐ PACK COMPLETO',
    description: 'Colonia + Ciclo 2026 - Mejor oferta',
    price: 60000,
    period: '/mes',
    tags: ['🔥 MEJOR OFERTA', 'Máximo ahorro'],
    isPopular: true,
    features: [
      'Todo de Colonia + Todo de Ciclo 2026',
      'Inscripción total: $60.000 (ahorrás $15.000)',
      'Enero: $55.000/mes • Marzo: $60.000/mes',
      'Prioridad ABSOLUTA en elección de horarios',
      'Continuidad del progreso (XP, avatar, casa)',
      'Sin interrupciones en el aprendizaje'
    ]
  }
];

export default function PricingCards() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TipoInscripcion2026 | null>(null);

  const handleSubscribe = (planId: string) => {
    // Modalidad asincrónica va directo a cursos online
    if (planId === 'asincronica') {
      router.push('/cursos-online');
      return;
    }

    // Mapear planId a TipoInscripcion2026 y abrir modal
    let tipoInscripcion: TipoInscripcion2026;

    switch (planId) {
      case 'colonia':
        tipoInscripcion = TipoInscripcion2026.COLONIA;
        break;
      case 'ciclo2026':
        tipoInscripcion = TipoInscripcion2026.CICLO_2026;
        break;
      case 'pack-completo':
        tipoInscripcion = TipoInscripcion2026.PACK_COMPLETO;
        break;
      default:
        // Fallback a página de registro antigua
        router.push('/register');
        return;
    }

    setSelectedPlan(tipoInscripcion);
    setShowModal(true);
  };

  return (
    <>
      {/* Grid de 2 cards pequeñas arriba */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[900px] mx-auto mb-6">
        {PRICING_PLANS.filter(p => p.id !== 'pack-completo').map((plan) => (
          <div
            key={plan.id}
            className="compact-card"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-black text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-400">{plan.description}</p>
              </div>
            </div>

            {/* Pricing structure */}
            {plan.id === 'colonia' && (
              <div className="mb-3">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-black text-white">
                    $25.000
                  </span>
                  <span className="text-gray-500 text-sm">inscripción</span>
                </div>
                <p className="text-sm text-gray-400">Luego $55.000/mes (3 meses)</p>
              </div>
            )}
            {plan.id === 'ciclo2026' && (
              <div className="mb-3">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-black text-white">
                    $50.000
                  </span>
                  <span className="text-gray-500 text-sm">matrícula EARLY BIRD</span>
                </div>
                <p className="text-sm text-gray-400">Luego $60.000/mes</p>
              </div>
            )}

            <ul className="space-y-1.5 mb-4">
              {plan.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="text-xs text-gray-300 flex items-start gap-2">
                  <span className="text-[#10b981] mt-0.5">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.id)}
              className="compact-button"
            >
              Inscribirme
            </button>
          </div>
        ))}
      </div>

      {/* Pack Completo destacado - Card grande */}
      {PRICING_PLANS.filter(p => p.id === 'pack-completo').map((plan) => (
        <div
          key={plan.id}
          className="featured-card"
        >
          <div className="featured-badge">
            🔥 MEJOR OFERTA
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-3xl font-black text-white mb-2">{plan.name}</h3>
              <p className="text-gray-300 mb-4">{plan.description}</p>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black bg-gradient-to-r from-[#fbbf24] to-[#f97316] bg-clip-text text-transparent">
                  $60.000
                </span>
                <span className="text-gray-400">inscripción total</span>
              </div>
              <p className="text-sm text-[#10b981] font-bold mb-3">💰 Ahorrás $15.000 en matrícula</p>

              <div className="bg-white/5 rounded-lg p-3 mb-6 border border-white/10">
                <p className="text-xs text-gray-400 mb-2">Cuotas mensuales:</p>
                <p className="text-sm text-white font-bold">📅 Enero-Febrero: $55.000/mes</p>
                <p className="text-xs text-gray-400 mb-1">(Durante la Colonia)</p>
                <p className="text-sm text-white font-bold mt-2">📅 Marzo en adelante: $60.000/mes</p>
                <p className="text-xs text-gray-400">(Durante el Ciclo 2026)</p>
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                className="featured-button"
              >
                Inscribirme al Pack Completo →
              </button>
            </div>

            <div>
              <ul className="space-y-2">
                {plan.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="text-sm text-gray-200 flex items-start gap-2">
                    <span className="text-[#fbbf24] mt-0.5 font-bold">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}

      {/* Modalidad Asincrónica - Card compacta */}
      <div className="mt-8 max-w-[900px] mx-auto">
        <div className="async-card">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Modalidad Asincrónica</div>
              <h3 className="text-2xl font-black text-white mb-1">📚 EXPLORADOR</h3>
              <p className="text-sm text-gray-400 mb-3">
                Para que aprendan a su ritmo, cuando quieran. Sin clases en vivo.
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-black text-[#0ea5e9]">$30.000</span>
                <span className="text-gray-500 text-sm">/mes</span>
              </div>
              <p className="text-xs text-[#10b981]">✨ Sin inscripción</p>
            </div>

            <button
              onClick={() => handleSubscribe('asincronica')}
              className="async-button"
            >
              Ver Cursos Online →
            </button>
          </div>
        </div>
      </div>

      {/* Modal Global de Inscripciones 2026 */}
      {showModal && selectedPlan && (
        <GlobalInscriptionModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedPlan(null);
          }}
          tipoInscripcion={selectedPlan}
        />
      )}


      <style jsx>{`
        /* Compact Card - Cards pequeñas arriba */
        .compact-card {
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .compact-card:hover {
          border-color: rgba(14, 165, 233, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(14, 165, 233, 0.15);
        }

        .compact-button {
          width: 100%;
          padding: 10px 16px;
          background: rgba(14, 165, 233, 0.1);
          border: 1px solid rgba(14, 165, 233, 0.3);
          border-radius: 8px;
          color: #0ea5e9;
          font-weight: 700;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .compact-button:hover {
          background: rgba(14, 165, 233, 0.2);
          border-color: rgba(14, 165, 233, 0.5);
          transform: translateY(-1px);
        }

        /* Featured Card - Pack Completo */
        .featured-card {
          background: linear-gradient(145deg, rgba(139, 92, 246, 0.1), rgba(251, 191, 36, 0.05));
          backdrop-filter: blur(20px);
          border: 2px solid rgba(251, 191, 36, 0.3);
          border-radius: 20px;
          padding: 32px;
          max-width: 900px;
          margin: 0 auto;
          position: relative;
          box-shadow: 0 20px 60px rgba(251, 191, 36, 0.2);
          transition: all 0.3s ease;
        }

        .featured-card:hover {
          border-color: rgba(251, 191, 36, 0.5);
          box-shadow: 0 24px 72px rgba(251, 191, 36, 0.3);
        }

        .featured-badge {
          position: absolute;
          top: -12px;
          left: 32px;
          background: linear-gradient(135deg, #FF6B35, #fbbf24);
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
        }

        .featured-button {
          padding: 14px 32px;
          background: linear-gradient(135deg, #fbbf24, #f97316);
          border: none;
          border-radius: 12px;
          color: #000;
          font-weight: 900;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(251, 191, 36, 0.3);
        }

        .featured-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(251, 191, 36, 0.4);
        }

        /* Async Card - Modalidad asincrónica */
        .async-card {
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.6), rgba(30, 41, 59, 0.4));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
        }

        .async-card:hover {
          border-color: rgba(14, 165, 233, 0.3);
        }

        .async-button {
          padding: 12px 24px;
          background: transparent;
          border: 1px solid rgba(14, 165, 233, 0.3);
          border-radius: 8px;
          color: #0ea5e9;
          font-weight: 700;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .async-button:hover {
          background: rgba(14, 165, 233, 0.1);
          border-color: rgba(14, 165, 233, 0.5);
        }

        /* OLD STYLES - KEEP FOR BACKWARDS COMPAT BUT NOT USED */
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
