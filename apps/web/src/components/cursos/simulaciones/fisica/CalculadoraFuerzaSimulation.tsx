'use client';

import { useEffect, useState } from 'react';

/**
 * Simulación B3: Calculadora Interactiva F = m × a
 * Calcula fuerzas para diferentes masas y aceleraciones
 * Muestra comparaciones con objetos conocidos
 */
export default function CalculadoraFuerzaSimulation() {
  const [mass, setMass] = useState(15);
  const [acceleration, setAcceleration] = useState(2);
  const [animating, setAnimating] = useState(false);

  const force = mass * acceleration;

  // Comparaciones con fuerzas conocidas
  const getComparison = (f: number) => {
    if (f < 10)
      return { text: 'Empujar un libro sobre la mesa', emoji: '📚', color: 'text-green-400' };
    if (f < 50) return { text: 'Pedalear una bicicleta', emoji: '🚲', color: 'text-blue-400' };
    if (f < 200)
      return { text: 'Empujar un carrito de supermercado', emoji: '🛒', color: 'text-cyan-400' };
    if (f < 1000)
      return { text: 'Fuerza de un auto acelerando', emoji: '🚗', color: 'text-yellow-400' };
    if (f < 5000) return { text: 'Motor de un camión', emoji: '🚚', color: 'text-orange-400' };
    return { text: 'Motores de un cohete espacial', emoji: '🚀', color: 'text-red-400' };
  };

  const comparison = getComparison(force);

  // Auto-cambiar valores periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setMass((m) => {
          if (m === 15) return 100;
          if (m === 100) return 1000;
          return 15;
        });
        setAcceleration((a) => {
          if (a === 2) return 5;
          if (a === 5) return 10;
          return 2;
        });
        setAnimating(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Calcular vector de fuerza visual
  const forceVectorLength = Math.min(force * 0.15, 200);

  return (
    <div className="w-full h-[400px] bg-gradient-to-b from-slate-900 via-indigo-950 to-violet-950 rounded-xl overflow-hidden relative border-4 border-violet-600 shadow-2xl">
      {/* Título */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/60 backdrop-blur-sm px-6 py-2 rounded-full border-2 border-yellow-400">
          <p className="text-yellow-400 font-bold text-lg">🧮 Calculadora F = m × a</p>
        </div>
      </div>

      {/* Grid de fondo */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 25px, rgba(255,255,255,0.2) 25px, rgba(255,255,255,0.2) 26px),
            repeating-linear-gradient(90deg, transparent, transparent 25px, rgba(255,255,255,0.2) 25px, rgba(255,255,255,0.2) 26px)
          `,
          }}
        />
      </div>

      {/* Fórmula principal */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2">
        <div
          className={`bg-gradient-to-br from-purple-900 to-purple-700 backdrop-blur-sm px-8 py-6 rounded-2xl border-4 border-purple-400 shadow-2xl transition-all duration-300 ${animating ? 'scale-110' : 'scale-100'}`}
        >
          <p className="text-white font-bold text-4xl text-center mb-4">F = m × a</p>
          <div className="text-yellow-300 text-xl text-center space-y-2">
            <p>
              <span className="text-cyan-400">{force.toFixed(1)}</span> N ={' '}
              <span className="text-blue-400">{mass}</span> kg ×{' '}
              <span className="text-green-400">{acceleration}</span> m/s²
            </p>
          </div>
        </div>
      </div>

      {/* Controles de entrada */}
      <div className="absolute top-48 left-8 space-y-4 w-72">
        {/* Control de masa */}
        <div className="bg-black/80 backdrop-blur-sm px-6 py-4 rounded-xl border-2 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-400 font-bold text-lg">📦 Masa (m)</p>
            <p className="text-white font-bold text-xl">{mass} kg</p>
          </div>
          <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 relative"
              style={{ width: `${(Math.log10(mass) / Math.log10(1000)) * 100}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse" />
            </div>
          </div>
          <div className="flex justify-between text-white/50 text-xs mt-1">
            <span>1 kg</span>
            <span>1000 kg</span>
          </div>
        </div>

        {/* Control de aceleración */}
        <div className="bg-black/80 backdrop-blur-sm px-6 py-4 rounded-xl border-2 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-400 font-bold text-lg">⚡ Aceleración (a)</p>
            <p className="text-white font-bold text-xl">{acceleration} m/s²</p>
          </div>
          <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 relative"
              style={{ width: `${(acceleration / 10) * 100}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse" />
            </div>
          </div>
          <div className="flex justify-between text-white/50 text-xs mt-1">
            <span>0 m/s²</span>
            <span>10 m/s²</span>
          </div>
        </div>

        {/* Resultado de fuerza */}
        <div className="bg-gradient-to-br from-red-900 to-red-700 backdrop-blur-sm px-6 py-4 rounded-xl border-4 border-red-500 shadow-2xl">
          <div className="flex items-center justify-between">
            <p className="text-red-200 font-bold text-lg">🔥 Fuerza (F)</p>
            <p className="text-white font-bold text-3xl">{force.toFixed(1)} N</p>
          </div>
          <div className="w-full h-4 bg-slate-900 rounded-full mt-3 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 transition-all duration-500 relative"
              style={{ width: `${Math.min((force / 10000) * 100, 100)}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Comparación visual */}
      <div className="absolute top-48 right-8 w-80">
        <div className="bg-black/80 backdrop-blur-sm px-6 py-6 rounded-xl border-2 border-purple-500">
          <p className="text-purple-300 font-bold text-sm mb-4 text-center">
            📊 Comparación con objetos reales:
          </p>

          <div className={`${comparison.color} text-center mb-4 transition-all duration-500`}>
            <div className="text-6xl mb-2 animate-bounce">{comparison.emoji}</div>
            <p className="font-bold text-lg">{comparison.text}</p>
          </div>

          {/* Escala de referencia */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-16 h-1 bg-green-500 rounded" />
              <span className="text-white/70">{'< 50 N: Fuerza humana ligera'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1 bg-yellow-500 rounded" />
              <span className="text-white/70">{'< 1000 N: Vehículos pequeños'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-1 bg-orange-500 rounded" />
              <span className="text-white/70">{'< 5000 N: Maquinaria pesada'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-40 h-1 bg-red-500 rounded" />
              <span className="text-white/70">{'>5000 N: Cohetes y naves'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visualización de vectores */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
        <div className="relative">
          {/* Objeto */}
          <div
            className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-cyan-600 border-4 border-cyan-300 shadow-2xl flex items-center justify-center font-bold text-white rounded-xl relative transition-all duration-500"
            style={{
              transform: `translateX(${(force / 100) * 10}px)`,
            }}
          >
            <div className="text-center">
              <p className="text-3xl">📦</p>
              <p className="text-sm">{mass}kg</p>
            </div>

            {/* Sombra */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black/40 rounded-full blur-xl" />
          </div>

          {/* Vector de fuerza */}
          <div className="absolute -top-12 left-12 flex items-center gap-2">
            <div className="text-red-500 font-bold text-lg">F⃗</div>
            <div
              className="h-4 bg-gradient-to-r from-red-500 to-red-600 relative transition-all duration-500"
              style={{
                width: `${forceVectorLength}px`,
              }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-l-16 border-transparent border-l-red-600" />

              {/* Etiqueta del vector */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded whitespace-nowrap">
                <p className="text-white text-xs font-bold">{force.toFixed(1)} N</p>
              </div>
            </div>
          </div>

          {/* Vector de aceleración */}
          <div className="absolute -top-20 left-12 flex items-center gap-2">
            <div className="text-green-400 font-bold text-lg">a⃗</div>
            <div
              className="h-3 bg-gradient-to-r from-green-400 to-green-500 relative transition-all duration-500"
              style={{
                width: `${acceleration * 15}px`,
              }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-6 border-b-6 border-l-12 border-transparent border-l-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Suelo */}
      <div className="absolute bottom-20 left-0 right-0 h-2 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 border-t-2 border-slate-500" />

      {/* Casos de ejemplo */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[95%]">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-yellow-400/50">
          <p className="text-yellow-200 text-center text-sm font-semibold">
            {mass === 15 && acceleration === 2
              ? '🚲 Bicicleta (15 kg) acelerando a 2 m/s² = 30 N de fuerza'
              : mass === 100
                ? '🏍️ Moto (100 kg) acelerando a ' +
                  acceleration +
                  ' m/s² = ' +
                  force.toFixed(0) +
                  ' N'
                : '🚀 Cohete (1000 kg) acelerando a ' +
                  acceleration +
                  ' m/s² = ' +
                  force.toFixed(0) +
                  ' N (¡equivalente a 100 personas empujando!)'}
          </p>
        </div>
      </div>
    </div>
  );
}
