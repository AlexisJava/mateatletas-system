'use client';

import { useState } from 'react';
import { UserPlus, Users, GraduationCap } from 'lucide-react';
import { usePersonas, useDocenteAsignaciones } from './hooks';
import type { DocenteAsignacionesPerfil } from './hooks/useDocenteAsignaciones';
import { CASA_CONFIG, MUNDO_CONFIG } from './hooks/useDocenteAsignaciones';
import {
  PersonasStatsGrid,
  PersonasFilters,
  PersonasTable,
  PersonDetailModal,
  PersonaFormModal,
  PersonaEditModal,
  CredencialesModal,
  DocenteAsignacionCard,
} from './components';

type TabId = 'personas' | 'asignaciones';

// ═══════════════════════════════════════════════════════════════════════════════
// Componente interno: AsignacionesTab
// ═══════════════════════════════════════════════════════════════════════════════

interface AsignacionesTabProps {
  docenteAsignaciones: ReturnType<typeof useDocenteAsignaciones>;
  onSelectDocente: (docente: DocenteAsignacionesPerfil) => void;
}

function AsignacionesTab({ docenteAsignaciones, onSelectDocente }: AsignacionesTabProps) {
  const {
    docentes,
    isLoading,
    error,
    filtros,
    setFiltros,
    stats,
    handleAsignarCasa,
    handleRemoverCasa,
    handleAsignarMundo,
    handleRemoverMundo,
  } = docenteAsignaciones;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--admin-text-muted)]">Cargando docentes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <p className="text-[var(--status-danger)]">Error al cargar docentes</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[var(--admin-surface-1)] rounded-xl p-4 border border-[var(--admin-border)]">
          <p className="text-2xl font-bold text-[var(--admin-text)]">{stats.totalDocentes}</p>
          <p className="text-xs text-[var(--admin-text-muted)]">Total Docentes</p>
        </div>
        <div className="bg-[var(--admin-surface-1)] rounded-xl p-4 border border-[var(--admin-border)]">
          <p className="text-2xl font-bold text-cyan-400">{stats.conCasaAsignada}</p>
          <p className="text-xs text-[var(--admin-text-muted)]">Con Casa</p>
        </div>
        <div className="bg-[var(--admin-surface-1)] rounded-xl p-4 border border-[var(--admin-border)]">
          <p className="text-2xl font-bold text-blue-400">{stats.conMundoAsignado}</p>
          <p className="text-xs text-[var(--admin-text-muted)]">Con Mundo</p>
        </div>
        <div className="bg-[var(--admin-surface-1)] rounded-xl p-4 border border-[var(--admin-border)]">
          <p className="text-2xl font-bold text-purple-400">{stats.porTipoAsignacion.AMBOS}</p>
          <p className="text-xs text-[var(--admin-text-muted)]">Ambos Tipos</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Búsqueda */}
        <input
          type="text"
          placeholder="Buscar docente..."
          value={filtros.busqueda || ''}
          onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
          className="flex-1 min-w-[200px] px-4 py-2 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--admin-accent)]"
        />

        {/* Filtro por Casa */}
        <select
          value={filtros.casa_tipo || ''}
          onChange={(e) =>
            setFiltros({
              ...filtros,
              casa_tipo: (e.target.value || undefined) as typeof filtros.casa_tipo,
            })
          }
          className="px-3 py-2 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)]"
        >
          <option value="">Todas las Casas</option>
          {Object.entries(CASA_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>

        {/* Filtro por Mundo */}
        <select
          value={filtros.mundo_tipo || ''}
          onChange={(e) =>
            setFiltros({
              ...filtros,
              mundo_tipo: (e.target.value || undefined) as typeof filtros.mundo_tipo,
            })
          }
          className="px-3 py-2 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)]"
        >
          <option value="">Todos los Mundos</option>
          {Object.entries(MUNDO_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>
      </div>

      {/* Grid de Cards */}
      {docentes.length === 0 ? (
        <div className="text-center py-12 text-[var(--admin-text-muted)]">
          No se encontraron docentes con los filtros aplicados
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {docentes.map((docente) => (
            <DocenteAsignacionCard
              key={docente.id}
              docente={docente}
              onAsignarCasa={(casaTipo) => handleAsignarCasa(docente.id, casaTipo)}
              onRemoverCasa={(casaTipo) => handleRemoverCasa(docente.id, casaTipo)}
              onAsignarMundo={(mundoTipo) => handleAsignarMundo(docente.id, mundoTipo)}
              onRemoverMundo={(mundoTipo) => handleRemoverMundo(docente.id, mundoTipo)}
              onSelect={() => onSelectDocente(docente)}
            />
          ))}
        </div>
      )}

      {/* Count */}
      <div className="text-sm text-[var(--admin-text-muted)]">
        Mostrando {docentes.length} docentes
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PersonasView - Vista principal
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * PersonasView - Vista de gestión unificada de personas
 *
 * Unifica estudiantes, docentes, tutores y admins desde el backend.
 * Tabla con filtros, búsqueda y acciones CRUD completas.
 *
 * Tabs:
 * - Todas las Personas: Gestión CRUD de usuarios
 * - Asignaciones Docentes: Gestión Casa/Mundo para docentes (FASE 2)
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
    editingPerson,
    setEditingPerson,
    filteredPeople,
    stats,
    totalCount,
    handleCreate,
    handleEdit,
    handleUpdate,
    handleDelete,
    handleCredenciales,
    handleRegenerarPin,
    credencialesModal,
    closeCredencialesModal,
    refetch,
  } = usePersonas();

  // Hook para asignaciones Casa/Mundo
  const docenteAsignaciones = useDocenteAsignaciones();

  const [activeTab, setActiveTab] = useState<TabId>('personas');
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

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-[var(--status-danger)] mb-4">Error al cargar personas</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-[var(--admin-surface-2)] rounded-lg hover:bg-[var(--admin-surface-1)] border border-[var(--admin-border)] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Tabs config
  const tabs = [
    { id: 'personas' as const, label: 'Todas las Personas', icon: Users },
    { id: 'asignaciones' as const, label: 'Asignaciones Docentes', icon: GraduationCap },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-[var(--admin-text)]">Gestión de Personas</h1>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[var(--admin-surface-2)] rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--admin-accent)] text-black'
                    : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-1)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: Todas las Personas */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'personas' && (
        <>
          {/* Add button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--admin-accent)] text-black font-medium hover:opacity-90 transition-opacity"
            >
              <UserPlus className="w-4 h-4" />
              Agregar Persona
            </button>
          </div>

          {/* Stats */}
          <PersonasStatsGrid
            stats={stats}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
          />

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
            onCredenciales={handleCredenciales}
          />

          {/* Results count */}
          <div className="text-sm text-[var(--admin-text-muted)]">
            Mostrando {filteredPeople.length} de {totalCount} personas
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: Asignaciones Docentes (Casa/Mundo) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'asignaciones' && (
        <AsignacionesTab
          docenteAsignaciones={docenteAsignaciones}
          onSelectDocente={(docente) => {
            // Buscar en la lista de personas por ID del docente
            // El docenteId coincide con el ID de la persona de rol DOCENTE
            const persona = filteredPeople.find((p) => p.role === 'docente' && p.id === docente.id);
            if (persona) setSelectedPerson(persona);
          }}
        />
      )}

      {/* Detail Modal */}
      <PersonDetailModal person={selectedPerson} onClose={() => setSelectedPerson(null)} />

      {/* Create Modal */}
      <PersonaFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
      />

      {/* Edit Modal */}
      <PersonaEditModal
        person={editingPerson}
        onClose={() => setEditingPerson(null)}
        onSubmit={handleUpdate}
      />

      {/* Credenciales Modal */}
      <CredencialesModal
        isOpen={credencialesModal.isOpen}
        onClose={closeCredencialesModal}
        nombre={credencialesModal.nombre}
        apellido={credencialesModal.apellido}
        username={credencialesModal.username}
        pin={credencialesModal.pin}
        isNewStudent={credencialesModal.isNewStudent}
        estudianteId={credencialesModal.estudianteId}
        onRegenerarPin={handleRegenerarPin}
      />
    </div>
  );
}

export default PersonasView;
