'use client';

import { motion } from 'framer-motion';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { ctaTitle, ctaSubtitle, ctaButton, ctaDisclaimer } from '../data/landing-data';

export function CTASection() {
  return (
    <section className="relative py-32 px-6 lg:px-8 border-t border-white/[0.03]">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            {ctaTitle}
          </h2>
          <p className="text-xl text-white/50 mb-12 max-w-2xl mx-auto">
            {ctaSubtitle}
          </p>
          <MagneticButton
            href="/admision"
            className="px-10 py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-xl shadow-orange-500/30"
          >
            {ctaButton}
          </MagneticButton>
          <p className="text-sm text-white/30 mt-8">
            {ctaDisclaimer}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
