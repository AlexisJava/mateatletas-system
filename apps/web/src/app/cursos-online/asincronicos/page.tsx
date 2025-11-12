'use client';

import { useState, useRef } from 'react';
import HeroAsincronicos from '@/components/asincronicos/HeroAsincronicos';
import BeneficiosSection from '@/components/asincronicos/BeneficiosSection';
import CursosGrid from '@/components/asincronicos/CursosGrid';
import QuizCard from '@/components/asincronicos/QuizCard';
import FAQAsincronicos from '@/components/asincronicos/FAQAsincronicos';
import QuizModal from '@/components/quiz/QuizModal';
import ScrollToTop from '@/components/landing/ScrollToTop';
import Footer from '@/components/landing/Footer';

/**
 * Página principal de Cursos Asincrónicos
 *
 * ESTRUCTURA:
 * 1. Hero - Explica qué son los cursos asincrónicos de forma épica
 * 2. Beneficios - Por qué son geniales (flexibilidad, ritmo propio, etc.)
 * 3. Grid de Cursos - Muestra todos los cursos disponibles (EL CONTENIDO PRINCIPAL)
 * 4. Quiz Card - Opción secundaria si no saben cuál elegir
 * 5. FAQs - Responde todas las dudas comunes
 *
 * DESIGN SYSTEM:
 * - Fondo negro con orbs de colores (#0ea5e9, #10b981, #fbbf24, #8b5cf6, #f43f5e)
 * - Glassmorphism en todas las cards
 * - Animaciones con Framer Motion
 * - Tipografía: Nunito (font-black para títulos)
 */
export default function CursosAsincronicosPage() {
  const [quizOpen, setQuizOpen] = useState(false);
  const cursosRef = useRef<HTMLDivElement>(null);

  const handleExplorarCursos = () => {
    cursosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleOpenQuiz = () => {
    setQuizOpen(true);
  };

  const handleCloseQuiz = () => {
    setQuizOpen(false);
  };

  return (
    <main className="relative bg-black">
      {/* 1. HERO - Explica qué son los cursos asincrónicos */}
      <HeroAsincronicos onExplorarCursos={handleExplorarCursos} />

      {/* 2. BENEFICIOS - Por qué asincrónicos son geniales */}
      <BeneficiosSection />

      {/* 3. GRID DE CURSOS - EL CONTENIDO PRINCIPAL */}
      <div ref={cursosRef}>
        <CursosGrid />
      </div>

      {/* 4. QUIZ CARD - Ayuda secundaria */}
      <QuizCard onOpenQuiz={handleOpenQuiz} />

      {/* 5. FAQs - Responde dudas */}
      <FAQAsincronicos />

      {/* MODAL DEL QUIZ */}
      <QuizModal isOpen={quizOpen} onClose={handleCloseQuiz} />

      {/* FOOTER - Terminal style */}
      <Footer />

      {/* SCROLL TO TOP */}
      <ScrollToTop />
    </main>
  );
}
