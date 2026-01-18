'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  AlertCircle,
  BookOpen,
  Video,
  Crown,
  User,
  Plus,
  Calendar,
  CreditCard,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { tutoresApi, type HijoInfo, type CrearHijoRequest } from '@/lib/api/tutores.api';
import {
  getClubsPorCasaMundo,
  type ClubConClaseGrupos,
  type CasaTipo as APICasaTipo,
  type MundoTipo as APIMundoTipo,
} from '@/lib/api/catalogo.api';
import {
  useSuscripcionFamiliar,
  // useSimularMonto, // TODO: Descomentar cuando se integre con backend real
  formatMonto,
  type TierNombre,
} from '@/hooks/useSuscripcionFamiliar';

// ============================================================================
// TIPOS
// ============================================================================

/** Pasos del wizard unificado */
type WizardStep = 'hijo' | 'producto' | 'horario' | 'tier' | 'confirmar';

/** Datos de un nuevo hijo a registrar */
interface NuevoHijoData {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  nivelEscolar: 'Primaria' | 'Secundaria' | 'Universidad';
}

/** Producto con información de Casa/Mundo del backend */
interface ProductoConCasa {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  casa: CasaTipo | null;
  mundo: MundoTipo | null;
  activo: boolean;
  claseGrupos?: ClaseGrupoInfo[];
}

/** Información de un grupo de clase (horario) */
interface ClaseGrupoInfo {
  id: string;
  nombre: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  docente?: {
    nombre: string;
    apellido: string;
  };
  cupoDisponible: number;
}

/** Tipos de Casa */
type CasaTipo = 'QUANTUM' | 'VERTEX' | 'PULSAR';

/** Tipos de Mundo */
type MundoTipo = 'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS';

/** Selección completa del wizard */
interface WizardSeleccion {
  hijo: HijoInfo | null;
  nuevoHijo: NuevoHijoData | null;
  producto: ProductoConCasa | null;
  claseGrupo: ClaseGrupoInfo | null;
  tier: TierNombre | null;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const TIERS: Array<{
  id: TierNombre;
  nombre: string;
  precio: number;
  descripcion: string;
  beneficios: string[];
  icon: typeof BookOpen;
  gradient: string;
  popular?: boolean;
  requiereHorario: boolean;
}> = [
  {
    id: 'STEAM_LIBROS',
    nombre: 'STEAM Libros',
    precio: 40000,
    descripcion: 'Acceso a la plataforma completa sin clases',
    beneficios: [
      'Microlecciones interactivas',
      'Juegos educativos',
      'Ejercicios y desafíos',
      'Progreso gamificado',
    ],
    icon: BookOpen,
    gradient: 'from-cyan-500 to-blue-600',
    requiereHorario: false,
  },
  {
    id: 'STEAM_ASINCRONICO',
    nombre: 'STEAM Asincrónico',
    precio: 65000,
    descripcion: 'Todo + clases grabadas para ver cuando quieras',
    beneficios: [
      'Todo de STEAM Libros',
      'Clases grabadas HD',
      'Material descargable',
      'Soporte por chat',
    ],
    icon: Video,
    gradient: 'from-violet-500 to-purple-600',
    popular: true,
    requiereHorario: false,
  },
  {
    id: 'STEAM_SINCRONICO',
    nombre: 'STEAM Sincrónico',
    precio: 95000,
    descripcion: 'Todo + clases en vivo con docente',
    beneficios: [
      'Todo de STEAM Asincrónico',
      'Clases en vivo semanales',
      'Grupos reducidos (max 8)',
      'Seguimiento personalizado',
    ],
    icon: Crown,
    gradient: 'from-amber-500 to-orange-600',
    requiereHorario: true,
  },
];

const CASAS: Record<CasaTipo, { nombre: string; edadMin: number; edadMax: number; color: string }> =
  {
    QUANTUM: { nombre: 'Quantum', edadMin: 6, edadMax: 9, color: 'cyan' },
    VERTEX: { nombre: 'Vertex', edadMin: 10, edadMax: 12, color: 'violet' },
    PULSAR: { nombre: 'Pulsar', edadMin: 13, edadMax: 17, color: 'amber' },
  };

const MUNDOS: Record<MundoTipo, { nombre: string; emoji: string; color: string }> = {
  MATEMATICA: { nombre: 'Matemática', emoji: '🔢', color: 'orange' },
  PROGRAMACION: { nombre: 'Programación', emoji: '💻', color: 'green' },
  CIENCIAS: { nombre: 'Ciencias', emoji: '🔬', color: 'blue' },
};

// ============================================================================
// MAPEO DE DATOS DEL BACKEND
// ============================================================================

/** Día de la semana en español */
const DIAS_SEMANA: Record<string, string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
};

