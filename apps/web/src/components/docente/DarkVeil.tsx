'use client';

import React, { useEffect, useRef } from 'react';

interface DarkVeilProps {
  hueShift?: number;
  noiseIntensity?: number;
  scanlineIntensity?: number;
  speed?: number;
  scanlineFrequency?: number;
  warpAmount?: number;
  resolutionScale?: number;
  className?: string;
}

export const DarkVeil: React.FC<DarkVeilProps> = ({
  hueShift = 25,
  noiseIntensity = 0,
  scanlineIntensity = 0.1,
  speed = 0.8,
  scanlineFrequency = 42,
  warpAmount = 0.6,
  resolutionScale = 1.5,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    let animationFrameId: number;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth * resolutionScale;
        canvas.height = parent.clientHeight * resolutionScale;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      if (!ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      time += speed * 0.01;

      // Clear background with deep dark blue/black
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      // Create Gradient Veil
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      // Dynamic Hue Shift based on time
      const hue = (240 + Math.sin(time * 0.2) * hueShift) % 360;

      gradient.addColorStop(0, `hsla(${hue}, 60%, 5%, 0.8)`);
      gradient.addColorStop(0.5, `hsla(${hue + 40}, 50%, 8%, 0.5)`);
      gradient.addColorStop(1, `hsla(${hue - 20}, 60%, 5%, 0.8)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Warp Lines (Veil Effect)
      ctx.lineWidth = 2;
      const lines = 20;

      for (let i = 0; i < lines; i++) {
        ctx.beginPath();
        const yBase = (i / lines) * h;
        const alpha = ((Math.sin(time + i) + 1) / 2) * 0.1; // Subtle transparency
        ctx.strokeStyle = `rgba(100, 100, 255, ${alpha})`;

        for (let x = 0; x <= w; x += 50) {
          // Warp calculation
          const yOffset = Math.sin(x * 0.005 + time + i) * (warpAmount * 50) * Math.sin(time * 0.5);
          ctx.lineTo(x, yBase + yOffset);
        }
        ctx.stroke();
      }

      // Scanlines
      if (scanlineIntensity > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${scanlineIntensity})`;
        for (let y = 0; y < h; y += 1000 / scanlineFrequency) {
          ctx.fillRect(0, y, w, 2);
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [hueShift, speed, warpAmount, scanlineFrequency, scanlineIntensity, resolutionScale]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
};
