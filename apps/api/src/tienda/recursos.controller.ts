/**
 * RecursosController
 * Endpoints para manejar XP y Monedas
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { RecursosService } from './recursos.service';
import {
  RecursosEstudiante,
  TransaccionRecurso,
  TipoRecurso,
  ActualizarRecursosPorActividad,
  RecursosActualizadosResponse,
} from '@mateatletas/contracts';

@Controller('recursos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecursosController {
  constructor(private readonly recursosService: RecursosService) {}

  /**
   * GET /recursos/:estudianteId
   * Obtiene los recursos actuales de un estudiante
   */
  @Get(':estudianteId')
  @Roles(Role.ESTUDIANTE, Role.TUTOR, Role.DOCENTE, Role.ADMIN)
  async obtenerRecursos(
    @Param('estudianteId', ParseUUIDPipe) estudianteId: string,
  ): Promise<RecursosEstudiante> {
    return await this.recursosService.obtenerOCrearRecursos(estudianteId);
  }

  /**
   * POST /recursos/actualizar-por-actividad
   * Actualiza recursos después de completar una actividad
   */
  @Post('actualizar-por-actividad')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ESTUDIANTE, Role.DOCENTE)
  async actualizarPorActividad(
    @Body() data: ActualizarRecursosPorActividad,
  ): Promise<RecursosActualizadosResponse> {
    return await this.recursosService.actualizarRecursosPorActividad(data);
  }

  /**
   * GET /recursos/:estudianteId/historial
   * Obtiene el historial de transacciones de recursos
   */
  @Get(':estudianteId/historial')
  @Roles(Role.ESTUDIANTE, Role.TUTOR, Role.DOCENTE, Role.ADMIN)
  async obtenerHistorial(
    @Param('estudianteId', ParseUUIDPipe) estudianteId: string,
    @Query('tipo') tipo?: TipoRecurso,
    @Query('limit') limit?: number,
  ): Promise<TransaccionRecurso[]> {
    return await this.recursosService.obtenerHistorial(
      estudianteId,
      tipo,
      limit ? Number(limit) : undefined,
    );
  }
}
