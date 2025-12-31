'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Eye,
  Edit3,
  Upload,
  Archive,
  Plus,
  Search,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  getContenidos,
  publicarContenido,
  archivarContenido,
  type ContenidoBackend,
  type CasaTipo,
  type MundoTipo,
  type EstadoContenido,
} from '@/lib/api/contenidos.api';
import { LessonRenderer, HOUSE_COLORS } from '@/components/lesson-renderer';

// ============================================================================
// TYPES
// ============================================================================

interface ContenidoConNodos extends ContenidoBackend {
  _count?: { nodos: number };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CASA_COLORS: Record<CasaTipo, { bg: string; text: string; border: string }> = {
  QUANTUM: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
  VERTEX: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  PULSAR: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
};

const MUNDO_LABELS: Record<MundoTipo, { label: string; icon: string }> = {
  MATEMATICA: { label: 'Matemática', icon: '📐' },
  PROGRAMACION: { label: 'Programación', icon: '💻' },
  CIENCIAS: { label: 'Ciencias', icon: '🔬' },
};

const ESTADO_STYLES: Record<EstadoContenido, { bg: string; text: string; label: string }> = {
  BORRADOR: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Borrador' },
  PUBLICADO: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Publicado' },
  ARCHIVADO: { bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'Archivado' },
};

// ============================================================================
// HELPER: Extraer primer nodo con contenidoJson
// ============================================================================

function extractFirstContentJson(nodos: ContenidoBackend['nodos']): string | null {
  for (const nodo of nodos) {
    if (nodo.contenidoJson) {
      return nodo.contenidoJson;
    }
    if (nodo.hijos && nodo.hijos.length > 0) {
      const found = extractFirstContentJson(nodo.hijos);
      if (found) return found;
    }
  }
  return null;
}

function countNodosConContenido(nodos: ContenidoBackend['nodos']): number {
  let count = 0;
  for (const nodo of nodos) {
    if (nodo.contenidoJson) count++;
    if (nodo.hijos && nodo.hijos.length > 0) {
      count += countNodosConContenido(nodo.hijos);
    }
  }
  return count;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ContenidosPage() {
  const [contenidos, setContenidos] = useState<ContenidoConNodos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<EstadoContenido | 'TODOS'>('TODOS');
  const [filterCasa, setFilterCasa] = useState<CasaTipo | 'TODAS'>('TODAS');

  // Preview modal
  const [previewContenido, setPreviewContenido] = useState<ContenidoBackend | null>(null);
  const [previewJson, setPreviewJson] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Cargar contenidos
  useEffect(() => {
    async function loadContenidos() {
      try {
        setLoading(true);
        setError(null);
        const response = await getContenidos({ limit: 50 });
        // El interceptor de axios extrae .data del wrapper del backend
        // Entonces response puede ser { data: [...], meta: {...} } o directamente el array
        const contenidosArray = Array.isArray(response) ? response : (response?.data ?? []);
        setContenidos(contenidosArray);
      } catch (err) {
        console.error('Error cargando contenidos:', err);
        setError('Error al cargar los contenidos. Verificá que estés logueado como admin.');
        setContenidos([]);
      } finally {
        setLoading(false);
      }
    }
    loadContenidos();
  }, []);

  // Filtrar contenidos
  const contenidosFiltrados = contenidos.filter((c) => {
    const matchSearch = c.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filterEstado === 'TODOS' || c.estado === filterEstado;
    const matchCasa = filterCasa === 'TODAS' || c.casaTipo === filterCasa;
    return matchSearch && matchEstado && matchCasa;
  });

  // Ver preview
  const handlePreview = async (contenido: ContenidoBackend) => {
    setPreviewContenido(contenido);
    setLoadingPreview(true);

    try {
      // Importar getArbol dinámicamente para obtener el árbol completo
      const { getArbol } = await import('@/lib/api/contenidos.api');
      const arbol = await getArbol(contenido.id);
      const json = extractFirstContentJson(arbol);
      setPreviewJson(json);
    } catch (err) {
      console.error('Error cargando preview:', err);
      setPreviewJson(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Publicar contenido
  const handlePublicar = async (id: string) => {
    try {
      await publicarContenido(id);
      setContenidos((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado: 'PUBLICADO' as EstadoContenido } : c)),
      );
    } catch (err: unknown) {
      console.error('Error publicando:', err);
      // Extraer mensaje de error del backend
      const errorData = (err as { response?: { data?: { message?: string } } })?.response?.data;
      const errorMessage = errorData?.message || 'Error al publicar el contenido';

      // Mensaje más descriptivo para errores comunes
      if (errorMessage.includes('sin slides')) {
        alert(
          'No se puede publicar: esta lección no tiene slides con contenido.\n\nPara publicar, ve al Studio y agregá al menos un slide dentro de Teoría, Práctica o Evaluación.',
        );
      } else {
        alert(errorMessage);
      }
    }
  };

  // Archivar contenido
  const handleArchivar = async (id: string) => {
    try {
      await archivarContenido(id);
      setContenidos((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado: 'ARCHIVADO' as EstadoContenido } : c)),
      );
    } catch (err) {
      console.error('Error archivando:', err);
      alert('Error al archivar el contenido');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400 mx-auto mb-4" />
          <p className="text-slate-400">Cargando contenidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-violet-400" />
              <h1 className="text-2xl font-bold">Biblioteca de Contenidos</h1>
            </div>
            <Link
              href="/admin/sandbox"
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva Lección
            </Link>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Búsqueda */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-500/50 text-sm"
              />
            </div>

            {/* Filtro Estado */}
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value as EstadoContenido | 'TODOS')}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-violet-500/50"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="BORRADOR">Borrador</option>
              <option value="PUBLICADO">Publicado</option>
              <option value="ARCHIVADO">Archivado</option>
            </select>

            {/* Filtro Casa */}
            <select
              value={filterCasa}
              onChange={(e) => setFilterCasa(e.target.value as CasaTipo | 'TODAS')}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-violet-500/50"
            >
              <option value="TODAS">Todas las casas</option>
              <option value="QUANTUM">Quantum</option>
              <option value="VERTEX">Vertex</option>
              <option value="PULSAR">Pulsar</option>
            </select>

            {/* Stats */}
            <div className="text-sm text-slate-400 ml-auto">
              {contenidosFiltrados.length} de {contenidos.length} contenidos
            </div>
          </div>
        </div>
      </div>

      {/* Lista de contenidos */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {contenidosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No hay contenidos que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {contenidosFiltrados.map((contenido) => {
              const casa = CASA_COLORS[contenido.casaTipo];
              const mundo = MUNDO_LABELS[contenido.mundoTipo];
              const estado = ESTADO_STYLES[contenido.estado];

              return (
                <div
                  key={contenido.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Icono del mundo */}
                    <div
                      className={`w-12 h-12 rounded-xl ${casa.bg} ${casa.border} border flex items-center justify-center text-2xl shrink-0`}
                    >
                      {mundo.icon}
                    </div>

                    {/* Info principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg truncate">{contenido.titulo}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${estado.bg} ${estado.text}`}
                        >
                          {estado.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <span className={casa.text}>{contenido.casaTipo}</span>
                        <span>•</span>
                        <span>{mundo.label}</span>
                        <span>•</span>
                        <span>{contenido._count?.nodos || 0} nodos</span>
                        {contenido.nodos && (
                          <>
                            <span>•</span>
                            <span
                              className={
                                countNodosConContenido(contenido.nodos) > 0
                                  ? 'text-emerald-400'
                                  : 'text-amber-400'
                              }
                            >
                              {countNodosConContenido(contenido.nodos)} slides
                            </span>
                          </>
                        )}
                        {contenido.duracionMinutos && (
                          <>
                            <span>•</span>
                            <span>{contenido.duracionMinutos} min</span>
                          </>
                        )}
                      </div>

                      {contenido.descripcion && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                          {contenido.descripcion}
                        </p>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handlePreview(contenido)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                        title="Ver preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <Link
                        href={`/admin/sandbox?id=${contenido.id}`}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>

                      {contenido.estado === 'BORRADOR' && (
                        <button
                          onClick={() => handlePublicar(contenido.id)}
                          className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors text-slate-400 hover:text-emerald-400"
                          title="Publicar"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                      )}

                      {contenido.estado === 'PUBLICADO' && (
                        <button
                          onClick={() => handleArchivar(contenido.id)}
                          className="p-2 hover:bg-slate-500/20 rounded-lg transition-colors text-slate-400 hover:text-slate-300"
                          title="Archivar"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Preview */}
      {previewContenido && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header del modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-violet-400" />
                <div>
                  <h2 className="font-semibold">{previewContenido.titulo}</h2>
                  <p className="text-sm text-slate-400">
                    Vista previa como estudiante de {previewContenido.casaTipo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPreviewContenido(null);
                  setPreviewJson(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del preview */}
            <div className="flex-1 overflow-auto bg-[#030014]">
              {loadingPreview ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                </div>
              ) : previewJson ? (
                <LessonRenderer
                  contenidoJson={previewJson}
                  houseColors={HOUSE_COLORS[previewContenido.casaTipo] || HOUSE_COLORS.QUANTUM}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <AlertCircle className="w-8 h-8 mb-3" />
                  <p>Esta lección no tiene contenido JSON todavía</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Agregá nodos con contenido en el Studio
                  </p>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-black/30">
              <div className="text-sm text-slate-400">
                Casa:{' '}
                <span className={CASA_COLORS[previewContenido.casaTipo].text}>
                  {previewContenido.casaTipo}
                </span>
                {' • '}
                Mundo: {MUNDO_LABELS[previewContenido.mundoTipo].label}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/sandbox?id=${previewContenido.id}`}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar en Studio
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
