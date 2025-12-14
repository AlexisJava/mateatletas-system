import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { RequestWithAuthUser } from '../auth/interfaces';
import { GruposService } from './services/grupos.service';

/**
 * Controller para ClaseGrupo - Grupos de clases con docentes
 * (NO confundir con Grupos Pedagógicos B1, B2, etc.)
 */
@ApiTags('Clase Grupos')
@Controller('clase-grupos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClaseGrupoController {
  constructor(private readonly gruposService: GruposService) {}

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
        rutaCurricular: {
          id: 'ruta-id',
          nombre: 'Básico 1',
          codigo: 'B1',
          color: '#4CAF50',
          descripcion: 'Ruta curricular Básico 1',
        },
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
    @Param('id', ParseUUIDPipe) claseGrupoId: string,
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
}
