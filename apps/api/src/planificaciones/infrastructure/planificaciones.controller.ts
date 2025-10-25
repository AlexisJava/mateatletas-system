import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles, Role } from '../../auth/decorators/roles.decorator';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { CreatePlanificacionUseCase } from '../application/use-cases/create-planificacion.use-case';
import { GetPlanificacionesUseCase } from '../application/use-cases/get-planificaciones.use-case';
import { GetPlanificacionByIdUseCase } from '../application/use-cases/get-planificacion-by-id.use-case';
import { UpdatePlanificacionUseCase } from '../application/use-cases/update-planificacion.use-case';
import { DeletePlanificacionUseCase } from '../application/use-cases/delete-planificacion.use-case';
import { AddActividadToPlanificacionUseCase } from '../application/use-cases/add-actividad-to-planificacion.use-case';
import { UpdateActividadUseCase } from '../application/use-cases/update-actividad.use-case';
import { DeleteActividadUseCase } from '../application/use-cases/delete-actividad.use-case';
import { CreatePlanificacionDto } from '../application/dto/create-planificacion.dto';
import { GetPlanificacionesQueryDto } from '../application/dto/get-planificaciones-query.dto';
import { planificacionListResponseSchema } from '@mateatletas/contracts';

/**
 * Controller para Planificaciones (Clean Architecture)
 *
 * Endpoints:
 * - POST   /planificaciones       - Crear planificación (Admin)
 * - GET    /planificaciones       - Listar planificaciones con filtros
 * - GET    /planificaciones/:id   - Obtener detalle de planificación
 * - PATCH  /planificaciones/:id   - Actualizar planificación
 * - DELETE /planificaciones/:id   - Eliminar planificación
 * - POST   /planificaciones/:id/actividades - Crear actividad
 * - PATCH  /planificaciones/:id/actividades/:actividadId - Actualizar actividad
 * - DELETE /planificaciones/:id/actividades/:actividadId - Eliminar actividad
 */
@ApiTags('Planificaciones')
@Controller('planificaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PlanificacionesController {
  constructor(
    private readonly createPlanificacionUseCase: CreatePlanificacionUseCase,
    private readonly getPlanificacionesUseCase: GetPlanificacionesUseCase,
    private readonly getPlanificacionByIdUseCase: GetPlanificacionByIdUseCase,
    private readonly updatePlanificacionUseCase: UpdatePlanificacionUseCase,
    private readonly deletePlanificacionUseCase: DeletePlanificacionUseCase,
    private readonly addActividadToPlanificacionUseCase: AddActividadToPlanificacionUseCase,
    private readonly updateActividadUseCase: UpdateActividadUseCase,
    private readonly deleteActividadUseCase: DeleteActividadUseCase,
  ) {}

  /**
   * POST /api/planificaciones
   * Crear una nueva planificación mensual (Admin)
   */
  @Post()
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nueva planificación mensual (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Planificación creada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe una planificación para este grupo/mes/año',
  })
  async createPlanificacion(
    @Body() dto: CreatePlanificacionDto,
    @GetUser('id') userId: string,
  ): Promise<PlanificacionDetailResponseDto> {
    const created = await this.createPlanificacionUseCase.execute(dto, userId);
    const detail = await this.getPlanificacionByIdUseCase.execute(created.id as string);
    return PlanificacionDetailResponseDto.fromDetail(detail);
  }

  /**
   * GET /api/planificaciones
   * Listar planificaciones con filtros y paginación
   */
  @Get()
  @Roles(Role.Admin, Role.Docente, Role.Tutor)
  @ApiOperation({ summary: 'Listar planificaciones con filtros' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de planificaciones con paginación',
  })
  async getPlanificaciones(@Query() query: GetPlanificacionesQueryDto) {
    const result = await this.getPlanificacionesUseCase.execute(
      {
        grupoId: undefined,
        mes: query.mes,
        anio: query.anio,
        estado: query.estado,
      },
      {
        page: query.page,
        limit: query.limit,
      },
    );

    const filteredData = query.codigo_grupo
      ? result.data.filter((item) => item.grupo?.codigo === query.codigo_grupo)
      : result.data;

    const response = {
      data: filteredData.map((item) => ({
        id: item.id,
        grupo_id: item.grupoId,
        codigo_grupo: item.grupo?.codigo,
        grupo: item.grupo,
        mes: item.mes,
        anio: item.anio,
        titulo: item.titulo,
        descripcion: item.descripcion,
        tematica_principal: item.tematicaPrincipal,
        objetivos_aprendizaje: item.objetivosAprendizaje,
        estado: item.estado,
        created_by_admin_id: item.createdByAdminId,
        notas_docentes: item.notasDocentes,
        fecha_publicacion: item.fechaPublicacion,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
        total_actividades: item.activityCount,
        total_asignaciones: item.assignmentCount,
      })),
      total: query.codigo_grupo ? filteredData.length : result.total,
      page: result.page,
      limit: result.limit,
      total_pages: query.codigo_grupo
        ? Math.max(1, Math.ceil(filteredData.length / (result.limit || 1)))
        : result.totalPages,
    };

    return planificacionListResponseSchema.parse(response);
  }
}
