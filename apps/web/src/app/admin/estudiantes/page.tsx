'use client';

import { useEffect, useState } from 'react';
import { getErrorMessage } from '@/lib/utils/error-handler';
import apiClient from '@/lib/axios';
import AgregarEstudianteModal from '@/components/admin/AgregarEstudianteModal';
import { EmptyState } from '@/components/admin/EmptyState';
import {
  UserPlus,
  GraduationCap,
  Code,
  Calculator,
  FlaskConical,
  ClipboardList,
} from 'lucide-react';

interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  nivelEscolar: string;
  nivel_actual: number;
  puntos_totales: number;
  avatar_url?: string;
  tutor: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
  equipo?: {
    nombre: string;
    color_primario: string;
  };
  sector?: {
    id: string;
    nombre: string;
    color: string;
    icono: string;
  };
  inscripciones_grupos?: Array<{
    id: string;
    fecha_inscripcion: string;
    clase_grupo: {
      id: string;
      codigo: string;
      nombre: string;
      dia_semana: string;
      hora_inicio: string;
      hora_fin: string;
      activo: boolean;
    };
    grupo: {
      id: string;
      codigo: string;
      nombre: string;
      descripcion: string;
    };
  }>;
}

interface Sector {
  id: string;
  nombre: string;
  color: string;
  icono: string;
}

type SectorTab = 'Programación' | 'Matemática' | 'Ciencias' | 'Preinscriptos';

