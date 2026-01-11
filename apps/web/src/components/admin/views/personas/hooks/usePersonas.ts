import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  getAllEstudiantes,
  getAllUsers,
  getDocentes,
  listarDocentesFiltrados,
  deleteUser,
  deleteEstudiante,
  deleteDocente,
  createEstudiante,
  createDocente,
  updateEstudiante,
  updateDocente,
  resetCredenciales,
  getDocenteClasesCount,
} from '@/lib/api/admin.api';
import type { AdminPerson, UserRole } from '@/types/admin-dashboard.types';
import type { RoleFilter, StatusFilter, PersonasStats } from '../types/personas.types';
import type { PersonaFormData } from '../components/PersonaFormModal';
import type { PersonaEditData } from '../components/PersonaEditModal';

/** Estado del modal de credenciales */
export interface CredencialesModalState {
  isOpen: boolean;
  nombre: string;
  apellido: string;
  username: string;
  pin: string | null; // null cuando solo se está viendo sin regenerar
  isNewStudent: boolean;
  estudianteId: string | null; // Para poder regenerar desde el modal
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

/**
 * usePersonas - Hook para gestión unificada de personas
 *
 * Combina llamadas al backend:
 * - GET /admin/estudiantes
 * - GET /admin/usuarios (admins y tutores)
 * - GET /docentes
 */
const initialCredencialesState: CredencialesModalState = {
  isOpen: false,
  nombre: '',
  apellido: '',
  username: '',
  pin: null,
  isNewStudent: false,
  estudianteId: null,
};

export function usePersonas(): UsePersonasReturn {
  const [people, setPeople] = useState<AdminPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedPerson, setSelectedPerson] = useState<AdminPerson | null>(null);
  const [editingPerson, setEditingPerson] = useState<AdminPerson | null>(null);
  const [credencialesModal, setCredencialesModal] =
    useState<CredencialesModalState>(initialCredencialesState);

  const closeCredencialesModal = useCallback(() => {
    setCredencialesModal(initialCredencialesState);
  }, []);

  const fetchPeople = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch en paralelo estudiantes, usuarios y docentes (con asignaciones)
      const [estudiantesRes, users, docentes, docentesConAsignaciones] = await Promise.all([
        getAllEstudiantes({ limit: 100 }),
        getAllUsers(),
        getDocentes(),
        listarDocentesFiltrados({}).catch(() => []), // Fallback si falla
      ]);

      const personas: AdminPerson[] = [];

      // Mapear estudiantes (con validación de estructura)
      // estudiantesRes puede ser { data: [...] } o directamente [...]
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

