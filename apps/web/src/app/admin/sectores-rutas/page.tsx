'use client';

import { useEffect, useState } from 'react';
import { useSectoresStore } from '@/store/sectores.store';
import { Button } from '@/components/ui';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import type {
  Sector,
  RutaEspecialidad,
  CreateSectorDto,
  CreateRutaEspecialidadDto,
} from '@/types/sectores.types';

type TabType = 'sectores' | 'rutas';
type ModalType = 'createSector' | 'editSector' | 'createRuta' | 'editRuta' | null;

export default function SectoresRutasPage() {
  const {
    sectores,
    rutas,
    isLoading,
    error,
    fetchSectores,
    fetchRutas,
    crearSector,
    actualizarSector,
    eliminarSector,
    crearRuta,
    actualizarRuta,
    eliminarRuta,
  } = useSectoresStore();

  const [activeTab, setActiveTab] = useState<TabType>('sectores');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [selectedRuta, setSelectedRuta] = useState<RutaEspecialidad | null>(null);
  const [filterSectorId, setFilterSectorId] = useState<string>('');

  // Form states para Sector
  const [sectorForm, setSectorForm] = useState<CreateSectorDto>({
    nombre: '',
    descripcion: '',
    color: '#6366F1',
    icono: '📚',
  });

  // Form states para Ruta
  const [rutaForm, setRutaForm] = useState<CreateRutaEspecialidadDto>({
    nombre: '',
    descripcion: '',
    sectorId: '',
  });

  useEffect(() => {
    fetchSectores();
    fetchRutas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================================
  // SECTORES - Handlers
  // ============================================================================

  const openCreateSector = () => {
    setSectorForm({
      nombre: '',
      descripcion: '',
      color: '#6366F1',
      icono: '📚',
    });
    setModalType('createSector');
  };

  const openEditSector = (sector: Sector) => {
    setSelectedSector(sector);
    setSectorForm({
      nombre: sector.nombre,
      descripcion: sector.descripcion || '',
      color: sector.color,
      icono: sector.icono,
    });
    setModalType('editSector');
  };

  const handleCreateSector = async () => {
    const result = await crearSector(sectorForm);
    if (result) {
      setModalType(null);
      await fetchRutas(); // Refresh rutas para que tengan el nuevo sector disponible
    }
  };

  const handleUpdateSector = async () => {
    if (!selectedSector) return;
    const result = await actualizarSector(selectedSector.id, sectorForm);
    if (result) {
      setModalType(null);
      setSelectedSector(null);
    }
  };

  const handleDeleteSector = async (sector: Sector) => {
    if (!confirm(`¿Seguro que quieres eliminar el sector "${sector.nombre}"?`)) return;
    await eliminarSector(sector.id);
  };

  // ============================================================================
  // RUTAS - Handlers
  // ============================================================================

  const openCreateRuta = () => {
    setRutaForm({
      nombre: '',
      descripcion: '',
      sectorId: filterSectorId || sectores[0]?.id || '',
    });
    setModalType('createRuta');
  };

  const openEditRuta = (ruta: RutaEspecialidad) => {
    setSelectedRuta(ruta);
    setRutaForm({
      nombre: ruta.nombre,
      descripcion: ruta.descripcion || '',
      sectorId: ruta.sectorId,
    });
    setModalType('editRuta');
  };

  const handleCreateRuta = async () => {
    const result = await crearRuta(rutaForm);
    if (result) {
      setModalType(null);
      await fetchRutas(filterSectorId || undefined);
    }
  };

  const handleUpdateRuta = async () => {
    if (!selectedRuta) return;
    const result = await actualizarRuta(selectedRuta.id, rutaForm);
    if (result) {
      setModalType(null);
      setSelectedRuta(null);
      await fetchRutas(filterSectorId || undefined);
    }
  };

  const handleDeleteRuta = async (ruta: RutaEspecialidad) => {
    if (!confirm(`¿Seguro que quieres eliminar la ruta "${ruta.nombre}"?`)) return;
    await eliminarRuta(ruta.id);
    await fetchRutas(filterSectorId || undefined);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedSector(null);
    setSelectedRuta(null);
  };

  // Filtrar rutas por sector seleccionado
  const filteredRutas = filterSectorId ? rutas.filter((r) => r.sectorId === filterSectorId) : rutas;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Sectores y Rutas de Especialidad</h1>
          <p className="text-indigo-600 dark:text-indigo-300">
            Gestiona los sectores y sus rutas personalizadas
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('sectores')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'sectores'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-emerald-500/[0.05]/70 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 hover:bg-emerald-500/[0.05] dark:hover:bg-indigo-900/50'
            }`}
          >
            📚 Sectores ({sectores.length})
          </button>
          <button
            onClick={() => setActiveTab('rutas')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'rutas'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-emerald-500/[0.05]/70 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 hover:bg-emerald-500/[0.05] dark:hover:bg-purple-900/50'
            }`}
          >
            🛤️ Rutas ({rutas.length})
          </button>
        </div>

        {/* ====================================================================== */}
        {/* TAB: SECTORES */}
        {/* ====================================================================== */}
        {activeTab === 'sectores' && (
          <div>
            {/* Header con botón crear */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Sectores</h2>
              <Button onClick={openCreateSector} className="flex items-center gap-2">
                <Plus size={20} /> Crear Sector
              </Button>
            </div>

            {/* Grid de sectores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sectores.map((sector) => (
                <div
                  key={sector.id}
                  className="backdrop-blur-xl bg-emerald-500/[0.08] rounded-2xl p-6 shadow-xl border border-emerald-500/20 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-4xl p-3 rounded-xl"
                        style={{ backgroundColor: sector.color + '20' }}
                      >
                        {sector.icono}
                      </span>
                      <div>
                        <h3 className="text-xl font-bold text-white">{sector.nombre}</h3>
                        <p className="text-sm text-indigo-600 dark:text-indigo-300">
                          {sector._count?.rutas || 0} rutas
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditSector(sector)}
                        className="p-2 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteSector(sector)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  {sector.descripcion && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{sector.descripcion}</p>
                  )}
                </div>
              ))}
            </div>

            {sectores.length === 0 && !isLoading && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No hay sectores creados. Crea el primero!
              </div>
            )}
          </div>
        )}

        {/* ====================================================================== */}
        {/* TAB: RUTAS */}
        {/* ====================================================================== */}
        {activeTab === 'rutas' && (
          <div>
            {/* Header con filtro y botón crear */}
            <div className="flex justify-between items-center mb-6 gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-purple-900 dark:text-white">
                  Rutas de Especialidad
                </h2>
                <select
                  value={filterSectorId}
                  onChange={(e) => {
                    setFilterSectorId(e.target.value);
                    fetchRutas(e.target.value || undefined);
                  }}
                  className="px-4 py-2 border border-purple-300 dark:border-purple-700 rounded-lg bg-emerald-500/[0.05]/90 dark:bg-purple-950/50 text-purple-900 dark:text-purple-100"
                >
                  <option value="">Todos los sectores</option>
                  {sectores.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.icono} {sector.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={openCreateRuta}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              >
                <Plus size={20} /> Crear Ruta
              </Button>
            </div>

            {/* Tabla de rutas */}
            <div className="backdrop-blur-xl bg-emerald-500/[0.05]/85 dark:bg-purple-950/85 rounded-2xl shadow-xl border border-emerald-500/20 overflow-hidden">
              <table className="w-full">
                <thead className="bg-purple-100 dark:bg-purple-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-purple-900 dark:text-purple-100">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-purple-900 dark:text-purple-100">
                      Sector
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-purple-900 dark:text-purple-100">
                      Descripción
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-purple-900 dark:text-purple-100">
                      Docentes
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-purple-900 dark:text-purple-100">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRutas.map((ruta) => {
                    const sector = sectores.find((s) => s.id === ruta.sectorId);
                    return (
                      <tr
                        key={ruta.id}
                        className="border-b border-emerald-500/20 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition"
                      >
                        <td className="px-6 py-4">
                          <span className="font-semibold text-purple-900 dark:text-purple-100">
                            {ruta.nombre}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {sector && (
                            <span
                              className="px-3 py-1 rounded-lg text-sm font-medium"
                              style={{
                                backgroundColor: sector.color + '20',
                                color: sector.color,
                              }}
                            >
                              {sector.icono} {sector.nombre}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300 text-sm">
                          {ruta.descripcion || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-white/60">
                          {ruta._count?.docentes || 0} docentes
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditRuta(ruta)}
                              className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteRuta(ruta)}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredRutas.length === 0 && !isLoading && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  {filterSectorId
                    ? 'No hay rutas en este sector. Crea la primera!'
                    : 'No hay rutas creadas. Crea la primera!'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* MODALS */}
        {/* ====================================================================== */}

        {/* Modal: Crear/Editar Sector */}
        {(modalType === 'createSector' || modalType === 'editSector') && (
          <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-xl bg-emerald-500/[0.05]/95 dark:bg-indigo-950/95 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-indigo-200/30 dark:border-indigo-700/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {modalType === 'createSector' ? 'Crear Sector' : 'Editar Sector'}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={sectorForm.nombre}
                    onChange={(e) => setSectorForm({ ...sectorForm, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-indigo-300 dark:border-indigo-700 rounded-lg bg-emerald-500/[0.05]/90 dark:bg-indigo-950/50"
                    placeholder="Ej: Matemática, Programación"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={sectorForm.descripcion}
                    onChange={(e) => setSectorForm({ ...sectorForm, descripcion: e.target.value })}
                    className="w-full px-4 py-2 border border-indigo-300 dark:border-indigo-700 rounded-lg bg-emerald-500/[0.05]/90 dark:bg-indigo-950/50"
                    rows={3}
                    placeholder="Descripción del sector"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-2">
                      Color
                    </label>
                    <input
                      type="color"
                      value={sectorForm.color}
                      onChange={(e) => setSectorForm({ ...sectorForm, color: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-2">
                      Icono (emoji)
                    </label>
                    <input
                      type="text"
                      value={sectorForm.icono}
                      onChange={(e) => setSectorForm({ ...sectorForm, icono: e.target.value })}
                      className="w-full px-4 py-2 border border-indigo-300 dark:border-indigo-700 rounded-lg bg-emerald-500/[0.05]/90 dark:bg-indigo-950/50 text-center text-2xl"
                      placeholder="📚"
                      maxLength={2}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={modalType === 'createSector' ? handleCreateSector : handleUpdateSector}
                    disabled={!sectorForm.nombre || isLoading}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Save size={20} />
                    {modalType === 'createSector' ? 'Crear' : 'Guardar'}
                  </Button>
                  <button
                    onClick={closeModal}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Crear/Editar Ruta */}
        {(modalType === 'createRuta' || modalType === 'editRuta') && (
          <div className="fixed inset-0 bg-purple-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-xl bg-emerald-500/[0.05]/95 dark:bg-purple-950/95 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-emerald-500/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-purple-900 dark:text-white">
                  {modalType === 'createRuta' ? 'Crear Ruta' : 'Editar Ruta'}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
                    Sector *
                  </label>
                  <select
                    value={rutaForm.sectorId}
                    onChange={(e) => setRutaForm({ ...rutaForm, sectorId: e.target.value })}
                    className="w-full px-4 py-2 border border-purple-300 dark:border-purple-700 rounded-lg bg-emerald-500/[0.05]/90 dark:bg-purple-950/50"
                  >
                    <option value="">Selecciona un sector</option>
                    {sectores.map((sector) => (
                      <option key={sector.id} value={sector.id}>
                        {sector.icono} {sector.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={rutaForm.nombre}
                    onChange={(e) => setRutaForm({ ...rutaForm, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-purple-300 dark:border-purple-700 rounded-lg bg-emerald-500/[0.05]/90 dark:bg-purple-950/50"
                    placeholder="Ej: Roblox, Base-Progresivo, Lógico-Desafiante"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={rutaForm.descripcion}
                    onChange={(e) => setRutaForm({ ...rutaForm, descripcion: e.target.value })}
                    className="w-full px-4 py-2 border border-purple-300 dark:border-purple-700 rounded-lg bg-emerald-500/[0.05]/90 dark:bg-purple-950/50"
                    rows={3}
                    placeholder="Descripción de la ruta"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={modalType === 'createRuta' ? handleCreateRuta : handleUpdateRuta}
                    disabled={!rutaForm.nombre || !rutaForm.sectorId || isLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <Save size={20} />
                    {modalType === 'createRuta' ? 'Crear' : 'Guardar'}
                  </Button>
                  <button
                    onClick={closeModal}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
