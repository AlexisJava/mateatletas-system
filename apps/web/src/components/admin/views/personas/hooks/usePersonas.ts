import { useState, useEffect, useMemo, useCallback } from 'react';
import { MOCK_PEOPLE, type MockPerson } from '@/lib/constants/admin-mock-data';
import type { RoleFilter, StatusFilter, PersonasStats } from '../types/personas.types';

/**
 * usePersonas - Hook para lógica de personas
 */

export function usePersonas() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedPerson, setSelectedPerson] = useState<MockPerson | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (isMounted) {
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPeople = useMemo(() => {
    return MOCK_PEOPLE.filter((person) => {
      const matchesSearch =
        searchQuery === '' ||
        `${person.nombre} ${person.apellido}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'all' || person.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || person.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [searchQuery, roleFilter, statusFilter]);

  const stats: PersonasStats = useMemo(
    () => ({
      total: MOCK_PEOPLE.length,
      estudiantes: MOCK_PEOPLE.filter((p) => p.role === 'estudiante').length,
      docentes: MOCK_PEOPLE.filter((p) => p.role === 'docente').length,
      tutores: MOCK_PEOPLE.filter((p) => p.role === 'tutor').length,
      admins: MOCK_PEOPLE.filter((p) => p.role === 'admin').length,
    }),
    [],
  );

  const handleEdit = useCallback((_person: MockPerson) => {
    // TODO: Implementar edición
  }, []);

  const handleDelete = useCallback((_person: MockPerson) => {
    // TODO: Implementar eliminación
  }, []);

  return {
    isLoading,
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
    totalCount: MOCK_PEOPLE.length,
    handleEdit,
    handleDelete,
  };
}
