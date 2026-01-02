'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Clock,
  PlayCircle,
  Loader2,
} from 'lucide-react';
import {
  getContenidoEstudiante,
  type ContenidoCompletoEstudiante,
  type NodoBackend,
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

// Transformar nodos a lista plana de microlecciones (hojas)
interface Leccion {
  id: string;
  titulo: string;
  duracion: string;
  estado: 'completada' | 'en-progreso' | 'disponible' | 'bloqueada';
  orden: number;
}

function extraerMicrolecciones(nodos: NodoBackend[], progresoNodoId: string | null): Leccion[] {
  const lecciones: Leccion[] = [];
  let encontradoActual = false;
  let primeraDisponible = false;

  function recorrer(nodo: NodoBackend) {
    // Si tiene hijos, es un contenedor - recorrer hijos
    if (nodo.hijos && nodo.hijos.length > 0) {
      nodo.hijos.forEach(recorrer);
    } else if (nodo.contenidoJson !== null) {
      // Es una hoja con contenido - es una microlección
      let estado: Leccion['estado'] = 'bloqueada';

      if (progresoNodoId === nodo.id) {
        estado = 'en-progreso';
        encontradoActual = true;
      } else if (!encontradoActual && !primeraDisponible) {
        // Todo lo anterior al actual está completado
        if (progresoNodoId) {
          estado = 'completada';
        } else {
          // Sin progreso, la primera disponible
          estado = 'disponible';
          primeraDisponible = true;
        }
      } else if (encontradoActual && !primeraDisponible) {
        // La siguiente después del actual
        estado = 'disponible';
        primeraDisponible = true;
      }

      lecciones.push({
        id: nodo.id,
        titulo: nodo.titulo,
        duracion: '5 min', // Estimación por defecto
        estado,
        orden: nodo.orden,
      });
    }
  }

  // Ordenar nodos raíz por orden y recorrer
  const nodosOrdenados = [...nodos].sort((a, b) => a.orden - b.orden);
  nodosOrdenados.forEach(recorrer);

  // Si no hay progreso, marcar la primera como disponible y el resto bloqueado
  if (!progresoNodoId && lecciones.length > 0) {
    lecciones[0]!.estado = 'disponible';
  }

  return lecciones;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function CursoPage({
  params,
}: {
  params: Promise<{ categoriaId: string; cursoId: string }>;
}) {
  const { categoriaId, cursoId } = use(params);

  // Estado de datos
  const [contenido, setContenido] = useState<ContenidoCompletoEstudiante | null>(null);
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoria = CATEGORIAS_DATA[categoriaId] ?? CATEGORIA_DEFAULT;

  // Cargar contenido completo
  useEffect(() => {
    const fetchContenido = async () => {
      try {
        setLoading(true);
        const data = await getContenidoEstudiante(cursoId);
        console.log('[CursoPage] Respuesta del backend:', data);

        if (!data) {
          console.error('[CursoPage] Respuesta vacía del backend');
          setError('El curso no devolvió datos.');
          return;
        }

        setContenido(data);

        // Extraer microlecciones del árbol de nodos
        const leccionesExtraidas = extraerMicrolecciones(
          data.nodos ?? [],
          data.progreso?.nodoActualId ?? null,
        );
        setLecciones(leccionesExtraidas);
      } catch (err) {
        console.error('[CursoPage] Error al cargar curso:', err);
        setError('No pudimos cargar el curso. Por favor intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchContenido();
  }, [cursoId]);

  // Calcular stats
  const completadas = lecciones.filter((l) => l.estado === 'completada').length;
  const porcentajeCurso =
    lecciones.length > 0 ? Math.round((completadas / lecciones.length) * 100) : 0;
  const porcentajeCategoria = porcentajeCurso; // Simplificado

  const getEstadoStyles = (estado: Leccion['estado']) => {
    switch (estado) {
      case 'completada':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-400/10',
          border: 'border-emerald-400/30',
          text: 'text-emerald-400',
        };
      case 'en-progreso':
        return {
          icon: <PlayCircle className="w-5 h-5 text-amber-400" />,
          bg: 'bg-amber-400/10',
          border: 'border-amber-400/30',
          text: 'text-amber-400',
        };
      case 'disponible':
        return {
          icon: <BookOpen className="w-5 h-5 text-blue-400" />,
          bg: 'bg-blue-400/10',
          border: 'border-blue-400/30',
          text: 'text-blue-400',
        };
      case 'bloqueada':
        return {
          icon: (
            <div className="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center">
              <span className="text-[10px]">🔒</span>
            </div>
          ),
          bg: 'bg-slate-700/30',
          border: 'border-slate-600/30',
          text: 'text-slate-500',
        };
    }
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
          <p className="text-slate-400">Cargando curso...</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error || !contenido) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😕</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Curso no encontrado</h2>
          <p className="text-slate-400 mb-4">
            {error ?? 'El curso no existe o no está disponible.'}
          </p>
          <Link
            href={`/estudiante/explorar/${categoriaId}`}
            className="text-violet-400 hover:text-violet-300"
          >
            Volver a {categoria.nombre}
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
            href={`/estudiante/explorar/${categoriaId}`}
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
                style={{ height: `${porcentajeCategoria}%` }}
              />
            </div>
            <span className="text-xs text-white/80 mt-2 font-semibold">{porcentajeCategoria}%</span>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 overflow-auto hide-scrollbar p-6">
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-6 flex-wrap">
              <Link href="/estudiante/explorar" className="hover:text-white transition-colors">
                Explorar
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link
                href={`/estudiante/explorar/${categoriaId}`}
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <span>{categoria.icono}</span>
                {categoria.nombre}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className={categoria.textColor}>{contenido.titulo}</span>
            </div>

            {/* Header del curso */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{contenido.titulo}</h1>
              <p className="text-slate-400 mb-4">{contenido.descripcion ?? 'Sin descripción'}</p>

              {/* Barra de progreso */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${categoria.bgSidebar} rounded-full transition-all duration-500`}
                    style={{ width: `${porcentajeCurso}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-white">
                  {completadas}/{lecciones.length} completadas
                </span>
              </div>
            </div>

            {/* Estado vacío */}
            {lecciones.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <p className="text-slate-400">
                  Este curso aún no tiene microlecciones disponibles.
                </p>
              </div>
            )}

            {/* Lista de lecciones */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Microlecciones
              </h3>

              {lecciones.map((leccion, index) => {
                const styles = getEstadoStyles(leccion.estado);
                const isClickable = leccion.estado !== 'bloqueada';

                const content = (
                  <div
                    className={`
                      flex items-center gap-4 p-4 rounded-xl transition-all duration-200
                      ${styles.bg} border ${styles.border}
                      ${isClickable ? 'hover:scale-[1.01] cursor-pointer' : 'opacity-60 cursor-not-allowed'}
                    `}
                  >
                    {/* Número */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        leccion.estado === 'bloqueada'
                          ? 'bg-slate-700 text-slate-500'
                          : `${categoria.bgSidebar} text-white`
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* Icono estado */}
                    {styles.icon}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`font-medium ${leccion.estado === 'bloqueada' ? 'text-slate-400' : 'text-white'}`}
                      >
                        {leccion.titulo}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span className="text-xs text-slate-500">{leccion.duracion}</span>
                      </div>
                    </div>

                    {/* Arrow */}
                    {isClickable && <ChevronRight className={`w-5 h-5 ${styles.text}`} />}
                  </div>
                );

                if (isClickable) {
                  return (
                    <Link
                      key={leccion.id}
                      href={`/estudiante/explorar/${categoriaId}/${cursoId}/${leccion.id}`}
                    >
                      {content}
                    </Link>
                  );
                }

                return <div key={leccion.id}>{content}</div>;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
