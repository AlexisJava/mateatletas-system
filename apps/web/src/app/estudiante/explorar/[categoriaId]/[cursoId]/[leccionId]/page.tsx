'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  BookOpen,
  Trophy,
  PlayCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  getContenidoEstudiante,
  updateProgresoEstudiante,
  type NodoBackend,
  type MundoTipo,
} from '@/lib/api/contenidos.api';
import { LessonRenderer, HOUSE_COLORS, type HouseColors } from '@/components/lesson-renderer';

// ============================================================================
// TYPES
// ============================================================================

interface Categoria {
  id: string;
  nombre: string;
  icono: string;
  bgSidebar: string;
  textColor: string;
  mundoTipo: MundoTipo;
  houseColors: HouseColors;
}

interface LeccionUI {
  id: string;
  titulo: string;
  contenidoJson: string;
  estado: 'completada' | 'en-progreso' | 'disponible' | 'bloqueada';
  orden: number;
}

// ============================================================================
// MAPEO CATEGORÍAS
// ============================================================================

const categoriasData: Record<string, Categoria> = {
  matematica: {
    id: 'matematica',
    nombre: 'Matemática',
    icono: '📐',
    bgSidebar: 'bg-blue-600',
    textColor: 'text-blue-400',
    mundoTipo: 'MATEMATICA',
    houseColors: {
      primary: '#3B82F6',
      secondary: '#2563EB',
      accent: '#93C5FD',
    },
  },
  programacion: {
    id: 'programacion',
    nombre: 'Programación',
    icono: '💻',
    bgSidebar: 'bg-green-600',
    textColor: 'text-green-400',
    mundoTipo: 'PROGRAMACION',
    houseColors: {
      primary: '#22C55E',
      secondary: '#16A34A',
      accent: '#86EFAC',
    },
  },
  ciencias: {
    id: 'ciencias',
    nombre: 'Ciencias',
    icono: '🔬',
    bgSidebar: 'bg-purple-600',
    textColor: 'text-purple-400',
    mundoTipo: 'CIENCIAS',
    houseColors: {
      primary: '#A855F7',
      secondary: '#9333EA',
      accent: '#D8B4FE',
    },
  },
};

