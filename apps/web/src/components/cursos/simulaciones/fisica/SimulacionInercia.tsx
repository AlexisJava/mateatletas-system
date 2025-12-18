'use client';

import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

/**
 * Simulación de Inercia (Primera Ley de Newton)
 * Demuestra que los objetos en movimiento siguen moviéndose hasta que una fuerza los detiene
 */
export default function SimulacionInercia({ onComplete }: { onComplete?: () => void }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [instruccion, setInstruccion] = useState('Hacé clic en la pelota para empujarla');
  const engineRef = useRef<Matter.Engine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Módulos de Matter.js
    const { Engine, Render, World, Bodies, Mouse, MouseConstraint, Events } = Matter;

    // Crear motor de física
    const engine = Engine.create();
    engineRef.current = engine;
    const world = engine.world;
    world.gravity.y = 0; // Sin gravedad para demostrar inercia

    // Crear renderizador
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

    // Crear pelota
    const ball = Bodies.circle(100, 250, 40, {
      restitution: 0.9,
      friction: 0,
      frictionAir: 0, // Sin fricción de aire inicialmente
      render: {
        fillStyle: '#3b82f6',
      },
    });

    // Crear paredes
    const walls = [
      Bodies.rectangle(400, 0, 800, 20, { isStatic: true, render: { fillStyle: '#1e293b' } }), // Top
      Bodies.rectangle(400, 500, 800, 20, { isStatic: true, render: { fillStyle: '#1e293b' } }), // Bottom
      Bodies.rectangle(0, 250, 20, 500, { isStatic: true, render: { fillStyle: '#1e293b' } }), // Left
      Bodies.rectangle(800, 250, 20, 500, { isStatic: true, render: { fillStyle: '#1e293b' } }), // Right
    ];

    // Agregar al mundo
    World.add(world, [ball, ...walls]);

    // Mouse control
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });

    World.add(world, mouseConstraint);

    // Detectar cuando se suelta la pelota (empujón)
    Events.on(mouseConstraint, 'enddrag', (event: any) => {
      if (event.body === ball) {
        setInstruccion('¡Mirá! La pelota sigue moviéndose (INERCIA)');

        // Después de 3 segundos, agregar fricción
        setTimeout(() => {
          ball.frictionAir = 0.05;
          setInstruccion('Ahora agregué fricción... la pelota se frena');
        }, 3000);
      }
    });

    // Correr motor y render
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    Render.run(render);

    // Cleanup
    return () => {
      Render.stop(render);
      World.clear(world, false);
      Engine.clear(engine);
      render.canvas.remove();
    };
  }, []);

  const resetear = () => {
    setInstruccion('Hacé clic en la pelota para empujarla');
    if (engineRef.current) {
      const ball = engineRef.current.world.bodies.find((b) => !b.isStatic);
      if (ball) {
        Matter.Body.setPosition(ball, { x: 100, y: 250 });
        Matter.Body.setVelocity(ball, { x: 0, y: 0 });
        ball.frictionAir = 0;
      }
    }
  };

  return (
    <div className="h-full flex flex-col px-4 py-6 animate-fadeIn overflow-y-auto bg-slate-950">
      <div className="max-w-6xl w-full mx-auto">
        {/* Título */}
        <h2 className="text-3xl md:text-4xl font-black text-center mb-4">
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            🎮 Simulación: Inercia
          </span>
        </h2>

        {/* Instrucciones */}
        <div className="bg-blue-900/30 border-2 border-blue-500/50 rounded-xl p-4 mb-4">
          <p className="text-lg text-white text-center font-bold">{instruccion}</p>
        </div>

        {/* Canvas */}
        <div className="bg-slate-900 rounded-xl overflow-hidden mb-4 border-2 border-cyan-500/30 flex items-center justify-center">
          <div ref={canvasRef} />
        </div>

        {/* Explicación */}
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-xl p-4 mb-4">
          <p className="text-base text-white leading-relaxed">
            <strong className="text-cyan-400">¿Qué viste?</strong>
            <br />
            La pelota sigue moviéndose después de empujarla (INERCIA).
            <br />
            Solo se detiene cuando agregamos fricción (una FUERZA que la frena).
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <button
            onClick={resetear}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-base transition-all"
          >
            🔄 Resetear
          </button>
          <button
            onClick={onComplete}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-bold text-base transition-all"
          >
            Continuar →
          </button>
        </div>
      </div>
    </div>
  );
}
