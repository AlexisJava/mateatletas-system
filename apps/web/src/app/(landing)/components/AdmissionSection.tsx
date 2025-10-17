'use client';

import { motion } from 'framer-motion';
import { admissionTitle, admissionSubtitle, admissionSteps } from '../data/landing-data';

export function AdmissionSection() {
  return (
    <section className="relative py-24 px-6 lg:px-8 border-t border-white/[0.03]">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            {admissionTitle}
          </h2>
          <p className="text-lg text-white/50">
            {admissionSubtitle}
          </p>
        </div>

        <div className="space-y-8">
          {admissionSteps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex gap-6 items-start"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-400 font-bold">{item.step}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-white/50 leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
