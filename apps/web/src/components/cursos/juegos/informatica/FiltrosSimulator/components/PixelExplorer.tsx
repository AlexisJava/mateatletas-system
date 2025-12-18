import React, { useRef, useEffect, useState } from 'react';
import { ImagenData, Pixel } from '../types';
import { renderToCanvas } from '../services/imageProcessing';
import { Crosshair } from 'lucide-react';

interface PixelExplorerProps {
  imagen: ImagenData;
  onPixelHover: (info: { x: number; y: number; pixel: Pixel } | null) => void;
  className?: string;
  showOverlay?: boolean;
}

const PixelExplorer: React.FC<PixelExplorerProps> = ({
  imagen,
  onPixelHover,
  className,
  showOverlay = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      renderToCanvas(canvasRef.current, imagen);
    }
  }, [imagen]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Position relative to canvas element
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCursorPos({ x, y });

    // Calculate integer coordinates on the actual bitmap
    const bitmapX = Math.floor(x * scaleX);
    const bitmapY = Math.floor(y * scaleY);

    if (bitmapX >= 0 && bitmapX < imagen.width && bitmapY >= 0 && bitmapY < imagen.height) {
      onPixelHover({ x: bitmapX, y: bitmapY, pixel: imagen.pixels[bitmapY][bitmapX] });
    }
  };

  const handleMouseLeave = () => {
    onPixelHover(null);
    setCursorPos(null);
  };

  return (
    <div ref={containerRef} className={`relative group ${className}`}>
      {/* High-tech Frame Glow */}
      <div className="absolute -inset-[2px] bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-cyan-500/50 rounded-xl opacity-70 blur-[2px] group-hover:opacity-100 transition-opacity"></div>

      <div className="relative rounded-xl overflow-hidden bg-slate-900 shadow-2xl">
        {/* Top Bar Decoration */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-black/40 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-3 z-10 pointer-events-none">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
          </div>
          <div className="text-[10px] text-cyan-400 font-mono tracking-wider">IMG_DATA_STREAM</div>
        </div>

        <canvas
          ref={canvasRef}
          className="w-full h-auto cursor-none block touch-none mt-8" // margin-top for top bar
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />

        {/* Dynamic Cursor Overlay */}
        {showOverlay && cursorPos && (
          <div
            className="absolute pointer-events-none z-20"
            style={{
              left: 0,
              top: '32px', // Matches mt-8 of canvas
              transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)`,
            }}
          >
            {/* Center Crosshair */}
            <div className="absolute -translate-x-1/2 -translate-y-1/2 text-cyan-400 drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]">
              <Crosshair className="w-6 h-6 animate-[spin_4s_linear_infinite]" />
            </div>

            {/* Targeting Ring */}
            <div className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-cyan-400/50 rounded-full bg-cyan-400/5"></div>

            {/* Full screen cross lines (clipped by overflow-hidden parent) */}
            <div className="absolute top-0 left-0 -translate-x-1/2 w-[1px] h-[2000px] -translate-y-[1000px] bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent opacity-50"></div>
            <div className="absolute top-0 left-0 -translate-y-1/2 h-[1px] w-[2000px] -translate-x-[1000px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-50"></div>

            {/* Coordinate Tooltip floating near cursor */}
            <div className="absolute left-6 top-6 bg-black/80 text-[10px] font-mono text-cyan-400 px-2 py-1 rounded border border-cyan-500/30 whitespace-nowrap">
              X:{Math.round(cursorPos.x)} Y:{Math.round(cursorPos.y)}
            </div>
          </div>
        )}

        {/* Corner decorations */}
        <div className="absolute bottom-0 right-0 p-2 pointer-events-none">
          <div className="border-r-2 border-b-2 border-cyan-500/50 w-4 h-4 rounded-br"></div>
        </div>
        <div className="absolute bottom-0 left-0 p-2 pointer-events-none">
          <div className="border-l-2 border-b-2 border-cyan-500/50 w-4 h-4 rounded-bl"></div>
        </div>
      </div>
    </div>
  );
};

export default PixelExplorer;
