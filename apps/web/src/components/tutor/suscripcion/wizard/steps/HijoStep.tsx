'use client';

import { Check, Plus, User, AlertCircle, Sparkles } from 'lucide-react';
import { FechaNacimientoInput } from '../components/FechaNacimientoInput';
import { calcularCasa, calcularEdad, CASAS } from '../utils';
import type { HijoInfo, NuevoHijoData, CasaTipo } from '../types';

interface HijoStepProps {
  readonly hijos: HijoInfo[];
  readonly selectedHijo: HijoInfo | null;
  readonly showForm: boolean;
  readonly formData: NuevoHijoData;
  readonly onSelectHijo: (hijo: HijoInfo) => void;
  readonly onShowForm: () => void;
  readonly onHideForm: () => void;
  readonly onFormChange: (data: NuevoHijoData) => void;
}

/**
 * Paso 1: Selección de hijo existente o registro de nuevo hijo
 */
export function HijoStep({
  hijos,
  selectedHijo,
  showForm,
  formData,
  onSelectHijo,
  onShowForm,
  onHideForm,
  onFormChange,
}: HijoStepProps): React.ReactElement {
  // Calcular casa y validación de edad para el formulario
  const casaResult = formData.fechaNacimiento
    ? calcularCasa(formData.fechaNacimiento)
    : { casa: null, error: null };
  const casaCalculada = casaResult.casa;
  const casaError = casaResult.error;
  const edadCalculada = formData.fechaNacimiento ? calcularEdad(formData.fechaNacimiento) : null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">¿A quién vas a inscribir?</h2>
      <p className="text-slate-400 mb-8">Seleccioná uno de tus hijos o agregá uno nuevo</p>

      {/* Lista de hijos existentes */}
      {hijos.length > 0 && !showForm && (
        <div className="space-y-3 mb-6">
          {hijos.map((hijo) => (
            <HijoCard
              key={hijo.id}
              hijo={hijo}
              isSelected={selectedHijo?.id === hijo.id}
              onSelect={() => onSelectHijo(hijo)}
            />
          ))}
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
        <NuevoHijoForm
          formData={formData}
          onFormChange={onFormChange}
          casaCalculada={casaCalculada}
          casaError={casaError}
          edadCalculada={edadCalculada}
          showBackButton={hijos.length > 0}
          onBack={onHideForm}
        />
      )}
    </div>
  );
}

interface HijoCardProps {
  readonly hijo: HijoInfo;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}

/**
 * Card de hijo existente seleccionable
 */
function HijoCard({ hijo, isSelected, onSelect }: HijoCardProps): React.ReactElement {
  return (
    <button
      onClick={onSelect}
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
}

interface NuevoHijoFormProps {
  readonly formData: NuevoHijoData;
  readonly onFormChange: (data: NuevoHijoData) => void;
  readonly casaCalculada: CasaTipo | null;
  readonly casaError: string | null;
  readonly edadCalculada: number | null;
  readonly showBackButton: boolean;
  readonly onBack: () => void;
}

/**
 * Formulario para registrar un nuevo hijo
 */
function NuevoHijoForm({
  formData,
  onFormChange,
  casaCalculada,
  casaError,
  edadCalculada,
  showBackButton,
  onBack,
}: NuevoHijoFormProps): React.ReactElement {
  return (
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

      {/* Error de validación de edad */}
      {casaError && edadCalculada !== null && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-red-400 font-medium">{casaError}</p>
              <p className="text-sm text-slate-400">
                Edad calculada: {edadCalculada} años. El rango permitido es de 6 a 17 años.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Casa calculada (solo si no hay error) */}
      {casaCalculada && edadCalculada !== null && !casaError && (
        <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20 rounded-xl mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-white font-medium">
                {edadCalculada} años → Casa {CASAS[casaCalculada].nombre}
              </p>
              <p className="text-sm text-slate-400">
                Estudiantes de {CASAS[casaCalculada].edadMin}-{CASAS[casaCalculada].edadMax} años
              </p>
            </div>
          </div>
        </div>
      )}

      {showBackButton && (
        <button
          onClick={onBack}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Volver a mis hijos
        </button>
      )}
    </div>
  );
}
