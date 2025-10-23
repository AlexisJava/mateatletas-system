'use client';

import { useState, useEffect } from 'react';
import { Download, Plus } from 'lucide-react';
import GestionarEstudiantesModal from '@/components/admin/GestionarEstudiantesModal';
import { ClasesCards, ClasesFilters, ClaseForm } from '@/components/admin/clases';
import { useClases, useClasesFormData, useClasesFilter, useClaseForm } from '@/hooks/useClases';
import {
  exportToExcel,
  exportToCSV,
  exportToPDF,
  formatClassesForExport
} from '@/lib/utils/export.utils';
import type { ClaseListado } from '@/types/admin-clases.types';

type ModalType = 'create' | 'cancel' | 'view' | 'edit' | 'estudiantes' | 'delete' | null;

/**
 * Página de Gestión de Clases - MATEATLETAS OS
 * Rediseñada con sistema de cards y filtros por sector
 */
export default function AdminClasesPage() {
  // Hooks de estado y lógica
  const { clases, isLoading, error, fetchClases, createClase, cancelClase } = useClases();
  const { docentes, sectores } = useClasesFormData();
  const { filter, sectorFilter, setFilter, setSectorFilter, filteredClases } = useClasesFilter(clases);
  const { formData, updateField, resetForm } = useClaseForm();

  // Estado de UI
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedClass, setSelectedClass] = useState<ClaseListado | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Cargar clases al montar el componente
  useEffect(() => {
    fetchClases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const openModal = (type: ModalType, clase?: ClaseListado) => {
    setModalType(type);
    setSelectedClass(clase || null);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedClass(null);
  };

  const handleCreateClass = async () => {
    const isoDate = new Date(formData.fecha_hora_inicio).toISOString();
    const success = await createClase({
      nombre: formData.nombre,
      docenteId: formData.docente_id,
      sectorId: formData.sector_id || undefined,
      fechaHoraInicio: isoDate,
      duracionMinutos: formData.duracion_minutos,
      cuposMaximo: formData.cupo_maximo,
      descripcion: formData.descripcion || undefined,
    });

    if (success) {
      closeModal();
      resetForm();
    }
  };

  const handleCancelClass = async () => {
    if (!selectedClass) return;
    const success = await cancelClase(selectedClass.id as string);
    if (success) {
      closeModal();
    }
  };

  const handleDeleteClass = async () => {
    if (!selectedClass) return;

    try {
      setIsLoading(true);
      await apiClient.delete(`/clases/${selectedClass.id}`);

      // Reload classes
      await loadClases();

      closeModal();
    } catch (err: unknown) {
      console.error('Error al eliminar clase:', err);
      alert('Error al eliminar la clase. Por favor intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Export handlers
  const handleExport = (format: 'excel' | 'csv' | 'pdf') => {
    const formattedData = formatClassesForExport(filteredClases);

    switch (format) {
      case 'excel':
        exportToExcel(formattedData, 'clases');
        break;
      case 'csv':
        exportToCSV(formattedData, 'clases');
        break;
      case 'pdf':
        exportToPDF(formattedData, 'clases', 'Listado de Clases', [
          { header: 'ID', dataKey: 'ID' },
          { header: 'Ruta', dataKey: 'Ruta Curricular' },
          { header: 'Docente', dataKey: 'Docente' },
          { header: 'Fecha', dataKey: 'Fecha' },
          { header: 'Hora', dataKey: 'Hora' },
          { header: 'Estado', dataKey: 'Estado' }
        ]);
        break;
    }

    setShowExportMenu(false);
  };

  // Calcular contadores para filtros
  const clasesCount = {
    all: clases.length,
    programadas: clases.filter((c) => c.estado === 'Programada').length,
    canceladas: clases.filter((c) => c.estado === 'Cancelada').length,
    activas: clases.filter((c) => c.estado === 'Activa').length,
  };

  const sectoresCount = {
    all: clases.length,
    matematica: clases.filter((c) => c.docente?.sector?.nombre === 'Matemática').length,
    programacion: clases.filter((c) => c.docente?.sector?.nombre === 'Programación').length,
    ciencias: clases.filter((c) => c.docente?.sector?.nombre === 'Ciencias').length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Gestión de Clases
          </h1>
          <p className="text-gray-600 mt-1">
            Administra las clases del sistema
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 backdrop-blur-xl bg-emerald-500/[0.08] border border-emerald-500/30 hover:bg-emerald-500/20 text-white/90 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 backdrop-blur-xl bg-gradient-to-br from-emerald-900/95 to-teal-900/95 rounded-xl shadow-2xl shadow-emerald-500/20 border border-emerald-500/30 overflow-hidden z-20">
                <button
                  onClick={() => handleExport('excel')}
                  className="block w-full text-left px-4 py-2 text-white/90 hover:bg-green-500/20 transition-all text-sm font-medium border-b border-emerald-500/20"
                >
                  📊 Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="block w-full text-left px-4 py-2 text-white/90 hover:bg-blue-500/20 transition-all text-sm font-medium border-b border-emerald-500/20"
                >
                  📄 CSV (.csv)
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="block w-full text-left px-4 py-2 text-white/90 hover:bg-red-500/20 transition-all text-sm font-medium"
                >
                  📕 PDF (.pdf)
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => openModal('create')}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/30 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Clase
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {/* Filtros */}
      <ClasesFilters
        filter={filter}
        sectorFilter={sectorFilter}
        onFilterChange={setFilter}
        onSectorFilterChange={setSectorFilter}
        clasesCount={clasesCount}
        sectoresCount={sectoresCount}
      />

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando clases...</p>
        </div>
      )}

      {/* Cards */}
      {!isLoading && (
        <ClasesCards clases={filteredClases} />
      )}

      {/* Modal Crear/Editar */}
      {(modalType === 'create' || modalType === 'edit') && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-900/95 to-teal-900/95 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-emerald-500/30 shadow-2xl shadow-emerald-500/20">
            <h2 className="text-2xl font-bold mb-6 text-white">
              {modalType === 'create' ? 'Nueva Clase' : 'Editar Clase'}
            </h2>
            <ClaseForm
              formData={formData}
              docentes={docentes as { id: string; nombre: string; apellido: string }[]}
              sectores={sectores as { id: string; nombre: string }[]}
              onFieldChange={updateField}
              onSubmit={handleCreateClass}
              onCancel={closeModal}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Modal Cancelar */}
      {modalType === 'cancel' && selectedClass && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-900/95 to-teal-900/95 rounded-xl p-6 max-w-md w-full border border-emerald-500/30 shadow-2xl shadow-emerald-500/20">
            <h2 className="text-2xl font-bold mb-4 text-white">Cancelar Clase</h2>
            <p className="text-white/70 mb-2">
              ¿Estás seguro de que deseas cancelar esta clase?
            </p>
            <p className="text-purple-300 font-bold mb-6">
              {selectedClass.nombre}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelClass}
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-rose-600 transition-all shadow-lg shadow-red-500/30 font-semibold"
              >
                Sí, Cancelar
              </button>
              <button
                onClick={closeModal}
                className="flex-1 backdrop-blur-xl bg-emerald-500/[0.08] border border-emerald-500/30 text-white/90 py-2 px-4 rounded-lg hover:bg-emerald-500/20 transition-all font-semibold"
              >
                No, Volver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modalType === 'delete' && selectedClass && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-900/95 to-teal-900/95 rounded-xl p-6 max-w-md w-full border border-red-500/50 shadow-2xl shadow-red-500/30">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Eliminar Clase Permanentemente</h2>
            <p className="text-white/70 mb-2">
              ¿Estás seguro de que deseas <span className="text-red-400 font-bold">eliminar permanentemente</span> esta clase?
            </p>
            <p className="text-purple-300 font-bold mb-3">
              {selectedClass.nombre}
            </p>
            <p className="text-yellow-300/80 text-sm mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              ⚠️ Esta acción no se puede deshacer. Se eliminarán también todas las inscripciones asociadas.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteClass}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white py-2 px-4 rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-lg shadow-red-500/40 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
              <button
                onClick={closeModal}
                disabled={isLoading}
                className="flex-1 backdrop-blur-xl bg-emerald-500/[0.08] border border-emerald-500/30 text-white/90 py-2 px-4 rounded-lg hover:bg-emerald-500/20 transition-all font-semibold disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gestionar Estudiantes */}
      {modalType === 'estudiantes' && selectedClass && (
        <GestionarEstudiantesModal
          claseId={selectedClass.id as string}
          claseNombre={String(selectedClass.nombre ?? 'Clase')}
          onClose={closeModal}
          onSuccess={fetchClases}
        />
      )}
    </div>
  );
}
