import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ParseIdPipe } from '../common/pipes';
import { ObservacionesService } from './observaciones.service';
import { CreateObservacionDto } from './dto/create-observacion.dto';
import { CreateSeguimientoDto } from './dto/create-seguimiento.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { FiltrarObservacionesDto } from './dto/filtrar-observaciones.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role, Roles } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/interfaces';

/**
 * Controller para el sistema de observaciones docente
 *
 * Reglas de acceso:
 * - DOCENTE: CRUD de sus propias observaciones
 * - ADMIN/PEDAGOGIA: Lectura de todas + seguimientos
 *
 * Endpoints:
 * - POST   /observaciones                      - Crear observación
 * - GET    /observaciones                      - Listar con filtros
 * - GET    /observaciones/pendientes           - Observaciones pendientes de seguimiento
 * - GET    /observaciones/estudiante/:id       - Historial de un estudiante
 * - GET    /observaciones/:id                  - Obtener por ID
 * - POST   /observaciones/:id/seguimientos     - Agregar seguimiento
 * - PATCH  /observaciones/:id/estado           - Cambiar estado
 */
@Controller('observaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ObservacionesController {
  constructor(private readonly observacionesService: ObservacionesService) {}

  /**
   * POST /observaciones - Crear nueva observación
   * Solo DOCENTE puede crear observaciones
   *
   * @param dto - Datos de la observación
   * @param user - Usuario autenticado (docente)
   * @returns Observación creada con estudiantes relacionados
   */
  @Post()
  @Roles(Role.DOCENTE)
  async crear(@Body() dto: CreateObservacionDto, @GetUser() user: AuthUser) {
    return this.observacionesService.crear(dto, user.id);
  }

  /**
   * GET /observaciones - Listar observaciones con filtros
   * DOCENTE: Solo sus observaciones
   * ADMIN/PEDAGOGIA: Todas las observaciones
   *
   * @param filtros - Filtros opcionales (tipo, prioridad, estado, fechas, etc.)
   * @param user - Usuario autenticado
   * @returns Lista paginada de observaciones
   */
  @Get()
  @Roles(Role.DOCENTE, Role.ADMIN)
  async listar(
    @Query() filtros: FiltrarObservacionesDto,
    @GetUser() user: AuthUser,
  ) {
    return this.observacionesService.listar(filtros, user);
  }

  /**
   * GET /observaciones/pendientes - Obtener observaciones pendientes de seguimiento
   * Filtra observaciones con requiereSeguimiento = true y estado != Cerrada
   *
   * DEBE ir ANTES de GET /observaciones/:id para evitar conflictos de rutas
   *
   * @param user - Usuario autenticado
   * @returns Lista de observaciones pendientes
   */
  @Get('pendientes')
  @Roles(Role.DOCENTE, Role.ADMIN)
  async obtenerPendientes(@GetUser() user: AuthUser) {
    return this.observacionesService.obtenerPendientes(user);
  }

  /**
   * GET /observaciones/estudiante/:estudianteId - Historial de observaciones de un estudiante
   *
   * DEBE ir ANTES de GET /observaciones/:id para evitar conflictos de rutas
   *
   * @param estudianteId - ID del estudiante
   * @param user - Usuario autenticado
   * @returns Historial de observaciones del estudiante
   */
  @Get('estudiante/:estudianteId')
  @Roles(Role.DOCENTE, Role.ADMIN)
  async obtenerPorEstudiante(
    @Param('estudianteId', ParseIdPipe) estudianteId: string,
    @GetUser() user: AuthUser,
  ) {
    return this.observacionesService.obtenerPorEstudiante(estudianteId, user);
  }

  /**
   * GET /observaciones/:id - Obtener observación por ID
   *
   * @param id - ID de la observación
   * @param user - Usuario autenticado
   * @returns Observación con estudiantes y seguimientos
   */
  @Get(':id')
  @Roles(Role.DOCENTE, Role.ADMIN)
  async obtenerPorId(
    @Param('id', ParseIdPipe) id: string,
    @GetUser() user: AuthUser,
  ) {
    return this.observacionesService.obtenerPorId(id, user);
  }

  /**
   * POST /observaciones/:id/seguimientos - Agregar seguimiento a observación
   * Solo autor, ADMIN o PEDAGOGIA pueden agregar seguimientos
   *
   * @param id - ID de la observación
   * @param dto - Contenido del seguimiento
   * @param user - Usuario autenticado
   * @returns Observación actualizada con nuevo seguimiento
   */
  @Post(':id/seguimientos')
  @Roles(Role.DOCENTE, Role.ADMIN)
  async agregarSeguimiento(
    @Param('id', ParseIdPipe) id: string,
    @Body() dto: CreateSeguimientoDto,
    @GetUser() user: AuthUser,
  ) {
    return this.observacionesService.agregarSeguimiento(id, dto, user);
  }

  /**
   * PATCH /observaciones/:id/estado - Cambiar estado de observación
   * Solo autor, ADMIN o PEDAGOGIA pueden cambiar estado
   *
   * Transiciones válidas:
   * - Abierta → EnSeguimiento, Resuelta
   * - EnSeguimiento → Resuelta, Abierta
   * - Resuelta → Cerrada, EnSeguimiento
   * - Cerrada → (terminal, no se puede cambiar)
   *
   * @param id - ID de la observación
   * @param dto - Nuevo estado
   * @param user - Usuario autenticado
   * @returns Observación con estado actualizado
   */
  @Patch(':id/estado')
  @Roles(Role.DOCENTE, Role.ADMIN)
  async cambiarEstado(
    @Param('id', ParseIdPipe) id: string,
    @Body() dto: UpdateEstadoDto,
    @GetUser() user: AuthUser,
  ) {
    return this.observacionesService.cambiarEstado(id, dto.estado, user);
  }
}
