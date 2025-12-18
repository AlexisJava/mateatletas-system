'use client';

import { useEffect, useState } from 'react';

/**
 * Simulación B2: Cohete Acción-Reacción
 * Muestra un cohete expulsando gases (acción) y subiendo (reacción)
 * Demuestra la Tercera Ley de Newton
 */
export default function CoheteSimulation() {
  const [enginePower, setEnginePower] = useState(60);
  const [altitude, setAltitude] = useState(10);
  const [velocity, setVelocity] = useState(0);
  const [gasFlow, setGasFlow] = useState(3);
  const [isLaunching, setIsLaunching] = useState(false);
  const [fuel, setFuel] = useState(100);

  useEffect(() => {
    if (!isLaunching && fuel > 0) {
      const launchTimeout = setTimeout(() => {
        setIsLaunching(true);
      }, 2000);
      return () => clearTimeout(launchTimeout);
    }

    if (fuel <= 0) {
      const resetTimeout = setTimeout(() => {
        setAltitude(10);
        setVelocity(0);
        setFuel(100);
        setIsLaunching(false);
        // Cambiar potencia para el próximo lanzamiento
        setEnginePower((p) => (p === 60 ? 100 : 60));
        setGasFlow((g) => (g === 3 ? 5 : 3));
      }, 3000);
      return () => clearTimeout(resetTimeout);
    }

    if (isLaunching) {
      const interval = setInterval(() => {
        const thrust = enginePower * gasFlow;
        const gravity = 10;
        const mass = 10;
        const netAcceleration = (thrust - mass * gravity) / mass;

        setVelocity((v) => {
          const newV = v + netAcceleration * 0.05;
          return newV > 0 ? newV : 0;
        });

        setAltitude((a) => {
          const newA = a + velocity * 0.05;
          return newA < 85 ? newA : 85;
        });

        setFuel((f) => {
          const newF = f - gasFlow * 0.5;
          return newF > 0 ? newF : 0;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isLaunching, enginePower, gasFlow, velocity, fuel]);

  const thrust = enginePower * gasFlow;

  return (
    <div className="w-full h-[400px] bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 rounded-xl overflow-hidden relative border-4 border-indigo-600 shadow-2xl">
      {/* Título */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-black/60 backdrop-blur-sm px-6 py-2 rounded-full border-2 border-yellow-400">
          <p className="text-yellow-400 font-bold text-lg">🚀 Cohete Acción-Reacción</p>
        </div>
      </div>

      {/* Estrellas */}
      <div className="absolute inset-0">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          />
        ))}
      </div>

      {/* Panel de control */}
      <div className="absolute top-20 left-4 space-y-2 z-10">
        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-orange-500">
          <p className="text-orange-400 font-bold text-sm">
            🔥 Potencia: <span className="text-white">{enginePower}%</span>
          </p>
          <div className="w-full h-2 bg-slate-700 rounded-full mt-1">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full transition-all duration-300 animate-pulse"
              style={{ width: `${enginePower}%` }}
            />
          </div>
        </div>

        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-cyan-500">
          <p className="text-cyan-400 font-bold text-sm">
            💨 Flujo gases: <span className="text-white">{gasFlow} kg/s</span>
          </p>
        </div>

        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-purple-500">
          <p className="text-purple-400 font-bold text-sm">
            ⬆️ Empuje: <span className="text-white">{thrust.toFixed(0)} N</span>
          </p>
        </div>

        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-green-500">
          <p className="text-green-400 font-bold text-sm">
            🏔️ Altitud: <span className="text-white">{((altitude - 10) * 100).toFixed(0)} m</span>
          </p>
        </div>

        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-yellow-500">
          <p className="text-yellow-400 font-bold text-sm">
            ⚡ Velocidad: <span className="text-white">{velocity.toFixed(1)} m/s</span>
          </p>
        </div>

        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-blue-500">
          <p className="text-blue-400 font-bold text-sm">
            ⛽ Combustible: <span className="text-white">{fuel.toFixed(0)}%</span>
          </p>
          <div className="w-full h-2 bg-slate-700 rounded-full mt-1">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                fuel > 50
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : fuel > 20
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse'
              }`}
              style={{ width: `${fuel}%` }}
            />
          </div>
        </div>
      </div>

      {/* Escala de altitud */}
      <div className="absolute top-20 right-4 w-12 h-64 border-2 border-white/30 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-slate-900/50" />
        {[0, 25, 50, 75, 100].map((mark) => (
          <div
            key={mark}
            className="absolute left-0 right-0 border-t border-white/20"
            style={{ bottom: `${mark}%` }}
          >
            <p className="text-white/50 text-xs ml-2">{mark * 75}m</p>
          </div>
        ))}

        {/* Indicador de altitud actual */}
        <div
          className="absolute left-0 right-0 h-1 bg-yellow-400 transition-all duration-100"
          style={{ bottom: `${((altitude - 10) / 75) * 100}%` }}
        >
          <div className="absolute right-0 w-4 h-4 bg-yellow-400 rounded-full -translate-y-1/2 animate-ping" />
        </div>
      </div>

      {/* Plataforma de lanzamiento */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10">
        <div className="w-40 h-16 bg-gradient-to-t from-slate-800 to-slate-700 border-t-4 border-slate-600 rounded-t-xl relative">
          {/* Soporte */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-8 bg-slate-700 border-2 border-slate-600" />

          {/* Humo de pre-lanzamiento */}
          {!isLaunching && fuel === 100 && (
            <>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bottom-0 w-8 h-8 bg-white/20 rounded-full blur-md"
                  style={{
                    left: `${20 + i * 15}%`,
                    animation: 'riseSmoke 2s ease-out infinite',
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Cohete */}
      <div
        className="absolute left-1/2 -translate-x-1/2 transition-all duration-100 z-20"
        style={{
          bottom: `${altitude}%`,
        }}
      >
        <div className="relative">
          {/* Punta del cohete */}
          <div
            className="w-16 h-12 bg-gradient-to-br from-red-600 to-red-800 mx-auto clip-triangle border-2 border-red-500"
            style={{
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            }}
          />

          {/* Cuerpo del cohete */}
          <div className="w-16 h-24 bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 border-4 border-slate-500 relative overflow-hidden">
            {/* Ventanas */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-cyan-400 rounded-full border-2 border-cyan-600" />

            {/* Bandera */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-xl">🚀</div>

            {/* Franjas */}
            <div className="absolute top-12 left-0 right-0 h-2 bg-red-600" />
            <div className="absolute top-16 left-0 right-0 h-2 bg-blue-600" />

            {/* Indicador de combustible */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-blue-500/30 transition-all duration-100"
              style={{
                height: `${fuel}%`,
              }}
            />
          </div>

          {/* Aletas */}
          <div
            className="absolute bottom-0 -left-4 w-6 h-8 bg-gradient-to-br from-red-600 to-red-800 border-2 border-red-500"
            style={{
              clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
            }}
          />
          <div
            className="absolute bottom-0 -right-4 w-6 h-8 bg-gradient-to-bl from-red-600 to-red-800 border-2 border-red-500"
            style={{
              clipPath: 'polygon(0 0, 100% 100%, 0 100%)',
            }}
          />

          {/* Motores y llama */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-slate-800 rounded-b-lg border-2 border-slate-700">
            {/* Toberas */}
            <div className="absolute bottom-0 left-2 w-3 h-3 bg-slate-900 rounded-full" />
            <div className="absolute bottom-0 right-2 w-3 h-3 bg-slate-900 rounded-full" />
          </div>

          {/* Llama y gases (ACCIÓN) */}
          {isLaunching && fuel > 0 && (
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              {/* Llama principal */}
              <div className="relative">
                {/* Núcleo blanco caliente */}
                <div className="w-8 h-16 bg-gradient-to-b from-white via-yellow-200 to-transparent mx-auto blur-sm animate-pulse" />

                {/* Llama naranja */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-20 bg-gradient-to-b from-orange-500 via-red-600 to-transparent blur-md animate-flicker" />

                {/* Gases expandiéndose */}
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-16 w-4 h-4 bg-orange-400/60 rounded-full blur-md"
                    style={{
                      left: `${-8 + i * 4}px`,
                      animation: 'exhaustGas 0.8s ease-out infinite',
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}

                {/* Partículas de combustión */}
                {enginePower > 50 && (
                  <>
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={`spark-${i}`}
                        className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                        style={{
                          left: `${Math.random() * 20 - 10}px`,
                          top: `${20 + Math.random() * 30}px`,
                          animation: 'sparkle 0.6s ease-out infinite',
                          animationDelay: `${Math.random() * 0.6}s`,
                        }}
                      />
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Efecto de vibración durante el lanzamiento */}
          {isLaunching && fuel > 0 && <div className="absolute inset-0 animate-shake" />}
        </div>

        {/* Nube de lanzamiento */}
        {isLaunching && altitude < 20 && (
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-20 h-20 bg-white/40 rounded-full blur-xl"
                style={{
                  left: `${-40 + i * 20}px`,
                  animation: 'expandCloud 1.5s ease-out infinite',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Vectores de fuerza */}
      {isLaunching && fuel > 0 && (
        <>
          {/* Vector de empuje (REACCIÓN - hacia arriba) */}
          <div
            className="absolute left-1/2 transition-all duration-100"
            style={{
              bottom: `${altitude + 12}%`,
              marginLeft: '20px',
            }}
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-3 bg-gradient-to-t from-cyan-400 to-cyan-500 relative transition-all duration-300"
                style={{
                  height: `${thrust * 0.2}px`,
                }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[12px] border-transparent border-b-cyan-500" />
              </div>
              <div className="text-cyan-400 font-bold text-xs bg-black/70 px-1 rounded">
                Empuje (Reacción)
              </div>
            </div>
          </div>

          {/* Vector de gases expulsados (ACCIÓN - hacia abajo) */}
          <div
            className="absolute left-1/2 transition-all duration-100"
            style={{
              bottom: `${altitude - 8}%`,
              marginLeft: '-35px',
            }}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="text-orange-500 font-bold text-xs bg-black/70 px-1 rounded whitespace-nowrap">
                Gases (Acción)
              </div>
              <div
                className="w-3 bg-gradient-to-b from-orange-500 to-red-600 relative transition-all duration-300"
                style={{
                  height: `${thrust * 0.2}px`,
                }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[12px] border-transparent border-t-red-600" />
              </div>
            </div>
          </div>

          {/* Vector de gravedad */}
          <div
            className="absolute left-1/2 transition-all duration-100"
            style={{
              bottom: `${altitude + 8}%`,
              marginLeft: '-40px',
            }}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="text-red-400 font-bold text-xs bg-black/70 px-1 rounded">
                Gravedad
              </div>
              <div className="w-3 h-16 bg-gradient-to-b from-red-400 to-red-500 relative">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[12px] border-transparent border-t-red-500" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Texto explicativo */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%]">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-yellow-400/50">
          <p className="text-yellow-200 text-center text-sm font-semibold">
            ⚡ 3ª Ley: Gases expulsados ↓ (acción) = Cohete empujado ↑ (reacción). ¡Fuerzas iguales
            y opuestas!
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes riseSmoke {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.5;
          }
          100% {
            transform: translateY(-60px) scale(2);
            opacity: 0;
          }
        }
        @keyframes exhaustGas {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.8;
          }
          100% {
            transform: translateY(40px) scale(2);
            opacity: 0;
          }
        }
        @keyframes sparkle {
          0% {
            transform: translate(0, 0);
            opacity: 1;
          }
          100% {
            transform: translate(var(--x, -10px), var(--y, 30px));
            opacity: 0;
          }
        }
        @keyframes flicker {
          0%,
          100% {
            opacity: 1;
            transform: scaleY(1);
          }
          50% {
            opacity: 0.9;
            transform: scaleY(1.1);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-1px);
          }
          75% {
            transform: translateX(1px);
          }
        }
        @keyframes expandCloud {
          0% {
            transform: scale(0.5);
            opacity: 0.6;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-flicker {
          animation: flicker 0.15s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
