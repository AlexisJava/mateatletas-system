'use client';
import { Button } from '@/components/ui';
import GestionarEstudiantesModal from '@/components/admin/GestionarEstudiantesModal';

import { useEffect, useState, useCallback } from 'react';
import { useAdminStore } from '@/store/admin.store';
import * as adminApi from '@/lib/api/admin.api';
import {
  exportToExcel,
  exportToCSV,
  exportToPDF,
  formatClassesForExport
} from '@/lib/utils/export.utils';
import { Clase } from '@/types/clases.types';

type ModalType = 'create' | 'cancel' | 'view' | 'edit' | 'estudiantes' | null;

export default function AdminClasesPage() {
  const { classes, fetchClasses, createClass, cancelClass, isLoading, error } = useAdminStore();
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'Programada' | 'Cancelada'>('all');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Asegurar que classes siempre sea un array
  const safeClasses = Array.isArray(classes) ? classes : [];

  // Form states
  const [rutas, setRutas] = useState<any[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [sectores, setSectores] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    nombre: '',
    docente_id: '',
    sector_id: '',
    fecha_hora_inicio: '',
    duracion_minutos: 90,
    cupo_maximo: 10,
    descripcion: '',
  });

  const loadFormData = useCallback(async () => {
    try {
      const [rutasResponse, docentesResponse, sectoresResponse] = await Promise.all([
        adminApi.getRutasCurriculares(),
        adminApi.getDocentes(),
        adminApi.getSectores(),
      ]);

      const rutasData = Array.isArray(rutasResponse)
        ? rutasResponse
        : (rutasResponse as any)?.data || [];
      const docentesData = Array.isArray(docentesResponse)
        ? docentesResponse
        : (docentesResponse as any)?.data || [];
      const sectoresData = Array.isArray(sectoresResponse)
        ? sectoresResponse
        : (sectoresResponse as any)?.data || [];

      setRutas(rutasData);
      setDocentes(docentesData);
      setSectores(sectoresData);
    } catch (err: unknown) {
      console.error('Error loading form data:', err);
      setRutas([]);
      setDocentes([]);
      setSectores([]);
    }
  }, []); // Sin dependencias porque usa setState que es estable

  useEffect(() => {
    fetchClasses();
    loadFormData();
  }, [fetchClasses, loadFormData]);

  const filteredClasses = filter === 'all'
    ? safeClasses
    : safeClasses.filter((c) => c.estado === filter);

  const handleCreateClass = async () => {
    const isoDate = new Date(formData.fecha_hora_inicio).toISOString();
    const success = await createClass({
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
    const success = await cancelClass(selectedClass.id);
    if (success) {
      closeModal();
    }
  };

  const openModal = (type: ModalType, clase?: Clase) => {
    setSelectedClass(clase || null);
    setModalType(type);

    if (type === 'edit' && clase) {
      const fechaInicio = new Date(clase.fecha_hora_inicio);
      const fechaLocal = new Date(fechaInicio.getTime() - fechaInicio.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      setFormData({
        nombre: clase.nombre || clase.ruta_curricular?.nombre || '',
        docente_id: clase.docente_id || clase.docente?.id || '',
        sector_id: (clase as any).sector_id || '',
        fecha_hora_inicio: fechaLocal,
        duracion_minutos: clase.duracion_minutos || 90,
        cupo_maximo: clase.cupos_maximo || clase.cupo_maximo || 10,
        descripcion: clase.descripcion || '',
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedClass(null);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      docente_id: '',
      sector_id: '',
      fecha_hora_inicio: '',
      duracion_minutos: 90,
      cupo_maximo: 10,
      descripcion: '',
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
    Programada: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    Cancelada: 'bg-red-500/20 text-red-300 border border-red-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Gestión de Clases</h1>
          <p className="text-white/60 mt-1 text-sm">Programá, editá y cancelá clases</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Filtros - Stack en móvil, inline en tablet+ */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'Programada', 'Cancelada'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 md:px-4 py-2 rounded-xl font-semibold transition-all text-sm ${
                  filter === f
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-emerald-500/10 text-white/70 hover:bg-emerald-500/20 hover:text-emerald-400'
                }`}
              >
                {f === 'all' ? 'Todas' : f}
              </button>
            ))}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            {/* Export Button */}
            <div className="relative flex-1 sm:flex-none">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="w-full sm:w-auto px-3 md:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-sm"
              >
                📊 <span className="hidden sm:inline">Exportar</span>
                <span className="text-xs">▼</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 backdrop-blur-xl bg-emerald-500/[0.08] rounded-xl shadow-2xl shadow-emerald-500/20 border border-emerald-500/20 py-2 z-10">
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full px-4 py-2 text-left text-white hover:bg-emerald-500/20 flex items-center gap-2 text-sm transition-colors"
                  >
                    📊 Exportar a Excel
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full px-4 py-2 text-left text-white hover:bg-emerald-500/20 flex items-center gap-2 text-sm transition-colors"
                  >
                    📄 Exportar a CSV
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full px-4 py-2 text-left text-white hover:bg-emerald-500/20 flex items-center gap-2 text-sm transition-colors"
                  >
                    📕 Exportar a PDF
                  </button>
                </div>
              )}
            </div>

            <Button
              variant="primary"
              onClick={() => openModal('create')}
              className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/30 transition-all text-sm"
            >
              + <span className="hidden sm:inline">Nueva</span> Clase
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="backdrop-blur-xl bg-emerald-500/[0.05] border border-emerald-500/20 rounded-2xl p-6 hover:bg-emerald-500/[0.08] transition-all">
          <div className="text-sm font-medium text-white/60">Total Clases</div>
          <div className="text-3xl font-bold text-white mt-2">{safeClasses.length}</div>
        </div>
        <div className="backdrop-blur-xl bg-emerald-500/[0.05] border border-emerald-500/20 rounded-2xl p-6 hover:bg-emerald-500/[0.08] transition-all">
          <div className="text-sm font-medium text-emerald-300">Programadas</div>
          <div className="text-3xl font-bold text-emerald-100 mt-2">
            {safeClasses.filter((c) => c.estado === 'Programada').length}
          </div>
        </div>
        <div className="backdrop-blur-xl bg-emerald-500/[0.05] border border-emerald-500/20 rounded-2xl p-6 hover:bg-emerald-500/[0.08] transition-all">
          <div className="text-sm font-medium text-red-300">Canceladas</div>
          <div className="text-3xl font-bold text-red-100 mt-2">
            {safeClasses.filter((c) => c.estado === 'Cancelada').length}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Classes Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-emerald-500/20 border-t-emerald-400"></div>
          <p className="mt-4 text-white/60">Cargando clases...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="backdrop-blur-xl bg-emerald-500/[0.05] border border-emerald-500/20 rounded-2xl shadow-2xl shadow-emerald-500/10 p-12 text-center">
          <p className="text-white/60 text-lg">No hay clases {filter !== 'all' ? filter.toLowerCase() + 's' : ''}</p>
          <Button
            variant="primary"
            onClick={() => openModal('create')}
            className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-500"
          >
            Crear Nueva Clase
          </Button>
        </div>
      ) : (
        <div className="backdrop-blur-xl bg-emerald-500/[0.05] border border-emerald-500/20 rounded-2xl shadow-2xl shadow-emerald-500/10 overflow-hidden">
          {/* Wrapper para horizontal scroll en móvil */}
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-emerald-500/20">
            <thead className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-emerald-100">
                  Clase / Docente
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-emerald-100">
                  Fecha y Hora
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-emerald-100">
                  Duración
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-emerald-100">
                  Cupos
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-emerald-100">
                  Estado
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-emerald-100">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/10">
              {filteredClasses.map((clase) => (
                <tr key={clase.id} className="hover:bg-emerald-500/[0.08] transition-all">
                  <td className="px-6 py-4">
                    <div className="text-base font-bold text-white">
                      {clase.nombre || clase.ruta_curricular?.nombre || 'Sin nombre'}
                    </div>
                    <div className="text-sm text-white/60 mt-1">
                      👨‍🏫 {clase.docente?.user?.nombre || clase.docente?.nombre || 'N/A'} {clase.docente?.user?.apellido || clase.docente?.apellido || ''}
                    </div>
                    {clase.descripcion && (
                      <div className="text-xs text-emerald-300 mt-1 font-semibold bg-emerald-500/20 inline-block px-2 py-1 rounded-lg">
                        👥 {clase.descripcion}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {new Date(clase.fecha_hora_inicio).toLocaleDateString('es-ES')}
                    </div>
                    <div className="text-sm text-white/50">
                      {new Date(clase.fecha_hora_inicio).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {clase.duracion_minutos} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {clase.cupos_ocupados || 0} / {clase.cupos_maximo}
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 mt-1">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                        style={{
                          width: `${((clase.cupos_ocupados || 0) / clase.cupos_maximo) * 100}%`
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${estadoColors[clase.estado]}`}>
                      {clase.estado}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-medium">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <button
                        onClick={() => openModal('view', clase)}
                        className="px-2 md:px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-all font-semibold text-xs whitespace-nowrap"
                      >
                        👁 <span className="hidden lg:inline">Ver</span>
                      </button>
                      {clase.estado === 'Programada' && (
                        <>
                          <button
                            onClick={() => openModal('estudiantes', clase)}
                            className="px-2 md:px-3 py-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all font-semibold text-xs whitespace-nowrap"
                            title="Gestionar estudiantes"
                          >
                            👥 <span className="hidden xl:inline">Estudiantes</span>
                          </button>
                          <button
                            onClick={() => openModal('edit', clase)}
                            className="px-2 md:px-3 py-1.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-lg hover:bg-teal-500/30 transition-all font-semibold text-xs whitespace-nowrap"
                          >
                            ✏️ <span className="hidden lg:inline">Editar</span>
                          </button>
                          <button
                            onClick={() => openModal('cancel', clase)}
                            className="px-2 md:px-3 py-1.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all font-semibold text-xs whitespace-nowrap"
                          >
                            ❌ <span className="hidden lg:inline">Cancelar</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Create Class Modal */}
      {modalType === 'create' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="backdrop-blur-xl bg-emerald-500/[0.08] border border-emerald-500/20 rounded-2xl p-8 max-w-3xl w-full shadow-2xl shadow-emerald-500/20 my-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg shadow-emerald-500/40">
                ✨
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Crear Nueva Clase</h3>
                <p className="text-sm text-white/60">Definí los detalles de la clase libremente</p>
              </div>
            </div>

            <div className="space-y-5 mb-6">
              {/* Nombre de la Clase */}
              <div>
                <label className="block text-sm font-semibold text-emerald-100 mb-2">
                  Nombre de la Clase *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="ej: Godot, Scratch, Preparación Olimpiadas, Lunes 18:00 Grupo A..."
                  className="w-full px-4 py-3 bg-black/40 border border-emerald-500/30 text-white placeholder-white/30 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-base"
                  required
                />
                <p className="text-xs text-white/40 mt-1">Podés escribir lo que quieras: el tema, el día, el grupo, etc.</p>
              </div>

              {/* Docente, Sector y Fecha/Hora */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-emerald-100 mb-2">
                    Docente *
                  </label>
                  <select
                    value={formData.docente_id}
                    onChange={(e) => setFormData({ ...formData, docente_id: e.target.value })}
                    className="w-full px-4 py-3 bg-black/40 border border-emerald-500/30 text-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                    required
                  >
                    <option value="" className="bg-gray-900">Seleccioná un docente</option>
                    {docentes.map((docente) => (
                      <option key={docente.id} value={docente.id} className="bg-gray-900">
                        {docente.nombre} {docente.apellido}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-emerald-100 mb-2">
                    Sector *
                  </label>
                  <select
                    value={formData.sector_id}
                    onChange={(e) => setFormData({ ...formData, sector_id: e.target.value })}
                    className="w-full px-4 py-3 bg-black/40 border border-emerald-500/30 text-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                    required
                  >
                    <option value="" className="bg-gray-900">Seleccioná un sector</option>
                    {sectores.map((sector) => (
                      <option key={sector.id} value={sector.id} className="bg-gray-900">
                        {sector.icono} {sector.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-emerald-100 mb-2">
                    Fecha y Hora de Inicio *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.fecha_hora_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_hora_inicio: e.target.value })}
                    className="w-full px-4 py-3 bg-black/40 border border-emerald-500/30 text-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Duración y Cupos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-emerald-100 mb-2">
                    Duración (minutos) *
                  </label>
                  <select
                    value={formData.duracion_minutos}
                    onChange={(e) => setFormData({ ...formData, duracion_minutos: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-black/40 border border-emerald-500/30 text-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                    required
                  >
                    <option value={30} className="bg-gray-900">30 minutos</option>
                    <option value={45} className="bg-gray-900">45 minutos</option>
                    <option value={60} className="bg-gray-900">1 hora (60 min)</option>
                    <option value={90} className="bg-gray-900">1 hora 30 min (90 min)</option>
                    <option value={120} className="bg-gray-900">2 horas (120 min)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-emerald-100 mb-2">
                    Cupos Máximos *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.cupo_maximo}
                    onChange={(e) => setFormData({ ...formData, cupo_maximo: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-black/40 border border-emerald-500/30 text-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                    required
                  />
                  <p className="text-xs text-white/40 mt-1">Máximo 30 estudiantes por clase</p>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-emerald-100 mb-2">
                  Descripción / Grupo (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="ej: Niños 6-7 años, Grupo Avanzado, Preparación nivel 2..."
                  className="w-full px-4 py-3 bg-black/40 border border-emerald-500/30 text-white placeholder-white/30 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4 border-t border-emerald-500/20">
              <Button
                variant="outline"
                onClick={closeModal}
                className="flex-1 py-3 text-base bg-white/5 border-emerald-500/30 text-white hover:bg-white/10"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateClass}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/30 py-3 text-base font-semibold"
                disabled={!formData.nombre || !formData.docente_id || !formData.fecha_hora_inicio}
              >
                ✨ Crear Clase
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {modalType === 'edit' && selectedClass && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="backdrop-blur-xl bg-emerald-500/[0.08] border border-emerald-500/20 rounded-2xl p-8 max-w-3xl w-full shadow-2xl shadow-emerald-500/20 my-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg shadow-teal-500/40">
                ✏️
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Editar Clase</h3>
                <p className="text-sm text-white/60">Modificá los detalles de la clase</p>
              </div>
            </div>

            <div className="space-y-5 mb-6">
              {/* Coming Soon Notice */}
              <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4">
                <p className="text-sm text-amber-200 font-medium">
                  ⚠️ Funcionalidad de edición próximamente. Por ahora, cancelá esta clase y creá una nueva con los cambios deseados.
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4 border-t border-emerald-500/20">
              <Button
                variant="outline"
                onClick={closeModal}
                className="flex-1 py-3 text-base bg-white/5 border-emerald-500/30 text-white hover:bg-white/10"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Class Modal */}
      {modalType === 'cancel' && selectedClass && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-emerald-500/[0.08] border-2 border-red-500/50 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-red-500/20">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⚠️</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">¿Cancelar clase?</h3>
              <p className="text-white text-lg">
                <strong>{selectedClass.nombre || selectedClass.ruta_curricular?.nombre || 'Esta clase'}</strong>
              </p>
              {selectedClass.descripcion && (
                <p className="text-sm text-white/60 mt-1">{selectedClass.descripcion}</p>
              )}
            </div>
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-200">
                ⚡ Los estudiantes inscritos serán notificados automáticamente de la cancelación.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={closeModal}
                className="flex-1 py-3 bg-white/5 border-emerald-500/30 text-white hover:bg-white/10"
              >
                Volver
              </Button>
              <Button
                variant="primary"
                onClick={handleCancelClass}
                className="flex-1 bg-red-500 hover:bg-red-600 py-3 font-semibold"
              >
                ❌ Confirmar Cancelación
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Class Modal */}
      {modalType === 'view' && selectedClass && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="backdrop-blur-xl bg-emerald-500/[0.08] border border-emerald-500/20 rounded-2xl p-8 max-w-3xl w-full shadow-2xl shadow-emerald-500/20 my-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg shadow-emerald-500/40">
                👁
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Detalles de la Clase</h3>
                <p className="text-sm text-white/60">Información completa</p>
              </div>
            </div>

            <div className="space-y-6 mb-6">
              {/* Nombre de la Clase */}
              <div className="bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-500/30 rounded-2xl p-6">
                <div className="text-sm font-medium text-emerald-200 mb-2">Nombre de la Clase</div>
                <div className="text-2xl font-bold text-white">
                  {selectedClass.nombre || selectedClass.ruta_curricular?.nombre || 'Sin nombre'}
                </div>
                {selectedClass.descripcion && (
                  <div className="text-sm mt-3 bg-emerald-500/20 inline-block px-3 py-1.5 rounded-lg text-emerald-200">
                    👥 {selectedClass.descripcion}
                  </div>
                )}
              </div>

              {/* Docente y Ruta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                  <div className="text-sm font-semibold text-emerald-300 mb-2">👨‍🏫 Docente</div>
                  <div className="text-lg font-bold text-white">
                    {selectedClass.docente?.user?.nombre || selectedClass.docente?.nombre} {selectedClass.docente?.user?.apellido || selectedClass.docente?.apellido}
                  </div>
                  <div className="text-sm text-white/60 mt-1">
                    {selectedClass.docente?.titulo || 'Profesor'}
                  </div>
                </div>
                {selectedClass.ruta_curricular && (
                  <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-4">
                    <div className="text-sm font-semibold text-teal-300 mb-2">📚 Ruta Curricular</div>
                    <div className="text-lg font-bold text-white">
                      {selectedClass.ruta_curricular.nombre}
                    </div>
                    <div className="text-sm text-white/60 mt-1">
                      {selectedClass.ruta_curricular.descripcion || 'Sin descripción'}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-emerald-500/20">
                <div>
                  <div className="text-sm font-medium text-white/50">Fecha</div>
                  <div className="text-sm text-white mt-1">
                    {new Date(selectedClass.fecha_hora_inicio).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-white/50">Hora</div>
                  <div className="text-sm text-white mt-1">
                    {new Date(selectedClass.fecha_hora_inicio).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-white/50">Duración</div>
                  <div className="text-sm text-white mt-1">
                    {selectedClass.duracion_minutos} minutos
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-500/20">
                <div>
                  <div className="text-sm font-medium text-white/50">Cupos</div>
                  <div className="text-sm text-white mt-1">
                    {selectedClass.cupos_ocupados || 0} / {selectedClass.cupos_maximo}
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                      style={{
                        width: `${((selectedClass.cupos_ocupados || 0) / selectedClass.cupos_maximo) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-white/50">Estado</div>
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mt-1 ${estadoColors[selectedClass.estado]}`}>
                    {selectedClass.estado}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={closeModal}
                className="flex-1 bg-white/5 border-emerald-500/30 text-white hover:bg-white/10"
              >
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

      {/* Modal de Gestionar Estudiantes */}
      {modalType === 'estudiantes' && selectedClass && (
        <GestionarEstudiantesModal
          claseId={selectedClass.id}
          claseNombre={selectedClass.nombre}
          onClose={closeModal}
          onSuccess={() => {
            fetchClasses();
          }}
        />
      )}
    </div>
  );
}
