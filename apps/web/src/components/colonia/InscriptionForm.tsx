'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Trash2,
  Plus,
  Eye,
  EyeOff,
} from 'lucide-react';
import { COURSES } from '@/data/colonia-courses';
import type { Course } from '@/types/colonia';

interface InscriptionFormProps {
  onClose: () => void;
}

interface TutorData {
  nombre: string;
  email: string;
  telefono: string;
  password: string;
  confirmPassword: string;
  dni?: string;
}

interface EstudianteData {
  id: string;
  nombre: string;
  edad: number | '';
  dni?: string;
  cursosSeleccionados: Course[];
}

type Step = 1 | 2 | 3 | 4;

export default function InscriptionForm({ onClose }: InscriptionFormProps) {
  const [step, setStep] = useState<Step>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Step 1: Tutor data
  const [tutorData, setTutorData] = useState<TutorData>({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    dni: '',
  });

  // Step 2: Estudiantes data
  const [estudiantes, setEstudiantes] = useState<EstudianteData[]>([
    {
      id: crypto.randomUUID(),
      nombre: '',
      edad: '',
      dni: '',
      cursosSeleccionados: [],
    },
  ]);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate discount
  const calculateDiscount = () => {
    const cantidadEstudiantes = estudiantes.length;
    const totalCursos = estudiantes.reduce((sum, est) => sum + est.cursosSeleccionados.length, 0);

    if (cantidadEstudiantes >= 2 && totalCursos >= 2) {
      return 0.2; // 20% máximo
    } else if (cantidadEstudiantes >= 2 || totalCursos >= 2) {
      return 0.12; // 12%
    }
    return 0;
  };

  // Calculate total price
  const calculateTotal = () => {
    const totalCursos = estudiantes.reduce((sum, est) => sum + est.cursosSeleccionados.length, 0);
    const precioBase = totalCursos * 55000;
    const descuento = calculateDiscount();
    const descuentoMonto = precioBase * descuento;
    const total = precioBase - descuentoMonto;

    return {
      totalCursos,
      precioBase,
      descuento: descuento * 100,
      descuentoMonto,
      total,
    };
  };

  // Validate step 1
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!tutorData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!tutorData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tutorData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!tutorData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!tutorData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (tutorData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/[A-Z]/.test(tutorData.password)) {
      newErrors.password = 'La contraseña debe tener al menos una mayúscula';
    } else if (!/[0-9]/.test(tutorData.password)) {
      newErrors.password = 'La contraseña debe tener al menos un número';
    }
    if (tutorData.password !== tutorData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate step 2
  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (estudiantes.length === 0) {
      newErrors.estudiantes = 'Debe agregar al menos un estudiante';
    }

    estudiantes.forEach((estudiante, index) => {
      if (!estudiante.nombre.trim()) {
        newErrors[`estudiante_${index}_nombre`] = 'El nombre es requerido';
      }
      if (!estudiante.edad || estudiante.edad < 6 || estudiante.edad > 12) {
        newErrors[`estudiante_${index}_edad`] = 'La edad debe estar entre 6 y 12 años';
      }
      if (estudiante.cursosSeleccionados.length === 0) {
        newErrors[`estudiante_${index}_cursos`] = 'Debe seleccionar al menos 1 curso';
      }
      if (estudiante.cursosSeleccionados.length > 2) {
        newErrors[`estudiante_${index}_cursos`] = 'Máximo 2 cursos por estudiante';
      }

      // Check for schedule conflicts
      const horarios = estudiante.cursosSeleccionados.map((c) => `${c.dayOfWeek}-${c.timeSlot}`);
      const horariosUnicos = new Set(horarios);
      if (horarios.length !== horariosUnicos.size) {
        newErrors[`estudiante_${index}_cursos`] =
          'No puede seleccionar cursos con el mismo horario';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add student
  const addEstudiante = () => {
    setEstudiantes([
      ...estudiantes,
      {
        id: crypto.randomUUID(),
        nombre: '',
        edad: '',
        dni: '',
        cursosSeleccionados: [],
      },
    ]);
  };

  // Remove student
  const removeEstudiante = (id: string) => {
    if (estudiantes.length > 1) {
      setEstudiantes(estudiantes.filter((e) => e.id !== id));
    }
  };

  // Toggle course selection
  const toggleCurso = (estudianteId: string, curso: Course) => {
    setEstudiantes(
      estudiantes.map((est) => {
        if (est.id !== estudianteId) return est;

        const yaSeleccionado = est.cursosSeleccionados.find((c) => c.id === curso.id);
        if (yaSeleccionado) {
          return {
            ...est,
            cursosSeleccionados: est.cursosSeleccionados.filter((c) => c.id !== curso.id),
          };
        } else if (est.cursosSeleccionados.length < 2) {
          return {
            ...est,
            cursosSeleccionados: [...est.cursosSeleccionados, curso],
          };
        }
        return est;
      }),
    );
  };

  // Get available courses for student by age
  const getAvailableCourses = (edad: number | '') => {
    if (!edad) return [];

    return COURSES.filter((course) => {
      const parts = course.ageRange.split('-').map(Number);
      const minValue = parts[0];
      const maxValue = parts[1];
      const min = minValue !== undefined ? minValue : 0;
      const max = maxValue !== undefined ? maxValue : min;
      return edad >= min && edad <= max;
    });
  };

  // Handle next step
  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && acceptedTerms) {
      setStep(4);
      handleSubmit();
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    // TODO: Implement API call to backend
    console.log('Submitting:', {
      tutor: tutorData,
      estudiantes: estudiantes.map((e) => ({
        ...e,
        cursosIds: e.cursosSeleccionados.map((c) => c.id),
      })),
    });

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // TODO: Redirect to MercadoPago
    alert('Inscripción procesada! Redirigiendo a pago...');
  };

  const { totalCursos, precioBase, descuento, descuentoMonto, total } = calculateTotal();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
      />

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto card-glass rounded-3xl border-2 border-white/20 p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all z-10"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex items-center justify-center w-10 h-10 rounded-full font-black transition-all ${
                  s <= step
                    ? 'bg-gradient-to-r from-[#fbbf24] to-[#f97316] text-black'
                    : 'bg-white/10 text-white/40'
                }`}
              >
                {s < step ? <Check className="w-5 h-5" /> : s}
              </div>
            ))}
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#fbbf24] to-[#f97316]"
              initial={{ width: '0%' }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Tutor Data */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-4xl font-black text-white mb-2">Primero, hablemos de vos 👋</h2>
              <p className="text-white/60 mb-8">
                Necesitamos tus datos para crear tu cuenta de tutor
              </p>

              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={tutorData.nombre}
                    onChange={(e) => setTutorData({ ...tutorData, nombre: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/40 focus:border-[#fbbf24] focus:outline-none transition-colors"
                    placeholder="Juan Pérez"
                  />
                  {errors.nombre && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.nombre}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Email *</label>
                  <input
                    type="email"
                    value={tutorData.email}
                    onChange={(e) => setTutorData({ ...tutorData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/40 focus:border-[#fbbf24] focus:outline-none transition-colors"
                    placeholder="juan@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.email}
                    </p>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Teléfono *</label>
                  <input
                    type="tel"
                    value={tutorData.telefono}
                    onChange={(e) => setTutorData({ ...tutorData, telefono: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/40 focus:border-[#fbbf24] focus:outline-none transition-colors"
                    placeholder="+54 9 11 1234-5678"
                  />
                  {errors.telefono && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.telefono}
                    </p>
                  )}
                </div>

                {/* DNI (opcional) */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">DNI (opcional)</label>
                  <input
                    type="text"
                    value={tutorData.dni}
                    onChange={(e) => setTutorData({ ...tutorData, dni: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/40 focus:border-[#fbbf24] focus:outline-none transition-colors"
                    placeholder="12345678"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Contraseña *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={tutorData.password}
                      onChange={(e) => setTutorData({ ...tutorData, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/40 focus:border-[#fbbf24] focus:outline-none transition-colors pr-12"
                      placeholder="Mínimo 8 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-white/40 text-xs mt-1">
                    Mínimo 8 caracteres, 1 mayúscula y 1 número
                  </p>
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={tutorData.confirmPassword}
                      onChange={(e) =>
                        setTutorData({ ...tutorData, confirmPassword: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/40 focus:border-[#fbbf24] focus:outline-none transition-colors pr-12"
                      placeholder="Repite tu contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={handleNext}
                  className="px-8 py-4 bg-gradient-to-r from-[#fbbf24] to-[#f97316] rounded-xl text-black font-black uppercase tracking-wider transition-all hover:scale-105 flex items-center gap-2"
                >
                  Continuar
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Students Data */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-h-[70vh] overflow-y-auto pr-2"
            >
              <h2 className="text-4xl font-black text-white mb-2">¿Quiénes se inscriben? 🎓</h2>
              <p className="text-white/60 mb-8">
                Agrega los datos de los estudiantes y selecciona sus cursos
              </p>

              {errors.estudiantes && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" /> {errors.estudiantes}
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {estudiantes.map((estudiante, index) => {
                  const cursosDisponibles = getAvailableCourses(estudiante.edad);

                  return (
                    <div
                      key={estudiante.id}
                      className="p-6 rounded-2xl bg-white/5 border-2 border-white/10"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-black text-white">Estudiante {index + 1}</h3>
                        {estudiantes.length > 1 && (
                          <button
                            onClick={() => removeEstudiante(estudiante.id)}
                            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Nombre */}
                        <div>
                          <label className="block text-sm font-bold text-white mb-2">
                            Nombre *
                          </label>
                          <input
                            type="text"
                            value={estudiante.nombre}
                            onChange={(e) => {
                              setEstudiantes(
                                estudiantes.map((est) =>
                                  est.id === estudiante.id
                                    ? { ...est, nombre: e.target.value }
                                    : est,
                                ),
                              );
                            }}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/40 focus:border-[#fbbf24] focus:outline-none transition-colors"
                            placeholder="María Pérez"
                          />
                          {errors[`estudiante_${index}_nombre`] && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors[`estudiante_${index}_nombre`]}
                            </p>
                          )}
                        </div>

                        {/* Edad */}
                        <div>
                          <label className="block text-sm font-bold text-white mb-2">Edad *</label>
                          <input
                            type="number"
                            min="6"
                            max="12"
                            value={estudiante.edad}
                            onChange={(e) => {
                              const edad = e.target.value ? Number(e.target.value) : '';
                              setEstudiantes(
                                estudiantes.map((est) =>
                                  est.id === estudiante.id
                                    ? { ...est, edad, cursosSeleccionados: [] }
                                    : est,
                                ),
                              );
                            }}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/40 focus:border-[#fbbf24] focus:outline-none transition-colors"
                            placeholder="8"
                          />
                          {errors[`estudiante_${index}_edad`] && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors[`estudiante_${index}_edad`]}
                            </p>
                          )}
                        </div>

                        {/* DNI (opcional) */}
                        <div>
                          <label className="block text-sm font-bold text-white mb-2">
                            DNI (opcional)
                          </label>
                          <input
                            type="text"
                            value={estudiante.dni}
                            onChange={(e) => {
                              setEstudiantes(
                                estudiantes.map((est) =>
                                  est.id === estudiante.id ? { ...est, dni: e.target.value } : est,
                                ),
                              );
                            }}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/40 focus:border-[#fbbf24] focus:outline-none transition-colors"
                            placeholder="12345678"
                          />
                        </div>
                      </div>

                      {/* Course Selection */}
                      {estudiante.edad && cursosDisponibles.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-bold text-white">
                              Selecciona cursos (máx. 2) *
                            </label>
                            <span className="text-sm text-white/60">
                              {estudiante.cursosSeleccionados.length} de 2 seleccionados
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                            {cursosDisponibles.map((curso) => {
                              const isSelected = estudiante.cursosSeleccionados.find(
                                (c) => c.id === curso.id,
                              );
                              const isDisabled =
                                !isSelected && estudiante.cursosSeleccionados.length >= 2;

                              return (
                                <button
                                  key={curso.id}
                                  type="button"
                                  onClick={() => toggleCurso(estudiante.id, curso)}
                                  disabled={isDisabled}
                                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                                    isSelected
                                      ? 'border-[#fbbf24] bg-[#fbbf24]/10'
                                      : isDisabled
                                        ? 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                                        : 'border-white/10 bg-white/5 hover:border-white/30'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div
                                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${
                                        isSelected
                                          ? 'border-[#fbbf24] bg-[#fbbf24]'
                                          : 'border-white/30'
                                      }`}
                                    >
                                      {isSelected && <Check className="w-4 h-4 text-black" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-2xl">{curso.icon}</span>
                                        <span
                                          className="text-xs font-black uppercase"
                                          style={{ color: curso.color }}
                                        >
                                          {curso.area}
                                        </span>
                                      </div>
                                      <h4 className="text-white font-bold text-sm mb-1">
                                        {curso.name}
                                      </h4>
                                      <div className="text-xs text-white/60 space-y-0.5">
                                        <div>
                                          {curso.dayOfWeek} • {curso.timeSlot}
                                        </div>
                                        <div>Profe {curso.instructor}</div>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {errors[`estudiante_${index}_cursos`] && (
                            <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />{' '}
                              {errors[`estudiante_${index}_cursos`]}
                            </p>
                          )}
                        </div>
                      )}

                      {estudiante.edad && cursosDisponibles.length === 0 && (
                        <p className="text-white/40 text-sm">
                          No hay cursos disponibles para esta edad
                        </p>
                      )}
                    </div>
                  );
                })}

                {/* Add Student Button */}
                <button
                  onClick={addEstudiante}
                  className="w-full py-4 rounded-xl border-2 border-dashed border-white/20 hover:border-[#fbbf24] hover:bg-white/5 text-white font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Agregar otro hijo
                </button>
              </div>

              <div className="flex justify-between mt-8 sticky bottom-0 bg-[#0a0a0f] pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Volver
                </button>
                <button
                  onClick={handleNext}
                  className="px-8 py-4 bg-gradient-to-r from-[#fbbf24] to-[#f97316] rounded-xl text-black font-black uppercase tracking-wider transition-all hover:scale-105 flex items-center gap-2"
                >
                  Continuar
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Summary */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-h-[70vh] overflow-y-auto pr-2"
            >
              <h2 className="text-4xl font-black text-white mb-2">Revisá tu inscripción 📋</h2>
              <p className="text-white/60 mb-8">
                Verificá que todo esté correcto antes de continuar al pago
              </p>

              {/* Tutor Info */}
              <div className="mb-6 p-6 rounded-2xl bg-white/5 border-2 border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-white">Tutor Responsable</h3>
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm text-[#fbbf24] hover:text-[#f97316] font-bold"
                  >
                    Editar
                  </button>
                </div>
                <div className="space-y-2 text-white/80">
                  <p>
                    <strong>Nombre:</strong> {tutorData.nombre}
                  </p>
                  <p>
                    <strong>Email:</strong> {tutorData.email}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {tutorData.telefono}
                  </p>
                  {tutorData.dni && (
                    <p>
                      <strong>DNI:</strong> {tutorData.dni}
                    </p>
                  )}
                </div>
              </div>

              {/* Students Info */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-white">Estudiantes Inscritos</h3>
                  <button
                    onClick={() => setStep(2)}
                    className="text-sm text-[#fbbf24] hover:text-[#f97316] font-bold"
                  >
                    Editar
                  </button>
                </div>

                <div className="space-y-4">
                  {estudiantes.map((estudiante) => (
                    <div
                      key={estudiante.id}
                      className="p-6 rounded-2xl bg-white/5 border-2 border-white/10"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-white">
                          {estudiante.nombre} ({estudiante.edad} años)
                        </h4>
                      </div>

                      <div className="space-y-3">
                        {estudiante.cursosSeleccionados.map((curso) => (
                          <div
                            key={curso.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{curso.icon}</span>
                              <div>
                                <div className="text-white font-bold">{curso.name}</div>
                                <div className="text-sm text-white/60">
                                  {curso.dayOfWeek} {curso.timeSlot} • Profe {curso.instructor}
                                </div>
                              </div>
                            </div>
                            <div className="text-white font-bold">$55,000</div>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-white/10 flex justify-between text-white font-bold">
                          <span>Subtotal {estudiante.nombre}:</span>
                          <span>
                            $
                            {(estudiante.cursosSeleccionados.length * 55000).toLocaleString(
                              'es-AR',
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="mb-6 p-8 rounded-2xl bg-gradient-to-br from-[#fbbf24]/10 to-[#f97316]/10 border-2 border-[#fbbf24]/30">
                <h3 className="text-2xl font-black text-white mb-6">Resumen de Pago</h3>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-white/80">
                    <span>Total cursos:</span>
                    <span className="font-bold">{totalCursos}</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Precio base:</span>
                    <span className="font-bold">${precioBase.toLocaleString('es-AR')}</span>
                  </div>

                  {descuento > 0 && (
                    <>
                      <div className="flex justify-between text-[#10b981]">
                        <span>Descuento aplicado ({descuento}%):</span>
                        <span className="font-bold">
                          -${descuentoMonto.toLocaleString('es-AR')}
                        </span>
                      </div>

                      {descuento === 20 && (
                        <div className="p-3 rounded-xl bg-[#10b981]/20 border border-[#10b981]/30">
                          <p className="text-[#10b981] text-sm font-bold flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            ¡Descuento Máximo! 🎯
                          </p>
                          <p className="text-white/80 text-xs mt-1">
                            2+ hermanos + 2+ cursos en total = 20% OFF por curso
                          </p>
                        </div>
                      )}

                      {descuento === 12 && (
                        <div className="p-3 rounded-xl bg-[#0ea5e9]/20 border border-[#0ea5e9]/30">
                          <p className="text-[#0ea5e9] text-sm font-bold flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            Descuento Aplicado 🎉
                          </p>
                          <p className="text-white/80 text-xs mt-1">
                            {estudiantes.length >= 2 ? '2+ hermanos' : '2+ cursos'} = 12% OFF por
                            curso
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="h-px bg-white/20 my-4" />

                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-black text-white">PAGO ENERO 2026:</span>
                  <span className="text-4xl font-black title-gradient">
                    ${total.toLocaleString('es-AR')}
                  </span>
                </div>

                {/* Monthly Payment Notice */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/70 text-sm leading-relaxed">
                    💳 <strong className="text-white">Pago mensual:</strong> Se cobrará
                    automáticamente el mismo monto el 1° de Febrero y el 1° de Marzo 2026.
                  </p>
                  <p className="text-white/60 text-xs mt-2">
                    Si no se completa el pago antes del día 5, el acceso a las clases será bloqueado
                    hasta regularizar.
                  </p>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="mb-6">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      acceptedTerms
                        ? 'border-[#fbbf24] bg-[#fbbf24]'
                        : 'border-white/30 group-hover:border-white/50'
                    }`}
                    onClick={() => setAcceptedTerms(!acceptedTerms)}
                  >
                    {acceptedTerms && <Check className="w-4 h-4 text-black" />}
                  </div>
                  <span className="text-white/80 text-sm">
                    Acepto los{' '}
                    <a
                      href="/legal/terminos"
                      target="_blank"
                      className="text-[#fbbf24] hover:text-[#f97316] font-bold"
                    >
                      Términos y Condiciones
                    </a>{' '}
                    y la{' '}
                    <a
                      href="/legal/privacidad"
                      target="_blank"
                      className="text-[#fbbf24] hover:text-[#f97316] font-bold"
                    >
                      Política de Privacidad
                    </a>
                  </span>
                </label>
              </div>

              <div className="flex justify-between sticky bottom-0 bg-[#0a0a0f] pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Editar Estudiantes
                </button>
                <button
                  onClick={handleNext}
                  disabled={!acceptedTerms}
                  className={`px-8 py-4 rounded-xl text-black font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                    acceptedTerms
                      ? 'bg-gradient-to-r from-[#fbbf24] to-[#f97316] hover:scale-105 cursor-pointer'
                      : 'bg-white/20 cursor-not-allowed opacity-50'
                  }`}
                >
                  Proceder al Pago
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Processing */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 border-4 border-[#fbbf24] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <h2 className="text-4xl font-black text-white mb-4">
                Procesando tu inscripción... ⏳
              </h2>
              <p className="text-white/60">
                Creando tus cuentas de acceso y generando el link de pago...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
