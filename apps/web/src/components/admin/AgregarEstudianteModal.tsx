'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, UserPlus, Users } from 'lucide-react';
import apiClient from '@/lib/axios';
import { getErrorMessage } from '@/lib/utils/error-handler';
import type { ErrorLike } from '@/types/common';

interface EstudianteForm {
  nombre: string;
  apellido: string;
  edad: number | '';
  nivel_escolar: string;
  email?: string;
  sectoresAdicionales: string[]; // Sectores adicionales para este estudiante específico
}

interface TutorForm {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  dni?: string;
}

interface Sector {
  id: string;
  nombre: string;
}

interface CreacionExitosa {
  estudiantes: Array<{
    id: string;
    nombre: string;
    username: string;
    password: string;
  }>;
  tutor?: { username: string; password: string };
}

interface CrearEstudiantesResponse {
  estudiantes: CreacionExitosa['estudiantes'];
  credenciales: CreacionExitosa;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sectorId: string;
  sectorNombre: string;
}

export default function AgregarEstudianteModal({ isOpen, onClose, onSuccess, sectorId, sectorNombre }: Props) {
  const [estudiantes, setEstudiantes] = useState<EstudianteForm[]>([
    { nombre: '', apellido: '', edad: '', nivel_escolar: '', email: '', sectoresAdicionales: [] }
  ]);
  const [tutor, setTutor] = useState<TutorForm>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    dni: ''
  });
  const [sectoresDisponibles, setSectoresDisponibles] = useState<Sector[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credenciales, setCredenciales] = useState<CreacionExitosa | null>(null);

  const loadSectores = useCallback(async () => {
    try {
      const response = await apiClient.get<Sector[]>('/admin/sectores');
      // Filtrar el sector actual
      const otros = response.filter((s) => s.id !== sectorId);
      setSectoresDisponibles(otros);
    } catch (err) {
      console.error('Error al cargar sectores:', err);
    }
  }, [sectorId]);

  // Cargar sectores disponibles (excepto el actual)
  useEffect(() => {
    if (isOpen) {
      void loadSectores();
    }
  }, [isOpen, loadSectores]);

  const handleAgregarEstudiante = () => {
    setEstudiantes([...estudiantes, { nombre: '', apellido: '', edad: '', nivel_escolar: '', email: '', sectoresAdicionales: [] }]);
  };

  const handleEliminarEstudiante = (index: number) => {
    if (estudiantes.length > 1) {
      setEstudiantes(estudiantes.filter((_, i) => i !== index));
    }
  };

  const handleEstudianteChange = <K extends keyof EstudianteForm>(
    index: number,
    field: K,
    value: EstudianteForm[K],
  ) => {
    const nuevosEstudiantes = [...estudiantes];
    nuevosEstudiantes[index] = {
      ...nuevosEstudiantes[index],
      [field]: value,
    } as EstudianteForm;
    setEstudiantes(nuevosEstudiantes);
  };

  const toggleSectorAdicionalEstudiante = (estudianteIndex: number, sectorIdToggle: string) => {
    const estudiante = estudiantes[estudianteIndex];
    if (!estudiante) {
      return;
    }
    const sectoresActuales = estudiante.sectoresAdicionales;

    let nuevosSectores: string[];
    if (sectoresActuales.includes(sectorIdToggle)) {
      nuevosSectores = sectoresActuales.filter(id => id !== sectorIdToggle);
    } else {
      nuevosSectores = [...sectoresActuales, sectorIdToggle];
    }

    handleEstudianteChange(estudianteIndex, 'sectoresAdicionales', nuevosSectores);
  };

  const handleTutorChange = (field: keyof TutorForm, value: string) => {
    setTutor({ ...tutor, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validar que al menos un estudiante tenga datos
      const estudiantesValidos = estudiantes.filter(est => est.nombre && est.apellido && est.edad && est.nivel_escolar);

      if (estudiantesValidos.length === 0) {
        setError('Debes agregar al menos un estudiante con todos los campos requeridos');
        setIsSubmitting(false);
        return;
      }

      // Validar datos del tutor (solo nombre y apellido son requeridos)
      if (!tutor.nombre || !tutor.apellido) {
        setError('Nombre y apellido del tutor son requeridos');
        setIsSubmitting(false);
        return;
      }

      // Crear en sector principal
      const response = await apiClient.post<CrearEstudiantesResponse>(
        '/estudiantes/crear-con-tutor',
        {
          estudiantes: estudiantesValidos.map((est) => ({
            nombre: est.nombre,
            apellido: est.apellido,
            edad: Number(est.edad),
            nivel_escolar: est.nivel_escolar,
            email: est.email || undefined,
          })),
          tutor: {
            nombre: tutor.nombre,
            apellido: tutor.apellido,
            email: tutor.email || undefined,
            telefono: tutor.telefono || undefined,
            dni: tutor.dni || undefined,
          },
          sectorId,
        },
      );

      // Copiar cada estudiante a sus sectores adicionales específicos
      const estudiantesCreados = response.estudiantes;

      for (let i = 0; i < estudiantesCreados.length; i++) {
        const estudiante = estudiantesCreados[i];
        const estudianteValido = estudiantesValidos[i];
        if (!estudiante || !estudianteValido) continue;
        const sectoresAdicionalesEstudiante = estudianteValido.sectoresAdicionales;

        if (sectoresAdicionalesEstudiante.length > 0) {
          for (const sectorDestino of sectoresAdicionalesEstudiante) {
            try {
              await apiClient.patch(`/estudiantes/${estudiante.id}/copiar-a-sector`, {
                sectorId: sectorDestino,
              });
            } catch (err) {
              console.error(`Error al copiar estudiante ${estudiante.id} a sector ${sectorDestino}:`, err);
            }
          }
        }
      }

      // Mostrar credenciales generadas
      setCredenciales(response.credenciales);
    } catch (err) {
      setError(getErrorMessage(err as ErrorLike, 'Error al crear estudiante(s)'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalizar = () => {
    setCredenciales(null);
    setEstudiantes([{ nombre: '', apellido: '', edad: '', nivel_escolar: '', email: '', sectoresAdicionales: [] }]);
    setTutor({ nombre: '', apellido: '', email: '', telefono: '', dni: '' });
    setError(null);
    setIsSubmitting(false);
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  // Mostrar credenciales después de creación exitosa
  if (credenciales) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-900/95 to-teal-900/95 rounded-2xl border border-emerald-500/30 shadow-2xl shadow-emerald-500/20 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border-b border-emerald-500/30 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">¡Estudiante(s) Creado(s)!</h2>
                  <p className="text-emerald-200 text-sm">Guarda estas credenciales</p>
                </div>
              </div>
              <button
                onClick={handleFinalizar}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Contenido con scroll */}
          <div className="p-6 space-y-6 overflow-y-auto">
            <div className="backdrop-blur-xl bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <p className="text-amber-200 text-sm font-semibold">
                ⚠️ IMPORTANTE: Guarda estas credenciales. No podrás verlas nuevamente.
              </p>
            </div>

            {/* Credenciales del Tutor */}
            {credenciales.tutor && (
              <div className="backdrop-blur-xl bg-emerald-500/[0.08] border border-emerald-500/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-emerald-300 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Credenciales del Tutor
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-sm mb-1 block">Usuario</label>
                    <div className="px-4 py-3 bg-black/30 rounded-lg border border-emerald-500/20 font-mono text-emerald-300 font-semibold">
                      {credenciales.tutor.username}
                    </div>
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-1 block">Contraseña Temporal</label>
                    <div className="px-4 py-3 bg-black/30 rounded-lg border border-emerald-500/20 font-mono text-emerald-300 font-semibold">
                      {credenciales.tutor.password}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Credenciales de Estudiantes */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Credenciales de Estudiante(s)
              </h3>
              {credenciales.estudiantes.map((est, index) => (
                <div key={index} className="backdrop-blur-xl bg-blue-500/[0.08] border border-blue-500/20 rounded-xl p-6">
                  <h4 className="text-md font-bold text-blue-300 mb-4">{est.nombre}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Usuario</label>
                      <div className="px-4 py-3 bg-black/30 rounded-lg border border-blue-500/20 font-mono text-blue-300 font-semibold">
                        {est.username}
                      </div>
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Contraseña Temporal</label>
                      <div className="px-4 py-3 bg-black/30 rounded-lg border border-blue-500/20 font-mono text-blue-300 font-semibold">
                        {est.password}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Botón Finalizar */}
            <button
              onClick={handleFinalizar}
              className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30"
            >
              Finalizar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Formulario principal
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-900/95 to-teal-900/95 rounded-2xl border border-emerald-500/30 shadow-2xl shadow-emerald-500/20 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border-b border-emerald-500/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Añadir Estudiante(s)</h2>
                <p className="text-emerald-200 text-sm">Sector: {sectorNombre}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          {/* Error */}
          {error && (
            <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-300 text-sm font-semibold">{error}</p>
            </div>
          )}

          {/* Estudiantes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Estudiantes</h3>
              <button
                type="button"
                onClick={handleAgregarEstudiante}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-emerald-300 font-semibold text-sm transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Agregar Hermano/a
              </button>
            </div>

            {estudiantes.map((estudiante, index) => (
              <div key={index} className="backdrop-blur-xl bg-blue-500/[0.08] border border-blue-500/20 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-md font-bold text-blue-300">Estudiante {index + 1}</h4>
                  {estudiantes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleEliminarEstudiante(index)}
                      className="text-red-400 hover:text-red-300 text-sm font-semibold"
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-2">
                      Nombre <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={estudiante.nombre}
                      onChange={(e) => handleEstudianteChange(index, 'nombre', e.target.value)}
                      className="w-full px-4 py-3 bg-black/30 border border-blue-500/20 rounded-lg text-white placeholder-white/40 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="Juan"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-2">
                      Apellido <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={estudiante.apellido}
                      onChange={(e) => handleEstudianteChange(index, 'apellido', e.target.value)}
                      className="w-full px-4 py-3 bg-black/30 border border-blue-500/20 rounded-lg text-white placeholder-white/40 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="Pérez"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-2">
                      Edad <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={estudiante.edad}
                      onChange={(e) => handleEstudianteChange(index, 'edad', e.target.value ? parseInt(e.target.value) : '')}
                      className="w-full px-4 py-3 bg-black/30 border border-blue-500/20 rounded-lg text-white placeholder-white/40 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="10"
                      min="3"
                      max="18"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-2">
                      Nivel Escolar <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={estudiante.nivel_escolar}
                      onChange={(e) => handleEstudianteChange(index, 'nivel_escolar', e.target.value)}
                      className="w-full px-4 py-3 bg-black/30 border border-blue-500/20 rounded-lg text-white placeholder-white/40 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="5to grado"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-white/80 text-sm font-semibold mb-2">
                      Email (opcional)
                    </label>
                    <input
                      type="email"
                      value={estudiante.email}
                      onChange={(e) => handleEstudianteChange(index, 'email', e.target.value)}
                      className="w-full px-4 py-3 bg-black/30 border border-blue-500/20 rounded-lg text-white placeholder-white/40 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="juan.perez@ejemplo.com"
                    />
                  </div>
                </div>

                {/* Sectores adicionales para ESTE estudiante */}
                {sectoresDisponibles.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-blue-500/20">
                    <h5 className="text-sm font-bold text-blue-200 mb-3">Copiar también a:</h5>
                    <div className="space-y-2">
                      {sectoresDisponibles.map((sector) => (
                        <label
                          key={sector.id}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={estudiante.sectoresAdicionales.includes(sector.id)}
                            onChange={() => toggleSectorAdicionalEstudiante(index, sector.id)}
                            className="w-4 h-4 rounded border-2 border-blue-500/30 bg-black/30 text-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                          />
                          <span className="text-white/70 text-sm font-medium group-hover:text-white transition-colors">
                            {sector.nombre}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tutor */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Datos del Tutor/Padre/Madre</h3>
            <div className="backdrop-blur-xl bg-emerald-500/[0.08] border border-emerald-500/20 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    Nombre <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={tutor.nombre}
                    onChange={(e) => handleTutorChange('nombre', e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-emerald-500/20 rounded-lg text-white placeholder-white/40 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="María"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    Apellido <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={tutor.apellido}
                    onChange={(e) => handleTutorChange('apellido', e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-emerald-500/20 rounded-lg text-white placeholder-white/40 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="Pérez"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    value={tutor.email}
                    onChange={(e) => handleTutorChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-emerald-500/20 rounded-lg text-white placeholder-white/40 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="maria.perez@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    value={tutor.telefono}
                    onChange={(e) => handleTutorChange('telefono', e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-emerald-500/20 rounded-lg text-white placeholder-white/40 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="+549 11 1234-5678"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    DNI (opcional)
                  </label>
                  <input
                    type="text"
                    value={tutor.dni}
                    onChange={(e) => handleTutorChange('dni', e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-emerald-500/20 rounded-lg text-white placeholder-white/40 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="12345678"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4 border-t border-emerald-500/20">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Creando...' : 'Crear Estudiante(s)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
