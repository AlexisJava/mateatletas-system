/**
 * Hook de estado del Wizard de Nueva Suscripción
 *
 * Centraliza toda la lógica de estado, navegación y acciones del wizard.
 * Sigue el patrón de custom hooks para separar lógica de UI.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { tutoresApi, type CrearHijoRequest } from '@/lib/api/tutores.api';
import {
  getClubsPorCasaMundo,
  type CasaTipo as APICasaTipo,
  type MundoTipo as APIMundoTipo,
} from '@/lib/api/catalogo.api';
import { useSuscripcionFamiliar } from '@/hooks/useSuscripcionFamiliar';
import { calcularCasa, calcularEdad, mapClubToProducto } from '../utils';
import type {
  WizardStep,
  WizardSeleccion,
  NuevoHijoData,
  ProductoConCasa,
  ClaseGrupoInfo,
  CasaTipo,
  MundoTipo,
  HijoInfo,
  TierNombre,
} from '../types';

/** Estado inicial del formulario de nuevo hijo */
const INITIAL_NUEVO_HIJO: NuevoHijoData = {
  nombre: '',
  apellido: '',
  fechaNacimiento: '',
  nivelEscolar: 'Primaria',
};

/** Estado inicial de selecciones del wizard */
const INITIAL_SELECCION: WizardSeleccion = {
  hijo: null,
  nuevoHijo: null,
  producto: null,
  claseGrupo: null,
  tier: null,
};

/** Retorno del hook useWizardState */
export interface UseWizardStateReturn {
  // Estado del wizard
  readonly step: WizardStep;
  readonly seleccion: WizardSeleccion;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly isCreating: boolean;

  // Estado del formulario nuevo hijo
  readonly showNuevoHijoForm: boolean;
  readonly nuevoHijoForm: NuevoHijoData;
  readonly isCreatingChild: boolean;

  // Datos cargados
  readonly hijos: HijoInfo[];
  readonly productos: ProductoConCasa[];

  // Estado de filtros
  readonly mundoSeleccionado: MundoTipo | null;

  // Valores calculados
  readonly casaCalculada: CasaTipo | null;
  readonly casaError: string | null;
  readonly currentStepIndex: number;
  readonly steps: Array<{ id: WizardStep; label: string }>;

  // Navegación
  readonly canGoNext: () => boolean;
  readonly handleNext: () => void;
  readonly handleBack: () => void;
  readonly goToSuscripcion: () => void;

  // Acciones de selección
  readonly handleSelectHijo: (hijo: HijoInfo) => void;
  readonly handleSelectMundo: (mundo: MundoTipo) => void;
  readonly handleSelectProducto: (producto: ProductoConCasa) => void;
  readonly handleSelectHorario: (claseGrupo: ClaseGrupoInfo) => void;
  readonly handleSelectTier: (tier: TierNombre) => void;

  // Acciones de formulario nuevo hijo
  readonly handleShowNuevoHijoForm: () => void;
  readonly handleHideNuevoHijoForm: () => void;
  readonly handleNuevoHijoFormChange: (data: NuevoHijoData) => void;

  // Acción final
  readonly handleCrearSuscripcion: () => Promise<void>;
  readonly clearError: () => void;
}

/**
 * Hook que maneja todo el estado y lógica del wizard
 */
