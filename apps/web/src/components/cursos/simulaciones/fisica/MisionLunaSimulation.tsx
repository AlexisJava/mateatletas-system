'use client';

import { useEffect, useState } from 'react';

type Phase = 'launch' | 'travel' | 'orbit' | 'landing' | 'success' | 'failed';

/**
 * Simulación B3: Misión a la Luna
 * Simula una misión completa desde despegue hasta aterrizaje
 * Demuestra las 4 leyes de Newton trabajando juntas
 */
export default function MisionLunaSimulation() {
  const [phase, setPhase] = useState<Phase>('launch');
  const [altitude, setAltitude] = useState(0); // km
  const [velocity, setVelocity] = useState(0); // km/s
  const [fuel, setFuel] = useState(100); // %
  const [thrust, setThrust] = useState(0); // kN
  const [distance, setDistance] = useState(0); // % del viaje a la Luna
  const [time, setTime] = useState(0); // segundos

  const earthRadius = 6371; // km
  const moonDistance = 384400; // km
  const earthGravity = 9.8; // m/s²
  const moonGravity = 1.62; // m/s²

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 0.1);

      switch (phase) {
        case 'launch':
          if (fuel > 70) {
            setThrust(150);
            const netAcceleration = (thrust * 1000) / 10000 - earthGravity / 1000; // km/s²
            setVelocity((v) => v + netAcceleration * 0.1);
            setAltitude((a) => a + velocity * 0.1);
            setFuel((f) => f - 0.3);

            if (altitude > 200) {
              setPhase('travel');
              setThrust(20); // Correcciones de curso
            }
          } else {
            setPhase('failed');
          }
          break;

        case 'travel':
          if (fuel > 20) {
            setThrust(20);
            setVelocity((v) => Math.max(v - 0.001, 1)); // Desaceleración gradual por gravedad
            setDistance((d) => d + 0.5);
            setFuel((f) => f - 0.05);

            if (distance > 95) {
              setPhase('orbit');
              setVelocity(1.5); // Velocidad orbital lunar
            }
          } else {
            setPhase('failed');
          }
          break;

        case 'orbit':
          setThrust(10);
          setVelocity(1.5); // Mantener órbita
          setFuel((f) => Math.max(f - 0.02, 0));

          if (time > 50 && fuel > 10) {
            setPhase('landing');
            setAltitude(100); // 100km sobre la Luna
          }
          break;

        case 'landing':
          if (fuel > 0 && altitude > 0) {
            setThrust(Math.min((altitude / 100) * 80 + 40, 120));
            const deceleration = (thrust * 1000) / 10000 - moonGravity / 1000;
            setVelocity((v) => Math.max(v - deceleration * 0.1, 0));
            setAltitude((a) => Math.max(a - velocity * 0.1, 0));
            setFuel((f) => Math.max(f - 0.4, 0));

            if (altitude <= 0) {
              if (velocity < 0.002) {
                setPhase('success');
              } else {
                setPhase('failed');
              }
            }
          } else if (fuel <= 0 || (altitude <= 0 && velocity >= 0.002)) {
            setPhase('failed');
          }
          break;

        case 'success':
        case 'failed':
          setTimeout(() => {
            // Reiniciar
            setPhase('launch');
            setAltitude(0);
            setVelocity(0);
            setFuel(100);
            setThrust(0);
            setDistance(0);
            setTime(0);
          }, 5000);
          break;
      }
    }, 50);

    return () => clearInterval(interval);
  }, [phase, altitude, velocity, fuel, thrust, distance, time]);

  const getPhaseInfo = () => {
    switch (phase) {
      case 'launch':
        return { name: 'DESPEGUE', emoji: '🚀', color: 'text-orange-500', bg: 'bg-orange-900' };
      case 'travel':
        return {
          name: 'VIAJE TIERRA-LUNA',
          emoji: '🌍➡️🌙',
          color: 'text-blue-500',
          bg: 'bg-blue-900',
        };
      case 'orbit':
        return { name: 'ÓRBITA LUNAR', emoji: '🛸', color: 'text-purple-500', bg: 'bg-purple-900' };
      case 'landing':
        return { name: 'ATERRIZAJE', emoji: '⬇️', color: 'text-yellow-500', bg: 'bg-yellow-900' };
      case 'success':
        return { name: '¡ÉXITO!', emoji: '🎉', color: 'text-green-500', bg: 'bg-green-900' };
      case 'failed':
        return { name: 'MISIÓN FALLIDA', emoji: '💥', color: 'text-red-500', bg: 'bg-red-900' };
    }
  };

  const phaseInfo = getPhaseInfo();

  return (
    <div className="w-full h-[400px] bg-gradient-to-b from-black via-slate-950 to-indigo-950 rounded-xl overflow-hidden relative border-4 border-blue-600 shadow-2xl">
      {/* Título y fase */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
        <div
          className={`${phaseInfo.bg} backdrop-blur-sm px-8 py-3 rounded-full border-4 border-yellow-400 shadow-2xl`}
        >
          <p className={`${phaseInfo.color} font-bold text-xl flex items-center gap-3`}>
            <span className="text-3xl">{phaseInfo.emoji}</span>
            <span className="text-white">
              Fase {time > 0 ? Math.floor(time) + 's' : ''}: {phaseInfo.name}
            </span>
          </p>
        </div>
      </div>

      {/* Estrellas */}
      <div className="absolute inset-0">
        {[...Array(150)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          />
        ))}
      </div>

      {/* Panel de telemetría */}
      <div className="absolute top-24 left-4 space-y-1 z-20 font-mono text-xs">
        <div className="bg-black/90 backdrop-blur-sm px-3 py-2 rounded border border-green-500">
          <p className="text-green-400">⏱️ T+ {time.toFixed(1)}s</p>
        </div>
        <div className="bg-black/90 backdrop-blur-sm px-3 py-2 rounded border border-cyan-500">
          <p className="text-cyan-400">🏔️ ALT: {altitude.toFixed(1)} km</p>
        </div>
        <div className="bg-black/90 backdrop-blur-sm px-3 py-2 rounded border border-yellow-500">
          <p className="text-yellow-400">🏃 VEL: {velocity.toFixed(3)} km/s</p>
        </div>
        <div className="bg-black/90 backdrop-blur-sm px-3 py-2 rounded border border-orange-500">
          <p className="text-orange-400">🔥 THR: {thrust.toFixed(0)} kN</p>
        </div>
        <div
          className={`bg-black/90 backdrop-blur-sm px-3 py-2 rounded border ${fuel > 50 ? 'border-green-500' : fuel > 20 ? 'border-yellow-500' : 'border-red-500'}`}
        >
          <p
            className={
              fuel > 50 ? 'text-green-400' : fuel > 20 ? 'text-yellow-400' : 'text-red-400'
            }
          >
            ⛽ FUEL: {fuel.toFixed(1)}%
          </p>
          <div className="w-24 h-1.5 bg-slate-700 rounded-full mt-1">
            <div
              className={`h-full rounded-full ${fuel > 50 ? 'bg-green-500' : fuel > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${fuel}%` }}
            />
          </div>
        </div>
        {phase === 'travel' && (
          <div className="bg-black/90 backdrop-blur-sm px-3 py-2 rounded border border-purple-500">
            <p className="text-purple-400">🌙 DIST: {distance.toFixed(1)}%</p>
            <div className="w-24 h-1.5 bg-slate-700 rounded-full mt-1">
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${distance}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Leyes de Newton aplicadas */}
      <div className="absolute top-24 right-4 space-y-1 z-20 w-56">
        <div className="bg-gradient-to-br from-purple-900 to-purple-700 backdrop-blur-sm px-4 py-3 rounded-lg border-2 border-purple-400">
          <p className="text-white font-bold text-sm mb-2 text-center">⚛️ Leyes de Newton</p>
          <div className="space-y-1 text-xs">
            <div
              className={`${phase === 'travel' ? 'text-yellow-300' : 'text-white/50'} transition-colors duration-300`}
            >
              <p className="font-bold">1ª Ley (Inercia):</p>
              <p className="text-[10px]">
                En el espacio, sin fuerzas, la nave mantiene velocidad constante
              </p>
            </div>
            <div
              className={`${phase === 'launch' || phase === 'landing' ? 'text-yellow-300' : 'text-white/50'} transition-colors duration-300`}
            >
              <p className="font-bold">2ª Ley (F=ma):</p>
              <p className="text-[10px]">Motores generan fuerza → aceleración de la nave</p>
            </div>
            <div
              className={`${thrust > 0 ? 'text-yellow-300' : 'text-white/50'} transition-colors duration-300`}
            >
              <p className="font-bold">3ª Ley (Acción-Reacción):</p>
              <p className="text-[10px]">Gases expulsados ↓ empujan nave ↑</p>
            </div>
            <div
              className={`${phase === 'orbit' ? 'text-yellow-300' : 'text-white/50'} transition-colors duration-300`}
            >
              <p className="font-bold">Gravitación Universal:</p>
              <p className="text-[10px]">F = G×(m₁×m₂)/d²mantiene la órbita</p>
            </div>
          </div>
        </div>
      </div>

      {/* Escena visual */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full">
          {/* Tierra (fase launch y travel) */}
          {(phase === 'launch' || phase === 'travel') && (
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2"
              style={{
                width: phase === 'launch' ? '300px' : '100px',
                height: phase === 'launch' ? '300px' : '100px',
                transition: 'all 1s ease-out',
              }}
            >
              <div
                className="w-full h-full bg-gradient-to-br from-blue-500 via-green-500 to-blue-600 rounded-full relative border-4 border-blue-400"
                style={{
                  boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)',
                }}
              >
                {/* Nubes */}
                {phase === 'launch' && (
                  <>
                    <div className="absolute top-1/4 left-1/4 w-12 h-8 bg-white/60 rounded-full blur-sm" />
                    <div className="absolute top-1/3 right-1/4 w-16 h-10 bg-white/60 rounded-full blur-sm" />
                  </>
                )}
                {/* Continentes */}
                <div className="absolute top-1/2 left-1/3 w-16 h-12 bg-green-700/80 rounded-full" />
              </div>
            </div>
          )}

          {/* Luna (fases orbit y landing) */}
          {(phase === 'orbit' || phase === 'landing' || phase === 'success') && (
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                bottom: phase === 'landing' || phase === 'success' ? '20%' : '10%',
                width: phase === 'landing' || phase === 'success' ? '250px' : '180px',
                height: phase === 'landing' || phase === 'success' ? '250px' : '180px',
                transition: 'all 1s ease-out',
              }}
            >
              <div
                className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 rounded-full relative border-4 border-gray-500"
                style={{
                  boxShadow: '0 0 30px rgba(156, 163, 175, 0.6)',
                }}
              >
                {/* Cráteres */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-gray-700 rounded-full border border-gray-600"
                    style={{
                      width: `${15 + Math.random() * 25}px`,
                      height: `${15 + Math.random() * 25}px`,
                      left: `${Math.random() * 70 + 10}%`,
                      top: `${Math.random() * 70 + 10}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Nave espacial */}
          <div
            className="absolute transition-all duration-100"
            style={{
              left: phase === 'travel' ? '50%' : '50%',
              bottom:
                phase === 'launch'
                  ? `${20 + altitude * 0.8}%`
                  : phase === 'travel'
                    ? '50%'
                    : phase === 'orbit'
                      ? '35%'
                      : `${30 + (100 - altitude) * 0.2}%`,
              transform: 'translate(-50%, 0)',
            }}
          >
            <div className="relative">
              {/* Cuerpo de la nave */}
              <div className="relative z-10">
                {/* Punta */}
                <div
                  className="w-12 h-10 bg-gradient-to-br from-red-600 to-red-800 mx-auto border-2 border-red-500"
                  style={{
                    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  }}
                />

                {/* Cuerpo principal */}
                <div className="w-12 h-16 bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 border-4 border-slate-500 relative">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-cyan-400 rounded-full border-2 border-cyan-600" />
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 text-lg">🚀</div>
                </div>

                {/* Aletas */}
                <div
                  className="absolute bottom-0 -left-3 w-5 h-6 bg-gradient-to-br from-red-600 to-red-800 border-2 border-red-500"
                  style={{
                    clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
                  }}
                />
                <div
                  className="absolute bottom-0 -right-3 w-5 h-6 bg-gradient-to-bl from-red-600 to-red-800 border-2 border-red-500"
                  style={{
                    clipPath: 'polygon(0 0, 100% 100%, 0 100%)',
                  }}
                />

                {/* Motor */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-slate-800 rounded-b border-2 border-slate-700" />
              </div>

              {/* Llama de propulsión */}
              {thrust > 0 && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-0">
                  <div
                    className="w-6 bg-gradient-to-b from-white via-yellow-400 to-transparent blur-sm animate-pulse"
                    style={{
                      height: `${thrust * 0.3}px`,
                    }}
                  />
                  <div
                    className="absolute top-2 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-b from-orange-500 via-red-600 to-transparent blur-md"
                    style={{
                      height: `${thrust * 0.4}px`,
                    }}
                  />
                </div>
              )}

              {/* Vectores de fuerza */}
              {phase === 'launch' && (
                <>
                  {/* Empuje */}
                  <div className="absolute left-12 top-4">
                    <div className="flex items-center gap-1">
                      <div className="text-orange-400 font-bold text-xs">F_motor</div>
                      <div className="w-12 h-2 bg-gradient-to-r from-orange-500 to-transparent relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-3 border-b-3 border-l-6 border-transparent border-l-orange-500" />
                      </div>
                    </div>
                  </div>

                  {/* Gravedad */}
                  <div className="absolute left-12 top-10">
                    <div className="flex items-center gap-1">
                      <div className="text-red-400 font-bold text-xs">F_grav</div>
                      <div className="w-8 h-2 bg-gradient-to-l from-red-500 to-transparent relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-3 border-b-3 border-r-6 border-transparent border-r-red-500" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mensaje de resultado */}
          {phase === 'success' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-40">
              <div className="bg-green-900/95 backdrop-blur-sm px-12 py-8 rounded-2xl border-4 border-green-400 shadow-2xl animate-pulse">
                <p className="text-green-200 font-bold text-4xl mb-4">🎉 ¡MISIÓN EXITOSA! 🎉</p>
                <p className="text-green-300 text-lg">Aterrizaje suave en la Luna</p>
                <p className="text-green-400 text-sm mt-2">
                  Velocidad final: {velocity.toFixed(3)} km/s
                </p>
                <p className="text-green-400 text-sm">Combustible restante: {fuel.toFixed(1)}%</p>
              </div>
            </div>
          )}

          {phase === 'failed' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-40">
              <div className="bg-red-900/95 backdrop-blur-sm px-12 py-8 rounded-2xl border-4 border-red-400 shadow-2xl">
                <p className="text-red-200 font-bold text-4xl mb-4">💥 MISIÓN FALLIDA 💥</p>
                <p className="text-red-300 text-lg">
                  {fuel <= 0
                    ? 'Combustible agotado'
                    : velocity >= 0.002 && altitude <= 0
                      ? 'Impacto demasiado fuerte'
                      : 'Error en la maniobra'}
                </p>
                <p className="text-red-400 text-sm mt-2">Reiniciando misión...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Texto explicativo */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[95%]">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-yellow-400/50">
          <p className="text-yellow-200 text-center text-xs font-semibold">
            {phase === 'launch'
              ? '🚀 Despegue: F_motor > F_gravedad para vencer la gravedad terrestre (2ª Ley). Gases expulsados ↓ = Nave ↑ (3ª Ley)'
              : phase === 'travel'
                ? '🌌 Viaje: En el vacío, sin fuerzas, la nave mantiene velocidad constante (1ª Ley - Inercia)'
                : phase === 'orbit'
                  ? '🛸 Órbita: Gravedad lunar = Fuerza centrípeta. F = G×(m₁×m₂)/d² mantiene la órbita circular'
                  : phase === 'landing'
                    ? '⬇️ Aterrizaje: Retrocohetes frenan la caída. Objetivo: v < 2 m/s para aterrizaje suave'
                    : phase === 'success'
                      ? '✅ ¡Las 4 leyes de Newton trabajaron juntas para lograr la misión!'
                      : '❌ Ajusta mejor el empuje y administra el combustible'}
          </p>
        </div>
      </div>
    </div>
  );
}
