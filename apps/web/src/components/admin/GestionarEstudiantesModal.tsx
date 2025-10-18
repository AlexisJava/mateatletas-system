'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, Users, Search } from 'lucide-react';
import axios from '@/lib/axios';

interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  email: string | null;
  nivelEscolar: string;
  avatarUrl: string | null;
  tutor: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
}

interface EstudianteInscrito extends Estudiante {
  inscripcionId: string;
  fechaInscripcion: string;
}

interface ClaseEstudiantes {
  claseId: string;
  nombre: string;
  cuposMaximo: number;
  cuposOcupados: number;
  cuposDisponibles: number;
  docente: {
    id: string;
    nombre: string;
    apellido: string;
    sector: {
      id: string;
      nombre: string;
      color: string;
      icono: string;
    } | null;
  };
  estudiantes: EstudianteInscrito[];
}

interface Props {
  claseId: string;
  claseNombre: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GestionarEstudiantesModal({ claseId, claseNombre, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claseData, setClaseData] = useState<ClaseEstudiantes | null>(null);
  const [todosEstudiantes, setTodosEstudiantes] = useState<Estudiante[]>([]);
  const [selectedEstudiantes, setSelectedEstudiantes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    nombre: '',
    apellido: '',
    edad: '',
    nivel_escolar: 'Primaria' as 'Primaria' | 'Secundaria' | 'Universidad',
    tutor_nombre: '',
    tutor_apellido: '',
    tutor_email: '',
    tutor_telefono: '',
  });

