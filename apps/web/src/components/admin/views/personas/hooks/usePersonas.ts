import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getAllEstudiantes,
  getAllUsers,
  getDocentes,
  deleteUser,
  deleteEstudiante,
  deleteDocente,
  createEstudiante,
  createDocente,
} from '@/lib/api/admin.api';
import type { AdminPerson, UserRole } from '@/types/admin-dashboard.types';
import type { RoleFilter, StatusFilter, PersonasStats } from '../types/personas.types';
import type { PersonaFormData } from '../components/PersonaFormModal';

// Mock data para fallback cuando el backend no está disponible
const MOCK_PERSONAS: AdminPerson[] = [
  {
    id: '1',
    nombre: 'María',
    apellido: 'González',
    email: 'maria.gonzalez@ejemplo.com',
    role: 'estudiante',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    casa: 'Quantum',
    tier: 'STEAM Sincrónico',
    puntos: 2450,
  },
  {
    id: '2',
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    email: 'carlos.rodriguez@ejemplo.com',
    role: 'docente',
    status: 'active',
    createdAt: '2023-09-01T08:00:00Z',
    clasesAsignadas: 12,
  },
  {
    id: '3',
    nombre: 'Laura',
    apellido: 'Martínez',
    email: 'laura.martinez@ejemplo.com',
    role: 'tutor',
    status: 'active',
    createdAt: '2024-02-20T14:00:00Z',
    estudiantesACargo: 3,
  },
  {
    id: '4',
    nombre: 'Admin',
    apellido: 'Sistema',
    email: 'admin@mateatletas.com',
    role: 'admin',
    status: 'active',
    createdAt: '2023-01-01T00:00:00Z',
  },
];

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
  filteredPeople: AdminPerson[];
  stats: PersonasStats;
  totalCount: number;
  handleCreate: (data: PersonaFormData) => Promise<void>;
  handleEdit: (person: AdminPerson) => void;
  handleDelete: (person: AdminPerson) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * usePersonas - Hook para gestión unificada de personas
 *
 * Combina llamadas al backend:
 * - GET /admin/estudiantes
 * - GET /admin/usuarios (admins y tutores)
 * - GET /docentes
 *
 * Fallback a mock data si hay error (desarrollo sin backend)
 */
export function usePersonas(): UsePersonasReturn {
  const [people, setPeople] = useState<AdminPerson[]>(MOCK_PERSONAS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedPerson, setSelectedPerson] = useState<AdminPerson | null>(null);

  const fetchPeople = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch en paralelo estudiantes, usuarios y docentes
      const [estudiantesRes, users, docentes] = await Promise.all([
        getAllEstudiantes({ limit: 100 }),
        getAllUsers(),
        getDocentes(),
      ]);

      const personas: AdminPerson[] = [];

      // Mapear estudiantes
      estudiantesRes.data.forEach((est) => {
        personas.push({
          id: est.id,
          nombre: est.nombre,
          apellido: est.apellido,
          email: est.tutor?.email ?? '',
          role: 'estudiante' as UserRole,
          status: 'active',
          createdAt: est.createdAt,
          casa: est.equipo?.nombre,
          puntos: est.puntos_totales,
        });
      });

      // Mapear usuarios (admins y tutores)
      users.forEach((user) => {
        const roles = user.roles ?? [user.role];
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

      // Mapear docentes
      docentes.forEach((doc) => {
        personas.push({
          id: doc.id,
          nombre: doc.nombre,
          apellido: doc.apellido,
          email: doc.email,
          role: 'docente' as UserRole,
          status: 'active',
          createdAt: doc.createdAt ?? new Date().toISOString(),
          clasesAsignadas: 0, // TODO: Obtener desde endpoint específico
        });
      });

      setPeople(personas);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar personas';
      setError(message);
      console.warn('usePersonas: Usando datos mock por error:', message);
      // Mantener mock data como fallback
      setPeople(MOCK_PERSONAS);
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
        await createEstudiante({
          nombre: data.nombre,
          apellido: data.apellido,
          edad: data.edad ?? 10,
          nivelEscolar: data.nivelEscolar ?? 'Primaria',
          tutorNombre: data.tutorNombre,
          tutorApellido: data.tutorApellido,
          tutorEmail: data.tutorEmail,
          tutorTelefono: data.tutorTelefono,
        });
      } else if (data.role === 'docente') {
        await createDocente({
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email ?? '',
          titulo: data.titulo,
          telefono: data.telefono,
        });
      }
      // Refetch para actualizar la lista
      await fetchPeople();
    },
    [fetchPeople],
  );

  const handleEdit = useCallback((person: AdminPerson) => {
    // Abrir modal de edición mostrando el detalle de la persona
    setSelectedPerson(person);
  }, []);

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
    filteredPeople,
    stats,
    totalCount: people.length,
    handleCreate,
    handleEdit,
    handleDelete,
    refetch: fetchPeople,
  };
}
