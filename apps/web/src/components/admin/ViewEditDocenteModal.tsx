'use client';

import { useState } from 'react';
import { X, Edit2, Save, Calendar, Clock, MapPin, Award, BookOpen, GraduationCap, User, Mail, Phone, Trash2, Plus } from 'lucide-react';

interface Docente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  titulo?: string;
  sectores?: Array<{ nombre: string; icono: string; color: string }>;
  especialidades?: string[];
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
    especialidades: docente.especialidades || [],
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="backdrop-blur-2xl bg-slate-900/90 rounded-3xl max-w-5xl w-full shadow-2xl border border-blue-500/30 max-h-[90vh] flex flex-col">
        {/* Header Fijo */}
        <div className="flex items-center justify-between p-8 border-b border-white/10">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0 h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-blue-500/50">
              {docente.nombre?.charAt(0)?.toUpperCase() || 'D'}
            </div>
            <div>
              <h3 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {docente.nombre} {docente.apellido}
              </h3>
              <p className="text-base text-white/70 font-bold mt-1">
                {docente.titulo || 'Docente de Matemática'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="p-3 hover:bg-blue-500/20 rounded-2xl transition-all group"
              >
                <Edit2 className="w-6 h-6 text-blue-400 group-hover:text-blue-300" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/10 rounded-2xl transition-all"
            >
              <X className="w-6 h-6 text-white/70" />
            </button>
          </div>
        </div>

        {/* Contenido Scrollable */}
        <div className="overflow-y-auto px-6 py-4 flex-1">
          <div className="space-y-4">
            {/* Sección 1: Información Básica */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
              <h4 className="text-lg font-black text-white mb-4 flex items-center gap-3">
                <User className="w-5 h-5 text-blue-400" />
                Información Básica
              </h4>

              {isEditMode ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black text-white/70 uppercase tracking-wider mb-2">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-white/10 bg-white/5 text-white rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-white/70 uppercase tracking-wider mb-2">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        value={form.apellido}
                        onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-white/10 bg-white/5 text-white rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black text-white/70 uppercase tracking-wider mb-2">
                        Email
                      </label>
                      <div className="w-full px-4 py-3 border-2 border-white/10 bg-white/5 text-white/40 rounded-2xl font-bold cursor-not-allowed">
                        {docente.email}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-black text-white/70 uppercase tracking-wider mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={form.telefono}
                        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-white/10 bg-white/5 text-white rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold"
                        placeholder="+54 11 1234-5678"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-white/70 uppercase tracking-wider mb-2">
                      Estado
                    </label>
                    <select
                      value={form.estado}
                      onChange={(e) => setForm({ ...form, estado: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-white/10 bg-white/5 text-white rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="vacaciones">De vacaciones</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="text-xs font-black text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email
                    </div>
                    <div className="text-base font-bold text-white break-all">{docente.email}</div>
                  </div>
                  <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="text-xs font-black text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Teléfono
                    </div>
                    <div className="text-base font-bold text-white">
                      {docente.telefono || 'No especificado'}
                    </div>
                  </div>
                  <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="text-xs font-black text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Registro
                    </div>
                    <div className="text-base font-bold text-white">
                      {new Date(docente.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="text-xs font-black text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Estado
                    </div>
                    <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-black shadow-lg ${
                      docente.estado === 'activo'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                        : docente.estado === 'vacaciones'
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                        : 'bg-gradient-to-r from-red-600 to-rose-600 text-white'
                    }`}>
                      {docente.estado === 'activo' ? '✓ Activo' : docente.estado === 'vacaciones' ? '🏖️ Vacaciones' : '✗ Inactivo'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Sección 2: Información Profesional */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
              <h4 className="text-lg font-black text-white mb-4 flex items-center gap-3">
                <Award className="w-5 h-5 text-purple-400" />
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
                <div className="space-y-5">
                  <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="text-xs font-black text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4" /> Título Profesional
                    </div>
                    <div className="text-base font-bold text-white">
                      {docente.titulo || 'No especificado'}
                    </div>
                  </div>

                  {/* Sectores */}
                  {docente.sectores && docente.sectores.length > 0 && (
                    <div>
                      <div className="text-sm font-black text-white/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4" /> Sectores
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {docente.sectores.map((sector) => (
                          <span
                            key={sector.nombre}
                            className="px-5 py-3 text-white rounded-2xl shadow-2xl text-base font-black flex items-center gap-3"
                            style={{ backgroundColor: sector.color }}
                          >
                            <span className="text-2xl">{sector.icono}</span>
                            <span>{sector.nombre}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {docente.nivel_educativo && docente.nivel_educativo.length > 0 && (
                    <div>
                      <div className="text-sm font-black text-white/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" /> Niveles Educativos
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {docente.nivel_educativo.map((nivel) => (
                          <span
                            key={nivel}
                            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl shadow-2xl shadow-blue-500/30 text-base font-black"
                          >
                            {nivel}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {docente.especialidades && docente.especialidades.length > 0 && (
                    <div>
                      <div className="text-sm font-black text-white/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Especialidades
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {docente.especialidades.map((esp) => (
                          <span
                            key={esp}
                            className="px-5 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-2xl shadow-2xl shadow-purple-500/30 text-base font-black"
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
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
              <h4 className="text-lg font-black text-white mb-4 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-green-400" />
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
                    <div className="space-y-3">
                      {Object.entries(docente.disponibilidad_horaria).map(([dia, horarios]) => (
                        <div
                          key={dia}
                          className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10"
                        >
                          <div className="font-black text-white text-sm uppercase tracking-wider mb-3">
                            {dia.charAt(0).toUpperCase() + dia.slice(1)}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {horarios.map((horario) => (
                              <span
                                key={horario}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-lg text-sm font-bold"
                              >
                                <Clock className="w-4 h-4" />
                                {horario}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 text-center">
                      <div className="text-5xl mb-3">📅</div>
                      <div className="text-base text-white/60 font-bold">
                        No hay disponibilidad horaria configurada
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Fijo */}
        <div className="border-t border-white/10 p-8 bg-white/5">
          {isEditMode ? (
            <div className="flex gap-4">
              <button
                onClick={() => setIsEditMode(false)}
                disabled={isLoading}
                className="flex-1 px-6 py-4 border-2 border-white/20 text-white rounded-2xl font-bold hover:bg-white/10 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
