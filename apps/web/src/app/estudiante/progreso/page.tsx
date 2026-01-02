'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Rocket, Construction } from 'lucide-react';
import FloatingLines from '@/components/ui/FloatingLines';
import { animate } from 'animejs';

export default function ProgresoPage() {
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    requestAnimationFrame(() => {
      // Animar header
      animate('.header-animate', {
        translateY: [-15, 0],
        duration: 500,
        ease: 'outQuad',
      });

      // Animar icono con rebote
      animate('.icon-animate', {
        scale: [0.8, 1],
        translateY: [20, 0],
        duration: 600,
        delay: 100,
        ease: 'outBack',
      });

      // Animar título
      animate('.title-animate', {
        translateY: [20, 0],
        duration: 500,
        delay: 200,
        ease: 'outQuad',
      });

      // Animar descripción
      animate('.desc-animate', {
        translateY: [15, 0],
        duration: 500,
        delay: 300,
        ease: 'outQuad',
      });

      // Animar badge
      animate('.badge-animate', {
        scale: [0.9, 1],
        translateY: [10, 0],
        duration: 500,
        delay: 400,
        ease: 'outBack',
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#030014] text-white relative overflow-hidden">
      {/* Fondo FloatingLines - Verde/Esmeralda para Progreso */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingLines
          linesGradient={['#10b981', '#059669', '#34d399']}
          animationSpeed={0.35}
          interactive={false}
          parallax={false}
        />
      </div>

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link
            href="/estudiante"
            className="header-animate inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>

          {/* Placeholder content */}
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="icon-animate w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
              <Rocket className="w-12 h-12 text-white" />
            </div>

            <h1 className="title-animate text-3xl sm:text-4xl font-black mb-2">Mi Viaje</h1>
            <p className="desc-animate text-slate-400 text-lg mb-8 max-w-md">
              Mira todo lo que has logrado y descubre cuánto has crecido
            </p>

            <div className="badge-animate flex items-center gap-3 px-6 py-4 bg-emerald-900/30 border border-emerald-500/30 rounded-2xl backdrop-blur-sm">
              <Construction className="w-6 h-6 text-emerald-400" />
              <div className="text-left">
                <p className="font-semibold text-emerald-200">Próximamente</p>
                <p className="text-sm text-slate-400">Tus logros y estadísticas te esperan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
