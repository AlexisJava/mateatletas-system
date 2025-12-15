'use client';

import { useEffect, useState } from 'react';
import { useCasasStore } from '@/store/casas.store';
import { Card, Button, Input, Select } from '@/components/ui';
import CasaCard from '@/components/casas/CasaCard';
import CasaFormModal from '@/components/casas/CasaFormModal';
import type { Casa, CreateCasaDto } from '@/types/casa.types';

/**
 * Página de Casas
 * Ruta: /casas
 *
 * Funcionalidades:
 * - Listar todas las casas
 * - Crear nueva casa
 * - Editar casa existente
 * - Eliminar casa
 * - Recalcular puntos de casa
 * - Filtrar por nombre
 * - Ordenar por diferentes criterios
 */
export default function CasasPage() {
  const {
    casas,
    total,
    isLoading,
    error,
    fetchCasas,
    createCasa,
    updateCasa,
    deleteCasa,
    recalcularPuntos,
    clearError,
  } = useCasasStore();

  // Estados locales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [casaToEdit, setCasaToEdit] = useState<Casa | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'nombre' | 'puntos_totales' | 'createdAt'>('nombre');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  /**
   * Cargar casas al montar el componente
   */
  useEffect(() => {
    handleFetchCasas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Cargar casas con filtros
   */
  const handleFetchCasas = () => {
    const params: Record<string, string> = { sortBy, order };
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    fetchCasas(params);
  };

  /**
   * Abrir modal para crear casa
   */
  const handleOpenCreate = () => {
    setCasaToEdit(null);
    setIsModalOpen(true);
  };

  /**
   * Abrir modal para editar casa
   */
  const handleOpenEdit = (casa: Casa) => {
    setCasaToEdit(casa);
    setIsModalOpen(true);
  };

  /**
   * Manejar envío del formulario (crear o editar)
   */
  const handleSubmit = async (data: CreateCasaDto) => {
    if (casaToEdit) {
      // Editar
      await updateCasa(casaToEdit.id, data);
    } else {
      // Crear
      await createCasa(data);
    }
    setIsModalOpen(false);
    setCasaToEdit(null);
  };

  /**
   * Manejar eliminación de casa
   */
  const handleDelete = async (casa: Casa) => {
    await deleteCasa(casa.id);
  };

  /**
   * Manejar recálculo de puntos
   */
  const handleRecalcularPuntos = async (casa: Casa) => {
    await recalcularPuntos(casa.id);
  };

  /**
   * Aplicar filtros
   */
  const handleApplyFilters = () => {
    handleFetchCasas();
  };

  /**
   * Limpiar filtros
   */
  const handleClearFilters = () => {
    setSearchTerm('');
    setSortBy('nombre');
    setOrder('asc');
    fetchCasas({ sortBy: 'nombre', order: 'asc' });
  };

  /**
   * Casas filtradas localmente (búsqueda instantánea)
   */
  const casasFiltradas = (casas || []).filter((casa: Casa) => {
    if (!casa) return false;
    if (!searchTerm.trim()) return true;
    return casa.nombre.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#2a1a5e]">Casas</h1>
          <p className="text-gray-600 mt-1">Gestiona las casas de gamificación</p>
        </div>
        <Button variant="primary" size="lg" onClick={handleOpenCreate}>
          ➕ Crear casa
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-5xl mb-2">🏆</div>
          <p className="text-3xl font-bold text-[#2a1a5e]">{isLoading ? '...' : total}</p>
          <p className="text-sm text-gray-600">{total === 1 ? 'Casa' : 'Casas'}</p>
        </Card>

        <Card className="text-center">
          <div className="text-5xl mb-2">👥</div>
          <p className="text-3xl font-bold text-[#2a1a5e]">
            {isLoading
              ? '...'
              : casas.reduce((sum: number, c: Casa) => sum + (c.estudiantes?.length || 0), 0)}
          </p>
          <p className="text-sm text-gray-600">Estudiantes totales</p>
        </Card>

        <Card className="text-center">
          <div className="text-5xl mb-2">🎯</div>
          <p className="text-3xl font-bold text-[#2a1a5e]">
            {isLoading
              ? '...'
              : casas.reduce((sum: number, c: Casa) => sum + c.puntos_totales, 0).toLocaleString()}
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
          <button onClick={clearError} className="text-red-600 hover:text-red-800 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Lista de casas */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 animate-bounce">⏳</div>
          <p className="text-xl text-gray-600">Cargando casas...</p>
        </div>
      ) : casasFiltradas.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-[#2a1a5e] mb-2">No se encontraron casas</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? 'Intenta con otro término de búsqueda'
              : 'Crea tu primera casa para comenzar'}
          </p>
          {!searchTerm && (
            <Button variant="primary" onClick={handleOpenCreate}>
              ➕ Crear primera casa
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {casasFiltradas.map((casa: Casa) => (
            <CasaCard
              key={casa.id}
              casa={casa}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onRecalcularPuntos={handleRecalcularPuntos}
            />
          ))}
        </div>
      )}

      {/* Modal de formulario */}
      <CasaFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCasaToEdit(null);
        }}
        onSubmit={handleSubmit}
        casaToEdit={casaToEdit}
      />
    </div>
  );
}
