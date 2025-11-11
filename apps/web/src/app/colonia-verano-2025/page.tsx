'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import HeroSection from '@/components/colonia/HeroSection';
import InfoSection from '@/components/colonia/InfoSection';
import CourseCatalog from '@/components/colonia/CourseCatalog';
import HowToEnrollSection from '@/components/colonia/HowToEnrollSection';
import PricingSection from '@/components/colonia/PricingSection';
import CTASection from '@/components/colonia/CTASection';
import Footer from '@/components/colonia/Footer';
import ScrollToTop from '@/components/colonia/ScrollToTop';

// Lazy load del formulario (solo se carga cuando el usuario hace click en "Inscribir")
const InscriptionForm = dynamic(
  () => import('@/components/colonia/InscriptionForm'),
  {
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="text-white text-xl font-bold animate-pulse">Cargando...</div>
      </div>
    ),
    ssr: false, // No renderizar en el servidor (solo cliente)
  }
);

// Lazy load de secciones "below the fold" (no visibles al cargar)
const ScheduleGridLazy = dynamic(() => import('@/components/colonia/ScheduleGrid'), { ssr: true });
const BenefitsSectionLazy = dynamic(() => import('@/components/colonia/BenefitsSection'), { ssr: true });
const FAQSectionLazy = dynamic(() => import('@/components/colonia/FAQSection'), { ssr: true });

/**
 * Landing Page - Colonia de Verano 2026
 *
 * Estructura:
 * 1. Hero - Impacto inicial con fechas y CTA
 * 2. Info - ¿Qué es la colonia?
 * 3. Catálogo - 11 cursos con filtros
 * 4. Horarios - Grilla interactiva
 * 5. Cómo Inscribirse - Guía paso a paso
 * 6. Beneficios - Por qué Mateatletas
 * 7. Precios - Planes y descuentos
 * 8. FAQ - Preguntas frecuentes
 * 9. CTA Final - Urgencia y conversión
 * 10. Footer - Información y enlaces
 * + Scroll to Top - Navegación rápida
 */
export default function ColoniaVerano2025Page() {
  const [showInscriptionForm, setShowInscriptionForm] = useState(false);

  const handleOpenInscription = () => {
    setShowInscriptionForm(true);
  };

  const handleCloseInscription = () => {
    setShowInscriptionForm(false);
  };

  return (
    <main className="relative bg-black">
      {/* 1. HERO SECTION - Impacto inicial */}
      <HeroSection onInscribe={handleOpenInscription} />

      {/* 2. INFO SECTION - ¿Qué es la colonia? */}
      <InfoSection />

      {/* 3. COURSE CATALOG - 11 cursos con filtros */}
      <CourseCatalog onInscribe={handleOpenInscription} />

      {/* 4. SCHEDULE GRID - Grilla horaria interactiva (lazy) */}
      <ScheduleGridLazy />

      {/* 5. HOW TO ENROLL - Guía paso a paso */}
      <HowToEnrollSection onInscribe={handleOpenInscription} />

      {/* 6. BENEFITS - Por qué elegirnos (lazy) */}
      <BenefitsSectionLazy />

      {/* 7. PRICING - Planes transparentes */}
      <PricingSection onInscribe={handleOpenInscription} />

      {/* 8. FAQ - Preguntas frecuentes (lazy) */}
      <FAQSectionLazy />

      {/* 9. CTA FINAL - Conversión con urgencia */}
      <CTASection onInscribe={handleOpenInscription} />

      {/* 10. FOOTER - Información y enlaces */}
      <Footer />

      {/* SCROLL TO TOP - Navegación rápida */}
      <ScrollToTop />

      {/* INSCRIPTION FORM MODAL - Global */}
      {showInscriptionForm && (
        <InscriptionForm onClose={handleCloseInscription} />
      )}
    </main>
  );
}
