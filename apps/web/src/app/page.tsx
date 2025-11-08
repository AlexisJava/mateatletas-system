import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import NumbersSection from '@/components/landing/NumbersSection';
import VideoSection from '@/components/landing/VideoSection';
import MundosSection from '@/components/landing/MundosSection';
import GamificationSection from '@/components/landing/GamificationSection';
import GallerySection from '@/components/landing/GallerySection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import ComparisonSection from '@/components/landing/ComparisonSection';
import PricingSection from '@/components/landing/PricingSection';
import FAQSection from '@/components/landing/FAQSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import SectionDivider from '@/components/landing/SectionDivider';

/**
 * Landing page completa de Mateatletas
 *
 * 12 secciones diseñadas con:
 * - TypeScript STRICT (sin any, unknown, @ts-ignore)
 * - Nunito font (400-900 weights)
 * - Dark mode support
 * - Glassmorphism effects
 * - Responsive design (mobile-first)
 * - Color palette: #0ea5e9, #FF6B35, #fbbf24, #10b981, #8b5cf6
 */
export default function HomePage() {
  return (
    <div className="landing-background">
      {/* Animated Orbs */}
      <div className="orb-1" />
      <div className="orb-2" />

      <main className="min-h-screen">
        <Navbar />
        <Hero />
        <SectionDivider color="blue" />
        <NumbersSection />
        <SectionDivider color="yellow" />
        <VideoSection />
        <SectionDivider color="blue" />
        <MundosSection />
        <SectionDivider color="purple" />
        <GamificationSection />
        <SectionDivider color="green" />
        <GallerySection />
        <SectionDivider color="yellow" />
        <TestimonialsSection />
        <SectionDivider color="purple" />
        <ComparisonSection />
        <SectionDivider color="green" />
        <PricingSection />
        <SectionDivider color="orange" />
        <FAQSection />
        <SectionDivider color="blue" />
        <CTASection />
        <Footer />
      </main>
    </div>
  );
}
