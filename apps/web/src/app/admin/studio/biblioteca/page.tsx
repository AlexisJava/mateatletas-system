'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Library,
  Search,
  ArrowLeft,
  CheckCircle2,
  Construction,
  ToggleLeft,
  Package,
  Sparkles,
  Eye,
} from 'lucide-react';
import { listarCatalogo, toggleComponente } from '@/services/studio/catalogo.service';
import { BloqueMetadata, BloqueCategoria } from '@/components/studio/blocks/types';
import { ComponentePreviewModal, usePreviewModal } from '@/components/studio/biblioteca/preview';

// Registrar previews al cargar la página
import '@/components/studio/biblioteca/preview/register-previews';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS Y CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════

type EstadoFiltro = 'TODOS' | 'IMPLEMENTADOS' | 'PENDIENTES' | 'HABILITADOS';

interface Contadores {
  total: number;
  implementados: number;
  pendientes: number;
  habilitados: number;
}

const CATEGORIAS: Array<{
  value: BloqueCategoria | 'TODAS';
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}> = [
  { value: 'TODAS', label: 'Todas', emoji: '📚', color: 'text-white', bgColor: 'bg-white/20' },
  {
    value: 'INTERACTIVO',
    label: 'Interactivos',
    emoji: '🎮',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  {
    value: 'MOTRICIDAD_FINA',
    label: 'Motricidad',
    emoji: '✋',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
  },
  {
    value: 'SIMULADOR',
    label: 'Simuladores',
    emoji: '🔬',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
  },
  {
    value: 'EDITOR_CODIGO',
    label: 'Código',
    emoji: '💻',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  {
    value: 'CREATIVO',
    label: 'Creativos',
    emoji: '🎨',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
  },
  {
    value: 'MULTIMEDIA',
    label: 'Multimedia',
    emoji: '🎬',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
  },
  {
    value: 'EVALUACION',
    label: 'Evaluación',
    emoji: '📝',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
  },
  {
    value: 'MULTIPLAYER',
    label: 'Multiplayer',
    emoji: '👥',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/20',
  },
];

const ESTADOS: Array<{
  value: EstadoFiltro;
  label: string;
  icon: typeof CheckCircle2;
  color: string;
  bgColor: string;
}> = [
  { value: 'TODOS', label: 'Todos', icon: Package, color: 'text-white', bgColor: 'bg-white/20' },
  {
    value: 'IMPLEMENTADOS',
    label: 'Implementados',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
  },
  {
    value: 'PENDIENTES',
    label: 'Pendientes',
    icon: Construction,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
  },
  {
    value: 'HABILITADOS',
    label: 'Habilitados',
    icon: ToggleLeft,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
];

const CATEGORIA_DARK_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  INTERACTIVO: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400' },
  MOTRICIDAD_FINA: { bg: 'bg-pink-500/20', border: 'border-pink-500/30', text: 'text-pink-400' },
  SIMULADOR: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  EDITOR_CODIGO: { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400' },
  CREATIVO: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400' },
  MULTIMEDIA: { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400' },
  EVALUACION: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400' },
  MULTIPLAYER: { bg: 'bg-indigo-500/20', border: 'border-indigo-500/30', text: 'text-indigo-400' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════════════════════

interface StatCardProps {
  icon: typeof CheckCircle2;
  label: string;
  count: number;
  color: string;
  bgColor: string;
  isActive: boolean;
  onClick: () => void;
}

function StatCard({
  icon: Icon,
  label,
  count,
  color,
  bgColor,
  isActive,
  onClick,
}: StatCardProps): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className={`
        relative p-3 rounded-xl transition-all duration-200 text-left
        ${isActive ? `${bgColor} border-2 border-orange-500/50` : 'bg-white/[0.03] border border-white/10 hover:border-white/20'}
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div>
          <p className="text-xl font-bold text-white">{count}</p>
          <p className="text-[10px] text-white/50">{label}</p>
        </div>
      </div>
    </button>
  );
}

interface ComponenteCardDarkProps {
  componente: BloqueMetadata;
  onToggle: (tipo: string, habilitado: boolean) => void;
  onOpenPreview: (componente: BloqueMetadata) => void;
  isToggling?: boolean;
}

function ComponenteCardDark({
  componente,
  onToggle,
  onOpenPreview,
  isToggling = false,
}: ComponenteCardDarkProps): React.ReactElement {
  const colors = CATEGORIA_DARK_COLORS[componente.categoria] ?? {
    bg: 'bg-slate-500/20',
    border: 'border-slate-500/30',
    text: 'text-slate-400',
  };

  const handleToggleClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (!componente.implementado || isToggling) return;
    onToggle(componente.tipo, !componente.habilitado);
  };

  const handleCardClick = (): void => {
    onOpenPreview(componente);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={`
        group relative rounded-xl overflow-hidden transition-all duration-200 cursor-pointer
        ${
          componente.implementado
            ? 'bg-white/[0.03] border border-white/10 hover:border-orange-500/50 hover:bg-white/[0.05]'
            : 'bg-white/[0.02] border border-white/5 hover:border-white/10 opacity-70 hover:opacity-90'
        }
      `}
    >
      {/* Barra superior de color */}
      <div className={`h-1 ${colors.bg}`} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{componente.icono}</span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate group-hover:text-orange-300 transition-colors">
                {componente.nombre}
              </h3>
              <span
                className={`inline-block mt-1 rounded px-2 py-0.5 text-[10px] font-medium ${colors.bg} ${colors.text} ${colors.border} border`}
              >
                {componente.categoria.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Toggle */}
          <button
            type="button"
            onClick={handleToggleClick}
            disabled={!componente.implementado || isToggling}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent
              transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900
              ${
                !componente.implementado
                  ? 'cursor-not-allowed bg-white/10'
                  : componente.habilitado
                    ? 'bg-orange-500'
                    : 'bg-white/20'
              }
            `}
          >
            {isToggling ? (
              <span className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-white/50" />
              </span>
            ) : (
              <span
                className={`
                  inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform
                  ${componente.habilitado ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            )}
          </button>
        </div>

        {/* Descripcion */}
        <p className="text-xs text-white/50 line-clamp-2 mb-3">{componente.descripcion}</p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {componente.implementado ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Implementado
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-amber-400">
                <Construction className="h-3 w-3" />
                Pendiente
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/30 font-mono">{componente.tipo}</span>
            <Eye className="w-3 h-3 text-white/20 group-hover:text-orange-400 transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export default function BibliotecaPage(): React.ReactElement {
  const [componentes, setComponentes] = useState<BloqueMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  // Filtros
  const [categoriaActiva, setCategoriaActiva] = useState<BloqueCategoria | 'TODAS'>('TODAS');
  const [estadoActivo, setEstadoActivo] = useState<EstadoFiltro>('TODOS');
  const [busqueda, setBusqueda] = useState('');

  // Modal de preview
  const { state: modalState, openModal, closeModal } = usePreviewModal();

  // Cargar componentes
  useEffect(() => {
    const cargar = async (): Promise<void> => {
      try {
        const data = await listarCatalogo();
        setComponentes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar');
      } finally {
        setIsLoading(false);
      }
    };
    cargar();
  }, []);

  // Contadores
  const contadores = useMemo((): Contadores => {
    return {
      total: componentes.length,
      implementados: componentes.filter((c) => c.implementado).length,
      pendientes: componentes.filter((c) => !c.implementado).length,
      habilitados: componentes.filter((c) => c.habilitado).length,
    };
  }, [componentes]);

  // Contadores por categoria
  const contadoresPorCategoria = useMemo(() => {
    const counts: Record<string, number> = { TODAS: componentes.length };
    for (const comp of componentes) {
      counts[comp.categoria] = (counts[comp.categoria] ?? 0) + 1;
    }
    return counts;
  }, [componentes]);

  // Filtrar componentes
  const componentesFiltrados = useMemo(() => {
    return componentes.filter((comp) => {
      if (categoriaActiva !== 'TODAS' && comp.categoria !== categoriaActiva) return false;
      if (estadoActivo === 'IMPLEMENTADOS' && !comp.implementado) return false;
      if (estadoActivo === 'PENDIENTES' && comp.implementado) return false;
      if (estadoActivo === 'HABILITADOS' && !comp.habilitado) return false;

      if (busqueda.trim()) {
        const termino = busqueda.toLowerCase();
        return (
          comp.nombre.toLowerCase().includes(termino) ||
          comp.descripcion.toLowerCase().includes(termino) ||
          comp.tipo.toLowerCase().includes(termino)
        );
      }

      return true;
    });
  }, [componentes, categoriaActiva, estadoActivo, busqueda]);

  // Toggle componente
  const handleToggle = useCallback(async (tipo: string, habilitado: boolean): Promise<void> => {
    setTogglingIds((prev) => new Set(prev).add(tipo));
    setComponentes((prev) => prev.map((c) => (c.tipo === tipo ? { ...c, habilitado } : c)));

    try {
      await toggleComponente(tipo, habilitado);
    } catch {
      setComponentes((prev) =>
        prev.map((c) => (c.tipo === tipo ? { ...c, habilitado: !habilitado } : c)),
      );
    } finally {
      setTogglingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tipo);
        return newSet;
      });
    }
  }, []);

  // Handle toggle desde el modal (actualiza el estado local también)
  const handleModalToggle = useCallback(
    async (tipo: string, habilitado: boolean): Promise<void> => {
      await handleToggle(tipo, habilitado);
      // Actualizar el componente en el modal state si es el mismo
      if (modalState.componente?.tipo === tipo) {
        // El estado se actualiza via componentes, así que el modal se re-renderiza automáticamente
      }
    },
    [handleToggle, modalState.componente?.tipo],
  );

  // Obtener componente actualizado para el modal
  const componenteActualizado = useMemo(() => {
    if (!modalState.componente) return null;
    return componentes.find((c) => c.tipo === modalState.componente?.tipo) ?? modalState.componente;
  }, [componentes, modalState.componente]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-white/50">Cargando biblioteca...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400 mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm text-white/60 hover:text-white border border-white/10 rounded-lg hover:border-white/20 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link
                href="/admin/studio"
                className="p-2 rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-white/60" />
              </Link>
              <Library className="w-6 h-6 text-orange-400" />
              <h1 className="text-2xl font-bold text-[var(--admin-text)]">
                Biblioteca de Componentes
              </h1>
            </div>
            <p className="text-sm text-[var(--admin-text-muted)] ml-14">
              {contadores.total} componentes totales · {contadores.implementados} implementados ·
              Click en una card para ver preview
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">
                {contadores.implementados}/{contadores.total}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ESTADOS.map((estado) => (
            <StatCard
              key={estado.value}
              icon={estado.icon}
              label={estado.label}
              count={
                contadores[
                  estado.value === 'TODOS'
                    ? 'total'
                    : estado.value === 'IMPLEMENTADOS'
                      ? 'implementados'
                      : estado.value === 'PENDIENTES'
                        ? 'pendientes'
                        : 'habilitados'
                ]
              }
              color={estado.color}
              bgColor={estado.bgColor}
              isActive={estadoActivo === estado.value}
              onClick={() =>
                setEstadoActivo(estadoActivo === estado.value ? 'TODOS' : estado.value)
              }
            />
          ))}
        </div>

        {/* Search & Categoria Filter */}
        <div className="space-y-4">
          {/* Busqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Buscar componentes..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50 transition-colors"
            />
          </div>

          {/* Categorias */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS.map((cat) => {
              const count = contadoresPorCategoria[cat.value] ?? 0;
              const isActive = categoriaActiva === cat.value;

              return (
                <button
                  key={cat.value}
                  onClick={() => setCategoriaActiva(cat.value)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                    ${
                      isActive
                        ? `${cat.bgColor} border-2 border-orange-500/50 ${cat.color}`
                        : 'bg-white/[0.03] border border-white/10 text-white/60 hover:border-white/20 hover:text-white'
                    }
                  `}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                  <span className={`text-xs ${isActive ? 'text-white/80' : 'text-white/40'}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/50">
            Mostrando <span className="text-white font-medium">{componentesFiltrados.length}</span>{' '}
            componentes
            {categoriaActiva !== 'TODAS' && (
              <>
                {' '}
                en{' '}
                <span className="text-white">
                  {CATEGORIAS.find((c) => c.value === categoriaActiva)?.label}
                </span>
              </>
            )}
          </p>
          {(categoriaActiva !== 'TODAS' || estadoActivo !== 'TODOS' || busqueda) && (
            <button
              onClick={() => {
                setCategoriaActiva('TODAS');
                setEstadoActivo('TODOS');
                setBusqueda('');
              }}
              className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Grid de componentes */}
        {componentesFiltrados.length === 0 ? (
          <div className="flex items-center justify-center h-64 rounded-xl border-2 border-dashed border-white/10">
            <div className="text-center">
              <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-2">No se encontraron componentes</p>
              <p className="text-sm text-white/40">Probá cambiando los filtros</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {componentesFiltrados.map((comp) => (
              <ComponenteCardDark
                key={comp.tipo}
                componente={comp}
                onToggle={handleToggle}
                onOpenPreview={openModal}
                isToggling={togglingIds.has(comp.tipo)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Preview */}
      <ComponentePreviewModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        componente={componenteActualizado}
        onToggle={handleModalToggle}
        isToggling={modalState.componente ? togglingIds.has(modalState.componente.tipo) : false}
      />
    </>
  );
}
