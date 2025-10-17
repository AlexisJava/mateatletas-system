'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { navigationItems } from '../data/landing-data';

export function Navigation() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/[0.03] bg-black/50 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20"
              >
                <Terminal className="w-4 h-4 text-white" strokeWidth={2.5} />
              </motion.div>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">Mateatletas</h1>
              <p className="text-[9px] text-emerald-400/40 font-medium uppercase tracking-wider">
                Entrenamiento Mental
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-white/50 hover:text-emerald-400 transition-colors font-medium"
              >
                {item.label}
              </a>
            ))}
            <MagneticButton
              href="/login"
              className="px-5 py-2 text-emerald-400 text-sm font-semibold rounded-lg hover:bg-emerald-500/10 transition-all border border-emerald-500/20 hover:border-emerald-400/40"
            >
              Iniciar Sesión
            </MagneticButton>
            <MagneticButton
              href="/admision"
              className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25"
            >
              Solicitar Información
            </MagneticButton>
          </div>
        </div>
      </div>
    </nav>
  );
}
