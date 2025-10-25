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
import { UpdatePlanificacionDto } from '../application/dto/update-planificacion.dto';
import { CreateActividadDto } from '../application/dto/create-actividad.dto';
import { UpdateActividadDto } from '../application/dto/update-actividad.dto';
import {
  PlanificacionListResponseDto,
  PlanificacionDetailResponseDto,
} from './dtos/planificacion.response.dto';
import { ActividadResponseDto } from './dtos/actividad.response.dto';

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
  async getPlanificaciones(
    @Query() query: GetPlanificacionesQueryDto,
  ): Promise<PlanificacionListResponseDto> {
    const { page, limit, codigo_grupo, ...rest } = query;
    const result = await this.getPlanificacionesUseCase.execute(
      {
        codigoGrupo: codigo_grupo,
        mes: rest.mes,
        anio: rest.anio,
        estado: rest.estado,
      },
      {
        page,
        limit,
      },
    );

    return PlanificacionListResponseDto.fromResult(result);
  }

  /**
   * GET /api/planificaciones/:id
   * Obtener detalle de una planificación
   */
  @Get(':id')
  @Roles(Role.Admin, Role.Docente, Role.Tutor)
  @ApiOperation({ summary: 'Obtener detalle de una planificación' })
  @ApiParam({ name: 'id', description: 'ID de la planificación' })
  @ApiResponse({ status: HttpStatus.OK, type: PlanificacionDetailResponseDto })
  async getPlanificacionById(
    @Param('id') id: string,
  ): Promise<PlanificacionDetailResponseDto> {
    const detail = await this.getPlanificacionByIdUseCase.execute(id);
    return PlanificacionDetailResponseDto.fromDetail(detail);
  }

  /**
   * PATCH /api/planificaciones/:id
   * Actualizar datos de una planificación
   */
  @Patch(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Actualizar una planificación' })
  @ApiParam({ name: 'id', description: 'ID de la planificación' })
  @ApiResponse({ status: HttpStatus.OK, type: PlanificacionDetailResponseDto })
  async updatePlanificacion(
    @Param('id') id: string,
    @Body() dto: UpdatePlanificacionDto,
  ): Promise<PlanificacionDetailResponseDto> {
    const detail = await this.updatePlanificacionUseCase.execute(id, dto);
    return PlanificacionDetailResponseDto.fromDetail(detail);
  }

  /**
   * DELETE /api/planificaciones/:id
   * Eliminar una planificación existente
   */
  @Delete(':id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una planificación' })
  @ApiParam({ name: 'id', description: 'ID de la planificación' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async deletePlanificacion(@Param('id') id: string): Promise<void> {
    await this.deletePlanificacionUseCase.execute(id);
  }

  /**
   * POST /api/planificaciones/:id/actividades
   * Crear una nueva actividad asociada a la planificación
   */
  @Post(':id/actividades')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Agregar actividad a la planificación' })
  @ApiParam({ name: 'id', description: 'ID de la planificación' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ActividadResponseDto })
  @HttpCode(HttpStatus.CREATED)
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
  @ApiOperation({ summary: 'Actualizar actividad de una planificación' })
  @ApiParam({ name: 'id', description: 'ID de la planificación' })
  @ApiParam({ name: 'actividadId', description: 'ID de la actividad' })
  @ApiResponse({ status: HttpStatus.OK, type: ActividadResponseDto })
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
  @ApiOperation({ summary: 'Eliminar actividad de una planificación' })
  @ApiParam({ name: 'id', description: 'ID de la planificación' })
  @ApiParam({ name: 'actividadId', description: 'ID de la actividad' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async deleteActividad(
    @Param('id') planificacionId: string,
    @Param('actividadId') actividadId: string,
  ): Promise<void> {
    await this.deleteActividadUseCase.execute(planificacionId, actividadId);
  }
}