  useEffect(() => {
    fetchData();
  }, [claseId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // IMPORTANTE: El interceptor de axios ya devuelve response.data directamente
      const [claseData, estudiantesData] = await Promise.all([
        axios.get(`/clases/${claseId}/estudiantes`),
        axios.get('/admin/estudiantes'),
      ]);

      setClaseData(claseData);
      setTodosEstudiantes(estudiantesData || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al cargar datos');
      setTodosEstudiantes([]); // Ensure we always have an array even on error
    } finally {
      setLoading(false);
    }
  };

  const handleAsignarEstudiantes = async () => {
    if (selectedEstudiantes.length === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      await axios.post(`/clases/${claseId}/asignar-estudiantes`, {
        estudianteIds: selectedEstudiantes,
      });

      await fetchData();
      setSelectedEstudiantes([]);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al asignar estudiantes');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEstudiante = (estudianteId: string) => {
    setSelectedEstudiantes((prev) =>
      prev.includes(estudianteId)
        ? prev.filter((id) => id !== estudianteId)
        : [...prev, estudianteId]
    );
  };

  const handleCrearEstudiante = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Agregar el sector_id del docente de la clase al formulario
      const dataToSend = {
        ...createForm,
        sector_id: claseData?.docente?.sector?.id || undefined,
      };

      // IMPORTANTE: El interceptor de axios ya devuelve response.data directamente
      // Por eso NO necesitamos hacer .data aquí
      const nuevoEstudiante = await axios.post('/admin/estudiantes', dataToSend);

      // Validar que la respuesta tenga el estudiante
      if (!nuevoEstudiante || !nuevoEstudiante.id) {
        console.error('Respuesta del servidor:', nuevoEstudiante);
        throw new Error('Respuesta inválida del servidor');
      }

      // Agregar el nuevo estudiante a la lista
      setTodosEstudiantes((prev) => [...(prev || []), nuevoEstudiante]);

      // Auto-seleccionarlo
      setSelectedEstudiantes((prev) => [...prev, nuevoEstudiante.id]);

      // Resetear formulario
      setCreateForm({
        nombre: '',
        apellido: '',
        edad: '',
        nivel_escolar: 'Primaria',
        tutor_nombre: '',
        tutor_apellido: '',
        tutor_email: '',
        tutor_telefono: '',
      });

      setShowCreateForm(false);
    } catch (err: any) {
      console.error('Error al crear estudiante:', err);
      setError(err?.response?.data?.message || err?.message || 'Error al crear el estudiante');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrar estudiantes que no están ya inscritos (con defensive check)
  const estudiantesDisponibles = (todosEstudiantes || []).filter(
    (est) => !claseData?.estudiantes.some((inscrito) => inscrito.id === est.id)
  );

  // Filtrar por búsqueda (con defensive check)
  const estudiantesFiltrados = (estudiantesDisponibles || []).filter(
    (est) =>
      est.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.tutor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.tutor.apellido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="backdrop-blur-xl bg-emerald-500/[0.08] rounded-2xl p-8 border border-emerald-500/20 shadow-2xl shadow-emerald-500/20">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-emerald-500/20 border-t-emerald-400"></div>
          <p className="mt-4 text-white/60 font-medium">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="backdrop-blur-xl bg-emerald-500/[0.08] rounded-2xl max-w-5xl w-full shadow-2xl shadow-emerald-500/20 border border-emerald-500/20 max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-emerald-500/20">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 flex-shrink-0" />
              <span className="truncate">Gestionar Estudiantes</span>
            </h3>
            <p className="text-xs sm:text-sm text-white/60 mt-1 truncate">{claseNombre}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-emerald-500/10 rounded-xl transition-colors flex-shrink-0 ml-2"
          >
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {error && (
            <div className="mb-4 backdrop-blur-xl bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Columna izquierda: Estudiantes inscritos */}
            <div className="backdrop-blur-xl bg-emerald-500/[0.05] rounded-xl p-4 border border-emerald-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <h4 className="text-base sm:text-lg font-bold text-white">Estudiantes Inscritos</h4>
                <div className="text-sm">
                  <span className="text-emerald-400 font-bold">{claseData?.cuposOcupados || 0}</span>
                  <span className="text-white/60"> / {claseData?.cuposMaximo || 0} cupos</span>
                </div>
              </div>

              {claseData && claseData.estudiantes.length === 0 ? (
                <div className="text-center py-8 text-white/50 bg-black/30 rounded-lg border border-dashed border-emerald-500/20">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay estudiantes inscritos aún</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {claseData?.estudiantes.map((estudiante) => (
                    <div
                      key={estudiante.id}
                      className="flex items-center justify-between p-3 backdrop-blur-xl bg-black/40 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/10 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/30">
                          {estudiante.nombre.charAt(0)}{estudiante.apellido.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {estudiante.nombre} {estudiante.apellido}
                          </p>
                          <p className="text-xs text-white/60">
                            Tutor: {estudiante.tutor.nombre} {estudiante.tutor.apellido}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Columna derecha: Asignar estudiantes */}
            <div className="backdrop-blur-xl bg-emerald-500/[0.05] rounded-xl p-4 border border-emerald-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <h4 className="text-base sm:text-lg font-bold text-white">Asignar Nuevos Estudiantes</h4>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/30 text-sm flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <UserPlus className="w-4 h-4" />
                  {showCreateForm ? 'Cancelar' : 'Crear Nuevo'}
                </button>
              </div>

              {/* Formulario de creación */}
              {showCreateForm ? (
                <form onSubmit={handleCrearEstudiante} className="space-y-3 mb-4 backdrop-blur-xl bg-black/30 p-4 rounded-lg border border-emerald-500/30">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-100 mb-1">Nombre *</label>
                      <input
                        type="text"
                        required
                        value={createForm.nombre}
                        onChange={(e) => setCreateForm({...createForm, nombre: e.target.value})}
                        className="w-full px-3 py-2 bg-black/40 border border-emerald-500/30 text-white placeholder-white/30 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-emerald-100 mb-1">Apellido *</label>
                      <input
                        type="text"
                        required
                        value={createForm.apellido}
                        onChange={(e) => setCreateForm({...createForm, apellido: e.target.value})}
                        className="w-full px-3 py-2 bg-black/40 border border-emerald-500/30 text-white placeholder-white/30 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-100 mb-1">Edad *</label>
                      <input
                        type="number"
                        required
                        min="3"
                        max="99"
                        value={createForm.edad}
                        onChange={(e) => setCreateForm({...createForm, edad: e.target.value})}
                        placeholder="ej: 8"
                        className="w-full px-3 py-2 bg-black/40 border border-emerald-500/30 text-white placeholder-white/30 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-emerald-100 mb-1">Nivel Escolar *</label>
                      <select
                        required
                        value={createForm.nivel_escolar}
                        onChange={(e) => setCreateForm({...createForm, nivel_escolar: e.target.value as any})}
                        className="w-full px-3 py-2 bg-black/40 border border-emerald-500/30 text-white rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-sm"
                      >
                        <option value="Primaria">Primaria</option>
                        <option value="Secundaria">Secundaria</option>
                        <option value="Universidad">Universidad</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-emerald-500/20 pt-3">
                    <p className="text-xs text-white/60 mb-2">Datos del Tutor (opcional)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-100 mb-1">Nombre Tutor</label>
                        <input
                          type="text"
                          value={createForm.tutor_nombre}
                          onChange={(e) => setCreateForm({...createForm, tutor_nombre: e.target.value})}
                          className="w-full px-3 py-2 bg-black/40 border border-emerald-500/30 text-white placeholder-white/30 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-emerald-100 mb-1">Apellido Tutor</label>
                        <input
                          type="text"
                          value={createForm.tutor_apellido}
                          onChange={(e) => setCreateForm({...createForm, tutor_apellido: e.target.value})}
                          className="w-full px-3 py-2 bg-black/40 border border-emerald-500/30 text-white placeholder-white/30 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    {submitting ? 'Creando...' : 'Crear y Seleccionar'}
                  </button>
                </form>
              ) : (
                <>
                  {/* Buscador */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                      <input
                        type="text"
                        placeholder="Buscar estudiante o tutor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-black/40 border border-emerald-500/30 text-white placeholder-white/30 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Lista de estudiantes disponibles */}
              {!showCreateForm && (
                <>
                  {claseData && claseData.cuposDisponibles === 0 ? (
                    <div className="text-center py-8 text-yellow-300 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                      <p className="text-sm font-medium">⚠️ No hay cupos disponibles</p>
                    </div>
                  ) : estudiantesFiltrados.length === 0 ? (
                    <div className="text-center py-8 text-white/50 bg-black/30 rounded-lg border border-dashed border-emerald-500/20">
                      <p className="text-sm">
                        {searchTerm ? 'No se encontraron estudiantes' : 'No hay más estudiantes disponibles'}
                      </p>
                    </div>
                  ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto mb-4">
                  {estudiantesFiltrados.map((estudiante) => (
                    <div
                      key={estudiante.id}
                      onClick={() => toggleEstudiante(estudiante.id)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                        selectedEstudiantes.includes(estudiante.id)
                          ? 'bg-emerald-500/20 border-2 border-emerald-400'
                          : 'backdrop-blur-xl bg-black/40 border border-emerald-500/20 hover:bg-emerald-500/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/30">
                          {estudiante.nombre.charAt(0)}{estudiante.apellido.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {estudiante.nombre} {estudiante.apellido}
                          </p>
                          <p className="text-xs text-white/60">
                            {estudiante.nivelEscolar} • Tutor: {estudiante.tutor.nombre}
                          </p>
                        </div>
                      </div>
                      {selectedEstudiantes.includes(estudiante.id) && (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                  )}
                </>
              )}

              {/* Botón de asignar */}
              {!showCreateForm && selectedEstudiantes.length > 0 && (
                <button
                  onClick={handleAsignarEstudiantes}
                  disabled={submitting || (claseData?.cuposDisponibles || 0) < selectedEstudiantes.length}
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  {submitting
                    ? 'Asignando...'
                    : `Asignar ${selectedEstudiantes.length} estudiante(s)`}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-emerald-500/20 p-4 sm:p-6 backdrop-blur-xl bg-emerald-500/[0.05]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="text-xs sm:text-sm text-white/60 text-center sm:text-left">
              Cupos disponibles: <span className="text-emerald-400 font-bold">{claseData?.cuposDisponibles || 0}</span>
            </div>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 border-2 border-emerald-500/30 text-emerald-100 rounded-xl font-semibold hover:bg-emerald-500/10 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
