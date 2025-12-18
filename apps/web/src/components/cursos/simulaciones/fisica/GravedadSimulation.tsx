'use client';

import { useEffect, useState } from 'react';

/**
 * Simulación B1: Laboratorio de Gravedad
 * Muestra dos objetos (pelota pesada y pluma) cayendo
 * Demuestra que la gravedad afecta a todos los objetos por igual (en el vacío)
 */
export default function GravedadSimulation() {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(false);
      setTimeout(() => setIsAnimating(true), 100);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[400px] bg-gradient-to-b from-sky-900 via-sky-800 to-slate-900 rounded-xl overflow-hidden relative border-4 border-sky-600 shadow-2xl">
      {/* Título */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/60 backdrop-blur-sm px-6 py-2 rounded-full border-2 border-yellow-400">
          <p className="text-yellow-400 font-bold text-lg">🌍 Laboratorio de Gravedad</p>
        </div>
      </div>

      {/* Estrellas de fondo */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      {/* Torre/Plataforma de lanzamiento */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-gradient-to-t from-slate-700 to-slate-600 rounded-t-lg border-2 border-slate-500" />

      {/* Objeto 1: Pelota pesada (izquierda) */}
      <div className="absolute left-[25%] top-[80px]">
        <div
          className={`relative transition-all duration-1000 ${
            isAnimating ? 'translate-y-[220px]' : 'translate-y-0'
          } ease-in`}
        >
          {/* Pelota de bowling */}
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-900 via-purple-700 to-purple-900 rounded-full border-4 border-purple-500 shadow-2xl flex items-center justify-center">
              <div className="text-3xl">🎳</div>
            </div>
            {/* Etiqueta */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <p className="text-white font-bold text-sm bg-black/70 px-2 py-1 rounded">5 kg</p>
            </div>
          </div>

          {/* Líneas de movimiento */}
          {isAnimating && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-screen">
              <div className="w-full h-20 bg-gradient-to-b from-purple-400/0 via-purple-400/50 to-purple-400/0 animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* Objeto 2: Pluma (derecha) */}
      <div className="absolute right-[25%] top-[80px]">
        <div
          className={`relative transition-all duration-1000 ${
            isAnimating ? 'translate-y-[220px]' : 'translate-y-0'
          } ease-in`}
        >
          {/* Pluma */}
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-200 via-cyan-100 to-white rounded-full border-4 border-cyan-300 shadow-2xl flex items-center justify-center">
              <div className="text-3xl">🪶</div>
            </div>
            {/* Etiqueta */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <p className="text-white font-bold text-sm bg-black/70 px-2 py-1 rounded">0.01 kg</p>
            </div>
          </div>

          {/* Líneas de movimiento */}
          {isAnimating && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-screen">
              <div className="w-full h-20 bg-gradient-to-b from-cyan-400/0 via-cyan-400/50 to-cyan-400/0 animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* Indicador de suelo con impacto */}
      <div className="absolute bottom-10 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent">
        {isAnimating && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-yellow-400/30 rounded-full blur-xl animate-ping" />
        )}
      </div>

      {/* Texto explicativo */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%]">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-yellow-400/50">
          <p className="text-yellow-200 text-center text-sm font-semibold">
            ⚡ En el vacío, ¡todos caen a la misma velocidad! La gravedad no discrimina.
          </p>
        </div>
      </div>

      {/* Flechas de gravedad */}
      <div className="absolute left-[25%] top-[60px] text-red-400 text-2xl animate-bounce">↓</div>
      <div
        className="absolute right-[25%] top-[60px] text-red-400 text-2xl animate-bounce"
        style={{ animationDelay: '0.1s' }}
      >
        ↓
      </div>
    </div>
  );
}
