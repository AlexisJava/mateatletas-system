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
} from '@nestjs/common';
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
  @Roles(Role.Admin)
  async programarClase(@Body() dto: CrearClaseDto) {
    return this.clasesService.programarClase(dto);
  }

  /**
   * Listar todas las clases (Admin)
   * GET /api/clases/admin/todas
   */
  @Get('admin/todas')
  @Roles(Role.Admin)
  async listarTodasLasClases(
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('estado') estado?: 'Programada' | 'Cancelada',
    @Query('docenteId') docenteId?: string,
    @Query('rutaCurricularId') rutaCurricularId?: string,
  ) {
    return this.clasesService.listarTodasLasClases({
      fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
      estado,
      docenteId,
      rutaCurricularId,
    });
  }

  /**
   * Cancelar una clase (Admin o Docente de la clase)
   * PATCH /api/clases/:id/cancelar
   */
  @Patch(':id/cancelar')
  @Roles(Role.Admin, Role.Docente)
  async cancelarClase(
    @Param('id') id: string,
    @Req() req: RequestWithAuthUser,
  ) {
    const userId = req.user.id;
    const userRole = req.user.role || req.user.roles[0];
    return this.clasesService.cancelarClase(id, userId, userRole);
  }

  /**
   * Asignar estudiantes a una clase (Solo Admin)
   * POST /api/clases/:id/asignar-estudiantes
   */
  @Post(':id/asignar-estudiantes')
  @Roles(Role.Admin)
  async asignarEstudiantes(
    @Param('id') claseId: string,
    @Body() dto: AsignarEstudiantesDto,
  ) {
    return this.clasesService.asignarEstudiantesAClase(claseId, dto.estudianteIds);
  }

  // ==================== ENDPOINTS PARA TUTORES ====================

  /**
   * Listar clases disponibles para un tutor
   * GET /api/clases
   */
  @Get()
  @Roles(Role.Tutor)
  async listarClasesParaTutor(@Req() req: RequestWithAuthUser) {
    const tutorId = req.user.id;
    return this.clasesService.listarClasesParaTutor(tutorId);
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
  @Roles(Role.Tutor)
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
  @Roles(Role.Tutor)
  async reservarClase(
    @Param('id') claseId: string,
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
  @Roles(Role.Tutor)
  async cancelarReserva(
    @Param('id') inscripcionId: string,
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
  @Roles(Role.Docente)
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
  @Roles(Role.Docente)
  async registrarAsistencia(
    @Param('id') claseId: string,
    @Body() dto: RegistrarAsistenciaDto,
    @Req() req: RequestWithAuthUser,
  ) {
    const docenteId = req.user.id;
    return this.clasesService.registrarAsistencia(claseId, docenteId, dto);
  }

  // ==================== ENDPOINTS COMUNES ====================

  /**
   * Obtener estudiantes inscritos en una clase (Admin)
   * GET /api/clases/:id/estudiantes
   * IMPORTANTE: Debe estar ANTES de GET /api/clases/:id
   */
  @Get(':id/estudiantes')
  @Roles(Role.Admin)
  async obtenerEstudiantes(@Param('id') claseId: string) {
    return this.clasesService.obtenerEstudiantesDeClase(claseId);
  }

  /**
   * Obtener detalles de una clase
   * GET /api/clases/:id
   */
  @Get(':id')
  @Roles(Role.Admin, Role.Docente, Role.Tutor)
  async obtenerClase(@Param('id') id: string) {
    return this.clasesService.obtenerClase(id);
  }

  /**
   * Listar rutas curriculares (para formularios)
   * GET /api/clases/rutas-curriculares
   */
  @Get('metadata/rutas-curriculares')
  @Roles(Role.Admin, Role.Docente, Role.Tutor)
  async listarRutasCurriculares() {
    return this.clasesService.listarRutasCurriculares();
  }
}
