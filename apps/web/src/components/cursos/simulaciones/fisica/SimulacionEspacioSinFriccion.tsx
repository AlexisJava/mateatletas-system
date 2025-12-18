'use client';

import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

/**
 * Simulación del Espacio sin Fricción
 * Demuestra que en el espacio, los objetos se mueven para siempre
 */
export default function SimulacionEspacioSinFriccion({ onComplete }: { onComplete?: () => void }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [modo, setModo] = useState<'tierra' | 'espacio'>('tierra');
  const engineRef = useRef<Matter.Engine | null>(null);
  const ballRef = useRef<Matter.Body | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const { Engine, Render, World, Bodies } = Matter;

    const engine = Engine.create();
    engineRef.current = engine;
    const world = engine.world;
    world.gravity.y = 0; // Sin gravedad

    const render = Render.create({
      element: canvasRef.current,
      engine: engine,
      options: {
        width: 800,
        height: 500,
        wireframes: false,
        background: modo === 'espacio' ? '#000814' : '#0f172a',
      },
    });

    // Nave espacial (pelota)
    const ball = Bodies.circle(150, 250, 30, {
      restitution: 1,
      friction: 0,
      frictionAir: modo === 'tierra' ? 0.03 : 0, // Fricción en Tierra, sin fricción en Espacio
      render: {
        fillStyle: modo === 'espacio' ? '#fbbf24' : '#3b82f6',
        strokeStyle: modo === 'espacio' ? '#fef3c7' : '#60a5fa',
        lineWidth: 3,
      },
    });

    ballRef.current = ball;

    // Paredes (invisibles pero reflejan)
    const walls = [
      Bodies.rectangle(400, 0, 800, 2, { isStatic: true, render: { visible: false } }),
      Bodies.rectangle(400, 500, 800, 2, { isStatic: true, render: { visible: false } }),
      Bodies.rectangle(0, 250, 2, 500, { isStatic: true, render: { visible: false } }),
      Bodies.rectangle(800, 250, 2, 500, { isStatic: true, render: { visible: false } }),
    ];

    World.add(world, [ball, ...walls]);

    // Agregar "estrellas" si estamos en modo espacio
    if (modo === 'espacio') {
      const estrellas = Array.from({ length: 50 }).map(() =>
        Bodies.circle(Math.random() * 800, Math.random() * 500, Math.random() * 2 + 1, {
          isStatic: true,
          render: {
            fillStyle: '#fff',
          },
        }),
      );
      World.add(world, estrellas);
    }

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    Render.run(render);

    return () => {
      Render.stop(render);
      World.clear(world, false);
      Engine.clear(engine);
      render.canvas.remove();
    };
  }, [modo]);

  const lanzarNave = () => {
    if (ballRef.current) {
      // Darle velocidad inicial
      Matter.Body.setVelocity(ballRef.current, {
        x: Math.random() * 10 - 5,
        y: Math.random() * 10 - 5,
      });
    }
  };

  const cambiarModo = () => {
    setModo(modo === 'tierra' ? 'espacio' : 'tierra');
  };

  return (
    <div className="h-full flex flex-col px-4 py-6 animate-fadeIn overflow-y-auto bg-slate-950">
      <div className="max-w-6xl w-full mx-auto">
        {/* Título */}
        <h2 className="text-3xl md:text-4xl font-black text-center mb-4">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            🎮 Simulación: Tierra vs Espacio
          </span>
        </h2>

        {/* Modo Actual */}
        <div
          className={`border-2 rounded-xl p-4 mb-4 ${
            modo === 'espacio'
              ? 'bg-black/50 border-yellow-500/50'
              : 'bg-blue-900/30 border-blue-500/50'
          }`}
        >
          <p className="text-lg text-white text-center font-bold">
            {modo === 'tierra'
              ? '🌍 MODO: TIERRA (con fricción del aire)'
              : '🌌 MODO: ESPACIO (SIN fricción)'}
          </p>
        </div>

        {/* Canvas */}
        <div
          className={`rounded-xl overflow-hidden mb-4 border-2 ${
            modo === 'espacio' ? 'border-yellow-500/50' : 'border-blue-500/30'
          }`}
        >
          <div ref={canvasRef} />
        </div>

        {/* Explicación */}
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-xl p-4 mb-4">
          <p className="text-base text-white leading-relaxed">
            {modo === 'tierra' ? (
              <>
                <strong className="text-blue-400">En la Tierra:</strong>
                <br />
                La fricción del aire frena la nave espacial poco a poco.
                <br />
                Por eso eventualmente se detiene.
              </>
            ) : (
              <>
                <strong className="text-yellow-400">En el Espacio:</strong>
                <br />
                ¡NO hay fricción! La nave sigue moviéndose PARA SIEMPRE.
                <br />
                Solo cambia de dirección cuando choca con las paredes.
              </>
            )}
          </p>
        </div>

        {/* Botones */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={cambiarModo}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-base transition-all"
          >
            {modo === 'tierra' ? '🚀 Ir al Espacio' : '🌍 Volver a la Tierra'}
          </button>
          <button
            onClick={lanzarNave}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-xl font-bold text-base transition-all"
          >
            🚀 Lanzar Nave
          </button>
        </div>

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
