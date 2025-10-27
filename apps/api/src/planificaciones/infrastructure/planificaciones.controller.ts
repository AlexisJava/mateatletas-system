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
import { UpdatePlanificacionDto } from '../application/dto/update-planificacion.dto';
import { CreateActividadDto } from '../application/dto/create-actividad.dto';
import { UpdateActividadDto } from '../application/dto/update-actividad.dto';
import { GetPlanificacionesQueryDto } from '../application/dto/get-planificaciones-query.dto';
import { PlanificacionDetailResponseDto } from './dtos/planificacion.response.dto';
import { ActividadResponseDto } from './dtos/actividad.response.dto';
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
    const detail = await this.getPlanificacionByIdUseCase.execute(created.id);
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

  /**
   * GET /api/planificaciones/:id
   * Obtener detalle de una planificación específica
   */
  @Get(':id')
  @Roles(Role.Admin, Role.Docente)
  @ApiOperation({ summary: 'Obtener detalle de planificación' })
  @ApiParam({ name: 'id', description: 'ID de la planificación' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detalle de la planificación con actividades',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Planificación no encontrada',
  })
  async getPlanificacionById(
    @Param('id') id: string,
  ): Promise<PlanificacionDetailResponseDto> {
    const detail = await this.getPlanificacionByIdUseCase.execute(id);
    return PlanificacionDetailResponseDto.fromDetail(detail);
  }

  /**
   * PATCH /api/planificaciones/:id
   * Actualizar una planificación existente
   */
  @Patch(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Actualizar planificación (Admin only)' })
  @ApiParam({ name: 'id', description: 'ID de la planificación' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Planificación actualizada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Planificación no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  async updatePlanificacion(
    @Param('id') id: string,
    @Body() dto: UpdatePlanificacionDto,
  ): Promise<PlanificacionDetailResponseDto> {
    await this.updatePlanificacionUseCase.execute(id, dto);
    const updated = await this.getPlanificacionByIdUseCase.execute(id);
    return PlanificacionDetailResponseDto.fromDetail(updated);
  }

  /**
   * DELETE /api/planificaciones/:id
   * Eliminar una planificación permanentemente
   */
  @Delete(':id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar planificación (Admin only)' })
  @ApiParam({ name: 'id', description: 'ID de la planificación' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Planificación eliminada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Planificación no encontrada',
  })
  async deletePlanificacion(@Param('id') id: string): Promise<void> {
    await this.deletePlanificacionUseCase.execute(id);
  }

  /**
   * POST /api/planificaciones/:id/actividades
   * Agregar una nueva actividad a una planificación
   */
  @Post(':id/actividades')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agregar actividad a planificación (Admin only)' })
  @ApiParam({ name: 'id', description: 'ID de la planificación' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Actividad creada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Planificación no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  async addActividad(
    @Param('id') planificacionId: string,
    @Body() dto: CreateActividadDto,
  ): Promise<ActividadResponseDto> {
    const actividad = await this.addActividadToPlanificacionUseCase.execute(
      planificacionId,
      dto,
    );
    return ActividadResponseDto.fromEntity(actividad);
  }

  /**
   * PATCH /api/planificaciones/:id/actividades/:actividadId
   * Actualizar una actividad existente
   */
  @Patch(':id/actividades/:actividadId')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Actualizar actividad (Admin only)' })
  @ApiParam({ name: 'id', description: 'ID de la planificación' })
  @ApiParam({ name: 'actividadId', description: 'ID de la actividad' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Actividad actualizada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Planificación o actividad no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  async updateActividad(
    @Param('id') planificacionId: string,
    @Param('actividadId') actividadId: string,
    @Body() dto: UpdateActividadDto,
  ): Promise<ActividadResponseDto> {
    const actividad = await this.updateActividadUseCase.execute(
      planificacionId,
      actividadId,
      dto,
    );
    return ActividadResponseDto.fromEntity(actividad);
  }

  /**
   * DELETE /api/planificaciones/:id/actividades/:actividadId
   * Eliminar una actividad
   */
  @Delete(':id/actividades/:actividadId')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar actividad (Admin only)' })
  @ApiParam({ name: 'id', description: 'ID de la planificación' })
  @ApiParam({ name: 'actividadId', description: 'ID de la actividad' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Actividad eliminada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Planificación o actividad no encontrada',
  })
  async deleteActividad(
    @Param('id') planificacionId: string,
    @Param('actividadId') actividadId: string,
  ): Promise<void> {
    await this.deleteActividadUseCase.execute(planificacionId, actividadId);
  }
}
