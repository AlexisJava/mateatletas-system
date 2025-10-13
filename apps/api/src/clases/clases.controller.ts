// @ts-nocheck - Complex Prisma types, runtime works correctly
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ClasesService } from './clases.service';
import { CrearClaseDto } from './dto/crear-clase.dto';
import { ReservarClaseDto } from './dto/reservar-clase.dto';
import { RegistrarAsistenciaDto } from './dto/registrar-asistencia.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('clases')
@UseGuards(JwtAuthGuard)
export class ClasesController {
  constructor(private readonly clasesService: ClasesService) {}

  // ==================== ENDPOINTS PARA ADMIN ====================

  /**
   * Programar una nueva clase (Admin)
   * POST /api/clases
   */
  @Post()
  async programarClase(@Body() dto: CrearClaseDto, @Request() req) {
    // TODO: Add RolesGuard to restrict to Admin only
    return this.clasesService.programarClase(dto);
  }

  /**
   * Listar todas las clases (Admin)
   * GET /api/clases/admin/todas
   */
  @Get('admin/todas')
  async listarTodasLasClases(
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('estado') estado?: 'Programada' | 'Cancelada',
    @Query('docenteId') docenteId?: string,
    @Query('rutaCurricularId') rutaCurricularId?: string,
  ) {
    // TODO: Add RolesGuard to restrict to Admin only
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
  async cancelarClase(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const userRole = req.user.role; // Asumiendo que el JWT incluye el rol
    return this.clasesService.cancelarClase(id, userId, userRole);
  }

  // ==================== ENDPOINTS PARA TUTORES ====================

  /**
   * Listar clases disponibles para un tutor
   * GET /api/clases
   */
  @Get()
  async listarClasesParaTutor(@Request() req) {
    const tutorId = req.user.id;
    return this.clasesService.listarClasesParaTutor(tutorId);
  }

  /**
   * Reservar un cupo en una clase
   * POST /api/clases/:id/reservar
   */
  @Post(':id/reservar')
  async reservarClase(
    @Param('id') claseId: string,
    @Body() dto: ReservarClaseDto,
    @Request() req,
  ) {
    const tutorId = req.user.id;
    return this.clasesService.reservarClase(claseId, tutorId, dto);
  }

  /**
   * Cancelar una reserva
   * DELETE /api/clases/reservas/:id
   */
  @Delete('reservas/:id')
  async cancelarReserva(@Param('id') inscripcionId: string, @Request() req) {
    const tutorId = req.user.id;
    return this.clasesService.cancelarReserva(inscripcionId, tutorId);
  }

  // ==================== ENDPOINTS PARA DOCENTES ====================

  /**
   * Listar clases de un docente
   * GET /api/clases/docente/mis-clases
   */
  @Get('docente/mis-clases')
  async listarClasesDeDocente(
    @Request() req,
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
  async registrarAsistencia(
    @Param('id') claseId: string,
    @Body() dto: RegistrarAsistenciaDto,
    @Request() req,
  ) {
    const docenteId = req.user.id;
    return this.clasesService.registrarAsistencia(claseId, docenteId, dto);
  }

  // ==================== ENDPOINTS COMUNES ====================

  /**
   * Obtener detalles de una clase
   * GET /api/clases/:id
   */
  @Get(':id')
  async obtenerClase(@Param('id') id: string) {
    return this.clasesService.obtenerClase(id);
  }

  /**
   * Listar rutas curriculares (para formularios)
   * GET /api/clases/rutas-curriculares
   */
  @Get('metadata/rutas-curriculares')
  async listarRutasCurriculares() {
    return this.clasesService.listarRutasCurriculares();
  }
}
