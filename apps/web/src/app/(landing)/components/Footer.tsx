'use client';

import { Terminal } from 'lucide-react';
import { footerLinks, footerCopyright } from '../data/landing-data';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.03] py-12 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-sm font-bold">Mateatletas</h1>
              <p className="text-[9px] text-emerald-400/40 font-medium uppercase">
                Entrenamiento Mental
              </p>
            </div>
          </div>
          <div className="flex items-center gap-8 text-sm text-white/40">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-emerald-400 transition-colors"
              >
                {link.text || link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/[0.03] text-center text-sm text-white/30">
          <p>{footerCopyright}</p>
        </div>
      </div>
    </footer>
  );
}
