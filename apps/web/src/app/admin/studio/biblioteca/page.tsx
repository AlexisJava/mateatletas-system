'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Loader2, Library } from 'lucide-react';
import { listarCatalogo, toggleComponente } from '@/services/studio/catalogo.service';
import { BloqueMetadata, BloqueCategoria } from '@/components/studio/blocks/types';
import { ComponenteCard, BibliotecaFiltros } from '@/components/studio/biblioteca';

type EstadoFiltro = 'TODOS' | 'IMPLEMENTADOS' | 'PENDIENTES' | 'HABILITADOS';

export default function BibliotecaPage(): React.ReactElement {
  const [componentes, setComponentes] = useState<BloqueMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  // Filtros
  const [categoriaActiva, setCategoriaActiva] = useState<BloqueCategoria | 'TODAS'>('TODAS');
  const [estadoActivo, setEstadoActivo] = useState<EstadoFiltro>('TODOS');
  const [busqueda, setBusqueda] = useState('');

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
  const contadores = useMemo(() => {
    return {
      total: componentes.length,
      implementados: componentes.filter((c) => c.implementado).length,
      pendientes: componentes.filter((c) => !c.implementado).length,
      habilitados: componentes.filter((c) => c.habilitado).length,
    };
  }, [componentes]);

  // Filtrar componentes
  const componentesFiltrados = useMemo(() => {
    return componentes.filter((comp) => {
      // Filtro categoría
      if (categoriaActiva !== 'TODAS' && comp.categoria !== categoriaActiva) {
        return false;
      }

      // Filtro estado
      if (estadoActivo === 'IMPLEMENTADOS' && !comp.implementado) return false;
      if (estadoActivo === 'PENDIENTES' && comp.implementado) return false;
      if (estadoActivo === 'HABILITADOS' && !comp.habilitado) return false;

      // Filtro búsqueda
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

    // Optimistic update
    setComponentes((prev) => prev.map((c) => (c.tipo === tipo ? { ...c, habilitado } : c)));

    try {
      await toggleComponente(tipo, habilitado);
    } catch {
      // Revertir en caso de error
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

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Library className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Biblioteca de Componentes</h1>
          </div>
          <p className="mt-2 text-gray-600">
            <span className="font-medium text-green-600">{contadores.implementados}</span>{' '}
            implementados ·{' '}
            <span className="font-medium text-blue-600">{contadores.habilitados}</span> habilitados
            · <span className="font-medium">{contadores.total}</span> total
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
          <BibliotecaFiltros
            categoriaActiva={categoriaActiva}
            estadoActivo={estadoActivo}
            busqueda={busqueda}
            onCategoriaChange={setCategoriaActiva}
            onEstadoChange={setEstadoActivo}
            onBusquedaChange={setBusqueda}
            contadores={contadores}
          />
        </div>

        {/* Grid de componentes */}
        {componentesFiltrados.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">No se encontraron componentes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {componentesFiltrados.map((comp) => (
              <ComponenteCard
                key={comp.tipo}
                componente={comp}
                onToggle={handleToggle}
                isToggling={togglingIds.has(comp.tipo)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
