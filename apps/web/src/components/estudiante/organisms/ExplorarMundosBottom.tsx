'use client';

import { Calculator, Code, FlaskConical, Crown, ArrowRight } from 'lucide-react';

/**
 * ExplorarMundosBottom - Bottom section de la card Explorar Mundos
 *
 * Extraído de portal_estudiante.pen (sqHKU):
 * - 4 mini world icons (40x40, cornerRadius 12) + arrow button (44x44)
 * - gap: 10
 *
 * Mini icons:
 * - Math: calculator, #A78BFA, bg #7C3AED25, border #A78BFA40
 * - Code: code, #34D399, bg #10B98125, border #34D39940
 * - Science: flask-conical, #FB923C, bg #FB923C25, border #FB923C40
 * - Olympics: crown, #FFD700, bg #FFD70025, border #FFD70040
 *
 * Arrow button:
 * - 44x44, cornerRadius 22
 * - fill: linear-gradient(135deg, #A78BFA → #7C3AED)
 * - shadow: blur 12 #A78BFA50
 * - arrow-right icon 22x22 white
 */

const MINI_WORLDS = [
  { icon: Calculator, color: '#A78BFA', bg: '#7C3AED25', border: '#A78BFA40' },
  { icon: Code, color: '#34D399', bg: '#10B98125', border: '#34D39940' },
  { icon: FlaskConical, color: '#FB923C', bg: '#FB923C25', border: '#FB923C40' },
  { icon: Crown, color: '#FFD700', bg: '#FFD70025', border: '#FFD70040' },
] as const;

export function ExplorarMundosBottom(): React.JSX.Element {
  return (
    <div className="flex items-center gap-2.5">
      {MINI_WORLDS.map((world) => {
        const Icon = world.icon;
        return (
          <div
            key={world.color}
            className="flex items-center justify-center"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: world.bg,
              border: `1px solid ${world.border}`,
            }}
          >
            <Icon size={20} style={{ color: world.color }} />
          </div>
        );
      })}

      {/* Arrow button */}
      <div
        className="flex items-center justify-center"
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          background: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
          boxShadow: '0 0 12px rgba(167,139,250,0.31)',
        }}
      >
        <ArrowRight size={22} color="#FFFFFF" />
      </div>
    </div>
  );
}
