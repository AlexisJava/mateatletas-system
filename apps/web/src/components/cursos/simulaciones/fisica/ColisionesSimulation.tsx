'use client';

import { useEffect, useState } from 'react';

/**
 * Simulación B3: Laboratorio de Colisiones
 * Muestra colisiones elásticas e inelásticas
 * Demuestra conservación del momento y Tercera Ley de Newton
 */
export default function ColisionesSimulation() {
  const [massA, setMassA] = useState(5);
  const [massB, setMassB] = useState(5);
  const [velocityA, setVelocityA] = useState(10);
  const [velocityB, setVelocityB] = useState(0);
  const [positionA, setPositionA] = useState(20);
  const [positionB, setPositionB] = useState(70);
  const [colliding, setColliding] = useState(false);
  const [collided, setCollided] = useState(false);
  const [elastic, setElastic] = useState(true);
  const [forceAB, setForceAB] = useState(0);
  const [forceBA, setForceBA] = useState(0);

  // Momento total del sistema
  const initialMomentum = massA * velocityA + massB * velocityB;
  const currentMomentum = massA * velocityA + massB * velocityB;

  useEffect(() => {
    if (collided) {
      const resetTimeout = setTimeout(() => {
        setPositionA(20);
        setPositionB(70);
        setCollided(false);
        setColliding(false);
        setForceAB(0);
        setForceBA(0);

        // Cambiar parámetros para el próximo ciclo
        if (massA === 5 && massB === 5) {
          setMassA(10);
          setMassB(5);
        } else if (massA === 10) {
          setMassA(5);
          setMassB(10);
        } else {
          setMassA(5);
          setMassB(5);
          setElastic(!elastic);
        }

        setVelocityA(10);
        setVelocityB(0);
      }, 3000);
      return () => clearTimeout(resetTimeout);
    }

    const interval = setInterval(() => {
      // Mover objetos
      setPositionA((p) => p + velocityA * 0.1);
      setPositionB((p) => p + velocityB * 0.1);

      // Detectar colisión
      if (!collided && Math.abs(positionA - positionB) < 8 && velocityA > velocityB) {
        setColliding(true);

        // Calcular fuerzas durante la colisión (3ª Ley: F₁₂ = -F₂₁)
        const relativeVelocity = velocityA - velocityB;
        const collisionForce = (massA * massB * relativeVelocity) / (massA + massB);
        setForceAB(collisionForce);
        setForceBA(-collisionForce);

        // Calcular velocidades post-colisión
        if (elastic) {
          // Colisión elástica: conservación de momento Y energía
          const vA = ((massA - massB) * velocityA + 2 * massB * velocityB) / (massA + massB);
          const vB = ((massB - massA) * velocityB + 2 * massA * velocityA) / (massA + massB);
          setVelocityA(vA);
          setVelocityB(vB);
        } else {
          // Colisión inelástica: solo conservación de momento
          const vFinal = (massA * velocityA + massB * velocityB) / (massA + massB);
          setVelocityA(vFinal * 0.8); // Pérdida de energía
          setVelocityB(vFinal * 0.8);
        }

        setTimeout(() => {
          setColliding(false);
          setCollided(true);
        }, 200);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [velocityA, velocityB, positionA, positionB, collided, massA, massB, elastic]);

  return (
    <div className="w-full h-[400px] bg-gradient-to-b from-slate-900 via-purple-950 to-indigo-950 rounded-xl overflow-hidden relative border-4 border-purple-600 shadow-2xl">
      {/* Título */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/60 backdrop-blur-sm px-6 py-2 rounded-full border-2 border-yellow-400">
          <p className="text-yellow-400 font-bold text-lg">💥 Laboratorio de Colisiones</p>
        </div>
      </div>

      {/* Grid de fondo */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.15) 20px, rgba(255,255,255,0.15) 21px),
            repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.15) 20px, rgba(255,255,255,0.15) 21px)`,
          }}
        />
      </div>

      {/* Panel de control */}
      <div className="absolute top-20 left-4 space-y-2">
        <div
          className={`bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 ${elastic ? 'border-green-500' : 'border-orange-500'}`}
        >
          <p className={`${elastic ? 'text-green-400' : 'text-orange-400'} font-bold text-sm`}>
            {elastic ? '✨ Colisión ELÁSTICA' : '💥 Colisión INELÁSTICA'}
          </p>
          <p className="text-white/70 text-xs mt-1">
            {elastic ? '(Se conserva energía)' : '(Se pierde energía)'}
          </p>
        </div>

        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-blue-500">
          <p className="text-blue-400 font-bold text-sm">
            🔵 Objeto A: <span className="text-white">{massA} kg</span>
          </p>
          <p className="text-cyan-300 text-xs">v = {velocityA.toFixed(1)} m/s</p>
        </div>

        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-red-500">
          <p className="text-red-400 font-bold text-sm">
            🔴 Objeto B: <span className="text-white">{massB} kg</span>
          </p>
          <p className="text-red-300 text-xs">v = {velocityB.toFixed(1)} m/s</p>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-purple-700 backdrop-blur-sm px-4 py-3 rounded-lg border-2 border-purple-400">
          <p className="text-purple-200 font-bold text-xs mb-1">📊 Momento total (p):</p>
          <p className="text-white text-sm">
            Inicial: <span className="text-yellow-300">{initialMomentum.toFixed(1)}</span> kg·m/s
          </p>
          <p className="text-white text-sm">
            Actual: <span className="text-green-300">{currentMomentum.toFixed(1)}</span> kg·m/s
          </p>
          <p className="text-purple-300 text-xs mt-1 italic">
            {Math.abs(initialMomentum - currentMomentum) < 0.1 ? '✅ Conservado' : '⚠️ Variando'}
          </p>
        </div>

        {colliding && (
          <div className="bg-red-900/90 backdrop-blur-sm px-4 py-3 rounded-lg border-2 border-red-500 animate-pulse">
            <p className="text-red-200 font-bold text-sm mb-2">⚡ 3ª Ley de Newton:</p>
            <p className="text-red-300 text-xs">
              F₁₂ = <span className="text-yellow-300">{forceAB.toFixed(1)} N</span>
            </p>
            <p className="text-red-300 text-xs">
              F₂₁ = <span className="text-yellow-300">{forceBA.toFixed(1)} N</span>
            </p>
            <p className="text-green-300 text-xs mt-1 font-bold">✅ F₁₂ = -F₂₁</p>
          </div>
        )}
      </div>

      {/* Fórmulas */}
      <div className="absolute top-20 right-4 space-y-2">
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 backdrop-blur-sm px-6 py-3 rounded-xl border-4 border-indigo-400 shadow-2xl">
          <p className="text-white font-bold text-lg text-center mb-2">Conservación de Momento</p>
          <p className="text-yellow-300 text-sm text-center">m₁v₁ + m₂v₂ = constante</p>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-purple-700 backdrop-blur-sm px-6 py-3 rounded-xl border-4 border-purple-400 shadow-2xl">
          <p className="text-white font-bold text-lg text-center mb-2">3ª Ley (Acción-Reacción)</p>
          <p className="text-yellow-300 text-sm text-center">F₁₂ = -F₂₁</p>
        </div>
      </div>

      {/* Pista */}
      <div className="absolute bottom-32 left-0 right-0 h-2 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 border-t-2 border-slate-500">
        {/* Marcas de posición */}
        {[0, 20, 40, 60, 80, 100].map((mark) => (
          <div key={mark} className="absolute bottom-2" style={{ left: `${mark}%` }}>
            <div className="w-0.5 h-4 bg-slate-400" />
            <p className="text-slate-400 text-xs mt-1 -translate-x-1/2">{mark}cm</p>
          </div>
        ))}
      </div>

      {/* Objeto A */}
      <div
        className="absolute bottom-40 transition-all duration-100"
        style={{
          left: `${positionA}%`,
          transform: 'translateX(-50%)',
        }}
      >
        <div className="relative">
          {/* Cuerpo del objeto */}
          <div
            className="bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-blue-300 shadow-2xl flex items-center justify-center font-bold text-white rounded-xl relative"
            style={{
              width: `${40 + massA * 4}px`,
              height: `${40 + massA * 4}px`,
            }}
          >
            <div className="text-center">
              <p className="text-2xl">🔵</p>
              <p className="text-xs">A: {massA}kg</p>
            </div>
          </div>

          {/* Sombra */}
          <div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/40 rounded-full blur-md"
            style={{
              width: `${50 + massA * 4}px`,
              height: '8px',
            }}
          />

          {/* Líneas de velocidad */}
          {Math.abs(velocityA) > 0.5 && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute h-1 bg-cyan-400/70 rounded-full"
                  style={{
                    left: velocityA > 0 ? '-40px' : '60px',
                    top: `${i * 6 - 9}px`,
                    width: `${Math.abs(velocityA) * 3}px`,
                    opacity: 1 - i * 0.25,
                  }}
                />
              ))}
            </div>
          )}

          {/* Vector de velocidad */}
          {!collided && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
              <div className="text-cyan-400 font-bold text-xs">v₁</div>
              <div
                className="h-2 bg-gradient-to-r from-cyan-400 to-cyan-500 relative"
                style={{
                  width: `${Math.abs(velocityA) * 4}px`,
                }}
              >
                {velocityA > 0 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-cyan-500" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Objeto B */}
      <div
        className="absolute bottom-40 transition-all duration-100"
        style={{
          left: `${positionB}%`,
          transform: 'translateX(-50%)',
        }}
      >
        <div className="relative">
          {/* Cuerpo del objeto */}
          <div
            className="bg-gradient-to-br from-red-400 to-red-600 border-4 border-red-300 shadow-2xl flex items-center justify-center font-bold text-white rounded-xl relative"
            style={{
              width: `${40 + massB * 4}px`,
              height: `${40 + massB * 4}px`,
            }}
          >
            <div className="text-center">
              <p className="text-2xl">🔴</p>
              <p className="text-xs">B: {massB}kg</p>
            </div>
          </div>

          {/* Sombra */}
          <div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/40 rounded-full blur-md"
            style={{
              width: `${50 + massB * 4}px`,
              height: '8px',
            }}
          />

          {/* Líneas de velocidad */}
          {Math.abs(velocityB) > 0.5 && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute h-1 bg-red-400/70 rounded-full"
                  style={{
                    left: velocityB > 0 ? '-40px' : '60px',
                    top: `${i * 6 - 9}px`,
                    width: `${Math.abs(velocityB) * 3}px`,
                    opacity: 1 - i * 0.25,
                  }}
                />
              ))}
            </div>
          )}

          {/* Vector de velocidad */}
          {!collided && Math.abs(velocityB) > 0.1 && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
              <div className="text-red-400 font-bold text-xs">v₂</div>
              <div
                className="h-2 bg-gradient-to-r from-red-400 to-red-500 relative"
                style={{
                  width: `${Math.abs(velocityB) * 4}px`,
                }}
              >
                {velocityB > 0 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-red-500" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Efecto de colisión */}
      {colliding && (
        <div
          className="absolute bottom-44"
          style={{
            left: `${(positionA + positionB) / 2}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="relative">
            <div className="text-6xl animate-ping">💥</div>
            <div className="absolute inset-0 text-6xl animate-pulse">✨</div>

            {/* Vectores de fuerza durante la colisión */}
            <div className="absolute -top-20 -left-16 text-xs">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-16 h-2 bg-gradient-to-r from-yellow-400 to-yellow-500 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-yellow-500" />
                </div>
                <span className="text-yellow-400 font-bold">F₁₂</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-yellow-400 font-bold">F₂₁</span>
                <div className="w-16 h-2 bg-gradient-to-l from-yellow-400 to-yellow-500 relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent border-r-yellow-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Texto explicativo */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[95%]">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-yellow-400/50">
          <p className="text-yellow-200 text-center text-sm font-semibold">
            {!collided
              ? massA === massB
                ? '⚖️ Masas iguales: después de la colisión, intercambian velocidades'
                : massA > massB
                  ? '🏋️ Masa A mayor: continúa avanzando pero más lento después de la colisión'
                  : '🎱 Masa B mayor: A rebota hacia atrás, B se mueve lento'
              : `✅ Momento conservado: ${initialMomentum.toFixed(1)} = ${currentMomentum.toFixed(1)} kg·m/s. Durante la colisión: F₁₂ = -F₂₁ (3ª Ley)`}
          </p>
        </div>
      </div>
    </div>
  );
}
