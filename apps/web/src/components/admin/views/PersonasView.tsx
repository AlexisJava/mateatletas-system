'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  UserCheck,
  Shield,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Award,
  Home,
  ChevronDown,
  X,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { MOCK_PEOPLE, formatDate, type MockPerson } from '@/lib/constants/admin-mock-data';
import type { UserRole } from '@/types/admin-dashboard.types';

/**
 * PersonasView - Vista de gestion de personas
 *
 * Unifica estudiantes, docentes, tutores y admins.
 * Tabla con filtros, busqueda y acciones.
 */

// =============================================================================
// ROLE CONFIG
// =============================================================================

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; icon: typeof Users; color: string; bgColor: string }
> = {
  estudiante: {
    label: 'Estudiante',
    icon: GraduationCap,
    color: 'text-[var(--status-info)]',
    bgColor: 'bg-[var(--status-info-muted)]',
  },
  docente: {
    label: 'Docente',
    icon: UserCheck,
    color: 'text-[var(--status-success)]',
    bgColor: 'bg-[var(--status-success-muted)]',
  },
  tutor: {
    label: 'Tutor',
    icon: Users,
    color: 'text-[var(--status-warning)]',
    bgColor: 'bg-[var(--status-warning-muted)]',
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    color: 'text-[var(--admin-accent)]',
    bgColor: 'bg-[var(--admin-accent-muted)]',
  },
};

// =============================================================================
// STAT CARD COMPONENT
// =============================================================================

interface StatCardProps {
  label: string;
  value: number;
  icon: typeof Users;
  color: string;
  bgColor: string;
  onClick?: () => void;
  isActive?: boolean;
}

function StatCard({ label, value, icon: Icon, color, bgColor, onClick, isActive }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border transition-all text-left w-full ${
        isActive
          ? 'bg-[var(--admin-accent-muted)] border-[var(--admin-accent)]'
          : 'bg-[var(--admin-surface-1)] border-[var(--admin-border)] hover:border-[var(--admin-border-accent)]'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-[var(--admin-text)]">{value}</p>
          <p className="text-sm text-[var(--admin-text-muted)]">{label}</p>
        </div>
      </div>
    </button>
  );
}

// =============================================================================
// PERSON ROW COMPONENT
// =============================================================================

interface PersonRowProps {
  person: MockPerson;
  onView: (person: MockPerson) => void;
  onEdit: (person: MockPerson) => void;
  onDelete: (person: MockPerson) => void;
}

