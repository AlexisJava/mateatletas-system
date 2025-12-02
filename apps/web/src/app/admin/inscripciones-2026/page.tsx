'use client';

import { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  RefreshCw,
  Calendar,
  DollarSign,
  Users,
  ClipboardList,
  SearchX,
} from 'lucide-react';
import { EmptyState } from '@/components/admin/EmptyState';

/**
 * Inscripciones Colonia 2026 - Admin Page
 * Gestión completa de inscripciones con filtros y acciones
 */

// Types
interface Inscripcion {
  id: string;
  tutorNombre: string;
  tutorEmail: string;
  estudianteNombre: string;
  estudianteEdad: number;
  tierId: string;
  tierNombre: string;
  tierPrecio: number;
  estado: 'PENDIENTE' | 'PAGADO' | 'ACTIVO' | 'CANCELADO';
  metodoPago?: string;
  fechaInscripcion: string;
  fechaPago?: string;
}

type EstadoFilter = 'todos' | 'PENDIENTE' | 'PAGADO' | 'ACTIVO' | 'CANCELADO';
type TierFilter = 'todos' | 'explorador' | 'cientifico' | 'genio';

// Mock data - En producción esto viene del backend
const mockInscripciones: Inscripcion[] = [
  {
    id: '1',
    tutorNombre: 'María García',
    tutorEmail: 'maria@email.com',
    estudianteNombre: 'Lucas García',
    estudianteEdad: 8,
    tierId: 'explorador',
    tierNombre: 'Explorador',
    tierPrecio: 30000,
    estado: 'PAGADO',
    metodoPago: 'MercadoPago',
    fechaInscripcion: '2024-12-01',
    fechaPago: '2024-12-02',
  },
  {
    id: '2',
    tutorNombre: 'Juan Pérez',
    tutorEmail: 'juan@email.com',
    estudianteNombre: 'Sofía Pérez',
    estudianteEdad: 10,
    tierId: 'cientifico',
    tierNombre: 'Científico',
    tierPrecio: 45000,
    estado: 'PENDIENTE',
    fechaInscripcion: '2024-12-05',
  },
  {
    id: '3',
    tutorNombre: 'Ana López',
    tutorEmail: 'ana@email.com',
    estudianteNombre: 'Mateo López',
    estudianteEdad: 12,
    tierId: 'genio',
    tierNombre: 'Genio',
    tierPrecio: 75000,
    estado: 'ACTIVO',
    metodoPago: 'Transferencia',
    fechaInscripcion: '2024-11-28',
    fechaPago: '2024-11-29',
  },
];

const estadoConfig = {
  PENDIENTE: {
    label: 'Pendiente',
    color: 'bg-[var(--status-warning-muted)] text-[var(--status-warning)]',
    icon: Clock,
  },
  PAGADO: {
    label: 'Pagado',
    color: 'bg-[var(--status-info-muted)] text-[var(--status-info)]',
    icon: DollarSign,
  },
  ACTIVO: {
    label: 'Activo',
    color: 'bg-[var(--status-success-muted)] text-[var(--status-success)]',
    icon: CheckCircle,
  },
  CANCELADO: {
    label: 'Cancelado',
    color: 'bg-[var(--status-danger-muted)] text-[var(--status-danger)]',
    icon: XCircle,
  },
};

