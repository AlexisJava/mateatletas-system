'use client';

import { useEffect, useState } from 'react';

/**
 * Simulación B2: Laboratorio de Inercia
 * Muestra un auto frenando bruscamente y el pasajero sin cinturón
 * Demuestra la Primera Ley de Newton (Inercia)
 */
export default function InerciaLabSimulation() {
  const [carVelocity, setCarVelocity] = useState(80);
  const [carPosition, setCarPosition] = useState(20);
  const [passengerPosition, setPassengerPosition] = useState(0); // Relativo al auto
  const [isBraking, setIsBraking] = useState(false);
  const [seatbelt, setSeatbelt] = useState(false);
  const [crashed, setCrashed] = useState(false);

  useEffect(() => {
    if (crashed) {
      const resetTimeout = setTimeout(() => {
        setCarVelocity(80);
        setCarPosition(20);
        setPassengerPosition(0);
        setIsBraking(false);
        setCrashed(false);
        setSeatbelt(!seatbelt); // Alternar cinturón
      }, 3000);
      return () => clearTimeout(resetTimeout);
    }

    if (!isBraking) {
      const startTimeout = setTimeout(() => {
        setIsBraking(true);
      }, 2000);
      return () => clearTimeout(startTimeout);
    }

    const interval = setInterval(() => {
      // Frenar el auto rápidamente
      setCarVelocity((v) => {
        const newV = v - 15;
        return newV > 0 ? newV : 0;
      });

      setCarPosition((p) => {
        const newP = p + carVelocity * 0.02;
        if (newP > 70) {
          setCrashed(true);
          return 70;
        }
        return newP;
      });

      // El pasajero sin cinturón sigue con inercia
      if (!seatbelt) {
        setPassengerPosition((p) => {
          const newP = p + 1.5;
          return newP > 25 ? 25 : newP;
        });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isBraking, carVelocity, crashed, seatbelt]);

  return (
    <div className="w-full h-[400px] bg-gradient-to-b from-blue-900 via-blue-800 to-slate-900 rounded-xl overflow-hidden relative border-4 border-blue-600 shadow-2xl">
      {/* Título */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/60 backdrop-blur-sm px-6 py-2 rounded-full border-2 border-yellow-400">
          <p className="text-yellow-400 font-bold text-lg">🚗 Laboratorio de Inercia</p>
        </div>
      </div>

      {/* Estrellas de fondo */}
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
          />
        ))}
      </div>

      {/* Panel de control */}
      <div className="absolute top-20 left-4 space-y-2">
        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-green-500">
          <p className="text-green-400 font-bold text-sm flex items-center gap-2">
            🏃 Velocidad: <span className="text-white">{carVelocity} km/h</span>
          </p>
        </div>
        <div
          className={`bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 ${seatbelt ? 'border-green-500' : 'border-red-500'}`}
        >
          <p
            className={`${seatbelt ? 'text-green-400' : 'text-red-400'} font-bold text-sm flex items-center gap-2`}
          >
            {seatbelt ? '✅ Cinturón: ON' : '❌ Cinturón: OFF'}
          </p>
        </div>
        {isBraking && (
          <div className="bg-red-900/90 backdrop-blur-sm px-4 py-3 rounded-lg border-2 border-red-500 animate-pulse">
            <p className="text-red-300 font-bold text-sm">🚨 FRENADO DE EMERGENCIA</p>
          </div>
        )}
      </div>

      {/* Carretera */}
      <div className="absolute bottom-20 left-0 right-0 h-24 bg-gradient-to-b from-slate-700 to-slate-800 border-t-4 border-yellow-400">
        {/* Líneas de la carretera */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 flex gap-8 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-16 h-1 bg-white rounded-full"
              style={{
                animation: 'slideRoad 1s linear infinite',
                animationPlayState: carVelocity > 0 ? 'running' : 'paused',
              }}
            />
          ))}
        </div>
      </div>

      {/* Obstáculo al final */}
      <div className="absolute bottom-32 right-32">
        <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 border-4 border-red-400 flex items-center justify-center text-3xl font-bold text-white rounded-lg shadow-2xl">
          🛑
        </div>
        {crashed && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-ping">💥</div>
          </div>
        )}
      </div>

      {/* Auto */}
      <div
        className="absolute bottom-32 transition-all duration-100"
        style={{
          left: `${carPosition}%`,
          transform: 'translateX(-50%)',
        }}
      >
        <div className="relative">
          {/* Cuerpo del auto */}
          <div className="relative">
            <div className="w-32 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg border-4 border-blue-400 shadow-2xl overflow-hidden">
              {/* Ventanas */}
              <div className="absolute top-1 left-4 w-10 h-6 bg-cyan-300 rounded-t-lg border-2 border-cyan-400" />
              <div className="absolute top-1 right-4 w-10 h-6 bg-cyan-300 rounded-t-lg border-2 border-cyan-400" />

              {/* Pasajero dentro del auto */}
              <div
                className="absolute top-3 transition-all duration-100"
                style={{
                  left: `${35 + passengerPosition}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full border-2 border-yellow-300 flex items-center justify-center">
                  <div className="text-lg">{crashed && !seatbelt ? '😱' : '😊'}</div>
                </div>

                {/* Cinturón de seguridad */}
                {seatbelt && (
                  <div className="absolute top-1 left-0 w-12 h-0.5 bg-red-600 transform -rotate-45" />
                )}
              </div>
            </div>

            {/* Ruedas */}
            <div className="absolute -bottom-2 left-2 w-6 h-6 bg-slate-900 rounded-full border-2 border-slate-700">
              <div className="w-2 h-2 bg-slate-600 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="absolute -bottom-2 right-2 w-6 h-6 bg-slate-900 rounded-full border-2 border-slate-700">
              <div className="w-2 h-2 bg-slate-600 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Luces de freno */}
          {isBraking && (
            <>
              <div className="absolute top-1/2 -right-2 w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-2xl shadow-red-600" />
              <div className="absolute bottom-2 -right-2 w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-2xl shadow-red-600" />
            </>
          )}

          {/* Marcas de derrape */}
          {isBraking && (
            <div className="absolute -bottom-8 -left-24 w-64 h-2 flex gap-2">
              <div className="flex-1 h-full bg-slate-900 rounded-full" />
              <div className="flex-1 h-full bg-slate-900 rounded-full" />
            </div>
          )}

          {/* Humo de frenos */}
          {isBraking && (
            <>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute -bottom-4 w-6 h-6 bg-slate-400 rounded-full opacity-60 blur-sm"
                  style={{
                    left: `${-20 - i * 15}px`,
                    animation: 'fadeSmoke 1s ease-out infinite',
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Vector de inercia del pasajero */}
      {isBraking && !seatbelt && (
        <div
          className="absolute bottom-52"
          style={{
            left: `${carPosition + 2}%`,
          }}
        >
          <div className="flex items-center gap-1">
            <div className="text-yellow-400 font-bold text-xs">Inercia</div>
            <div className="w-16 h-2 bg-gradient-to-r from-yellow-400 to-yellow-500 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-yellow-500" />
            </div>
          </div>
        </div>
      )}

      {/* Fuerza de frenado */}
      {isBraking && (
        <div
          className="absolute bottom-56"
          style={{
            left: `${carPosition - 8}%`,
          }}
        >
          <div className="flex items-center gap-1">
            <div className="w-12 h-2 bg-gradient-to-l from-red-500 to-red-600 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent border-r-red-600" />
            </div>
            <div className="text-red-500 font-bold text-xs">Ffreno</div>
          </div>
        </div>
      )}

      {/* Texto explicativo */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%]">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-yellow-400/50">
          <p className="text-yellow-200 text-center text-sm font-semibold">
            {seatbelt
              ? '✅ Con cinturón: La fuerza del cinturón detiene al pasajero junto con el auto'
              : '❌ Sin cinturón: El pasajero sigue moviéndose por inercia (1ª Ley de Newton)'}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideRoad {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100px);
          }
        }
        @keyframes fadeSmoke {
          0% {
            opacity: 0.6;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(2);
          }
        }
      `}</style>
    </div>
  );
}
