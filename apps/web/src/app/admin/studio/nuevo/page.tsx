'use client';

import { useStudioWizardStore } from '@/store/studio-wizard.store';
import {
  WizardHeader,
  WizardProgress,
  WizardPaso1,
  WizardPaso2,
  WizardPaso3,
  WizardPaso4,
  WizardPaso5,
  WizardPaso6,
} from './components';

/**
 * MATEATLETAS STUDIO - Wizard de creación de cursos
 * Estética: Mission Control Terminal
 * Inspiración: NASA meets Dieter Rams - Industrial, preciso, serio
 */

export default function StudioNuevoPage() {
  const { pasoActual } = useStudioWizardStore();

  return (
    <div className="studio-typography h-screen bg-[#0a0a0a] text-white overflow-hidden flex flex-col relative">
      {/* Technical grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(249,115,22,0.08) 0%, transparent 50%)',
        }}
      />

      {/* Main container */}
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-8 relative z-10">
        <WizardHeader />
        <WizardProgress currentStep={pasoActual} />

        {/* Content area */}
        <div className="flex-1 min-h-0 py-4 flex flex-col">
          {pasoActual === 1 && <WizardPaso1 />}
          {pasoActual === 2 && <WizardPaso2 />}
          {pasoActual === 3 && <WizardPaso3 />}
          {pasoActual === 4 && <WizardPaso4 />}
          {pasoActual === 5 && <WizardPaso5 />}
          {pasoActual === 6 && <WizardPaso6 />}
        </div>

        {/* Footer */}
        <footer className="py-2 flex items-center justify-between text-[10px] text-white/30">
          <span>© 2024 Mateatletas</span>
          <span className="tracking-wide">v0.1.0</span>
        </footer>
      </div>
    </div>
  );
}
