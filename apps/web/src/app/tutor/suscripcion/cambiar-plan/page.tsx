'use client';

/**
 * @deprecated Esta página ya no se usa en el MODELO 2026.
 *
 * En el modelo anterior, existía un único tier para toda la familia.
 * Ahora, cada inscripción puede tener su propio tier.
 *
 * Para cambiar el tier de una inscripción específica, el tutor puede:
 * 1. Ir al Dashboard de Suscripción
 * 2. Expandir el estudiante
 * 3. Hacer click en el tier de la inscripción
 *
 * Esta página redirige al dashboard de suscripción.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Info } from 'lucide-react';

export default function CambiarPlanPage(): React.ReactElement {
  const router = useRouter();

  useEffect(() => {
    // Redirigir después de mostrar el mensaje brevemente
    const timer = setTimeout(() => {
      router.replace('/tutor/suscripcion');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
        <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Info className="w-8 h-8 text-cyan-400" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">¡Nueva forma de cambiar planes!</h2>

        <p className="text-slate-400 mb-6">
          Ahora podés elegir un plan diferente para cada actividad. Vas a poder cambiar el plan de
          cada inscripción desde el dashboard de tu suscripción.
        </p>

        <div className="flex items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Redirigiendo...</span>
        </div>

        <button
          onClick={() => router.push('/tutor/suscripcion')}
          className="mt-6 w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-colors"
        >
          Ir ahora
        </button>
      </div>
    </div>
  );
}
