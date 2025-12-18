'use client';

interface ClaseBloqueadaProps {
  numeroClase: number;
  tituloClase?: string;
}

export default function ClaseBloqueada({ numeroClase, tituloClase }: ClaseBloqueadaProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-600 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-80 h-80 bg-orange-500 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="relative max-w-2xl w-full">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl blur-2xl opacity-30 animate-pulse" />

        {/* Card principal */}
        <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl shadow-2xl border-2 border-red-500/30 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 p-8 text-center">
            <div className="text-7xl mb-4 animate-bounce" style={{ animationDuration: '2s' }}>
              🔒
            </div>
            <h1 className="text-4xl font-black text-white mb-2">Clase Bloqueada</h1>
            <p className="text-white/90 text-lg">
              Clase {numeroClase}
              {tituloClase ? ` · ${tituloClase}` : ''}
            </p>
          </div>

          {/* Contenido */}
          <div className="p-8 space-y-6">
            <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-6">
              <p className="text-slate-200 text-lg text-center leading-relaxed">
                Esta clase aún no está disponible para vos. Tu profesor habilitará el acceso cuando
                sea el momento indicado.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <span className="text-3xl">📅</span>
                <div>
                  <h3 className="text-white font-bold mb-1">Esperá la habilitación</h3>
                  <p className="text-slate-400 text-sm">
                    Tu profesor habilitará esta clase cuando llegue el momento de comenzar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <span className="text-3xl">🔔</span>
                <div>
                  <h3 className="text-white font-bold mb-1">Te avisaremos</h3>
                  <p className="text-slate-400 text-sm">
                    Cuando la clase esté disponible, podrás acceder sin problemas.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <span className="text-3xl">💬</span>
                <div>
                  <h3 className="text-white font-bold mb-1">¿Tenés dudas?</h3>
                  <p className="text-slate-400 text-sm">
                    Consultale a tu profesor si creés que deberías tener acceso.
                  </p>
                </div>
              </div>
            </div>

            {/* Botón volver */}
            <div className="pt-4">
              <a
                href="/roblox"
                className="block w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl text-center transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/50"
              >
                ← Volver al Mapa de Clases
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
