'use client';

import { useEffect, useState } from 'react';
import type { LoadingScreenProps } from './types';
import { VARIANT_CONFIGS } from './types';

/**
 * LoadingScreen - Componente de carga unificado y parametrizable
 *
 * Soporta múltiples variantes visuales para diferentes contextos:
 * - admin: Glassmorphism oscuro elegante
 * - docente: Elegante con soporte light/dark
 * - tutor: Minimalista con gradientes cálidos
 * - estudiante: Futurista espacial con efectos de partículas
 * - default: Neutro para uso general
 *
 * @example
 * // Variante admin
 * <LoadingScreen variant="admin" />
 *
 * @example
 * // Con mensaje personalizado
 * <LoadingScreen variant="docente" message="Cargando calendario..." />
 *
 * @example
 * // Sin pantalla completa (para uso en contenedores)
 * <LoadingScreen variant="default" fullScreen={false} />
 */
export function LoadingScreen({
  variant = 'default',
  message,
  subMessage,
  fullScreen = true,
  showBackgroundEffects = true,
}: LoadingScreenProps) {
  const config = VARIANT_CONFIGS[variant];
  const displayMessage = message ?? config.defaultMessage;

  // Variante estudiante tiene su propia implementación especial
  if (variant === 'estudiante') {
    return <EstudianteLoadingScreen message={displayMessage} fullScreen={fullScreen} />;
  }

  const containerClasses = `
    ${fullScreen ? 'min-h-screen' : 'min-h-[400px]'}
    flex items-center justify-center relative overflow-hidden
    ${config.container}
  `;

  return (
    <div className={containerClasses}>
      {/* Efectos de fondo para admin */}
      {showBackgroundEffects && variant === 'admin' && <AdminBackgroundEffects />}

      {/* Contenido principal */}
      <div className={`relative z-10 text-center ${config.card}`}>
        {/* Spinner */}
        <div className={`${config.spinner} mx-auto mb-6`} />

        {/* Mensaje principal */}
        <p className={config.text}>{displayMessage}</p>

        {/* Mensaje secundario */}
        {subMessage && <p className={config.subText}>{subMessage}</p>}
      </div>
    </div>
  );
}

/**
 * Efectos de fondo para la variante admin.
 */
function AdminBackgroundEffects() {
  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black" />
      <div className="fixed top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
    </>
  );
}

/**
 * Variante especial para estudiantes con efectos espaciales.
 * Incluye campo de estrellas, nebulosas y agujero negro animado.
 */
function EstudianteLoadingScreen({
  message,
  fullScreen,
}: {
  message: string;
  fullScreen: boolean;
}) {
  // Generar estrellas solo en cliente para evitar hydration mismatch
  const [stars, setStars] = useState<
    Array<{
      size: number;
      left: number;
      top: number;
      duration: number;
      delay: number;
      opacity: number;
    }>
  >([]);

  useEffect(() => {
    const generatedStars = [...Array(200)].map(() => ({
      size: Math.random() * 3,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
      opacity: Math.random() * 0.8 + 0.2,
    }));
    setStars(generatedStars);
  }, []);

  const containerClasses = `
    ${fullScreen ? 'min-h-screen' : 'min-h-[400px]'}
    relative overflow-hidden flex items-center justify-center bg-black
  `;

  return (
    <div className={containerClasses}>
      {/* CAMPO DE ESTRELLAS */}
      <div className="absolute inset-0">
        {stars.map((star, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              left: `${star.left}%`,
              top: `${star.top}%`,
              animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      {/* NEBULOSAS */}
      <div className="absolute inset-0">
        <div
          className="absolute w-[800px] h-[800px] rounded-full bg-purple-600/10 blur-[120px] -top-40 -left-40 animate-pulse"
          style={{ animationDuration: '8s' }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[100px] -bottom-20 -right-20 animate-pulse"
          style={{ animationDuration: '6s' }}
        />
        <div
          className="absolute w-[700px] h-[700px] rounded-full bg-cyan-600/10 blur-[110px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"
          style={{ animationDuration: '10s' }}
        />
      </div>

      {/* AGUJERO NEGRO */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[400px] h-[400px]">
          {[...Array(8)].map((_, i) => (
            <div
              key={`ring-${i}`}
              className="absolute inset-0 rounded-full border-2"
              style={{
                borderColor: `rgba(100, 200, 255, ${0.3 - i * 0.03})`,
                transform: `scale(${1 - i * 0.12})`,
                animation: `blackHoleRing ${3 + i * 0.5}s linear infinite`,
                animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-black border-4 border-blue-500/50 shadow-[0_0_80px_rgba(59,130,246,0.8)]" />
          </div>
        </div>
      </div>

      {/* TEXTO PRINCIPAL */}
      <div className="relative z-20 text-center px-8">
        <div className="mb-12 relative py-8">
          <h1
            className="relative text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 whitespace-nowrap"
            style={{
              textShadow: '0 0 40px rgba(56, 189, 248, 0.8), 0 0 80px rgba(56, 189, 248, 0.4)',
              animation: 'holographicGlow 3s ease-in-out infinite',
            }}
          >
            MATEATLETAS
          </h1>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="w-full h-1 bg-cyan-400/30 absolute"
              style={{ animation: 'scanLine 3s linear infinite' }}
            />
          </div>
        </div>

        <div className="mb-8">
          <p
            className="text-cyan-300 text-xl md:text-2xl font-mono tracking-wider"
            style={{
              textShadow: '0 0 10px rgba(103, 232, 249, 0.8)',
            }}
          >
            {message}
          </p>
        </div>

        {/* BARRA DE PROGRESO */}
        <div className="w-[90%] max-w-[500px] mx-auto">
          <div className="relative h-2 bg-gray-800/50 rounded-full overflow-hidden border border-cyan-500/30">
            <div className="h-full relative">
              <div
                className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"
                style={{ animation: 'warpProgress 2s ease-in-out infinite' }}
              />
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                style={{ animation: 'shine 2s ease-in-out infinite' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ESTILOS DE ANIMACIÓN */}
      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }
        @keyframes blackHoleRing {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 0.4;
          }
          50% {
            transform: scale(0.8) rotate(180deg);
            opacity: 0.2;
          }
          100% {
            transform: scale(1) rotate(360deg);
            opacity: 0.4;
          }
        }
        @keyframes holographicGlow {
          0%,
          100% {
            filter: brightness(1) contrast(1);
          }
          50% {
            filter: brightness(1.3) contrast(1.2);
          }
        }
        @keyframes scanLine {
          0% {
            top: 0%;
          }
          100% {
            top: 100%;
          }
        }
        @keyframes warpProgress {
          0% {
            width: 0%;
            transform: scaleX(1);
          }
          50% {
            width: 60%;
            transform: scaleX(1.1);
          }
          100% {
            width: 95%;
            transform: scaleX(1);
          }
        }
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}

export default LoadingScreen;
