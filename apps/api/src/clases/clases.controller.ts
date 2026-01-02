import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ParseIdPipe } from '../common/pipes';
import { ClasesService } from './clases.service';
import { CrearClaseDto } from './dto/crear-clase.dto';
import { ReservarClaseDto } from './dto/reservar-clase.dto';
import { RegistrarAsistenciaDto } from './dto/registrar-asistencia.dto';
import { AsignarEstudiantesDto } from './dto/asignar-estudiantes.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role, Roles } from '../auth/decorators/roles.decorator';
import { RequestWithAuthUser } from '../auth/interfaces';

@Controller('clases')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClasesController {
  constructor(private readonly clasesService: ClasesService) {}

  // ==================== ENDPOINTS PARA ADMIN ====================

  /**
   * Programar una nueva clase (Solo Admin)
   * POST /api/clases
   */
  @Post()
  @Roles(Role.ADMIN)
  async programarClase(@Body() dto: CrearClaseDto) {
    return this.clasesService.programarClase(dto);
  }

  /**
   * Listar todas las clases (Admin)
   * GET /api/clases/admin/todas
   */
  @Get('admin/todas')
  @Roles(Role.ADMIN)
  async listarTodasLasClases(
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('estado') estado?: 'Programada' | 'Cancelada',
    @Query('docenteId') docenteId?: string,
  ) {
    return this.clasesService.listarTodasLasClases({
      fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
      estado,
      docenteId,
    });
  }

  /**
   * Cancelar una clase (Admin o Docente de la clase)
   * PATCH /api/clases/:id/cancelar
   */
  @Patch(':id/cancelar')
  @Roles(Role.ADMIN, Role.DOCENTE)
  async cancelarClase(
    @Param('id', ParseIdPipe) id: string,
    @Req() req: RequestWithAuthUser,
  ) {
    // 📌 Decisión 2025-01: mantenemos PATCH /clases/:id/cancelar como endpoint oficial
    // para que admin y docentes puedan cancelar sin eliminar el registro.
    const userId = req.user.id;
    const userRole =
      req.user.role ||
      (req.user.roles.length > 0 ? req.user.roles[0] : undefined);
    if (!userRole) {
      throw new ForbiddenException('Usuario sin rol asignado');
    }
    return this.clasesService.cancelarClase(id, userId, userRole);
  }

  /**
   * Eliminar una clase permanentemente (Solo Admin)
   * DELETE /api/clases/:id
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  async eliminarClase(@Param('id', ParseIdPipe) id: string) {
    return this.clasesService.eliminarClase(id);
  }

  /**
   * Asignar estudiantes a una clase (Solo Admin)
   * POST /api/clases/:id/asignar-estudiantes
   */
  @Post(':id/asignar-estudiantes')
  @Roles(Role.ADMIN)
  async asignarEstudiantes(
    @Param('id', ParseIdPipe) claseId: string,
    @Body() dto: AsignarEstudiantesDto,
  ) {
    return this.clasesService.asignarEstudiantesAClase(
      claseId,
      dto.estudianteIds,
    );
  }

  // ==================== ENDPOINTS PARA TUTORES ====================

  /**
   * Listar clases disponibles para un tutor
   * GET /api/clases
   */
  @Get()
  @Roles(Role.TUTOR)
  async listarClasesParaTutor(@Req() req: RequestWithAuthUser) {
    const tutorId = req.user.id;
    return this.clasesService.listarClasesParaTutor(tutorId);
  }

  /**
   * Listar reservas del tutor autenticado
   * GET /api/clases/mis-reservas
   */
  @Get('mis-reservas')
  @Roles(Role.TUTOR)
  async listarReservasDelTutor(@Req() req: RequestWithAuthUser) {
    const tutorId = req.user.id;
    return this.clasesService.listarReservasDeTutor(tutorId);
  }

  /**
   * GET /api/clases/calendario - Obtener calendario de clases del tutor
   * Para el portal de tutores - pestaña "Calendario"
   * Muestra las clases de los estudiantes del tutor filtradas por mes/año
   * @param req - Request con usuario autenticado
   * @param mes - Mes (1-12, opcional)
   * @param anio - Año (opcional)
   * @returns Clases del tutor organizadas por fecha
   */
  @Get('calendario')
  @Roles(Role.TUTOR)
  async obtenerCalendarioTutor(
    @Req() req: RequestWithAuthUser,
    @Query('mes') mes?: string,
    @Query('anio') anio?: string,
  ) {
    const tutorId = req.user.id;
    const mesNum = mes ? parseInt(mes, 10) : undefined;
    const anioNum = anio ? parseInt(anio, 10) : undefined;
    return this.clasesService.obtenerCalendarioTutor(tutorId, mesNum, anioNum);
  }

  /**
   * Reservar un cupo en una clase
   * POST /api/clases/:id/reservar
   */
  @Post(':id/reservar')
  @Roles(Role.TUTOR)
  async reservarClase(
    @Param('id', ParseIdPipe) claseId: string,
    @Body() dto: ReservarClaseDto,
    @Req() req: RequestWithAuthUser,
  ) {
    const tutorId = req.user.id;
    return this.clasesService.reservarClase(claseId, tutorId, dto);
  }

  /**
   * Cancelar una reserva
   * DELETE /api/clases/reservas/:id
   */
  @Delete('reservas/:id')
  @Roles(Role.TUTOR)
  async cancelarReserva(
    @Param('id', ParseIdPipe) inscripcionId: string,
    @Req() req: RequestWithAuthUser,
  ) {
    const tutorId = req.user.id;
    return this.clasesService.cancelarReserva(inscripcionId, tutorId);
  }

  // ==================== ENDPOINTS PARA DOCENTES ====================

  /**
   * Listar clases de un docente
   * GET /api/clases/docente/mis-clases
   */
  @Get('docente/mis-clases')
  @Roles(Role.DOCENTE)
  async listarClasesDeDocente(
    @Req() req: RequestWithAuthUser,
    @Query('incluirPasadas') incluirPasadas?: string,
  ) {
    const docenteId = req.user.id;
    return this.clasesService.listarClasesDeDocente(
      docenteId,
      incluirPasadas === 'true',
    );
  }

  /**
   * Registrar asistencia de una clase
   * POST /api/clases/:id/asistencia
   */
  @Post(':id/asistencia')
  @Roles(Role.DOCENTE)
  async registrarAsistencia(
    @Param('id', ParseIdPipe) claseId: string,
    @Body() dto: RegistrarAsistenciaDto,
    @Req() req: RequestWithAuthUser,
  ) {
    const docenteId = req.user.id;
    return this.clasesService.registrarAsistencia(claseId, docenteId, dto);
  }

  // ==================== ENDPOINTS COMUNES ====================

  /**
   * Obtener estudiantes inscritos en una clase
   * GET /api/clases/:id/estudiantes
   * IMPORTANTE: Debe estar ANTES de GET /api/clases/:id
   * Acceso: Admin y Docente (titular de la clase)
   */
  @Get(':id/estudiantes')
  @Roles(Role.ADMIN, Role.DOCENTE)
  async obtenerEstudiantes(@Param('id', ParseIdPipe) claseId: string) {
    return this.clasesService.obtenerEstudiantesDeClase(claseId);
  }

  /**
   * Obtener detalles de una clase
   * GET /api/clases/:id
   */
  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCENTE, Role.TUTOR)
  async obtenerClase(@Param('id', ParseIdPipe) id: string) {
    return this.clasesService.obtenerClase(id);
  }
}
