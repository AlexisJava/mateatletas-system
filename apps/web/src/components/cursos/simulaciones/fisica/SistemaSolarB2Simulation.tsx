'use client';

import { useEffect, useState } from 'react';

/**
 * Simulación B2: Sistema Solar Interactivo
 * Muestra planetas orbitando al Sol con gravedad
 * Demuestra la Ley de Gravitación Universal
 */
export default function SistemaSolarB2Simulation() {
  const [sunMass, setSunMass] = useState(1);
  const [time, setTime] = useState(0);
  const [sunExists, setSunExists] = useState(true);
  const [showOrbits, setShowOrbits] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 0.05);
    }, 50);

    // Alternar la existencia del Sol cada 8 segundos
    const sunToggle = setInterval(() => {
      setSunExists((exists) => !exists);
      if (!sunExists) {
        setTime(0); // Reiniciar al volver a aparecer el Sol
      }
    }, 8000);

    // Cambiar masa del Sol cada 16 segundos
    const massChange = setInterval(() => {
      setSunMass((m) => (m === 1 ? 2 : 1));
    }, 16000);

    return () => {
      clearInterval(interval);
      clearInterval(sunToggle);
      clearInterval(massChange);
    };
  }, [sunExists]);

  // Posiciones de los planetas en órbita
  const getPlanetPosition = (distance: number, speed: number, size: number) => {
    if (!sunExists) {
      // Sin Sol, los planetas vuelan en línea recta
      const angle = speed * 3; // Ángulo inicial
      const flyDistance = time * 60; // Vuelan en línea recta
      return {
        x: 50 + Math.cos(angle) * distance + Math.cos(angle) * flyDistance,
        y: 50 + Math.sin(angle) * distance + Math.sin(angle) * flyDistance,
        size,
      };
    }

    // Con Sol, órbita normal (velocidad afectada por masa del Sol)
    const angle = time * speed * Math.sqrt(sunMass);
    return {
      x: 50 + Math.cos(angle) * distance,
      y: 50 + Math.sin(angle) * distance,
      size,
    };
  };

  const planets = [
    { name: 'Mercurio', distance: 15, speed: 1.5, color: 'bg-gray-400', size: 4, emoji: '☿️' },
    { name: 'Venus', distance: 22, speed: 1.1, color: 'bg-yellow-600', size: 6, emoji: '♀️' },
    { name: 'Tierra', distance: 30, speed: 1.0, color: 'bg-blue-500', size: 6, emoji: '🌍' },
    { name: 'Marte', distance: 38, speed: 0.8, color: 'bg-red-600', size: 5, emoji: '♂️' },
  ];

  return (
    <div className="w-full h-[400px] bg-gradient-to-b from-slate-950 via-indigo-950 to-purple-950 rounded-xl overflow-hidden relative border-4 border-purple-600 shadow-2xl">
      {/* Título */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-black/60 backdrop-blur-sm px-6 py-2 rounded-full border-2 border-yellow-400">
          <p className="text-yellow-400 font-bold text-lg">🌌 Sistema Solar Interactivo</p>
        </div>
      </div>

      {/* Campo de estrellas */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Panel de control */}
      <div className="absolute top-20 left-4 space-y-2 z-20">
        <div
          className={`bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 ${sunExists ? 'border-yellow-500' : 'border-red-500'}`}
        >
          <p className={`${sunExists ? 'text-yellow-400' : 'text-red-400'} font-bold text-sm`}>
            ☀️ Sol: <span className="text-white">{sunExists ? 'EXISTE' : 'ELIMINADO'}</span>
          </p>
        </div>

        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-orange-500">
          <p className="text-orange-400 font-bold text-sm">
            📊 Masa Sol: <span className="text-white">{sunMass}× normal</span>
          </p>
        </div>

        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-cyan-500">
          <p className="text-cyan-400 font-bold text-sm">
            ⏱️ Tiempo: <span className="text-white">{time.toFixed(1)}s</span>
          </p>
        </div>
      </div>

      {/* Leyenda de planetas */}
      <div className="absolute top-20 right-4 space-y-1 z-20">
        <div className="bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg border-2 border-purple-500">
          <p className="text-purple-300 font-bold text-xs mb-1">Planetas:</p>
          {planets.map((planet) => (
            <div key={planet.name} className="flex items-center gap-2 text-xs">
              <div className={`w-3 h-3 ${planet.color} rounded-full`} />
              <span className="text-white">
                {planet.emoji} {planet.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas del sistema solar */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[380px] h-[380px]">
          {/* Órbitas (círculos guía) */}
          {showOrbits && sunExists && (
            <>
              {planets.map((planet, i) => (
                <div
                  key={`orbit-${i}`}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/10 rounded-full"
                  style={{
                    width: `${planet.distance * 2}%`,
                    height: `${planet.distance * 2}%`,
                  }}
                />
              ))}
            </>
          )}

          {/* Sol */}
          {sunExists && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div
                className={`rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-600 relative transition-all duration-500`}
                style={{
                  width: `${40 + sunMass * 10}px`,
                  height: `${40 + sunMass * 10}px`,
                  boxShadow: `0 0 ${30 + sunMass * 20}px rgba(255, 200, 0, 0.8)`,
                }}
              >
                {/* Núcleo brillante */}
                <div className="absolute inset-2 bg-yellow-200 rounded-full animate-pulse" />

                {/* Destellos */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-1 bg-yellow-200"
                    style={{
                      height: `${25 + sunMass * 5}px`,
                      transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
                      transformOrigin: 'center',
                      opacity: 0.6,
                    }}
                  />
                ))}

                {/* Emoji */}
                <div className="absolute inset-0 flex items-center justify-center text-2xl">☀️</div>
              </div>

              {/* Campo gravitacional visible */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-yellow-400/20 rounded-full animate-pulse"
                style={{
                  width: `${160 + sunMass * 40}px`,
                  height: `${160 + sunMass * 40}px`,
                }}
              />
            </div>
          )}

          {/* Planetas */}
          {planets.map((planet, i) => {
            const pos = getPlanetPosition(planet.distance, planet.speed, planet.size);
            const isOffScreen = pos.x < 0 || pos.x > 100 || pos.y < 0 || pos.y > 100;

            return (
              <div
                key={i}
                className={`absolute transition-all duration-100 ${isOffScreen ? 'opacity-20' : 'opacity-100'}`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Planeta */}
                <div
                  className={`${planet.color} rounded-full border-2 border-white/50 flex items-center justify-center relative`}
                  style={{
                    width: `${pos.size}px`,
                    height: `${pos.size}px`,
                    boxShadow: '0 0 10px rgba(255,255,255,0.3)',
                  }}
                >
                  {/* Emoji del planeta */}
                  <div className="text-xs">{planet.emoji}</div>
                </div>

                {/* Estela del movimiento */}
                {!sunExists && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-l from-white/50 to-transparent"
                    style={{
                      width: '30px',
                      right: '100%',
                    }}
                  />
                )}

                {/* Vector de fuerza gravitacional (solo si existe el Sol) */}
                {sunExists && time % 2 < 0.1 && (
                  <div
                    className="absolute top-1/2 left-1/2"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${Math.atan2(50 - pos.y, 50 - pos.x)}rad)`,
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-0.5 bg-green-400 relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-green-400" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Nombre del planeta */}
                {i === 2 && ( // Solo mostrar para la Tierra como ejemplo
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <p className="text-white text-xs bg-black/70 px-1 rounded">{planet.name}</p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Advertencia cuando no hay Sol */}
          {!sunExists && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="bg-red-900/90 backdrop-blur-sm px-6 py-4 rounded-xl border-4 border-red-500 animate-pulse">
                <p className="text-red-200 font-bold text-lg mb-2">⚠️ ¡SIN GRAVEDAD!</p>
                <p className="text-red-300 text-sm">Los planetas vuelan en línea recta</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fórmula de gravitación */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 backdrop-blur-sm px-6 py-3 rounded-xl border-4 border-purple-400 shadow-2xl">
          <p className="text-white font-bold text-xl text-center">F = G × (m₁ × m₂) / d²</p>
          <p className="text-purple-200 text-xs text-center mt-1">Ley de Gravitación Universal</p>
        </div>
      </div>

      {/* Texto explicativo */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%]">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-yellow-400/50">
          <p className="text-yellow-200 text-center text-sm font-semibold">
            {sunExists
              ? sunMass === 1
                ? '🌟 La gravedad del Sol mantiene a los planetas en órbita. Más cerca = más rápido'
                : '🌟 ¡Sol más masivo! Los planetas orbitan MÁS RÁPIDO (mayor fuerza gravitacional)'
              : '💥 Sin Sol, no hay gravedad = los planetas vuelan en línea recta (Primera Ley)'}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
