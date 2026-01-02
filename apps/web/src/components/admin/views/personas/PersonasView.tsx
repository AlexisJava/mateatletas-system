'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { usePersonas } from './hooks';
import {
  PersonasStatsGrid,
  PersonasFilters,
  PersonasTable,
  PersonDetailModal,
  PersonaFormModal,
} from './components';

/**
 * PersonasView - Vista de gestión unificada de personas
 *
 * Unifica estudiantes, docentes, tutores y admins desde el backend.
 * Tabla con filtros, búsqueda y acciones CRUD completas.
 */

export function PersonasView() {
  const {
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
    totalCount,
    handleCreate,
    handleEdit,
    handleDelete,
  } = usePersonas();

  const [showCreateModal, setShowCreateModal] = useState(false);

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
      {/* Error banner (datos mock en uso) */}
      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2 text-sm text-yellow-400">
          Usando datos de ejemplo (backend no disponible)
        </div>
      )}

      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--admin-text)]">Gestión de Personas</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--admin-accent)] text-black font-medium hover:opacity-90 transition-opacity"
        >
          <UserPlus className="w-4 h-4" />
          Agregar Persona
        </button>
      </div>

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

      {/* Create Modal */}
      <PersonaFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}

export default PersonasView;
