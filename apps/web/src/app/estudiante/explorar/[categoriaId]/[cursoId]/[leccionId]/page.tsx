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
 * y determina su estado basado en el progreso.
 *
 * Lógica de estados:
 * - Sin progreso (progresoNodoId = null): primera = 'en-progreso', resto = 'bloqueada'
 * - Con progreso: antes del actual = 'completada', actual = 'en-progreso', siguiente = 'disponible', resto = 'bloqueada'
 */
function extraerLecciones(nodos: NodoBackend[], progresoNodoId: string | null): LeccionUI[] {
  const lecciones: LeccionUI[] = [];

  function recorrer(nodo: NodoBackend) {
    // Si tiene hijos, es contenedor - recursar
    if (nodo.hijos && nodo.hijos.length > 0) {
      const hijosOrdenados = [...nodo.hijos].sort((a, b) => a.orden - b.orden);
      hijosOrdenados.forEach(recorrer);
    } else if (nodo.contenidoJson !== null && !nodo.bloqueado) {
      // Es nodo hoja con contenido - es una microlección
      lecciones.push({
        id: nodo.id,
        titulo: nodo.titulo,
        contenidoJson: nodo.contenidoJson,
        estado: 'bloqueada', // Se asigna después
        orden: nodo.orden,
      });
    }
  }

  // Procesar nodos raíz ordenados
  const nodosOrdenados = [...nodos].sort((a, b) => a.orden - b.orden);
  nodosOrdenados.forEach(recorrer);

  // Ahora asignar estados basados en progreso
  if (lecciones.length === 0) return lecciones;

  // Encontrar índice del nodo actual
  const indexActual = progresoNodoId ? lecciones.findIndex((l) => l.id === progresoNodoId) : 0; // Si no hay progreso, la primera es la actual

  lecciones.forEach((leccion, index) => {
    if (index < indexActual) {
      // Antes del actual = completada
      leccion.estado = 'completada';
    } else if (index === indexActual) {
      // Es el nodo actual = en progreso
      leccion.estado = 'en-progreso';
    } else if (index === indexActual + 1) {
      // Siguiente inmediato = disponible
      leccion.estado = 'disponible';
    } else {
      // El resto = bloqueada
      leccion.estado = 'bloqueada';
    }
  });

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

  const estaCompletada = leccionActual.estado === 'completada';
  const leccionNumero = currentIndex + 1;

  return (
    <div className="min-h-screen bg-[#030014] text-white relative flex">
      {/* Flechas de navegación flotantes - FUERA del overflow */}
      {anteriorLeccion && (
        <Link
          href={`/estudiante/explorar/${categoriaId}/${cursoId}/${anteriorLeccion.id}`}
          className="fixed left-24 top-1/2 -translate-y-1/2 z-[100] w-14 h-14 rounded-full bg-black/70 backdrop-blur-md border-2 border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/90 hover:border-white/40 hover:scale-110 transition-all shadow-2xl group"
          title={`Anterior: ${anteriorLeccion.titulo}`}
        >
          <ChevronLeft className="w-7 h-7 group-hover:-translate-x-0.5 transition-transform" />
        </Link>
      )}

      {siguienteLeccion && (
        <Link
          href={`/estudiante/explorar/${categoriaId}/${cursoId}/${siguienteLeccion.id}`}
          onClick={() => {
            // Auto-completar la lección actual al navegar a la siguiente
            updateProgresoEstudiante(cursoId, { nodoActualId: siguienteLeccion.id }).catch(
              console.error,
            );
          }}
          className="fixed right-8 top-1/2 -translate-y-1/2 z-[100] w-14 h-14 rounded-full bg-black/70 backdrop-blur-md border-2 border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/90 hover:border-white/40 hover:scale-110 transition-all shadow-2xl group"
          title={`Siguiente: ${siguienteLeccion.titulo}`}
        >
          <ChevronRight className="w-7 h-7 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}

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
        <main className="flex-1 overflow-auto pb-24">
          <LessonRenderer
            contenidoJson={leccionActual.contenidoJson}
            houseColors={categoria.houseColors}
          />
        </main>

        {/* Footer con acciones - FIXED para que siempre sea visible */}
        <footer className="fixed bottom-0 left-16 md:left-20 right-0 h-20 px-6 flex items-center justify-between bg-black/80 backdrop-blur-md border-t border-white/10 z-[90]">
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

          {/* Indicador de progreso central */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <span className="text-lg font-bold text-white">{leccionNumero}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{lecciones.length}</span>
            </div>
            {estaCompletada && (
              <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-400">Completada</span>
              </div>
            )}
          </div>

          {/* Navegación siguiente - siempre clickeable, auto-completa */}
          {siguienteLeccion ? (
            <Link
              href={`/estudiante/explorar/${categoriaId}/${cursoId}/${siguienteLeccion.id}`}
              onClick={() => {
                // Auto-completar al navegar
                updateProgresoEstudiante(cursoId, { nodoActualId: siguienteLeccion.id }).catch(
                  console.error,
                );
              }}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl transition-all group
                ${categoria.bgSidebar} hover:opacity-90 hover:scale-105
              `}
            >
              <div className="text-right">
                <p className="text-[10px] text-white/60 uppercase tracking-wide">Siguiente</p>
                <p className="text-sm font-bold text-white max-w-[150px] truncate">
                  {siguienteLeccion.titulo}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <Link
              href={`/estudiante/explorar/${categoriaId}/${cursoId}`}
              onClick={() => {
                // Marcar curso como completado
                updateProgresoEstudiante(cursoId, { completado: true }).catch(console.error);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition-all group"
            >
              <div className="text-right">
                <p className="text-[10px] text-emerald-100 uppercase tracking-wide">Terminaste</p>
                <p className="text-sm font-bold text-white">Ver curso</p>
              </div>
              <Trophy className="w-5 h-5 text-white" />
            </Link>
          )}
        </footer>
      </div>
    </div>
  );
}
