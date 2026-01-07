import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role, Roles } from '../auth/decorators/roles.decorator';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { ComisionLiveService } from './services/comision-live.service';
import {
  ClaseEnVivoResponseDto,
  IniciarClaseResponseDto,
  FinalizarClaseResponseDto,
} from '../clases/dto/clase-en-vivo.dto';

/**
 * Controller para gestionar comisiones (cursos temporales)
 * Incluye endpoints para clase en vivo vía LiveKit
 */
@ApiTags('Comisiones')
@ApiBearerAuth()
@Controller('comisiones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComisionesController {
  constructor(private readonly comisionLiveService: ComisionLiveService) {}

  // ==================== ENDPOINTS PARA CLASE EN VIVO (LiveKit) ====================

  /**
   * PATCH /api/comisiones/:id/iniciar-clase
   * Iniciar una clase en vivo de comisión (cambiar estado a EnVivo)
   *
   * Solo el docente asignado puede iniciar la clase
   */
  @Patch(':id/iniciar-clase')
  @Roles(Role.DOCENTE)
  @ApiOperation({
    summary: 'Iniciar clase en vivo de comisión',
    description:
      'Cambia el estado de la comisión a EnVivo y registra el timestamp de inicio. Solo el docente asignado puede iniciar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la comisión',
    example: 'cmh6d8pqn0001xwd0wf5sv4d8',
  })
  @ApiResponse({
    status: 200,
    description: 'Clase iniciada exitosamente',
    type: IniciarClaseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'La clase ya está en vivo o finalizada',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo el docente asignado puede iniciar la clase',
  })
  @ApiResponse({
    status: 404,
    description: 'Comisión no encontrada',
  })
  async iniciarClase(
    @Param('id', ParseIdPipe) comisionId: string,
    @Req() req: { user: { id: string } },
  ): Promise<IniciarClaseResponseDto> {
    return this.comisionLiveService.iniciarClase(comisionId, req.user.id);
  }

  /**
   * PATCH /api/comisiones/:id/finalizar-clase
   * Finalizar una clase en vivo de comisión (cambiar estado a Finalizada)
   *
   * Solo el docente asignado puede finalizar la clase
   */
  @Patch(':id/finalizar-clase')
  @Roles(Role.DOCENTE)
  @ApiOperation({
    summary: 'Finalizar clase en vivo de comisión',
    description:
      'Cambia el estado de la comisión a Finalizada y registra el timestamp de fin. Calcula la duración total.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la comisión',
    example: 'cmh6d8pqn0001xwd0wf5sv4d8',
  })
  @ApiResponse({
    status: 200,
    description: 'Clase finalizada exitosamente',
    type: FinalizarClaseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'La clase no está en vivo',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo el docente asignado puede finalizar la clase',
  })
  @ApiResponse({
    status: 404,
    description: 'Comisión no encontrada',
  })
  async finalizarClase(
    @Param('id', ParseIdPipe) comisionId: string,
    @Req() req: { user: { id: string } },
  ): Promise<FinalizarClaseResponseDto> {
    return this.comisionLiveService.finalizarClase(comisionId, req.user.id);
  }

  /**
   * GET /api/comisiones/:id/estado-clase
   * Obtener el estado actual de una comisión
   */
  @Get(':id/estado-clase')
  @Roles(Role.DOCENTE, Role.ESTUDIANTE, Role.ADMIN)
  @ApiOperation({
    summary: 'Obtener estado de la comisión',
    description:
      'Retorna el estado actual de la comisión (Programada, EnVivo, Finalizada, Cancelada)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la comisión',
    example: 'cmh6d8pqn0001xwd0wf5sv4d8',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de la comisión',
    type: ClaseEnVivoResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Comisión no encontrada',
  })
  async obtenerEstadoClase(
    @Param('id', ParseIdPipe) comisionId: string,
  ): Promise<ClaseEnVivoResponseDto> {
    return this.comisionLiveService.obtenerEstadoClase(comisionId);
  }

  /**
   * PATCH /api/comisiones/:id/reiniciar-estado
   * Reiniciar estado de comisión a Programada (docente asignado)
   */
  @Patch(':id/reiniciar-estado')
  @Roles(Role.DOCENTE)
  @ApiOperation({
    summary: 'Reiniciar estado de comisión',
    description:
      'Reinicia el estado de la comisión a Programada. Solo el docente asignado puede reiniciar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la comisión',
    example: 'cmh6d8pqn0001xwd0wf5sv4d8',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado reiniciado exitosamente',
    type: ClaseEnVivoResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Comisión no encontrada',
  })
  async reiniciarEstado(
    @Param('id', ParseIdPipe) comisionId: string,
    @Req() req: { user: { sub: string } },
  ): Promise<ClaseEnVivoResponseDto> {
    return this.comisionLiveService.reiniciarEstadoClaseDocente(
      comisionId,
      req.user.sub,
    );
  }
}
