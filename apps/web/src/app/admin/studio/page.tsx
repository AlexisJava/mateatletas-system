'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/axios';
import {
  Plus,
  Search,
  Filter,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Library,
  Trash2,
  X,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

type EstadoCurso = 'DRAFT' | 'EN_PROGRESO' | 'EN_REVISION' | 'PUBLICADO';
type Categoria = 'EXPERIENCIA' | 'CURRICULAR';
type Mundo = 'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS';
type Casa = 'QUANTUM' | 'VERTEX' | 'PULSAR';

interface CursoListItem {
  id: string;
  nombre: string;
  categoria: Categoria;
  mundo: Mundo;
  casa: Casa;
  estado: EstadoCurso;
  cantidadSemanas: number;
  semanasCompletas: number;
  creadoEn: string;
  actualizadoEn: string;
}

interface EstadisticasCursos {
  DRAFT: number;
  EN_PROGRESO: number;
  EN_REVISION: number;
  PUBLICADO: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════

const ESTADO_CONFIG: Record<
  EstadoCurso,
  { label: string; icon: typeof Clock; color: string; bgColor: string; borderColor: string }
> = {
  DRAFT: {
    label: 'Borrador',
    icon: Clock,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
    borderColor: 'border-slate-500/30',
  },
  EN_PROGRESO: {
    label: 'En Progreso',
    icon: Loader2,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
  },
  EN_REVISION: {
    label: 'En Revisión',
    icon: AlertCircle,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
  },
  PUBLICADO: {
    label: 'Publicado',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
  },
};

const CASA_CONFIG: Record<Casa, { emoji: string; color: string; gradient: string }> = {
  QUANTUM: { emoji: '⚛️', color: 'text-emerald-400', gradient: 'from-emerald-500 to-teal-500' },
  VERTEX: { emoji: '🔷', color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' },
  PULSAR: { emoji: '💫', color: 'text-purple-400', gradient: 'from-purple-500 to-pink-500' },
};

const MUNDO_CONFIG: Record<Mundo, { emoji: string; color: string }> = {
  MATEMATICA: { emoji: '🔢', color: 'text-orange-400' },
  PROGRAMACION: { emoji: '💻', color: 'text-cyan-400' },
  CIENCIAS: { emoji: '🔬', color: 'text-green-400' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════════════════════

function StatCard({
  estado,
  count,
  isActive,
  onClick,
}: {
  estado: EstadoCurso;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const config = ESTADO_CONFIG[estado];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={`
        relative p-4 rounded-xl transition-all duration-200
        ${isActive ? `${config.bgColor} ${config.borderColor} border-2` : 'bg-white/[0.03] border border-white/10 hover:border-white/20'}
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${config.bgColor}`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div className="text-left">
          <p className="text-2xl font-bold text-white">{count}</p>
          <p className="text-xs text-white/50">{config.label}</p>
        </div>
      </div>
    </button>
  );
}

function CursoCard({
  curso,
  onEliminar,
}: {
  curso: CursoListItem;
  onEliminar?: (curso: CursoListItem) => void;
}) {
  const estadoConfig = ESTADO_CONFIG[curso.estado];
  const casaConfig = CASA_CONFIG[curso.casa];
  const mundoConfig = MUNDO_CONFIG[curso.mundo];
  const Icon = estadoConfig.icon;

  const progreso =
    curso.cantidadSemanas > 0
      ? Math.round((curso.semanasCompletas / curso.cantidadSemanas) * 100)
      : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  };

  const handleEliminar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEliminar?.(curso);
  };

  return (
    <Link
      href={`/admin/studio/${curso.id}`}
      className="group relative rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-200 overflow-hidden"
    >
      {/* Barra superior con gradiente de casa */}
      <div className={`h-1 bg-gradient-to-r ${casaConfig.gradient}`} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white truncate group-hover:text-orange-300 transition-colors">
              {curso.nombre}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs">{casaConfig.emoji}</span>
              <span className={`text-xs font-medium ${casaConfig.color}`}>{curso.casa}</span>
              <span className="text-white/20">•</span>
              <span className="text-xs">{mundoConfig.emoji}</span>
              <span className={`text-xs font-medium ${mundoConfig.color}`}>
                {curso.mundo === 'MATEMATICA'
                  ? 'Mate'
                  : curso.mundo === 'PROGRAMACION'
                    ? 'Prog'
                    : 'Ciencias'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Boton eliminar solo para DRAFT */}
            {curso.estado === 'DRAFT' && onEliminar && (
              <button
                onClick={handleEliminar}
                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                title="Eliminar borrador"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full ${estadoConfig.bgColor} ${estadoConfig.borderColor} border`}
            >
              <Icon className={`w-3 h-3 ${estadoConfig.color}`} />
              <span className={`text-[10px] font-semibold ${estadoConfig.color}`}>
                {estadoConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Progreso */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-white/40">Progreso</span>
            <span className="text-[10px] text-white/60 font-medium">
              {curso.semanasCompletas}/{curso.cantidadSemanas} semanas
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${casaConfig.gradient} transition-all duration-500`}
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded ${curso.categoria === 'EXPERIENCIA' ? 'bg-orange-500/20 text-orange-400' : 'bg-violet-500/20 text-violet-400'}`}
          >
            {curso.categoria === 'EXPERIENCIA' ? 'Experiencia' : 'Curricular'}
          </span>
          <span className="text-[10px] text-white/40">
            Actualizado {formatDate(curso.actualizadoEn)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function ConfirmDeleteModal({
  curso,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  curso: CursoListItem;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-md w-full shadow-2xl">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Eliminar Borrador</h3>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-red-500/20">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-white mb-1">
                ¿Estás seguro que querés eliminar el curso{' '}
                <span className="font-semibold">&quot;{curso.nombre}&quot;</span>?
              </p>
              <p className="text-sm text-slate-400">
                Esta acción no se puede deshacer. Se eliminarán todas las semanas y recursos
                asociados.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white border border-slate-600 rounded-lg hover:border-slate-500 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export default function StudioPage() {
  const [cursos, setCursos] = useState<CursoListItem[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasCursos | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<EstadoCurso | null>(null);
  const [busqueda, setBusqueda] = useState('');

  // Estado para eliminacion
  const [cursoAEliminar, setCursoAEliminar] = useState<CursoListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch en paralelo
      const [cursosRes, statsRes] = await Promise.all([
        apiClient.get<CursoListItem[]>('/studio/cursos', {
          params: filtroEstado ? { estado: filtroEstado } : undefined,
        }),
        apiClient.get<EstadisticasCursos>('/studio/cursos/estadisticas'),
      ]);

      // Ensure cursos is always an array
      setCursos(Array.isArray(cursosRes) ? cursosRes : []);
      setEstadisticas(statsRes);
    } catch (err) {
      setError('Error al cargar los cursos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [filtroEstado]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Funcion para eliminar curso
  const handleEliminarCurso = useCallback(async () => {
    if (!cursoAEliminar) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(`/studio/cursos/${cursoAEliminar.id}`);
      setCursoAEliminar(null);
      // Refrescar datos
      await fetchData();
    } catch (err) {
      console.error('Error al eliminar curso:', err);
      setError('Error al eliminar el curso');
    } finally {
      setIsDeleting(false);
    }
  }, [cursoAEliminar, fetchData]);

  // Filtrar cursos por búsqueda
  const cursosFiltrados = cursos.filter((curso) =>
    curso.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const totalCursos = estadisticas
    ? estadisticas.DRAFT +
      estadisticas.EN_PROGRESO +
      estadisticas.EN_REVISION +
      estadisticas.PUBLICADO
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--admin-text)]">Mateatletas Studio</h1>
          <p className="text-sm text-[var(--admin-text-muted)] mt-1">
            Crea y administra cursos interactivos para el club
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/studio/biblioteca"
            className="admin-btn admin-btn-secondary flex items-center gap-2"
          >
            <Library className="w-4 h-4" />
            <span>Biblioteca</span>
          </Link>
          <Link
            href="/admin/studio/nuevo"
            className="admin-btn admin-btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Curso</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      {estadisticas && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            estado="DRAFT"
            count={estadisticas.DRAFT}
            isActive={filtroEstado === 'DRAFT'}
            onClick={() => setFiltroEstado(filtroEstado === 'DRAFT' ? null : 'DRAFT')}
          />
          <StatCard
            estado="EN_PROGRESO"
            count={estadisticas.EN_PROGRESO}
            isActive={filtroEstado === 'EN_PROGRESO'}
            onClick={() => setFiltroEstado(filtroEstado === 'EN_PROGRESO' ? null : 'EN_PROGRESO')}
          />
          <StatCard
            estado="EN_REVISION"
            count={estadisticas.EN_REVISION}
            isActive={filtroEstado === 'EN_REVISION'}
            onClick={() => setFiltroEstado(filtroEstado === 'EN_REVISION' ? null : 'EN_REVISION')}
          />
          <StatCard
            estado="PUBLICADO"
            count={estadisticas.PUBLICADO}
            isActive={filtroEstado === 'PUBLICADO'}
            onClick={() => setFiltroEstado(filtroEstado === 'PUBLICADO' ? null : 'PUBLICADO')}
          />
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Buscar cursos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-white/60 hover:text-white hover:border-white/20 transition-colors">
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filtros</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
              <p className="text-sm text-white/50">Cargando cursos...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={fetchData}
                className="mt-3 px-4 py-2 text-sm text-white/60 hover:text-white border border-white/10 rounded-lg hover:border-white/20 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : cursosFiltrados.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
              {busqueda || filtroEstado ? (
                <>
                  <p className="text-white/60 mb-2">No se encontraron cursos</p>
                  <p className="text-sm text-white/40">Probá cambiando los filtros</p>
                </>
              ) : (
                <>
                  <p className="text-white/60 mb-2">Aún no tenés cursos</p>
                  <Link
                    href="/admin/studio/nuevo"
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 text-sm text-orange-400 hover:text-orange-300 border border-orange-500/30 rounded-lg hover:border-orange-500/50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Crear tu primer curso
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-white/50">
                {filtroEstado ? (
                  <>
                    Mostrando{' '}
                    <span className="text-white font-medium">{cursosFiltrados.length}</span> cursos
                    en {ESTADO_CONFIG[filtroEstado].label.toLowerCase()}
                  </>
                ) : (
                  <>
                    <span className="text-white font-medium">{cursosFiltrados.length}</span> de{' '}
                    <span className="text-white font-medium">{totalCursos}</span> cursos
                  </>
                )}
              </p>
              {filtroEstado && (
                <button
                  onClick={() => setFiltroEstado(null)}
                  className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Ver todos
                </button>
              )}
            </div>

            {/* Grid de cursos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cursosFiltrados.map((curso) => (
                <CursoCard key={curso.id} curso={curso} onEliminar={setCursoAEliminar} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal de confirmacion de eliminacion */}
      {cursoAEliminar && (
        <ConfirmDeleteModal
          curso={cursoAEliminar}
          onConfirm={handleEliminarCurso}
          onCancel={() => setCursoAEliminar(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
