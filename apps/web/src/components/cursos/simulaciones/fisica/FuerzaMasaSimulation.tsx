'use client';

import { useEffect, useState } from 'react';

/**
 * Simulación B2: Laboratorio F = m × a
 * Muestra cómo cambiar masa y fuerza afecta la aceleración
 * Demuestra la Segunda Ley de Newton visualmente
 */
export default function FuerzaMasaSimulation() {
  const [mass, setMass] = useState(10);
  const [force, setForce] = useState(50);
  const [position, setPosition] = useState(10);
  const [velocity, setVelocity] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const acceleration = force / mass;

  useEffect(() => {
    if (!isRunning) {
      const startTimeout = setTimeout(() => {
        setIsRunning(true);
        setPosition(10);
        setVelocity(0);
        setTime(0);
      }, 3000);
      return () => clearTimeout(startTimeout);
    }

    const interval = setInterval(() => {
      setTime((t) => t + 0.05);
      setVelocity((v) => v + acceleration * 0.05);
      setPosition((p) => {
        const newP = p + velocity * 0.05;
        if (newP > 85) {
          setIsRunning(false);
          // Cambiar parámetros para el siguiente ciclo
          setMass((m) => (m === 10 ? 50 : 10));
          setForce((f) => (f === 50 ? 100 : 50));
          return 85;
        }
        return newP;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isRunning, acceleration, velocity]);

  return (
    <div className="w-full h-[400px] bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 rounded-xl overflow-hidden relative border-4 border-purple-600 shadow-2xl">
      {/* Título */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/60 backdrop-blur-sm px-6 py-2 rounded-full border-2 border-yellow-400">
          <p className="text-yellow-400 font-bold text-lg">🧪 Laboratorio F = m × a</p>
        </div>
      </div>

      {/* Grid científico de fondo */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 21px),
            repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 21px)
          `,
          }}
        />
      </div>

      {/* Panel de control izquierdo */}
      <div className="absolute top-20 left-4 space-y-2">
        <div className="bg-gradient-to-br from-purple-900 to-purple-700 backdrop-blur-sm px-6 py-4 rounded-xl border-4 border-purple-400 shadow-2xl">
          <p className="text-white font-bold text-3xl text-center mb-2">F = m × a</p>
          <div className="text-yellow-300 text-sm space-y-1">
            <p className="text-center">
              {force} N = {mass} kg × {acceleration.toFixed(1)} m/s²
            </p>
          </div>
        </div>

        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-red-500">
          <p className="text-red-400 font-bold text-sm">
            🔥 Fuerza: <span className="text-white">{force} N</span>
          </p>
          <div className="w-full h-2 bg-slate-700 rounded-full mt-1">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-300"
              style={{ width: `${(force / 100) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-blue-500">
          <p className="text-blue-400 font-bold text-sm">
            📦 Masa: <span className="text-white">{mass} kg</span>
          </p>
          <div className="w-full h-2 bg-slate-700 rounded-full mt-1">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${(mass / 50) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-green-500">
          <p className="text-green-400 font-bold text-sm">
            ⚡ Aceleración: <span className="text-white">{acceleration.toFixed(1)} m/s²</span>
          </p>
          <div className="w-full h-2 bg-slate-700 rounded-full mt-1">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((acceleration / 10) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-yellow-500">
          <p className="text-yellow-400 font-bold text-sm">
            🏃 Velocidad: <span className="text-white">{velocity.toFixed(1)} m/s</span>
          </p>
        </div>
      </div>

      {/* Gráfico de velocidad vs tiempo */}
      <div className="absolute top-20 right-4">
        <div className="bg-black/80 backdrop-blur-sm px-4 py-4 rounded-lg border-2 border-cyan-500 w-56">
          <p className="text-cyan-400 font-bold text-sm mb-2 text-center">📊 Velocidad vs Tiempo</p>
          <div className="h-32 relative border-l-2 border-b-2 border-white/30">
            {/* Ejes */}
            <div className="absolute -left-8 top-0 text-white/50 text-xs">v</div>
            <div className="absolute bottom-0 -right-6 text-white/50 text-xs">t</div>

            {/* Línea de aceleración */}
            <svg className="absolute inset-0 w-full h-full">
              <line
                x1="0"
                y1="100%"
                x2={`${(time / 3) * 100}%`}
                y2={`${100 - Math.min((velocity / 30) * 100, 100)}%`}
                stroke={mass === 10 ? '#22d3ee' : '#f59e0b'}
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle
                cx={`${(time / 3) * 100}%`}
                cy={`${100 - Math.min((velocity / 30) * 100, 100)}%`}
                r="4"
                fill={mass === 10 ? '#22d3ee' : '#f59e0b'}
                className="animate-pulse"
              />
            </svg>

            {/* Etiquetas */}
            <div className="absolute -left-6 top-0 text-white/70 text-xs">30</div>
            <div className="absolute -left-6 bottom-0 text-white/70 text-xs">0</div>
            <div className="absolute -bottom-5 right-0 text-white/70 text-xs">3s</div>
          </div>
          <p className="text-white/70 text-xs mt-2 text-center">Pendiente = aceleración</p>
        </div>
      </div>

      {/* Pista de movimiento */}
      <div className="absolute bottom-24 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 border-t-2 border-purple-400">
        {/* Marcas de distancia */}
        {[0, 25, 50, 75, 100].map((mark) => (
          <div key={mark} className="absolute bottom-2" style={{ left: `${mark * 0.85 + 10}%` }}>
            <div className="w-0.5 h-6 bg-purple-300" />
            <p className="text-purple-300 text-xs mt-1 -translate-x-1/2 whitespace-nowrap">
              {mark}m
            </p>
          </div>
        ))}
      </div>

      {/* Objeto en movimiento */}
      <div
        className="absolute bottom-32 transition-all duration-100"
        style={{
          left: `${position}%`,
          transform: 'translateX(-50%)',
        }}
      >
        {/* Bloque con diferentes tamaños según la masa */}
        <div className="relative">
          <div
            className="bg-gradient-to-br from-cyan-400 to-cyan-600 border-4 border-cyan-300 shadow-2xl flex items-center justify-center font-bold text-white transition-all duration-500 relative overflow-hidden"
            style={{
              width: `${40 + mass * 0.8}px`,
              height: `${40 + mass * 0.8}px`,
              borderRadius: '12px',
            }}
          >
            {/* Efecto de brillo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent" />

            {/* Texto de masa */}
            <div className="z-10 text-center">
              <p className="text-2xl">📦</p>
              <p className="text-xs">{mass}kg</p>
            </div>
          </div>

          {/* Sombra */}
          <div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black/40 rounded-full blur-md transition-all duration-100"
            style={{
              width: `${50 + mass}px`,
              height: '8px',
              transform: `translateX(-50%) scaleX(${1 + velocity * 0.05})`,
            }}
          />

          {/* Líneas de velocidad */}
          {velocity > 2 && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute h-1 bg-cyan-300/70 rounded-full -left-16"
                  style={{
                    top: `${i * 8 - 16}px`,
                    width: `${50 - i * 8}px`,
                    opacity: 1 - i * 0.2,
                    animation: 'slideLeft 0.4s ease-out infinite',
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Vectores de fuerza y aceleración */}
      {isRunning && (
        <>
          {/* Vector de fuerza */}
          <div
            className="absolute bottom-56 transition-all duration-100"
            style={{
              left: `${position - 6}%`,
            }}
          >
            <div className="flex items-center gap-1">
              <div className="text-red-500 font-bold text-sm">F</div>
              <div
                className="h-3 bg-gradient-to-r from-red-500 to-red-600 relative transition-all duration-300"
                style={{
                  width: `${force * 0.8}px`,
                }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[12px] border-transparent border-l-red-600" />
              </div>
            </div>
          </div>

          {/* Vector de aceleración */}
          <div
            className="absolute bottom-60 transition-all duration-100"
            style={{
              left: `${position + 2}%`,
            }}
          >
            <div className="flex items-center gap-1">
              <div className="text-green-400 font-bold text-sm">a</div>
              <div
                className="h-3 bg-gradient-to-r from-green-400 to-green-500 relative transition-all duration-300"
                style={{
                  width: `${acceleration * 8}px`,
                }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[12px] border-transparent border-l-green-500" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Texto explicativo */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%]">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-yellow-400/50">
          <p className="text-yellow-200 text-center text-sm font-semibold">
            {mass === 10
              ? '⚡ Masa pequeña + misma fuerza = ¡acelera RÁPIDO!'
              : '🐢 Masa grande + misma fuerza = acelera LENTO (más inercia)'}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideLeft {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateX(-30px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
