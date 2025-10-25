import { EstadoPlanificacion } from '@prisma/client';
import { PlanificacionEntity } from './planificacion.entity';

/**
 * Filter options for querying planifications
 */
export interface PlanificacionFilters {
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
  findByPeriod(grupoId: string, mes: number, anio: number): Promise<PlanificacionEntity | null>;

  /**
   * Create a new planification
   */
  create(data: CreatePlanificacionData): Promise<PlanificacionEntity>;

  /**
   * Update a planification
   */
  update(id: string, data: Partial<PlanificacionEntity>): Promise<PlanificacionEntity>;

  /**
   * Delete a planification
   */
  delete(id: string): Promise<void>;

  /**
   * Count total planifications matching filters
   */
  count(filters?: PlanificacionFilters): Promise<number>;

  /**
   * Get activity count for a planification
   */
  getActivityCount(planificacionId: string): Promise<number>;
}