export default function AdminEstudiantesPage() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectorActivo, setSectorActivo] = useState<SectorTab>('Matemática');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sectorIdParaModal, setSectorIdParaModal] = useState<string>('');

  useEffect(() => {
    loadEstudiantes();
    loadSectores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEstudiantes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<{ data?: Estudiante[] } | Estudiante[]>(
        '/admin/estudiantes',
      );
      const estudiantes = (response as { data?: Estudiante[] })?.data
        ? (response as { data: Estudiante[] }).data
        : Array.isArray(response)
          ? response
          : [];
      setEstudiantes(estudiantes as Estudiante[]);
    } catch (err) {
      console.error('Error al cargar estudiantes:', err);
      setError(getErrorMessage(err as Error, 'Error al cargar estudiantes'));
    } finally {
      setIsLoading(false);
    }
  };

  const isSectoresPayload = (value: Sector[] | { data?: Sector[] }): value is { data?: Sector[] } =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

  const loadSectores = async () => {
    try {
      const response = await apiClient.get<Sector[] | { data?: Sector[] }>('/admin/sectores');

      let sectoresData: Sector[] = [];
      if (Array.isArray(response)) {
        sectoresData = response;
      } else if (isSectoresPayload(response) && Array.isArray(response.data)) {
        sectoresData = response.data;
      }

      setSectores(sectoresData);
    } catch (err) {
      console.error('Error al cargar sectores:', err);
    }
  };

  const handleAbrirModal = (nombreSector: string) => {
    const nombreSectorReal = nombreSector === 'Ciencias' ? 'Divulgación Científica' : nombreSector;
    const sector = sectores.find((s) => s.nombre === nombreSectorReal);
    if (sector) {
      setSectorIdParaModal(sector.id);
      setIsModalOpen(true);
    } else {
      setError(`No se pudo abrir el modal: sector "${nombreSectorReal}" no encontrado`);
    }
  };

  // Separar estudiantes por sector
  const estudiantesProgramacion = estudiantes.filter(
    (est) => est.sector?.nombre === 'Programación',
  );
  const estudiantesMatematica = estudiantes.filter((est) => est.sector?.nombre === 'Matemática');
  const estudiantesCiencias = estudiantes.filter(
    (est) => est.sector?.nombre === 'Divulgación Científica' || est.sector?.nombre === 'Ciencias',
  );
  const estudiantesSinSector = estudiantes.filter((est) => !est.sector);

  const estudiantesActivos =
    sectorActivo === 'Programación'
      ? estudiantesProgramacion
      : sectorActivo === 'Matemática'
        ? estudiantesMatematica
        : sectorActivo === 'Ciencias'
          ? estudiantesCiencias
          : estudiantesSinSector;

  const sectorConfig: Record<SectorTab, { icon: typeof Calculator; count: number }> = {
    Matemática: { icon: Calculator, count: estudiantesMatematica.length },
    Programación: { icon: Code, count: estudiantesProgramacion.length },
    Ciencias: { icon: FlaskConical, count: estudiantesCiencias.length },
    Preinscriptos: { icon: ClipboardList, count: estudiantesSinSector.length },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--admin-text-muted)]">Cargando estudiantes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-[var(--status-danger-muted)] border border-[var(--status-danger)]/30 text-[var(--status-danger)]">
        <h3 className="font-semibold mb-1">Error</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--admin-text)]">Estudiantes</h1>
          <p className="text-sm text-[var(--admin-text-muted)] mt-1">
            Gestión completa de estudiantes ({estudiantes.length} total)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="admin-badge-info">{estudiantesActivos.length} mostrando</span>
          {sectorActivo !== 'Preinscriptos' && (
            <button
              onClick={() => handleAbrirModal(sectorActivo)}
              className="admin-btn admin-btn-primary flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Añadir Estudiante
            </button>
          )}
        </div>
      </div>

      {/* Sector Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(sectorConfig) as SectorTab[]).map((sector) => {
          const config = sectorConfig[sector];
          const Icon = config.icon;
          const isActive = sectorActivo === sector;

          return (
            <button
              key={sector}
              onClick={() => setSectorActivo(sector)}
              className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm transition-all rounded-lg ${
                isActive
                  ? 'bg-[var(--admin-accent)] text-black'
                  : 'bg-[var(--admin-surface-1)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-2)] hover:text-[var(--admin-text)] border border-[var(--admin-border)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {sector}
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  isActive
                    ? 'bg-black/20 text-black'
                    : 'bg-[var(--admin-surface-3)] text-[var(--admin-text-muted)]'
                }`}
              >
                {config.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      {estudiantesActivos.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={`No hay estudiantes en ${sectorActivo}`}
          description={
            sectorActivo === 'Preinscriptos'
              ? 'Los estudiantes preinscriptos aparecerán aquí'
              : 'Añadí el primer estudiante a este sector'
          }
          action={
            sectorActivo !== 'Preinscriptos'
              ? { label: 'Añadir Estudiante', onClick: () => handleAbrirModal(sectorActivo) }
              : undefined
          }
        />
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Avatar</th>
                  <th>Edad</th>
                  <th>Grupos</th>
                  <th>Horario</th>
                  <th>Puntos</th>
                  <th>Tutor</th>
                </tr>
              </thead>
              <tbody>
                {estudiantesActivos.map((estudiante) => {
                  const initials =
                    `${estudiante.nombre.charAt(0)}${estudiante.apellido.charAt(0)}`.toUpperCase();
                  return (
                    <tr key={estudiante.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[var(--admin-accent-muted)] flex items-center justify-center text-[var(--admin-accent)] font-semibold">
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium text-[var(--admin-text)]">
                              {estudiante.nombre} {estudiante.apellido}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {estudiante.avatar_url ? (
                          <div className="relative group">
                            <div className="w-10 h-10 rounded-lg bg-[var(--status-pending-muted)] flex items-center justify-center overflow-hidden">
                              <iframe
                                src={`https://models.readyplayer.me/${estudiante.avatar_url.split('/').pop()}?scene=halfbody-portrait-v1&meshLod=1`}
                                className="w-full h-full border-none scale-125"
                                title={`Avatar de ${estudiante.nombre}`}
                                sandbox="allow-scripts allow-same-origin"
                                loading="lazy"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[var(--admin-surface-2)] flex items-center justify-center">
                            <span className="text-[var(--admin-text-disabled)] text-xs">-</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="text-[var(--admin-text-secondary)]">
                          {estudiante.edad} años
                        </span>
                      </td>
                      <td>
                        {estudiante.inscripciones_grupos &&
                        estudiante.inscripciones_grupos.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {estudiante.inscripciones_grupos.map((insc) => (
                              <span key={insc.id} className="admin-badge-info text-xs">
                                {insc.grupo.codigo}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[var(--admin-text-disabled)] text-xs">
                            Sin grupo
                          </span>
                        )}
                      </td>
                      <td>
                        {estudiante.inscripciones_grupos &&
                        estudiante.inscripciones_grupos.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {estudiante.inscripciones_grupos.map((insc) => (
                              <span
                                key={insc.id}
                                className="text-xs text-[var(--admin-text-muted)]"
                              >
                                {insc.clase_grupo.dia_semana} {insc.clase_grupo.hora_inicio}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[var(--admin-text-disabled)]">-</span>
                        )}
                      </td>
                      <td>
                        <span className="font-semibold text-[var(--status-warning)]">
                          {estudiante.puntos_totales} pts
                        </span>
                      </td>
                      <td>
                        <span className="text-[var(--admin-text-secondary)]">
                          {estudiante.tutor.nombre} {estudiante.tutor.apellido}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Agregar Estudiante */}
      <AgregarEstudianteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          loadEstudiantes();
          setIsModalOpen(false);
        }}
        sectorId={sectorIdParaModal}
        sectorNombre={sectorActivo}
      />
    </div>
  );
}
