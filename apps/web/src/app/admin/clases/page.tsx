'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import GestionarEstudiantesModal from '@/components/admin/GestionarEstudiantesModal';
import { ClasesTable, ClasesFilters, ClaseForm } from '@/components/admin/clases';
import { useClases, useClasesFormData, useClasesFilter, useClaseForm } from '@/hooks/useClases';
import {
  exportToExcel,
  exportToCSV,
  exportToPDF,
  formatClassesForExport
} from '@/lib/utils/export.utils';

type ModalType = 'create' | 'cancel' | 'view' | 'edit' | 'estudiantes' | null;

/**
 * Página de Gestión de Clases - REFACTORIZADA
 * De 785 líneas → ~150 líneas
 *
 * Arquitectura:
 * - useClases: Hook para estado y operaciones CRUD
 * - useClasesFormData: Hook para cargar datos de formulario
 * - useClasesFilter: Hook para filtrado
 * - useClaseForm: Hook para manejo de formulario
 * - ClasesTable: Componente de tabla
 * - ClasesFilters: Componente de filtros
 * - ClaseForm: Componente de formulario
 */
export default function AdminClasesPage() {
  // Hooks de estado y lógica
  const { clases, isLoading, error, fetchClases, createClase, cancelClase } = useClases();
  const { rutas, docentes, sectores } = useClasesFormData();
  const { filter, setFilter, filteredClases } = useClasesFilter(clases);
  const { formData, updateField, resetForm } = useClaseForm();

  // Estado de UI
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedClass, setSelectedClass] = useState<Record<string, unknown>>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Handlers
  const openModal = (type: ModalType, clase?: Record<string, unknown>) => {
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
    const success = await cancelClase(selectedClass.id);
    if (success) {
      closeModal();
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
        exportToPDF(formattedData, 'Clases', ['Nombre', 'Fecha', 'Docente', 'Cupos', 'Estado']);
        break;
    }

    setShowExportMenu(false);
  };

  // Calcular contadores para filtros
  const clasesCount = {
    all: clases.length,
    programadas: clases.filter((c) => c.estado === 'Programada').length,
    canceladas: clases.filter((c) => c.estado === 'Cancelada').length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Clases</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Button
              onClick={() => setShowExportMenu(!showExportMenu)}
              variant="secondary"
            >
              Exportar
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                <button
                  onClick={() => handleExport('excel')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  CSV (.csv)
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  PDF (.pdf)
                </button>
              </div>
            )}
          </div>
          <Button onClick={() => openModal('create')}>
            + Nueva Clase
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Filtros */}
      <ClasesFilters
        filter={filter}
        onFilterChange={setFilter}
        clasesCount={clasesCount}
      />

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando clases...</p>
        </div>
      )}

      {/* Tabla */}
      {!isLoading && (
        <ClasesTable
          clases={filteredClases}
          onViewClase={(clase) => openModal('view', clase)}
          onCancelClase={(clase) => openModal('cancel', clase)}
          onEditClase={(clase) => openModal('edit', clase)}
          onManageStudents={(clase) => openModal('estudiantes', clase)}
        />
      )}

      {/* Modal Crear/Editar */}
      {(modalType === 'create' || modalType === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {modalType === 'create' ? 'Nueva Clase' : 'Editar Clase'}
            </h2>
            <ClaseForm
              formData={formData}
              docentes={docentes}
              sectores={sectores}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Cancelar Clase</h2>
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que deseas cancelar la clase &quot;{selectedClass.nombre}&quot;?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelClass}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
              >
                Sí, Cancelar
              </button>
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                No, Volver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gestionar Estudiantes */}
      {modalType === 'estudiantes' && selectedClass && (
        <GestionarEstudiantesModal
          clase={selectedClass}
          onClose={closeModal}
          onSuccess={fetchClases}
        />
      )}
    </div>
  );
}
