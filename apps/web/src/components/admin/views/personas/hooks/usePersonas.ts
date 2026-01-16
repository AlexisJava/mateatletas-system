import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  getAllEstudiantes,
  getAllUsers,
  getDocentes,
  listarDocentesFiltrados,
  getDocentesClasesCountBatch,
  deleteUser,
  deleteEstudiante,
  deleteDocente,
  createEstudiante,
  createDocente,
  updateEstudiante,
  updateDocente,
  resetCredenciales,
} from '@/lib/api/admin.api';
import type { AdminPerson, UserRole } from '@/types/admin-dashboard.types';
import type { RoleFilter, StatusFilter, PersonasStats } from '../types/personas.types';
import type { PersonaFormData } from '../components/PersonaFormModal';
import type { PersonaEditData } from '../components/PersonaEditModal';

/** Query key para invalidación */
export const PERSONAS_KEY = ['admin', 'personas'] as const;

/** Estado del modal de credenciales */
export interface CredencialesModalState {
  isOpen: boolean;
  nombre: string;
  apellido: string;
  username: string;
  pin: string | null;
  isNewStudent: boolean;
  estudianteId: string | null;
}

interface UsePersonasReturn {
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  roleFilter: RoleFilter;
  setRoleFilter: (filter: RoleFilter) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (filter: StatusFilter) => void;
  selectedPerson: AdminPerson | null;
  setSelectedPerson: (person: AdminPerson | null) => void;
  editingPerson: AdminPerson | null;
  setEditingPerson: (person: AdminPerson | null) => void;
  filteredPeople: AdminPerson[];
  stats: PersonasStats;
  totalCount: number;
  handleCreate: (data: PersonaFormData) => Promise<void>;
  handleEdit: (person: AdminPerson) => void;
  handleUpdate: (personId: string, data: PersonaEditData) => Promise<void>;
  handleDelete: (person: AdminPerson) => Promise<void>;
  handleCredenciales: (person: AdminPerson) => void;
  handleRegenerarPin: (estudianteId: string) => Promise<void>;
  credencialesModal: CredencialesModalState;
  closeCredencialesModal: () => void;
  refetch: () => Promise<void>;
}

const initialCredencialesState: CredencialesModalState = {
  isOpen: false,
  nombre: '',
  apellido: '',
  username: '',
  pin: null,
  isNewStudent: false,
  estudianteId: null,
};

/**
 * Función para obtener todas las personas combinadas
 * Se ejecuta una sola vez y se cachea
 */
async function fetchAllPersonas(): Promise<AdminPerson[]> {
  // Fetch en paralelo - incluye batch de clases por docente
  const [estudiantesRes, users, docentes, docentesConAsignaciones, clasesCountBatch] =
    await Promise.all([
      getAllEstudiantes({ limit: 100 }),
      getAllUsers(),
      getDocentes(),
      listarDocentesFiltrados({}).catch(() => []),
      getDocentesClasesCountBatch().catch(
        () => ({}) as Record<string, { claseGrupos: number; comisiones: number; total: number }>,
      ),
    ]);

  const personas: AdminPerson[] = [];

  // Mapear estudiantes
  const estudiantesData = Array.isArray(estudiantesRes)
    ? estudiantesRes
    : (estudiantesRes?.data ?? []);

  estudiantesData.forEach((est) => {
    personas.push({
      id: est.id,
      nombre: est.nombre,
      apellido: est.apellido,
      email: est.tutor?.email ?? '',
      role: 'estudiante' as UserRole,
      status: 'active',
      createdAt: est.createdAt,
      casa: est.casa?.nombre ?? est.equipo?.nombre,
      puntos: est.xp_total ?? est.puntos_totales ?? 0,
      edad: est.edad,
      nivelEscolar: est.nivelEscolar ?? est.nivel_escolar,
      planNombre: est.plan?.nombre ?? undefined,
      estadoAcceso: est.estado_acceso ?? undefined,
      username: est.username ?? undefined,
    });
  });

  // Mapear usuarios (admins y tutores) - excluyendo docentes
  const usersData = users ?? [];
  usersData.forEach((user) => {
    const roles = (user.roles ?? [user.role]).map((r) => r?.toLowerCase());
    if (roles.includes('docente')) return;

    const role = roles.includes('admin') ? 'admin' : 'tutor';
    personas.push({
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      role: role as UserRole,
      status: user.activo ? 'active' : 'inactive',
      createdAt: user.createdAt,
    });
  });

  // Crear mapa de asignaciones Casa/Mundo
  const asignacionesMap = new Map<
    string,
    {
      casas: Array<'QUANTUM' | 'VERTEX' | 'PULSAR'>;
      mundos: Array<'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS'>;
      tipoAsignacion?: 'CLASE_GRUPOS' | 'COMISIONES' | 'AMBOS';
    }
  >();

  const asignacionesData = docentesConAsignaciones ?? [];
  asignacionesData.forEach((docAsig) => {
    asignacionesMap.set(docAsig.id, {
      casas: (docAsig.casas ?? []).map((c) => c.casa_tipo as 'QUANTUM' | 'VERTEX' | 'PULSAR'),
      mundos: (docAsig.mundos ?? []).map(
        (m) => m.mundo_tipo as 'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS',
      ),
      tipoAsignacion: docAsig.tipo_asignacion as
        | 'CLASE_GRUPOS'
        | 'COMISIONES'
        | 'AMBOS'
        | undefined,
    });
  });

  // Mapear docentes CON clases del batch (evita N+1)
  const docentesData = docentes ?? [];
  docentesData.forEach((doc) => {
    const asignaciones = asignacionesMap.get(doc.id);
    const clasesCount = clasesCountBatch[doc.id];
    personas.push({
      id: doc.id,
      nombre: doc.nombre,
      apellido: doc.apellido,
      email: doc.email,
      role: 'docente' as UserRole,
      status: 'active',
      createdAt: doc.createdAt ?? new Date().toISOString(),
      titulo: doc.titulo ?? doc.titulo_profesional ?? undefined,
      telefono: doc.telefono ?? undefined,
      casasAsignadas: asignaciones?.casas,
      mundosAsignados: asignaciones?.mundos,
      tipoAsignacion: asignaciones?.tipoAsignacion,
      clasesAsignadas: clasesCount?.total ?? 0,
    });
  });

  return personas;
}

