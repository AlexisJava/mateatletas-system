import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { TiendaService } from '../services/tienda.service';
import {
  CanjearCursoDto,
  AprobarCanjeDto,
  RechazarCanjeDto,
  ActualizarProgresoDto,
  FiltrosCatalogoDto,
} from '../dto/tienda.dto';
import { Roles, Role } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AuthUser } from '../../auth/interfaces/auth-user.interface';

/**
 * TiendaController - Sistema de Canjes de Cursos
 *
 * Endpoints para estudiantes:
 * - Catálogo de cursos disponibles
 * - Solicitar canje de curso
 * - Ver mis cursos canjeados
 * - Actualizar progreso de curso
 *
 * Endpoints para tutores/padres:
 * - Ver solicitudes pendientes de aprobación
 * - Aprobar solicitud de canje (con opción de pago)
 * - Rechazar solicitud de canje
 * - Ver historial completo de solicitudes
 *
 * @author Claude AI
 * @version 1.0.0
 */
@Controller('gamificacion/tienda')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TiendaController {
  constructor(private readonly tiendaService: TiendaService) {}

  /**
   * GET /gamificacion/tienda/catalogo
   *
   * Obtener catálogo completo de cursos con filtros opcionales
   *
   * Query Params:
   * - categoria?: string - Filtrar por categoría (ciencia, programacion, arte, etc.)
   * - destacados?: boolean - Solo cursos destacados
   * - nuevos?: boolean - Solo cursos nuevos
   * - nivelMaximo?: number - Filtrar por nivel máximo del estudiante
   *
   * @returns Lista de cursos disponibles
   */
  @Get('catalogo')
  async obtenerCatalogo(@Query() filtros: FiltrosCatalogoDto) {
    return this.tiendaService.obtenerCatalogo({
      categoria: filtros.categoria,
      destacados: filtros.destacados === 'true',
      nuevos: filtros.nuevos === 'true',
      nivelMaximo: filtros.nivelMaximo
        ? Number(filtros.nivelMaximo)
        : undefined,
    });
  }

  /**
   * GET /gamificacion/tienda/catalogo/:id
   *
   * Obtener detalles completos de un curso específico
   *
   * @param id - ID del curso
   * @returns Curso con toda su información
   */
  @Get('catalogo/:id')
  async obtenerCurso(@Param('id') id: string) {
    return this.tiendaService.obtenerCurso(id);
  }

  /**
   * POST /gamificacion/tienda/canjear
   *
   * Solicitar canje de un curso (estudiante)
   *
   * Validaciones:
   * 1. Nivel requerido alcanzado
   * 2. Monedas suficientes
   * 3. Curso no canjeado previamente
   * 4. No hay solicitud pendiente
   * 5. Estudiante tiene tutor asignado
   *
   * @param user - Usuario autenticado (estudiante)
   * @param body - { cursoId: string }
   * @returns Solicitud de canje creada (pendiente de aprobación)
   */
  @Post('canjear')
  @Roles(Role.ESTUDIANTE)
  @HttpCode(HttpStatus.CREATED)
  async solicitarCanje(
    @GetUser() user: AuthUser,
    @Body() body: CanjearCursoDto,
  ) {
    const estudianteId = user.id;
    return this.tiendaService.solicitarCanje(estudianteId, body.cursoId);
  }

  /**
   * GET /gamificacion/tienda/mis-cursos
   *
   * Obtener todos los cursos que el estudiante tiene habilitados
   *
   * @param user - Usuario autenticado (estudiante)
   * @returns Lista de cursos del estudiante con progreso
   */
  @Get('mis-cursos')
  @Roles(Role.ESTUDIANTE)
  async obtenerMisCursos(@GetUser() user: AuthUser) {
    const estudianteId = user.id;
    return this.tiendaService.obtenerCursosEstudiante(estudianteId);
  }

  /**
   * PATCH /gamificacion/tienda/mis-cursos/:cursoId/progreso
   *
   * Actualizar progreso de un curso del estudiante
   *
   * @param user - Usuario autenticado (estudiante)
   * @param cursoId - ID del curso
   * @param body - { progreso: number, completado?: boolean }
   * @returns Curso actualizado
   */
  @Patch('mis-cursos/:cursoId/progreso')
  @Roles(Role.ESTUDIANTE)
  async actualizarProgreso(
    @GetUser() user: AuthUser,
    @Param('cursoId') cursoId: string,
    @Body() body: ActualizarProgresoDto,
  ) {
    const estudianteId = user.id;
    return this.tiendaService.actualizarProgresoCurso(
      estudianteId,
      cursoId,
      body.progreso,
    );
  }

  /**
   * GET /gamificacion/tienda/solicitudes-pendientes
   *
   * Obtener solicitudes de canje pendientes de aprobación (tutor/padre)
   *
   * Solo retorna solicitudes no expiradas y en estado 'pendiente'
   *
   * @param user - Usuario autenticado (tutor)
   * @returns Lista de solicitudes pendientes de sus estudiantes
   */
  @Get('solicitudes-pendientes')
  @Roles(Role.TUTOR)
  async obtenerSolicitudesPendientes(@GetUser() user: AuthUser) {
    const tutorId = user.id;
    return this.tiendaService.obtenerSolicitudesPendientes(tutorId);
  }

  /**
   * GET /gamificacion/tienda/solicitudes/historial
   *
   * Obtener historial completo de solicitudes de canje (tutor/padre)
   *
   * Incluye: pendientes, aprobadas, rechazadas, expiradas
   *
   * @param user - Usuario autenticado (tutor)
   * @returns Últimas 50 solicitudes ordenadas por fecha
   */
  @Get('solicitudes/historial')
  @Roles(Role.TUTOR)
  async obtenerHistorialSolicitudes(@GetUser() user: AuthUser) {
    const tutorId = user.id;
    return this.tiendaService.obtenerHistorialSolicitudes(tutorId);
  }

  /**
   * POST /gamificacion/tienda/solicitudes/:id/aprobar
   *
   * Aprobar solicitud de canje (tutor/padre)
   *
   * Opciones de pago:
   * - padre_paga_todo: Padre paga 100% USD, hijo no gasta monedas
   * - hijo_paga_mitad: Hijo gasta 50% monedas, padre paga 50% USD
   * - hijo_paga_todo: Hijo gasta 100% monedas, padre no paga
   *
   * Al aprobar:
   * 1. Se gastan las monedas según la opción elegida
   * 2. Se habilita el curso para el estudiante
   * 3. Se actualiza el estado de la solicitud a 'aprobada'
   * 4. Se registra el monto que debe pagar el padre
   *
   * @param user - Usuario autenticado (tutor)
   * @param id - ID de la solicitud
   * @param body - { opcionPago, mensajePadre? }
   * @returns Solicitud aprobada con detalles
   */
  @Post('solicitudes/:id/aprobar')
  @Roles(Role.TUTOR)
  @HttpCode(HttpStatus.OK)
  async aprobarCanje(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: AprobarCanjeDto,
  ) {
    const tutorId = user.id;
    return this.tiendaService.aprobarCanje(
      id,
      tutorId,
      body.opcionPago,
      body.mensajePadre,
    );
  }

  /**
   * POST /gamificacion/tienda/solicitudes/:id/rechazar
   *
   * Rechazar solicitud de canje (tutor/padre)
   *
   * Al rechazar:
   * 1. NO se gastan monedas
   * 2. NO se habilita el curso
   * 3. Se actualiza el estado de la solicitud a 'rechazada'
   * 4. Se puede incluir un mensaje explicativo
   *
   * @param user - Usuario autenticado (tutor)
   * @param id - ID de la solicitud
   * @param body - { mensajePadre? }
   * @returns Solicitud rechazada
   */
  @Post('solicitudes/:id/rechazar')
  @Roles(Role.TUTOR)
  @HttpCode(HttpStatus.OK)
  async rechazarCanje(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: RechazarCanjeDto,
  ) {
    const tutorId = user.id;
    return this.tiendaService.rechazarCanje(id, tutorId, body.mensajePadre);
  }

  /**
   * GET /gamificacion/tienda/mis-solicitudes
   *
   * Obtener mis solicitudes de canje (estudiante)
   *
   * Incluye todas las solicitudes del estudiante con su estado actual
   *
   * @param user - Usuario autenticado (estudiante)
   * @returns Lista de solicitudes del estudiante
   */
  @Get('mis-solicitudes')
  @Roles(Role.ESTUDIANTE)
  async obtenerMisSolicitudes(@GetUser() user: AuthUser) {
    const estudianteId = user.id;
    return this.tiendaService.obtenerSolicitudesEstudiante(estudianteId);
  }
}
