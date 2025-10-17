'use client';

import { FloatingCard } from '@/components/ui/FloatingCard';
import { benefitsTitle, benefitsSubtitle, benefits } from '../data/landing-data';

export function BenefitsSection() {
  return (
    <section className="relative py-24 px-6 lg:px-8 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 max-w-2xl">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            {benefitsTitle}
          </h2>
          <p className="text-lg text-white/50">
            {benefitsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <FloatingCard key={index} delay={index * 0.1}>
              <div className="border border-white/[0.06] rounded-xl bg-gradient-to-br from-emerald-500/[0.03] to-transparent p-8 h-full hover:border-emerald-500/20 transition-all">
                <benefit.icon className="w-10 h-10 text-emerald-400 mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-white/50 leading-relaxed">{benefit.description}</p>
              </div>
            </FloatingCard>
          ))}
        </div>
      </div>
    </section>
  );
}