      // Mapear usuarios (admins y tutores) - con validación
      // IMPORTANTE: Excluir docentes aquí porque se traen desde getDocentes() separadamente
      const usersData = users ?? [];
      usersData.forEach((user) => {
        const roles = (user.roles ?? [user.role]).map((r) => r?.toLowerCase());
        const isDocente = roles.includes('docente');

        // Saltar docentes - se agregan desde getDocentes() para evitar duplicados
        if (isDocente) return;

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

      // Mapear docentes - con validación y enriquecimiento Casa/Mundo
      // Crear mapa de asignaciones por docente ID para lookup rápido
      const asignacionesMap = new Map<
        string,
        {
          casas: Array<'QUANTUM' | 'VERTEX' | 'PULSAR'>;
          mundos: Array<'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS'>;
          tipoAsignacion?: 'CLASE_GRUPOS' | 'COMISIONES' | 'AMBOS';
        }
      >();

      // Poblar mapa con datos de docentesConAsignaciones
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

      const docentesData = docentes ?? [];

      // Obtener conteo de clases para cada docente en paralelo
      const clasesCountMap = new Map<string, number>();
      if (docentesData.length > 0) {
        const clasesCountPromises = docentesData.map(async (doc) => {
          try {
            const count = await getDocenteClasesCount(doc.id);
            return { id: doc.id, total: count.total };
          } catch {
            // Si falla, retornar 0
            return { id: doc.id, total: 0 };
          }
        });
        const clasesCountResults = await Promise.all(clasesCountPromises);
        clasesCountResults.forEach((result) => {
          clasesCountMap.set(result.id, result.total);
        });
      }

      docentesData.forEach((doc) => {
        const asignaciones = asignacionesMap.get(doc.id);
        personas.push({
          id: doc.id,
          nombre: doc.nombre,
          apellido: doc.apellido,
          email: doc.email,
          role: 'docente' as UserRole,
          status: 'active',
          createdAt: doc.createdAt ?? new Date().toISOString(),
          clasesAsignadas: clasesCountMap.get(doc.id) ?? 0,
          titulo: doc.titulo ?? doc.titulo_profesional ?? undefined,
          telefono: doc.telefono ?? undefined,
          // Enriquecimiento Casa/Mundo
          casasAsignadas: asignaciones?.casas,
          mundosAsignados: asignaciones?.mundos,
          tipoAsignacion: asignaciones?.tipoAsignacion,
        });
      });

      setPeople(personas);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar personas';
      setError(message);
      console.error('usePersonas: Error al cargar:', message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

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
      if (data.role === 'estudiante') {
        // Crear estudiante
        // El backend retorna { success, message, estudiante, tutor_creado }
        const response = (await createEstudiante({
          nombre: data.nombre,
          apellido: data.apellido,
          edad: data.edad ?? 10,
          nivelEscolar: data.nivelEscolar ?? 'Primaria',
          tutorNombre: data.tutorNombre,
          tutorApellido: data.tutorApellido,
          tutorEmail: data.tutorEmail,
          tutorTelefono: data.tutorTelefono,
          // Plan de suscripción
          plan_id: data.planId ?? undefined,
          estado_acceso: data.estadoAcceso,
        })) as unknown as {
          success: boolean;
          estudiante: { id: string; username?: string };
          tutor_creado: boolean;
        };

        // Generar credenciales para el estudiante recién creado
        const estudianteId = response.estudiante?.id;
        const username = response.estudiante?.username;
        if (estudianteId) {
          try {
            const credResult = await resetCredenciales(estudianteId, 'estudiante');
            // Mostrar modal de credenciales
            setCredencialesModal({
              isOpen: true,
              nombre: data.nombre,
              apellido: data.apellido,
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
      } else if (data.role === 'docente') {
        const result = await createDocente({
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email ?? '',
          titulo: data.titulo,
          telefono: data.telefono,
        });

        // El backend genera una contraseña automática si no se proporciona
        const generatedPassword = (result as { generatedPassword?: string }).generatedPassword;
        if (generatedPassword) {
          const mensaje = [
            `✅ Docente creado: ${data.nombre} ${data.apellido}`,
            '',
            '📋 CREDENCIALES DEL DOCENTE:',
            `   Email: ${data.email}`,
            `   Contraseña: ${generatedPassword}`,
            '',
            '⚠️ Comparta estas credenciales con el docente de forma segura.',
          ];

          // Copiar al clipboard
          const textoCredenciales = mensaje.join('\n');
          navigator.clipboard.writeText(textoCredenciales).then(() => {
            toast.success('Credenciales copiadas al portapapeles', { duration: 5000 });
          });

          alert(textoCredenciales);
        } else {
          toast.success('Docente creado exitosamente');
        }
      }
      // Refetch para actualizar la lista
      await fetchPeople();
    },
    [fetchPeople],
  );

  const handleEdit = useCallback((person: AdminPerson) => {
    // Abrir modal de edición
    setEditingPerson(person);
  }, []);

  const handleUpdate = useCallback(
    async (personId: string, data: PersonaEditData) => {
      const person = people.find((p) => p.id === personId);
      if (!person) return;

      try {
        if (person.role === 'estudiante') {
          await updateEstudiante(personId, {
            nombre: data.nombre,
            apellido: data.apellido,
            edad: data.edad,
            nivelEscolar: data.nivelEscolar,
          });
        } else if (person.role === 'docente') {
          await updateDocente(personId, {
            nombre: data.nombre,
            apellido: data.apellido,
            email: data.email,
            titulo: data.titulo,
            telefono: data.telefono,
          });
        }

        // Actualizar lista local
        setPeople((prev) =>
          prev.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  nombre: data.nombre ?? p.nombre,
                  apellido: data.apellido ?? p.apellido,
                  email: data.email ?? p.email,
                }
              : p,
          ),
        );

        setEditingPerson(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al actualizar persona';
        console.error('Error al actualizar persona:', message);
        throw err; // Re-throw para que el modal pueda mostrar el error
      }
    },
    [people],
  );

  const handleDelete = useCallback(
    async (person: AdminPerson) => {
      // Confirmación antes de eliminar
      const confirmMessage = `¿Está seguro de eliminar a ${person.nombre} ${person.apellido}?`;
      if (!window.confirm(confirmMessage)) {
        return;
      }

      try {
        // Llamar al endpoint correcto según el rol
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

        // Actualizar lista local
        setPeople((prev) => prev.filter((p) => p.id !== person.id));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al eliminar persona';
        console.error('Error al eliminar persona:', message);
        alert(`Error al eliminar: ${message}`);
      }
    },
    [setPeople],
  );

  /**
   * Ver credenciales de un estudiante (solo username, sin regenerar PIN)
   */
  const handleCredenciales = useCallback((person: AdminPerson) => {
    if (person.role !== 'estudiante') {
      toast.error('Solo se pueden ver credenciales de estudiantes');
      return;
    }

    // Mostrar modal con username actual, sin PIN (no regeneramos)
    setCredencialesModal({
      isOpen: true,
      nombre: person.nombre,
      apellido: person.apellido,
      username: person.username ?? 'N/A',
      pin: null, // No mostramos PIN, solo username
      isNewStudent: false,
      estudianteId: person.id,
    });
  }, []);

  /**
   * Regenerar PIN de un estudiante (acción destructiva)
   */
  const handleRegenerarPin = useCallback(async (estudianteId: string) => {
    try {
      const credResult = await resetCredenciales(estudianteId, 'estudiante');
      // Actualizar el modal con el nuevo PIN
      setCredencialesModal((prev) => ({
        ...prev,
        pin: credResult.nuevaPassword,
        username: credResult.usuario?.username ?? prev.username,
      }));
      toast.success('PIN regenerado exitosamente');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al regenerar PIN';
      console.error('Error al regenerar PIN:', message);
      toast.error(`Error: ${message}`);
    }
  }, []);

  return {
    isLoading,
    error,
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
    refetch: fetchPeople,
  };
}
