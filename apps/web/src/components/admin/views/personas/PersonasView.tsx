'use client';

import { usePersonas } from './hooks';
import { PersonasStatsGrid, PersonasFilters, PersonasTable, PersonDetailModal } from './components';

/**
 * PersonasView - Vista de gestión de personas
 *
 * Unifica estudiantes, docentes, tutores y admins.
 * Tabla con filtros, búsqueda y acciones.
 */

export function PersonasView() {
  const {
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
    totalCount,
    handleEdit,
    handleDelete,
  } = usePersonas();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--admin-text-muted)]">Cargando personas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <PersonasStatsGrid stats={stats} roleFilter={roleFilter} onRoleFilterChange={setRoleFilter} />

      {/* Filters & Search */}
      <PersonasFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Table */}
      <PersonasTable
        people={filteredPeople}
        onView={setSelectedPerson}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Results count */}
      <div className="text-sm text-[var(--admin-text-muted)]">
        Mostrando {filteredPeople.length} de {totalCount} personas
      </div>

      {/* Detail Modal */}
      <PersonDetailModal person={selectedPerson} onClose={() => setSelectedPerson(null)} />
    </div>
  );
}

export default PersonasView;
