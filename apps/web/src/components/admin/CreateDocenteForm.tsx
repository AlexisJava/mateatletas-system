'use client';

import React, { useState } from 'react';
import { CreateDocenteData } from '@/lib/api/docentes.api';
import { X, Plus, Trash2, Clock, Calendar } from 'lucide-react';
import RutasSelector from './RutasSelector';

interface SelectedRuta {
  sectorId: string;
  sectorNombre: string;
  sectorIcono: string;
  sectorColor: string;
  rutaNombre: string;
}

interface CreateDocenteFormProps {
  onSubmit: (data: CreateDocenteData, rutas?: SelectedRuta[]) => Promise<void>;
  onCancel: () => void;
  onSwitchToAdmin: () => void;
  isLoading: boolean;
  error: string | null;
}

const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const NIVELES_EDUCATIVOS = ['Primaria', 'Secundaria', 'Universidad'];
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

export default function CreateDocenteForm({
  onSubmit,
  onCancel,
  onSwitchToAdmin,
  isLoading,
  error,
}: CreateDocenteFormProps) {
  const [form, setForm] = useState<CreateDocenteData>({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    titulo: '',
    bio: '',
    telefono: '',
    especialidades: [],
    experiencia_anos: undefined,
    disponibilidad_horaria: {},
    nivel_educativo: [],
    estado: 'activo',
  });

  const [especialidadInput, setEspecialidadInput] = useState('');
  const [selectedDia, setSelectedDia] = useState('lunes');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('17:00');
  const [selectedRutas, setSelectedRutas] = useState<SelectedRuta[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Pasar tanto los datos del docente como las rutas seleccionadas
    await onSubmit(form, selectedRutas);
  };

  const agregarEspecialidad = (especialidad: string) => {
    if (especialidad && !form.especialidades?.includes(especialidad)) {
      setForm({
        ...form,
        especialidades: [...(form.especialidades || []), especialidad],
      });
    }
    setEspecialidadInput('');
  };

  const eliminarEspecialidad = (especialidad: string) => {
    setForm({
      ...form,
      especialidades: form.especialidades?.filter((e) => e !== especialidad) || [],
    });
  };

  const agregarHorario = () => {
    const rangoHorario = `${horaInicio}-${horaFin}`;
    const disponibilidad = { ...(form.disponibilidad_horaria || {}) };

    if (!disponibilidad[selectedDia]) {
      disponibilidad[selectedDia] = [];
    }

    if (!disponibilidad[selectedDia].includes(rangoHorario)) {
      disponibilidad[selectedDia] = [...disponibilidad[selectedDia], rangoHorario];
      setForm({ ...form, disponibilidad_horaria: disponibilidad });
    }
  };

  const eliminarHorario = (dia: string, horario: string) => {
    const disponibilidad = { ...(form.disponibilidad_horaria || {}) };
    if (disponibilidad[dia]) {
      disponibilidad[dia] = disponibilidad[dia].filter((h) => h !== horario);
      if (disponibilidad[dia].length === 0) {
        delete disponibilidad[dia];
      }
      setForm({ ...form, disponibilidad_horaria: disponibilidad });
    }
  };

  const toggleNivelEducativo = (nivel: string) => {
    const niveles = form.nivel_educativo || [];
    if (niveles.includes(nivel)) {
      setForm({
        ...form,
        nivel_educativo: niveles.filter((n) => n !== nivel),
      });
    } else {
      setForm({
        ...form,
        nivel_educativo: [...niveles, nivel],
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="backdrop-blur-xl bg-emerald-500/[0.08] rounded-2xl max-w-4xl w-full shadow-2xl shadow-emerald-500/20 border border-emerald-500/20 max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="flex items-center justify-between p-6 border-b border-emerald-500/20">
          <div>
            <h3 className="text-2xl font-bold text-white">Crear Nuevo Docente</h3>
            <p className="text-sm text-white/60 mt-1">Complete la información del docente</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-emerald-500/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto px-6 py-4 flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sección 1: Datos Básicos */}
          <div className="backdrop-blur-xl bg-emerald-500/[0.05] rounded-xl p-4 border border-emerald-500/20">
            <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              Datos Básicos
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-emerald-100 mb-1.5">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-emerald-500/30 text-white placeholder-white/30 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-100 mb-1.5">
                  Apellido *
                </label>
                <input
                  type="text"
                  required
                  value={form.apellido}
                  onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-emerald-500/30 text-white placeholder-white/30 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-100 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-emerald-500/30 text-white placeholder-white/30 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-100 mb-1.5">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-emerald-500/30 text-white placeholder-white/30 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-sm"
                  placeholder="+54 9 11 1234-5678"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-emerald-100 mb-1.5">
                  Contraseña *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-emerald-500/30 text-white placeholder-white/30 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-sm"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Información Profesional */}
          <div className="backdrop-blur-xl bg-emerald-500/[0.05] rounded-xl p-4 border border-emerald-500/20">
            <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              Información Profesional
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-emerald-100 mb-1.5">
                    Título Profesional
                  </label>
                  <input
                    type="text"
                    value={form.titulo}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-emerald-500/30 text-white placeholder-white/30 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-sm"
                    placeholder="Ej: Licenciado en Matemática"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-100 mb-1.5">
                    Años de Experiencia
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={form.experiencia_anos || ''}
                    onChange={(e) => setForm({ ...form, experiencia_anos: parseInt(e.target.value) || undefined })}
                    className="w-full px-3 py-2 bg-black/40 border border-emerald-500/30 text-white placeholder-white/30 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-100 mb-1.5">
                  Biografía
                </label>
                <textarea
                  rows={2}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-emerald-500/30 text-white placeholder-white/30 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all resize-none text-sm"
                  placeholder="Breve descripción sobre el docente..."
                />
              </div>

              {/* Niveles Educativos */}
              <div>
                <label className="block text-xs font-semibold text-emerald-100 mb-1.5">
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
                          : 'bg-black/40 text-white/70 border border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300'
                      }`}
                    >
                      {nivel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sectores y Rutas de Especialidad */}
              <div>
                <label className="block text-xs font-semibold text-emerald-100 mb-1.5">
                  Sectores y Rutas de Especialidad
                </label>
                <p className="text-xs text-white/60 mb-3">
                  Selecciona el sector y escribe el nombre de la ruta (ej: Godot, Arduino, Olimpiadas). Si la ruta no existe, se creará automáticamente.
                </p>
                <RutasSelector
                  selectedRutas={selectedRutas}
                  onChange={setSelectedRutas}
                />
              </div>
            </div>
          </div>

          {/* Sección 3: Disponibilidad Horaria */}
          <div className="backdrop-blur-xl bg-emerald-500/[0.05] rounded-xl p-4 border border-emerald-500/20">
            <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Disponibilidad Horaria
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-emerald-100 mb-1.5">
                    Día
                  </label>
                  <select
                    value={selectedDia}
                    onChange={(e) => setSelectedDia(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-emerald-500/30 text-white rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-sm"
                  >
                    {DIAS_SEMANA.map((dia) => (
                      <option key={dia} value={dia}>
                        {dia.charAt(0).toUpperCase() + dia.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-100 mb-1.5">
                    Desde
                  </label>
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-emerald-500/30 text-white rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-100 mb-1.5">
                    Hasta
                  </label>
                  <input
                    type="time"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-emerald-500/30 text-white rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={agregarHorario}
                    className="w-full px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 text-sm"
                  >
                    <Clock className="w-4 h-4" />
                    Agregar
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {Object.entries(form.disponibilidad_horaria || {}).map(([dia, horarios]) => (
                  <div key={dia} className="backdrop-blur-xl bg-black/40 rounded-lg p-2.5 border border-emerald-500/20">
                    <div className="font-semibold text-white text-xs mb-1.5">
                      {dia.charAt(0).toUpperCase() + dia.slice(1)}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {horarios.map((horario) => (
                        <div
                          key={horario}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg shadow-md text-xs"
                        >
                          <Clock className="w-3 h-3" />
                          <span className="font-medium">{horario}</span>
                          <button
                            type="button"
                            onClick={() => eliminarHorario(dia, horario)}
                            className="hover:bg-white/20 rounded p-0.5 transition-colors"
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
          </div>

          </form>
        </div>

        {/* Footer fijo con botones */}
        <div className="border-t border-emerald-500/20 p-6 backdrop-blur-xl bg-emerald-500/[0.05]">
          {error && (
            <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm font-medium mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border-2 border-emerald-500/30 text-emerald-100 rounded-xl font-semibold hover:bg-emerald-500/10 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              onClick={handleSubmit}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creando...' : 'Crear Docente'}
            </button>
          </div>

          <div className="flex justify-center pt-3">
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              ¿Querés crear un Administrador en su lugar?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
