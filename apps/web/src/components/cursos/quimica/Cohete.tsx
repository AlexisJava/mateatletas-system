/**
 * COMPONENTE COHETE
 * ==================
 *
 * Muestra el cohete con su medidor de altura y animaciones.
 * Incluye el sistema de partículas para las explosiones químicas.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SistemaParticulas } from '@/lib/quimica/sistema-particulas';
import { IntensidadVisual } from '@/lib/quimica/motor-quimico';

interface CoheteProps {
  altura: number; // Altura actual en cm
  alturaMaxima: number; // Escala máxima del medidor (default 100cm)
  enAnimacion: boolean; // Si está animando una explosión
  intensidad?: IntensidadVisual; // Intensidad de la explosión
  onAnimacionCompleta?: () => void; // Callback cuando termina la animación
}

export default function Cohete({
  altura,
  alturaMaxima = 100,
  enAnimacion,
  intensidad,
  onAnimacionCompleta,
}: CoheteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sistemaRef = useRef<SistemaParticulas | null>(null);
  const [alturaAnimada, setAlturaAnimada] = useState(0);

  // Inicializar sistema de partículas
  useEffect(() => {
    if (canvasRef.current && !sistemaRef.current) {
      sistemaRef.current = new SistemaParticulas(canvasRef.current);
      sistemaRef.current.start();
    }

    return () => {
      if (sistemaRef.current) {
        sistemaRef.current.stop();
      }
    };
  }, []);

  // Animar la subida del medidor
  const animarSubida = useCallback(
    (alturaFinal: number) => {
      const duracion = 2000; // 2 segundos
      const inicio = Date.now();
      const alturaInicial = alturaAnimada;

      const animar = () => {
        const ahora = Date.now();
        const transcurrido = ahora - inicio;
        const progreso = Math.min(transcurrido / duracion, 1);

        // Easing suave (ease-out)
        const factorEasing = 1 - Math.pow(1 - progreso, 3);
        const alturaActual = alturaInicial + (alturaFinal - alturaInicial) * factorEasing;

        setAlturaAnimada(alturaActual);

        if (progreso < 1) {
          requestAnimationFrame(animar);
        } else {
          // Animación completa
          if (onAnimacionCompleta) {
            onAnimacionCompleta();
          }
        }
      };

      requestAnimationFrame(animar);
    },
    [alturaAnimada, onAnimacionCompleta],
  );

  // Manejar animación de explosión
  useEffect(() => {
    if (enAnimacion && sistemaRef.current && intensidad) {
      // Limpiar partículas anteriores
      sistemaRef.current.limpiar();

      // Obtener posición del cohete en el canvas
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const coheteX = rect.width / 2; // Centro horizontal
      const coheteY = rect.height - 50; // Base del cohete

      // Crear explosión
      sistemaRef.current.explosionQuimica(coheteX, coheteY, intensidad);

      // Animar subida de la línea de altura
      animarSubida(altura);

      // Vibración de pantalla si es explosivo
      if (intensidad.shake) {
        document.body.classList.add('shake-animation');
        setTimeout(() => {
          document.body.classList.remove('shake-animation');
        }, 500);
      }
    }
  }, [enAnimacion, intensidad, altura, animarSubida]);

  // Calcular porcentaje para la línea del medidor
  const porcentajeAltura = Math.min((alturaAnimada / alturaMaxima) * 100, 100);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Canvas para partículas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 10 }}
      />

      {/* Contenedor del cohete y medidor */}
      <div className="relative flex items-end gap-8" style={{ height: '500px' }}>
        {/* Medidor de altura */}
        <div className="relative h-full w-16 flex flex-col items-center">
          {/* Marcas del medidor */}
          <div className="relative h-full w-full flex flex-col justify-between">
            {Array.from({ length: 11 }, (_, i) => {
              const valor = alturaMaxima - i * (alturaMaxima / 10);
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-slate-600" />
                  <span className="text-xs text-slate-400 font-mono">{Math.round(valor)}cm</span>
                </div>
              );
            })}
          </div>

          {/* Línea de altura actual */}
          {alturaAnimada > 0 && (
            <div
              className="absolute right-0 left-0 transition-all duration-300"
              style={{
                bottom: `${porcentajeAltura}%`,
                zIndex: 5,
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-lg shadow-cyan-500/50 animate-pulse" />
                <div className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-white text-sm font-bold shadow-lg whitespace-nowrap">
                  {Math.round(alturaAnimada)}cm
                </div>
              </div>
            </div>
          )}
        </div>

        {/* El Cohete */}
        <div
          className="relative flex flex-col items-center transition-transform duration-300 ease-out"
          style={{
            transform: `translateY(-${porcentajeAltura * 4}px)`, // El cohete sube visualmente
          }}
        >
          {/* Cuerpo del cohete */}
          <div className="relative">
            {/* Punta */}
            <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[60px] border-b-red-500 drop-shadow-xl" />

            {/* Cuerpo principal */}
            <div className="w-[80px] h-[120px] bg-gradient-to-b from-red-500 via-red-600 to-red-700 rounded-b-lg shadow-2xl relative">
              {/* Ventana */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br from-cyan-300 to-blue-400 rounded-full border-4 border-white shadow-inner">
                <div className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full opacity-70" />
              </div>

              {/* Detalles */}
              <div className="absolute top-20 left-2 right-2 h-1 bg-yellow-400 rounded" />
              <div className="absolute top-24 left-2 right-2 h-1 bg-yellow-400 rounded" />
            </div>

            {/* Aletas */}
            <div className="absolute bottom-0 -left-6 w-0 h-0 border-t-[50px] border-t-gray-700 border-r-[24px] border-r-transparent drop-shadow-lg" />
            <div className="absolute bottom-0 -right-6 w-0 h-0 border-t-[50px] border-t-gray-700 border-l-[24px] border-l-transparent drop-shadow-lg" />
          </div>

          {/* Llama/Propulsor - SIEMPRE visible, más intensa durante explosión */}
          <div className="mt-2 relative">
            <div
              className={`w-12 h-16 bg-gradient-to-b from-orange-300 via-orange-500 to-red-600 rounded-full blur-sm ${
                enAnimacion ? 'opacity-100 scale-150' : 'opacity-70 scale-100'
              } transition-all duration-300`}
              style={{
                animation: enAnimacion ? 'flameIntense 0.1s infinite' : 'flameIdle 0.5s infinite',
              }}
            />
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-6 h-8 bg-yellow-300 rounded-full ${
                enAnimacion ? 'animate-ping' : 'animate-bounce'
              }`}
            />
            {/* Chispas adicionales durante la explosión */}
            {enAnimacion && (
              <>
                <div className="absolute -top-2 left-0 w-3 h-3 bg-orange-400 rounded-full animate-ping" />
                <div
                  className="absolute -top-2 right-0 w-3 h-3 bg-orange-400 rounded-full animate-ping"
                  style={{ animationDelay: '0.1s' }}
                />
              </>
            )}
          </div>

          {/* Rastro de humo/burbujas */}
          {enAnimacion && (
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-4 h-4 bg-white/30 rounded-full animate-ping"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Efectos de fondo */}
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }
        @keyframes flameIdle {
          0%,
          100% {
            transform: scaleY(1) scaleX(1);
            opacity: 0.7;
          }
          50% {
            transform: scaleY(1.1) scaleX(0.95);
            opacity: 0.9;
          }
        }
        @keyframes flameIntense {
          0%,
          100% {
            transform: scaleY(1.2) scaleX(0.9);
            opacity: 1;
          }
          50% {
            transform: scaleY(1.5) scaleX(1.1);
            opacity: 0.95;
          }
        }
        :global(.shake-animation) {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
}
