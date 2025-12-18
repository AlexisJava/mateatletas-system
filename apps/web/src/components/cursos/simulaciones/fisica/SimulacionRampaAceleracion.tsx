'use client';

import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

/**
 * Simulación de Rampa con Aceleración
 * Demuestra que diferentes alturas = diferentes velocidades (F=ma)
 */
export default function SimulacionRampaAceleracion({ onComplete }: { onComplete?: () => void }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [altura, setAltura] = useState(200);
  const engineRef = useRef<Matter.Engine | null>(null);
  const [velocidadFinal, setVelocidadFinal] = useState(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const { Engine, Render, World, Bodies, Events } = Matter;

    const engine = Engine.create();
    engineRef.current = engine;
    const world = engine.world;

    const render = Render.create({
      element: canvasRef.current,
      engine: engine,
      options: {
        width: 800,
        height: 500,
        wireframes: false,
        background: '#0f172a',
      },
    });

    // Calcular ángulo de rampa según altura
    const anguloRampa = Math.atan2(altura, 400);

    // Crear rampa
    const rampa = Bodies.rectangle(300, 400 - altura / 2, 500, 20, {
      isStatic: true,
      angle: anguloRampa,
      render: {
        fillStyle: '#7c3aed',
      },
    });

    // Piso
    const piso = Bodies.rectangle(600, 480, 400, 40, {
      isStatic: true,
      render: {
        fillStyle: '#1e293b',
      },
    });

    // Autito
    const autito = Bodies.circle(100, 400 - altura - 40, 25, {
      restitution: 0.3,
      friction: 0.001,
      render: {
        fillStyle: '#ef4444',
      },
    });

    // Paredes
    const leftWall = Bodies.rectangle(0, 250, 20, 500, {
      isStatic: true,
      render: { fillStyle: '#1e293b' },
    });

    const rightWall = Bodies.rectangle(800, 250, 20, 500, {
      isStatic: true,
      render: { fillStyle: '#1e293b' },
    });

    World.add(world, [rampa, piso, autito, leftWall, rightWall]);

    // Detectar velocidad cuando toca el piso
    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        if (
          (pair.bodyA === autito && pair.bodyB === piso) ||
          (pair.bodyB === autito && pair.bodyA === piso)
        ) {
          const velocidad = Math.sqrt(autito.velocity.x ** 2 + autito.velocity.y ** 2);
          setVelocidadFinal(Math.round(velocidad * 10) / 10);
        }
      });
    });

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    Render.run(render);

    return () => {
      Render.stop(render);
      World.clear(world, false);
      Engine.clear(engine);
      render.canvas.remove();
    };
  }, [altura]);

  return (
    <div className="h-full flex flex-col px-4 py-6 animate-fadeIn overflow-y-auto bg-slate-950">
      <div className="max-w-6xl w-full mx-auto">
        {/* Título */}
        <h2 className="text-3xl md:text-4xl font-black text-center mb-4">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🎮 Simulación: Rampa Mágica
          </span>
        </h2>

        {/* Instrucciones */}
        <div className="bg-purple-900/30 border-2 border-purple-500/50 rounded-xl p-4 mb-4">
          <p className="text-lg text-white text-center font-bold">
            Ajustá la altura de la rampa. ¡Mirá cómo cambia la velocidad!
          </p>
        </div>

        {/* Control de Altura */}
        <div className="bg-slate-800/80 rounded-xl p-5 mb-4">
          <label className="text-white font-bold mb-2 block text-center">
            Altura de la Rampa: {altura} píxeles
          </label>
          <input
            type="range"
            min="50"
            max="300"
            step="50"
            value={altura}
            onChange={(e) => setAltura(Number(e.target.value))}
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Baja</span>
            <span>Media</span>
            <span>Alta</span>
          </div>
        </div>

        {/* Velocímetro */}
        {velocidadFinal > 0 && (
          <div className="bg-green-900/30 border-2 border-green-500 rounded-xl p-4 mb-4 animate-pulse">
            <p className="text-2xl text-green-400 text-center font-black">
              🏁 Velocidad Final: {velocidadFinal} unidades/segundo
            </p>
          </div>
        )}

        {/* Canvas */}
        <div className="bg-slate-900 rounded-xl overflow-hidden mb-4 border-2 border-purple-500/30 flex items-center justify-center">
          <div ref={canvasRef} />
        </div>

        {/* Explicación */}
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-xl p-4 mb-4">
          <p className="text-base text-white leading-relaxed">
            <strong className="text-purple-400">¿Qué está pasando?</strong>
            <br />
            Más ALTURA → Más FUERZA de gravedad → Más VELOCIDAD (aceleración)
            <br />
            Menos ALTURA → Menos FUERZA → Menos VELOCIDAD
            <br />
            <br />
            <strong className="text-pink-400">Esto es F = m × a en acción!</strong>
          </p>
        </div>

        {/* Botón */}
        <button
          onClick={onComplete}
          className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-bold text-base transition-all"
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}
