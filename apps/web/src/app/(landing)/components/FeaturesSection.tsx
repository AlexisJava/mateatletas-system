'use client';

import { CheckCircle2 } from 'lucide-react';
import { FloatingCard } from '@/components/ui/FloatingCard';
import { featuresTitle, featuresSubtitle, features } from '../data/landing-data';

export function FeaturesSection() {
  return (
    <section className="relative py-24 px-6 lg:px-8 border-t border-white/[0.03]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            {featuresTitle}
          </h2>
          <p className="text-lg text-white/50 max-w-2xl">
            {featuresSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FloatingCard key={index} delay={index * 0.1}>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <p className="text-lg font-semibold mb-2">{feature.title}</p>
                    <p className="text-white/50 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </FloatingCard>
          ))}
        </div>
      </div>
    </section>
  );
}
