'use client';

import { useEffect, useState } from 'react';

/**
 * Simulación B1: Laboratorio de Fuerzas
 * Muestra una caja siendo empujada con diferentes fuerzas
 * Demuestra F = m × a de forma visual e intuitiva
 */
export default function FuerzasSimulation() {
  const [force, setForce] = useState(50);
  const [position, setPosition] = useState(10);
  const [velocity, setVelocity] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isResetting) return;

      setPosition((prev) => {
        const newPos = prev + velocity * 0.1;
        if (newPos > 85) {
          setIsResetting(true);
          setTimeout(() => {
            setPosition(10);
            setVelocity(0);
            setIsResetting(false);
            // Cambiar fuerza para el próximo ciclo
            setForce((f) => (f === 50 ? 100 : 50));
          }, 1500);
          return 85;
        }
        return newPos;
      });

      setVelocity((prev) => {
        const mass = 10; // kg
        const acceleration = force / mass;
        return prev + acceleration * 0.1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [force, velocity, isResetting]);

  const acceleration = force / 10;

  return (
    <div className="w-full h-[400px] bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900 rounded-xl overflow-hidden relative border-4 border-purple-600 shadow-2xl">
      {/* Título */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/60 backdrop-blur-sm px-6 py-2 rounded-full border-2 border-yellow-400">
          <p className="text-yellow-400 font-bold text-lg">💪 Laboratorio de Fuerzas</p>
        </div>
      </div>

      {/* Grid de fondo */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, 0.2) 25%, rgba(255, 255, 255, 0.2) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.2) 75%, rgba(255, 255, 255, 0.2) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, 0.2) 25%, rgba(255, 255, 255, 0.2) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.2) 75%, rgba(255, 255, 255, 0.2) 76%, transparent 77%, transparent)
          `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Panel de información */}
      <div className="absolute top-20 left-4 space-y-2">
        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-red-500">
          <p className="text-red-400 font-bold text-sm">
            🔥 Fuerza: <span className="text-white">{force} N</span>
          </p>
        </div>
        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-blue-500">
          <p className="text-blue-400 font-bold text-sm">
            📦 Masa: <span className="text-white">10 kg</span>
          </p>
        </div>
        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-green-500">
          <p className="text-green-400 font-bold text-sm">
            ⚡ Aceleración: <span className="text-white">{acceleration.toFixed(1)} m/s²</span>
          </p>
        </div>
        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-yellow-500">
          <p className="text-yellow-400 font-bold text-sm">
            🏃 Velocidad: <span className="text-white">{velocity.toFixed(1)} m/s</span>
          </p>
        </div>
      </div>

      {/* Fórmula F = m × a */}
      <div className="absolute top-20 right-4">
        <div className="bg-gradient-to-br from-purple-900 to-purple-700 backdrop-blur-sm px-6 py-4 rounded-xl border-4 border-purple-400 shadow-2xl">
          <p className="text-white font-bold text-2xl text-center mb-2">F = m × a</p>
          <div className="text-yellow-300 text-sm text-center space-y-1">
            <p>
              {force} N = 10 kg × {acceleration.toFixed(1)} m/s²
            </p>
          </div>
        </div>
      </div>

      {/* Suelo con regla */}
      <div className="absolute bottom-32 left-0 right-0 h-2 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600 border-t-2 border-slate-400">
        {/* Marcas de distancia */}
        {[0, 20, 40, 60, 80, 100].map((mark) => (
          <div key={mark} className="absolute bottom-2" style={{ left: `${mark}%` }}>
            <div className="w-0.5 h-4 bg-slate-300" />
            <p className="text-slate-300 text-xs mt-1 -translate-x-1/2">{mark}m</p>
          </div>
        ))}
      </div>

      {/* Caja con persona empujando */}
      <div
        className="absolute bottom-40 transition-all duration-100"
        style={{
          left: `${position}%`,
          transform: 'translateX(-50%)',
        }}
      >
        {/* Persona empujando */}
        <div className="absolute -left-16 bottom-0 flex flex-col items-center">
          {/* Cabeza */}
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-2 border-orange-300 mb-1 flex items-center justify-center">
            <div className="text-xl">😤</div>
          </div>
          {/* Cuerpo */}
          <div className="w-8 h-12 bg-orange-500 rounded-lg border-2 border-orange-400" />
          {/* Brazos empujando */}
          <div className="absolute top-12 left-10 w-12 h-2 bg-orange-500 rounded-full" />
          {/* Piernas */}
          <div className="flex gap-1 mt-1">
            <div className="w-3 h-8 bg-orange-600 rounded-b-lg" />
            <div className="w-3 h-8 bg-orange-600 rounded-b-lg" />
          </div>

          {/* Efecto de esfuerzo */}
          {velocity > 1 && (
            <>
              <div className="absolute -right-8 top-8 text-red-500 animate-ping">💥</div>
              <div className="absolute -right-4 top-4 text-yellow-500 animate-pulse">💨</div>
            </>
          )}
        </div>

        {/* Caja */}
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-700 via-amber-600 to-amber-800 border-4 border-amber-500 shadow-2xl flex items-center justify-center relative overflow-hidden">
            {/* Textura de madera */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)`,
              }}
            />
            {/* Texto en la caja */}
            <div className="text-white font-bold text-2xl z-10">📦</div>
          </div>

          {/* Sombra de la caja */}
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-black/40 rounded-full blur-md"
            style={{
              transform: `translateX(-50%) scaleX(${1 + velocity * 0.05})`,
            }}
          />
        </div>

        {/* Líneas de movimiento */}
        {velocity > 2 && (
          <div className="absolute -left-32 bottom-10 flex flex-col gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-8 h-1 bg-cyan-400 rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0.7 - i * 0.2,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Vector de fuerza */}
      <div
        className="absolute bottom-52 transition-all duration-100"
        style={{
          left: `${position - 8}%`,
        }}
      >
        <div className="flex items-center gap-1">
          <div className="text-red-500 font-bold text-xs">F</div>
          <div
            className="h-2 bg-gradient-to-r from-red-500 to-red-600 relative transition-all duration-300"
            style={{
              width: `${force * 0.6}px`,
            }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-red-600" />
          </div>
        </div>
      </div>

      {/* Vector de aceleración */}
      <div
        className="absolute bottom-56 transition-all duration-100"
        style={{
          left: `${position + 2}%`,
        }}
      >
        <div className="flex items-center gap-1">
          <div className="text-green-400 font-bold text-xs">a</div>
          <div
            className="h-2 bg-gradient-to-r from-green-400 to-green-500 relative transition-all duration-300"
            style={{
              width: `${acceleration * 6}px`,
            }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-green-500" />
          </div>
        </div>
      </div>

      {/* Texto explicativo */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%]">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-yellow-400/50">
          <p className="text-yellow-200 text-center text-sm font-semibold">
            ⚡ Más fuerza = más aceleración. ¡El doble de fuerza duplica la aceleración!
          </p>
        </div>
      </div>

      {/* Partículas de polvo */}
      {velocity > 3 && (
        <div className="absolute bottom-32" style={{ left: `${position}%` }}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-amber-400 rounded-full animate-ping"
              style={{
                left: `${-20 - i * 10}px`,
                bottom: `${Math.random() * 20}px`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
