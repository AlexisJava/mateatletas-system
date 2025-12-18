'use client';

import { useEffect, useState } from 'react';

/**
 * Simulación B1: Pista de Fricción
 * Muestra un objeto deslizándose por diferentes superficies
 * Demuestra cómo la fricción frena el movimiento
 */
export default function FriccionSimulation() {
  const [surface, setSurface] = useState<'ice' | 'wood' | 'rough'>('ice');
  const [position, setPosition] = useState(10);
  const [velocity, setVelocity] = useState(20);
  const [isMoving, setIsMoving] = useState(false);

  // Coeficientes de fricción
  const frictionCoefficients = {
    ice: 0.05,
    wood: 0.3,
    rough: 0.8,
  };

  const frictionForce = frictionCoefficients[surface] * 10; // masa = 1 kg

  useEffect(() => {
    if (!isMoving) {
      const startInterval = setInterval(() => {
        setIsMoving(true);
        setVelocity(20);
        setPosition(10);
      }, 6000);
      return () => clearInterval(startInterval);
    }

    const interval = setInterval(() => {
      setVelocity((v) => {
        const newV = v - frictionForce * 0.1;
        return newV > 0 ? newV : 0;
      });

      setPosition((p) => {
        if (velocity <= 0) {
          setIsMoving(false);
          // Cambiar superficie
          setSurface((s) => (s === 'ice' ? 'wood' : s === 'wood' ? 'rough' : 'ice'));
          return p;
        }
        const newP = p + velocity * 0.1;
        return newP > 90 ? 90 : newP;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isMoving, velocity, frictionForce]);

  const getSurfaceConfig = () => {
    switch (surface) {
      case 'ice':
        return {
          name: 'Hielo',
          emoji: '🧊',
          color: 'from-cyan-400 to-blue-400',
          borderColor: 'border-cyan-300',
          friction: '0.05',
          icon: '⛸️',
        };
      case 'wood':
        return {
          name: 'Madera',
          emoji: '🪵',
          color: 'from-amber-600 to-amber-800',
          borderColor: 'border-amber-500',
          friction: '0.30',
          icon: '🛹',
        };
      case 'rough':
        return {
          name: 'Asfalto',
          emoji: '🪨',
          color: 'from-slate-600 to-slate-800',
          borderColor: 'border-slate-500',
          friction: '0.80',
          icon: '🚗',
        };
    }
  };

  const config = getSurfaceConfig();

  return (
    <div className="w-full h-[400px] bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100 rounded-xl overflow-hidden relative border-4 border-sky-600 shadow-2xl">
      {/* Título */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-black/60 backdrop-blur-sm px-6 py-2 rounded-full border-2 border-yellow-400">
          <p className="text-yellow-400 font-bold text-lg">🏁 Pista de Fricción</p>
        </div>
      </div>

      {/* Nubes decorativas */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-white/60 rounded-full"
          style={{
            width: `${80 + i * 30}px`,
            height: `${40 + i * 15}px`,
            left: `${70 + i * 10}%`,
            top: `${10 + i * 15}%`,
          }}
        />
      ))}

      {/* Panel de información */}
      <div className="absolute top-20 left-4 space-y-2 z-10">
        <div
          className={`bg-gradient-to-r ${config.color} backdrop-blur-sm px-4 py-3 rounded-lg border-4 ${config.borderColor} shadow-xl`}
        >
          <p className="text-white font-bold text-lg flex items-center gap-2">
            {config.emoji} Superficie: <span className="text-yellow-200">{config.name}</span>
          </p>
        </div>
        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-red-500">
          <p className="text-red-400 font-bold text-sm">
            🔥 Fricción (μ): <span className="text-white">{config.friction}</span>
          </p>
        </div>
        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-yellow-500">
          <p className="text-yellow-400 font-bold text-sm">
            🏃 Velocidad: <span className="text-white">{velocity.toFixed(1)} m/s</span>
          </p>
        </div>
        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-purple-500">
          <p className="text-purple-400 font-bold text-sm">
            📍 Distancia: <span className="text-white">{((position - 10) * 10).toFixed(0)} m</span>
          </p>
        </div>
      </div>

      {/* Pista / Superficie */}
      <div
        className={`absolute bottom-20 left-0 right-0 h-32 bg-gradient-to-b ${config.color} border-t-4 ${config.borderColor} transition-all duration-500`}
      >
        {/* Textura de la superficie */}
        <div className="absolute inset-0 opacity-30">
          {surface === 'ice' && (
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
          )}
          {surface === 'wood' && (
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.2) 12px)`,
              }}
            />
          )}
          {surface === 'rough' && (
            <div className="h-full w-full">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-black rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Marcas de distancia */}
        <div className="absolute top-0 left-0 right-0 flex justify-between px-4">
          {[0, 200, 400, 600, 800].map((mark) => (
            <div key={mark} className="flex flex-col items-center">
              <div className="w-0.5 h-8 bg-white/50" />
              <p className="text-white/80 text-xs font-bold mt-1">{mark}m</p>
            </div>
          ))}
        </div>
      </div>

      {/* Objeto deslizante */}
      <div
        className="absolute bottom-32 transition-all duration-100 z-10"
        style={{
          left: `${position}%`,
          transform: 'translateX(-50%)',
        }}
      >
        {/* Objeto principal */}
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-lg border-4 border-red-400 shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform">
            <div className="text-3xl">{config.icon}</div>
          </div>

          {/* Efecto de brillo */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent rounded-lg" />

          {/* Sombra */}
          <div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/40 rounded-full blur-md transition-all duration-100"
            style={{
              transform: `translateX(-50%) scaleX(${1 + velocity * 0.05})`,
            }}
          />
        </div>

        {/* Líneas de velocidad */}
        {velocity > 1 && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute w-12 h-1 bg-cyan-400/70 rounded-full -left-16"
                style={{
                  top: `${i * 5}px`,
                  width: `${40 - i * 8}px`,
                  opacity: velocity > 10 ? 1 - i * 0.2 : 0.5 - i * 0.1,
                  animation: 'slideLeft 0.5s ease-out infinite',
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Partículas de fricción */}
        {velocity > 5 && surface === 'rough' && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 bg-orange-500 rounded-full"
                style={{
                  left: `${-30 + Math.random() * 60}px`,
                  bottom: `${Math.random() * 20}px`,
                  animation: 'spark 0.8s ease-out infinite',
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Estelas de hielo */}
        {velocity > 2 && surface === 'ice' && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-2 bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent blur-sm" />
        )}
      </div>

      {/* Vector de fricción */}
      <div
        className="absolute bottom-52 transition-all duration-100"
        style={{
          left: `${position - 5}%`,
        }}
      >
        {velocity > 0 && (
          <div className="flex items-center gap-1">
            <div
              className="h-2 bg-gradient-to-l from-red-500 to-red-600 relative transition-all duration-300"
              style={{
                width: `${frictionForce * 20}px`,
              }}
            >
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent border-r-red-600" />
            </div>
            <div className="text-red-500 font-bold text-xs">Ff</div>
          </div>
        )}
      </div>

      {/* Gráfica de velocidad vs tiempo (mini) */}
      <div className="absolute top-20 right-4">
        <div className="bg-black/80 backdrop-blur-sm px-4 py-3 rounded-lg border-2 border-green-500 w-48">
          <p className="text-green-400 font-bold text-xs mb-2 text-center">
            📊 Velocidad vs Tiempo
          </p>
          <div className="h-24 relative border-l-2 border-b-2 border-white/30">
            {/* Ejes */}
            <div className="absolute bottom-0 left-0 text-white/50 text-xs">0</div>
            <div className="absolute top-0 left-0 text-white/50 text-xs">20</div>
            <div className="absolute bottom-0 right-0 text-white/50 text-xs">t</div>

            {/* Línea de decaimiento */}
            <div
              className="absolute bottom-0 left-0 w-full h-full"
              style={{
                background: `linear-gradient(to right bottom,
                  ${
                    surface === 'ice'
                      ? 'rgba(34, 211, 238, 0.6)'
                      : surface === 'wood'
                        ? 'rgba(251, 191, 36, 0.6)'
                        : 'rgba(239, 68, 68, 0.6)'
                  } 0%,
                  transparent 100%)`,
                clipPath: isMoving
                  ? `polygon(0 ${100 - (velocity / 20) * 100}%, 100% 100%, 0 100%)`
                  : 'polygon(0 100%, 100% 100%, 0 100%)',
                transition: 'clip-path 0.1s linear',
              }}
            />
          </div>
        </div>
      </div>

      {/* Texto explicativo */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%]">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-yellow-400/50">
          <p className="text-yellow-200 text-center text-sm font-semibold">
            ⚡ La fricción es una fuerza que siempre se opone al movimiento. Más fricción = frena
            más rápido
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
        @keyframes slideLeft {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateX(-20px);
            opacity: 0;
          }
        }
        @keyframes spark {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--x), var(--y)) scale(0);
            opacity: 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
