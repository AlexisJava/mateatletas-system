/**
 * Canvas del cuadrado que responde a cambios de color y posición
 */

'use client';

import { useEffect, useRef } from 'react';
import { BaseCanvas, CanvasUtils } from './BaseCanvas';

interface SquareCanvasProps {
  mockState?: any;
  color?: string; // Color directo (para compatibilidad con componente existente)
}

export function SquareCanvas({ mockState, color }: SquareCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    CanvasUtils.clearCanvas(ctx, canvas);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Obtener estado del mock o usar color directo
    let squareColor = color || '#9ca3af'; // Color por defecto

    if (mockState?.cuadrado?.BrickColor) {
      squareColor = CanvasUtils.robloxColorToHex(mockState.cuadrado.BrickColor);
    }

    // Posición (si está disponible en el mock)
    const position = mockState?.cuadrado?.Position || { X: 0, Y: 5, Z: 0 };

    // Convertir posición Roblox a canvas (escala y offset)
    // Roblox usa Y hacia arriba, canvas usa Y hacia abajo
    const x = centerX + position.X * 10; // Escala de 10 píxeles por unidad
    const y = centerY - position.Y * 10; // Y invertido

    // Tamaño del cuadrado
    const size = 100;

    // Dibujar glow/resplandor
    ctx.shadowBlur = 20;
    ctx.shadowColor = squareColor;

    // Dibujar cuadrado
    CanvasUtils.drawSquare(ctx, x, y, size, squareColor);

    // Resetear shadow
    ctx.shadowBlur = 0;

    // Etiqueta del color
    CanvasUtils.drawText(ctx, 'Cuadrado', x, y + size / 2 + 25, {
      font: 'bold 16px Arial',
      color: '#FFFFFF',
      align: 'center',
      shadow: true,
    });
  };

  const handleCanvasReady = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctxRef.current = ctx;
    canvasRef.current = canvas;
    draw(ctx, canvas);
  };

  // Redibujar cuando cambie el mockState o color
  useEffect(() => {
    if (ctxRef.current && canvasRef.current) {
      draw(ctxRef.current, canvasRef.current);
    }
  }, [mockState, color, draw]);

  return <BaseCanvas width={600} height={400} onCanvasReady={handleCanvasReady} />;
}