/**
 * Convierte un Club del backend al formato esperado por el wizard
 */
function mapClubToProducto(club: ClubConClaseGrupos): ProductoConCasa {
  return {
    id: club.id,
    nombre: club.nombre,
    descripcion: club.descripcion ?? '',
    tipo: 'Club',
    casa: club.casa as CasaTipo | null,
    mundo: club.mundo as MundoTipo | null,
    activo: club.activo,
    claseGrupos: club.claseGrupos.map((cg) => ({
      id: cg.id,
      nombre: cg.nombre,
      diaSemana: DIAS_SEMANA[cg.dia_semana] ?? cg.dia_semana,
      horaInicio: cg.hora_inicio,
      horaFin: cg.hora_fin,
      // Docente viene directo del backend (sin anidamiento)
      docente: cg.docente ?? undefined,
      cupoDisponible: cg.cupo_maximo, // TODO: Calcular cupo real (cupo_maximo - inscripciones)
    })),
  };
}

// ============================================================================
// UTILIDADES
// ============================================================================

/** Calcula la casa según la edad */
function calcularCasa(fechaNacimiento: string | Date | null): CasaTipo | null {
  if (!fechaNacimiento) return null;

  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  if (edad >= 6 && edad <= 9) return 'QUANTUM';
  if (edad >= 10 && edad <= 12) return 'VERTEX';
  if (edad >= 13 && edad <= 17) return 'PULSAR';
  return null;
}

