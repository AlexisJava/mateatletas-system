'use client';

import React, { useState } from 'react';
import { CreateDocenteData } from '@/lib/api/docentes.api';
import { X, Clock, Calendar, RefreshCw } from 'lucide-react';
import type { CreateDocenteFormSubmitHandler } from './CreateDocenteForm.types';

const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const DIAS_LABORABLES = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

export default function CreateDocenteForm({
  onSubmit,
  onCancel,
  onSwitchToAdmin,
  isLoading,
  error,
}: {
  onSubmit: CreateDocenteFormSubmitHandler;
  onCancel: () => void;
  onSwitchToAdmin: () => void;
  isLoading: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<CreateDocenteData>({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    titulo: '',
    telefono: '',
    disponibilidad_horaria: {},
    estado: 'activo',
  });

  const [selectedDia, setSelectedDia] = useState('lunes');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('17:00');
  const [sectores, setSectores] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Si password está vacío, enviar undefined para que backend lo genere
    const dataToSubmit = {
      ...form,
      password: form.password || undefined,
    };
    await onSubmit(dataToSubmit as CreateDocenteData, sectores);
  };

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghjkmnpqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%&*+-=?';

    let password = '';
    const allChars = uppercase + lowercase + numbers + symbols;

    // Asegurar al menos uno de cada tipo
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Completar hasta 12 caracteres
    for (let i = password.length; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Mezclar
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    setForm({ ...form, password });
  };

  const toggleSector = (sector: string) => {
    if (sectores.includes(sector)) {
      setSectores(sectores.filter(s => s !== sector));
    } else {
      setSectores([...sectores, sector]);
    }
  };

  const agregarHorario = () => {
    if (!horaInicio || !horaFin) return;

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

  const agregarLunesAViernes = () => {
    if (!horaInicio || !horaFin) return;

    const rangoHorario = `${horaInicio}-${horaFin}`;
    const disponibilidadActual = form.disponibilidad_horaria || {};

    // Verificar si ya están todos los días laborables con este horario
    const yaExisten = DIAS_LABORABLES.every(dia =>
      disponibilidadActual[dia]?.includes(rangoHorario)
    );

    if (yaExisten) {
      // Ya existen todos, no hacer nada
      return;
    }

    const disponibilidad = { ...disponibilidadActual };

    DIAS_LABORABLES.forEach(dia => {
      if (!disponibilidad[dia]) {
        disponibilidad[dia] = [];
      }
      // Solo agregar si no existe ya
      if (!disponibilidad[dia].includes(rangoHorario)) {
        disponibilidad[dia].push(rangoHorario);
      }
    });

    setForm({ ...form, disponibilidad_horaria: disponibilidad });
  };

  const seleccionarTodos = () => {
    if (!horaInicio || !horaFin) return;

    const rangoHorario = `${horaInicio}-${horaFin}`;
    const disponibilidadActual = form.disponibilidad_horaria || {};

    // Verificar si ya están todos los días con este horario
    const yaExisten = DIAS_SEMANA.every(dia =>
      disponibilidadActual[dia]?.includes(rangoHorario)
    );

    if (yaExisten) {
      // Ya existen todos, no hacer nada
      return;
    }

    const disponibilidad = { ...disponibilidadActual };

    DIAS_SEMANA.forEach(dia => {
      if (!disponibilidad[dia]) {
        disponibilidad[dia] = [];
      }
      // Solo agregar si no existe ya
      if (!disponibilidad[dia].includes(rangoHorario)) {
        disponibilidad[dia].push(rangoHorario);
      }
    });

    setForm({ ...form, disponibilidad_horaria: disponibilidad });
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

  const hasTimeConfigured = horaInicio && horaFin;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="backdrop-blur-2xl bg-slate-900/90 rounded-3xl max-w-4xl w-full shadow-2xl border border-blue-500/30 max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="flex items-center justify-between p-8 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-2xl shadow-blue-500/50">
              <span className="text-3xl">👨‍🏫</span>
            </div>
            <div>
              <h3 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Crear Nuevo Docente
              </h3>
              <p className="text-base text-white/60 mt-1 font-medium">Complete la información del docente</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-3 hover:bg-white/10 rounded-2xl transition-all"
          >
            <X className="w-6 h-6 text-white/70" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto px-6 py-4 flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sección 1: Datos Básicos */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
            <h4 className="text-lg font-black text-white mb-4 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              Datos Básicos
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black text-white/70 uppercase tracking-wider mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 text-white placeholder-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-white/70 uppercase tracking-wider mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  required
                  value={form.apellido}
                  onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 text-white placeholder-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-white/70 uppercase tracking-wider mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 text-white placeholder-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-white/70 uppercase tracking-wider mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 text-white placeholder-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold"
                  placeholder="+54 9 11 1234-5678"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-black text-white/70 uppercase tracking-wider mb-2">
                  Contraseña
                  <span className="text-white/50 font-normal normal-case ml-2">
                    (Opcional - se generará automáticamente si se omite)
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="flex-1 px-4 py-3 bg-white/5 border-2 border-white/10 text-white placeholder-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold"
                    placeholder="Dejar vacío para auto-generar"
                  />
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all flex items-center gap-2 font-bold"
                    title="Generar contraseña"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Generar
                  </button>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-black text-white/70 uppercase tracking-wider mb-2">
                  Título Profesional
                </label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 text-white placeholder-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold"
                  placeholder="Ej: Licenciado en Matemática"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Sectores */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
            <h4 className="text-lg font-black text-white mb-4 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
              Sectores
            </h4>
            <div className="space-y-3">
              <label className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer border-2 border-white/10 hover:border-green-500/50">
                <input
                  type="checkbox"
                  checked={sectores.includes('Matemática')}
                  onChange={() => toggleSector('Matemática')}
                  className="w-6 h-6 rounded-xl border-white/30 text-green-500 focus:ring-green-400"
                />
                <span className="text-3xl">📐</span>
                <span className="text-white font-bold text-lg">Matemática</span>
              </label>
              <label className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer border-2 border-white/10 hover:border-blue-500/50">
                <input
                  type="checkbox"
                  checked={sectores.includes('Programación')}
                  onChange={() => toggleSector('Programación')}
                  className="w-6 h-6 rounded-xl border-white/30 text-blue-500 focus:ring-blue-400"
                />
                <span className="text-3xl">💻</span>
                <span className="text-white font-bold text-lg">Programación</span>
              </label>
            </div>
          </div>

          {/* Sección 3: Disponibilidad Horaria */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
            <h4 className="text-lg font-black text-white mb-4 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-400" />
              Disponibilidad Horaria
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-5 gap-2">
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
                    disabled={!hasTimeConfigured}
                    className="w-full px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Clock className="w-4 h-4" />
                    Agregar
                  </button>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={agregarLunesAViernes}
                    disabled={!hasTimeConfigured}
                    className="w-full px-2 py-2 bg-blue-500/20 text-blue-300 rounded-lg font-semibold hover:bg-blue-500/30 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Lun-Vie
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={seleccionarTodos}
                disabled={!hasTimeConfigured}
                className="w-full px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg font-semibold hover:bg-purple-500/30 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Seleccionar todos los días
              </button>

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
                            <X className="w-3 h-3" />
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
        <div className="border-t border-white/10 p-8 backdrop-blur-xl bg-white/5">
          {error && (
            <div className="bg-red-500/10 border-2 border-red-500/30 text-red-400 px-5 py-4 rounded-2xl text-sm font-bold mb-6">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-6 py-4 border-2 border-white/20 text-white rounded-2xl font-bold hover:bg-white/10 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              onClick={handleSubmit}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creando...' : 'Crear Docente'}
            </button>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="text-sm text-purple-400 hover:text-purple-300 font-bold transition-colors"
            >
              ¿Querés crear un Administrador en su lugar?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
