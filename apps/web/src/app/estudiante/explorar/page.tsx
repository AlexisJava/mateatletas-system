'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Compass, ChevronRight, BookOpen, Trophy, Loader2 } from 'lucide-react';
import { animate, stagger } from 'animejs';
import {
  getContenidosEstudiante,
  type ContenidoEstudiante,
  type MundoTipo,
} from '@/lib/api/contenidos.api';

// ============================================================================
// TIPOS Y CONSTANTES
// ============================================================================

interface Categoria {
  id: string;
  mundoTipo: MundoTipo;
  nombre: string;
  icono: string;
  gradiente: string;
  bgSidebar: string;
  descripcion: string;
  colorPrimario: string;
  mundoNombre: string;
}

// Categorías base (fijas - mapean a MundoTipo)
const CATEGORIAS_BASE: Categoria[] = [
  {
    id: 'matematica',
    mundoTipo: 'MATEMATICA',
    nombre: 'Matemática',
    icono: '📐',
    gradiente: 'from-blue-500 to-blue-700',
    bgSidebar: 'bg-blue-600',
    descripcion: 'Números, álgebra, geometría y más',
    colorPrimario: '#3b82f6',
    mundoNombre: 'MUNDO MATEMÁTICA',
  },
  {
    id: 'programacion',
    mundoTipo: 'PROGRAMACION',
    nombre: 'Programación',
    icono: '💻',
    gradiente: 'from-green-500 to-emerald-600',
    bgSidebar: 'bg-green-600',
    descripcion: 'Lógica, Scratch, Python y más',
    colorPrimario: '#22c55e',
    mundoNombre: 'MUNDO PROGRAMACIÓN',
  },
  {
    id: 'ciencias',
    mundoTipo: 'CIENCIAS',
    nombre: 'Ciencias',
    icono: '🔬',
    gradiente: 'from-purple-500 to-violet-600',
    bgSidebar: 'bg-purple-600',
    descripcion: 'Universo, biología, química y más',
    colorPrimario: '#a855f7',
    mundoNombre: 'MUNDO CIENCIAS',
  },
];

interface CategoriaConStats extends Categoria {
  cursosCount: number;
  progresoTotal: number;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ExplorarPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const transitionOverlayRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaConStats | null>(null);

