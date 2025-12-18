import React, { useRef, useEffect } from 'react';
import { Grafo, SimulationTimeline } from '../types';

interface GraphCanvasProps {
  grafo: Grafo;
  simulation?: SimulationTimeline | null;
  currentTime?: number;
  width?: number;
  height?: number;
  // Manual Mode Props
  manualPath?: string[];
  manualMode?: boolean;
  onNodeClick?: (id: string) => void;
}

const GraphCanvas: React.FC<GraphCanvasProps> = ({
  grafo,
  simulation,
  currentTime = 0,
  width = 800,
  height = 500,
  manualPath = [],
  manualMode = false,
  onNodeClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- COORDINATE SYSTEM ---
    const allX = grafo.nodos.map((n) => n.x);
    const allY = grafo.nodos.map((n) => n.y);
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);

    // Fit to canvas with padding
    const padding = 40;
    const mapW = maxX - minX || 1;
    const mapH = maxY - minY || 1;

    const scaleX = (width - padding * 2) / mapW;
    const scaleY = (height - padding * 2) / mapH;
    const scale = Math.min(scaleX, scaleY); // Uniform scale to preserve aspect ratio

    // Center map
    const offsetX = (width - mapW * scale) / 2 - minX * scale;
    const offsetY = (height - mapH * scale) / 2 - minY * scale;

    const tx = (x: number) => x * scale + offsetX;
    const ty = (y: number) => y * scale + offsetY;

    // --- DRAWING ---
    const render = () => {
      // 1. Clear & Background
      ctx.fillStyle = '#020617'; // Slate 950
      ctx.fillRect(0, 0, width, height);

      // Grid Effect
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 30) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 30) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      const isCyberMode = !!simulation;

      // 2. Draw Edges (Simulation Mode)
      if (isCyberMode && simulation) {
        simulation.edges.forEach((edge) => {
          const n1 = grafo.nodos.find((n) => n.id === edge.from)!;
          const n2 = grafo.nodos.find((n) => n.id === edge.to)!;
          const x1 = tx(n1.x);
          const y1 = ty(n1.y);
          const x2 = tx(n2.x);
          const y2 = ty(n2.y);

          // Base Empty Pipe
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)'; // Dark Slate
          ctx.lineWidth = 2;
          ctx.shadowBlur = 0;
          ctx.stroke();

          // Calculate Progress
          let progress = 0;
          if (currentTime >= edge.endTime) progress = 1;
          else if (currentTime > edge.startTime) {
            progress = (currentTime - edge.startTime) / (edge.endTime - edge.startTime);
          }

          if (progress > 0) {
            // Interpolate End Point
            const curX = x1 + (x2 - x1) * progress;
            const curY = y1 + (y2 - y1) * progress;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(curX, curY);

            // Style
            if (edge.isOptimal && currentTime > simulation.nodes.get(edge.to)!.discoveryTime) {
              // Part of optimal path (fully lit after reached)
              ctx.strokeStyle = '#22d3ee'; // Cyan
              ctx.lineWidth = 4;
              ctx.shadowColor = '#22d3ee';
              ctx.shadowBlur = 10;
            } else {
              // Searching flow
              ctx.strokeStyle = '#a855f7'; // Purple
              ctx.lineWidth = 2;
              ctx.shadowColor = '#a855f7';
              ctx.shadowBlur = 6;
            }
            ctx.stroke();

            // Leading Head Effect (Spark)
            if (progress < 1) {
              ctx.beginPath();
              ctx.arc(curX, curY, 3, 0, Math.PI * 2);
              ctx.fillStyle = '#fff';
              ctx.shadowColor = '#fff';
              ctx.shadowBlur = 15;
              ctx.fill();
            }
          }
        });
      }
      // 2b. Draw Edges (Manual Mode)
      else {
        grafo.aristas.forEach((arista) => {
          const n1 = grafo.nodos.find((n) => n.id === arista.desde)!;
          const n2 = grafo.nodos.find((n) => n.id === arista.hasta)!;
          const x1 = tx(n1.x);
          const y1 = ty(n1.y);
          const x2 = tx(n2.x);
          const y2 = ty(n2.y);

          const isInPath =
            manualPath.includes(n1.id) &&
            manualPath.includes(n2.id) &&
            (manualPath.indexOf(n1.id) === manualPath.indexOf(n2.id) - 1 ||
              manualPath.indexOf(n2.id) === manualPath.indexOf(n1.id) - 1);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);

          if (isInPath) {
            ctx.strokeStyle = '#f472b6'; // Pink
            ctx.lineWidth = 4;
            ctx.shadowColor = '#f472b6';
            ctx.shadowBlur = 12;
          } else {
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 0;
          }
          ctx.stroke();

          // Text Cost - MEJORADO PARA MEJOR VISIBILIDAD
          if (!isCyberMode) {
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;

            // Background circle más grande
            ctx.fillStyle = '#1e293b';
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(mx, my, 14, 0, Math.PI * 2);
            ctx.fill();

            // Border
            ctx.strokeStyle = isInPath ? '#f472b6' : '#475569';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Text más grande y bold
            ctx.fillStyle = isInPath ? '#fff' : '#cbd5e1';
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 3;
            ctx.fillText(arista.costo.toString(), mx, my);
          }
        });
      }

      // 3. Draw Nodes
      grafo.nodos.forEach((node) => {
        const x = tx(node.x);
        const y = ty(node.y);

        let color = '#1e293b';
        let radius = isCyberMode ? 3 : 15;
        let glow = 0;
        let borderColor = '#334155';

        if (simulation) {
          const simNode = simulation.nodes.get(node.id);
          if (simNode && currentTime >= simNode.discoveryTime) {
            // Discovered
            if (simNode.isOptimal) {
              color = '#22d3ee'; // Cyan
              glow = 15;
              radius = 5;
            } else {
              color = '#a855f7'; // Purple
              glow = 5;
              radius = 4;
            }
            // Pop effect when just discovered
            const age = currentTime - simNode.discoveryTime;
            if (age < 5) {
              radius *= 1 + (5 - age) / 5; // Pulse
              glow += 10;
            }
          }
        } else if (manualMode) {
          if (manualPath.includes(node.id)) {
            color = '#f472b6';
            glow = 10;
            borderColor = '#fff';
          }
        }

        if (node.esInicio) {
          color = '#3b82f6';
          glow = 15;
          radius = isCyberMode ? 6 : 18;
        }
        if (node.esDestino) {
          color = '#ef4444';
          glow = 15;
          radius = isCyberMode ? 6 : 18;
        }

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = glow;
        ctx.fill();

        // Border
        if (!isCyberMode) {
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Label/Emoji
        if (!isCyberMode || node.esInicio || node.esDestino) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#fff';
          ctx.font = '20px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.emoji || '', x, y);
        }
      });
    };

    render();
  }, [grafo, simulation, currentTime, width, height, manualPath, manualMode]);

  const handleClick = (e: React.MouseEvent) => {
    if (!onNodeClick) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleXCanvas = canvas.width / rect.width;
    const scaleYCanvas = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleXCanvas;
    const my = (e.clientY - rect.top) * scaleYCanvas;

    // We need reverse transform logic, or just brute force check all nodes
    // Brute force is fine for < 500 nodes
    // Re-calculate transform params locally
    const allX = grafo.nodos.map((n) => n.x);
    const allY = grafo.nodos.map((n) => n.y);
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);
    const padding = 40;
    const mapW = maxX - minX || 1;
    const mapH = maxY - minY || 1;
    const scale = Math.min((width - padding * 2) / mapW, (height - padding * 2) / mapH);
    const offsetX = (width - mapW * scale) / 2 - minX * scale;
    const offsetY = (height - mapH * scale) / 2 - minY * scale;
    const tx = (x: number) => x * scale + offsetX;
    const ty = (y: number) => y * scale + offsetY;

    const hit = grafo.nodos.find((n) => {
      const nx = tx(n.x);
      const ny = ty(n.y);
      const r = manualMode ? 30 : 10;
      return (mx - nx) ** 2 + (my - ny) ** 2 < r ** 2;
    });

    if (hit) onNodeClick(hit.id);
  };

  return (
    <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-black border border-slate-800 bg-slate-950">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleClick}
        className="block w-full h-auto"
      />
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20"></div>
    </div>
  );
};

export default GraphCanvas;
