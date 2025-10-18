'use client';

import { useState, useEffect } from 'react';
import { X, Edit2, Save, Calendar, Clock, MapPin, Award, BookOpen, GraduationCap, Briefcase, User, Mail, Phone, FileText, Trash2, Plus } from 'lucide-react';

interface Docente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  titulo?: string;
  bio?: string;
  especialidades?: string[];
  experiencia_anos?: number;
  disponibilidad_horaria?: Record<string, string[]>;
  nivel_educativo?: string[];
  estado?: string;
  createdAt: string;
  updatedAt: string;
}

interface ViewEditDocenteModalProps {
  docente: Docente;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Docente>) => Promise<void>;
  isLoading?: boolean;
}

const ESPECIALIDADES_MATE = [
  'Álgebra',
  'Geometría',
  'Trigonometría',
  'Cálculo',
  'Estadística',
  'Matemática Aplicada',
  'Lógica Matemática',
  'Matemática Financiera',
];

const NIVELES_EDUCATIVOS = ['Primaria', 'Secundaria', 'Universidad'];
const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

export default function ViewEditDocenteModal({
  docente,
  onClose,
  onUpdate,
  isLoading = false,
}: ViewEditDocenteModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState({
    nombre: docente.nombre || '',
    apellido: docente.apellido || '',
    telefono: docente.telefono || '',
    titulo: docente.titulo || '',
    bio: docente.bio || '',
    especialidades: docente.especialidades || [],
    experiencia_anos: docente.experiencia_anos,
    disponibilidad_horaria: docente.disponibilidad_horaria || {},
    nivel_educativo: docente.nivel_educativo || [],
    estado: docente.estado || 'activo',
  });

  const [especialidadInput, setEspecialidadInput] = useState('');
  const [selectedDia, setSelectedDia] = useState('lunes');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');

  const handleSave = async () => {
    try {
      await onUpdate(docente.id, form);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating docente:', error);
    }
  };

  const toggleNivelEducativo = (nivel: string) => {
    setForm((prev) => ({
      ...prev,
      nivel_educativo: prev.nivel_educativo?.includes(nivel)
        ? prev.nivel_educativo.filter((n) => n !== nivel)
        : [...(prev.nivel_educativo || []), nivel],
    }));
  };

  const agregarEspecialidad = (esp: string) => {
    if (esp && !form.especialidades?.includes(esp)) {
      setForm({ ...form, especialidades: [...(form.especialidades || []), esp] });
      setEspecialidadInput('');
    }
  };

  const eliminarEspecialidad = (esp: string) => {
    setForm({
      ...form,
      especialidades: form.especialidades?.filter((e) => e !== esp) || [],
    });
  };

  const agregarHorario = () => {
    if (!horaInicio || !horaFin) return;
    const nuevoHorario = `${horaInicio}-${horaFin}`;
    const horarios = form.disponibilidad_horaria?.[selectedDia] || [];

    setForm({
      ...form,
      disponibilidad_horaria: {
        ...form.disponibilidad_horaria,
        [selectedDia]: [...horarios, nuevoHorario],
      },
    });

    setHoraInicio('');
    setHoraFin('');
  };

  const eliminarHorario = (dia: string, horario: string) => {
    const horarios = form.disponibilidad_horaria?.[dia] || [];
    const nuevosHorarios = horarios.filter((h) => h !== horario);

    if (nuevosHorarios.length === 0) {
      const { [dia]: removed, ...rest } = form.disponibilidad_horaria || {};
      setForm({ ...form, disponibilidad_horaria: rest });
    } else {
      setForm({
        ...form,
        disponibilidad_horaria: {
          ...form.disponibilidad_horaria,
          [dia]: nuevosHorarios,
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="backdrop-blur-xl bg-emerald-500/[0.08] rounded-2xl max-w-4xl w-full shadow-2xl border border-purple-200/30 max-h-[90vh] flex flex-col">
        {/* Header Fijo */}
        <div className="flex items-center justify-between p-6 border-b border-emerald-500/20">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-500/30">
              {docente.nombre?.charAt(0)?.toUpperCase() || 'D'}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                {docente.nombre} {docente.apellido}
              </h3>
              <p className="text-sm text-white/60">
                {docente.titulo || 'Docente de Matemática'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="p-2 hover:bg-emerald-500/10 rounded-xl transition-colors"
              >
                <Edit2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-emerald-500/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-white/50" />
            </button>
          </div>
        </div>

        {/* Contenido Scrollable */}
        <div className="overflow-y-auto px-6 py-4 flex-1">
          <div className="space-y-4">
            {/* Sección 1: Información Básica */}
            <div className="backdrop-blur-xl bg-purple-50/60 dark:bg-purple-950/40 rounded-xl p-3 border border-emerald-500/20">
              <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-violet-500" />
                Información Básica
              </h4>

              {isEditMode ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-emerald-500/20 bg-emerald-500/[0.08]/60 text-white rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        value={form.apellido}
                        onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-emerald-500/20 bg-emerald-500/[0.08]/60 text-white rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Email
                      </label>
                      <div className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-white/50 rounded-lg text-sm cursor-not-allowed">
                        {docente.email}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={form.telefono}
                        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-emerald-500/20 bg-emerald-500/[0.08]/60 text-white rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all text-sm"
                        placeholder="+54 11 1234-5678"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Estado
                    </label>
                    <select
                      value={form.estado}
                      onChange={(e) => setForm({ ...form, estado: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-emerald-500/20 bg-emerald-500/[0.08]/60 text-white rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all text-sm"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="vacaciones">De vacaciones</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="backdrop-blur-xl bg-emerald-500/[0.05]/60 dark:bg-black/60 rounded-lg p-2.5 border border-emerald-500/20">
                    <div className="text-xs font-semibold text-white/50 mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </div>
                    <div className="text-sm font-medium text-white break-all">{docente.email}</div>
                  </div>
                  <div className="backdrop-blur-xl bg-emerald-500/[0.05]/60 dark:bg-black/60 rounded-lg p-2.5 border border-emerald-500/20">
                    <div className="text-xs font-semibold text-white/50 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Teléfono
                    </div>
                    <div className="text-sm font-medium text-white">
                      {docente.telefono || 'No especificado'}
                    </div>
                  </div>
                  <div className="backdrop-blur-xl bg-emerald-500/[0.05]/60 dark:bg-black/60 rounded-lg p-2.5 border border-emerald-500/20">
                    <div className="text-xs font-semibold text-white/50 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Registro
                    </div>
                    <div className="text-sm font-medium text-white">
                      {new Date(docente.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  <div className="backdrop-blur-xl bg-emerald-500/[0.05]/60 dark:bg-black/60 rounded-lg p-2.5 border border-emerald-500/20">
                    <div className="text-xs font-semibold text-white/50 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Estado
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold ${
                      docente.estado === 'activo'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                        : docente.estado === 'vacaciones'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                    }`}>
                      {docente.estado === 'activo' ? '✓ Activo' : docente.estado === 'vacaciones' ? '🏖️ Vacaciones' : '✗ Inactivo'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Sección 2: Información Profesional */}
            <div className="backdrop-blur-xl bg-purple-50/60 dark:bg-purple-950/40 rounded-xl p-3 border border-emerald-500/20">
              <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-violet-500" />
                Información Profesional
              </h4>

              {isEditMode ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Título Profesional
                      </label>
                      <input
                        type="text"
                        value={form.titulo}
                        onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-emerald-500/20 bg-emerald-500/[0.08]/60 text-white rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all text-sm"
                        placeholder="Ej: Licenciado en Matemática"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Años de Experiencia
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={form.experiencia_anos || ''}
                        onChange={(e) => setForm({ ...form, experiencia_anos: parseInt(e.target.value) || undefined })}
                        className="w-full px-3 py-2 border-2 border-emerald-500/20 bg-emerald-500/[0.08]/60 text-white rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Biografía
                    </label>
                    <textarea
                      rows={2}
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-emerald-500/20 bg-emerald-500/[0.08]/60 text-white rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all resize-none text-sm"
                      placeholder="Breve descripción sobre el docente..."
                    />
                  </div>

                  {/* Niveles Educativos */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Niveles Educativos que puede impartir
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {NIVELES_EDUCATIVOS.map((nivel) => (
                        <button
                          key={nivel}
                          type="button"
                          onClick={() => toggleNivelEducativo(nivel)}
                          className={`px-3 py-1.5 rounded-lg font-semibold transition-all text-sm ${
                            form.nivel_educativo?.includes(nivel)
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                              : 'bg-emerald-500/[0.08]/60 text-gray-700 dark:text-gray-300 border-2 border-emerald-500/20 hover:bg-emerald-500/10'
                          }`}
                        >
                          {nivel}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Especialidades */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Especialidades
                    </label>
                    <div className="flex gap-2 mb-2">
                      <select
                        value={especialidadInput}
                        onChange={(e) => setEspecialidadInput(e.target.value)}
                        className="flex-1 px-3 py-2 border-2 border-emerald-500/20 bg-emerald-500/[0.08]/60 text-white rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all text-sm"
                      >
                        <option value="">Seleccionar especialidad...</option>
                        {ESPECIALIDADES_MATE.map((esp) => (
                          <option key={esp} value={esp}>
                            {esp}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => agregarEspecialidad(especialidadInput)}
                        disabled={!especialidadInput}
                        className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.especialidades?.map((esp) => (
                        <div
                          key={esp}
                          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg shadow-md"
                        >
                          <span className="text-sm font-medium">{esp}</span>
                          <button
                            type="button"
                            onClick={() => eliminarEspecialidad(esp)}
                            className="hover:bg-emerald-500/[0.05]/20 rounded p-0.5 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="backdrop-blur-xl bg-emerald-500/[0.05]/60 dark:bg-black/60 rounded-lg p-2.5 border border-emerald-500/20">
                      <div className="text-xs font-semibold text-white/50 mb-1 flex items-center gap-1">
                        <Award className="w-3 h-3" /> Título
                      </div>
                      <div className="text-sm font-medium text-white">
                        {docente.titulo || 'No especificado'}
                      </div>
                    </div>
                    <div className="backdrop-blur-xl bg-emerald-500/[0.05]/60 dark:bg-black/60 rounded-lg p-2.5 border border-emerald-500/20">
                      <div className="text-xs font-semibold text-white/50 mb-1 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> Experiencia
                      </div>
                      <div className="text-sm font-medium text-white">
                        {docente.experiencia_anos ? `${docente.experiencia_anos} años` : 'No especificado'}
                      </div>
                    </div>
                  </div>

                  {docente.bio && (
                    <div className="backdrop-blur-xl bg-emerald-500/[0.05]/60 dark:bg-black/60 rounded-lg p-2.5 border border-emerald-500/20">
                      <div className="text-xs font-semibold text-white/50 mb-1 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Biografía
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">{docente.bio}</div>
                    </div>
                  )}

                  {docente.nivel_educativo && docente.nivel_educativo.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-white/50 mb-2 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" /> Niveles Educativos
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {docente.nivel_educativo.map((nivel) => (
                          <span
                            key={nivel}
                            className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg shadow-md text-sm font-medium"
                          >
                            {nivel}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {docente.especialidades && docente.especialidades.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-white/50 mb-2 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> Especialidades
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {docente.especialidades.map((esp) => (
                          <span
                            key={esp}
                            className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg shadow-md text-sm font-medium"
                          >
                            {esp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sección 3: Disponibilidad Horaria */}
            <div className="backdrop-blur-xl bg-purple-50/60 dark:bg-purple-950/40 rounded-xl p-3 border border-emerald-500/20">
              <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-500" />
                Disponibilidad Horaria
              </h4>

              {isEditMode ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Día
                      </label>
                      <select
                        value={selectedDia}
                        onChange={(e) => setSelectedDia(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-emerald-500/20 bg-emerald-500/[0.08]/60 text-white rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all text-sm"
                      >
                        {DIAS_SEMANA.map((dia) => (
                          <option key={dia} value={dia}>
                            {dia.charAt(0).toUpperCase() + dia.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Desde
                      </label>
                      <input
                        type="time"
                        value={horaInicio}
                        onChange={(e) => setHoraInicio(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-emerald-500/20 bg-emerald-500/[0.08]/60 text-white rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Hasta
                      </label>
                      <input
                        type="time"
                        value={horaFin}
                        onChange={(e) => setHoraFin(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-emerald-500/20 bg-emerald-500/[0.08]/60 text-white rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all text-sm"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={agregarHorario}
                        className="w-full px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/40 flex items-center justify-center gap-2 text-sm"
                      >
                        <Clock className="w-4 h-4" />
                        Agregar
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {Object.entries(form.disponibilidad_horaria || {}).map(([dia, horarios]) => (
                      <div
                        key={dia}
                        className="backdrop-blur-xl bg-emerald-500/[0.05]/60 dark:bg-black/60 rounded-lg p-2.5 border border-emerald-500/20"
                      >
                        <div className="font-semibold text-white text-xs mb-1.5">
                          {dia.charAt(0).toUpperCase() + dia.slice(1)}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {horarios.map((horario) => (
                            <div
                              key={horario}
                              className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg shadow-md text-xs"
                            >
                              <Clock className="w-3 h-3" />
                              <span className="font-medium">{horario}</span>
                              <button
                                type="button"
                                onClick={() => eliminarHorario(dia, horario)}
                                className="hover:bg-emerald-500/[0.05]/20 rounded p-0.5 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  {docente.disponibilidad_horaria && Object.keys(docente.disponibilidad_horaria).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(docente.disponibilidad_horaria).map(([dia, horarios]) => (
                        <div
                          key={dia}
                          className="backdrop-blur-xl bg-emerald-500/[0.05]/60 dark:bg-black/60 rounded-lg p-2.5 border border-emerald-500/20"
                        >
                          <div className="font-semibold text-white text-xs mb-1.5">
                            {dia.charAt(0).toUpperCase() + dia.slice(1)}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {horarios.map((horario) => (
                              <span
                                key={horario}
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg shadow-md text-xs font-medium"
                              >
                                <Clock className="w-3 h-3" />
                                {horario}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-white/50 text-center py-4">
                      No hay disponibilidad horaria configurada
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Fijo */}
        <div className="border-t border-emerald-500/20 p-6 bg-emerald-500/[0.05]/50 dark:bg-indigo-950/50">
          {isEditMode ? (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditMode(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border-2 border-emerald-500/30 text-emerald-100 rounded-xl font-semibold hover:bg-emerald-500/10 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-emerald-500/30"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