  // Estado de datos
  const [categorias, setCategorias] = useState<CategoriaConStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar contenidos y calcular estadísticas por categoría
  useEffect(() => {
    const fetchContenidos = async () => {
      try {
        setLoading(true);
        const contenidos = await getContenidosEstudiante();

        // Agrupar contenidos por mundoTipo
        const contenidosPorMundo = new Map<MundoTipo, ContenidoEstudiante[]>();
        contenidos.forEach((c) => {
          const lista = contenidosPorMundo.get(c.mundoTipo) ?? [];
          lista.push(c);
          contenidosPorMundo.set(c.mundoTipo, lista);
        });

        // Calcular stats para cada categoría
        const categoriasConStats: CategoriaConStats[] = CATEGORIAS_BASE.map((cat) => {
          const contenidosMundo = contenidosPorMundo.get(cat.mundoTipo) ?? [];
          const cursosCount = contenidosMundo.length;

          // Calcular progreso: contenidos completados / total
          const completados = contenidosMundo.filter((c) => c.progreso?.completado).length;
          const progresoTotal = cursosCount > 0 ? Math.round((completados / cursosCount) * 100) : 0;

          return {
            ...cat,
            cursosCount,
            progresoTotal,
          };
        });

        setCategorias(categoriasConStats);
      } catch {
        setError('No pudimos cargar los contenidos. Por favor intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchContenidos();
  }, []);

  // Calcular estadísticas generales
  const totalCursos = categorias.reduce((acc, cat) => acc + cat.cursosCount, 0);
  const promedioProgreso =
    categorias.length > 0
      ? Math.round(categorias.reduce((acc, cat) => acc + cat.progresoTotal, 0) / categorias.length)
      : 0;

  // Animación de entrada al montar (solo cuando hay datos)
  useEffect(() => {
    if (loading || categorias.length === 0) return;

    const cards = containerRef.current?.querySelectorAll('.categoria-card');
    if (cards) {
      animate(cards, {
        opacity: [0, 1],
        translateY: [40, 0],
        scale: [0.9, 1],
        delay: stagger(100, { start: 200 }),
        duration: 600,
        ease: 'outExpo',
      });
    }

    // Animar header
    animate('.header-animate', {
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 500,
      ease: 'outQuad',
    });

    // Animar stats
    animate('.stats-animate', {
      opacity: [0, 1],
      translateX: [-20, 0],
      delay: stagger(100, { start: 300 }),
      duration: 400,
      ease: 'outQuad',
    });
  }, [loading, categorias.length]);

  const handleCategoriaClick = (
    e: React.MouseEvent<HTMLDivElement>,
    categoria: CategoriaConStats,
  ) => {
    e.preventDefault();
    if (isTransitioning) return;

    setIsTransitioning(true);
    setSelectedCategoria(categoria);

    const overlay = transitionOverlayRef.current;
    if (!overlay) return;

    // Mostrar overlay con fade in
    overlay.style.display = 'flex';

    // Fade out de todas las cards
    const cards = containerRef.current?.querySelectorAll('.categoria-card');
    cards?.forEach((card) => {
      animate(card, {
        opacity: [1, 0],
        scale: [1, 0.9],
        duration: 400,
        ease: 'inQuad',
      });
    });

    // Fade out del header y stats
    animate('.main-content', {
      opacity: [1, 0],
      duration: 400,
      ease: 'inQuad',
    });

    // Animar el overlay entrando
    animate(overlay, {
      opacity: [0, 1],
      duration: 400,
      ease: 'outQuad',
    });

    // Animar el icono (aparece primero, grande y rebotando)
    setTimeout(() => {
      animate('.transition-icon', {
        scale: [0, 1.2, 1],
        opacity: [0, 1],
        duration: 600,
        ease: 'outBack',
      });
    }, 200);

    // Animar el título "MUNDO X" letra por letra
    setTimeout(() => {
      const letters = overlay.querySelectorAll('.mundo-letter');
      animate(letters, {
        opacity: [0, 1],
        translateY: [30, 0],
        rotateX: [90, 0],
        delay: stagger(50),
        duration: 400,
        ease: 'outExpo',
      });
    }, 500);

    // Crear partículas decorativas
    setTimeout(() => {
      createFloatingParticles(categoria.colorPrimario);
    }, 600);

    // Después de mostrar el título, hacer la transición hacia el sidebar
    setTimeout(() => {
      // Mover todo hacia la izquierda (hacia donde estará el sidebar)
      animate('.transition-content', {
        translateX: [0, '-45vw'],
        scale: [1, 0.3],
        opacity: [1, 0],
        duration: 800,
        ease: 'inQuart',
      });

      // El fondo se contrae hacia el sidebar
      animate(overlay, {
        opacity: [1, 0],
        duration: 600,
        delay: 200,
        ease: 'inQuad',
        onComplete: () => {
          router.push(`/estudiante/explorar/${categoria.id}`);
        },
      });
    }, 1800);
  };

  const createFloatingParticles = (color: string) => {
    const particleCount = 20;
    const overlay = transitionOverlayRef.current;
    if (!overlay) return;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const size = 4 + Math.random() * 8;
      const startX = Math.random() * window.innerWidth;
      const startY = window.innerHeight + 50;

      particle.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        left: ${startX}px;
        top: ${startY}px;
        box-shadow: 0 0 ${size * 2}px ${color};
        opacity: 0.8;
      `;
      document.body.appendChild(particle);

      animate(particle, {
        translateY: -(window.innerHeight + 100 + Math.random() * 200),
        translateX: (Math.random() - 0.5) * 200,
        scale: [1, 0],
        opacity: [0.8, 0],
        duration: 1500 + Math.random() * 1000,
        delay: Math.random() * 400,
        ease: 'outQuad',
        onComplete: () => particle.remove(),
      });
    }
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
          <p className="text-slate-400">Cargando mundos...</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😕</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Algo salió mal</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white relative overflow-hidden">
      {/* Overlay de transición con el nombre del mundo */}
      <div
        ref={transitionOverlayRef}
        className="fixed inset-0 z-50 items-center justify-center hidden"
        style={{
          background: selectedCategoria
            ? `radial-gradient(circle at center, ${selectedCategoria.colorPrimario}40 0%, #0a0a1a 70%)`
            : '#0a0a1a',
        }}
      >
        <div className="transition-content flex flex-col items-center justify-center">
          {/* Icono grande */}
          <div
            className="transition-icon text-8xl md:text-9xl mb-6"
            style={{ opacity: 0, filter: 'drop-shadow(0 0 30px currentColor)' }}
          >
            {selectedCategoria?.icono}
          </div>

          {/* Título MUNDO X con letras individuales */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-wider">
            {selectedCategoria?.mundoNombre.split('').map((letter, index) => (
              <span
                key={index}
                className="mundo-letter inline-block"
                style={{
                  opacity: 0,
                  color: letter === ' ' ? 'transparent' : 'white',
                  textShadow: `0 0 20px ${selectedCategoria?.colorPrimario}, 0 0 40px ${selectedCategoria?.colorPrimario}50`,
                  minWidth: letter === ' ' ? '0.5em' : 'auto',
                }}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </span>
            ))}
          </h1>

          {/* Línea decorativa */}
          <div
            className="mt-6 h-1 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${selectedCategoria?.colorPrimario}, transparent)`,
              width: '200px',
            }}
          />
        </div>
      </div>

      {/* Starfield background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="stars-layer stars-small" />
        <div className="stars-layer stars-medium" />
        <div className="stars-layer stars-large" />
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/10 via-transparent to-purple-950/10" />
      </div>

      <style jsx>{`
        .stars-layer {
          position: absolute;
          inset: 0;
          background-repeat: repeat;
          animation: twinkle 8s ease-in-out infinite;
        }
        .stars-small {
          background-image:
            radial-gradient(1px 1px at 20px 30px, white, transparent),
            radial-gradient(1px 1px at 40px 70px, rgba(255, 255, 255, 0.8), transparent),
            radial-gradient(1px 1px at 50px 160px, rgba(255, 255, 255, 0.6), transparent),
            radial-gradient(1px 1px at 90px 40px, white, transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(255, 255, 255, 0.7), transparent),
            radial-gradient(1px 1px at 160px 120px, white, transparent);
          background-size: 320px 200px;
          opacity: 0.4;
        }
        .stars-medium {
          background-image:
            radial-gradient(1.5px 1.5px at 100px 50px, white, transparent),
            radial-gradient(1.5px 1.5px at 200px 150px, rgba(255, 255, 255, 0.9), transparent),
            radial-gradient(1.5px 1.5px at 300px 100px, white, transparent);
          background-size: 400px 220px;
          opacity: 0.3;
          animation-delay: 2s;
          animation-duration: 10s;
        }
        .stars-large {
          background-image:
            radial-gradient(2px 2px at 150px 80px, rgba(167, 139, 250, 0.8), transparent),
            radial-gradient(2px 2px at 350px 200px, rgba(139, 92, 246, 0.7), transparent);
          background-size: 500px 280px;
          opacity: 0.5;
          animation-delay: 4s;
          animation-duration: 12s;
        }
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="relative z-10 p-4 md:p-6 lg:p-8 hide-scrollbar overflow-auto h-screen main-content">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div
            className="flex items-center justify-between mb-6 header-animate"
            style={{ opacity: 0 }}
          >
            <Link
              href="/estudiante"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
          </div>

          {/* Title Section */}
          <div className="flex items-center gap-4 mb-8 header-animate" style={{ opacity: 0 }}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Compass className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black">Explorar Mundos</h1>
              <p className="text-slate-400 text-sm">Elige un mundo para comenzar tu aventura</p>
            </div>
          </div>

          {/* Stats rápidas */}
          <div className="flex gap-4 mb-8">
            <div
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50 stats-animate"
              style={{ opacity: 0 }}
            >
              <BookOpen className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-slate-300">{totalCursos} cursos</span>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50 stats-animate"
              style={{ opacity: 0 }}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-slate-300">{promedioProgreso}% completado</span>
            </div>
          </div>

          {/* Estado vacío */}
          {categorias.length > 0 && totalCursos === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🚀</span>
              </div>
              <h2 className="text-xl font-bold mb-2">¡Próximamente!</h2>
              <p className="text-slate-400 max-w-md mx-auto">
                Estamos preparando contenido increíble para ti. Vuelve pronto para explorar los
                mundos.
              </p>
            </div>
          )}

          {/* Categorías Grid */}
          <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categorias.map((categoria) => (
              <CategoriaCard
                key={categoria.id}
                categoria={categoria}
                onSelect={handleCategoriaClick}
                disabled={isTransitioning}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTES
// ============================================================================

interface CategoriaCardProps {
  categoria: CategoriaConStats;
  onSelect: (e: React.MouseEvent<HTMLDivElement>, categoria: CategoriaConStats) => void;
  disabled: boolean;
}

function CategoriaCard({ categoria, onSelect, disabled }: CategoriaCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Animar barra de progreso al hacer hover
  useEffect(() => {
    if (isHovered && progressRef.current) {
      animate(progressRef.current, {
        width: [
          `${categoria.progresoTotal}%`,
          `${Math.min(categoria.progresoTotal + 5, 100)}%`,
          `${categoria.progresoTotal}%`,
        ],
        duration: 600,
        ease: 'inOutQuad',
      });
    }
  }, [isHovered, categoria.progresoTotal]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !cardRef.current) return;
    onSelect(e, categoria);
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    setIsHovered(true);

    if (cardRef.current) {
      // Efecto de brillo sutil
      const glowEl = cardRef.current.querySelector('.glow-effect');
      if (glowEl) {
        animate(glowEl, {
          opacity: [0, 0.6],
          duration: 300,
          ease: 'outQuad',
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);

    if (cardRef.current) {
      const glowEl = cardRef.current.querySelector('.glow-effect');
      if (glowEl) {
        animate(glowEl, {
          opacity: [0.6, 0],
          duration: 300,
          ease: 'outQuad',
        });
      }
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        categoria-card
        group relative overflow-hidden rounded-2xl
        bg-gradient-to-br ${categoria.gradiente}
        p-6 min-h-[220px]
        cursor-pointer
        transition-shadow duration-300
        hover:shadow-2xl
      `}
      style={{ opacity: 0 }}
    >
      {/* Glow effect */}
      <div
        className={`glow-effect absolute inset-0 bg-gradient-to-br ${categoria.gradiente} blur-xl`}
        style={{ opacity: 0 }}
      />

      {/* Shimmer effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          animation: isHovered ? 'shimmer 1.5s infinite' : 'none',
        }}
      />

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Icono grande */}
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
          {categoria.icono}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">{categoria.nombre}</h3>
          <p className="text-sm text-white/70">{categoria.descripcion}</p>
        </div>

        {/* Footer stats */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
          <span className="text-sm text-white/80">{categoria.cursosCount} cursos</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                ref={progressRef}
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${categoria.progresoTotal}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-white">{categoria.progresoTotal}%</span>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
          <ChevronRight className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}
