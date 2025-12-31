'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
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
  borderColor: string;
  textColor: string;
}

// Mapeo categoría ID → datos de UI
const CATEGORIAS_DATA: Record<string, Categoria> = {
  matematica: {
    id: 'matematica',
    mundoTipo: 'MATEMATICA',
    nombre: 'Matemática',
    icono: '📐',
    gradiente: 'from-blue-500 to-blue-700',
    bgSidebar: 'bg-blue-600',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
  },
  programacion: {
    id: 'programacion',
    mundoTipo: 'PROGRAMACION',
    nombre: 'Programación',
    icono: '💻',
    gradiente: 'from-green-500 to-emerald-600',
    bgSidebar: 'bg-green-600',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-400',
  },
  ciencias: {
    id: 'ciencias',
    mundoTipo: 'CIENCIAS',
    nombre: 'Ciencias',
    icono: '🔬',
    gradiente: 'from-purple-500 to-violet-600',
    bgSidebar: 'bg-purple-600',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
  },
};

const CATEGORIA_DEFAULT: Categoria = {
  id: 'default',
  mundoTipo: 'MATEMATICA',
  nombre: 'Categoría',
  icono: '📚',
  gradiente: 'from-slate-500 to-slate-600',
  bgSidebar: 'bg-slate-600',
  borderColor: 'border-slate-500/30',
  textColor: 'text-slate-400',
};

// Transformar ContenidoEstudiante → formato UI de Curso
interface CursoUI {
  id: string;
  nombre: string;
  descripcion: string;
  totalLecciones: number;
  completadas: number;
}

