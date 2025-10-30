/**
 * ProgresoActividadController
 * Endpoints para gestionar el progreso del estudiante en actividades semanales
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
import { ProgresoActividadService } from './progreso-actividad.service';
import type {
  IniciarActividad,
  CompletarActividad,
  GuardarProgresoActividad,
  ProgresoActualizadoResponse,
  HistorialProgresoEstudiante,
} from '@mateatletas/contracts';

@Controller('progreso-actividad')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProgresoActividadController {
  constructor(private readonly progresoService: ProgresoActividadService) {}

  /**
   * POST /progreso-actividad/iniciar
   * Marca una actividad como iniciada
   */
  @Post('iniciar')
  @Roles(Role.Estudiante)
  @HttpCode(HttpStatus.OK)
  async iniciarActividad(@Body() data: IniciarActividad) {
    return await this.progresoService.iniciarActividad(data);
  }

  /**
   * POST /progreso-actividad/guardar
   * Guarda progreso parcial de una actividad
   */
  @Post('guardar')
  @Roles(Role.Estudiante)
  @HttpCode(HttpStatus.OK)
  async guardarProgreso(@Body() data: GuardarProgresoActividad) {
    return await this.progresoService.guardarProgreso(data);
  }

  /**
   * POST /progreso-actividad/completar
   * Completa una actividad y otorga recompensas
   */
  @Post('completar')
  @Roles(Role.Estudiante)
  @HttpCode(HttpStatus.OK)
  async completarActividad(
    @Body() data: CompletarActividad,
  ): Promise<ProgresoActualizadoResponse> {
    return await this.progresoService.completarActividad(data);
  }

  /**
   * GET /progreso-actividad/historial/:estudianteId
   * Obtiene el historial completo de progreso del estudiante
   */
  @Get('historial/:estudianteId')
  @Roles(Role.Estudiante, Role.Tutor, Role.Docente, Role.Admin)
  async obtenerHistorial(
    @Param('estudianteId') estudianteId: string,
  ): Promise<HistorialProgresoEstudiante> {
    return await this.progresoService.obtenerHistorial(estudianteId);
  }

  /**
   * GET /progreso-actividad/:estudianteId/:actividadId/:asignacionId
   * Obtiene el progreso de una actividad específica
   */
  @Get(':estudianteId/:actividadId/:asignacionId')
  @Roles(Role.Estudiante, Role.Tutor, Role.Docente, Role.Admin)
  async obtenerProgreso(
    @Param('estudianteId') estudianteId: string,
    @Param('actividadId') actividadId: string,
    @Param('asignacionId') asignacionId: string,
  ) {
    return await this.progresoService.obtenerProgreso(
      estudianteId,
      actividadId,
      asignacionId,
    );
  }
}
