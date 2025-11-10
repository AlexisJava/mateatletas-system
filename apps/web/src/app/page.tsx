import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Ticker365Section from '@/components/landing/Ticker365Section';
import NumbersSection from '@/components/landing/NumbersSection';
import GamificationSection from '@/components/landing/GamificationSection';
import MundosSection from '@/components/landing/MundosSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import ComparisonSection from '@/components/landing/ComparisonSection';
import PaymentLogicSection from '@/components/landing/PaymentLogicSection';
import PricingSection from '@/components/landing/PricingSection';
import FAQSection from '@/components/landing/FAQSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import ScrollToTop from '@/components/landing/ScrollToTop';

// Contextual Dividers
import HeroToNumbers from '@/components/dividers/HeroToNumbers';
import NumbersToGamification from '@/components/dividers/NumbersToGamification';
import GamificationToMundos from '@/components/dividers/GamificationToMundos';
import MundosToTestimonials from '@/components/dividers/MundosToTestimonials';
import TestimonialsToComparison from '@/components/dividers/TestimonialsToComparison';
import ComparisonToPricing from '@/components/dividers/ComparisonToPricing';
import PricingToFAQ from '@/components/dividers/PricingToFAQ';
import FAQToCTA from '@/components/dividers/FAQToCTA';
import CTAToFooter from '@/components/dividers/CTAToFooter';

/**
 * Landing page completa de Mateatletas
 *
 * 13 secciones + 9 separadores contextuales diseñados con:
 * - TypeScript STRICT (sin any, unknown, @ts-ignore)
 * - Nunito font (400-900 weights)
 * - Dark mode support
 * - Glassmorphism effects
 * - Responsive design (mobile-first)
 * - Separadores contextuales con animaciones épicas
 * - Color palette: #0ea5e9, #FF6B35, #fbbf24, #10b981, #8b5cf6
 */
export default function HomePage() {
  return (
    <div>
      <main className="min-h-screen">
        <Navbar />
        <Hero />
        <Ticker365Section />
        <HeroToNumbers />
        <NumbersSection />
        <NumbersToGamification />
        <GamificationSection />
        <GamificationToMundos />
        <MundosSection />
        <MundosToTestimonials />
        <TestimonialsSection />
        <TestimonialsToComparison />
        <ComparisonSection />
        <PaymentLogicSection />
        <ComparisonToPricing />
        <PricingSection />
        <PricingToFAQ />
        <FAQSection />
        <FAQToCTA />
        <CTASection />
        <CTAToFooter />
        <Footer />
      </main>

      <ScrollToTop />
    </div>
  );
}
