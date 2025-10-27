import { Injectable, Inject } from '@nestjs/common';
import {
  IPlanificacionRepository,
  PlanificacionFilters,
  PaginationOptions,
  PaginatedResult,
  PlanificacionWithCounts,
} from '../../domain/planificacion.repository.interface';

/**
 * Use Case: Get Planifications
 *
 * Business logic for retrieving planifications with filters and pagination.
 * Follows Single Responsibility Principle and Dependency Inversion.
 */
@Injectable()
export class GetPlanificacionesUseCase {
  constructor(
    @Inject('IPlanificacionRepository')
    private readonly planificacionRepository: IPlanificacionRepository,
  ) {}

  /**
   * Execute the use case
   *
   * @param filters - Optional filters for querying planifications
   * @param pagination - Optional pagination options (defaults to page 1, limit 10)
   * @returns Paginated result with planifications and counts
   */
  async execute(
    filters: PlanificacionFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 },
  ): Promise<PaginatedResult<PlanificacionWithCounts>> {
    // Apply default pagination if not provided
    const paginationOptions: PaginationOptions = {
      page: pagination.page ?? 1,
      limit: pagination.limit ?? 10,
    };

    // Delegate to repository
    return await this.planificacionRepository.findAll(
      filters,
      paginationOptions,
    );
  }
}
