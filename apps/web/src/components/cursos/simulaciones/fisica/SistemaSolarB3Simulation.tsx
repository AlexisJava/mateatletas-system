'use client';

import { useEffect, useState } from 'react';

/**
 * Simulación B3: Sistema Solar Interactivo Avanzado
 * Permite ajustar masa, distancia y velocidad para crear órbitas
 * Demuestra F = G×(m₁×m₂)/d² y velocidad orbital
 */
export default function SistemaSolarB3Simulation() {
  const [starMass, setStarMass] = useState(1); // En masas solares
  const [planetMass, setPlanetMass] = useState(1); // En masas terrestres
  const [distance, setDistance] = useState(1); // En UA (Unidades Astronómicas)
  const [velocity, setVelocity] = useState(30); // km/s
  const [time, setTime] = useState(0);
  const [angle, setAngle] = useState(0);
  const [radius, setRadius] = useState(distance * 30);

  const G = 6.674e-11; // Constante gravitacional
  const solarMass = 1.989e30; // kg
  const earthMass = 5.972e24; // kg
  const AU = 1.496e11; // metros

  // Calcular fuerza gravitacional
  const m1 = starMass * solarMass;
  const m2 = planetMass * earthMass;
  const d = distance * AU;
  const gravitationalForce = (G * m1 * m2) / (d * d);

  // Velocidad orbital para órbita circular
  const orbitalVelocity = Math.sqrt((G * m1) / d) / 1000; // km/s

  // Tipo de órbita
  const getOrbitType = () => {
    const ratio = velocity / orbitalVelocity;
    if (ratio < 0.7) return { type: 'Caída al Sol', color: 'text-red-500', emoji: '💥' };
    if (ratio < 0.95)
      return { type: 'Órbita Elíptica (baja)', color: 'text-orange-500', emoji: '🥚' };
    if (ratio < 1.05) return { type: 'Órbita Circular', color: 'text-green-500', emoji: '⭕' };
    if (ratio < 1.5)
      return { type: 'Órbita Elíptica (alta)', color: 'text-yellow-500', emoji: '🏉' };
    return { type: 'Escape del Sistema', color: 'text-purple-500', emoji: '🚀' };
  };

  const orbitInfo = getOrbitType();

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 0.05);

      const ratio = velocity / orbitalVelocity;

      if (ratio < 0.7) {
        // Cae al sol (espiral hacia adentro)
        setRadius((r) => Math.max(r - 0.5, 5));
        setAngle((a) => a + 0.1);
      } else if (ratio > 1.5) {
        // Escapa (espiral hacia afuera)
        setRadius((r) => Math.min(r + 0.5, 50));
        setAngle((a) => a + 0.05 / (radius / 30));
      } else {
        // Órbita (circular o elíptica)
        const angularVelocity = (velocity / orbitalVelocity) * 0.05;
        setAngle((a) => a + angularVelocity);

        // Simular elipse simple
        const eccentricity = Math.abs(1 - ratio);
        const radiusVar = distance * 30 * (1 + eccentricity * 0.3 * Math.sin(angle * 2));
        setRadius(radiusVar);
      }
    }, 50);

    // Cambiar parámetros cada 10 segundos
    const paramChange = setInterval(() => {
      if (starMass === 1 && distance === 1) {
        setStarMass(5);
      } else if (starMass === 5) {
        setStarMass(1);
        setDistance(2);
      } else {
        setDistance(1);
      }

      // Ajustar velocidad para el nuevo escenario
      setVelocity(30);
      setRadius(distance * 30);
      setAngle(0);
      setTime(0);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(paramChange);
    };
  }, [velocity, orbitalVelocity, distance, starMass, angle, radius]);

  // Posición del planeta
  const planetX = 50 + Math.cos(angle) * (radius / 100) * 45;
  const planetY = 50 + Math.sin(angle) * (radius / 100) * 45;

  return (
    <div className="w-full h-[400px] bg-gradient-to-b from-slate-950 via-indigo-950 to-black rounded-xl overflow-hidden relative border-4 border-indigo-600 shadow-2xl">
      {/* Título */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-black/60 backdrop-blur-sm px-6 py-2 rounded-full border-2 border-yellow-400">
          <p className="text-yellow-400 font-bold text-lg">🪐 Sistema Solar Interactivo</p>
        </div>
      </div>

      {/* Campo de estrellas */}
      <div className="absolute inset-0">
        {[...Array(120)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Panel de control izquierdo */}
      <div className="absolute top-20 left-4 space-y-2 z-20 w-64">
        <div className="bg-black/80 backdrop-blur-sm px-4 py-3 rounded-lg border-2 border-yellow-500">
          <p className="text-yellow-400 font-bold text-sm mb-2">☀️ Estrella Central</p>
          <p className="text-white text-sm">
            Masa: <span className="text-yellow-300">{starMass}× Sol</span>
          </p>
          <p className="text-white/70 text-xs">({(starMass * solarMass).toExponential(2)} kg)</p>
        </div>

        <div className="bg-black/80 backdrop-blur-sm px-4 py-3 rounded-lg border-2 border-blue-500">
          <p className="text-blue-400 font-bold text-sm mb-2">🌍 Planeta</p>
          <p className="text-white text-sm">
            Masa: <span className="text-cyan-300">{planetMass}× Tierra</span>
          </p>
          <p className="text-white text-sm">
            Distancia: <span className="text-cyan-300">{distance} UA</span>
          </p>
          <p className="text-white/70 text-xs">({(distance * AU).toExponential(2)} m)</p>
        </div>

        <div className="bg-black/80 backdrop-blur-sm px-4 py-3 rounded-lg border-2 border-green-500">
          <p className="text-green-400 font-bold text-sm mb-2">🏃 Velocidad</p>
          <p className="text-white text-sm">
            Actual: <span className="text-green-300">{velocity} km/s</span>
          </p>
          <p className="text-white text-sm">
            Orbital: <span className="text-yellow-300">{orbitalVelocity.toFixed(1)} km/s</span>
          </p>
        </div>

        <div
          className={`bg-black/80 backdrop-blur-sm px-4 py-3 rounded-lg border-2 ${orbitInfo.type.includes('Circular') ? 'border-green-500' : orbitInfo.type.includes('Escape') || orbitInfo.type.includes('Caída') ? 'border-red-500' : 'border-yellow-500'}`}
        >
          <p className="text-white font-bold text-sm mb-1">📊 Tipo de Órbita:</p>
          <p className={`${orbitInfo.color} font-bold flex items-center gap-2`}>
            <span className="text-2xl">{orbitInfo.emoji}</span>
            {orbitInfo.type}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-purple-700 backdrop-blur-sm px-4 py-3 rounded-lg border-2 border-purple-400">
          <p className="text-purple-200 font-bold text-xs mb-2">💫 Fuerza Gravitacional:</p>
          <p className="text-white text-sm">{gravitationalForce.toExponential(2)} N</p>
        </div>
      </div>

      {/* Fórmulas */}
      <div className="absolute top-20 right-4 space-y-2 z-20">
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 backdrop-blur-sm px-6 py-4 rounded-xl border-4 border-indigo-400 shadow-2xl">
          <p className="text-white font-bold text-xl text-center mb-3">Gravitación Universal</p>
          <p className="text-yellow-300 text-lg text-center mb-2">F = G × (m₁ × m₂) / d²</p>
          <div className="text-white/70 text-xs space-y-1">
            <p>G = {G.toExponential(3)} N·m²/kg²</p>
            <p>m₁ = {(starMass * solarMass).toExponential(2)} kg</p>
            <p>m₂ = {(planetMass * earthMass).toExponential(2)} kg</p>
            <p>d = {(distance * AU).toExponential(2)} m</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900 to-green-700 backdrop-blur-sm px-6 py-4 rounded-xl border-4 border-green-400 shadow-2xl">
          <p className="text-white font-bold text-lg text-center mb-2">Velocidad Orbital</p>
          <p className="text-yellow-300 text-base text-center">v = √(G × M / r)</p>
        </div>
      </div>

      {/* Canvas del sistema */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[400px] h-[400px]">
          {/* Trayectoria del planeta */}
          <svg className="absolute inset-0 w-full h-full" style={{ transform: 'translate(0, 0)' }}>
            <ellipse
              cx="50%"
              cy="50%"
              rx={`${(radius / 100) * 45}%`}
              ry={`${(radius / 100) * 45}%`}
              fill="none"
              stroke="rgba(100, 200, 255, 0.2)"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          </svg>

          {/* Estrella central */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              className="rounded-full bg-gradient-to-br from-yellow-200 via-yellow-500 to-orange-600 relative transition-all duration-500"
              style={{
                width: `${30 + starMass * 15}px`,
                height: `${30 + starMass * 15}px`,
                boxShadow: `0 0 ${40 + starMass * 20}px rgba(255, 200, 0, 0.8)`,
              }}
            >
              {/* Núcleo */}
              <div className="absolute inset-2 bg-yellow-100 rounded-full animate-pulse" />

              {/* Destellos */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-1 bg-yellow-100 opacity-60"
                  style={{
                    height: `${20 + starMass * 8}px`,
                    transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                    transformOrigin: 'center',
                  }}
                />
              ))}

              {/* Emoji */}
              <div className="absolute inset-0 flex items-center justify-center text-xl">☀️</div>

              {/* Nombre */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <p className="text-yellow-300 text-xs font-bold bg-black/70 px-2 py-1 rounded">
                  Estrella ({starMass}M☉)
                </p>
              </div>
            </div>
          </div>

          {/* Planeta */}
          <div
            className="absolute transition-all duration-100"
            style={{
              left: `${planetX}%`,
              top: `${planetY}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative">
              {/* Cuerpo del planeta */}
              <div
                className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-blue-300 shadow-2xl flex items-center justify-center relative"
                style={{
                  boxShadow: '0 0 15px rgba(59, 130, 246, 0.6)',
                }}
              >
                <div className="text-lg">🌍</div>
              </div>

              {/* Vector de velocidad */}
              <div
                className="absolute top-1/2 left-1/2"
                style={{
                  transform: `translate(-50%, -50%) rotate(${angle + Math.PI / 2}rad)`,
                }}
              >
                <div className="flex items-center">
                  <div className="w-12 h-1 bg-gradient-to-r from-green-400 to-transparent relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-green-400" />
                  </div>
                </div>
              </div>

              {/* Vector de fuerza gravitacional */}
              <div
                className="absolute top-1/2 left-1/2"
                style={{
                  transform: `translate(-50%, -50%) rotate(${angle + Math.PI}rad)`,
                }}
              >
                <div className="flex items-center">
                  <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-transparent relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-red-500" />
                  </div>
                </div>
              </div>

              {/* Etiquetas de vectores */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <p className="text-green-400 text-xs font-bold bg-black/70 px-1 rounded">v</p>
              </div>
              <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <p className="text-red-400 text-xs font-bold bg-black/70 px-1 rounded">Fg</p>
              </div>

              {/* Estela de movimiento */}
              <div
                className="absolute top-1/2 left-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-l from-cyan-400/60 to-transparent pointer-events-none"
                style={{
                  width: '20px',
                  transform: `translate(-50%, -50%) rotate(${angle + Math.PI / 2}rad)`,
                  transformOrigin: 'right center',
                }}
              />
            </div>
          </div>

          {/* Indicador de zona de escape */}
          <div className="absolute inset-0 border-2 border-purple-500/20 rounded-full" />
        </div>
      </div>

      {/* Texto explicativo */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[95%]">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-yellow-400/50">
          <p className="text-yellow-200 text-center text-sm font-semibold">
            {orbitInfo.type === 'Órbita Circular'
              ? '✅ Velocidad perfecta: v = v_orbital. La fuerza centrípeta (gravedad) = fuerza centrífuga'
              : orbitInfo.type.includes('Elíptica')
                ? '🥚 Velocidad ≠ v_orbital: Órbita elíptica. El planeta acelera al acercarse y frena al alejarse'
                : orbitInfo.type.includes('Escape')
                  ? '🚀 v > v_escape: El planeta tiene suficiente energía para escapar del sistema estelar'
                  : '💥 v << v_orbital: Velocidad insuficiente. El planeta cae en espiral hacia la estrella'}
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
