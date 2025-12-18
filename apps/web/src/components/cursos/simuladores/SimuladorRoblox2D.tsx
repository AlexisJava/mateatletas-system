'use client';

import { useRef, useEffect, useState } from 'react';
import type { EstadoBloque } from '@/data/roblox/types';

interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
  color: string;
  tamaño: number;
}

interface SimuladorRoblox2DProps {
  estado: EstadoBloque;
  onInteraccion?: () => void;
  mostrarJugador?: boolean;
}

/**
 * Convierte nombres de colores de Roblox a HEX
 */
function robloxColorToHex(colorName: string): string {
  const colores: Record<string, string> = {
    'Bright red': '#FF0000',
    'Bright blue': '#0055FF',
    'Bright green': '#00FF00',
    'Bright yellow': '#FFFF00',
    'Deep orange': '#FF6600',
    'Really black': '#111111',
    White: '#FFFFFF',
    'Medium stone grey': '#A0A0A0',
    'Lime green': '#00FF00',
    'New Yeller': '#FFFF00',
    'Really red': '#FF0000',
  };

  return colores[colorName] || '#A0A0A0';
}

/**
 * SIMULADOR 2D BRUTAL E INTERACTIVO
 * Los pibes pueden jugar con el bloque
 */
export default function SimuladorRoblox2D({
  estado,
  onInteraccion,
  mostrarJugador = false,
}: SimuladorRoblox2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotacion, setRotacion] = useState(0);
  const [escala, setEscala] = useState(1);
  const [particulas, setParticulas] = useState<Particula[]>([]);
  const [hover, setHover] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [jugadorX, setJugadorX] = useState(50);
  const animationFrameRef = useRef<number>();
  const colorAnteriorRef = useRef(estado.color);

  // Detectar cambio de color y crear explosión de partículas
  useEffect(() => {
    if (colorAnteriorRef.current !== estado.color) {
      crearExplosionParticulas();
      colorAnteriorRef.current = estado.color;
    }
  }, [estado.color]);

  const crearExplosionParticulas = () => {
    const nuevasParticulas: Particula[] = [];
    const color = robloxColorToHex(estado.color);

    for (let i = 0; i < 30; i++) {
      const angulo = (Math.PI * 2 * i) / 30;
      const velocidad = 2 + Math.random() * 3;

      nuevasParticulas.push({
        x: 200,
        y: 200,
        vx: Math.cos(angulo) * velocidad,
        vy: Math.sin(angulo) * velocidad,
        vida: 1,
        color,
        tamaño: 3 + Math.random() * 5,
      });
    }

    setParticulas(nuevasParticulas);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Detectar hover sobre el bloque isométrico
    const distX = Math.abs(x - 200);
    const distY = Math.abs(y - 180);

    // Área de detección más precisa para el cubo isométrico
    if (distX < 80 && distY < 90) {
      setHover(true);
    } else {
      setHover(false);
    }
  };

  const handleClick = () => {
    setClicked(true);
    if (onInteraccion) {
      onInteraccion();
    }

    // Crear explosión al hacer click
    crearExplosionParticulas();

    // Reset del click
    setTimeout(() => setClicked(false), 200);
  };

  // Loop de animación
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Limpiar canvas
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, 400, 400);

      // Dibujar grid de fondo
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;
      for (let i = 0; i < 400; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 400);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(400, i);
        ctx.stroke();
      }

      // Actualizar rotación
      setRotacion((r) => r + delta * 0.5);

      // Actualizar escala (efecto de hover)
      setEscala((s) => {
        const target = hover ? 1.1 : clicked ? 0.9 : 1;
        return s + (target - s) * 0.1;
      });

      // Actualizar partículas
      setParticulas((parts) => {
        return parts
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1, // Gravedad
            vida: p.vida - delta * 0.5,
          }))
          .filter((p) => p.vida > 0 && p.y < 400);
      });

      // Dibujar partículas
      particulas.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.vida;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.tamaño, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Dibujar jugador si está activo
      if (mostrarJugador) {
        setJugadorX((x) => {
          const target = 200;
          return x + (target - x) * 0.05;
        });

        // Cuerpo del jugador (esfera azul)
        ctx.fillStyle = '#3B82F6';
        ctx.beginPath();
        ctx.arc(jugadorX, 320, 15, 0, Math.PI * 2);
        ctx.fill();

        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(jugadorX, 340, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Guardar contexto
      ctx.save();
      ctx.translate(200, 180);
      ctx.rotate(rotacion);
      ctx.scale(escala, escala);

      // Dibujar el bloque en proyección isométrica
      const color = robloxColorToHex(estado.color);
      const size = 80;

      // Efecto Neon
      if (estado.material === 'Neon') {
        ctx.shadowBlur = 30;
        ctx.shadowColor = color;
      } else {
        ctx.shadowBlur = 0;
      }

      // Color base con transparencia
      ctx.globalAlpha = 1 - estado.transparency;

      // CARA SUPERIOR (techo del cubo)
      ctx.fillStyle = ajustarBrillo(color, 0.3);
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.5); // Pico superior
      ctx.lineTo(size * 0.866, 0); // Derecha
      ctx.lineTo(0, size * 0.5); // Pico inferior
      ctx.lineTo(-size * 0.866, 0); // Izquierda
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // CARA IZQUIERDA (lateral oscuro)
      ctx.fillStyle = ajustarBrillo(color, -0.3);
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.5); // Pico superior
      ctx.lineTo(-size * 0.866, 0); // Izquierda
      ctx.lineTo(-size * 0.866, size); // Izquierda abajo
      ctx.lineTo(0, size * 0.5 + size); // Pico inferior abajo
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // CARA DERECHA (lateral claro)
      ctx.fillStyle = ajustarBrillo(color, -0.15);
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.5); // Pico superior
      ctx.lineTo(size * 0.866, 0); // Derecha
      ctx.lineTo(size * 0.866, size); // Derecha abajo
      ctx.lineTo(0, size * 0.5 + size); // Pico inferior abajo
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Efecto de brillo (material Metal)
      if (estado.material === 'Metal') {
        const gradient = ctx.createLinearGradient(-size * 0.866, 0, size * 0.866, size);
        gradient.addColorStop(0, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0.3)');
        ctx.globalCompositeOperation = 'lighter';

        // Cara derecha con brillo
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.5);
        ctx.lineTo(size * 0.866, 0);
        ctx.lineTo(size * 0.866, size);
        ctx.lineTo(0, size * 0.5 + size);
        ctx.closePath();
        ctx.fill();

        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.restore();

      // Sombra en el suelo
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(200, 320, size * 0.7 * escala, size * 0.3 * escala, 0, 0, Math.PI * 2);
      ctx.fill();

      // Texto de estado
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Color: ${estado.color}`, 10, 20);
      ctx.fillText(`Transparency: ${estado.transparency}`, 10, 35);
      ctx.fillText(`Material: ${estado.material}`, 10, 50);

      if (hover) {
        ctx.fillStyle = '#22C55E';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('¡CLICK PARA INTERACTUAR!', 200, 380);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [estado, rotacion, escala, particulas, hover, clicked, mostrarJugador, jugadorX]);

  return (
    <div className="space-y-4">
      {/* Título explicativo */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <h4 className="text-white font-bold text-lg mb-2">🎮 Simulador de Roblox</h4>
        <p className="text-slate-300 text-sm">
          Este es un <strong>bloque de Roblox</strong> simulado. Cuando escribas código y lo
          ejecutes, vas a ver los cambios acá en tiempo real.
        </p>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="w-full h-full rounded-xl border-2 border-indigo-500/40 cursor-pointer transition-all duration-300 hover:border-indigo-400"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHover(false)}
          onClick={handleClick}
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          }}
        />

        {/* Etiqueta grande */}
        <div className="absolute top-4 left-4 bg-indigo-500 text-white px-3 py-1 rounded-lg text-xs font-bold">
          ⬛ BLOQUE
        </div>

        {/* Controles interactivos */}
        <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
          <div className="text-xs text-slate-400 mb-2 font-bold">PROPIEDADES DEL BLOQUE:</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-slate-400">Color</div>
              <div className="font-mono text-white truncate">{estado.color}</div>
            </div>
            <div>
              <div className="text-slate-400">Opacity</div>
              <div className="font-mono text-white">{(1 - estado.transparency) * 100}%</div>
            </div>
            <div>
              <div className="text-slate-400">Material</div>
              <div className="font-mono text-white">{estado.material}</div>
            </div>
          </div>
        </div>

        {/* Indicador de interactividad */}
        {hover && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-6 py-3 rounded-xl text-base font-bold animate-pulse shadow-2xl">
            👆 ¡CLICK PARA TOCAR EL BLOQUE!
          </div>
        )}

        {mostrarJugador && (
          <div className="absolute bottom-20 left-4 bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-bold">
            👤 JUGADOR
          </div>
        )}
      </div>

      {/* Instrucciones */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <span className="text-amber-400 text-xl">💡</span>
          <div className="text-sm text-amber-200">
            <strong>TIP:</strong> Pasá el mouse sobre el bloque y hacé click para simular que un
            jugador lo toca. Los cambios en tu código se verán acá automáticamente.
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Ajusta el brillo de un color hex
 */
function ajustarBrillo(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const nr = Math.max(0, Math.min(255, r + r * factor));
  const ng = Math.max(0, Math.min(255, g + g * factor));
  const nb = Math.max(0, Math.min(255, b + b * factor));

  return `#${Math.round(nr).toString(16).padStart(2, '0')}${Math.round(ng).toString(16).padStart(2, '0')}${Math.round(nb).toString(16).padStart(2, '0')}`;
}