function PersonRow({ person, onView, onEdit, onDelete }: PersonRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const roleConfig = ROLE_CONFIG[person.role];
  const Icon = roleConfig.icon;

  return (
    <tr className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-surface-2)] transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg ${roleConfig.bgColor} flex items-center justify-center`}
          >
            <span className="text-sm font-bold text-[var(--admin-text)]">
              {person.nombre.charAt(0)}
              {person.apellido.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-semibold text-[var(--admin-text)]">
              {person.nombre} {person.apellido}
            </p>
            <p className="text-xs text-[var(--admin-text-muted)]">{person.email}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${roleConfig.bgColor} ${roleConfig.color}`}
        >
          <Icon className="w-3 h-3" />
          {roleConfig.label}
        </span>
      </td>
      <td className="py-4 px-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            person.status === 'active'
              ? 'bg-[var(--status-success-muted)] text-[var(--status-success)]'
              : 'bg-[var(--admin-surface-2)] text-[var(--admin-text-muted)]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${person.status === 'active' ? 'bg-[var(--status-success)]' : 'bg-[var(--admin-text-disabled)]'}`}
          />
          {person.status === 'active' ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className="py-4 px-4 hidden md:table-cell">
        {person.role === 'estudiante' && person.casa && (
          <div className="flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-[var(--admin-text-muted)]" />
            <span className="text-sm text-[var(--admin-text)]">{person.casa}</span>
          </div>
        )}
        {person.role === 'docente' && person.clasesAsignadas !== undefined && (
          <span className="text-sm text-[var(--admin-text)]">{person.clasesAsignadas} clases</span>
        )}
        {person.role === 'tutor' && person.estudiantesACargo !== undefined && (
          <span className="text-sm text-[var(--admin-text)]">
            {person.estudiantesACargo} estudiantes
          </span>
        )}
      </td>
      <td className="py-4 px-4 hidden lg:table-cell">
        <span className="text-sm text-[var(--admin-text-muted)]">
          {formatDate(person.createdAt)}
        </span>
      </td>
      <td className="py-4 px-4">
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-[var(--admin-surface-1)] transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-[var(--admin-text-muted)]" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-40 py-1 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-lg shadow-xl z-50">
                <button
                  onClick={() => {
                    onView(person);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)] flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Ver detalle
                </button>
                <button
                  onClick={() => {
                    onEdit(person);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)] flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    onDelete(person);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-[var(--status-danger)] hover:bg-[var(--status-danger-muted)] flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// =============================================================================
// PERSON DETAIL MODAL
// =============================================================================

interface PersonDetailModalProps {
  person: MockPerson | null;
  onClose: () => void;
}

function PersonDetailModal({ person, onClose }: PersonDetailModalProps) {
  if (!person) return null;

  const roleConfig = ROLE_CONFIG[person.role];
  const Icon = roleConfig.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-2xl max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-[var(--admin-border)]">
          <h3 className="text-lg font-semibold text-[var(--admin-text)]">Detalle de Persona</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--admin-text-muted)]" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-xl ${roleConfig.bgColor} flex items-center justify-center`}
            >
              <span className="text-2xl font-bold text-[var(--admin-text)]">
                {person.nombre.charAt(0)}
                {person.apellido.charAt(0)}
              </span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-[var(--admin-text)]">
                {person.nombre} {person.apellido}
              </h4>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${roleConfig.bgColor} ${roleConfig.color}`}
              >
                <Icon className="w-3 h-3" />
                {roleConfig.label}
              </span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-[var(--admin-surface-2)] rounded-lg">
              <div className="flex items-center gap-2 text-[var(--admin-text-muted)] mb-1">
                <Mail className="w-4 h-4" />
                <span className="text-xs">Email</span>
              </div>
              <p className="text-sm font-medium text-[var(--admin-text)] truncate">
                {person.email}
              </p>
            </div>
            <div className="p-3 bg-[var(--admin-surface-2)] rounded-lg">
              <div className="flex items-center gap-2 text-[var(--admin-text-muted)] mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Registro</span>
              </div>
              <p className="text-sm font-medium text-[var(--admin-text)]">
                {formatDate(person.createdAt)}
              </p>
            </div>
            {person.casa && (
              <div className="p-3 bg-[var(--admin-surface-2)] rounded-lg">
                <div className="flex items-center gap-2 text-[var(--admin-text-muted)] mb-1">
                  <Home className="w-4 h-4" />
                  <span className="text-xs">Casa</span>
                </div>
                <p className="text-sm font-medium text-[var(--admin-text)]">{person.casa}</p>
              </div>
            )}
            {person.puntos !== undefined && (
              <div className="p-3 bg-[var(--admin-surface-2)] rounded-lg">
                <div className="flex items-center gap-2 text-[var(--admin-text-muted)] mb-1">
                  <Award className="w-4 h-4" />
                  <span className="text-xs">Puntos</span>
                </div>
                <p className="text-sm font-medium text-[var(--admin-text)]">
                  {person.puntos.toLocaleString()}
                </p>
              </div>
            )}
            {person.tier && (
              <div className="p-3 bg-[var(--admin-surface-2)] rounded-lg col-span-2">
                <div className="flex items-center gap-2 text-[var(--admin-text-muted)] mb-1">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-xs">Tier</span>
                </div>
                <p className="text-sm font-medium text-[var(--admin-text)]">{person.tier}</p>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-3 bg-[var(--admin-surface-2)] rounded-lg">
            <span className="text-sm text-[var(--admin-text-muted)]">Estado</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                person.status === 'active'
                  ? 'bg-[var(--status-success-muted)] text-[var(--status-success)]'
                  : 'bg-[var(--admin-surface-1)] text-[var(--admin-text-muted)]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${person.status === 'active' ? 'bg-[var(--status-success)]' : 'bg-[var(--admin-text-disabled)]'}`}
              />
              {person.status === 'active' ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-[var(--admin-border)]">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-[var(--admin-surface-2)] text-[var(--admin-text)] rounded-xl font-medium hover:bg-[var(--admin-surface-1)] border border-[var(--admin-border)] transition-colors"
          >
            Cerrar
          </button>
          <button className="flex-1 px-4 py-2.5 bg-[var(--admin-accent)] text-black rounded-xl font-medium hover:opacity-90 transition-opacity">
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PERSONAS VIEW
// =============================================================================

export function PersonasView() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
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

  const stats = useMemo(
    () => ({
      total: MOCK_PEOPLE.length,
      estudiantes: MOCK_PEOPLE.filter((p) => p.role === 'estudiante').length,
      docentes: MOCK_PEOPLE.filter((p) => p.role === 'docente').length,
      tutores: MOCK_PEOPLE.filter((p) => p.role === 'tutor').length,
      admins: MOCK_PEOPLE.filter((p) => p.role === 'admin').length,
    }),
    [],
  );

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Estudiantes"
          value={stats.estudiantes}
          icon={GraduationCap}
          color="text-[var(--status-info)]"
          bgColor="bg-[var(--status-info-muted)]"
          onClick={() => setRoleFilter(roleFilter === 'estudiante' ? 'all' : 'estudiante')}
          isActive={roleFilter === 'estudiante'}
        />
        <StatCard
          label="Docentes"
          value={stats.docentes}
          icon={UserCheck}
          color="text-[var(--status-success)]"
          bgColor="bg-[var(--status-success-muted)]"
          onClick={() => setRoleFilter(roleFilter === 'docente' ? 'all' : 'docente')}
          isActive={roleFilter === 'docente'}
        />
        <StatCard
          label="Tutores"
          value={stats.tutores}
          icon={Users}
          color="text-[var(--status-warning)]"
          bgColor="bg-[var(--status-warning-muted)]"
          onClick={() => setRoleFilter(roleFilter === 'tutor' ? 'all' : 'tutor')}
          isActive={roleFilter === 'tutor'}
        />
        <StatCard
          label="Admins"
          value={stats.admins}
          icon={Shield}
          color="text-[var(--admin-accent)]"
          bgColor="bg-[var(--admin-accent-muted)]"
          onClick={() => setRoleFilter(roleFilter === 'admin' ? 'all' : 'admin')}
          isActive={roleFilter === 'admin'}
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--admin-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] placeholder:text-[var(--admin-text-disabled)] focus:outline-none focus:border-[var(--admin-accent)]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-4 py-2.5 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)]"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--admin-accent)] text-black rounded-xl font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Agregar</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-2)]">
                <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                  Persona
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                  Rol
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                  Estado
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider hidden md:table-cell">
                  Info
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider hidden lg:table-cell">
                  Registro
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filteredPeople.map((person) => (
                <PersonRow
                  key={person.id}
                  person={person}
                  onView={setSelectedPerson}
                  onEdit={(p) => console.log('Edit', p)}
                  onDelete={(p) => console.log('Delete', p)}
                />
              ))}
            </tbody>
          </table>
        </div>
        {filteredPeople.length === 0 && (
          <div className="py-12 text-center">
            <Users className="w-12 h-12 text-[var(--admin-text-disabled)] mx-auto mb-3" />
            <p className="text-[var(--admin-text-muted)]">No se encontraron personas</p>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-[var(--admin-text-muted)]">
        Mostrando {filteredPeople.length} de {MOCK_PEOPLE.length} personas
      </div>

      {/* Detail Modal */}
      <PersonDetailModal person={selectedPerson} onClose={() => setSelectedPerson(null)} />
    </div>
  );
}

export default PersonasView;