const categoriaDefault: Categoria = {
  id: 'default',
  nombre: 'Categoría',
  icono: '📚',
  bgSidebar: 'bg-slate-600',
  textColor: 'text-slate-400',
  mundoTipo: 'MATEMATICA',
  houseColors: HOUSE_COLORS.QUANTUM ?? {
    primary: '#F472B6',
    secondary: '#EC4899',
    accent: '#FBCFE8',
  },
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Extrae todos los nodos hoja (microlecciones) del árbol de nodos
 * y determina su estado basado en el progreso
 */
function extraerLecciones(nodos: NodoBackend[], progresoNodoId: string | null): LeccionUI[] {
  const lecciones: LeccionUI[] = [];
  let encontradoActual = false;
  let primeraDisponible = false;

  function recorrer(nodo: NodoBackend) {
    // Si tiene hijos, es contenedor - recursar
    if (nodo.hijos && nodo.hijos.length > 0) {
      // Ordenar hijos por orden
      const hijosOrdenados = [...nodo.hijos].sort((a, b) => a.orden - b.orden);
      hijosOrdenados.forEach(recorrer);
    } else if (nodo.contenidoJson !== null && !nodo.bloqueado) {
      // Es nodo hoja con contenido - es una microlección
      let estado: LeccionUI['estado'] = 'bloqueada';

      if (progresoNodoId === nodo.id) {
        // Este es el nodo actual (en progreso)
        estado = 'en-progreso';
        encontradoActual = true;
      } else if (!encontradoActual) {
        // Aún no llegamos al actual, significa que está completado
        // O si no hay progreso, la primera es disponible
        if (progresoNodoId === null && !primeraDisponible) {
          estado = 'disponible';
          primeraDisponible = true;
        } else if (progresoNodoId !== null) {
          estado = 'completada';
        }
      } else {
        // Ya pasamos el actual
        // La siguiente inmediata es disponible, el resto bloqueadas
        if (!primeraDisponible) {
          estado = 'disponible';
          primeraDisponible = true;
        } else {
          estado = 'bloqueada';
        }
      }

      lecciones.push({
        id: nodo.id,
        titulo: nodo.titulo,
        contenidoJson: nodo.contenidoJson,
        estado,
        orden: nodo.orden,
      });
    }
  }

  // Procesar nodos raíz ordenados
  const nodosOrdenados = [...nodos].sort((a, b) => a.orden - b.orden);
  nodosOrdenados.forEach(recorrer);

  return lecciones;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function LeccionPage({
  params,
}: {
  params: Promise<{ categoriaId: string; cursoId: string; leccionId: string }>;
}) {
  const { categoriaId, cursoId, leccionId } = use(params);

  const [lecciones, setLecciones] = useState<LeccionUI[]>([]);
  const [cursoNombre, setCursoNombre] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completando, setCompletando] = useState(false);
  const [completadaLocal, setCompletadaLocal] = useState(false);

  const categoria = categoriasData[categoriaId] || categoriaDefault;

  // Cargar datos del contenido
  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const contenido = await getContenidoEstudiante(cursoId);
      setCursoNombre(contenido.titulo);

      const progresoNodoId = contenido.progreso?.nodoActualId || null;
      const leccionesExtraidas = extraerLecciones(contenido.nodos, progresoNodoId);
      setLecciones(leccionesExtraidas);
    } catch (err) {
      console.error('Error cargando lección:', err);
      setError('Error al cargar la lección');
    } finally {
      setLoading(false);
    }
  }, [cursoId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Encontrar la lección actual
  const leccionActual = lecciones.find((l) => l.id === leccionId);
  const currentIndex = lecciones.findIndex((l) => l.id === leccionId);
  const anteriorLeccion = currentIndex > 0 ? lecciones[currentIndex - 1] : null;
  const siguienteLeccion = currentIndex < lecciones.length - 1 ? lecciones[currentIndex + 1] : null;

  // Verificar si la siguiente está disponible
  const siguienteDisponible = siguienteLeccion && siguienteLeccion.estado !== 'bloqueada';

  // Handler para marcar como completada
  const handleCompletar = async () => {
    if (!leccionActual || completando) return;

    try {
      setCompletando(true);

      // Si hay siguiente lección, actualizar progreso al siguiente nodo
      // Si no hay siguiente, marcar como completado
      if (siguienteLeccion) {
        await updateProgresoEstudiante(cursoId, {
          nodoActualId: siguienteLeccion.id,
        });
      } else {
        await updateProgresoEstudiante(cursoId, {
          completado: true,
        });
      }

      setCompletadaLocal(true);

      // Recargar para actualizar estados
      await cargarDatos();
    } catch (err) {
      console.error('Error al completar lección:', err);
    } finally {
      setCompletando(false);
    }
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400 mx-auto mb-4" />
          <p className="text-slate-400">Cargando lección...</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">{error}</p>
          <Link
            href={`/estudiante/explorar/${categoriaId}/${cursoId}`}
            className="text-violet-400 hover:text-violet-300"
          >
            Volver al curso
          </Link>
        </div>
      </div>
    );
  }

  // Lección no encontrada
  if (!leccionActual) {
    return (
      <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Lección no encontrada</p>
          <Link
            href={`/estudiante/explorar/${categoriaId}/${cursoId}`}
            className="text-violet-400 hover:text-violet-300"
          >
            Volver al curso
          </Link>
        </div>
      </div>
    );
  }

  const estaCompletada = leccionActual.estado === 'completada' || completadaLocal;
  const leccionNumero = currentIndex + 1;

  return (
    <div className="min-h-screen bg-[#030014] text-white relative overflow-hidden flex">
      {/* Sidebar izquierdo - Navegación */}
      <div
        className={`w-16 md:w-20 ${categoria.bgSidebar} flex flex-col items-center py-6 transition-all duration-300 z-20 shrink-0`}
      >
        {/* Botón volver */}
        <Link
          href={`/estudiante/explorar/${categoriaId}/${cursoId}`}
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

        {/* Indicador de lección */}
        <div className="flex-1 flex flex-col items-center justify-center mt-6">
          <div className="flex flex-col items-center gap-1">
            {lecciones.slice(0, 8).map((l) => (
              <div
                key={l.id}
                className={`w-2 h-2 rounded-full transition-all ${
                  l.id === leccionId
                    ? 'w-3 h-3 bg-white'
                    : l.estado === 'completada'
                      ? 'bg-white/60'
                      : 'bg-white/20'
                }`}
              />
            ))}
            {lecciones.length > 8 && (
              <span className="text-[10px] text-white/60">+{lecciones.length - 8}</span>
            )}
          </div>
        </div>

        {/* Info de lección */}
        <div className="mt-auto flex flex-col items-center gap-2">
          <div className="flex items-center gap-1 text-white/60">
            <BookOpen className="w-3 h-3" />
            <span className="text-[10px]">
              {leccionNumero}/{lecciones.length}
            </span>
          </div>
          {leccionActual.estado === 'en-progreso' && !estaCompletada && (
            <PlayCircle className="w-4 h-4 text-amber-400" />
          )}
          {estaCompletada && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        </div>
      </div>

      {/* Contenido principal - Renderizado con DesignSystem */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header con breadcrumb */}
        <header className="h-16 px-6 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-white/5 shrink-0 z-10">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/estudiante/explorar" className="hover:text-white transition-colors">
              Explorar
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              href={`/estudiante/explorar/${categoriaId}`}
              className="hover:text-white transition-colors"
            >
              {categoria.nombre}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              href={`/estudiante/explorar/${categoriaId}/${cursoId}`}
              className="hover:text-white transition-colors"
            >
              {cursoNombre}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className={categoria.textColor}>{leccionActual.titulo}</span>
          </div>

          {/* Estado de la lección */}
          <div className="flex items-center gap-3">
            {leccionActual.estado === 'en-progreso' && !estaCompletada && (
              <div className="flex items-center gap-1 px-2 py-1 bg-amber-400/10 rounded-full">
                <PlayCircle className="w-3 h-3 text-amber-400" />
                <span className="text-xs text-amber-400">En progreso</span>
              </div>
            )}
            {estaCompletada && (
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-400/10 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-400">Completada</span>
              </div>
            )}
          </div>
        </header>

        {/* Área de contenido - LessonRenderer */}
        <main className="flex-1 overflow-auto">
          <LessonRenderer
            contenidoJson={leccionActual.contenidoJson}
            houseColors={categoria.houseColors}
          />
        </main>

        {/* Footer con acciones */}
        <footer className="h-20 px-6 flex items-center justify-between bg-black/50 backdrop-blur-md border-t border-white/5 shrink-0 z-10">
          {/* Navegación anterior */}
          {anteriorLeccion ? (
            <Link
              href={`/estudiante/explorar/${categoriaId}/${cursoId}/${anteriorLeccion.id}`}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <div className="text-left">
                <p className="text-xs text-slate-500">Anterior</p>
                <p className="text-sm max-w-[150px] truncate">{anteriorLeccion.titulo}</p>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {/* Botón completar */}
          <div className="flex items-center gap-4">
            {!estaCompletada ? (
              <button
                onClick={handleCompletar}
                disabled={completando}
                className={`
                  px-6 py-3 rounded-xl font-bold text-sm
                  ${categoria.bgSidebar}
                  hover:opacity-90 transition-all hover:scale-105 active:scale-95
                  flex items-center gap-2
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  shadow-lg
                `}
              >
                {completando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Completar Lección
                  </>
                )}
              </button>
            ) : (
              <div className="px-6 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-emerald-400 text-sm">¡Completada!</span>
              </div>
            )}
          </div>

          {/* Navegación siguiente */}
          {siguienteLeccion ? (
            siguienteDisponible || estaCompletada ? (
              <Link
                href={`/estudiante/explorar/${categoriaId}/${cursoId}/${siguienteLeccion.id}`}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
              >
                <div className="text-right">
                  <p className="text-xs text-slate-500">Siguiente</p>
                  <p className="text-sm max-w-[150px] truncate">{siguienteLeccion.titulo}</p>
                </div>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <div className="flex items-center gap-2 text-slate-500 cursor-not-allowed">
                <div className="text-right">
                  <p className="text-xs">Siguiente</p>
                  <p className="text-sm flex items-center gap-1">
                    <span>🔒</span>
                    <span className="max-w-[120px] truncate">{siguienteLeccion.titulo}</span>
                  </p>
                </div>
                <ChevronRight className="w-5 h-5" />
              </div>
            )
          ) : (
            <Link
              href={`/estudiante/explorar/${categoriaId}/${cursoId}`}
              className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors group"
            >
              <div className="text-right">
                <p className="text-xs text-slate-500">Terminaste</p>
                <p className="text-sm">Ver todas las lecciones</p>
              </div>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </footer>
      </div>
    </div>
  );
}
