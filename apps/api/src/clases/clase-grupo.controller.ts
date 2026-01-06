import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { ParseIdPipe } from '../common/pipes';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { RequestWithAuthUser } from '../auth/interfaces';
import { GruposService } from './services/grupos.service';
import { ClaseGrupoLiveService } from './services/clase-grupo-live.service';
import {
  IniciarClaseResponseDto,
  FinalizarClaseResponseDto,
  ClaseEnVivoResponseDto,
} from './dto/clase-en-vivo.dto';

/**
 * Controller para ClaseGrupo - Grupos de clases con docentes
 * (NO confundir con Grupos Pedagógicos B1, B2, etc.)
 */
@ApiTags('Clase Grupos')
@Controller('clase-grupos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClaseGrupoController {
  constructor(
    private readonly gruposService: GruposService,
    private readonly claseGrupoLiveService: ClaseGrupoLiveService,
  ) {}

  /**
   * GET /api/clase-grupos/:id/detalle-completo
   * Obtener detalle completo de un grupo de clase con estadísticas de estudiantes,
   * tareas, observaciones y próxima clase
   *
   * Solo accesible para el docente titular del grupo o admins
   */
  @Get(':id/detalle-completo')
  @Roles(Role.DOCENTE, Role.ADMIN)
  @ApiOperation({
    summary: 'Obtener detalle completo de un grupo de clase',
    description:
      'Retorna información completa del grupo incluyendo: estudiantes con stats (asistencia, puntos, última clase), tareas del grupo, observaciones recientes, y próxima clase',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del grupo de clase (ClaseGrupo)',
    example: 'cmh6d8pqn0001xwd0wf5sv4d8',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle completo del grupo obtenido exitosamente',
    schema: {
      example: {
        id: 'cmh6d8pqn0001xwd0wf5sv4d8',
        nombre: 'Grupo Lunes 16:00 - Básico 1',
        codigo: 'LUN-1600-B1',
        dia_semana: 'Lunes',
        hora_inicio: '16:00',
        hora_fin: '17:30',
        cupo_maximo: 12,
        estudiantes: [
          {
            id: 'est-id',
            nombre: 'Juan',
            apellido: 'Pérez',
            avatarUrl: null,
            email: 'juan@example.com',
            casa: { nombre: 'Quantum', color: '#F472B6' },
            stats: {
              porcentajeAsistencia: 85.5,
              puntosAcumulados: 450,
              ultimaClase: '2025-10-20',
              clasesTotales: 20,
              clasesPresente: 17,
            },
          },
        ],
        tareas: [
          {
            id: 'tarea-id',
            titulo: 'Operaciones básicas',
            descripcion: 'Completar ejercicios 1-10',
            fecha_asignacion: '2025-10-15T00:00:00.000Z',
            fecha_vencimiento: '2025-10-22T00:00:00.000Z',
            completadas: 8,
            pendientes: 4,
          },
        ],
        observacionesRecientes: [
          {
            id: 'obs-id',
            estudiante: { nombre: 'Juan', apellido: 'Pérez' },
            observaciones: 'Excelente participación',
            fecha: '2025-10-20T16:00:00.000Z',
            tipo: 'positiva',
          },
        ],
        stats: {
          totalEstudiantes: 12,
          promedioAsistencia: 82.5,
          observacionesPositivas: 15,
          observacionesNeutrales: 3,
          observacionesAtencion: 2,
        },
        proximaClase: {
          fecha: '2025-10-28T16:00:00.000Z',
          minutosParaEmpezar: 1440,
          puedeTomarAsistencia: false,
        },
        docenteId: 'docente-id',
        activo: true,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Grupo de clase no encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para acceder a este grupo',
  })
  async getDetalleCompleto(
    @Param('id', ParseIdPipe) claseGrupoId: string,
    @Request() req: RequestWithAuthUser,
  ) {
    // El servicio valida que el docente sea el titular
    // Los admins también pueden acceder (validado por @Roles)
    const detalle = await this.gruposService.getDetalleCompleto(
      claseGrupoId,
      req.user.id,
    );

    if (!detalle) {
      throw new NotFoundException(
        `Grupo de clase con ID "${claseGrupoId}" no encontrado`,
      );
    }

    return detalle;
  }

  // ==================== ENDPOINTS PARA CLASE EN VIVO (LiveKit) ====================

  /**
   * PATCH /api/clase-grupos/:id/iniciar-clase
   * Iniciar una clase en vivo (cambiar estado a EnVivo)
   *
   * Solo el docente titular puede iniciar la clase
   */
  @Patch(':id/iniciar-clase')
  @Roles(Role.DOCENTE)
  @ApiOperation({
    summary: 'Iniciar clase en vivo',
    description:
      'Cambia el estado de la clase a EnVivo y registra el timestamp de inicio. Solo el docente titular puede iniciar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del grupo de clase (ClaseGrupo)',
    example: 'cmh6d8pqn0001xwd0wf5sv4d8',
  })
  @ApiResponse({
    status: 200,
    description: 'Clase iniciada exitosamente',
    type: IniciarClaseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'La clase ya está en vivo, finalizada o cancelada',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo el docente titular puede iniciar esta clase',
  })
  @ApiResponse({
    status: 404,
    description: 'Grupo de clase no encontrado',
  })
  async iniciarClase(
    @Param('id', ParseIdPipe) claseGrupoId: string,
    @Request() req: RequestWithAuthUser,
  ): Promise<IniciarClaseResponseDto> {
    return this.claseGrupoLiveService.iniciarClase(claseGrupoId, req.user.id);
  }

  /**
   * PATCH /api/clase-grupos/:id/finalizar-clase
   * Finalizar una clase en vivo (cambiar estado a Finalizada)
   *
   * Solo el docente titular puede finalizar la clase
   */
  @Patch(':id/finalizar-clase')
  @Roles(Role.DOCENTE)
  @ApiOperation({
    summary: 'Finalizar clase en vivo',
    description:
      'Cambia el estado de la clase a Finalizada y registra el timestamp de fin. Calcula la duración total.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del grupo de clase (ClaseGrupo)',
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
    description: 'Solo el docente titular puede finalizar esta clase',
  })
  @ApiResponse({
    status: 404,
    description: 'Grupo de clase no encontrado',
  })
  async finalizarClase(
    @Param('id', ParseIdPipe) claseGrupoId: string,
    @Request() req: RequestWithAuthUser,
  ): Promise<FinalizarClaseResponseDto> {
    return this.claseGrupoLiveService.finalizarClase(claseGrupoId, req.user.id);
  }

  /**
   * GET /api/clase-grupos/:id/estado-clase
   * Obtener el estado actual de una clase
   */
  @Get(':id/estado-clase')
  @Roles(Role.DOCENTE, Role.ESTUDIANTE, Role.ADMIN)
  @ApiOperation({
    summary: 'Obtener estado de la clase',
    description:
      'Retorna el estado actual de la clase (Programada, EnVivo, Finalizada, Cancelada)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del grupo de clase (ClaseGrupo)',
    example: 'cmh6d8pqn0001xwd0wf5sv4d8',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de la clase obtenido exitosamente',
    type: ClaseEnVivoResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Grupo de clase no encontrado',
  })
  async obtenerEstadoClase(
    @Param('id', ParseIdPipe) claseGrupoId: string,
  ): Promise<ClaseEnVivoResponseDto> {
    return this.claseGrupoLiveService.obtenerEstadoClase(claseGrupoId);
  }

  /**
   * PATCH /api/clase-grupos/:id/reiniciar-estado
   * Reiniciar estado de clase a Programada (solo admin)
   */
  @Patch(':id/reiniciar-estado')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Reiniciar estado de clase (Admin)',
    description:
      'Reinicia el estado de la clase a Programada. Útil para reprogramar clases finalizadas o canceladas.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del grupo de clase (ClaseGrupo)',
    example: 'cmh6d8pqn0001xwd0wf5sv4d8',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado reiniciado exitosamente',
    type: ClaseEnVivoResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Grupo de clase no encontrado',
  })
  async reiniciarEstadoClase(
    @Param('id', ParseIdPipe) claseGrupoId: string,
  ): Promise<ClaseEnVivoResponseDto> {
    return this.claseGrupoLiveService.reiniciarEstadoClase(claseGrupoId);
  }
}