export function useWizardState(): UseWizardStateReturn {
  const router = useRouter();
  const { crearSuscripcion, isCreating } = useSuscripcionFamiliar();

  // Estado principal del wizard
  const [step, setStep] = useState<WizardStep>('hijo');
  const [seleccion, setSeleccion] = useState<WizardSeleccion>(INITIAL_SELECCION);

  // Estado de carga y errores
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado del formulario nuevo hijo
  const [showNuevoHijoForm, setShowNuevoHijoForm] = useState(false);
  const [nuevoHijoForm, setNuevoHijoForm] = useState<NuevoHijoData>(INITIAL_NUEVO_HIJO);
  const [isCreatingChild, setIsCreatingChild] = useState(false);

  // Datos cargados del backend
  const [hijos, setHijos] = useState<HijoInfo[]>([]);
  const [productos, setProductos] = useState<ProductoConCasa[]>([]);

  // Filtro de mundo
  const [mundoSeleccionado, setMundoSeleccionado] = useState<MundoTipo | null>(null);

  // Cálculo de casa (del hijo seleccionado o del formulario)
  const casaResult = seleccion.nuevoHijo
    ? calcularCasa(seleccion.nuevoHijo.fechaNacimiento)
    : showNuevoHijoForm && nuevoHijoForm.fechaNacimiento
      ? calcularCasa(nuevoHijoForm.fechaNacimiento)
      : { casa: null, error: null };

  const casaCalculada: CasaTipo | null =
    (seleccion.hijo?.casa as CasaTipo | null) ?? casaResult.casa;
  const casaError = casaResult.error;

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const dashboard = await tutoresApi.getDashboardResumen();
        setHijos(dashboard.hijos);

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

  // Cargar productos cuando se selecciona mundo y hay casa calculada
  useEffect(() => {
    if (!mundoSeleccionado || !casaCalculada) return;

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
  }, [mundoSeleccionado, casaCalculada]);

  // Calcular pasos dinámicamente según selección de tier
  const steps: Array<{ id: WizardStep; label: string }> = [
    { id: 'hijo', label: 'Hijo' },
    { id: 'producto', label: 'Actividad' },
    { id: 'tier', label: 'Plan' },
  ];

  if (seleccion.tier === 'STEAM_SINCRONICO') {
    steps.push({ id: 'horario', label: 'Horario' });
  }

  steps.push({ id: 'confirmar', label: 'Confirmar' });

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  // Validar si puede avanzar al siguiente paso
  const canGoNext = useCallback((): boolean => {
    switch (step) {
      case 'hijo':
        if (showNuevoHijoForm && nuevoHijoForm.fechaNacimiento) {
          const result = calcularCasa(nuevoHijoForm.fechaNacimiento);
          if (result.error) return false;
          return nuevoHijoForm.nombre.trim() !== '' && nuevoHijoForm.apellido.trim() !== '';
        }
        return !!seleccion.hijo;
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

  // Navegación: siguiente
  const handleNext = useCallback(() => {
    if (!canGoNext()) return;

    // Guardar datos del formulario si está en paso hijo
    if (step === 'hijo' && showNuevoHijoForm && nuevoHijoForm.fechaNacimiento) {
      setSeleccion((prev) => ({ ...prev, nuevoHijo: { ...nuevoHijoForm } }));
    }

    // Determinar siguiente paso
    switch (step) {
      case 'hijo':
        setStep('producto');
        break;
      case 'producto':
        setStep('tier');
        break;
      case 'tier':
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
  }, [canGoNext, step, showNuevoHijoForm, nuevoHijoForm, seleccion.tier]);

  // Navegación: atrás
  const handleBack = useCallback(() => {
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
  }, [step, seleccion.tier]);

  // Navegación: ir a suscripción
  const goToSuscripcion = useCallback(() => {
    router.push('/tutor/suscripcion');
  }, [router]);

  // Acciones de selección
  const handleSelectHijo = useCallback((hijo: HijoInfo) => {
    setSeleccion((prev) => ({ ...prev, hijo, nuevoHijo: null }));
    setShowNuevoHijoForm(false);
  }, []);

  const handleSelectMundo = useCallback((mundo: MundoTipo) => {
    setMundoSeleccionado(mundo);
    setSeleccion((prev) => ({ ...prev, producto: null, claseGrupo: null }));
  }, []);

  const handleSelectProducto = useCallback((producto: ProductoConCasa) => {
    setSeleccion((prev) => ({ ...prev, producto, claseGrupo: null }));
  }, []);

  const handleSelectHorario = useCallback((claseGrupo: ClaseGrupoInfo) => {
    setSeleccion((prev) => ({ ...prev, claseGrupo }));
  }, []);

  const handleSelectTier = useCallback((tier: TierNombre) => {
    setSeleccion((prev) => ({ ...prev, tier }));
  }, []);

  // Acciones de formulario nuevo hijo
  const handleShowNuevoHijoForm = useCallback(() => {
    setShowNuevoHijoForm(true);
  }, []);

  const handleHideNuevoHijoForm = useCallback(() => {
    setShowNuevoHijoForm(false);
    setNuevoHijoForm(INITIAL_NUEVO_HIJO);
  }, []);

  const handleNuevoHijoFormChange = useCallback((data: NuevoHijoData) => {
    setNuevoHijoForm(data);
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Crear suscripción
  const handleCrearSuscripcion = useCallback(async () => {
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

      // Construir inscripciones - MODELO 2026: tier por inscripción
      const inscripciones =
        seleccion.producto && estudianteId && seleccion.tier
          ? [
              {
                estudianteId,
                productoId: seleccion.producto.id,
                tier: seleccion.tier,
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
  }, [seleccion, crearSuscripcion, router]);

  return {
    // Estado del wizard
    step,
    seleccion,
    isLoading,
    error,
    isCreating,

    // Estado del formulario nuevo hijo
    showNuevoHijoForm,
    nuevoHijoForm,
    isCreatingChild,

    // Datos cargados
    hijos,
    productos,

    // Estado de filtros
    mundoSeleccionado,

    // Valores calculados
    casaCalculada,
    casaError,
    currentStepIndex,
    steps,

    // Navegación
    canGoNext,
    handleNext,
    handleBack,
    goToSuscripcion,

    // Acciones de selección
    handleSelectHijo,
    handleSelectMundo,
    handleSelectProducto,
    handleSelectHorario,
    handleSelectTier,

    // Acciones de formulario nuevo hijo
    handleShowNuevoHijoForm,
    handleHideNuevoHijoForm,
    handleNuevoHijoFormChange,

    // Acción final
    handleCrearSuscripcion,
    clearError,
  };
}
