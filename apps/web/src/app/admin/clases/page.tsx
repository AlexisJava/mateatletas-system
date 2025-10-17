'use client';
import { Button } from '@/components/ui';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/admin.store';
import * as adminApi from '@/lib/api/admin.api';
import {
  exportToExcel,
  exportToCSV,
  exportToPDF,
  formatClassesForExport
} from '@/lib/utils/export.utils';
import { Clase } from '@/types/clases.types';

type ModalType = 'create' | 'cancel' | 'view' | null;

export default function AdminClasesPage() {
  const { classes, fetchClasses, createClass, cancelClass, isLoading, error } = useAdminStore();
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'Programada' | 'Cancelada'>('all');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Form states
  const [rutas, setRutas] = useState<any[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    ruta_curricular_id: '',
    docente_id: '',
    fecha_hora_inicio: '',
    duracion_minutos: 60,
    cupo_maximo: 10,
  });

  useEffect(() => {
    fetchClasses();
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      const [rutasData, docentesData] = await Promise.all([
        adminApi.getRutasCurriculares(),
        adminApi.getDocentes(),
      ]);
      setRutas(rutasData as unknown as unknown[]);
      setDocentes(docentesData as unknown as unknown[]);
    } catch (err: unknown) {
      // Error loading form data
    }
  };

  const filteredClasses = filter === 'all'
    ? classes
    : classes.filter((c) => c.estado === filter);

  const handleCreateClass = async () => {
    // Convert local datetime to ISO 8601
    const isoDate = new Date(formData.fecha_hora_inicio).toISOString();
    const success = await createClass({
      rutaCurricularId: formData.ruta_curricular_id,
      docenteId: formData.docente_id,
      fechaHoraInicio: isoDate,
      duracionMinutos: formData.duracion_minutos,
      cuposMaximo: formData.cupo_maximo,
    });
    if (success) {
      closeModal();
      resetForm();
    }
  };

  const handleCancelClass = async () => {
    if (!selectedClass) return;
    const success = await cancelClass(selectedClass.id);
    if (success) {
      closeModal();
    }
  };

  const openModal = (type: ModalType, clase?: Clase) => {
    setSelectedClass(clase || null);
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedClass(null);
  };

  const resetForm = () => {
    setFormData({
      ruta_curricular_id: '',
      docente_id: '',
      fecha_hora_inicio: '',
      duracion_minutos: 60,
      cupo_maximo: 10,
    });
  };

  const handleExport = (format: 'excel' | 'csv' | 'pdf') => {
    const formattedData = formatClassesForExport(filteredClasses);
    const timestamp = new Date().getTime();

    if (format === 'excel') {
      exportToExcel(formattedData, `clases-${timestamp}`, 'Clases');
    } else if (format === 'csv') {
      exportToCSV(formattedData, `clases-${timestamp}`);
    } else {
      exportToPDF(
        formattedData,
        `clases-${timestamp}`,
        'Listado de Clases',
        [
          { header: 'Ruta', dataKey: 'Ruta Curricular' },
          { header: 'Docente', dataKey: 'Docente' },
          { header: 'Fecha', dataKey: 'Fecha' },
          { header: 'Cupos', dataKey: 'Cupos Ocupados' },
          { header: 'Estado', dataKey: 'Estado' }
        ]
      );
    }

    setShowExportMenu(false);
  };

  const estadoColors: Record<string, string> = {
    Programada: 'bg-green-100 text-green-800',
    Cancelada: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#2a1a5e]">Gestión de Clases</h1>
          <p className="text-gray-600 mt-1">Programá, editá y cancelá clases</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex gap-2">
            {(['all', 'Programada', 'Cancelada'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filter === f
                    ? 'bg-[#ff6b35] text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {f === 'all' ? 'Todas' : f}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center gap-2"
            >
              📊 Exportar
              <span className="text-xs">▼</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10">
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
                >
                  📊 Exportar a Excel
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
                >
                  📄 Exportar a CSV
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
                >
                  📕 Exportar a PDF
                </button>
              </div>
            )}
          </div>

          <Button
            variant="primary"
            onClick={() => openModal('create')}
            className="bg-gradient-to-r from-[#ff6b35] to-[#f7b801]"
          >
            + Nueva Clase
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="text-sm font-medium text-blue-700">Total Clases</div>
          <div className="text-2xl font-bold text-blue-900">{classes.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="text-sm font-medium text-green-700">Programadas</div>
          <div className="text-2xl font-bold text-green-900">
            {classes.filter((c) => c.estado === 'Programada').length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
          <div className="text-sm font-medium text-red-700">Canceladas</div>
          <div className="text-2xl font-bold text-red-900">
            {classes.filter((c) => c.estado === 'Cancelada').length}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Classes Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-[#ff6b35]"></div>
          <p className="mt-4 text-gray-600">Cargando clases...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No hay clases {filter !== 'all' ? filter.toLowerCase() + 's' : ''}</p>
          <Button
            variant="primary"
            onClick={() => openModal('create')}
            className="mt-4"
          >
            Crear Nueva Clase
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ruta / Docente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cupos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClasses.map((clase) => (
                <tr key={clase.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {clase.ruta_curricular?.nombre || clase.ruta_curricular?.nombre || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Prof. {clase.docente?.user?.nombre || 'N/A'} {clase.docente?.user?.apellido || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(clase.fecha_hora_inicio || clase.fecha_hora_inicio).toLocaleDateString('es-ES')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(clase.fecha_hora_inicio || clase.fecha_hora_inicio).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {clase.duracion_minutos || clase.duracion_minutos} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {clase.cupo_maximo - clase.cupo_disponible} / {clase.cupo_maximo}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-[#ff6b35] h-2 rounded-full"
                        style={{
                          width: `${((clase.cupo_maximo - clase.cupo_disponible) / clase.cupo_maximo) * 100}%`
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${estadoColors[clase.estado]}`}>
                      {clase.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button
                      onClick={() => openModal('view', clase)}
                      className="text-[#2a1a5e] hover:text-[#ff6b35] transition-colors"
                    >
                      Ver
                    </button>
                    {clase.estado === 'Programada' && (
                      <button
                        onClick={() => openModal('cancel', clase)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Class Modal */}
      {modalType === 'create' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl my-8">
            <h3 className="text-2xl font-bold text-[#2a1a5e] mb-6">Crear Nueva Clase</h3>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ruta Curricular *
                  </label>
                  <select
                    value={formData.ruta_curricular_id}
                    onChange={(e) => setFormData({ ...formData, ruta_curricular_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                    required
                  >
                    <option value="">Seleccioná una ruta</option>
                    {rutas.map((ruta) => (
                      <option key={ruta.id} value={ruta.id}>
                        {ruta.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Docente *
                  </label>
                  <select
                    value={formData.docente_id}
                    onChange={(e) => setFormData({ ...formData, docente_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                    required
                  >
                    <option value="">Seleccioná un docente</option>
                    {docentes.map((docente) => (
                      <option key={docente.id} value={docente.id}>
                        {docente.nombre} {docente.apellido}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha y Hora de Inicio *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.fecha_hora_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_hora_inicio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración (min) *
                  </label>
                  <input
                    type="number"
                    min="15"
                    value={formData.duracion_minutos}
                    onChange={(e) => setFormData({ ...formData, duracion_minutos: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cupos Máximos *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.cupo_maximo}
                  onChange={(e) => setFormData({ ...formData, cupo_maximo: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={closeModal} className="flex-1">
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateClass}
                className="flex-1"
                disabled={!formData.ruta_curricular_id || !formData.docente_id || !formData.fecha_hora_inicio}
              >
                Crear Clase
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Class Modal */}
      {modalType === 'cancel' && selectedClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-[#2a1a5e] mb-4">¿Cancelar clase?</h3>
            <p className="text-gray-600 mb-2">
              Estás por cancelar la clase de <strong>{selectedClass.ruta_curricular?.nombre || selectedClass.ruta_curricular?.nombre}</strong>
            </p>
            <p className="text-sm text-red-600 mb-6">Los estudiantes inscritos serán notificados.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={closeModal} className="flex-1">
                Volver
              </Button>
              <Button
                variant="primary"
                onClick={handleCancelClass}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                Cancelar Clase
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Class Modal */}
      {modalType === 'view' && selectedClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl my-8">
            <h3 className="text-2xl font-bold text-[#2a1a5e] mb-6">Detalles de la Clase</h3>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Ruta Curricular</div>
                  <div className="text-lg font-bold text-gray-900 mt-1">
                    {selectedClass.ruta_curricular?.nombre || selectedClass.ruta_curricular?.nombre}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedClass.ruta_curricular?.descripcion || selectedClass.ruta_curricular?.descripcion}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Docente</div>
                  <div className="text-lg font-bold text-gray-900 mt-1">
                    {selectedClass.docente?.nombre} {selectedClass.docente?.apellido}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedClass.docente?.titulo || 'Profesor'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm font-medium text-gray-500">Fecha</div>
                  <div className="text-sm text-gray-900 mt-1">
                    {new Date(selectedClass.fecha_hora_inicio || selectedClass.fecha_hora_inicio).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Hora</div>
                  <div className="text-sm text-gray-900 mt-1">
                    {new Date(selectedClass.fecha_hora_inicio || selectedClass.fecha_hora_inicio).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Duración</div>
                  <div className="text-sm text-gray-900 mt-1">
                    {selectedClass.duracion_minutos || selectedClass.duracion_minutos} minutos
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm font-medium text-gray-500">Cupos</div>
                  <div className="text-sm text-gray-900 mt-1">
                    {selectedClass.cupos_ocupados || selectedClass.cuposOcupados || 0} / {selectedClass.cupos_maximo || selectedClass.cupo_maximo}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-[#ff6b35] h-2 rounded-full"
                      style={{
                        width: `${((selectedClass.cupos_ocupados || selectedClass.cuposOcupados || 0) / (selectedClass.cupos_maximo || selectedClass.cupo_maximo)) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Estado</div>
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mt-1 ${estadoColors[selectedClass.estado]}`}>
                    {selectedClass.estado}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={closeModal} className="flex-1">
                Cerrar
              </Button>
              {selectedClass.estado === 'Programada' && (
                <Button
                  variant="primary"
                  onClick={() => setModalType('cancel')}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  Cancelar Clase
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
