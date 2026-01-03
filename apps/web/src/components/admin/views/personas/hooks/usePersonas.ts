import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  getAllEstudiantes,
  getAllUsers,
  getDocentes,
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
export function usePersonas(): UsePersonasReturn {
  const [people, setPeople] = useState<AdminPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedPerson, setSelectedPerson] = useState<AdminPerson | null>(null);
  const [editingPerson, setEditingPerson] = useState<AdminPerson | null>(null);

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

      // Mapear docentes - con validación
      const docentesData = docentes ?? [];
      docentesData.forEach((doc) => {
        personas.push({
          id: doc.id,
          nombre: doc.nombre,
          apellido: doc.apellido,
          email: doc.email,
          role: 'docente' as UserRole,
          status: 'active',
          createdAt: doc.createdAt ?? new Date().toISOString(),
          clasesAsignadas: 0, // TODO: Obtener desde endpoint específico
          titulo: doc.titulo ?? doc.titulo_profesional ?? undefined,
          telefono: doc.telefono ?? undefined,
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
        const result = await createEstudiante({
          nombre: data.nombre,
          apellido: data.apellido,
          edad: data.edad ?? 10,
          nivelEscolar: data.nivelEscolar ?? 'Primaria',
          tutorNombre: data.tutorNombre,
          tutorApellido: data.tutorApellido,
          tutorEmail: data.tutorEmail,
          tutorTelefono: data.tutorTelefono,
        });

        // Generar credenciales para el estudiante recién creado
        const estudianteId = result.id;
        if (estudianteId) {
          try {
            const credResult = await resetCredenciales(estudianteId, 'estudiante');
            const mensaje = [
              `✅ Estudiante creado: ${data.nombre} ${data.apellido}`,
              '',
              '📋 CREDENCIALES DEL ESTUDIANTE:',
              `   PIN: ${credResult.nuevaPassword}`,
            ];

            // Copiar al clipboard
            const textoCredenciales = mensaje.join('\n');
            navigator.clipboard.writeText(textoCredenciales).then(() => {
              toast.success('Credenciales copiadas al portapapeles', { duration: 5000 });
            });

            alert(textoCredenciales);
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
    refetch: fetchPeople,
  };
}
