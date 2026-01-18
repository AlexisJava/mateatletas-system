'use client';

import { Loader2, BookOpen, Calendar } from 'lucide-react';
import { TIERS_CONFIG, formatMonto, type TierNombre } from '@mateatletas/contracts';
import { CASAS, MUNDOS, obtenerNombreCompleto, obtenerIniciales } from '../utils';
import { TIERS_UI } from './TierStep';
import type { WizardSeleccion, CasaTipo } from '../types';

interface ConfirmarStepProps {
  readonly seleccion: WizardSeleccion;
  readonly casaCalculada: CasaTipo | null;
  readonly isSimulando?: boolean;
}

/**
 * Paso final: Confirmación de la inscripción
 *
 * Muestra un resumen de todas las selecciones antes de crear la suscripción.
 */
export function ConfirmarStep({
  seleccion,
  casaCalculada,
  isSimulando = false,
}: ConfirmarStepProps): React.ReactElement {
  const tierInfo = seleccion.tier ? TIERS_UI.find((t) => t.id === seleccion.tier) : null;
  const hijoNombre = obtenerNombreCompleto(seleccion.hijo, seleccion.nuevoHijo);
  const iniciales = obtenerIniciales(hijoNombre);

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Confirmar inscripción</h2>
      <p className="text-slate-400 mb-8">Revisá los detalles antes de continuar</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resumen de selecciones */}
        <div className="lg:col-span-2 space-y-4">
          {/* Estudiante */}
          <ResumenCard titulo="Estudiante">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                {iniciales}
              </div>
              <div>
                <p className="text-lg font-bold text-white">{hijoNombre}</p>
                {casaCalculada && (
                  <p className="text-sm text-cyan-400">Casa {CASAS[casaCalculada].nombre}</p>
                )}
              </div>
            </div>
          </ResumenCard>

          {/* Actividad */}
          {seleccion.producto && (
            <ResumenCard titulo="Actividad">
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
            </ResumenCard>
          )}

          {/* Plan de esta actividad */}
          {tierInfo && (
            <ResumenCard titulo="Plan de esta actividad">
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
            </ResumenCard>
          )}

          {/* Horario (solo si es sincrónico) */}
          {seleccion.claseGrupo && (
            <ResumenCard titulo="Horario de clases">
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
            </ResumenCard>
          )}
        </div>

        {/* Card de total */}
        <TotalCard
          tierNombre={tierInfo?.nombre}
          precio={tierInfo?.precio ?? TIERS_CONFIG.STEAM_LIBROS.precio}
          isSimulando={isSimulando}
        />
      </div>
    </div>
  );
}

interface ResumenCardProps {
  readonly titulo: string;
  readonly children: React.ReactNode;
}

/**
 * Card genérica para mostrar información en el resumen
 */
function ResumenCard({ titulo, children }: ResumenCardProps): React.ReactElement {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5">
      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">{titulo}</h3>
      {children}
    </div>
  );
}

interface TotalCardProps {
  readonly tierNombre?: string;
  readonly precio: number;
  readonly isSimulando: boolean;
}

/**
 * Card de total mensual con resumen de precio
 */
function TotalCard({ tierNombre, precio, isSimulando }: TotalCardProps): React.ReactElement {
  return (
    <div className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-cyan-900/20 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6">
      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Resumen</h3>

      {isSimulando ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{tierNombre ?? 'Plan'}</span>
              <span className="text-white">{formatMonto(precio)}</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-white">Total mensual</span>
              <span className="text-2xl font-bold text-emerald-400">{formatMonto(precio)}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Se cobrará mensualmente. Podés cancelar en cualquier momento desde tu panel.
          </p>
        </>
      )}
    </div>
  );
}
