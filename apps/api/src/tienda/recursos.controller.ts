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
  @Roles(Role.Estudiante, Role.Tutor, Role.Docente, Role.Admin)
  async obtenerRecursos(
    @Param('estudianteId') estudianteId: string,
  ): Promise<RecursosEstudiante> {
    return await this.recursosService.obtenerOCrearRecursos(estudianteId);
  }

  /**
   * POST /recursos/actualizar-por-actividad
   * Actualiza recursos después de completar una actividad
   */
  @Post('actualizar-por-actividad')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Estudiante, Role.Docente)
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
  @Roles(Role.Estudiante, Role.Tutor, Role.Docente, Role.Admin)
  async obtenerHistorial(
    @Param('estudianteId') estudianteId: string,
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
