'use client';

import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

/**
 * Simulación de Comparación de Fuerzas (Segunda Ley de Newton: F=ma)
 * Demuestra que más fuerza = más aceleración
 */
export default function SimulacionFuerzaComparacion({ onComplete }: { onComplete?: () => void }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [fuerza, setFuerza] = useState(50);
  const engineRef = useRef<Matter.Engine | null>(null);

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

    // Pelota que empujaremos
    const ball = Bodies.circle(100, 250, 35, {
      restitution: 0.6,
      friction: 0.01,
      render: {
        fillStyle: '#10b981',
      },
    });

    // Piso
    const ground = Bodies.rectangle(400, 480, 800, 40, {
      isStatic: true,
      render: { fillStyle: '#1e293b' },
    });

    // Paredes laterales
    const leftWall = Bodies.rectangle(10, 250, 20, 500, {
      isStatic: true,
      render: { fillStyle: '#1e293b' },
    });

    const rightWall = Bodies.rectangle(790, 250, 20, 500, {
      isStatic: true,
      render: { fillStyle: '#1e293b' },
    });

    World.add(world, [ball, ground, leftWall, rightWall]);

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    Render.run(render);

    return () => {
      Render.stop(render);
      World.clear(world, false);
      Engine.clear(engine);
      render.canvas.remove();
    };
  }, []);

  const aplicarFuerza = () => {
    if (!engineRef.current) return;

    const ball = engineRef.current.world.bodies.find((b) => !b.isStatic && b.circleRadius);

    if (ball) {
      // Resetear posición y velocidad
      Matter.Body.setPosition(ball, { x: 100, y: 250 });
      Matter.Body.setVelocity(ball, { x: 0, y: 0 });

      // Aplicar fuerza horizontal proporcional al slider
      const fuerzaAplicada = fuerza / 10;
      Matter.Body.applyForce(ball, ball.position, {
        x: fuerzaAplicada,
        y: 0,
      });
    }
  };

  return (
    <div className="h-full flex flex-col px-4 py-6 animate-fadeIn overflow-y-auto bg-slate-950">
      <div className="max-w-6xl w-full mx-auto">
        {/* Título */}
        <h2 className="text-3xl md:text-4xl font-black text-center mb-4">
          <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            🎮 Simulación: Más Fuerza = Más Rápido
          </span>
        </h2>

        {/* Instrucciones */}
        <div className="bg-green-900/30 border-2 border-green-500/50 rounded-xl p-4 mb-4">
          <p className="text-lg text-white text-center font-bold">
            Ajustá la fuerza y apretá "Empujar". ¡Mirá cómo cambia la velocidad!
          </p>
        </div>

        {/* Control de Fuerza */}
        <div className="bg-slate-800/80 rounded-xl p-5 mb-4">
          <label className="text-white font-bold mb-2 block text-center">Fuerza: {fuerza}%</label>
          <input
            type="range"
            min="10"
            max="100"
            value={fuerza}
            onChange={(e) => setFuerza(Number(e.target.value))}
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Poca fuerza</span>
            <span>Mucha fuerza</span>
          </div>
        </div>

        {/* Canvas */}
        <div className="bg-slate-900 rounded-xl overflow-hidden mb-4 border-2 border-green-500/30 flex items-center justify-center">
          <div ref={canvasRef} />
        </div>

        {/* Explicación */}
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-xl p-4 mb-4">
          <p className="text-base text-white leading-relaxed">
            <strong className="text-green-400">Segunda Ley de Newton: F = m × a</strong>
            <br />
            Más FUERZA → Más ACELERACIÓN (va más rápido)
            <br />
            Menos FUERZA → Menos ACELERACIÓN (va más lento)
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <button
            onClick={aplicarFuerza}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-black text-lg transition-all shadow-xl"
          >
            💪 Empujar Pelota
          </button>
          <button
            onClick={onComplete}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-bold text-base transition-all"
          >
            Continuar →
          </button>
        </div>
      </div>
    </div>
  );
}
