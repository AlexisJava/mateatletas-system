import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles, Role } from '../../auth/decorators/roles.decorator';
import { GetPlanificacionesUseCase } from '../application/use-cases/get-planificaciones.use-case';
import { GetPlanificacionesQueryDto } from '../application/dto/get-planificaciones-query.dto';
import {
  PlanificacionListResponseDto,
  PlanificacionListItemDto,
} from '../application/dto/planificacion-response.dto';

/**
 * Planificaciones Controller V2
 *
 * Refactored controller following Clean Architecture principles:
 * - No 'any' types
 * - Uses Use Cases (application layer)
 * - Proper DTOs for input/output
 * - SOLID principles
 */
@ApiTags('Planificaciones')
@Controller('planificaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PlanificacionesControllerV2 {
  constructor(
    private readonly getPlanificacionesUseCase: GetPlanificacionesUseCase,
  ) {}

  @Get()
  @Roles(Role.Admin, Role.Tutor, Role.Docente)
  @ApiOperation({
    summary: 'Obtener todas las planificaciones con filtros y paginación',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de planificaciones',
    type: PlanificacionListResponseDto,
  })
  async getPlanificaciones(
    @Query() queryDto: GetPlanificacionesQueryDto,
  ): Promise<PlanificacionListResponseDto> {
    // Build filters from query
    const filters = {
      codigoGrupo: queryDto.codigo_grupo,
      mes: queryDto.mes,
      anio: queryDto.anio,
      estado: queryDto.estado,
    };

    // Build pagination
    const pagination = {
      page: queryDto.page,
      limit: queryDto.limit,
    };

    // Execute use case
    const result = await this.getPlanificacionesUseCase.execute(
      filters,
      pagination,
    );

    // Map to response DTO
    const response: PlanificacionListResponseDto = {
      data: result.data.map((item) =>
        PlanificacionListItemDto.fromEntity(item),
      ),
      total: result.total,
      page: result.page,
      limit: result.limit,
      total_pages: result.totalPages,
    };

    return response;
  }
}