function transformarACurso(contenido: ContenidoEstudiante): CursoUI {
  return {
    id: contenido.id,
    nombre: contenido.titulo,
    descripcion: contenido.descripcion ?? 'Sin descripción',
    totalLecciones: contenido._count.nodos,
    completadas: contenido.progreso?.completado ? contenido._count.nodos : 0,
  };
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function CategoriaPage({ params }: { params: Promise<{ categoriaId: string }> }) {
  const { categoriaId } = use(params);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string | null>(null);

  // Estado de datos
  const [cursos, setCursos] = useState<CursoUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoria = CATEGORIAS_DATA[categoriaId] ?? CATEGORIA_DEFAULT;

  // Cargar contenidos del mundo
  useEffect(() => {
    const fetchContenidos = async () => {
      try {
        setLoading(true);
        const contenidos = await getContenidosEstudiante(categoria.mundoTipo);
        setCursos(contenidos.map(transformarACurso));
      } catch {
        setError('No pudimos cargar los cursos. Por favor intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchContenidos();
  }, [categoria.mundoTipo]);

  // Calcular stats de la categoría
  const totalLecciones = cursos.reduce((acc, c) => acc + c.totalLecciones, 0);
  const completadas = cursos.reduce((acc, c) => acc + c.completadas, 0);
  const porcentajeTotal = totalLecciones > 0 ? Math.round((completadas / totalLecciones) * 100) : 0;

  // Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
          <p className="text-slate-400">Cargando cursos...</p>
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
          <Link
            href="/estudiante/explorar"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors inline-block"
          >
            Volver a Explorar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white relative overflow-hidden">
      {/* Starfield background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="stars-layer stars-small" />
        <div className="stars-layer stars-medium" />
        <div className="stars-layer stars-large" />
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
            radial-gradient(1px 1px at 90px 40px, white, transparent);
          background-size: 320px 200px;
          opacity: 0.4;
        }
        .stars-medium {
          background-image:
            radial-gradient(1.5px 1.5px at 100px 50px, white, transparent),
            radial-gradient(1.5px 1.5px at 200px 150px, rgba(255, 255, 255, 0.9), transparent);
          background-size: 400px 220px;
          opacity: 0.3;
          animation-delay: 2s;
          animation-duration: 10s;
        }
        .stars-large {
          background-image: radial-gradient(
            2px 2px at 150px 80px,
            rgba(167, 139, 250, 0.8),
            transparent
          );
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

      <div className="relative z-10 flex h-screen">
        {/* Sidebar izquierdo - Categoría */}
        <div
          className={`w-16 md:w-20 ${categoria.bgSidebar} flex flex-col items-center py-6 transition-all duration-300`}
        >
          {/* Botón volver */}
          <Link
            href="/estudiante/explorar"
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>

          {/* Icono categoría */}
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl mb-2">
            {categoria.icono}
          </div>
          <span className="text-[10px] text-white/80 font-medium text-center hidden md:block">
            {categoria.nombre}
          </span>

          {/* Progreso vertical */}
          <div className="flex-1 flex flex-col items-center justify-center mt-6">
            <div className="w-2 h-32 bg-white/20 rounded-full overflow-hidden">
              <div
                className="w-full bg-white rounded-full transition-all duration-500"
                style={{ height: `${porcentajeTotal}%` }}
              />
            </div>
            <span className="text-xs text-white/80 mt-2 font-semibold">{porcentajeTotal}%</span>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Lista de cursos */}
          <div className="w-full md:w-80 lg:w-96 bg-slate-900/50 border-r border-slate-700/50 overflow-auto hide-scrollbar">
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50">
              <h1 className="text-xl font-bold text-white mb-1">Cursos de {categoria.nombre}</h1>
              <p className="text-sm text-slate-400">
                {completadas}/{totalLecciones} lecciones completadas
              </p>
            </div>

            {/* Estado vacío */}
            {cursos.length === 0 && (
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <p className="text-slate-400">
                  Próximamente habrá cursos de {categoria.nombre} disponibles.
                </p>
              </div>
            )}

            {/* Lista */}
            <div className="p-3 space-y-2">
              {cursos.map((curso) => {
                const porcentaje =
                  curso.totalLecciones > 0
                    ? Math.round((curso.completadas / curso.totalLecciones) * 100)
                    : 0;
                const isSelected = cursoSeleccionado === curso.id;
                const isCompleto =
                  curso.completadas === curso.totalLecciones && curso.totalLecciones > 0;

                return (
                  <button
                    key={curso.id}
                    onClick={() => setCursoSeleccionado(curso.id)}
                    className={`
                      w-full text-left p-4 rounded-xl transition-all duration-200
                      ${
                        isSelected
                          ? `bg-gradient-to-r ${categoria.gradiente} shadow-lg`
                          : 'bg-slate-800/50 hover:bg-slate-700/50'
                      }
                      ${isSelected ? '' : `border ${categoria.borderColor}`}
                    `}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {isCompleto && (
                            <CheckCircle2
                              className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-400'}`}
                            />
                          )}
                          <h3
                            className={`font-semibold ${isSelected ? 'text-white' : 'text-white'}`}
                          >
                            {curso.nombre}
                          </h3>
                        </div>
                        <p
                          className={`text-sm mt-1 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}
                        >
                          {curso.descripcion}
                        </p>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`}
                      />
                    </div>

                    {/* Progress */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex-1 h-1.5 rounded-full ${isSelected ? 'bg-white/30' : 'bg-slate-700'}`}
                      >
                        <div
                          className={`h-full rounded-full ${isSelected ? 'bg-white' : categoria.bgSidebar}`}
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-slate-400'}`}
                      >
                        {curso.completadas}/{curso.totalLecciones}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel derecho - Detalle del curso */}
          <div className="flex-1 overflow-auto hide-scrollbar p-6">
            {cursoSeleccionado ? (
              <CursoDetallePanel
                cursoId={cursoSeleccionado}
                curso={cursos.find((c) => c.id === cursoSeleccionado)!}
                categoriaId={categoriaId}
                categoria={categoria}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${categoria.gradiente} flex items-center justify-center text-4xl mb-4`}
                >
                  {categoria.icono}
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Selecciona un curso</h2>
                <p className="text-slate-400 max-w-sm">
                  Elige un curso de la lista para ver sus lecciones y comenzar a aprender
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE DETALLE DEL CURSO (Preview)
// ============================================================================

function CursoDetallePanel({
  cursoId,
  curso,
  categoriaId,
  categoria,
}: {
  cursoId: string;
  curso: CursoUI;
  categoriaId: string;
  categoria: Categoria;
}) {
  const porcentaje =
    curso.totalLecciones > 0 ? Math.round((curso.completadas / curso.totalLecciones) * 100) : 0;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header del curso */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
          <span>{categoria.icono}</span>
          <span>{categoria.nombre}</span>
          <ChevronRight className="w-4 h-4" />
          <span className={categoria.textColor}>{curso.nombre}</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{curso.nombre}</h2>
        <p className="text-slate-400">{curso.descripcion}</p>

        {/* Barra de progreso */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${categoria.bgSidebar} rounded-full transition-all duration-500`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-white">{porcentaje}%</span>
        </div>
      </div>

      {/* Info y CTA */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-slate-400">Microlecciones</p>
            <p className="text-2xl font-bold text-white">{curso.totalLecciones}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Completadas</p>
            <p className="text-2xl font-bold text-emerald-400">{curso.completadas}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Progreso</p>
            <p className="text-2xl font-bold text-violet-400">{porcentaje}%</p>
          </div>
        </div>

        <Link
          href={`/estudiante/explorar/${categoriaId}/${cursoId}`}
          className={`
            w-full py-3 rounded-xl font-bold text-center
            ${categoria.bgSidebar}
            hover:opacity-90 transition-opacity
            flex items-center justify-center gap-2
          `}
        >
          {curso.completadas === 0 ? 'Comenzar curso' : 'Continuar aprendiendo'}
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
