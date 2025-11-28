'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  TipoInscripcion2026,
  MundoSTEAM,
  CreateInscripcion2026Request,
  TutorData,
  EstudianteInscripcion,
  CourseSelection,
  calcularTotalEstimado,
} from '@/types/inscripciones-2026';
import { createInscripcion2026 } from '@/lib/api/inscripciones-2026';
import { COURSES } from '@/data/colonia-courses';

interface GlobalInscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipoInscripcion: TipoInscripcion2026;
  preselectedCourses?: CourseSelection[];
}

type Step = 1 | 2 | 3 | 4 | 5;

export default function GlobalInscriptionModal({
  isOpen,
  onClose,
  tipoInscripcion,
  preselectedCourses = [],
}: GlobalInscriptionModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [tutorData, setTutorData] = useState<TutorData>({
    nombre: '',
    email: '',
    telefono: '',
    dni: '',
    cuil: '',
    password: '',
    confirmPassword: '',
  });

  const [estudiantes, setEstudiantes] = useState<EstudianteInscripcion[]>([
    {
      nombre: '',
      edad: 5,
      dni: '',
      cursos_seleccionados: preselectedCourses.length > 0 ? preselectedCourses : undefined,
      mundo_seleccionado: undefined,
    },
  ]);

  const [origenInscripcion, setOrigenInscripcion] = useState<string>('');
  const [ciudad, setCiudad] = useState<string>('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const needsCourseSelection =
    tipoInscripcion === TipoInscripcion2026.COLONIA ||
    tipoInscripcion === TipoInscripcion2026.PACK_COMPLETO;

  const needsMundoSelection =
    tipoInscripcion === TipoInscripcion2026.CICLO_2026 ||
    tipoInscripcion === TipoInscripcion2026.PACK_COMPLETO;

  const handleAddEstudiante = () => {
    setEstudiantes([
      ...estudiantes,
      {
        nombre: '',
        edad: 5,
        dni: '',
        cursos_seleccionados: needsCourseSelection ? [] : undefined,
        mundo_seleccionado: undefined,
      },
    ]);
  };

  const handleRemoveEstudiante = (index: number) => {
    if (estudiantes.length > 1) {
      setEstudiantes(estudiantes.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Eliminar confirmPassword antes de enviar al backend
      const { confirmPassword, ...tutorDataToSend } = tutorData;

      const request: CreateInscripcion2026Request = {
        tipo_inscripcion: tipoInscripcion,
        tutor: tutorDataToSend,
        estudiantes,
        origen_inscripcion: origenInscripcion || undefined,
        ciudad: ciudad || undefined,
      };

      const response = await createInscripcion2026(request);

      // Redirigir a MercadoPago
      // El interceptor envuelve la respuesta en { data: {...} }
      if (response.data?.pago_info?.mercadopago_init_point) {
        window.location.href = response.data.pago_info.mercadopago_init_point;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear inscripción');
      setLoading(false);
    }
  };

  const getTitleByType = () => {
    switch (tipoInscripcion) {
      case TipoInscripcion2026.COLONIA:
        return 'Inscripción Colonia de Verano';
      case TipoInscripcion2026.CICLO_2026:
        return 'Inscripción Ciclo 2026';
      case TipoInscripcion2026.PACK_COMPLETO:
        return 'Inscripción Pack Completo';
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepTutorData
            tutorData={tutorData}
            onChange={setTutorData}
            origenInscripcion={origenInscripcion}
            onOrigenChange={setOrigenInscripcion}
            ciudad={ciudad}
            onCiudadChange={setCiudad}
          />
        );
      case 2:
        return (
          <StepEstudiantes
            estudiantes={estudiantes}
            onChange={setEstudiantes}
            onAdd={handleAddEstudiante}
            onRemove={handleRemoveEstudiante}
          />
        );
      case 3:
        if (needsCourseSelection) {
          return <StepCourseSelection estudiantes={estudiantes} onChange={setEstudiantes} />;
        }
        // Skip to next step
        setCurrentStep(4);
        return null;
      case 4:
        if (needsMundoSelection) {
          return <StepMundoSelection estudiantes={estudiantes} onChange={setEstudiantes} />;
        }
        // Skip to next step
        setCurrentStep(5);
        return null;
      case 5:
        return (
          <StepResumen
            tipoInscripcion={tipoInscripcion}
            tutorData={tutorData}
            estudiantes={estudiantes}
          />
        );
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return (
          tutorData.nombre &&
          tutorData.email &&
          tutorData.telefono &&
          tutorData.cuil &&
          tutorData.password &&
          tutorData.confirmPassword &&
          tutorData.password === tutorData.confirmPassword &&
          ciudad.trim().length > 0
        );
      case 2:
        return estudiantes.every((e) => e.nombre && e.edad >= 5 && e.edad <= 17);
      case 3:
        if (!needsCourseSelection) return true;
        return estudiantes.every(
          (e) => e.cursos_seleccionados && e.cursos_seleccionados.length >= 1,
        );
      case 4:
        if (!needsMundoSelection) return true;
        return estudiantes.every((e) => e.mundo_seleccionado);
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 3 && !needsCourseSelection) {
      setCurrentStep(4);
      if (!needsMundoSelection) {
        setCurrentStep(5);
      }
    } else if (currentStep === 4 && !needsMundoSelection) {
      setCurrentStep(5);
    } else if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as Step);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep === 5 && !needsMundoSelection) {
      setCurrentStep(needsCourseSelection ? 3 : 2);
    } else if (currentStep === 4 && !needsCourseSelection) {
      setCurrentStep(2);
    } else if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#fbbf24] to-[#f97316] px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">{getTitleByType()}</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5].map((step) => {
              const isActive = step === currentStep;
              const isCompleted = step < currentStep;
              const shouldShow =
                step === 1 ||
                step === 2 ||
                step === 5 ||
                (step === 3 && needsCourseSelection) ||
                (step === 4 && needsMundoSelection);

              if (!shouldShow) return null;

              return (
                <div
                  key={step}
                  className={`flex-1 h-2 rounded-full mx-1 transition-all ${
                    isCompleted
                      ? 'bg-green-500'
                      : isActive
                        ? 'bg-[#fbbf24]'
                        : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              );
            })}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Paso {currentStep} de 5
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleBack}
            disabled={currentStep === 1 || loading}
            className="px-6 py-2 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Atrás
          </button>

          <button
            onClick={handleNext}
            disabled={!canGoNext() || loading}
            className="px-8 py-2 rounded-lg font-bold text-white bg-gradient-to-r from-[#fbbf24] to-[#f97316] hover:from-[#f59e0b] hover:to-[#ea580c] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Procesando...' : currentStep === 5 ? 'Confirmar y Pagar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Función para formatear CUIL con guiones: XX-XXXXXXXX-X
function formatCUIL(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 10) return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
  return `${numbers.slice(0, 2)}-${numbers.slice(2, 10)}-${numbers.slice(10, 11)}`;
}

// Función para obtener solo números del CUIL (para enviar al backend)
function unformatCUIL(formatted: string): string {
  return formatted.replace(/\D/g, '');
}

// Step 1: Tutor Data
function StepTutorData({
  tutorData,
  onChange,
  origenInscripcion,
  onOrigenChange,
  ciudad,
  onCiudadChange,
}: {
  tutorData: TutorData;
  onChange: (data: TutorData) => void;
  origenInscripcion: string;
  onOrigenChange: (origen: string) => void;
  ciudad: string;
  onCiudadChange: (ciudad: string) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cuilDisplay, setCuilDisplay] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Datos del Padre/Madre/Tutor
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Ingresá tus datos para crear tu cuenta. El CUIL/CUIT es necesario para facturación.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Nombre completo *
          </label>
          <input
            type="text"
            value={tutorData.nombre}
            onChange={(e) => onChange({ ...tutorData, nombre: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent"
            placeholder="Juan Pérez"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={tutorData.email}
            onChange={(e) => onChange({ ...tutorData, email: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent"
            placeholder="juan@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Teléfono *
          </label>
          <input
            type="tel"
            value={tutorData.telefono}
            onChange={(e) => onChange({ ...tutorData, telefono: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent"
            placeholder="+54 9 11 1234-5678"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            CUIL/CUIT * (para facturación)
          </label>
          <input
            type="text"
            value={cuilDisplay || formatCUIL(tutorData.cuil)}
            onChange={(e) => {
              const formatted = e.target.value;
              const numbers = unformatCUIL(formatted);

              if (numbers.length <= 11) {
                const newFormatted = formatCUIL(numbers);
                setCuilDisplay(newFormatted);
                onChange({ ...tutorData, cuil: numbers });
              }
            }}
            onBlur={() => setCuilDisplay('')}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent"
            placeholder="20-12345678-9"
            maxLength={13}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            11 dígitos (se agregan guiones automáticamente)
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            DNI (opcional)
          </label>
          <input
            type="text"
            value={tutorData.dni || ''}
            onChange={(e) => onChange({ ...tutorData, dni: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent"
            placeholder="12345678"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Contraseña *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={tutorData.password}
              onChange={(e) => onChange({ ...tutorData, password: e.target.value })}
              className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent"
              placeholder="Mínimo 8 caracteres"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Mínimo 8 caracteres, 1 mayúscula, 1 número
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Confirmar contraseña *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={tutorData.confirmPassword || ''}
              onChange={(e) => onChange({ ...tutorData, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent"
              placeholder="Repetir contraseña"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {tutorData.password &&
            tutorData.confirmPassword &&
            tutorData.password !== tutorData.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
            )}
        </div>
      </div>

      {/* Campo "Ciudad/Localidad" */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          ¿De dónde sos? *
        </label>
        <input
          type="text"
          value={ciudad}
          onChange={(e) => onCiudadChange(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent"
          placeholder="Ciudad o localidad"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Nos ayuda a organizar mejor las clases
        </p>
      </div>

      {/* Campo "¿Cómo nos conociste?" */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          ¿Cómo nos conociste? (opcional)
        </label>
        <select
          value={origenInscripcion}
          onChange={(e) => onOrigenChange(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent"
        >
          <option value="">Seleccionar...</option>
          <option value="Instagram">Instagram</option>
          <option value="Facebook">Facebook</option>
          <option value="Google / Búsqueda web">Google / Búsqueda web</option>
          <option value="Recomendación de amigo/familiar">Recomendación de amigo/familiar</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="TikTok">TikTok</option>
          <option value="Publicidad online">Publicidad online</option>
          <option value="Evento presencial">Evento presencial</option>
          <option value="Otro">Otro</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Nos ayuda a mejorar nuestro servicio
        </p>
      </div>
    </div>
  );
}

// Step 2: Estudiantes
function StepEstudiantes({
  estudiantes,
  onChange,
  onAdd,
  onRemove,
}: {
  estudiantes: EstudianteInscripcion[];
  onChange: (estudiantes: EstudianteInscripcion[]) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Estudiantes a Inscribir
        </h3>
        <p className="text-gray-600 dark:text-gray-400">Ingresá los datos de cada estudiante</p>
      </div>

      {estudiantes.map((estudiante, index) => (
        <div
          key={index}
          className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg relative"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900 dark:text-white">Estudiante {index + 1}</h4>
            {estudiantes.length > 1 && (
              <button
                onClick={() => onRemove(index)}
                className="text-red-500 hover:text-red-700 text-sm font-semibold"
              >
                Eliminar
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nombre completo *
              </label>
              <input
                type="text"
                value={estudiante.nombre}
                onChange={(e) => {
                  const updated = [...estudiantes];
                  updated[index] = { ...estudiante, nombre: e.target.value };
                  onChange(updated);
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent"
                placeholder="María Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Edad *
              </label>
              <input
                type="number"
                min={5}
                max={17}
                value={estudiante.edad}
                onChange={(e) => {
                  const updated = [...estudiantes];
                  const newAge = parseInt(e.target.value);
                  // Asegurar que siempre sea un número válido entre 5 y 17
                  updated[index] = {
                    ...estudiante,
                    edad: isNaN(newAge) ? 5 : Math.max(5, Math.min(17, newAge)),
                  };
                  onChange(updated);
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Entre 5 y 17 años</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                DNI (opcional)
              </label>
              <input
                type="text"
                value={estudiante.dni || ''}
                onChange={(e) => {
                  const updated = [...estudiantes];
                  updated[index] = { ...estudiante, dni: e.target.value };
                  onChange(updated);
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent"
                placeholder="12345678"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={onAdd}
        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-[#fbbf24] hover:text-[#fbbf24] font-semibold transition-colors"
      >
        + Agregar otro estudiante
      </button>

      {estudiantes.length >= 2 && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <p className="text-green-700 dark:text-green-400 font-semibold">
            🎉 Descuento por hermanos: {estudiantes.length === 2 ? '12%' : '24%'}
          </p>
        </div>
      )}
    </div>
  );
}

// Step 3: Course Selection (Colonia / Pack)
function StepCourseSelection({
  estudiantes,
  onChange,
}: {
  estudiantes: EstudianteInscripcion[];
  onChange: (estudiantes: EstudianteInscripcion[]) => void;
}) {
  const [selectedCourseSchedules, setSelectedCourseSchedules] = useState<Record<string, string>>(
    {},
  );

  // Helper: Check if student age matches course age range
  const matchesAgeRange = (edad: number, ageRange: string): boolean => {
    const [min, max] = ageRange.split('-').map((n) => parseInt(n));
    return edad >= min && edad <= max;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Selección de Cursos
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Elegí 1 o 2 cursos para cada estudiante (12% descuento en el 2do curso)
        </p>
      </div>

      {estudiantes.map((estudiante, estIndex) => {
        // Filtrar cursos según edad del estudiante
        const availableCourses = COURSES.filter((course) =>
          matchesAgeRange(estudiante.edad, course.ageRange),
        );

        return (
          <div
            key={estIndex}
            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">
              {estudiante.nombre} ({estudiante.edad} años)
            </h4>

            <div className="space-y-3">
              {availableCourses.map((course) => {
                const isSelected = estudiante.cursos_seleccionados?.some((c) =>
                  c.course_id.startsWith(course.id),
                );
                const canSelect = !isSelected && (estudiante.cursos_seleccionados?.length || 0) < 2;
                const scheduleKey = `${estIndex}-${course.id}`;
                const selectedScheduleId =
                  selectedCourseSchedules[scheduleKey] || course.schedules[0].id;

                return (
                  <div key={course.id} className="space-y-2">
                    {/* Curso Card */}
                    <button
                      onClick={() => {
                        if (course.schedules.length === 1) {
                          // Solo un horario, seleccionar directamente
                          const updated = [...estudiantes];
                          const currentCourses = updated[estIndex].cursos_seleccionados || [];
                          const schedule = course.schedules[0];

                          if (isSelected) {
                            // Remove course
                            updated[estIndex].cursos_seleccionados = currentCourses.filter(
                              (c) => !c.course_id.startsWith(course.id),
                            );
                          } else if (canSelect) {
                            // Add course
                            const courseSelection: CourseSelection = {
                              course_id: schedule.id,
                              course_name: course.name,
                              course_area: course.area,
                              instructor: schedule.instructor,
                              day_of_week: schedule.dayOfWeek,
                              time_slot: schedule.timeSlot,
                            };
                            updated[estIndex].cursos_seleccionados = [
                              ...currentCourses,
                              courseSelection,
                            ];
                          }

                          onChange(updated);
                        }
                        // Si tiene múltiples horarios, no hace nada aquí, se selecciona con el dropdown
                      }}
                      disabled={!canSelect && !isSelected}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'border-[#fbbf24] bg-[#fbbf24]/10'
                          : canSelect
                            ? 'border-gray-300 dark:border-gray-600 hover:border-[#fbbf24]'
                            : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 dark:text-white">{course.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                            {course.area}
                          </p>
                          {course.schedules.length === 1 ? (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {course.schedules[0].dayOfWeek} • {course.schedules[0].timeSlot} •
                              Profe {course.schedules[0].instructor}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {course.schedules.length} horarios disponibles
                            </p>
                          )}
                        </div>
                        {isSelected && <span className="text-[#fbbf24] font-bold text-xl">✓</span>}
                      </div>
                    </button>

                    {/* Selector de horarios para cursos con múltiples opciones */}
                    {course.schedules.length > 1 && (
                      <div className="ml-4 space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Elegí tu horario:
                        </label>
                        {course.schedules.map((schedule) => (
                          <button
                            key={schedule.id}
                            onClick={() => {
                              // Actualizar horario seleccionado
                              setSelectedCourseSchedules({
                                ...selectedCourseSchedules,
                                [scheduleKey]: schedule.id,
                              });

                              // Si ya está seleccionado este curso, actualizar con el nuevo horario
                              if (isSelected) {
                                const updated = [...estudiantes];
                                const currentCourses = updated[estIndex].cursos_seleccionados || [];

                                const courseSelection: CourseSelection = {
                                  course_id: schedule.id,
                                  course_name: course.name,
                                  course_area: course.area,
                                  instructor: schedule.instructor,
                                  day_of_week: schedule.dayOfWeek,
                                  time_slot: schedule.timeSlot,
                                };

                                updated[estIndex].cursos_seleccionados = [
                                  ...currentCourses.filter(
                                    (c) => !c.course_id.startsWith(course.id),
                                  ),
                                  courseSelection,
                                ];

                                onChange(updated);
                              } else if (canSelect) {
                                // Seleccionar curso con este horario
                                const updated = [...estudiantes];
                                const currentCourses = updated[estIndex].cursos_seleccionados || [];

                                const courseSelection: CourseSelection = {
                                  course_id: schedule.id,
                                  course_name: course.name,
                                  course_area: course.area,
                                  instructor: schedule.instructor,
                                  day_of_week: schedule.dayOfWeek,
                                  time_slot: schedule.timeSlot,
                                };

                                updated[estIndex].cursos_seleccionados = [
                                  ...currentCourses,
                                  courseSelection,
                                ];
                                onChange(updated);
                              }
                            }}
                            disabled={!canSelect && !isSelected}
                            className={`w-full p-3 rounded border text-left text-sm transition-all ${
                              selectedScheduleId === schedule.id
                                ? 'border-[#fbbf24] bg-[#fbbf24]/5'
                                : 'border-gray-300 dark:border-gray-600 hover:border-[#fbbf24]/50'
                            } ${!canSelect && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {schedule.dayOfWeek}
                            </span>
                            {' • '}
                            <span className="text-gray-600 dark:text-gray-400">
                              {schedule.timeSlot}
                            </span>
                            {' • '}
                            <span className="text-gray-600 dark:text-gray-400">
                              Profe {schedule.instructor}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Step 4: Mundo STEAM Selection (Ciclo / Pack)
function StepMundoSelection({
  estudiantes,
  onChange,
}: {
  estudiantes: EstudianteInscripcion[];
  onChange: (estudiantes: EstudianteInscripcion[]) => void;
}) {
  const mundos = [
    {
      value: MundoSTEAM.MATEMATICA,
      label: '🔢 Matemática',
      description: 'Lógica y resolución de problemas',
    },
    {
      value: MundoSTEAM.PROGRAMACION,
      label: '💻 Programación',
      description: 'Código y desarrollo',
    },
    {
      value: MundoSTEAM.CIENCIAS,
      label: '🔬 Ciencias',
      description: 'Experimentos y descubrimiento',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Selección de Mundo STEAM
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Elegí un mundo STEAM para cada estudiante (Ciclo 2026)
        </p>
      </div>

      {estudiantes.map((estudiante, estIndex) => (
        <div
          key={estIndex}
          className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <h4 className="font-bold text-gray-900 dark:text-white mb-4">{estudiante.nombre}</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mundos.map((mundo) => (
              <button
                key={mundo.value}
                onClick={() => {
                  const updated = [...estudiantes];
                  updated[estIndex].mundo_seleccionado = mundo.value;
                  onChange(updated);
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  estudiante.mundo_seleccionado === mundo.value
                    ? 'border-[#fbbf24] bg-[#fbbf24]/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-[#fbbf24]'
                }`}
              >
                <p className="text-2xl mb-2">{mundo.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{mundo.description}</p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Step 5: Resumen
function StepResumen({
  tipoInscripcion,
  tutorData,
  estudiantes,
}: {
  tipoInscripcion: TipoInscripcion2026;
  tutorData: TutorData;
  estudiantes: EstudianteInscripcion[];
}) {
  const cursosPerEstudiante = estudiantes.map((e) => e.cursos_seleccionados?.length || 0);
  const { inscripcion, mensual, descuento } = calcularTotalEstimado(
    tipoInscripcion,
    estudiantes.length,
    cursosPerEstudiante,
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Resumen de Inscripción
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Verificá todos los datos antes de confirmar
        </p>
      </div>

      {/* Padre/Madre/Tutor */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Padre/Madre/Tutor</h4>
        <p className="text-gray-700 dark:text-gray-300">{tutorData.nombre}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{tutorData.email}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">CUIL: {tutorData.cuil}</p>
      </div>

      {/* Estudiantes */}
      <div className="space-y-2">
        <h4 className="font-bold text-gray-900 dark:text-white">Estudiantes</h4>
        {estudiantes.map((est, i) => (
          <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="font-semibold text-gray-900 dark:text-white">
              {est.nombre} ({est.edad} años)
            </p>
            {est.cursos_seleccionados && est.cursos_seleccionados.length > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cursos: {est.cursos_seleccionados.map((c) => c.course_name).join(', ')}
              </p>
            )}
            {est.mundo_seleccionado && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mundo: {est.mundo_seleccionado}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Precios */}
      <div className="p-6 bg-gradient-to-br from-[#fbbf24]/10 to-[#f97316]/10 rounded-xl border-2 border-[#fbbf24]/30">
        <h4 className="font-bold text-gray-900 dark:text-white mb-4">Desglose de Precios</h4>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">Inscripción:</span>
            <span className="font-bold text-gray-900 dark:text-white">
              ${inscripcion.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">Cuota mensual:</span>
            <span className="font-bold text-gray-900 dark:text-white">
              ${mensual.toLocaleString()}/mes
            </span>
          </div>

          {descuento > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>Descuento por hermanos:</span>
              <span className="font-bold">{descuento}%</span>
            </div>
          )}

          <div className="pt-3 border-t-2 border-gray-300 dark:border-gray-600 flex justify-between text-lg">
            <span className="font-bold text-gray-900 dark:text-white">A pagar hoy:</span>
            <span className="font-black text-[#f97316] text-2xl">
              ${inscripcion.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
