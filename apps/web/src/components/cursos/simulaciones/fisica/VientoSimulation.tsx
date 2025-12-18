'use client';

import { useEffect, useState } from 'react';

/**
 * Simulación B1: Paracaídas Virtual
 * Muestra un paracaidista cayendo con viento afectando su trayectoria
 * Demuestra fuerzas en acción: gravedad + resistencia del aire
 */
export default function VientoSimulation() {
  const [windStrength, setWindStrength] = useState(2);
  const [parachuteOpen, setParachuteOpen] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 10 });

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => {
        const newY = prev.y + (parachuteOpen ? 1 : 3);
        const newX = prev.x + windStrength * 0.5;

        if (newY > 75) {
          // Reiniciar
          setTimeout(() => {
            setPosition({ x: 50, y: 10 });
            setParachuteOpen(false);
          }, 1000);
          return { x: newX > 90 ? 90 : newX, y: 75 };
        }

        if (prev.y > 25 && !parachuteOpen) {
          setParachuteOpen(true);
        }

        return { x: newX > 90 ? 90 : newX, y: newY };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [parachuteOpen, windStrength]);

  // Cambiar fuerza del viento periódicamente
  useEffect(() => {
    const windInterval = setInterval(() => {
      setWindStrength((prev) => (prev === 2 ? -2 : 2));
    }, 5000);
    return () => clearInterval(windInterval);
  }, []);

  return (
    <div className="w-full h-[400px] bg-gradient-to-b from-blue-400 via-blue-300 to-green-200 rounded-xl overflow-hidden relative border-4 border-blue-600 shadow-2xl">
      {/* Título */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/60 backdrop-blur-sm px-6 py-2 rounded-full border-2 border-yellow-400">
          <p className="text-yellow-400 font-bold text-lg">🪂 Paracaídas Virtual</p>
        </div>
      </div>

      {/* Sol */}
      <div className="absolute top-8 right-8 w-16 h-16 bg-yellow-400 rounded-full shadow-2xl animate-pulse">
        <div className="absolute inset-0 bg-yellow-300 rounded-full animate-ping opacity-50" />
      </div>

      {/* Nubes */}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-white/80 rounded-full animate-float"
          style={{
            width: `${60 + i * 20}px`,
            height: `${30 + i * 10}px`,
            left: `${10 + i * 20}%`,
            top: `${15 + i * 8}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${3 + i}s`,
          }}
        >
          <div
            className="absolute bg-white/80 rounded-full"
            style={{
              width: '60%',
              height: '60%',
              left: '20%',
              top: '-20%',
            }}
          />
        </div>
      ))}

      {/* Indicador de viento */}
      <div className="absolute top-20 left-4">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-cyan-400">
          <p className="text-cyan-300 font-bold text-sm flex items-center gap-2">
            💨 Viento: {windStrength > 0 ? '→' : '←'}{' '}
            <span className="text-yellow-300">{Math.abs(windStrength)} m/s</span>
          </p>
        </div>
      </div>

      {/* Paracaidista */}
      <div
        className="absolute transition-all duration-100"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Paracaídas */}
        {parachuteOpen && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2">
            <div className="relative">
              {/* Cúpula del paracaídas */}
              <div className="w-24 h-16 bg-gradient-to-b from-red-500 via-orange-500 to-yellow-500 rounded-t-full border-4 border-red-700 animate-swing">
                {/* Segmentos del paracaídas */}
                <div className="absolute inset-0 flex justify-around">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-0.5 h-full bg-red-800/50" />
                  ))}
                </div>
              </div>
              {/* Cuerdas */}
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-full w-0.5 h-12 bg-gray-700"
                  style={{
                    left: `${20 + i * 20}%`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Persona */}
        <div className="relative z-10">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full border-2 border-blue-400 flex items-center justify-center">
            <div className="text-lg">🧑</div>
          </div>
          {/* Cuerpo */}
          <div className="w-6 h-10 bg-blue-700 mx-auto rounded-b-lg border-2 border-blue-500" />
          {/* Brazos */}
          {!parachuteOpen && (
            <>
              <div className="absolute top-2 -left-3 w-6 h-1.5 bg-blue-700 rounded-full rotate-45" />
              <div className="absolute top-2 -right-3 w-6 h-1.5 bg-blue-700 rounded-full -rotate-45" />
            </>
          )}
        </div>

        {/* Indicador de velocidad */}
        <div className="absolute -right-20 top-0 bg-black/70 px-2 py-1 rounded whitespace-nowrap">
          <p className="text-xs text-white font-bold">v: {parachuteOpen ? '5' : '15'} m/s</p>
        </div>
      </div>

      {/* Suelo */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-green-600 to-green-800 border-t-4 border-green-700">
        <div className="flex justify-around items-start pt-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="text-2xl">
              🌲
            </div>
          ))}
        </div>
      </div>

      {/* Vectores de fuerza */}
      <div
        className="absolute"
        style={{
          left: `${position.x}%`,
          top: `${position.y - 10}%`,
        }}
      >
        {/* Fuerza de gravedad (hacia abajo) */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="text-red-500 font-bold text-xs mb-1">Fg</div>
          <div className="w-1 h-12 bg-red-500 relative">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-red-500" />
          </div>
        </div>

        {/* Resistencia del aire (hacia arriba) */}
        {parachuteOpen && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="w-1 h-8 bg-cyan-400 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-cyan-400" />
            </div>
            <div className="text-cyan-400 font-bold text-xs mt-1">Fair</div>
          </div>
        )}
      </div>

      {/* Texto explicativo */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[90%]">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-yellow-400/50">
          <p className="text-yellow-200 text-center text-sm font-semibold">
            ⚡ El paracaídas aumenta la resistencia del aire, frenando la caída
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes swing {
          0%,
          100% {
            transform: rotate(-2deg);
          }
          50% {
            transform: rotate(2deg);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(10px);
          }
        }
        .animate-swing {
          animation: swing 1s ease-in-out infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
