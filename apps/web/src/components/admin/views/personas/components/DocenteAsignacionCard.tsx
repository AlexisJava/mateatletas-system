'use client';

import { Plus, X, ChevronRight } from 'lucide-react';
import type {
  DocenteAsignacionesPerfil,
  CasaTipo,
  MundoTipo,
} from '../hooks/useDocenteAsignaciones';
import { CASA_CONFIG, MUNDO_CONFIG, TIPO_ASIGNACION_CONFIG } from '../hooks/useDocenteAsignaciones';

interface DocenteAsignacionCardProps {
  docente: DocenteAsignacionesPerfil;
  onAsignarCasa: (casaTipo: CasaTipo) => void;
  onRemoverCasa: (casaTipo: CasaTipo) => void;
  onAsignarMundo: (mundoTipo: MundoTipo) => void;
  onRemoverMundo: (mundoTipo: MundoTipo) => void;
  onSelect: () => void;
}

const ALL_CASAS: CasaTipo[] = ['QUANTUM', 'VERTEX', 'PULSAR'];
const ALL_MUNDOS: MundoTipo[] = ['MATEMATICA', 'PROGRAMACION', 'CIENCIAS'];

/**
 * Card de docente con gestión de asignaciones Casa/Mundo
 * - Muestra casas y mundos asignados con badges
 * - Botones para agregar/remover asignaciones
 * - Click en el card para ver detalles
 */
export function DocenteAsignacionCard({
  docente,
  onAsignarCasa,
  onRemoverCasa,
  onAsignarMundo,
  onRemoverMundo,
  onSelect,
}: DocenteAsignacionCardProps) {
  const casasAsignadas = docente.casas.map((c) => c.casa_tipo);
  const mundosAsignados = docente.mundos.map((m) => m.mundo_tipo);
  const casasDisponibles = ALL_CASAS.filter((c) => !casasAsignadas.includes(c));
  const mundosDisponibles = ALL_MUNDOS.filter((m) => !mundosAsignados.includes(m));

  const tipoConfig = TIPO_ASIGNACION_CONFIG[docente.tipo_asignacion];

  return (
    <div className="bg-[var(--admin-surface-1)] rounded-xl border border-[var(--admin-border)] hover:border-[var(--admin-accent)]/30 transition-all">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-[var(--admin-border)]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {docente.nombre[0]}
              {docente.apellido[0]}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-[var(--admin-text)] text-sm sm:text-base truncate">
                {docente.nombre} {docente.apellido}
              </h3>
              <p className="text-xs text-[var(--admin-text-muted)]">{tipoConfig.label}</p>
            </div>
          </div>
          <button
            onClick={onSelect}
            className="p-2 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)] rounded-lg transition-colors shrink-0"
            title="Ver detalles"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Casas */}
      <div className="p-3 sm:p-4 border-b border-[var(--admin-border)]">
        <p className="text-xs text-[var(--admin-text-muted)] uppercase tracking-wider mb-2">
          Casas
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {/* Casas asignadas */}
          {docente.casas.map((casa) => {
            const config = CASA_CONFIG[casa.casa_tipo];
            return (
              <span
                key={casa.id}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md ${config.bgColor} ${config.color}`}
              >
                {config.label.split(' ')[0]}
                <button
                  onClick={() => onRemoverCasa(casa.casa_tipo)}
                  className="p-0.5 hover:bg-black/20 rounded"
                  title="Remover casa"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          {/* Botón agregar casa */}
          {casasDisponibles.length > 0 && (
            <div className="relative group">
              <button className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-[var(--admin-surface-2)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors">
                <Plus className="w-3 h-3" />
                <span className="hidden xs:inline">Casa</span>
              </button>
              {/* Dropdown */}
              <div className="absolute left-0 top-full mt-1 z-10 hidden group-hover:block bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg shadow-xl py-1 min-w-[120px]">
                {casasDisponibles.map((casa) => {
                  const config = CASA_CONFIG[casa];
                  return (
                    <button
                      key={casa}
                      onClick={() => onAsignarCasa(casa)}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--admin-surface-1)] ${config.color}`}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {docente.casas.length === 0 && casasDisponibles.length === 0 && (
            <span className="text-xs text-[var(--admin-text-muted)] italic">Sin casas</span>
          )}
        </div>
      </div>

      {/* Mundos */}
      <div className="p-3 sm:p-4">
        <p className="text-xs text-[var(--admin-text-muted)] uppercase tracking-wider mb-2">
          Mundos
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {/* Mundos asignados */}
          {docente.mundos.map((mundo) => {
            const config = MUNDO_CONFIG[mundo.mundo_tipo];
            return (
              <span
                key={mundo.id}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md ${config.bgColor} ${config.color}`}
              >
                {config.label}
                <button
                  onClick={() => onRemoverMundo(mundo.mundo_tipo)}
                  className="p-0.5 hover:bg-black/20 rounded"
                  title="Remover mundo"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          {/* Botón agregar mundo */}
          {mundosDisponibles.length > 0 && (
            <div className="relative group">
              <button className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-[var(--admin-surface-2)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors">
                <Plus className="w-3 h-3" />
                <span className="hidden xs:inline">Mundo</span>
              </button>
              {/* Dropdown */}
              <div className="absolute left-0 top-full mt-1 z-10 hidden group-hover:block bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg shadow-xl py-1 min-w-[120px]">
                {mundosDisponibles.map((mundo) => {
                  const config = MUNDO_CONFIG[mundo];
                  return (
                    <button
                      key={mundo}
                      onClick={() => onAsignarMundo(mundo)}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--admin-surface-1)] ${config.color}`}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {docente.mundos.length === 0 && mundosDisponibles.length === 0 && (
            <span className="text-xs text-[var(--admin-text-muted)] italic">Sin mundos</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocenteAsignacionCard;