const tierConfig: Record<string, { label: string; color: string }> = {
  explorador: { label: 'Explorador', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  cientifico: {
    label: 'Científico',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  },
  genio: { label: 'Genio', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
};

export default function Inscripciones2026Page() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>('todos');
  const [tierFilter, setTierFilter] = useState<TierFilter>('todos');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInscripcion, setSelectedInscripcion] = useState<Inscripcion | null>(null);

  useEffect(() => {
    // Simular carga desde API
    const loadInscripciones = async () => {
      setLoading(true);
      try {
        // TODO: Reemplazar con llamada real al backend
        // const response = await fetch('/api/inscripciones-2026');
        // const data = await response.json();
        await new Promise((resolve) => setTimeout(resolve, 500));
        setInscripciones(mockInscripciones);
      } catch (error) {
        console.error('Error loading inscripciones:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInscripciones();
  }, []);

  // Filtrar inscripciones
  const filteredInscripciones = inscripciones.filter((i) => {
    const matchesSearch =
      searchQuery === '' ||
      i.estudianteNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.tutorNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.tutorEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEstado = estadoFilter === 'todos' || i.estado === estadoFilter;
    const matchesTier = tierFilter === 'todos' || i.tierId === tierFilter;

    return matchesSearch && matchesEstado && matchesTier;
  });

  // Estadísticas
  const stats = {
    total: inscripciones.length,
    pendientes: inscripciones.filter((i) => i.estado === 'PENDIENTE').length,
    pagados: inscripciones.filter((i) => i.estado === 'PAGADO').length,
    activos: inscripciones.filter((i) => i.estado === 'ACTIVO').length,
    ingresos: inscripciones
      .filter((i) => i.estado === 'PAGADO' || i.estado === 'ACTIVO')
      .reduce((sum, i) => sum + i.tierPrecio, 0),
  };

  const handleCambiarEstado = async (inscripcionId: string, nuevoEstado: Inscripcion['estado']) => {
    // TODO: Llamar al backend PATCH /inscripciones-2026/:id/estado
    setInscripciones((prev) =>
      prev.map((i) => (i.id === inscripcionId ? { ...i, estado: nuevoEstado } : i)),
    );
    setSelectedInscripcion(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--admin-text)]">
            Inscripciones Colonia 2026
          </h1>
          <p className="text-sm text-[var(--admin-text-muted)] mt-1">
            Gestiona las inscripciones para la colonia de verano
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="admin-btn admin-btn-ghost"
            title="Actualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="admin-btn admin-btn-secondary">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--admin-accent-muted)] flex items-center justify-center">
              <Users className="w-5 h-5 text-[var(--admin-accent)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--admin-text)]">{stats.total}</p>
              <p className="text-xs text-[var(--admin-text-muted)]">Total</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--status-warning-muted)] flex items-center justify-center">
              <Clock className="w-5 h-5 text-[var(--status-warning)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--admin-text)]">{stats.pendientes}</p>
              <p className="text-xs text-[var(--admin-text-muted)]">Pendientes</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--status-info-muted)] flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[var(--status-info)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--admin-text)]">{stats.pagados}</p>
              <p className="text-xs text-[var(--admin-text-muted)]">Pagados</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--status-success-muted)] flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[var(--status-success)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--admin-text)]">{stats.activos}</p>
              <p className="text-xs text-[var(--admin-text-muted)]">Activos</p>
            </div>
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 p-4 rounded-xl bg-gradient-to-r from-[var(--admin-accent-muted)] to-[var(--status-success-muted)] border border-[var(--admin-border-accent)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--admin-accent)] flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-black" />
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--admin-text)]">
                {formatCurrency(stats.ingresos)}
              </p>
              <p className="text-xs text-[var(--admin-text-muted)]">Ingresos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por estudiante, tutor o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-input pl-10"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`admin-btn ${showFilters ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
        >
          <Filter className="w-4 h-4" />
          Filtros
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="p-4 rounded-xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)] animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Estado Filter */}
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text)] mb-2">
                Estado
              </label>
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value as EstadoFilter)}
                className="admin-select"
              >
                <option value="todos">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="PAGADO">Pagado</option>
                <option value="ACTIVO">Activo</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>

            {/* Tier Filter */}
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text)] mb-2">
                Tier
              </label>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as TierFilter)}
                className="admin-select"
              >
                <option value="todos">Todos los tiers</option>
                <option value="explorador">Explorador ($30.000)</option>
                <option value="cientifico">Científico ($45.000)</option>
                <option value="genio">Genio ($75.000)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-[var(--admin-text-muted)]">Cargando inscripciones...</p>
            </div>
          </div>
        ) : filteredInscripciones.length === 0 ? (
          searchQuery || estadoFilter !== 'todos' || tierFilter !== 'todos' ? (
            <EmptyState
              icon={SearchX}
              title="Sin resultados"
              description="No se encontraron inscripciones con los filtros aplicados. Intenta ajustar tu búsqueda."
              action={{
                label: 'Limpiar filtros',
                onClick: () => {
                  setSearchQuery('');
                  setEstadoFilter('todos');
                  setTierFilter('todos');
                },
              }}
            />
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="No hay inscripciones"
              description="Aún no hay inscripciones registradas para la Colonia 2026."
            />
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Tutor</th>
                  <th>Tier</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInscripciones.map((inscripcion) => {
                  const estadoInfo = estadoConfig[inscripcion.estado];
                  const tierInfo = tierConfig[inscripcion.tierId] || {
                    label: inscripcion.tierNombre,
                    color: '',
                  };
                  const EstadoIcon = estadoInfo.icon;

                  return (
                    <tr key={inscripcion.id}>
                      <td>
                        <div>
                          <p className="font-medium text-[var(--admin-text)]">
                            {inscripcion.estudianteNombre}
                          </p>
                          <p className="text-xs text-[var(--admin-text-muted)]">
                            {inscripcion.estudianteEdad} años
                          </p>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium text-[var(--admin-text)]">
                            {inscripcion.tutorNombre}
                          </p>
                          <p className="text-xs text-[var(--admin-text-muted)]">
                            {inscripcion.tutorEmail}
                          </p>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${tierInfo.color}`}
                        >
                          {tierInfo.label}
                        </span>
                        <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                          {formatCurrency(inscripcion.tierPrecio)}
                        </p>
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${estadoInfo.color}`}
                        >
                          <EstadoIcon className="w-3.5 h-3.5" />
                          {estadoInfo.label}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--admin-text-muted)]">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(inscripcion.fechaInscripcion)}
                        </div>
                        {inscripcion.fechaPago && (
                          <p className="text-xs text-[var(--status-success)] mt-0.5">
                            Pagado: {formatDate(inscripcion.fechaPago)}
                          </p>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedInscripcion(inscripcion)}
                            className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)] transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {inscripcion.estado === 'PENDIENTE' && (
                            <button
                              onClick={() => handleCambiarEstado(inscripcion.id, 'PAGADO')}
                              className="p-2 rounded-lg text-[var(--status-success)] hover:bg-[var(--status-success-muted)] transition-colors"
                              title="Marcar como pagado"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {inscripcion.estado === 'PAGADO' && (
                            <button
                              onClick={() => handleCambiarEstado(inscripcion.id, 'ACTIVO')}
                              className="p-2 rounded-lg text-[var(--admin-accent)] hover:bg-[var(--admin-accent-muted)] transition-colors"
                              title="Activar inscripción"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedInscripcion && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setSelectedInscripcion(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-4">
            <div className="bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-xl overflow-hidden animate-slide-up">
              {/* Header */}
              <div className="p-5 border-b border-[var(--admin-border)]">
                <h3 className="text-lg font-semibold text-[var(--admin-text)]">
                  Detalle de Inscripción
                </h3>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[var(--admin-text-muted)] mb-1">Estudiante</p>
                    <p className="text-sm font-medium text-[var(--admin-text)]">
                      {selectedInscripcion.estudianteNombre}
                    </p>
                    <p className="text-xs text-[var(--admin-text-muted)]">
                      {selectedInscripcion.estudianteEdad} años
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--admin-text-muted)] mb-1">Tutor</p>
                    <p className="text-sm font-medium text-[var(--admin-text)]">
                      {selectedInscripcion.tutorNombre}
                    </p>
                    <p className="text-xs text-[var(--admin-text-muted)]">
                      {selectedInscripcion.tutorEmail}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--admin-text-muted)] mb-1">Tier</p>
                    <p className="text-sm font-medium text-[var(--admin-text)]">
                      {selectedInscripcion.tierNombre}
                    </p>
                    <p className="text-xs text-[var(--admin-accent)]">
                      {formatCurrency(selectedInscripcion.tierPrecio)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--admin-text-muted)] mb-1">Estado</p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${estadoConfig[selectedInscripcion.estado].color}`}
                    >
                      {estadoConfig[selectedInscripcion.estado].label}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-[var(--admin-border)] flex gap-3">
                  {selectedInscripcion.estado === 'PENDIENTE' && (
                    <>
                      <button
                        onClick={() => handleCambiarEstado(selectedInscripcion.id, 'PAGADO')}
                        className="flex-1 admin-btn admin-btn-primary"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Marcar Pagado
                      </button>
                      <button
                        onClick={() => handleCambiarEstado(selectedInscripcion.id, 'CANCELADO')}
                        className="admin-btn admin-btn-danger"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancelar
                      </button>
                    </>
                  )}
                  {selectedInscripcion.estado === 'PAGADO' && (
                    <button
                      onClick={() => handleCambiarEstado(selectedInscripcion.id, 'ACTIVO')}
                      className="flex-1 admin-btn admin-btn-primary"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Activar Inscripción
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedInscripcion(null)}
                    className="admin-btn admin-btn-secondary"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