/**
 * usePersonas - Hook para gestión unificada de personas
 *
 * Usa React Query para:
 * - Cachear datos por 5 minutos
 * - Navegación instantánea entre pestañas
 * - Invalidación automática al crear/editar/eliminar
 *
 * Combina llamadas al backend:
 * - GET /admin/estudiantes
 * - GET /admin/usuarios (admins y tutores)
 * - GET /docentes
 */
export function usePersonas(): UsePersonasReturn {
  const queryClient = useQueryClient();

  // Estado local para UI
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedPerson, setSelectedPerson] = useState<AdminPerson | null>(null);
  const [editingPerson, setEditingPerson] = useState<AdminPerson | null>(null);
  const [credencialesModal, setCredencialesModal] =
    useState<CredencialesModalState>(initialCredencialesState);

  // Query principal - cachea todas las personas
  const {
    data: people = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: PERSONAS_KEY,
    queryFn: fetchAllPersonas,
  });

  // Mutation para crear
  const createMutation = useMutation({
    mutationFn: async (data: PersonaFormData) => {
      if (data.role === 'estudiante') {
        const response = (await createEstudiante({
          nombre: data.nombre,
          apellido: data.apellido,
          edad: data.edad ?? 10,
          nivelEscolar: data.nivelEscolar ?? 'Primaria',
          tutorNombre: data.tutorNombre,
          tutorApellido: data.tutorApellido,
          tutorEmail: data.tutorEmail,
          tutorTelefono: data.tutorTelefono,
          plan_id: data.planId ?? undefined,
          estado_acceso: data.estadoAcceso,
        })) as unknown as {
          success: boolean;
          estudiante: { id: string; username?: string };
          tutor_creado: boolean;
        };
        return { type: 'estudiante' as const, response, data };
      } else if (data.role === 'docente') {
        const result = await createDocente({
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email ?? '',
          titulo: data.titulo,
          telefono: data.telefono,
        });
        return { type: 'docente' as const, result, data };
      }
      throw new Error('Rol no soportado');
    },
    onSuccess: async (result) => {
      // Invalidar cache para refetch
      await queryClient.invalidateQueries({ queryKey: PERSONAS_KEY });

      if (result.type === 'estudiante') {
        const estudianteId = result.response.estudiante?.id;
        const username = result.response.estudiante?.username;
        if (estudianteId) {
          try {
            const credResult = await resetCredenciales(estudianteId, 'estudiante');
            setCredencialesModal({
              isOpen: true,
              nombre: result.data.nombre,
              apellido: result.data.apellido,
              username: username ?? credResult.usuario?.username ?? 'N/A',
              pin: credResult.nuevaPassword,
              isNewStudent: true,
              estudianteId,
            });
          } catch {
            toast.success('Estudiante creado (sin PIN generado)');
          }
        } else {
          toast.success('Estudiante creado exitosamente');
        }
      } else if (result.type === 'docente') {
        const generatedPassword = (result.result as { generatedPassword?: string })
          .generatedPassword;
        if (generatedPassword) {
          const mensaje = [
            `✅ Docente creado: ${result.data.nombre} ${result.data.apellido}`,
            '',
            '📋 CREDENCIALES DEL DOCENTE:',
            `   Email: ${result.data.email}`,
            `   Contraseña: ${generatedPassword}`,
            '',
            '⚠️ Comparta estas credenciales con el docente de forma segura.',
          ];
          const textoCredenciales = mensaje.join('\n');
          navigator.clipboard.writeText(textoCredenciales).then(() => {
            toast.success('Credenciales copiadas al portapapeles', { duration: 5000 });
          });
          alert(textoCredenciales);
        } else {
          toast.success('Docente creado exitosamente');
        }
      }
    },
  });

  // Mutation para eliminar
  const deleteMutation = useMutation({
    mutationFn: async (person: AdminPerson) => {
      switch (person.role) {
        case 'estudiante':
          await deleteEstudiante(person.id);
          break;
        case 'docente':
          await deleteDocente(person.id);
          break;
        case 'tutor':
        case 'admin':
          await deleteUser(person.id);
          break;
      }
      return person;
    },
    onSuccess: (deletedPerson) => {
      // Actualizar cache optimistamente
      queryClient.setQueryData<AdminPerson[]>(
        PERSONAS_KEY,
        (old) => old?.filter((p) => p.id !== deletedPerson.id) ?? [],
      );
    },
  });

  // Mutation para actualizar
  const updateMutation = useMutation({
    mutationFn: async ({
      personId,
      data,
      role,
    }: {
      personId: string;
      data: PersonaEditData;
      role: UserRole;
    }) => {
      if (role === 'estudiante') {
        await updateEstudiante(personId, {
          nombre: data.nombre,
          apellido: data.apellido,
          edad: data.edad,
          nivelEscolar: data.nivelEscolar,
        });
      } else if (role === 'docente') {
        await updateDocente(personId, {
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          titulo: data.titulo,
          telefono: data.telefono,
        });
      }
      return { personId, data };
    },
    onSuccess: ({ personId, data }) => {
      // Actualizar cache optimistamente
      queryClient.setQueryData<AdminPerson[]>(
        PERSONAS_KEY,
        (old) =>
          old?.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  nombre: data.nombre ?? p.nombre,
                  apellido: data.apellido ?? p.apellido,
                  email: data.email ?? p.email,
                }
              : p,
          ) ?? [],
      );
      setEditingPerson(null);
    },
  });

  const closeCredencialesModal = useCallback(() => {
    setCredencialesModal(initialCredencialesState);
  }, []);

  const filteredPeople = useMemo(() => {
    return people.filter((person) => {
      const matchesSearch =
        searchQuery === '' ||
        `${person.nombre} ${person.apellido}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'all' || person.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || person.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [people, searchQuery, roleFilter, statusFilter]);

  const stats: PersonasStats = useMemo(
    () => ({
      total: people.length,
      estudiantes: people.filter((p) => p.role === 'estudiante').length,
      docentes: people.filter((p) => p.role === 'docente').length,
      tutores: people.filter((p) => p.role === 'tutor').length,
      admins: people.filter((p) => p.role === 'admin').length,
    }),
    [people],
  );

  const handleCreate = useCallback(
    async (data: PersonaFormData) => {
      await createMutation.mutateAsync(data);
    },
    [createMutation],
  );

  const handleEdit = useCallback((person: AdminPerson) => {
    setEditingPerson(person);
  }, []);

  const handleUpdate = useCallback(
    async (personId: string, data: PersonaEditData) => {
      const person = people.find((p) => p.id === personId);
      if (!person) return;
      await updateMutation.mutateAsync({ personId, data, role: person.role });
    },
    [people, updateMutation],
  );

  const handleDelete = useCallback(
    async (person: AdminPerson) => {
      const confirmMessage = `¿Está seguro de eliminar a ${person.nombre} ${person.apellido}?`;
      if (!window.confirm(confirmMessage)) return;
      try {
        await deleteMutation.mutateAsync(person);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al eliminar persona';
        alert(`Error al eliminar: ${message}`);
      }
    },
    [deleteMutation],
  );

  const handleCredenciales = useCallback((person: AdminPerson) => {
    if (person.role !== 'estudiante') {
      toast.error('Solo se pueden ver credenciales de estudiantes');
      return;
    }
    setCredencialesModal({
      isOpen: true,
      nombre: person.nombre,
      apellido: person.apellido,
      username: person.username ?? 'N/A',
      pin: null,
      isNewStudent: false,
      estudianteId: person.id,
    });
  }, []);

  const handleRegenerarPin = useCallback(async (estudianteId: string) => {
    try {
      const credResult = await resetCredenciales(estudianteId, 'estudiante');
      setCredencialesModal((prev) => ({
        ...prev,
        pin: credResult.nuevaPassword,
        username: credResult.usuario?.username ?? prev.username,
      }));
      toast.success('PIN regenerado exitosamente');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al regenerar PIN';
      toast.error(`Error: ${message}`);
    }
  }, []);

  return {
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Error al cargar personas') : null,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    selectedPerson,
    setSelectedPerson,
    editingPerson,
    setEditingPerson,
    filteredPeople,
    stats,
    totalCount: people.length,
    handleCreate,
    handleEdit,
    handleUpdate,
    handleDelete,
    handleCredenciales,
    handleRegenerarPin,
    credencialesModal,
    closeCredencialesModal,
    refetch: async () => {
      await refetch();
    },
  };
}
