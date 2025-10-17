'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { CodeTerminal } from './CodeTerminal';
import {
  heroHeadline,
  heroHeadlineHighlight,
  heroSubheadline,
  heroCTA,
  heroStats,
  heroFloatingCards,
} from '../data/landing-data';

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div className="relative z-10">
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]"
            >
              {heroHeadline}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400">
                {heroHeadlineHighlight}
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-xl text-white/60 mb-12 leading-relaxed"
            >
              {heroSubheadline}
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mb-12"
            >
              <MagneticButton
                href="/admision"
                className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-base font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all inline-flex items-center gap-2 shadow-xl shadow-orange-500/30"
              >
                {heroCTA}
                <ArrowRight
                  className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2.5}
                />
              </MagneticButton>
            </motion.div>

            {/* Info Cards - Grid pequeño */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 gap-4"
            >
              {heroStats.map((stat, index) => (
                <div
                  key={index}
                  className="border border-emerald-500/10 rounded-xl bg-emerald-500/[0.02] p-4 backdrop-blur-xl"
                >
                  <div className="text-2xl font-bold text-emerald-400 mb-1">{stat.value}</div>
                  <div className="text-xs text-white/50">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Terminal + Floating Cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative lg:pl-8"
          >
            {/* Terminal principal */}
            <CodeTerminal />

            {/* Floating Cards - Solo 2, más grandes y rotadas */}
            {heroFloatingCards.map((card, index) => {
              const isFirst = index === 0;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                  animate={{ opacity: 1, scale: 1, rotate: isFirst ? 6 : -6 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1, type: "spring", stiffness: 100 }}
                  className={`absolute ${isFirst ? '-bottom-6 -right-6' : '-bottom-6 -left-6'} bg-gradient-to-br from-emerald-500/15 to-teal-500/10 backdrop-blur-2xl border border-emerald-500/40 rounded-2xl p-5 shadow-2xl shadow-emerald-500/30 hover:scale-105 hover:rotate-3 transition-all`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/25 flex items-center justify-center">
                      <card.icon className="w-5 h-5 text-emerald-300" strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white mb-0.5">{card.title}</div>
                      <div className="text-xs text-white/50">{card.subtitle}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] opacity-25 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[150px] opacity-20 pointer-events-none" />
    </section>
  );
}
