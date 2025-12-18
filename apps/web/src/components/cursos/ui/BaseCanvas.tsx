/**
 * Canvas base con sistema de coordenadas y utilidades de dibujo
 */

'use client';

import { useEffect, useRef } from 'react';

interface BaseCanvasProps {
  width?: number;
  height?: number;
  className?: string;
  onCanvasReady?: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;
}

export function BaseCanvas({
  width = 600,
  height = 400,
  className = '',
  onCanvasReady,
}: BaseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctxRef.current = ctx;

    // Configurar canvas
    canvas.width = width;
    canvas.height = height;

    // Llamar callback cuando esté listo
    if (onCanvasReady) {
      onCanvasReady(ctx, canvas);
    }
  }, [width, height, onCanvasReady]);

  return (
    <canvas
      ref={canvasRef}
      className={`rounded-lg ${className}`}
      style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
        maxWidth: '100%',
        height: 'auto',
      }}
    />
  );
}

/**
 * Utilidades de dibujo para canvas
 */
export class CanvasUtils {
  /**
   * Dibujar un cuadrado centrado
   */
  static drawSquare(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string,
  ) {
    ctx.fillStyle = color;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);

    // Borde para dar profundidad
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - size / 2, y - size / 2, size, size);
  }

  /**
   * Dibujar un círculo
   */
  static drawCircle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string,
  ) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  /**
   * Limpiar canvas completo
   */
  static clearCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Convertir colores de Roblox a hex
   */
  static robloxColorToHex(colorName: string): string {
    const colors: Record<string, string> = {
      Red: '#EE4444',
      'Bright red': '#EE4444',
      Blue: '#0055FF',
      'Bright blue': '#0055FF',
      Green: '#00AA00',
      'Bright green': '#00AA00',
      Yellow: '#FFEE00',
      'Bright yellow': '#FFEE00',
      White: '#FFFFFF',
      Black: '#1A1A1A',
      Gray: '#808080',
      Grey: '#808080',
      Orange: '#FF8800',
      Purple: '#AA00FF',
      Pink: '#FF00FF',
      'Bright pink': '#FF00FF',
      Brown: '#663300',
      Cyan: '#00FFFF',
    };

    return colors[colorName] || '#FFFFFF';
  }

  /**
   * Dibujar texto con sombra
   */
  static drawText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    options: {
      font?: string;
      color?: string;
      align?: CanvasTextAlign;
      baseline?: CanvasTextBaseline;
      shadow?: boolean;
    } = {},
  ) {
    const {
      font = '14px Arial',
      color = '#FFFFFF',
      align = 'center',
      baseline = 'middle',
      shadow = false,
    } = options;

    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;

    if (shadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }

    ctx.fillText(text, x, y);

    if (shadow) {
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
  }
}
