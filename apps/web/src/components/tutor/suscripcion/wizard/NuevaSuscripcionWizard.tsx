'use client';

import { ArrowLeft, ArrowRight, Loader2, AlertCircle, CreditCard } from 'lucide-react';
import { useWizardState } from './hooks/useWizardState';
import { WizardHeader, StepProgress } from './components';
import { HijoStep, ProductoStep, TierStep, HorarioStep, ConfirmarStep } from './steps';

/**
 * Wizard de Nueva Suscripción
 *
 * Componente orquestador que maneja el flujo de inscripción de un estudiante.
 *
 * Arquitectura:
 * - Estado centralizado en useWizardState hook
 * - Steps modulares e independientes
 * - Componentes auxiliares reutilizables
 *
 * Flujo:
 * 1. Hijo: Seleccionar hijo existente o crear uno nuevo
 * 2. Producto: Elegir mundo STEAM y actividad
 * 3. Tier: Seleccionar plan de suscripción
 * 4. Horario: (Solo SINCRÓNICO) Elegir horario de clases
 * 5. Confirmar: Revisar y crear suscripción
 */
export function NuevaSuscripcionWizard(): React.ReactElement {
  const {
    // Estado
    step,
    seleccion,
    isLoading,
    error,
    isCreating,
    showNuevoHijoForm,
    nuevoHijoForm,
    isCreatingChild,
    hijos,
    productos,
    mundoSeleccionado,
    casaCalculada,
    currentStepIndex,
    steps,

    // Navegación
    canGoNext,
    handleNext,
    handleBack,
    goToSuscripcion,

    // Acciones
    handleSelectHijo,
    handleSelectMundo,
    handleSelectProducto,
    handleSelectHorario,
    handleSelectTier,
    handleShowNuevoHijoForm,
    handleHideNuevoHijoForm,
    handleNuevoHijoFormChange,
    handleCrearSuscripcion,
  } = useWizardState();

  // Estado de carga inicial
  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-[#0a0a12]">
        <WizardHeader onBack={goToSuscripcion} title="Nueva Inscripción" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
            <p className="text-slate-400">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error && step === 'hijo') {
    return (
      <div className="h-full flex flex-col bg-[#0a0a12]">
        <WizardHeader onBack={goToSuscripcion} title="Nueva Inscripción" />
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

  return (
    <div className="h-full flex flex-col bg-[#0a0a12] overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      <WizardHeader onBack={goToSuscripcion} title="Nueva Inscripción" />

      <StepProgress steps={steps} currentStep={step} currentStepIndex={currentStepIndex} />

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
              onShowForm={handleShowNuevoHijoForm}
              onHideForm={handleHideNuevoHijoForm}
              onFormChange={handleNuevoHijoFormChange}
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
            <ConfirmarStep seleccion={seleccion} casaCalculada={casaCalculada} />
          )}

          {/* Error durante creación */}
          {error && step !== 'hijo' && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer con navegación */}
      <WizardFooter
        step={step}
        canGoNext={canGoNext()}
        isCreating={isCreating}
        isCreatingChild={isCreatingChild}
        onBack={step === 'hijo' ? goToSuscripcion : handleBack}
        onNext={handleNext}
        onCrearSuscripcion={handleCrearSuscripcion}
      />
    </div>
  );
}

interface WizardFooterProps {
  readonly step: string;
  readonly canGoNext: boolean;
  readonly isCreating: boolean;
  readonly isCreatingChild: boolean;
  readonly onBack: () => void;
  readonly onNext: () => void;
  readonly onCrearSuscripcion: () => void;
}

/**
 * Footer del wizard con botones de navegación
 */
function WizardFooter({
  step,
  canGoNext,
  isCreating,
  isCreatingChild,
  onBack,
  onNext,
  onCrearSuscripcion,
}: WizardFooterProps): React.ReactElement {
  const isProcessing = isCreating || isCreatingChild;

  return (
    <div className="relative z-10 px-6 py-4 border-t border-white/5 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {step === 'hijo' ? 'Cancelar' : 'Atrás'}
        </button>

        {step === 'confirmar' ? (
          <button
            onClick={onCrearSuscripcion}
            disabled={isProcessing}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isProcessing ? (
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
            onClick={onNext}
            disabled={!canGoNext}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Siguiente
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default NuevaSuscripcionWizard;
