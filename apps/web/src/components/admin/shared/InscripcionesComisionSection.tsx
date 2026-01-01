'use client';

import { useState, useCallback } from 'react';
import { Users, UserPlus, Search, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  removerEstudianteComision,
  crearEstudianteEInscribir,
  inscribirEstudiantesComision,
  type InscripcionComision,
  type Comision,
  type CrearEstudianteConCredencialesDto,
  type CrearEstudianteEInscribirResponse,
} from '@/lib/api/admin.api';
import { EstudianteFormModal } from './EstudianteFormModal';
import { CredencialesModal } from './CredencialesModal';
import { BuscarEstudianteModal } from './BuscarEstudianteModal';

interface InscripcionesComisionSectionProps {
  comision: Comision & { inscripciones?: InscripcionComision[] };
  onRefresh: () => void;
}

const ESTADO_COLORS: Record<string, { bg: string; text: string }> = {
  Pendiente: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
  Confirmada: { bg: 'bg-green-500/10', text: 'text-green-500' },
  Cancelada: { bg: 'bg-red-500/10', text: 'text-red-500' },
  ListaEspera: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
};

/**
 * InscripcionesComisionSection - Sección para gestionar inscripciones de una comisión
 */
export function InscripcionesComisionSection({
  comision,
  onRefresh,
}: InscripcionesComisionSectionProps) {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBuscarModalOpen, setIsBuscarModalOpen] = useState(false);
  const [isCredencialesModalOpen, setIsCredencialesModalOpen] = useState(false);
  const [credencialesGeneradas, setCredencialesGeneradas] =
    useState<CrearEstudianteEInscribirResponse | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const inscripciones = comision.inscripciones || [];
  const totalInscriptos = inscripciones.length;
  const cupoMaximo = comision.cupo_maximo || null;
  const cuposDisponibles = cupoMaximo ? cupoMaximo - totalInscriptos : null;
  const hayCupo = cuposDisponibles === null || cuposDisponibles > 0;

  const handleCrearEstudiante = useCallback(
    async (dto: CrearEstudianteConCredencialesDto) => {
      setIsCreating(true);
      try {
        const response = await crearEstudianteEInscribir(comision.id, dto);
        setCredencialesGeneradas(response);
        setIsFormModalOpen(false);
        setIsCredencialesModalOpen(true);
        onRefresh();
        toast.success('Estudiante creado e inscripto exitosamente');
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al crear estudiante');
      } finally {
        setIsCreating(false);
      }
    },
    [comision.id, onRefresh],
  );

  const handleInscribirExistente = useCallback(
    async (estudianteId: string) => {
      try {
        await inscribirEstudiantesComision(comision.id, { estudiantes_ids: [estudianteId] });
        setIsBuscarModalOpen(false);
        onRefresh();
        toast.success('Estudiante inscripto exitosamente');
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al inscribir estudiante');
      }
    },
    [comision.id, onRefresh],
  );

  const handleRemover = useCallback(
    async (estudianteId: string, nombre: string) => {
      if (!confirm(`¿Remover a ${nombre} de esta comisión?`)) return;

      setIsRemoving(estudianteId);
      try {
        await removerEstudianteComision(comision.id, estudianteId);
        onRefresh();
        toast.success('Estudiante removido');
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al remover estudiante');
      } finally {
        setIsRemoving(null);
      }
    },
    [comision.id, onRefresh],
  );

  return (
    <div className="p-4 rounded-xl bg-[var(--admin-surface-2)] border border-[var(--admin-border)]">
      {/* Header con contador de cupos */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[var(--admin-accent)]" />
          <h3 className="font-medium text-[var(--admin-text)]">Estudiantes Inscriptos</h3>
          <span className="text-sm text-[var(--admin-text-muted)]">({totalInscriptos})</span>
        </div>

        {/* Contador de cupos */}
        {cupoMaximo && (
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              cuposDisponibles === 0
                ? 'bg-red-500/10 text-red-500'
                : cuposDisponibles && cuposDisponibles <= 5
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'bg-green-500/10 text-green-500'
            }`}
          >
            {cuposDisponibles === 0 ? 'Sin cupos' : `${cuposDisponibles} cupos disponibles`}
          </div>
        )}
      </div>

      {/* Botones de agregar */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setIsFormModalOpen(true)}
          disabled={!hayCupo}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--admin-accent)] text-white hover:bg-[var(--admin-accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <UserPlus className="w-4 h-4" />
          Crear nuevo
        </button>
        <button
          onClick={() => setIsBuscarModalOpen(true)}
          disabled={!hayCupo}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--admin-border)] text-[var(--admin-text)] hover:bg-[var(--admin-surface-1)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <Search className="w-4 h-4" />
          Buscar existente
        </button>
      </div>

      {/* Lista de inscriptos */}
      {inscripciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="w-8 h-8 text-[var(--admin-text-muted)] mb-2" />
          <p className="text-[var(--admin-text-muted)]">No hay estudiantes inscriptos</p>
          <p className="text-sm text-[var(--admin-text-muted)]">
            Agrega estudiantes usando los botones de arriba
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {inscripciones.map((inscripcion) => {
            const estudiante = inscripcion.estudiante;
            if (!estudiante) return null;

            const estadoStyle = ESTADO_COLORS[inscripcion.estado] ?? {
              bg: 'bg-gray-500/10',
              text: 'text-gray-500',
            };

            return (
              <div
                key={inscripcion.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[var(--admin-surface-1)] border border-[var(--admin-border)]"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar con inicial */}
                  <div className="w-10 h-10 rounded-full bg-[var(--admin-accent-muted)] flex items-center justify-center">
                    <span className="text-sm font-medium text-[var(--admin-accent)]">
                      {estudiante.nombre.charAt(0)}
                      {estudiante.apellido.charAt(0)}
                    </span>
                  </div>

                  <div>
                    <p className="font-medium text-[var(--admin-text)]">
                      {estudiante.nombre} {estudiante.apellido}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]">
                      <span>{estudiante.edad} años</span>
                      {estudiante.casa && (
                        <>
                          <span>•</span>
                          <span>
                            {estudiante.casa.emoji} {estudiante.casa.nombre}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Badge de estado */}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${estadoStyle.bg} ${estadoStyle.text}`}
                  >
                    {inscripcion.estado}
                  </span>

                  {/* Botón remover */}
                  <button
                    onClick={() =>
                      handleRemover(estudiante.id, `${estudiante.nombre} ${estudiante.apellido}`)
                    }
                    disabled={isRemoving === estudiante.id}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    title="Remover de la comisión"
                  >
                    {isRemoving === estudiante.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modales */}
      <EstudianteFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmitDto={handleCrearEstudiante}
      />

      <BuscarEstudianteModal
        isOpen={isBuscarModalOpen}
        onClose={() => setIsBuscarModalOpen(false)}
        onSelect={handleInscribirExistente}
        excludeIds={inscripciones.map((i) => i.estudiante?.id).filter(Boolean) as string[]}
      />

      <CredencialesModal
        isOpen={isCredencialesModalOpen}
        onClose={() => {
          setIsCredencialesModalOpen(false);
          setCredencialesGeneradas(null);
        }}
        credenciales={credencialesGeneradas}
      />
    </div>
  );
}

export default InscripcionesComisionSection;
