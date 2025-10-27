import { EstadoPlanificacion, NivelDificultad } from '@prisma/client';
import { PlanificacionEntity } from './planificacion.entity';
import { ActividadEntity } from './actividad.entity';

/**
 * Filter options for querying planifications
 */
export interface PlanificacionFilters {
  codigoGrupo?: string;
  grupoId?: string;
  mes?: number;
  anio?: number;
  estado?: EstadoPlanificacion;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Planificacion with activity count
 * Represents the entity with aggregated data
 */
export interface PlanificacionWithCounts {
  id: string;
  codigoGrupo?: string;
  grupoId: string;
  grupo?: {
    id: string;
    codigo: string;
    nombre: string;
  };
  mes: number;
  anio: number;
  titulo: string;
  descripcion: string;
  tematicaPrincipal: string;
  objetivosAprendizaje: string[];
  estado: EstadoPlanificacion;
  createdByAdminId: string;
  notasDocentes: string | null;
  fechaPublicacion: Date | null;
  createdAt: Date;
  updatedAt: Date;
  activityCount: number;
  assignmentCount: number;
  // Methods from entity
  canBePublished(actividadesCount: number): boolean;
  isActive(): boolean;
  getPeriodIdentifier(): string;
  toPersistence(): Record<string, unknown>;
}

export interface PlanificacionDetail extends PlanificacionWithCounts {
  actividades: ActividadEntity[];
}

/**
 * Data for creating a new planification
 */
export interface CreatePlanificacionData {
  grupoId: string;
  mes: number;
  anio: number;
  titulo: string;
  descripcion: string;
  tematicaPrincipal: string;
  objetivosAprendizaje: string[];
  estado: EstadoPlanificacion;
  createdByAdminId: string;
  notasDocentes: string | null;
}

export interface UpdatePlanificacionData {
  titulo?: string;
  descripcion?: string;
  tematicaPrincipal?: string;
  objetivosAprendizaje?: string[];
  estado?: EstadoPlanificacion;
  notasDocentes?: string | null;
  fechaPublicacion?: Date | null;
}

export interface CreateActividadData {
  planificacionId: string;
  semanaNumero: number;
  titulo: string;
  descripcion: string;
  componenteNombre: string;
  componenteProps: Record<string, unknown>;
  nivelDificultad: NivelDificultad;
  tiempoEstimadoMinutos: number;
  puntosGamificacion: number;
  instruccionesDocente: string;
  instruccionesEstudiante: string;
  recursosUrl?: Record<string, unknown> | null;
  orden: number;
}

export interface UpdateActividadData {
  semanaNumero?: number;
  titulo?: string;
  descripcion?: string;
  componenteNombre?: string;
  componenteProps?: Record<string, unknown>;
  nivelDificultad?: NivelDificultad;
  tiempoEstimadoMinutos?: number;
  puntosGamificacion?: number;
  instruccionesDocente?: string;
  instruccionesEstudiante?: string;
  recursosUrl?: Record<string, unknown> | null;
  orden?: number;
}

/**
 * Repository interface for Planificacion aggregate
 *
 * This interface defines the contract for data access operations.
 * Implementations must provide concrete data access logic.
 *
 * Following Repository Pattern and Dependency Inversion Principle.
 */
export interface IPlanificacionRepository {
  /**
   * Find a planification by ID
   * @throws NotFoundException if not found
   */
  findById(id: string): Promise<PlanificacionEntity>;

  /**
   * Find a planification with activities and counts
   * @throws NotFoundException if not found
   */
  findDetailById(id: string): Promise<PlanificacionDetail>;

  /**
   * Find a planification by ID (optional)
   * @returns null if not found
   */
  findByIdOptional(id: string): Promise<PlanificacionEntity | null>;

  /**
   * Find all planifications with optional filters
   */
  findAll(
    filters?: PlanificacionFilters,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<PlanificacionWithCounts>>;

  /**
   * Find a planification by unique constraint (grupo_id, mes, anio)
   */
  findByPeriod(
    grupoId: string,
    mes: number,
    anio: number,
  ): Promise<PlanificacionEntity | null>;

  /**
   * Create a new planification
   */
  create(data: CreatePlanificacionData): Promise<PlanificacionEntity>;

  /**
   * Update a planification
   */
  update(
    id: string,
    data: UpdatePlanificacionData,
  ): Promise<PlanificacionEntity>;

  /**
   * Delete a planification
   */
  delete(id: string): Promise<void>;

  /**
   * List activities for a planification
   */
  findActividades(planificacionId: string): Promise<ActividadEntity[]>;

  /**
   * Find activity by ID
   * @throws NotFoundException if not found
   */
  findActividadById(id: string): Promise<ActividadEntity>;

  /**
   * Create an activity in a planification
   */
  createActividad(data: CreateActividadData): Promise<ActividadEntity>;

  /**
   * Update an activity
   */
  updateActividad(
    id: string,
    data: UpdateActividadData,
  ): Promise<ActividadEntity>;

  /**
   * Delete an activity
   */
  deleteActividad(id: string): Promise<void>;

  /**
   * Count total planifications matching filters
   */
  count(filters?: PlanificacionFilters): Promise<number>;

  /**
   * Get activity count for a planification
   */
  getActivityCount(planificacionId: string): Promise<number>;
}