/** Calcula edad desde fecha de nacimiento */
function calcularEdad(fechaNacimiento: string | Date | null): number | null {
  if (!fechaNacimiento) return null;

  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function NuevaSuscripcionWizard(): React.ReactElement {
  const router = useRouter();
  const { crearSuscripcion, isCreating } = useSuscripcionFamiliar();
  // TODO: Descomentar cuando se integre con backend real
  // const { simular, data: simulacion, isLoading: isSimulando } = useSimularMonto();
  const simulacion = null;
  const isSimulando = false;

  // Estado del wizard
  const [step, setStep] = useState<WizardStep>('hijo');
  const [seleccion, setSeleccion] = useState<WizardSeleccion>({
    hijo: null,
    nuevoHijo: null,
    producto: null,
    claseGrupo: null,
    tier: null,
  });

  // Estado de formulario nuevo hijo
  const [showNuevoHijoForm, setShowNuevoHijoForm] = useState(false);
  const [nuevoHijoForm, setNuevoHijoForm] = useState<NuevoHijoData>({
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    nivelEscolar: 'Primaria',
  });
  const [isCreatingChild, setIsCreatingChild] = useState(false);

  // Datos cargados
  const [hijos, setHijos] = useState<HijoInfo[]>([]);
  const [productos, setProductos] = useState<ProductoConCasa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mundo seleccionado (filtro de productos)
  const [mundoSeleccionado, setMundoSeleccionado] = useState<MundoTipo | null>(null);

  // Casa calculada del hijo seleccionado
  const casaCalculada: CasaTipo | null =
    (seleccion.hijo?.casa as CasaTipo | null) ??
    (seleccion.nuevoHijo ? calcularCasa(seleccion.nuevoHijo.fechaNacimiento) : null);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const dashboard = await tutoresApi.getDashboardResumen();
        setHijos(dashboard.hijos);

        // Si no tiene hijos, mostrar formulario directamente
        if (dashboard.hijos.length === 0) {
          setShowNuevoHijoForm(true);
        }
      } catch {
        setError('No pudimos cargar los datos. Intentá de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Cargar productos cuando se selecciona mundo
  useEffect(() => {
    if (mundoSeleccionado && casaCalculada) {
      const fetchProductos = async () => {
        try {
          const clubs = await getClubsPorCasaMundo(
            casaCalculada as APICasaTipo,
            mundoSeleccionado as APIMundoTipo,
          );
          setProductos(clubs.map(mapClubToProducto));
        } catch {
          setProductos([]);
        }
      };
      fetchProductos();
    }
  }, [mundoSeleccionado, casaCalculada]);

  // TODO: Descomentar cuando se integre con backend real
  // Simular monto cuando cambia el tier
  // useEffect(() => {
  //   if (seleccion.tier && seleccion.producto) {
  //     simular([seleccion.producto.id]);
  //   }
  // }, [seleccion.tier, seleccion.producto, simular]);

  // ============================================================================
  // HANDLERS DE NAVEGACIÓN
  // ============================================================================

  const canGoNext = useCallback((): boolean => {
    switch (step) {
      case 'hijo':
        return !!(seleccion.hijo || (showNuevoHijoForm && nuevoHijoForm.fechaNacimiento));
      case 'producto':
        return !!seleccion.producto;
      case 'horario':
        return !!seleccion.claseGrupo;
      case 'tier':
        return !!seleccion.tier;
      default:
        return false;
    }
  }, [step, seleccion, showNuevoHijoForm, nuevoHijoForm]);

  const handleNext = () => {
    if (!canGoNext()) return;

    // Guardar nuevo hijo si está en formulario
    if (step === 'hijo' && showNuevoHijoForm && nuevoHijoForm.fechaNacimiento) {
      setSeleccion((prev) => ({ ...prev, nuevoHijo: { ...nuevoHijoForm } }));
    }

    // Determinar siguiente paso
    switch (step) {
      case 'hijo':
        setStep('producto');
        break;
      case 'producto':
        // Primero el usuario elige tier
        setStep('tier');
        break;
      case 'tier':
        // Si el tier es SINCRONICO, necesita horario
        if (seleccion.tier === 'STEAM_SINCRONICO') {
          setStep('horario');
        } else {
          setStep('confirmar');
        }
        break;
      case 'horario':
        setStep('confirmar');
        break;
    }
  };

  const handleBack = () => {
    switch (step) {
      case 'producto':
        setStep('hijo');
        setMundoSeleccionado(null);
        break;
      case 'tier':
        setStep('producto');
        break;
      case 'horario':
        setStep('tier');
        break;
      case 'confirmar':
        if (seleccion.tier === 'STEAM_SINCRONICO') {
          setStep('horario');
        } else {
          setStep('tier');
        }
        break;
    }
  };

  const handleSelectHijo = (hijo: HijoInfo) => {
    setSeleccion((prev) => ({ ...prev, hijo, nuevoHijo: null }));
    setShowNuevoHijoForm(false);
  };

  const handleSelectMundo = (mundo: MundoTipo) => {
    setMundoSeleccionado(mundo);
    setSeleccion((prev) => ({ ...prev, producto: null, claseGrupo: null }));
  };

  const handleSelectProducto = (producto: ProductoConCasa) => {
    setSeleccion((prev) => ({ ...prev, producto, claseGrupo: null }));
  };

  const handleSelectHorario = (claseGrupo: ClaseGrupoInfo) => {
    setSeleccion((prev) => ({ ...prev, claseGrupo }));
  };

  const handleSelectTier = (tier: TierNombre) => {
    setSeleccion((prev) => ({ ...prev, tier }));
  };

  const handleCrearSuscripcion = async () => {
    if (!seleccion.tier) return;

    try {
      setError(null);
      let estudianteId = seleccion.hijo?.id;

      // Si hay nuevoHijo, primero crearlo en el backend
      if (!estudianteId && seleccion.nuevoHijo) {
        setIsCreatingChild(true);

        const edad = calcularEdad(seleccion.nuevoHijo.fechaNacimiento);
        if (!edad || edad < 3 || edad > 99) {
          setError('La edad del hijo debe estar entre 3 y 99 años');
          setIsCreatingChild(false);
          return;
        }

        const nuevoHijoPayload: CrearHijoRequest = {
          nombre: seleccion.nuevoHijo.nombre,
          apellido: seleccion.nuevoHijo.apellido,
          edad,
          nivelEscolar: seleccion.nuevoHijo.nivelEscolar,
        };

        try {
          const response = await tutoresApi.crearHijo(nuevoHijoPayload);
          estudianteId = response.estudiante.id;
        } catch {
          setError('Error al crear el nuevo hijo. Verificá los datos e intentá de nuevo.');
          setIsCreatingChild(false);
          return;
        }
        setIsCreatingChild(false);
      }

      // Build inscripciones array if we have producto and estudianteId
      // MODELO 2026: El tier se asocia a cada inscripción, no a la familia
      const inscripciones =
        seleccion.producto && estudianteId && seleccion.tier
          ? [
              {
                estudianteId,
                productoId: seleccion.producto.id,
                // Tier específico de esta inscripción (MODELO 2026)
                tier: seleccion.tier,
                // Include claseGrupoId when tier is STEAM_SINCRONICO and has selected horario
                ...(seleccion.tier === 'STEAM_SINCRONICO' && seleccion.claseGrupo
                  ? { claseGrupoId: seleccion.claseGrupo.id }
                  : {}),
              },
            ]
          : [];

      const payload = {
        tier: seleccion.tier,
        inscripciones,
      };

      const result = await crearSuscripcion(payload);

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        router.push('/tutor/suscripcion');
      }
    } catch {
      setError('Error al crear la suscripción. Intentá de nuevo.');
    }
  };

  // ============================================================================
  // RENDER: ESTADOS DE CARGA/ERROR
  // ============================================================================

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-[#0a0a12]">
        <Header onBack={() => router.push('/tutor/suscripcion')} title="Nueva Inscripción" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
            <p className="text-slate-400">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col bg-[#0a0a12]">
        <Header onBack={() => router.push('/tutor/suscripcion')} title="Nueva Inscripción" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: WIZARD
  // ============================================================================

  // Calcular pasos dinámicamente
  const steps: { id: WizardStep; label: string }[] = [
    { id: 'hijo', label: 'Hijo' },
    { id: 'producto', label: 'Actividad' },
    { id: 'tier', label: 'Plan' },
  ];

  // Agregar paso de horario si el tier seleccionado lo requiere
  if (seleccion.tier === 'STEAM_SINCRONICO') {
    steps.push({ id: 'horario', label: 'Horario' });
  }

  steps.push({ id: 'confirmar', label: 'Confirmar' });

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="h-full flex flex-col bg-[#0a0a12] overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      <Header onBack={() => router.push('/tutor/suscripcion')} title="Nueva Inscripción" />

      {/* Progress Steps */}
      <div className="relative z-10 px-6 py-4 border-b border-white/5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {steps.map((s, idx) => (
            <React.Fragment key={s.id}>
              {idx > 0 && <div className="flex-1 h-px bg-white/10 mx-2" />}
              <StepIndicator
                number={idx + 1}
                label={s.label}
                active={step === s.id}
                completed={idx < currentStepIndex}
              />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {step === 'hijo' && (
            <HijoStep
              hijos={hijos}
              selectedHijo={seleccion.hijo}
              showForm={showNuevoHijoForm}
              formData={nuevoHijoForm}
              onSelectHijo={handleSelectHijo}
              onShowForm={() => setShowNuevoHijoForm(true)}
              onHideForm={() => {
                setShowNuevoHijoForm(false);
                setNuevoHijoForm({
                  nombre: '',
                  apellido: '',
                  fechaNacimiento: '',
                  nivelEscolar: 'Primaria',
                });
              }}
              onFormChange={setNuevoHijoForm}
            />
          )}

          {step === 'producto' && (
            <ProductoStep
              casa={casaCalculada}
              mundoSeleccionado={mundoSeleccionado}
              productos={productos}
              selectedProducto={seleccion.producto}
              onSelectMundo={handleSelectMundo}
              onSelectProducto={handleSelectProducto}
            />
          )}

          {step === 'tier' && (
            <TierStep
              selectedTier={seleccion.tier}
              onSelectTier={handleSelectTier}
              productoNombre={seleccion.producto?.nombre}
            />
          )}

          {step === 'horario' && seleccion.producto?.claseGrupos && (
            <HorarioStep
              claseGrupos={seleccion.producto.claseGrupos}
              selectedClaseGrupo={seleccion.claseGrupo}
              onSelectHorario={handleSelectHorario}
            />
          )}

          {step === 'confirmar' && (
            <ConfirmarStep
              seleccion={seleccion}
              casaCalculada={casaCalculada}
              simulacion={simulacion}
              isSimulando={isSimulando}
            />
          )}
        </div>
      </div>

      {/* Footer con navegación */}
      <div className="relative z-10 px-6 py-4 border-t border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={step === 'hijo' ? () => router.push('/tutor/suscripcion') : handleBack}
            className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {step === 'hijo' ? 'Cancelar' : 'Atrás'}
          </button>

          {step === 'confirmar' ? (
            <button
              onClick={handleCrearSuscripcion}
              disabled={isCreating || isCreatingChild}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isCreating || isCreatingChild ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isCreatingChild ? 'Registrando hijo...' : 'Procesando...'}
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Crear Suscripción
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canGoNext()}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Siguiente
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUBCOMPONENTES
// ============================================================================

/** Input de fecha con formato DD/MM/AAAA usando selects */
function FechaNacimientoInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (fecha: string) => void;
}): React.ReactElement {
  // Parsear valor existente (formato YYYY-MM-DD) directamente sin estado intermedio
  const parseValue = (val: string) => {
    if (!val) return { dia: '', mes: '', anio: '' };
    const [y, m, d] = val.split('-');
    return {
      dia: d ? String(parseInt(d, 10)) : '',
      mes: m ? String(parseInt(m, 10)) : '',
      anio: y || '',
    };
  };

  const { dia, mes, anio } = parseValue(value);

  // Actualizar valor cuando cambian los selects
  // Permitir cualquier orden de ingreso (día, mes, año en cualquier secuencia)
  const handleDiaChange = (newDia: string) => {
    const d = newDia ? newDia.padStart(2, '0') : '00';
    const m = mes ? mes.padStart(2, '0') : '00';
    const y = anio || '0000';
    onChange(`${y}-${m}-${d}`);
  };

  const handleMesChange = (newMes: string) => {
    const d = dia ? dia.padStart(2, '0') : '00';
    const m = newMes ? newMes.padStart(2, '0') : '00';
    const y = anio || '0000';
    onChange(`${y}-${m}-${d}`);
  };

  const handleAnioChange = (newAnio: string) => {
    const d = dia ? dia.padStart(2, '0') : '00';
    const m = mes ? mes.padStart(2, '0') : '00';
    const y = newAnio || '0000';
    onChange(`${y}-${m}-${d}`);
  };

  // Generar opciones
  const dias = Array.from({ length: 31 }, (_, i) => i + 1);
  const meses = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];
  const anioActual = new Date().getFullYear();
  const anios = Array.from({ length: 18 }, (_, i) => anioActual - 5 - i); // 5-22 años atrás

  const selectClass =
    'px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 appearance-none cursor-pointer';

  return (
    <div className="grid grid-cols-3 gap-3">
      <select value={dia} onChange={(e) => handleDiaChange(e.target.value)} className={selectClass}>
        <option value="" className="bg-slate-900">
          Día
        </option>
        {dias.map((d) => (
          <option key={d} value={d.toString()} className="bg-slate-900">
            {d}
          </option>
        ))}
      </select>

      <select value={mes} onChange={(e) => handleMesChange(e.target.value)} className={selectClass}>
        <option value="" className="bg-slate-900">
          Mes
        </option>
        {meses.map((m) => (
          <option key={m.value} value={m.value} className="bg-slate-900">
            {m.label}
          </option>
        ))}
      </select>

      <select
        value={anio}
        onChange={(e) => handleAnioChange(e.target.value)}
        className={selectClass}
      >
        <option value="" className="bg-slate-900">
          Año
        </option>
        {anios.map((a) => (
          <option key={a} value={a.toString()} className="bg-slate-900">
            {a}
          </option>
        ))}
      </select>
    </div>
  );
}

function Header({ onBack, title }: { onBack: () => void; title: string }): React.ReactElement {
  return (
    <header className="h-16 shrink-0 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-6 flex items-center relative z-20">
      <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
        <ArrowLeft className="w-5 h-5 text-slate-400" />
      </button>
      <div className="ml-3">
        <h1 className="text-lg font-bold text-white">{title}</h1>
        <p className="text-xs text-slate-500">Inscribí a tu hijo en Mateatletas</p>
      </div>
    </header>
  );
}

function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}): React.ReactElement {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
          completed
            ? 'bg-emerald-500 text-white'
            : active
              ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
              : 'bg-white/10 text-slate-500'
        }`}
      >
        {completed ? <Check className="w-4 h-4" /> : number}
      </div>
      <span
        className={`text-sm hidden sm:inline ${active ? 'text-white font-medium' : 'text-slate-500'}`}
      >
        {label}
      </span>
    </div>
  );
}

// ============================================================================
// PASO 1: SELECCIÓN DE HIJO
// ============================================================================

function HijoStep({
  hijos,
  selectedHijo,
  showForm,
  formData,
  onSelectHijo,
  onShowForm,
  onHideForm,
  onFormChange,
}: {
  hijos: HijoInfo[];
  selectedHijo: HijoInfo | null;
  showForm: boolean;
  formData: NuevoHijoData;
  onSelectHijo: (hijo: HijoInfo) => void;
  onShowForm: () => void;
  onHideForm: () => void;
  onFormChange: (data: NuevoHijoData) => void;
}): React.ReactElement {
  const casaCalculada = formData.fechaNacimiento ? calcularCasa(formData.fechaNacimiento) : null;
  const edadCalculada = formData.fechaNacimiento ? calcularEdad(formData.fechaNacimiento) : null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">¿A quién vas a inscribir?</h2>
      <p className="text-slate-400 mb-8">Seleccioná uno de tus hijos o agregá uno nuevo</p>

      {/* Lista de hijos existentes */}
      {hijos.length > 0 && !showForm && (
        <div className="space-y-3 mb-6">
          {hijos.map((hijo) => {
            const isSelected = selectedHijo?.id === hijo.id;
            return (
              <button
                key={hijo.id}
                onClick={() => onSelectHijo(hijo)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/50 ring-2 ring-cyan-500/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {hijo.nombre[0]}
                  {hijo.apellido[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-lg">
                    {hijo.nombre} {hijo.apellido}
                  </p>
                  <p className="text-sm text-slate-400">
                    {hijo.edad ? `${hijo.edad} años` : 'Sin edad registrada'}
                    {hijo.casa && (
                      <span className="ml-2 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full text-xs">
                        Casa {hijo.casa}
                      </span>
                    )}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Botón para agregar nuevo hijo */}
      {!showForm && (
        <button
          onClick={onShowForm}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-white/20 text-slate-400 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all"
        >
          <Plus className="w-5 h-5" />
          Agregar nuevo hijo
        </button>
      )}

      {/* Formulario nuevo hijo */}
      {showForm && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Nuevo estudiante</h3>
              <p className="text-sm text-slate-400">Completá los datos de tu hijo</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => onFormChange({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                placeholder="Juan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Apellido</label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => onFormChange({ ...formData, apellido: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                placeholder="Pérez"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Fecha de nacimiento
              </label>
              <FechaNacimientoInput
                value={formData.fechaNacimiento}
                onChange={(fecha) => onFormChange({ ...formData, fechaNacimiento: fecha })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Nivel escolar</label>
              <select
                value={formData.nivelEscolar}
                onChange={(e) =>
                  onFormChange({
                    ...formData,
                    nivelEscolar: e.target.value as 'Primaria' | 'Secundaria' | 'Universidad',
                  })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
              >
                <option value="Primaria" className="bg-slate-900">
                  Primaria
                </option>
                <option value="Secundaria" className="bg-slate-900">
                  Secundaria
                </option>
                <option value="Universidad" className="bg-slate-900">
                  Universidad
                </option>
              </select>
            </div>
          </div>

          {/* Mostrar casa calculada */}
          {casaCalculada && edadCalculada && (
            <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-white font-medium">
                    {edadCalculada} años → Casa {CASAS[casaCalculada].nombre}
                  </p>
                  <p className="text-sm text-slate-400">
                    Estudiantes de {CASAS[casaCalculada].edadMin}-{CASAS[casaCalculada].edadMax}{' '}
                    años
                  </p>
                </div>
              </div>
            </div>
          )}

          {hijos.length > 0 && (
            <button
              onClick={onHideForm}
              className="mt-4 text-sm text-slate-400 hover:text-white transition-colors"
            >
              ← Volver a mis hijos
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PASO 2: SELECCIÓN DE MUNDO Y PRODUCTO
// ============================================================================

function ProductoStep({
  casa,
  mundoSeleccionado,
  productos,
  selectedProducto,
  onSelectMundo,
  onSelectProducto,
}: {
  casa: CasaTipo | null;
  mundoSeleccionado: MundoTipo | null;
  productos: ProductoConCasa[];
  selectedProducto: ProductoConCasa | null;
  onSelectMundo: (mundo: MundoTipo) => void;
  onSelectProducto: (producto: ProductoConCasa) => void;
}): React.ReactElement {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">¿Qué área te interesa?</h2>
      <p className="text-slate-400 mb-8">
        Elegí el mundo STEAM para tu hijo
        {casa && <span className="ml-2 text-cyan-400">(Casa {CASAS[casa].nombre})</span>}
      </p>

      {/* Selección de Mundo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {(Object.entries(MUNDOS) as [MundoTipo, (typeof MUNDOS)[MundoTipo]][]).map(
          ([tipo, mundo]) => {
            const isSelected = mundoSeleccionado === tipo;
            return (
              <button
                key={tipo}
                onClick={() => onSelectMundo(tipo)}
                className={`relative p-6 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/50 ring-2 ring-cyan-500/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="text-4xl mb-3">{mundo.emoji}</div>
                <h3 className="text-lg font-bold text-white mb-1">{mundo.nombre}</h3>
                <p className="text-sm text-slate-400">
                  Actividades de {mundo.nombre.toLowerCase()}
                </p>
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </button>
            );
          },
        )}
      </div>

      {/* Lista de productos del mundo seleccionado */}
      {mundoSeleccionado && productos.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Actividades disponibles en {MUNDOS[mundoSeleccionado].nombre}
          </h3>
          <div className="space-y-3">
            {productos.map((producto) => {
              const isSelected = selectedProducto?.id === producto.id;
              return (
                <button
                  key={producto.id}
                  onClick={() => onSelectProducto(producto)}
                  className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500/50 ring-2 ring-cyan-500/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{producto.nombre}</p>
                    <p className="text-sm text-slate-400 mt-1">{producto.descripcion}</p>
                    {producto.claseGrupos && producto.claseGrupos.length > 0 && (
                      <p className="text-xs text-cyan-400 mt-2">
                        {producto.claseGrupos.length} horarios disponibles
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {mundoSeleccionado && productos.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-400">
            No hay actividades disponibles para {MUNDOS[mundoSeleccionado].nombre} en Casa{' '}
            {casa ? CASAS[casa].nombre : ''} por el momento.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PASO 3: SELECCIÓN DE TIER
// ============================================================================

function TierStep({
  selectedTier,
  onSelectTier,
  productoNombre,
}: {
  selectedTier: TierNombre | null;
  onSelectTier: (tier: TierNombre) => void;
  productoNombre?: string;
}): React.ReactElement {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Elegí el plan para esta actividad</h2>
      <p className="text-slate-400 mb-8">
        {productoNombre ? (
          <>
            Seleccioná el plan para <span className="text-cyan-400">{productoNombre}</span>. Cada
            actividad puede tener su propio plan.
          </>
        ) : (
          'Cada actividad puede tener un plan diferente. Podés cambiarlo en cualquier momento.'
        )}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIERS.map((tier) => {
          const Icon = tier.icon;
          const isSelected = selectedTier === tier.id;

          return (
            <button
              key={tier.id}
              onClick={() => onSelectTier(tier.id)}
              className={`relative p-6 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-white/10 border-cyan-500/50 ring-2 ring-cyan-500/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold rounded-full">
                    Popular
                  </span>
                </div>
              )}

              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center mb-4`}
              >
                <Icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{tier.nombre}</h3>
              <p className="text-2xl font-bold text-emerald-400 mb-2">
                {formatMonto(tier.precio)}
                <span className="text-sm text-slate-400 font-normal">/mes</span>
              </p>
              <p className="text-sm text-slate-400 mb-4">{tier.descripcion}</p>

              <ul className="space-y-2">
                {tier.beneficios.map((beneficio, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    {beneficio}
                  </li>
                ))}
              </ul>

              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// PASO 4: SELECCIÓN DE HORARIO (Solo para STEAM_SINCRONICO)
// ============================================================================

function HorarioStep({
  claseGrupos,
  selectedClaseGrupo,
  onSelectHorario,
}: {
  claseGrupos: ClaseGrupoInfo[];
  selectedClaseGrupo: ClaseGrupoInfo | null;
  onSelectHorario: (claseGrupo: ClaseGrupoInfo) => void;
}): React.ReactElement {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Elegí tu horario</h2>
      <p className="text-slate-400 mb-8">
        Las clases en vivo son semanales. Elegí el horario que más te convenga.
      </p>

      <div className="space-y-3">
        {claseGrupos.map((grupo) => {
          const isSelected = selectedClaseGrupo?.id === grupo.id;
          const sinCupo = grupo.cupoDisponible <= 0;

          return (
            <button
              key={grupo.id}
              onClick={() => !sinCupo && onSelectHorario(grupo)}
              disabled={sinCupo}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                sinCupo
                  ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                  : isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/50 ring-2 ring-cyan-500/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{grupo.diaSemana}</p>
                <p className="text-sm text-slate-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {grupo.horaInicio} - {grupo.horaFin}
                </p>
                {grupo.docente && (
                  <p className="text-sm text-slate-500 mt-1">
                    Prof. {grupo.docente.nombre} {grupo.docente.apellido}
                  </p>
                )}
              </div>
              <div className="text-right">
                {sinCupo ? (
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full">
                    Sin cupo
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm rounded-full">
                    {grupo.cupoDisponible} lugares
                  </span>
                )}
              </div>
              {isSelected && (
                <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// PASO 5: CONFIRMACIÓN
// ============================================================================

function ConfirmarStep({
  seleccion,
  casaCalculada,
  simulacion: _simulacion, // TODO: Usar cuando se integre descuentos desde backend
  isSimulando,
}: {
  seleccion: WizardSeleccion;
  casaCalculada: CasaTipo | null;
  simulacion: unknown; // TODO: Tipar cuando se integre useSimularMonto
  isSimulando: boolean;
}): React.ReactElement {
  const tierInfo = TIERS.find((t) => t.id === seleccion.tier);
  const hijoNombre = seleccion.hijo
    ? `${seleccion.hijo.nombre} ${seleccion.hijo.apellido}`
    : seleccion.nuevoHijo
      ? `${seleccion.nuevoHijo.nombre} ${seleccion.nuevoHijo.apellido}`
      : 'Sin nombre';

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Confirmar inscripción</h2>
      <p className="text-slate-400 mb-8">Revisá los detalles antes de continuar</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resumen de selecciones */}
        <div className="lg:col-span-2 space-y-4">
          {/* Estudiante */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
              Estudiante
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                {hijoNombre
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div>
                <p className="text-lg font-bold text-white">{hijoNombre}</p>
                {casaCalculada && (
                  <p className="text-sm text-cyan-400">Casa {CASAS[casaCalculada].nombre}</p>
                )}
              </div>
            </div>
          </div>

          {/* Actividad */}
          {seleccion.producto && (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
                Actividad
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{seleccion.producto.nombre}</p>
                  {seleccion.producto.mundo && (
                    <p className="text-sm text-slate-400">
                      {MUNDOS[seleccion.producto.mundo].emoji}{' '}
                      {MUNDOS[seleccion.producto.mundo].nombre}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Plan de esta actividad */}
          {tierInfo && (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
                Plan de esta actividad
              </h3>
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${tierInfo.gradient} rounded-xl flex items-center justify-center`}
                >
                  <tierInfo.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{tierInfo.nombre}</p>
                  <p className="text-sm text-slate-400">{tierInfo.descripcion}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Podés elegir un plan diferente para cada actividad de tu familia.
              </p>
            </div>
          )}

          {/* Horario (solo si es sincrónico) */}
          {seleccion.claseGrupo && (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
                Horario de clases
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{seleccion.claseGrupo.diaSemana}</p>
                  <p className="text-sm text-slate-400">
                    {seleccion.claseGrupo.horaInicio} - {seleccion.claseGrupo.horaFin}
                  </p>
                  {seleccion.claseGrupo.docente && (
                    <p className="text-sm text-slate-500">
                      Prof. {seleccion.claseGrupo.docente.nombre}{' '}
                      {seleccion.claseGrupo.docente.apellido}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card de total */}
        <div className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-cyan-900/20 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            Resumen
          </h3>

          {isSimulando ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{tierInfo?.nombre}</span>
                  <span className="text-white">{formatMonto(tierInfo?.precio ?? 0)}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-white">Total mensual</span>
                  <span className="text-2xl font-bold text-emerald-400">
                    {formatMonto(tierInfo?.precio ?? 0)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-4">
                Se cobrará mensualmente. Podés cancelar en cualquier momento desde tu panel.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NuevaSuscripcionWizard;
