'use client';

import { useEffect, useState } from 'react';
import { useEquiposStore } from '@/store/equipos.store';
import { Card, Button, Input, Select } from '@/components/ui';
import EquipoCard from '@/components/equipos/EquipoCard';
import EquipoFormModal from '@/components/equipos/EquipoFormModal';
import type { Equipo, CreateEquipoDto } from '@/types/equipo.types';

/**
 * Página de Equipos
 * Ruta: /equipos
 *
 * Funcionalidades:
 * - Listar todos los equipos
 * - Crear nuevo equipo
 * - Editar equipo existente
 * - Eliminar equipo
 * - Recalcular puntos de equipo
 * - Filtrar por nombre
 * - Ordenar por diferentes criterios
 */
export default function EquiposPage() {
  const {
    equipos,
    total,
    isLoading,
    error,
    fetchEquipos,
    createEquipo,
    updateEquipo,
    deleteEquipo,
    recalcularPuntos,
    clearError,
  } = useEquiposStore();

  // Estados locales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [equipoToEdit, setEquipoToEdit] = useState<Equipo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'nombre' | 'puntos_totales' | 'createdAt'>('nombre');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  /**
   * Cargar equipos al montar el componente
   */
  useEffect(() => {
    handleFetchEquipos();
  }, []);

  /**
   * Cargar equipos con filtros
   */
  const handleFetchEquipos = () => {
    const params: Record<string, string> = { sortBy, order };
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    fetchEquipos(params);
  };

  /**
   * Abrir modal para crear equipo
   */
  const handleOpenCreate = () => {
    setEquipoToEdit(null);
    setIsModalOpen(true);
  };

  /**
   * Abrir modal para editar equipo
   */
  const handleOpenEdit = (equipo: Equipo) => {
    setEquipoToEdit(equipo);
    setIsModalOpen(true);
  };

  /**
   * Manejar envío del formulario (crear o editar)
   */
  const handleSubmit = async (data: CreateEquipoDto) => {
    if (equipoToEdit) {
      // Editar
      await updateEquipo(equipoToEdit.id, data);
    } else {
      // Crear
      await createEquipo(data);
    }
    setIsModalOpen(false);
    setEquipoToEdit(null);
  };

  /**
   * Manejar eliminación de equipo
   */
  const handleDelete = async (equipo: Equipo) => {
    await deleteEquipo(equipo.id);
  };

  /**
   * Manejar recálculo de puntos
   */
  const handleRecalcularPuntos = async (equipo: Equipo) => {
    await recalcularPuntos(equipo.id);
  };

  /**
   * Aplicar filtros
   */
  const handleApplyFilters = () => {
    handleFetchEquipos();
  };

  /**
   * Limpiar filtros
   */
  const handleClearFilters = () => {
    setSearchTerm('');
    setSortBy('nombre');
    setOrder('asc');
    fetchEquipos({ sortBy: 'nombre', order: 'asc' });
  };

  /**
   * Equipos filtrados localmente (búsqueda instantánea)
   */
  const equiposFiltrados = (equipos || []).filter((equipo) => {
    if (!equipo) return false;
    if (!searchTerm.trim()) return true;
    return equipo.nombre.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#2a1a5e]">Equipos</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los equipos de gamificación
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={handleOpenCreate}>
          ➕ Crear equipo
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-5xl mb-2">🏆</div>
          <p className="text-3xl font-bold text-[#2a1a5e]">
            {isLoading ? '...' : total}
          </p>
          <p className="text-sm text-gray-600">
            {total === 1 ? 'Equipo' : 'Equipos'}
          </p>
        </Card>

        <Card className="text-center">
          <div className="text-5xl mb-2">👥</div>
          <p className="text-3xl font-bold text-[#2a1a5e]">
            {isLoading
              ? '...'
              : equipos.reduce(
                  (sum, e) => sum + (e.estudiantes?.length || 0),
                  0,
                )}
          </p>
          <p className="text-sm text-gray-600">Estudiantes totales</p>
        </Card>

        <Card className="text-center">
          <div className="text-5xl mb-2">🎯</div>
          <p className="text-3xl font-bold text-[#2a1a5e]">
            {isLoading
              ? '...'
              : equipos
                  .reduce((sum, e) => sum + e.puntos_totales, 0)
                  .toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Puntos totales</p>
        </Card>
      </div>

      {/* Barra de filtros */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Ordenar por */}
          <div className="w-full md:w-48">
            <Select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'nombre' | 'puntos_totales' | 'createdAt')
              }
              options={[
                { value: 'nombre', label: 'Nombre' },
                { value: 'puntos_totales', label: 'Puntos' },
                { value: 'createdAt', label: 'Fecha de creación' },
              ]}
            />
          </div>

          {/* Orden */}
          <div className="w-full md:w-32">
            <Select
              value={order}
              onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
              options={[
                { value: 'asc', label: 'A-Z / ↑' },
                { value: 'desc', label: 'Z-A / ↓' },
              ]}
            />
          </div>

          {/* Botones */}
          <Button variant="primary" onClick={handleApplyFilters}>
            Aplicar
          </Button>
          <Button variant="outline" onClick={handleClearFilters}>
            Limpiar
          </Button>
        </div>
      </Card>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <p className="text-red-800 font-semibold">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Lista de equipos */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 animate-bounce">⏳</div>
          <p className="text-xl text-gray-600">Cargando equipos...</p>
        </div>
      ) : equiposFiltrados.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-[#2a1a5e] mb-2">
            No se encontraron equipos
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? 'Intenta con otro término de búsqueda'
              : 'Crea tu primer equipo para comenzar'}
          </p>
          {!searchTerm && (
            <Button variant="primary" onClick={handleOpenCreate}>
              ➕ Crear primer equipo
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equiposFiltrados.map((equipo) => (
            <EquipoCard
              key={equipo.id}
              equipo={equipo}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onRecalcularPuntos={handleRecalcularPuntos}
            />
          ))}
        </div>
      )}

      {/* Modal de formulario */}
      <EquipoFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEquipoToEdit(null);
        }}
        onSubmit={handleSubmit}
        equipoToEdit={equipoToEdit}
      />
    </div>
  );
}
